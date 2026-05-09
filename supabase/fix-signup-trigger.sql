-- ────────────────────────────────────────────────────────
-- Fix: "Database error saving new user" on signup
-- ────────────────────────────────────────────────────────
-- The original trigger function lacked an explicit search_path,
-- so when fired from auth.users it couldn't locate pp_profiles.
-- This rebuild adds search_path + an exception handler so a
-- profile-insert failure never blocks signup.

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_pp ON auth.users;
DROP FUNCTION IF EXISTS public.handle_pp_new_user();
DROP FUNCTION IF EXISTS handle_pp_new_user();

-- 2. Recreate with explicit search_path and exception handling
CREATE OR REPLACE FUNCTION public.handle_pp_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pp_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup, even if profile creation fails
  RAISE WARNING 'pp_profiles insert failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created_pp
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_pp_new_user();

-- 4. Grant the function ownership to postgres so SECURITY DEFINER works correctly
ALTER FUNCTION public.handle_pp_new_user() OWNER TO postgres;
