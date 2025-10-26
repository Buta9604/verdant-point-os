import { PrismaClient, UserRole, StrainType, PaymentMethod, PreferredContact } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@verdantpoint.com' },
    update: {},
    create: {
      email: 'admin@verdantpoint.com',
      passwordHash: adminPassword,
      pinHash: '1234', // Simple PIN for demo
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '555-0100',
      isActive: true,
    },
  });
  console.log('✓ Created admin user');

  // Create manager
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@verdantpoint.com' },
    update: {},
    create: {
      email: 'manager@verdantpoint.com',
      passwordHash: managerPassword,
      pinHash: '2345',
      role: UserRole.MANAGER,
      firstName: 'Jane',
      lastName: 'Manager',
      phone: '555-0101',
      isActive: true,
    },
  });
  console.log('✓ Created manager user');

  // Create budtenders
  const budtenderPassword = await bcrypt.hash('budtender123', 12);
  const budtender = await prisma.user.upsert({
    where: { email: 'budtender@verdantpoint.com' },
    update: {},
    create: {
      email: 'budtender@verdantpoint.com',
      passwordHash: budtenderPassword,
      pinHash: '3456',
      role: UserRole.BUDTENDER,
      firstName: 'John',
      lastName: 'Budtender',
      phone: '555-0102',
      isActive: true,
    },
  });
  console.log('✓ Created budtender user');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Flower' },
      update: {},
      create: {
        name: 'Flower',
        description: 'Premium cannabis flower',
        taxRate: 15.5,
        displayOrder: 1,
        icon: 'flower',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Edibles' },
      update: {},
      create: {
        name: 'Edibles',
        description: 'Delicious cannabis-infused edibles',
        taxRate: 15.5,
        displayOrder: 2,
        icon: 'cookie',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Concentrates' },
      update: {},
      create: {
        name: 'Concentrates',
        description: 'High-potency cannabis concentrates',
        taxRate: 20.0,
        displayOrder: 3,
        icon: 'droplet',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Vapes' },
      update: {},
      create: {
        name: 'Vapes',
        description: 'Convenient vape cartridges',
        taxRate: 18.0,
        displayOrder: 4,
        icon: 'vape',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pre-Rolls' },
      update: {},
      create: {
        name: 'Pre-Rolls',
        description: 'Ready-to-smoke pre-rolled joints',
        taxRate: 15.5,
        displayOrder: 5,
        icon: 'cigarette',
        isActive: true,
      },
    }),
  ]);
  console.log('✓ Created product categories');

  // Create supplier
  const supplier = await prisma.supplier.upsert({
    where: { name: 'Green Valley Growers' },
    update: {},
    create: {
      name: 'Green Valley Growers',
      contactName: 'Michael Green',
      email: 'contact@greenvalley.com',
      phone: '555-0200',
      address: '123 Farm Road, California',
      licenseNumber: 'CA-SUP-12345',
      isActive: true,
    },
  });
  console.log('✓ Created supplier');

  // Create products
  const flowerCategory = categories[0];
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'FLW-001',
        name: 'Blue Dream',
        categoryId: flowerCategory.id,
        supplierId: supplier.id,
        strainType: StrainType.HYBRID,
        thcPercentage: 23.5,
        cbdPercentage: 0.5,
        batchId: 'BD-2024-001',
        metrcId: 'METRC-BD-001',
        price: 45.00,
        cost: 25.00,
        weightGrams: 3.5,
        description: 'Popular hybrid strain with sweet berry aroma',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'FLW-002',
        name: 'OG Kush',
        categoryId: flowerCategory.id,
        supplierId: supplier.id,
        strainType: StrainType.HYBRID,
        thcPercentage: 25.0,
        cbdPercentage: 0.3,
        batchId: 'OG-2024-001',
        metrcId: 'METRC-OG-001',
        price: 50.00,
        cost: 28.00,
        weightGrams: 3.5,
        description: 'Classic strain with earthy pine flavor',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'EDI-001',
        name: 'THC Gummies - 10mg',
        categoryId: categories[1].id,
        supplierId: supplier.id,
        strainType: StrainType.NA,
        thcPercentage: 10.0,
        cbdPercentage: 0,
        batchId: 'GUM-2024-001',
        metrcId: 'METRC-GUM-001',
        price: 25.00,
        cost: 12.00,
        description: 'Delicious fruit-flavored gummies, 10mg THC each',
        isActive: true,
      },
    }),
  ]);
  console.log('✓ Created products');

  // Create inventory for products
  for (const product of products) {
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: 100,
        reorderLevel: 20,
        reorderQuantity: 50,
        location: 'Main Storage',
      },
    });
  }
  console.log('✓ Created inventory records');

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1000',
        dateOfBirth: new Date('1990-01-15'),
        medicalCardNumber: 'MED-CA-12345',
        medicalCardExpiry: new Date('2025-12-31'),
        medicalCardState: 'CA',
        loyaltyPoints: 150,
        totalSpent: 500.00,
        visitCount: 12,
        preferredContact: PreferredContact.EMAIL,
        isActive: true,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-1001',
        dateOfBirth: new Date('1985-05-20'),
        loyaltyPoints: 250,
        totalSpent: 1200.00,
        visitCount: 25,
        preferredContact: PreferredContact.PHONE,
        isActive: true,
      },
    }),
  ]);
  console.log('✓ Created sample customers');

  // Create settings
  await Promise.all([
    prisma.setting.create({
      data: {
        key: 'store_name',
        value: 'Verdant Point Dispensary',
        category: 'STORE',
        description: 'Store display name',
      },
    }),
    prisma.setting.create({
      data: {
        key: 'default_tax_rate',
        value: '15.5',
        category: 'TAX',
        description: 'Default sales tax rate percentage',
      },
    }),
    prisma.setting.create({
      data: {
        key: 'loyalty_points_rate',
        value: '0.05',
        category: 'STORE',
        description: 'Loyalty points earned per dollar spent',
      },
    }),
  ]);
  console.log('✓ Created system settings');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@verdantpoint.com / admin123 (PIN: 1234)');
  console.log('Manager: manager@verdantpoint.com / manager123 (PIN: 2345)');
  console.log('Budtender: budtender@verdantpoint.com / budtender123 (PIN: 3456)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
