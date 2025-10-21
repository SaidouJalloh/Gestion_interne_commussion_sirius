
// code qui marche bien
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables Supabase manquantes !');
    console.error('URL:', supabaseUrl);
    console.error('Key:', supabaseAnonKey);
    throw new Error('Les variables d\'environnement Supabase sont manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserProfile = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return { ...user, ...profile };
    } catch (error) {
        console.error('getUserProfile error:', error);
        return null;
    }
};