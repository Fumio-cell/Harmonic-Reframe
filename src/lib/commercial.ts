import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkProStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

    if (error) return false;
    return !!data?.is_pro;
}

export function openLemonSqueezyCheckout(variantId: string = '417382') {
    if ((window as any).LemonSqueezy) {
        // @ts-ignore
        window.LemonSqueezy.Url.Open(`https://poetic-signal.lemonsqueezy.com/checkout/buy/${variantId}?embed=1`);
    } else {
        window.open(`https://poetic-signal.lemonsqueezy.com/checkout/buy/${variantId}`, '_blank');
    }
}
