--
-- SQLINES DEMO *** se dump
--


-- SQLINES DEMO *** ase version 16.10
-- SQLINES DEMO ***  version 16.10

/* SET statement_timeout = 0; */
/* SET lock_timeout = 0; */
SET idle_in_transaction_session_timeout = 0;
/* SET client_encoding = 'UTF8'; */
/* SET standard_conforming_strings = on; */
-- SQLINES FOR EVALUATION USE ONLY (14 DAYS)
SELECT pg_catalog.set_config('search_path', '', false);
/* SET check_function_bodies = false; */
SET xmloption = content;
/* SET client_min_messages = warning; */
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- SQLINES DEMO *** s; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_emails (
    id integer NOT NULL,
    email character varying(200) NOT NULL,
    is_active boolean DEFAULT true,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** s_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.admin_emails_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** s_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_emails_id_seq OWNED BY public.admin_emails.id;


--
-- SQLINES DEMO *** sages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    phone character varying(30),
    subject character varying(300) NOT NULL,
    message longtext NOT NULL,
    is_read boolean DEFAULT false,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** sages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.contact_messages_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** sages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- SQLINES DEMO *** ns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50),
    title character varying(300),
    message longtext,
    property_data jsonb,
    user_data jsonb,
    is_read boolean DEFAULT false,
    created_at datetime DEFAULT now(),
    link longtext
);


--
-- SQLINES DEMO *** ns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.notifications_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** ns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- SQLINES DEMO *** Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id integer NOT NULL,
    identifier character varying(200) NOT NULL,
    code character varying(6) NOT NULL,
    type character varying(20) NOT NULL,
    user_data jsonb,
    attempts integer DEFAULT 0,
    locked_until datetime,
    expires_at datetime NOT NULL,
    used boolean DEFAULT false,
    last_sent_at datetime DEFAULT now(),
    created_at datetime DEFAULT now(),
    CONSTRAINT otp_codes_type_check CHECK (((type)::longtext = ANY ((ARRAY['register'::character varying, 'login'::character varying, 'forgot-password'::character varying])::text[])))
);


--
-- SQLINES DEMO *** d_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.otp_codes_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** d_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_codes_id_seq OWNED BY public.otp_codes.id;


--
-- SQLINES DEMO *** uests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_requests (
    id integer NOT NULL,
    property_id integer,
    buyer_id integer,
    amount numeric,
    payment_method character varying(50),
    notes longtext,
    status character varying(20) DEFAULT 'pending'::character varying(1),
    processed_by integer,
    processed_at datetime,
    created_at datetime DEFAULT now(),
    screenshot_url longtext,
    contact_phone character varying(20)
);


--
-- SQLINES DEMO *** uests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.payment_requests_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** uests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_requests_id_seq OWNED BY public.payment_requests.id;


--
-- SQLINES DEMO ***  Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    title character varying(300),
    title_ar character varying(300),
    description longtext,
    description_ar longtext,
    type character varying(50),
    purpose character varying(20) DEFAULT 'sale'::character varying(1),
    price numeric,
    area numeric,
    rooms integer,
    bedrooms integer,
    bathrooms integer,
    floor integer,
    address longtext,
    district character varying(100),
    city character varying(100),
    contact_phone character varying(20) DEFAULT '01100111618'::character varying(1),
    owner_id integer,
    status character varying(20) DEFAULT 'pending'::character varying(1),
    is_featured boolean DEFAULT false,
    views integer DEFAULT 0,
    has_parking boolean DEFAULT false,
    has_elevator boolean DEFAULT false,
    has_garden boolean DEFAULT false,
    has_pool boolean DEFAULT false,
    is_furnished boolean DEFAULT false,
    approved_by integer,
    approved_at datetime,
    sold_to integer,
    sold_at datetime,
    created_at datetime DEFAULT now(),
    updated_at datetime DEFAULT now(),
    down_payment character varying(100),
    delivery_status character varying(100),
    finishing_type character varying(50),
    floor_plan_image longtext,
    google_maps_url longtext,
    has_basement boolean DEFAULT false,
    CONSTRAINT properties_purpose_check CHECK (((purpose)::longtext = ANY ((ARRAY['sale'::character varying, 'rent'::character varying, 'resale'::character varying])::text[]))),
    CONSTRAINT properties_status_check CHECK (((status)::longtext = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'sold'::character varying])::text[])))
);


