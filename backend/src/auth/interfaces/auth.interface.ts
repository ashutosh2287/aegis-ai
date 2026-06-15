export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  training_years: number;
  primary_goal: string | null;
  experience_level: string;
  preferred_units: string;
  timezone: string;
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  is_super_admin: boolean;
  role: string;
  created_at: string;
  updated_at: string;
  confirmation_token: string | null;
  email_change: string | null;
  email_change_confirm_status: string | null;
  phone_change: string | null;
  encrypted_password: string;
}