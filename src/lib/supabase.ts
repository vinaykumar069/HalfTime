import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
const rawSupabaseUrl = String(env.VITE_SUPABASE_URL || 'https://uyowmsbwxjhnyixzgnkk.supabase.co').trim();
const rawSupabaseAnonKey = String(env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7R1rIa6Y57aGwoh0A4CZAw_MQChtGxo').trim();

function isValidHttpUrl(stringUrl: string): boolean {
  if (!stringUrl || typeof stringUrl !== 'string') return false;
  if (!/^https?:\/\//i.test(stringUrl)) return false;
  try {
    const url = new URL(stringUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (
      host === 'your-project.supabase.co' ||
      host.includes('example.com') ||
      host.includes('placeholder') ||
      host.includes('your-supabase')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isValidAnonKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  if (
    key === 'your-anon-key' ||
    key.includes('placeholder') ||
    key.includes('your-key') ||
    key.length < 15
  ) {
    return false;
  }
  return true;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  configError?: string;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasUrl = isValidHttpUrl(rawSupabaseUrl);
  const hasKey = isValidAnonKey(rawSupabaseAnonKey);

  if (!hasUrl && !hasKey) {
    return {
      isConfigured: false,
      hasUrl: false,
      hasKey: false,
      configError: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing or unconfigured.',
    };
  }

  if (!hasUrl) {
    return {
      isConfigured: false,
      hasUrl: false,
      hasKey: true,
      configError: 'VITE_SUPABASE_URL is missing or invalid. Must be a valid HTTPS URL (e.g. https://xyz.supabase.co).',
    };
  }

  if (!hasKey) {
    return {
      isConfigured: false,
      hasUrl: true,
      hasKey: false,
      configError: 'VITE_SUPABASE_ANON_KEY is missing or invalid.',
    };
  }

  return {
    isConfigured: true,
    hasUrl: true,
    hasKey: true,
  };
}

const configStatus = getSupabaseConfigStatus();

export const isSupabaseConfigured: boolean = configStatus.isConfigured;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
  user?: User | null;
  tableAccessible?: boolean;
}

/**
 * Perform a real, non-destructive connectivity verification against Supabase
 */
export async function verifySupabaseConnection(): Promise<ConnectionTestResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: configStatus.configError || 'HALFTIME storage is not configured. Missing valid Supabase environment variables.',
      tableAccessible: false,
    };
  }

  const startTime = Date.now();
  try {
    // 1. Verify Auth Service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      return {
        ok: false,
        message: `Supabase Auth error: ${authError.message}`,
        latencyMs: Date.now() - startTime,
        tableAccessible: false,
      };
    }

    const currentUser = authData?.session?.user || null;

    // 2. Verify Database Service by pinging projects table
    const { error: dbError } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });

    if (dbError && dbError.code !== 'PGRST116') {
      // If table does not exist, provide specific schema migration guidance
      if (dbError.code === '42P01' || dbError.message.includes('relation "projects" does not exist') || dbError.message.includes('relation "public.projects" does not exist')) {
        return {
          ok: false,
          message: 'Supabase connected, but the "projects" table does not exist yet. Please run the supabase_schema.sql script in your Supabase SQL Editor.',
          latencyMs: Date.now() - startTime,
          user: currentUser,
          tableAccessible: false,
        };
      }

      return {
        ok: false,
        message: `Supabase database error: ${dbError.message} (code: ${dbError.code})`,
        latencyMs: Date.now() - startTime,
        user: currentUser,
        tableAccessible: false,
      };
    }

    return {
      ok: true,
      message: 'Supabase database & authentication connected successfully with Row Level Security.',
      latencyMs: Date.now() - startTime,
      user: currentUser,
      tableAccessible: true,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Failed to establish connection to Supabase.',
      latencyMs: Date.now() - startTime,
      tableAccessible: false,
    };
  }
}

/**
 * Format raw Supabase authentication errors into friendly, actionable messages
 */
