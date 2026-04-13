-- ==========================================
-- Great Society - Cloud Database Setup
-- ==========================================
-- Run this file on your cloud PostgreSQL to create all tables
-- Works with: Neon.tech, Supabase, Railway, Render, etc.
--
-- Usage:
--   psql $DATABASE_URL -f scripts/setup-cloud-db.sql
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name character varying(200),
    email character varying(200) UNIQUE,
    phone character varying(30) UNIQUE,
    password_hash text,
    role character varying(20) DEFAULT 'user',
    sub_role character varying(50),
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    profile_image text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (role IN ('user','admin','superadmin'))
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id SERIAL PRIMARY KEY,
    title character varying(500),
    title_ar character varying(500),
    description text,
    description_ar text,
    type character varying(50),
    purpose character varying(20) DEFAULT 'sale',
    price numeric,
    area numeric,
    bedrooms integer,
    bathrooms integer,
    floor integer,
    total_floors integer,
    district character varying(200),
    address text,
    city character varying(100) DEFAULT 'القاهرة',
    latitude numeric,
    longitude numeric,
    images text[],
    is_furnished boolean DEFAULT false,
    has_elevator boolean DEFAULT false,
    has_parking boolean DEFAULT false,
    has_pool boolean DEFAULT false,
    has_garden boolean DEFAULT false,
    has_security boolean DEFAULT false,
    status character varying(20) DEFAULT 'pending',
    rejection_reason text,
    owner_id integer REFERENCES public.users(id),
    approved_by integer REFERENCES public.users(id),
    approved_at timestamp with time zone,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    video_url text,
    year_built integer,
    finishing character varying(100),
    compound character varying(200),
    delivery_date character varying(100),
    CONSTRAINT properties_status_check CHECK (status IN ('pending','approved','rejected','sold'))
);

-- Saved properties
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES public.users(id) ON DELETE CASCADE,
    property_id integer REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, property_id)
);

-- Payment requests
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id SERIAL PRIMARY KEY,
    property_id integer REFERENCES public.properties(id),
    buyer_id integer REFERENCES public.users(id),
    amount numeric,
    payment_method character varying(50),
    notes text,
    status character varying(20) DEFAULT 'pending',
    processed_by integer REFERENCES public.users(id),
    processed_at timestamp with time zone,
    screenshot_url text,
    contact_phone character varying(20),
    created_at timestamp with time zone DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES public.users(id),
    type character varying(50),
    title character varying(300),
    message text,
    property_data jsonb,
    user_data jsonb,
    is_read boolean DEFAULT false,
    link text,
    created_at timestamp with time zone DEFAULT now()
);

-- OTP codes
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id SERIAL PRIMARY KEY,
    identifier character varying(200) NOT NULL,
    code character varying(6) NOT NULL,
    type character varying(20) NOT NULL,
    user_data jsonb,
    attempts integer DEFAULT 0,
    locked_until timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    last_sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT otp_codes_type_check CHECK (type IN ('register','login','forgot-password'))
);

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES public.users(id),
    subject character varying(300),
    status character varying(20) DEFAULT 'open',
    priority character varying(20) DEFAULT 'medium',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Support messages
CREATE TABLE IF NOT EXISTS public.support_messages (
    id SERIAL PRIMARY KEY,
    ticket_id integer REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id integer REFERENCES public.users(id),
    message text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Property chat messages
CREATE TABLE IF NOT EXISTS public.property_messages (
    id SERIAL PRIMARY KEY,
    property_id integer REFERENCES public.properties(id) ON DELETE CASCADE,
    sender_id integer REFERENCES public.users(id),
    message text,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id SERIAL PRIMARY KEY,
    name character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    phone character varying(30),
    subject character varying(300) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Admin emails whitelist
CREATE TABLE IF NOT EXISTS public.admin_emails (
    id SERIAL PRIMARY KEY,
    email character varying(200) NOT NULL UNIQUE,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- AI chat history
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES public.users(id),
    role character varying(20),
    content text,
    created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- Seed demo accounts (run after tables created)
-- ==========================================
-- Passwords are bcrypt hashed:
--   Admin@GreatSociety1  → superadmin
--   PropMgr@123          → property_manager
--   DataEntry@123        → data_entry
--   Support@123          → support
--   User@123             → user

-- Run: npx tsx scripts/seed-demo-accounts.ts
-- Or use the app's auto-migration on first start
