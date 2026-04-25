-- Recreate datadelve1@gmail.com admin account
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  existing_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_id FROM auth.users WHERE email = 'datadelve1@gmail.com';
  
  IF existing_id IS NOT NULL THEN
    -- Update password
    UPDATE auth.users
    SET encrypted_password = crypt('Ox12fa34n_', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = existing_id;
    new_user_id := existing_id;
  ELSE
    -- Create new auth user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'datadelve1@gmail.com',
      crypt('Ox12fa34n_', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Data Delve"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    -- Create identity
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'datadelve1@gmail.com', 'email_verified', true),
      'email',
      new_user_id::text,
      now(), now(), now()
    );
  END IF;

  -- Ensure profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new_user_id, 'datadelve1@gmail.com', 'Data Delve')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;