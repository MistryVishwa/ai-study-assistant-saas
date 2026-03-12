"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseClient";
import {
  emailLogin,
  emailSignup,
  googleOAuth,
  logout as supabaseLogout,
  magicLinkLogin,
  phoneOtpSend,
  phoneOtpVerify,
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/lib/auth";
import type { AuthState, EmailLoginInput, EmailSignupInput, Profile } from "@/types/auth";
import Toaster, { toast } from "@/components/toast/Toaster";

type AuthActions = {
  login: (input: EmailLoginInput) => Promise<void>;
  signup: (input: EmailSignupInput) => Promise<{ status: "signed_in" | "verify_email" }>;
  logout: () => Promise<void>;
  oauthLogin: (provider: "google", nextPath?: string) => Promise<void>;
  phoneLoginSend: (phone: string) => Promise<void>;
  phoneLoginVerify: (phone: string, token: string) => Promise<void>;
  magicLink: (email: string, nextPath?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPTS_KEY = "auth:loginAttempts";

function now() {
  return Date.now();
}

function readAttempts(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

function writeAttempts(attempts: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

function canAttemptLogin(): { ok: true } | { ok: false; retryInSeconds: number } {
  const cutoff = now() - LOGIN_WINDOW_MS;
  const attempts = readAttempts().filter((t) => t >= cutoff);
  if (attempts.length < MAX_LOGIN_ATTEMPTS) return { ok: true };
  const oldest = Math.min(...attempts);
  const retryInMs = Math.max(0, oldest + LOGIN_WINDOW_MS - now());
  return { ok: false, retryInSeconds: Math.ceil(retryInMs / 1000) };
}

function recordLoginAttempt() {
  const cutoff = now() - LOGIN_WINDOW_MS;
  const attempts = readAttempts().filter((t) => t >= cutoff);
  attempts.push(now());
  writeAttempts(attempts.slice(-MAX_LOGIN_ATTEMPTS));
}

async function fetchProfile(user: User): Promise<Profile | null> {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return null;
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user);
    setProfile(p);
  }, [user]);

  const hydrate = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getSession();
    const sess = data.session ?? null;
    setSession(sess);
    setUser(sess?.user ?? null);
    setLoading(false);
    if (sess?.user) {
      const p = await fetchProfile(sess.user);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    hydrate();

    const supabase = supabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      if (newSession?.user) {
        const p = await fetchProfile(newSession.user);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrate]);

  const login = useCallback(async (input: EmailLoginInput) => {
    const emailRule = validateEmail(input.email);
    if (emailRule) throw new Error(emailRule);
    const gate = canAttemptLogin();
    if (!gate.ok) {
      toast("error", `Too many attempts. Try again in ${gate.retryInSeconds}s.`);
      throw new Error("Rate limited");
    }
    recordLoginAttempt();

    const { error, data } = await emailLogin(input);
    if (error) throw error;

    const loggedInUser = data.user ?? null;
    const confirmed = !!loggedInUser?.email_confirmed_at;
    if (loggedInUser && !confirmed) {
      await supabaseBrowser().auth.signOut();
      toast("info", "Verify your email to continue");
      throw new Error("Email not verified");
    }

    toast("success", "Login successful");
  }, []);

  const signup = useCallback(async (input: EmailSignupInput) => {
    const emailRule = validateEmail(input.email);
    if (emailRule) throw new Error(emailRule);
    const rule = validatePassword(input.password);
    if (rule) throw new Error(rule);

    const { error, data } = await emailSignup(input);
    if (error) throw error;

    if (data.session) {
      toast("success", "Signup successful");
      return { status: "signed_in" as const };
    }

    toast("info", "Verify your email to continue");
    return { status: "verify_email" as const };
  }, []);

  const oauthLogin = useCallback(async (provider: "google", nextPath = "/dashboard") => {
    if (provider !== "google") throw new Error("Unsupported provider");
    const { data, error } = await googleOAuth(nextPath);
    if (error) throw error;
    if (data?.url) window.location.assign(data.url);
    else throw new Error("Unable to start OAuth flow");
  }, []);

  const phoneLoginSendAction = useCallback(async (phone: string) => {
    const rule = validatePhone(phone);
    if (rule) throw new Error(rule);
    const { error } = await phoneOtpSend({ phone });
    if (error) throw error;
    toast("success", "Code sent");
  }, []);

  const phoneLoginVerifyAction = useCallback(async (phone: string, token: string) => {
    const { error, data } = await phoneOtpVerify({ phone, token });
    if (error) throw error;
    if (!data?.session) {
      toast("info", "Verify your email to continue");
    } else {
      toast("success", "Login successful");
    }
  }, []);

  const magicLink = useCallback(async (email: string, nextPath = "/dashboard") => {
    const rule = validateEmail(email);
    if (rule) throw new Error(rule);
    const { error } = await magicLinkLogin(email, nextPath);
    if (error) throw error;
    toast("success", "Magic link sent");
  }, []);

  const logoutAction = useCallback(async () => {
    const { error } = await supabaseLogout();
    if (error) throw error;
    toast("success", "Logged out");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      profile,
      login,
      signup,
      logout: logoutAction,
      oauthLogin,
      phoneLoginSend: phoneLoginSendAction,
      phoneLoginVerify: phoneLoginVerifyAction,
      magicLink,
      refreshProfile,
    }),
    [
      user,
      session,
      loading,
      profile,
      login,
      signup,
      logoutAction,
      oauthLogin,
      phoneLoginSendAction,
      phoneLoginVerifyAction,
      magicLink,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

