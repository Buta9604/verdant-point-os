# Deployment Guide - Verdant Point Backend

## Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### 1. Local Development Deployment

```bash
# Clone repository
git clone <repository-url>
cd verdant-point-os/backend

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npm run prisma:seed
```

The API will be available at: `http://localhost:3000/api/v1`

### 2. Production Deployment

#### A. Using Docker Compose (Simple)

```bash
# Set environment to production
export NODE_ENV=production

# Generate strong secrets
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 24)
export REDIS_PASSWORD=$(openssl rand -base64 24)

# Set your frontend URL
export CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

#### B. AWS Deployment (Recommended for Production)

**Architecture:**
- **Database**: AWS RDS PostgreSQL
- **Cache**: AWS ElastiCache Redis
- **Application**: AWS ECS (Fargate) or EC2
- **Load Balancer**: Application Load Balancer (ALB)
- **Storage**: AWS S3 for uploads
- **Secrets**: AWS Secrets Manager

**Steps:**

1. **Create RDS PostgreSQL Instance**
```bash
aws rds create-db-instance \
  --db-instance-identifier verdant-postgres \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username verdant \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name my-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --multi-az
```

2. **Create ElastiCache Redis Cluster**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id verdant-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 6.2 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxx \
  --cache-subnet-group-name my-subnet-group
```

3. **Build and Push Docker Image**
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t verdant-backend .

# Tag image
docker tag verdant-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/verdant-backend:latest

# Push image
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/verdant-backend:latest
```

4. **Create ECS Task Definition**
```json
{
  "family": "verdant-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/verdant-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/verdant-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:3000/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

5. **Create ECS Service with ALB**
```bash
aws ecs create-service \
  --cluster verdant-cluster \
  --service-name verdant-backend \
  --task-definition verdant-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=3000"
```

#### C. Google Cloud Platform (GCP)

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/verdant-backend

# Deploy to Cloud Run
gcloud run deploy verdant-backend \
  --image gcr.io/PROJECT_ID/verdant-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest
```

#### D. Azure

```bash
# Create container registry
az acr create --resource-group verdant-rg --name verdantregistry --sku Basic

# Build and push image
az acr build --registry verdantregistry --image verdant-backend:latest .

# Deploy to Azure Container Instances
az container create \
  --resource-group verdant-rg \
  --name verdant-backend \
  --image verdantregistry.azurecr.io/verdant-backend:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables DATABASE_URL=<url> JWT_SECRET=<secret>
```

## Environment Variables for Production

```env
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database (RDS)
DATABASE_URL=postgresql://verdant:PASSWORD@verdant-postgres.xxxxx.us-east-1.rds.amazonaws.com:5432/verdant_point

# Redis (ElastiCache)
REDIS_HOST=verdant-redis.xxxxx.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# JWT (use strong random values)
JWT_SECRET=<64-character-random-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<64-character-random-string>
JWT_REFRESH_EXPIRES_IN=7d

# PIN Authentication
PIN_SECRET=<32-character-random-string>

# Encryption
ENCRYPTION_KEY=<32-character-random-string>

# CORS
CORS_ORIGIN=https://app.verdantpoint.com,https://kiosk.verdantpoint.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/verdant

# METRC Integration
METRC_API_URL=https://api-ca.metrc.com
METRC_API_KEY=<your-api-key>
METRC_FACILITY_LICENSE=<your-license>
```

## Database Migrations

### In Production

```bash
# Run migrations
npx prisma migrate deploy

# DO NOT use prisma migrate dev in production!
# It will reset the database
```

### Rollback Strategy

```bash
# Backup database before migrations
pg_dump -h <host> -U verdant verdant_point > backup_$(date +%Y%m%d_%H%M%S).sql

# If migration fails, restore from backup
psql -h <host> -U verdant verdant_point < backup_20240126_120000.sql
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name api.verdantpoint.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.verdantpoint.com;

    ssl_certificate /etc/letsencrypt/live/api.verdantpoint.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.verdantpoint.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring & Logging

### CloudWatch (AWS)

```javascript
// Add to main.ts
import * as winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const cloudwatchConfig = {
  logGroupName: '/aws/ecs/verdant-backend',
  logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
  awsRegion: 'us-east-1',
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch(cloudwatchConfig),
  ],
});
```

### Health Checks

```bash
# Basic health check
curl https://api.verdantpoint.com/api/v1/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-26T12:00:00.000Z",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

## Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_HOST="verdant-postgres.xxxxx.rds.amazonaws.com"
DB_NAME="verdant_point"
DB_USER="verdant"

# Backup database
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://verdant-backups/database/

# Delete local backups older than 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

# Delete S3 backups older than 30 days
aws s3 ls s3://verdant-backups/database/ | while read -r line; do
  createDate=$(echo $line | awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk {'print $4'})
    aws s3 rm s3://verdant-backups/database/$fileName
  fi
done
```

### Cron job

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

## Scaling

### Horizontal Scaling (AWS ECS)

```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster verdant-cluster \
  --service verdant-backend \
  --desired-count 4
```

### Auto-scaling Configuration

```json
{
  "TargetTrackingScalingPolicyConfiguration": {
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }
}
```

## Troubleshooting

### Check logs

```bash
# Docker Compose
docker-compose logs -f backend

# AWS ECS
aws logs tail /ecs/verdant-backend --follow

# Kubernetes
kubectl logs -f deployment/verdant-backend
```

### Database connection issues

```bash
# Test connection
psql -h <host> -U verdant -d verdant_point -c "SELECT 1;"

# Check if migrations ran
npx prisma migrate status
```

### Redis connection issues

```bash
# Test connection
redis-cli -h <host> -p 6379 -a <password> ping
```

## Security Checklist

- [ ] Use strong, random JWT secrets (64+ characters)
- [ ] Enable SSL/TLS for all connections
- [ ] Use secrets manager for sensitive data
- [ ] Enable database encryption at rest
- [ ] Configure security groups/firewalls properly
- [ ] Set up VPC with private subnets for database
- [ ] Enable WAF on load balancer
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Audit logging enabled
- [ ] Backup encryption enabled
- [ ] MFA for admin access

## Support

For deployment issues:
- Check logs first
- Review health check endpoints
- Verify environment variables
- Ensure database migrations ran
- Contact: devops@verdantpoint.com
