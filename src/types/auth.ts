import type { Session, User } from "@supabase/supabase-js";

export type AuthRole = "student" | "admin";
export type AuthPlan = "free" | "pro";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  learning_goal: string | null;
  avatar_url: string | null;
  created_at: string;
  plan: AuthPlan;
  role: AuthRole;
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
};

export type EmailLoginInput = { email: string; password: string };
export type EmailSignupInput = {
  fullName: string;
  email: string;
  password: string;
  learningGoal: string;
};

export type PhoneOtpSendInput = { phone: string };
export type PhoneOtpVerifyInput = { phone: string; token: string };