--
-- SQLINES DEMO *** id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.properties_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- SQLINES DEMO *** at_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_chat_messages (
    id integer NOT NULL,
    property_id integer,
    sender_id integer,
    content longtext,
    is_admin boolean DEFAULT false,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** at_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.property_chat_messages_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** at_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_chat_messages_id_seq OWNED BY public.property_chat_messages.id;


--
-- SQLINES DEMO *** ages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_images (
    id integer NOT NULL,
    property_id integer,
    url longtext NOT NULL,
    is_primary boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** ages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.property_images_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** ages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_images_id_seq OWNED BY public.property_images.id;


--
-- SQLINES DEMO *** rties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_properties (
    id integer NOT NULL,
    user_id integer,
    property_id integer,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** rties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.saved_properties_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** rties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_properties_id_seq OWNED BY public.saved_properties.id;


--
-- SQLINES DEMO *** sages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_messages (
    id integer NOT NULL,
    ticket_id integer,
    sender_id integer,
    content longtext,
    is_admin boolean DEFAULT false,
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** sages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.support_messages_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** sages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_messages_id_seq OWNED BY public.support_messages.id;


--
-- SQLINES DEMO *** kets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    user_id integer,
    subject longtext,
    status character varying(20) DEFAULT 'open'::character varying(1),
    created_at datetime DEFAULT now()
);


--
-- SQLINES DEMO *** kets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.support_tickets_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** kets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- SQLINES DEMO *** : TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    email character varying(200) NOT NULL,
    phone character varying(30),
    password_hash longtext NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying(1),
    sub_role character varying(30),
    avatar_url longtext,
    is_active boolean DEFAULT true,
    created_at datetime DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::longtext = ANY ((ARRAY['user'::character varying, 'admin'::character varying, 'superadmin'::character varying])::text[])))
);


--
-- SQLINES DEMO *** q; Type: SEQUENCE; Schema: public; Owner: -
--

CALL CreateSequence('public.users_id_seq', 1, 1)
    NO 1;


--
-- SQLINES DEMO *** q; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- SQLINES DEMO *** s id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_emails ALTER COLUMN id SET DEFAULT nextval('public.admin_emails_id_seq'::regclass);


--
-- SQLINES DEMO *** sages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- SQLINES DEMO *** ns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- SQLINES DEMO *** d; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes ALTER COLUMN id SET DEFAULT nextval('public.otp_codes_id_seq'::regclass);


--
-- SQLINES DEMO *** uests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests ALTER COLUMN id SET DEFAULT nextval('public.payment_requests_id_seq'::regclass);


--
-- SQLINES DEMO *** id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- SQLINES DEMO *** at_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.property_chat_messages_id_seq'::regclass);


--
-- SQLINES DEMO *** ages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_images ALTER COLUMN id SET DEFAULT nextval('public.property_images_id_seq'::regclass);


--
-- SQLINES DEMO *** rties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties ALTER COLUMN id SET DEFAULT nextval('public.saved_properties_id_seq'::regclass);


--
-- SQLINES DEMO *** sages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages ALTER COLUMN id SET DEFAULT nextval('public.support_messages_id_seq'::regclass);


--
-- SQLINES DEMO *** kets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- SQLINES DEMO *** ype: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- SQLINES DEMO *** s admin_emails_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_emails
    ADD CONSTRAINT admin_emails_email_key UNIQUE (email);


--
-- SQLINES DEMO *** s admin_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_emails
    ADD CONSTRAINT admin_emails_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** sages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** ns notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** tp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** uests payment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests
    ADD CONSTRAINT payment_requests_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** at_messages property_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_chat_messages
    ADD CONSTRAINT property_chat_messages_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** ages property_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** rties saved_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** rties saved_properties_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- SQLINES DEMO *** sages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** kets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** _email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- SQLINES DEMO *** _pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY(id);


--
-- SQLINES DEMO *** ns notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** uests payment_requests_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests
    ADD CONSTRAINT payment_requests_buyer_id_fkey FOREIGN KEY(buyer_id) REFERENCES public.users(id);


--
-- SQLINES DEMO *** uests payment_requests_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_requests
    ADD CONSTRAINT payment_requests_property_id_fkey FOREIGN KEY(property_id) REFERENCES public.properties(id);


--
-- SQLINES DEMO *** properties_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_owner_id_fkey FOREIGN KEY(owner_id) REFERENCES public.users(id);


--
-- SQLINES DEMO *** at_messages property_chat_messages_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_chat_messages
    ADD CONSTRAINT property_chat_messages_property_id_fkey FOREIGN KEY(property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** at_messages property_chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_chat_messages
    ADD CONSTRAINT property_chat_messages_sender_id_fkey FOREIGN KEY(sender_id) REFERENCES public.users(id);


--
-- SQLINES DEMO *** ages property_images_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_images
    ADD CONSTRAINT property_images_property_id_fkey FOREIGN KEY(property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** rties saved_properties_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_property_id_fkey FOREIGN KEY(property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** rties saved_properties_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_properties
    ADD CONSTRAINT saved_properties_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** sages support_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_sender_id_fkey FOREIGN KEY(sender_id) REFERENCES public.users(id);


--
-- SQLINES DEMO *** sages support_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_ticket_id_fkey FOREIGN KEY(ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- SQLINES DEMO *** kets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.users(id);


--
-- SQLINES DEMO *** se dump complete
--


