/**
 * Supabase auth helpers — browser client only.
 * Wraps signInWithOAuth (Google), signInWithOtp (phone), signUp, signInWithPassword.
 */

import { createClient } from "./client";
import type { AuthOtpResponse } from "@supabase/supabase-js";

function callbackUrl(nextPath: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  if (!origin) return "";
  const next = nextPath.startsWith("/") ? nextPath : "/dashboard";
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Google OAuth — session persisted via cookies (middleware + callback). */
export async function signInWithGoogle(nextPath = "/dashboard") {
  return createClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(nextPath) },
  });
}

/** Email + password sign-in (session persisted by Supabase client). */
export async function signInWithPassword(email: string, password: string) {
  return createClient().auth.signInWithPassword({ email, password });
}

/** Email + password sign-up. */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { full_name?: string }
) {
  return createClient().auth.signUp({
    email,
    password,
    options: { data: metadata ?? {} },
  });
}

/**
 * Phone OTP — step 1: send code.
 * E.164 recommended, e.g. +15551234567
 */
export async function signInWithOtpPhone(phone: string): Promise<AuthOtpResponse> {
  return createClient().auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
}

/** Phone OTP — step 2: verify SMS code */
export async function verifyPhoneOtp(phone: string, token: string) {
  return createClient().auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
}

export async function signOut() {
  return createClient().auth.signOut();
}

export async function getSession() {
  return createClient().auth.getSession();
}

export async function getUser() {
  return createClient().auth.getUser();
}
