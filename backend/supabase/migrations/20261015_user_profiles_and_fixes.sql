-- =============================================================================
-- NIVASA Additive Migration: user_profiles, schema fixes, RLS policies
-- Run in Supabase SQL Editor. This migration is additive and non-destructive.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USER_PROFILES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    username TEXT,
    role TEXT NOT NULL DEFAULT 'student'
        CHECK (role IN ('student', 'super_admin', 'hostel_admin', 'warden', 'admin')),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    hostel TEXT CHECK (hostel IS NULL OR hostel IN ('boys', 'girls')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_lower_unique
    ON public.user_profiles (lower(username)) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_profiles_student_id_idx ON public.user_profiles(student_id);
CREATE INDEX IF NOT EXISTS user_profiles_hostel_idx ON public.user_profiles(hostel);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles(role);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_username_format') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_format
            CHECK (username IS NULL OR username ~ '^[a-z0-9._-]{4,30}$');
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_user_profiles_modtime ON public.user_profiles;
CREATE TRIGGER update_user_profiles_modtime
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 2. NOTICES - add published_at column if missing
-- -----------------------------------------------------------------------------
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- -----------------------------------------------------------------------------
-- 2b. FEES — add fee_type and reference columns used by the API
-- -----------------------------------------------------------------------------
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS fee_type VARCHAR(50);
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS reference TEXT;

-- -----------------------------------------------------------------------------
-- 3. FEE_RECORDS view (API uses fee_records, schema has fees)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'fee_records'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'fees'
        ) THEN
            CREATE OR REPLACE VIEW public.fee_records AS SELECT * FROM public.fees;
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. MESS_MENUS view (API uses mess_menus, schema has mess_menu)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'mess_menus'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'mess_menu'
        ) THEN
            CREATE OR REPLACE VIEW public.mess_menus AS SELECT * FROM public.mess_menu;
        END IF;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own non-privileged fields"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
        AND hostel IS NOT DISTINCT FROM (SELECT hostel FROM public.user_profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can read own record" ON public.students;
CREATE POLICY "Students can read own record"
    ON public.students FOR SELECT
    USING (
        id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can read own fees" ON public.fees;
CREATE POLICY "Students can read own fees"
    ON public.fees FOR SELECT
    USING (
        student_id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can read own movements" ON public.movements;
CREATE POLICY "Students can read own movements"
    ON public.movements FOR SELECT
    USING (
        student_id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can insert own movements" ON public.movements;
CREATE POLICY "Students can insert own movements"
    ON public.movements FOR INSERT
    WITH CHECK (
        student_id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can read own grievances" ON public.grievances;
CREATE POLICY "Students can read own grievances"
    ON public.grievances FOR SELECT
    USING (
        student_id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can insert own grievances" ON public.grievances;
CREATE POLICY "Students can insert own grievances"
    ON public.grievances FOR INSERT
    WITH CHECK (
        student_id = (SELECT student_id FROM public.user_profiles WHERE id = auth.uid())
    );
