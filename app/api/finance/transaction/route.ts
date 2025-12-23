import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TransactionInput, TransactionType } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TransactionInput = await request.json();
    
    // Validate required fields
    if (!body.datetime || !body.type || !body.amount || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: datetime, type, amount, category' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes: TransactionType[] = ['income', 'expense', 'transfer'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Adjust amount sign based on type
    const amount = body.type === 'expense' ? -Math.abs(body.amount) : Math.abs(body.amount);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        datetime: body.datetime,
        type: body.type,
        account_id: body.account_id || null,
        amount,
        amount_inr: amount, // Assuming INR for now
        category: body.category,
        subcategory: body.subcategory || null,
        description: body.note || null,
        transaction_date: body.datetime.split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Transaction creation error:', error);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction logged',
    });
  } catch (error) {
    console.error('Transaction API error:', error);
    return NextResponse.json({ error: 'Failed to log transaction' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('transactions')
      .select('*, accounts(name, type)')
      .eq('user_id', user.id)
      .order('datetime', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (from) {
      query = query.gte('transaction_date', from);
    }
    if (to) {
      query = query.lte('transaction_date', to);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json({ transactions, count });
  } catch (error) {
    console.error('Transaction GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transaction DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

