import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Checking for low stock items...');

    // Get all inventory items
    const { data: allItems, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(name, sku)
      `);
    
    if (error) throw error;

    // Filter items where quantity <= reorder_level
    const lowStockItems = allItems?.filter(item => 
      item.quantity <= item.reorder_level
    ) || [];

    console.log(`Found ${lowStockItems.length} low stock items`);

    // Get all managers and admins to notify
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['ADMIN', 'MANAGER']);

    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found to notify');
      return new Response(
        JSON.stringify({ message: 'No admins to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notifications for each low stock item
    for (const item of lowStockItems || []) {
      const isOutOfStock = item.quantity === 0;
      const title = isOutOfStock ? 'Out of Stock Alert' : 'Low Stock Alert';
      const message = isOutOfStock
        ? `${item.product.name} (${item.product.sku}) is out of stock`
        : `${item.product.name} (${item.product.sku}) is low on stock: ${item.quantity} units remaining`;

      for (const admin of adminUsers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: admin.user_id,
            type: 'INVENTORY',
            title,
            message,
            priority: isOutOfStock ? 'HIGH' : 'NORMAL',
            action_url: '/inventory',
            metadata: {
              product_id: item.product_id,
              quantity: item.quantity,
              reorder_level: item.reorder_level,
            },
          });
      }

      console.log(`Created notifications for ${item.product.name}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        itemsChecked: lowStockItems?.length || 0,
        notificationsSent: (lowStockItems?.length || 0) * adminUsers.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Low stock alert error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