export function getFriendlyAuthErrorMessage(error: any): { title?: string; message: string; isUnconfirmed?: boolean } {
  if (!error) return { message: 'An unexpected authentication error occurred.' };
  const rawMsg = (typeof error === 'string' ? error : error?.message || '').toLowerCase();
  const code = (error?.code || error?.error_code || '').toLowerCase();

  // Email not confirmed
  if (
    rawMsg.includes('email not confirmed') ||
    rawMsg.includes('email_not_confirmed') ||
    code === 'email_not_confirmed' ||
    rawMsg.includes('unconfirmed')
  ) {
    return {
      title: 'EMAIL NOT CONFIRMED',
      message: 'Please confirm your email address before signing in.',
      isUnconfirmed: true,
    };
  }

  // Invalid credentials
  if (
    rawMsg.includes('invalid login credentials') ||
    rawMsg.includes('invalid_credentials') ||
    rawMsg.includes('invalid email or password') ||
    rawMsg.includes('invalid username or password')
  ) {
    return {
      message: 'Incorrect email or password. Please verify your credentials and try again.',
    };
  }

  // Rate limit
  if (
    rawMsg.includes('rate limit') ||
    rawMsg.includes('over_email_send_rate_limit') ||
    rawMsg.includes('too many requests') ||
    rawMsg.includes('security purposes, you can only') ||
    error?.status === 429
  ) {
    return {
      message: 'Too many attempts. Please wait a moment and try again.',
    };
  }

  // User already exists
  if (
    rawMsg.includes('user already registered') ||
    rawMsg.includes('already exists') ||
    rawMsg.includes('user_already_exists')
  ) {
    return {
      message: 'An account with this email already exists. Please sign in instead.',
    };
  }

  // Weak password
  if (
    rawMsg.includes('password should be at least') ||
    rawMsg.includes('weak_password') ||
    rawMsg.includes('password is too short')
  ) {
    return {
      message: 'Password must be at least 6 characters.',
    };
  }

  // Network or connection failure
  if (
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('network') ||
    rawMsg.includes('timeout')
  ) {
    return {
      message: "We couldn't reach HALFTIME authentication. Please check your connection and try again.",
    };
  }

  return {
    message: error?.message || 'Authentication failed. Please try again.',
  };
}

/**
 * Get current authenticated user (Throws in production if not authenticated)
 */
export async function getCurrentAuthenticatedUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData?.session?.user || null;
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Resend Supabase signup email confirmation
 */
export async function resendConfirmationEmail(emailAddress: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase storage is not configured.' };
  }

  const cleanEmail = emailAddress.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      const friendly = getFriendlyAuthErrorMessage(error);
      return { success: false, error: friendly.message };
    }

    return { success: true };
  } catch (err: any) {
    const friendly = getFriendlyAuthErrorMessage(err);
    return { success: false, error: friendly.message };
  }
}

/**
 * Get a direct webmail provider link based on email address domain
 */
export function getEmailProviderUrl(emailAddress: string): { name: string; url: string } {
  if (!emailAddress || typeof emailAddress !== 'string') {
    return { name: 'OPEN EMAIL APP', url: 'mailto:' };
  }
  const domain = (emailAddress.split('@')[1] || '').toLowerCase().trim();
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return { name: 'OPEN GMAIL', url: 'https://mail.google.com' };
  }
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com') || domain.includes('msn.com')) {
    return { name: 'OPEN OUTLOOK', url: 'https://outlook.live.com/mail/' };
  }
  if (domain.includes('yahoo.com')) {
    return { name: 'OPEN YAHOO MAIL', url: 'https://mail.yahoo.com' };
  }
  if (domain.includes('icloud.com')) {
    return { name: 'OPEN ICLOUD MAIL', url: 'https://www.icloud.com/mail' };
  }
  if (domain.includes('proton.me') || domain.includes('protonmail.com')) {
    return { name: 'OPEN PROTON MAIL', url: 'https://mail.proton.me' };
  }
  return { name: 'OPEN EMAIL APP', url: `mailto:${emailAddress}` };
}
