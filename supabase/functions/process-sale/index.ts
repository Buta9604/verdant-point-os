import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface SaleRequest {
  items: SaleItem[];
  customer_id?: string;
  payment_method: string;
  discount_amount?: number;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const saleData: SaleRequest = await req.json();
    console.log('Processing sale:', saleData);

    // Calculate totals
    const subtotal = saleData.items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    );
    const discount = saleData.discount_amount || 0;
    const taxRate = 0.15; // 15% tax
    const taxAmount = (subtotal - discount) * taxRate;
    const total = subtotal - discount + taxAmount;

    // Generate transaction number
    const transactionNumber = `TXN-${Date.now()}`;

    // Start transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        transaction_number: transactionNumber,
        user_id: user.id,
        customer_id: saleData.customer_id,
        payment_method: saleData.payment_method,
        subtotal,
        discount_amount: discount,
        tax_amount: taxAmount,
        total,
        payment_status: 'COMPLETED',
        notes: saleData.notes,
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction error:', txError);
      throw txError;
    }

    console.log('Transaction created:', transaction.id);

    // Insert transaction items and update inventory
    for (const item of saleData.items) {
      // Insert transaction item
      const { error: itemError } = await supabase
        .from('transaction_items')
        .insert({
          transaction_id: transaction.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.unit_price * item.quantity,
        });

      if (itemError) {
        console.error('Item error:', itemError);
        throw itemError;
      }

      // Get current inventory
      const { data: inventory, error: invError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', item.product_id)
        .single();

      if (invError) {
        console.error('Inventory fetch error:', invError);
        throw invError;
      }

      // Update inventory
      const newQuantity = inventory.quantity - item.quantity;
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('product_id', item.product_id);

      if (updateError) {
        console.error('Inventory update error:', updateError);
        throw updateError;
      }

      console.log(`Updated inventory for product ${item.product_id}: ${inventory.quantity} -> ${newQuantity}`);
    }

    // Update customer stats if customer provided
    if (saleData.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_spent, visit_count, loyalty_points')
        .eq('id', saleData.customer_id)
        .single();

      if (customer) {
        const loyaltyPointsEarned = Math.floor(total * 10);
        await supabase
          .from('customers')
          .update({
            total_spent: customer.total_spent + total,
            visit_count: customer.visit_count + 1,
            loyalty_points: customer.loyalty_points + loyaltyPointsEarned,
          })
          .eq('id', saleData.customer_id);

        console.log(`Updated customer ${saleData.customer_id}: +${loyaltyPointsEarned} points`);
      }
    }

    // Log compliance event
    await supabase
      .from('compliance_logs')
      .insert({
        event_type: 'SALE',
        action: 'TRANSACTION_COMPLETED',
        entity_type: 'transaction',
        entity_id: transaction.id,
        user_id: user.id,
        before_state: {},
        after_state: { transaction_number: transactionNumber, total },
      });

    console.log('Sale completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Sale processing error:', error);
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
