
-- Attach the handle_new_user function to auth.users inserts (creates profile)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Attach the assign_admin_on_signup function to auth.users inserts (assigns admin role)
CREATE OR REPLACE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_on_signup();
