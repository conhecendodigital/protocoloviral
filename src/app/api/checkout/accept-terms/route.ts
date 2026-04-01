import { createServerSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { error } = await supabase.from('profiles').update({
            has_accepted_terms: true
        }).eq('id', user.id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Accept Terms Error:', error);
        return NextResponse.json({ error: 'Erro ao registrar aceite de termos' }, { status: 500 });
    }
}
