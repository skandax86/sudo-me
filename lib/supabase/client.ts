import { createBrowserClient } from '@supabase/ssr';

// Validate Supabase configuration
function validateSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'undefined' || key === 'undefined') {
    if (typeof window !== 'undefined') {
      console.warn(
        '⚠️  Supabase not configured. Please create .env.local file.\n' +
        'Visit: http://localhost:3000/setup for instructions.'
      );
    }
    return false;
  }

  return true;
}

const isConfigured = validateSupabaseConfig();

// Create Supabase client for browser
export function createClient() {
  if (!isConfigured) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Helper to check if Supabase is ready
export function isSupabaseReady(): boolean {
  return isConfigured;
}

// Get singleton client instance
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!isConfigured) {
    throw new Error(
      'Supabase not configured. Please set up .env.local file.\n' +
      'See: SETUP-GUIDE.md for instructions.'
    );
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return clientInstance;
}




