CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name', -- Esto viene de 'options.data' en JS
    COALESCE(new.raw_user_meta_data->>'role', 'asesor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;