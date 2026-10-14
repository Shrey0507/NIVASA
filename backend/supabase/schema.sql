-- =============================================================================
-- NIVASA Smart Hostel Management System - Database Schema
-- Run this script in the Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- -----------------------------------------------------------------------------
-- 1. ROOMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostel VARCHAR(20) NOT NULL CHECK (hostel IN ('boys', 'girls')),
    block VARCHAR(10) NOT NULL,
    floor INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    current_occupancy INT NOT NULL DEFAULT 0,
    type VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_room UNIQUE (hostel, block, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_hostel_status ON public.rooms(hostel, status);
CREATE INDEX IF NOT EXISTS idx_rooms_block_floor ON public.rooms(block, floor);

-- -----------------------------------------------------------------------------
-- 2. STUDENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usn VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    year INT DEFAULT 1,
    hostel VARCHAR(20) NOT NULL CHECK (hostel IN ('boys', 'girls')),
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'graduated')),
    emergency_contact JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_usn ON public.students(usn);
CREATE INDEX IF NOT EXISTS idx_students_hostel ON public.students(hostel);
CREATE INDEX IF NOT EXISTS idx_students_room_id ON public.students(room_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- -----------------------------------------------------------------------------
-- 3. FEES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    term VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partial')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fees_student ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON public.fees(due_date);

-- -----------------------------------------------------------------------------
-- 4. MOVEMENTS / GATE PASS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    purpose VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    check_out_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_return_time TIMESTAMPTZ NOT NULL,
    actual_return_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'out' CHECK (status IN ('pending', 'approved', 'rejected', 'out', 'returned', 'late')),
    parent_approval BOOLEAN DEFAULT false,
    warden_approval VARCHAR(20) DEFAULT 'approved',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_student ON public.movements(student_id);
CREATE INDEX IF NOT EXISTS idx_movements_status ON public.movements(status);
CREATE INDEX IF NOT EXISTS idx_movements_checkout ON public.movements(check_out_time);

-- -----------------------------------------------------------------------------
-- 5. GRIEVANCES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(100),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grievances_student ON public.grievances(student_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON public.grievances(priority);

-- -----------------------------------------------------------------------------
-- 6. NOTICES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'boys', 'girls', 'wardens', 'staff')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    published_by VARCHAR(100),
    expires_at TIMESTAMPTZ,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_pinned ON public.notices(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notices_created ON public.notices(created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. MESS MENU TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mess_menu (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week VARCHAR(20) UNIQUE NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    breakfast JSONB NOT NULL DEFAULT '[]'::jsonb,
    lunch JSONB NOT NULL DEFAULT '[]'::jsonb,
    snacks JSONB NOT NULL DEFAULT '[]'::jsonb,
    dinner JSONB NOT NULL DEFAULT '[]'::jsonb,
    special_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 language 'plpgsql';

CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fees_modtime BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movements_modtime BEFORE UPDATE ON public.movements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grievances_modtime BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notices_modtime BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menu ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated/anon users for basic viewing
CREATE POLICY Public read notices ON public.notices FOR SELECT USING (true);
CREATE POLICY Public read mess_menu ON public.mess_menu FOR SELECT USING (true);
CREATE POLICY Public read rooms ON public.rooms FOR SELECT USING (true);

-- Allow full access to service_role (used by backend API)
-- By default, service_role key automatically bypasses RLS in Supabase.
