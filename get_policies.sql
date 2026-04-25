SELECT policyname, objid::regclass, cmd, qual FROM pg_policy WHERE objid::regclass::text = 'users';
