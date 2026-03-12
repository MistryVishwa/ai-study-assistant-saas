import type { AuthError, AuthOtpResponse, AuthResponse } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type {
  EmailLoginInput,
  EmailSignupInput,
  PhoneOtpSendInput,
  PhoneOtpVerifyInput,
} from "@/types/auth";

function getOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function callbackUrl(nextPath: string): string | undefined {
  const origin = getOrigin();
  if (!origin) return undefined;
  const safeNext = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return "Email is required.";
  // Basic sanity check (Supabase will do deeper validation server-side)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email.";
  return null;
}

export function validatePhone(phone: string): string | null {
  const value = phone.trim();
  if (!value) return "Phone is required.";
  // Basic E.164-ish check
  if (!/^\+[1-9]\d{7,14}$/.test(value)) return "Enter a phone number in E.164 format.";
  return null;
}

export async function emailLogin(input: EmailLoginInput): Promise<AuthResponse> {
  const supabase = supabaseBrowser();
  return supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
}

export async function emailSignup(input: EmailSignupInput): Promise<AuthResponse> {
  const supabase = supabaseBrowser();
  return supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        learning_goal: input.learningGoal,
      },
    },
  });
}

export async function googleOAuth(nextPath = "/dashboard") {
  const supabase = supabaseBrowser();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl(nextPath),
    },
  });
}

export async function magicLinkLogin(email: string, nextPath = "/dashboard") {
  const supabase = supabaseBrowser();
  const origin = getOrigin();
  return supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: origin ? `${origin}${nextPath}` : undefined,
      shouldCreateUser: false,
    },
  });
}

export async function phoneOtpSend(input: PhoneOtpSendInput): Promise<AuthOtpResponse> {
  const supabase = supabaseBrowser();
  return supabase.auth.signInWithOtp({
    phone: input.phone.trim(),
    options: { shouldCreateUser: true },
  });
}

export async function phoneOtpVerify(input: PhoneOtpVerifyInput) {
  const supabase = supabaseBrowser();
  return supabase.auth.verifyOtp({
    phone: input.phone.trim(),
    token: input.token.trim(),
    type: "sms",
  });
}

export async function logout(): Promise<{ error: AuthError | null }> {
  const supabase = supabaseBrowser();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = supabaseBrowser();
  return supabase.auth.getSession();
}

