--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id integer,
    details text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text
);


ALTER TABLE public.activity_logs OWNER TO neondb_owner;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO neondb_owner;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: appearance_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appearance_settings (
    id integer NOT NULL,
    company_name character varying(255) DEFAULT 'إدارة المخزون'::character varying,
    company_name_en character varying(255) DEFAULT 'Inventory System'::character varying,
    company_address text,
    company_registration_number character varying(100),
    company_license_number character varying(100),
    company_tax_number character varying(100),
    company_website character varying(255),
    company_logo text,
    primary_color character varying(7) DEFAULT '#0f766e'::character varying,
    primary_hover_color character varying(7) DEFAULT '#134e4a'::character varying,
    secondary_color character varying(7) DEFAULT '#0891b2'::character varying,
    secondary_hover_color character varying(7) DEFAULT '#0c4a6e'::character varying,
    accent_color character varying(7) DEFAULT '#BF9231'::character varying,
    accent_hover_color character varying(7) DEFAULT '#a67c27'::character varying,
    gradient_start character varying(7) DEFAULT '#0f766e'::character varying,
    gradient_end character varying(7) DEFAULT '#0891b2'::character varying,
    card_background_color character varying(7) DEFAULT '#ffffff'::character varying,
    card_hover_color character varying(7) DEFAULT '#f8fafc'::character varying,
    border_color character varying(7) DEFAULT '#e2e8f0'::character varying,
    border_hover_color character varying(7) DEFAULT '#0f766e'::character varying,
    background_color character varying(7) DEFAULT '#f8fafc'::character varying,
    dark_background_color character varying(7) DEFAULT '#000000'::character varying,
    dark_primary_color character varying(7) DEFAULT '#14b8a6'::character varying,
    dark_primary_hover_color character varying(7) DEFAULT '#0d9488'::character varying,
    dark_secondary_color character varying(7) DEFAULT '#0ea5e9'::character varying,
    dark_secondary_hover_color character varying(7) DEFAULT '#0284c7'::character varying,
    dark_accent_color character varying(7) DEFAULT '#f59e0b'::character varying,
    dark_accent_hover_color character varying(7) DEFAULT '#d97706'::character varying,
    dark_card_background_color character varying(7) DEFAULT '#141414'::character varying,
    dark_card_hover_color character varying(7) DEFAULT '#282828'::character varying,
    dark_border_color character varying(7) DEFAULT '#374151'::character varying,
    dark_border_hover_color character varying(7) DEFAULT '#14b8a6'::character varying,
    dark_text_primary_color character varying(7) DEFAULT '#f1f5f9'::character varying,
    dark_text_secondary_color character varying(7) DEFAULT '#94a3b8'::character varying,
    text_primary_color character varying(7) DEFAULT '#1e293b'::character varying,
    text_secondary_color character varying(7) DEFAULT '#64748b'::character varying,
    header_background_color character varying(7) DEFAULT '#ffffff'::character varying,
    dark_header_background_color character varying(7) DEFAULT '#141414'::character varying,
    dark_mode boolean DEFAULT false,
    rtl_layout boolean DEFAULT true,
    theme_style character varying(20) DEFAULT 'glass'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appearance_settings OWNER TO neondb_owner;

--
-- Name: appearance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.appearance_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appearance_settings_id_seq OWNER TO neondb_owner;

--
-- Name: appearance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.appearance_settings_id_seq OWNED BY public.appearance_settings.id;


--
-- Name: bank_interest_rates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bank_interest_rates (
    id integer NOT NULL,
    bank_id integer NOT NULL,
    category_name text NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    years integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bank_interest_rates OWNER TO neondb_owner;

--
-- Name: bank_interest_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bank_interest_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_interest_rates_id_seq OWNER TO neondb_owner;

--
-- Name: bank_interest_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bank_interest_rates_id_seq OWNED BY public.bank_interest_rates.id;


--
-- Name: banks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.banks (
    id integer NOT NULL,
    logo text,
    bank_name text NOT NULL,
    name_en text,
    account_name text NOT NULL,
    account_number text NOT NULL,
    iban text NOT NULL,
    type text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banks OWNER TO neondb_owner;

--
-- Name: banks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.banks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banks_id_seq OWNER TO neondb_owner;

--
-- Name: banks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.banks_id_seq OWNED BY public.banks.id;


--
-- Name: color_associations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.color_associations (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text,
    trim_level text,
    color_type text NOT NULL,
    color_name text NOT NULL,
    color_code text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.color_associations OWNER TO neondb_owner;

--
-- Name: color_associations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.color_associations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_associations_id_seq OWNER TO neondb_owner;

--
-- Name: color_associations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.color_associations_id_seq OWNED BY public.color_associations.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    logo text,
    registration_number text NOT NULL,
    license_number text NOT NULL,
    tax_number text NOT NULL,
    address text NOT NULL,
    phone text,
    email text NOT NULL,
    website text,
    primary_color text DEFAULT '#00627F'::text NOT NULL,
    secondary_color text DEFAULT '#BF9231'::text NOT NULL,
    accent_color text DEFAULT '#0891b2'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    pdf_template text DEFAULT 'classic'::text NOT NULL,
    pdf_header_style text DEFAULT 'standard'::text NOT NULL,
    pdf_logo_position text DEFAULT 'left'::text NOT NULL,
    pdf_logo_size text DEFAULT 'medium'::text NOT NULL,
    pdf_font_family text DEFAULT 'Noto Sans Arabic'::text NOT NULL,
    pdf_font_size integer DEFAULT 12 NOT NULL,
    pdf_line_height text DEFAULT '1.5'::text NOT NULL,
    pdf_margin_top integer DEFAULT 20 NOT NULL,
    pdf_margin_bottom integer DEFAULT 20 NOT NULL,
    pdf_margin_left integer DEFAULT 20 NOT NULL,
    pdf_margin_right integer DEFAULT 20 NOT NULL,
    pdf_header_bg_color text DEFAULT '#ffffff'::text NOT NULL,
    pdf_header_text_color text DEFAULT '#000000'::text NOT NULL,
    pdf_table_header_bg text DEFAULT '#f8f9fa'::text NOT NULL,
    pdf_table_header_text text DEFAULT '#000000'::text NOT NULL,
    pdf_table_border_color text DEFAULT '#dee2e6'::text NOT NULL,
    pdf_accent_color text DEFAULT '#0891b2'::text NOT NULL,
    pdf_show_watermark boolean DEFAULT false NOT NULL,
    pdf_watermark_text text,
    pdf_show_qr_code boolean DEFAULT true NOT NULL,
    pdf_qr_position text DEFAULT 'top-right'::text NOT NULL,
    pdf_footer_text text,
    pdf_show_page_numbers boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: financing_calculations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financing_calculations (
    id integer NOT NULL,
    customer_name text NOT NULL,
    vehicle_price numeric(10,2) NOT NULL,
    down_payment numeric(10,2) NOT NULL,
    final_payment numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    bank_name text NOT NULL,
    interest_rate numeric(5,2) NOT NULL,
    financing_years integer NOT NULL,
    administrative_fees numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    insurance_rate numeric(5,2) DEFAULT 5.0 NOT NULL,
    monthly_payment numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    total_interest numeric(10,2) NOT NULL,
    total_insurance numeric(10,2) NOT NULL,
    chassis_number text,
    vehicle_manufacturer text,
    vehicle_category text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financing_calculations OWNER TO neondb_owner;

--
-- Name: financing_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.financing_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financing_calculations_id_seq OWNER TO neondb_owner;

--
-- Name: financing_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.financing_calculations_id_seq OWNED BY public.financing_calculations.id;


--
-- Name: financing_rates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financing_rates (
    id integer NOT NULL,
    bank_name text NOT NULL,
    bank_name_en text NOT NULL,
    bank_logo text,
    financing_type text NOT NULL,
    rates jsonb DEFAULT '[]'::jsonb NOT NULL,
    min_period integer NOT NULL,
    max_period integer NOT NULL,
    min_amount numeric(12,2) NOT NULL,
    max_amount numeric(12,2) NOT NULL,
    features text[] DEFAULT '{}'::text[],
    requirements text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financing_rates OWNER TO neondb_owner;

--
-- Name: financing_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.financing_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financing_rates_id_seq OWNER TO neondb_owner;

--
-- Name: financing_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.financing_rates_id_seq OWNED BY public.financing_rates.id;


--
-- Name: image_links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.image_links (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text,
    year integer NOT NULL,
    exterior_color text NOT NULL,
    interior_color text NOT NULL,
    engine_capacity text,
    chassis_number text,
    image_url text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.image_links OWNER TO neondb_owner;

--
-- Name: image_links_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.image_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.image_links_id_seq OWNER TO neondb_owner;

--
-- Name: image_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.image_links_id_seq OWNED BY public.image_links.id;


--
-- Name: import_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.import_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.import_types OWNER TO neondb_owner;

--
-- Name: import_types_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.import_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.import_types_id_seq OWNER TO neondb_owner;

--
-- Name: import_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.import_types_id_seq OWNED BY public.import_types.id;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text,
    engine_capacity text NOT NULL,
    year integer NOT NULL,
    exterior_color text NOT NULL,
    interior_color text NOT NULL,
    status text NOT NULL,
    import_type text NOT NULL,
    ownership_type text DEFAULT 'ملك الشركة'::text NOT NULL,
    location text NOT NULL,
    chassis_number text NOT NULL,
    images text[] DEFAULT '{}'::text[],
    logo text,
    notes text,
    detailed_specifications text,
    entry_date timestamp without time zone DEFAULT now() NOT NULL,
    price numeric(10,2),
    is_sold boolean DEFAULT false NOT NULL,
    sold_date timestamp without time zone,
    reservation_date timestamp without time zone,
    reserved_by text,
    sales_representative text,
    reservation_note text,
    customer_name text,
    customer_phone text,
    paid_amount numeric(10,2),
    sale_price numeric(10,2),
    payment_method text,
    bank_name text,
    sold_to_customer_name text,
    sold_to_customer_phone text,
    sold_by_sales_rep text,
    sale_notes text,
    mileage integer
);


ALTER TABLE public.inventory_items OWNER TO neondb_owner;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO neondb_owner;

--
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    quotation_id integer,
    quote_number text,
    inventory_item_id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text,
    year integer NOT NULL,
    exterior_color text NOT NULL,
    interior_color text NOT NULL,
    chassis_number text NOT NULL,
    engine_capacity text NOT NULL,
    specifications text,
    base_price numeric(10,2) NOT NULL,
    final_price numeric(10,2) NOT NULL,
    customer_name text NOT NULL,
    customer_phone text,
    customer_email text,
    notes text,
    status text DEFAULT 'مسودة'::text NOT NULL,
    payment_status text DEFAULT 'غير مدفوع'::text NOT NULL,
    payment_method text,
    paid_amount numeric(10,2) DEFAULT '0'::numeric,
    remaining_amount numeric(10,2),
    due_date timestamp without time zone,
    created_by text NOT NULL,
    company_data text,
    representative_data text,
    pricing_details text,
    qr_code_data text,
    authorization_number text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO neondb_owner;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_name text NOT NULL,
    request_type text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    duration integer NOT NULL,
    duration_type text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_by integer NOT NULL,
    requested_by_name text NOT NULL,
    approved_by integer,
    approved_by_name text,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leave_requests OWNER TO neondb_owner;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO neondb_owner;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: location_transfers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.location_transfers (
    id integer NOT NULL,
    inventory_item_id integer NOT NULL,
    from_location text NOT NULL,
    to_location text NOT NULL,
    transfer_date timestamp without time zone DEFAULT now() NOT NULL,
    reason text,
    transferred_by text,
    notes text
);


ALTER TABLE public.location_transfers OWNER TO neondb_owner;

--
-- Name: location_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.location_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_transfers_id_seq OWNER TO neondb_owner;

--
-- Name: location_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.location_transfers_id_seq OWNED BY public.location_transfers.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    manager text,
    phone text,
    capacity integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.locations OWNER TO neondb_owner;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO neondb_owner;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: low_stock_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.low_stock_alerts (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    current_stock integer NOT NULL,
    min_stock_level integer DEFAULT 5 NOT NULL,
    alert_level text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.low_stock_alerts OWNER TO neondb_owner;

--
-- Name: low_stock_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.low_stock_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.low_stock_alerts_id_seq OWNER TO neondb_owner;

--
-- Name: low_stock_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.low_stock_alerts_id_seq OWNED BY public.low_stock_alerts.id;


--
-- Name: manufacturers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.manufacturers (
    id integer NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    logo text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.manufacturers OWNER TO neondb_owner;

--
-- Name: manufacturers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.manufacturers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.manufacturers_id_seq OWNER TO neondb_owner;

--
-- Name: manufacturers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.manufacturers_id_seq OWNED BY public.manufacturers.id;


--
-- Name: ownership_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ownership_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ownership_types OWNER TO neondb_owner;

--
-- Name: ownership_types_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.ownership_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ownership_types_id_seq OWNER TO neondb_owner;

--
-- Name: ownership_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.ownership_types_id_seq OWNED BY public.ownership_types.id;


--
-- Name: pdf_appearance_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pdf_appearance_settings (
    id integer NOT NULL,
    header_background_color text DEFAULT '#0f766e'::text NOT NULL,
    header_text_color text DEFAULT '#ffffff'::text NOT NULL,
    logo_background_color text DEFAULT '#ffffff'::text NOT NULL,
    table_header_background_color text DEFAULT '#f8fafc'::text NOT NULL,
    table_header_text_color text DEFAULT '#1e293b'::text NOT NULL,
    table_row_background_color text DEFAULT '#ffffff'::text NOT NULL,
    table_row_text_color text DEFAULT '#1e293b'::text NOT NULL,
    table_alternate_row_background_color text DEFAULT '#f8fafc'::text NOT NULL,
    table_border_color text DEFAULT '#e2e8f0'::text NOT NULL,
    primary_text_color text DEFAULT '#1e293b'::text NOT NULL,
    secondary_text_color text DEFAULT '#64748b'::text NOT NULL,
    price_text_color text DEFAULT '#059669'::text NOT NULL,
    total_text_color text DEFAULT '#dc2626'::text NOT NULL,
    border_color text DEFAULT '#e2e8f0'::text NOT NULL,
    background_color text DEFAULT '#ffffff'::text NOT NULL,
    section_background_color text DEFAULT '#f8fafc'::text NOT NULL,
    company_stamp text,
    watermark_opacity numeric(3,2) DEFAULT 0.10 NOT NULL,
    footer_background_color text DEFAULT '#f8fafc'::text NOT NULL,
    footer_text_color text DEFAULT '#64748b'::text NOT NULL,
    qr_code_background_color text DEFAULT '#ffffff'::text NOT NULL,
    qr_code_foreground_color text DEFAULT '#000000'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pdf_appearance_settings OWNER TO neondb_owner;

--
-- Name: pdf_appearance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pdf_appearance_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pdf_appearance_settings_id_seq OWNER TO neondb_owner;

--
-- Name: pdf_appearance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pdf_appearance_settings_id_seq OWNED BY public.pdf_appearance_settings.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quote_number text NOT NULL,
    inventory_item_id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text,
    year integer NOT NULL,
    exterior_color text NOT NULL,
    interior_color text NOT NULL,
    chassis_number text NOT NULL,
    engine_capacity text NOT NULL,
    specifications text,
    base_price numeric(10,2) NOT NULL,
    final_price numeric(10,2) NOT NULL,
    customer_name text NOT NULL,
    customer_phone text,
    customer_email text,
    customer_title text,
    notes text,
    valid_until timestamp without time zone DEFAULT (now() + '30 days'::interval),
    status text DEFAULT 'مسودة'::text NOT NULL,
    created_by text NOT NULL,
    company_data text,
    representative_data text,
    quote_appearance text,
    pricing_details text,
    qr_code_data text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quotations OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotations_id_seq OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: specifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.specifications (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text,
    year integer NOT NULL,
    engine_capacity text NOT NULL,
    chassis_number text,
    engine_type text,
    horsepower text,
    torque text,
    transmission text,
    fuel_type text,
    fuel_consumption text,
    drivetrain text,
    acceleration text,
    top_speed text,
    length text,
    width text,
    height text,
    wheelbase text,
    curb_weight text,
    gross_weight text,
    load_capacity text,
    seating_capacity text,
    safety_features text,
    comfort_features text,
    infotainment text,
    driver_assistance text,
    exterior_features text,
    interior_features text,
    tire_size text,
    suspension text,
    brakes text,
    steering text,
    ground_clearance text,
    warranty text,
    notes text,
    detailed_description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.specifications OWNER TO neondb_owner;

--
-- Name: specifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.specifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specifications_id_seq OWNER TO neondb_owner;

--
-- Name: specifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.specifications_id_seq OWNED BY public.specifications.id;


--
-- Name: stock_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_settings (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    min_stock_level integer DEFAULT 5 NOT NULL,
    low_stock_threshold integer DEFAULT 3 NOT NULL,
    critical_stock_threshold integer DEFAULT 1 NOT NULL,
    auto_reorder_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_settings OWNER TO neondb_owner;

--
-- Name: stock_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_settings_id_seq OWNER TO neondb_owner;

--
-- Name: stock_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_settings_id_seq OWNED BY public.stock_settings.id;


--
-- Name: terms_and_conditions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.terms_and_conditions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.terms_and_conditions OWNER TO neondb_owner;

--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.terms_and_conditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.terms_and_conditions_id_seq OWNER TO neondb_owner;

--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.terms_and_conditions_id_seq OWNED BY public.terms_and_conditions.id;


--
-- Name: trim_levels; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.trim_levels (
    id integer NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    trim_level text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.trim_levels OWNER TO neondb_owner;

--
-- Name: trim_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.trim_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trim_levels_id_seq OWNER TO neondb_owner;

--
-- Name: trim_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.trim_levels_id_seq OWNED BY public.trim_levels.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    login_time timestamp without time zone DEFAULT now() NOT NULL,
    logout_time timestamp without time zone,
    ip_address text,
    user_agent text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    job_title text NOT NULL,
    phone_number text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'seller'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicle_categories (
    id integer NOT NULL,
    manufacturer_id integer NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicle_categories OWNER TO neondb_owner;

--
-- Name: vehicle_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vehicle_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_categories_id_seq OWNER TO neondb_owner;

--
-- Name: vehicle_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vehicle_categories_id_seq OWNED BY public.vehicle_categories.id;


--
-- Name: vehicle_statuses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicle_statuses (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6b7280'::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vehicle_statuses OWNER TO neondb_owner;

--
-- Name: vehicle_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vehicle_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_statuses_id_seq OWNER TO neondb_owner;

--
-- Name: vehicle_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vehicle_statuses_id_seq OWNED BY public.vehicle_statuses.id;


--
-- Name: vehicle_trim_levels; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicle_trim_levels (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicle_trim_levels OWNER TO neondb_owner;

--
-- Name: vehicle_trim_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vehicle_trim_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_trim_levels_id_seq OWNER TO neondb_owner;

--
-- Name: vehicle_trim_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vehicle_trim_levels_id_seq OWNED BY public.vehicle_trim_levels.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: appearance_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appearance_settings ALTER COLUMN id SET DEFAULT nextval('public.appearance_settings_id_seq'::regclass);


--
-- Name: bank_interest_rates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_interest_rates ALTER COLUMN id SET DEFAULT nextval('public.bank_interest_rates_id_seq'::regclass);


--
-- Name: banks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banks ALTER COLUMN id SET DEFAULT nextval('public.banks_id_seq'::regclass);


--
-- Name: color_associations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.color_associations ALTER COLUMN id SET DEFAULT nextval('public.color_associations_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: financing_calculations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financing_calculations ALTER COLUMN id SET DEFAULT nextval('public.financing_calculations_id_seq'::regclass);


--
-- Name: financing_rates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financing_rates ALTER COLUMN id SET DEFAULT nextval('public.financing_rates_id_seq'::regclass);


--
-- Name: image_links id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.image_links ALTER COLUMN id SET DEFAULT nextval('public.image_links_id_seq'::regclass);


--
-- Name: import_types id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_types ALTER COLUMN id SET DEFAULT nextval('public.import_types_id_seq'::regclass);


--
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: location_transfers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_transfers ALTER COLUMN id SET DEFAULT nextval('public.location_transfers_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: low_stock_alerts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.low_stock_alerts ALTER COLUMN id SET DEFAULT nextval('public.low_stock_alerts_id_seq'::regclass);


--
-- Name: manufacturers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manufacturers ALTER COLUMN id SET DEFAULT nextval('public.manufacturers_id_seq'::regclass);


--
-- Name: ownership_types id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ownership_types ALTER COLUMN id SET DEFAULT nextval('public.ownership_types_id_seq'::regclass);


--
-- Name: pdf_appearance_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pdf_appearance_settings ALTER COLUMN id SET DEFAULT nextval('public.pdf_appearance_settings_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: specifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.specifications ALTER COLUMN id SET DEFAULT nextval('public.specifications_id_seq'::regclass);


--
-- Name: stock_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_settings ALTER COLUMN id SET DEFAULT nextval('public.stock_settings_id_seq'::regclass);


--
-- Name: terms_and_conditions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.terms_and_conditions ALTER COLUMN id SET DEFAULT nextval('public.terms_and_conditions_id_seq'::regclass);


--
-- Name: trim_levels id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trim_levels ALTER COLUMN id SET DEFAULT nextval('public.trim_levels_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_categories ALTER COLUMN id SET DEFAULT nextval('public.vehicle_categories_id_seq'::regclass);


--
-- Name: vehicle_statuses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_statuses ALTER COLUMN id SET DEFAULT nextval('public.vehicle_statuses_id_seq'::regclass);


--
-- Name: vehicle_trim_levels id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_trim_levels ALTER COLUMN id SET DEFAULT nextval('public.vehicle_trim_levels_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, "timestamp", ip_address) FROM stdin;
\.


--
-- Data for Name: appearance_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appearance_settings (id, company_name, company_name_en, company_address, company_registration_number, company_license_number, company_tax_number, company_website, company_logo, primary_color, primary_hover_color, secondary_color, secondary_hover_color, accent_color, accent_hover_color, gradient_start, gradient_end, card_background_color, card_hover_color, border_color, border_hover_color, background_color, dark_background_color, dark_primary_color, dark_primary_hover_color, dark_secondary_color, dark_secondary_hover_color, dark_accent_color, dark_accent_hover_color, dark_card_background_color, dark_card_hover_color, dark_border_color, dark_border_hover_color, dark_text_primary_color, dark_text_secondary_color, text_primary_color, text_secondary_color, header_background_color, dark_header_background_color, dark_mode, rtl_layout, theme_style, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bank_interest_rates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bank_interest_rates (id, bank_id, category_name, interest_rate, years, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: banks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.banks (id, logo, bank_name, name_en, account_name, account_number, iban, type, is_active, created_at, updated_at) FROM stdin;
1	/rajhi.png	مصرف الراجحي	Al Rajhi Bank	شركة البريمي للسيارات	575608010000904	SA8080000575608010000904	شركة	t	2025-08-02 17:27:18.867643	2025-08-02 17:27:18.867643
2	/snb.png	البنك الأهلي السعودي	Saudi National Bank	شركة البريمي للسيارات	25268400000102	SA5110000025268400000102	شركة	t	2025-08-02 17:27:19.014084	2025-08-02 17:27:19.014084
3	/aljazira.png	بنك الجزيرة	Bank AlJazira	شركة البريمي للسيارات	030495028555001	SA7060100030495028555001	شركة	t	2025-08-02 17:27:19.158791	2025-08-02 17:27:19.158791
4	/albilad.png	بنك البلاد	Bank Albilad	شركة البريمي للسيارات	448888888780008	SA1315000448888888780008	شركة	t	2025-08-02 17:27:19.303409	2025-08-02 17:27:19.303409
5	/anb.png	البنك العربي الوطني	Arab National Bank	شركة البريمي للسيارات	0108095322110019	SA0000000000000000000000	شركة	t	2025-08-02 17:27:19.448038	2025-08-02 17:27:19.448038
6	/emirates.png	بنك الإمارات دبي الوطني	Emirates NBD	شركة البريمي للسيارات	1016050175301	SA4095000001016050175301	شركة	t	2025-08-02 17:27:19.593002	2025-08-02 17:27:19.593002
7	/riyad.png	بنك الرياض	Riyad Bank	شركة البريمي للسيارات	2383212779940	SA1420000002383212779940	شركة	t	2025-08-02 17:27:19.737651	2025-08-02 17:27:19.737651
8	/alinma.png	مصرف الإنماء	Bank Alinma	شركة البريمي للسيارات	68201863704000	SA9605000068201863704000	شركة	t	2025-08-02 17:27:19.887837	2025-08-02 17:27:19.887837
9	/sab.png	البنك السعودي الأول (SAB)	Saudi Awwal Bank (SAB)	شركة معرض البريمي للسيارات	822173787001	SA6445000000822173787001	شركة	t	2025-08-02 17:27:20.03116	2025-08-02 17:27:20.03116
10	/sfb.png	البنك السعودي الفرنسي	Saudi French Bank	شركة البريمي للسيارات	97844900167	SA5655000000097844900167	شركة	t	2025-08-02 17:27:20.176471	2025-08-02 17:27:20.176471
\.


--
-- Data for Name: color_associations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.color_associations (id, manufacturer, category, trim_level, color_type, color_name, color_code, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, name, logo, registration_number, license_number, tax_number, address, phone, email, website, primary_color, secondary_color, accent_color, is_active, pdf_template, pdf_header_style, pdf_logo_position, pdf_logo_size, pdf_font_family, pdf_font_size, pdf_line_height, pdf_margin_top, pdf_margin_bottom, pdf_margin_left, pdf_margin_right, pdf_header_bg_color, pdf_header_text_color, pdf_table_header_bg, pdf_table_header_text, pdf_table_border_color, pdf_accent_color, pdf_show_watermark, pdf_watermark_text, pdf_show_qr_code, pdf_qr_position, pdf_footer_text, pdf_show_page_numbers, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financing_calculations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financing_calculations (id, customer_name, vehicle_price, down_payment, final_payment, bank_name, interest_rate, financing_years, administrative_fees, insurance_rate, monthly_payment, total_amount, total_interest, total_insurance, chassis_number, vehicle_manufacturer, vehicle_category, notes, created_at) FROM stdin;
\.


--
-- Data for Name: financing_rates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financing_rates (id, bank_name, bank_name_en, bank_logo, financing_type, rates, min_period, max_period, min_amount, max_amount, features, requirements, is_active, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: image_links; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.image_links (id, manufacturer, category, trim_level, year, exterior_color, interior_color, engine_capacity, chassis_number, image_url, description, created_at) FROM stdin;
\.


--
-- Data for Name: import_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.import_types (id, name, description, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory_items (id, manufacturer, category, trim_level, engine_capacity, year, exterior_color, interior_color, status, import_type, ownership_type, location, chassis_number, images, logo, notes, detailed_specifications, entry_date, price, is_sold, sold_date, reservation_date, reserved_by, sales_representative, reservation_note, customer_name, customer_phone, paid_amount, sale_price, payment_method, bank_name, sold_to_customer_name, sold_to_customer_phone, sold_by_sales_rep, sale_notes, mileage) FROM stdin;
1	تويوتا	كامري	GLE	2.5L	2023	أبيض	بيج	متوفر	شركة	ملك الشركة	المعرض	JTDBE32K123456789	{}	\N	\N	\N	2025-08-02 17:28:19.825669	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2	تويوتا	كامري	GLX	2.5L	2023	أسود	أسود	في الطريق	شخصي	ملك الشركة	الميناء	JTDBE32K987654321	{}	\N	\N	\N	2025-08-02 17:28:19.971226	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3	تويوتا	كامري	LE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000001	{}	\N	سيارة تويوتا كامري LE	{"brand_english":"Toyota","model_english":"Camry","trim_english":"LE","imported_from":"cars.json"}	2025-08-02 17:28:20.116943	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4	تويوتا	كامري	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000002	{}	\N	سيارة تويوتا كامري SE	{"brand_english":"Toyota","model_english":"Camry","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:28:20.262095	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5	تويوتا	كامري	XLE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000003	{}	\N	سيارة تويوتا كامري XLE	{"brand_english":"Toyota","model_english":"Camry","trim_english":"XLE","imported_from":"cars.json"}	2025-08-02 17:28:20.407188	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6	تويوتا	كامري	XSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000004	{}	\N	سيارة تويوتا كامري XSE	{"brand_english":"Toyota","model_english":"Camry","trim_english":"XSE","imported_from":"cars.json"}	2025-08-02 17:28:20.552403	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7	تويوتا	كامري	TRD	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000005	{}	\N	سيارة تويوتا كامري TRD	{"brand_english":"Toyota","model_english":"Camry","trim_english":"TRD","imported_from":"cars.json"}	2025-08-02 17:28:20.697771	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8	تويوتا	كورولا	L	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000006	{}	\N	سيارة تويوتا كورولا L	{"brand_english":"Toyota","model_english":"Corolla","trim_english":"L","imported_from":"cars.json"}	2025-08-02 17:28:20.842788	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9	تويوتا	كورولا	LE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000007	{}	\N	سيارة تويوتا كورولا LE	{"brand_english":"Toyota","model_english":"Corolla","trim_english":"LE","imported_from":"cars.json"}	2025-08-02 17:28:20.987211	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10	تويوتا	كورولا	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000008	{}	\N	سيارة تويوتا كورولا SE	{"brand_english":"Toyota","model_english":"Corolla","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:28:21.1316	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
11	تويوتا	كورولا	XSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000009	{}	\N	سيارة تويوتا كورولا XSE	{"brand_english":"Toyota","model_english":"Corolla","trim_english":"XSE","imported_from":"cars.json"}	2025-08-02 17:28:21.278187	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12	تويوتا	كورولا	نايت شيد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000010	{}	\N	سيارة تويوتا كورولا نايت شيد	{"brand_english":"Toyota","model_english":"Corolla","trim_english":"Nightshade","imported_from":"cars.json"}	2025-08-02 17:28:21.423385	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
13	تويوتا	راف4	LE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000011	{}	\N	سيارة تويوتا راف4 LE	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"LE","imported_from":"cars.json"}	2025-08-02 17:28:21.568874	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
14	تويوتا	راف4	XLE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000012	{}	\N	سيارة تويوتا راف4 XLE	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"XLE","imported_from":"cars.json"}	2025-08-02 17:28:21.713683	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15	تويوتا	راف4	XLE بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000013	{}	\N	سيارة تويوتا راف4 XLE بريميوم	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"XLE Premium","imported_from":"cars.json"}	2025-08-02 17:28:21.859173	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
16	تويوتا	راف4	أدفينشر	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000014	{}	\N	سيارة تويوتا راف4 أدفينشر	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"Adventure","imported_from":"cars.json"}	2025-08-02 17:28:22.003185	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
17	تويوتا	راف4	TRD أوف-رود	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000015	{}	\N	سيارة تويوتا راف4 TRD أوف-رود	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"TRD Off-Road","imported_from":"cars.json"}	2025-08-02 17:28:22.149777	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18	تويوتا	راف4	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000016	{}	\N	سيارة تويوتا راف4 ليميتد	{"brand_english":"Toyota","model_english":"RAV4","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:28:22.294541	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
19	تويوتا	لاند كروزر	GX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000017	{}	\N	سيارة تويوتا لاند كروزر GX	{"brand_english":"Toyota","model_english":"Land Cruiser","trim_english":"GX","imported_from":"cars.json"}	2025-08-02 17:28:22.439901	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20	تويوتا	لاند كروزر	GXR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000018	{}	\N	سيارة تويوتا لاند كروزر GXR	{"brand_english":"Toyota","model_english":"Land Cruiser","trim_english":"GXR","imported_from":"cars.json"}	2025-08-02 17:28:22.585723	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
21	تويوتا	لاند كروزر	VXR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000019	{}	\N	سيارة تويوتا لاند كروزر VXR	{"brand_english":"Toyota","model_english":"Land Cruiser","trim_english":"VXR","imported_from":"cars.json"}	2025-08-02 17:28:22.730847	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
22	تويوتا	هايلوكس	كبينة واحدة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000020	{}	\N	سيارة تويوتا هايلوكس كبينة واحدة	{"brand_english":"Toyota","model_english":"Hilux","trim_english":"Single Cab","imported_from":"cars.json"}	2025-08-02 17:28:22.875729	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
23	تويوتا	هايلوكس	كبينة مزدوجة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000021	{}	\N	سيارة تويوتا هايلوكس كبينة مزدوجة	{"brand_english":"Toyota","model_english":"Hilux","trim_english":"Double Cab","imported_from":"cars.json"}	2025-08-02 17:28:23.020435	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
24	تويوتا	هايلوكس	GL	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000022	{}	\N	سيارة تويوتا هايلوكس GL	{"brand_english":"Toyota","model_english":"Hilux","trim_english":"GL","imported_from":"cars.json"}	2025-08-02 17:28:23.167099	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
25	تويوتا	هايلوكس	GLX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000023	{}	\N	سيارة تويوتا هايلوكس GLX	{"brand_english":"Toyota","model_english":"Hilux","trim_english":"GLX","imported_from":"cars.json"}	2025-08-02 17:28:23.311179	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
26	تويوتا	هايلوكس	SR5	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000024	{}	\N	سيارة تويوتا هايلوكس SR5	{"brand_english":"Toyota","model_english":"Hilux","trim_english":"SR5","imported_from":"cars.json"}	2025-08-02 17:28:23.458164	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
27	تويوتا	سوبرا	2.0	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000025	{}	\N	سيارة تويوتا سوبرا 2.0	{"brand_english":"Toyota","model_english":"Supra","trim_english":"2.0","imported_from":"cars.json"}	2025-08-02 17:28:23.603095	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
28	تويوتا	سوبرا	3.0	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000026	{}	\N	سيارة تويوتا سوبرا 3.0	{"brand_english":"Toyota","model_english":"Supra","trim_english":"3.0","imported_from":"cars.json"}	2025-08-02 17:28:23.748279	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
29	تويوتا	سوبرا	3.0 بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000027	{}	\N	سيارة تويوتا سوبرا 3.0 بريميوم	{"brand_english":"Toyota","model_english":"Supra","trim_english":"3.0 Premium","imported_from":"cars.json"}	2025-08-02 17:28:23.893218	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
30	لكزس	ES	ES 250	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000028	{}	\N	سيارة لكزس ES ES 250	{"brand_english":"Lexus","model_english":"ES","trim_english":"ES 250","imported_from":"cars.json"}	2025-08-02 17:28:24.038525	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
31	لكزس	ES	ES 350	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000029	{}	\N	سيارة لكزس ES ES 350	{"brand_english":"Lexus","model_english":"ES","trim_english":"ES 350","imported_from":"cars.json"}	2025-08-02 17:28:24.182088	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
32	لكزس	ES	ES 300h	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000030	{}	\N	سيارة لكزس ES ES 300h	{"brand_english":"Lexus","model_english":"ES","trim_english":"ES 300h","imported_from":"cars.json"}	2025-08-02 17:28:24.326829	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
33	لكزس	ES	لكجري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000031	{}	\N	سيارة لكزس ES لكجري	{"brand_english":"Lexus","model_english":"ES","trim_english":"Luxury","imported_from":"cars.json"}	2025-08-02 17:28:24.489777	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
34	لكزس	ES	F سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000032	{}	\N	سيارة لكزس ES F سبورت	{"brand_english":"Lexus","model_english":"ES","trim_english":"F Sport","imported_from":"cars.json"}	2025-08-02 17:28:24.634492	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
35	لكزس	ES	ألترا لكجري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000033	{}	\N	سيارة لكزس ES ألترا لكجري	{"brand_english":"Lexus","model_english":"ES","trim_english":"Ultra Luxury","imported_from":"cars.json"}	2025-08-02 17:28:24.779455	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
36	لكزس	RX	RX 350	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000034	{}	\N	سيارة لكزس RX RX 350	{"brand_english":"Lexus","model_english":"RX","trim_english":"RX 350","imported_from":"cars.json"}	2025-08-02 17:28:24.924676	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37	لكزس	RX	RX 450h	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000035	{}	\N	سيارة لكزس RX RX 450h	{"brand_english":"Lexus","model_english":"RX","trim_english":"RX 450h","imported_from":"cars.json"}	2025-08-02 17:28:25.07019	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
38	لكزس	RX	RX 500h	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000036	{}	\N	سيارة لكزس RX RX 500h	{"brand_english":"Lexus","model_english":"RX","trim_english":"RX 500h","imported_from":"cars.json"}	2025-08-02 17:28:25.21512	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
39	لكزس	RX	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000037	{}	\N	سيارة لكزس RX ستاندرد	{"brand_english":"Lexus","model_english":"RX","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:28:25.360711	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
40	لكزس	RX	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000038	{}	\N	سيارة لكزس RX بريميوم	{"brand_english":"Lexus","model_english":"RX","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:28:25.506383	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
41	لكزس	RX	F سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000039	{}	\N	سيارة لكزس RX F سبورت	{"brand_english":"Lexus","model_english":"RX","trim_english":"F Sport","imported_from":"cars.json"}	2025-08-02 17:28:25.652059	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42	لكزس	RX	لكجري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000040	{}	\N	سيارة لكزس RX لكجري	{"brand_english":"Lexus","model_english":"RX","trim_english":"Luxury","imported_from":"cars.json"}	2025-08-02 17:28:25.796176	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43	لكزس	GX	GX 460	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000041	{}	\N	سيارة لكزس GX GX 460	{"brand_english":"Lexus","model_english":"GX","trim_english":"GX 460","imported_from":"cars.json"}	2025-08-02 17:28:25.95393	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
44	لكزس	GX	GX 550	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000042	{}	\N	سيارة لكزس GX GX 550	{"brand_english":"Lexus","model_english":"GX","trim_english":"GX 550","imported_from":"cars.json"}	2025-08-02 17:28:26.098961	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
45	لكزس	GX	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000043	{}	\N	سيارة لكزس GX بريميوم	{"brand_english":"Lexus","model_english":"GX","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:28:26.243687	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
46	لكزس	GX	لكجري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000044	{}	\N	سيارة لكزس GX لكجري	{"brand_english":"Lexus","model_english":"GX","trim_english":"Luxury","imported_from":"cars.json"}	2025-08-02 17:28:26.388925	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
47	لكزس	GX	أوفر تريل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000045	{}	\N	سيارة لكزس GX أوفر تريل	{"brand_english":"Lexus","model_english":"GX","trim_english":"Overtrail","imported_from":"cars.json"}	2025-08-02 17:28:26.534173	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
48	لكزس	LX	LX 600	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000046	{}	\N	سيارة لكزس LX LX 600	{"brand_english":"Lexus","model_english":"LX","trim_english":"LX 600","imported_from":"cars.json"}	2025-08-02 17:28:26.678192	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49	لكزس	LX	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000047	{}	\N	سيارة لكزس LX ستاندرد	{"brand_english":"Lexus","model_english":"LX","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:28:26.822154	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
50	لكزس	LX	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000048	{}	\N	سيارة لكزس LX بريميوم	{"brand_english":"Lexus","model_english":"LX","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:28:26.967512	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
51	لكزس	LX	F سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000049	{}	\N	سيارة لكزس LX F سبورت	{"brand_english":"Lexus","model_english":"LX","trim_english":"F Sport","imported_from":"cars.json"}	2025-08-02 17:28:27.113116	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
52	لكزس	LX	ألترا لكجري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000050	{}	\N	سيارة لكزس LX ألترا لكجري	{"brand_english":"Lexus","model_english":"LX","trim_english":"Ultra Luxury","imported_from":"cars.json"}	2025-08-02 17:28:27.258393	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
53	فورد	F-150	XL	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000051	{}	\N	سيارة فورد F-150 XL	{"brand_english":"Ford","model_english":"F-150","trim_english":"XL","imported_from":"cars.json"}	2025-08-02 17:28:27.402133	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54	فورد	F-150	XLT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000052	{}	\N	سيارة فورد F-150 XLT	{"brand_english":"Ford","model_english":"F-150","trim_english":"XLT","imported_from":"cars.json"}	2025-08-02 17:28:27.547603	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55	فورد	F-150	لاريات	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000053	{}	\N	سيارة فورد F-150 لاريات	{"brand_english":"Ford","model_english":"F-150","trim_english":"Lariat","imported_from":"cars.json"}	2025-08-02 17:28:27.692666	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
56	فورد	F-150	كينج رانش	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000054	{}	\N	سيارة فورد F-150 كينج رانش	{"brand_english":"Ford","model_english":"F-150","trim_english":"King Ranch","imported_from":"cars.json"}	2025-08-02 17:28:27.837912	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
57	فورد	F-150	بلاتينيوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000055	{}	\N	سيارة فورد F-150 بلاتينيوم	{"brand_english":"Ford","model_english":"F-150","trim_english":"Platinum","imported_from":"cars.json"}	2025-08-02 17:28:27.985329	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
58	فورد	F-150	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000056	{}	\N	سيارة فورد F-150 ليميتد	{"brand_english":"Ford","model_english":"F-150","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:28:28.129229	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
59	فورد	F-150	رابتور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000057	{}	\N	سيارة فورد F-150 رابتور	{"brand_english":"Ford","model_english":"F-150","trim_english":"Raptor","imported_from":"cars.json"}	2025-08-02 17:28:28.274707	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
60	فورد	موستانج	إيكوبوست	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000058	{}	\N	سيارة فورد موستانج إيكوبوست	{"brand_english":"Ford","model_english":"Mustang","trim_english":"EcoBoost","imported_from":"cars.json"}	2025-08-02 17:28:28.419493	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
61	فورد	موستانج	GT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000059	{}	\N	سيارة فورد موستانج GT	{"brand_english":"Ford","model_english":"Mustang","trim_english":"GT","imported_from":"cars.json"}	2025-08-02 17:28:28.565194	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
62	فورد	موستانج	دارك هورس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000060	{}	\N	سيارة فورد موستانج دارك هورس	{"brand_english":"Ford","model_english":"Mustang","trim_english":"Dark Horse","imported_from":"cars.json"}	2025-08-02 17:28:28.70998	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
63	فورد	موستانج	شيلبي GT500	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000061	{}	\N	سيارة فورد موستانج شيلبي GT500	{"brand_english":"Ford","model_english":"Mustang","trim_english":"Shelby GT500","imported_from":"cars.json"}	2025-08-02 17:28:28.855208	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
64	فورد	إكسبلورر	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000062	{}	\N	سيارة فورد إكسبلورر بيز	{"brand_english":"Ford","model_english":"Explorer","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:28:29.000161	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
65	فورد	إكسبلورر	XLT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000063	{}	\N	سيارة فورد إكسبلورر XLT	{"brand_english":"Ford","model_english":"Explorer","trim_english":"XLT","imported_from":"cars.json"}	2025-08-02 17:28:29.145666	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
66	فورد	إكسبلورر	ST-لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000064	{}	\N	سيارة فورد إكسبلورر ST-لاين	{"brand_english":"Ford","model_english":"Explorer","trim_english":"ST-Line","imported_from":"cars.json"}	2025-08-02 17:28:29.356696	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
67	فورد	إكسبلورر	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000065	{}	\N	سيارة فورد إكسبلورر ليميتد	{"brand_english":"Ford","model_english":"Explorer","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:28:29.502076	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
68	فورد	إكسبلورر	ST	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000066	{}	\N	سيارة فورد إكسبلورر ST	{"brand_english":"Ford","model_english":"Explorer","trim_english":"ST","imported_from":"cars.json"}	2025-08-02 17:28:29.647239	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
69	فورد	إكسبلورر	بلاتينيوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000067	{}	\N	سيارة فورد إكسبلورر بلاتينيوم	{"brand_english":"Ford","model_english":"Explorer","trim_english":"Platinum","imported_from":"cars.json"}	2025-08-02 17:28:29.791864	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
70	فورد	إكسبلورر	تيمبرلاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000068	{}	\N	سيارة فورد إكسبلورر تيمبرلاين	{"brand_english":"Ford","model_english":"Explorer","trim_english":"Timberline","imported_from":"cars.json"}	2025-08-02 17:28:29.936674	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
71	فورد	برونكو	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000069	{}	\N	سيارة فورد برونكو بيز	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:28:30.081833	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
72	فورد	برونكو	بيج بيند	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000070	{}	\N	سيارة فورد برونكو بيج بيند	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Big Bend","imported_from":"cars.json"}	2025-08-02 17:28:30.229057	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
73	فورد	برونكو	بلاك دايموند	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000071	{}	\N	سيارة فورد برونكو بلاك دايموند	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Black Diamond","imported_from":"cars.json"}	2025-08-02 17:28:30.373122	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
74	فورد	برونكو	أوتر بانكس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000072	{}	\N	سيارة فورد برونكو أوتر بانكس	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Outer Banks","imported_from":"cars.json"}	2025-08-02 17:28:30.517842	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
75	فورد	برونكو	باد لاندز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000073	{}	\N	سيارة فورد برونكو باد لاندز	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Badlands","imported_from":"cars.json"}	2025-08-02 17:28:30.664073	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
76	فورد	برونكو	وايلدتراك	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000074	{}	\N	سيارة فورد برونكو وايلدتراك	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Wildtrak","imported_from":"cars.json"}	2025-08-02 17:28:30.808845	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
77	فورد	برونكو	رابتور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000075	{}	\N	سيارة فورد برونكو رابتور	{"brand_english":"Ford","model_english":"Bronco","trim_english":"Raptor","imported_from":"cars.json"}	2025-08-02 17:28:30.953749	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
78	جاكوار	F-PACE	P250 S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000076	{}	\N	سيارة جاكوار F-PACE P250 S	{"brand_english":"Jaguar","model_english":"F-PACE","trim_english":"P250 S","imported_from":"cars.json"}	2025-08-02 17:28:31.099126	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
79	جاكوار	F-PACE	P250 SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000077	{}	\N	سيارة جاكوار F-PACE P250 SE	{"brand_english":"Jaguar","model_english":"F-PACE","trim_english":"P250 SE","imported_from":"cars.json"}	2025-08-02 17:28:31.243859	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
80	جاكوار	F-PACE	P400 R-Dynamic S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000078	{}	\N	سيارة جاكوار F-PACE P400 R-Dynamic S	{"brand_english":"Jaguar","model_english":"F-PACE","trim_english":"P400 R-Dynamic S","imported_from":"cars.json"}	2025-08-02 17:28:31.389068	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
81	جاكوار	F-PACE	P400 R-Dynamic SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000079	{}	\N	سيارة جاكوار F-PACE P400 R-Dynamic SE	{"brand_english":"Jaguar","model_english":"F-PACE","trim_english":"P400 R-Dynamic SE","imported_from":"cars.json"}	2025-08-02 17:28:31.534805	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
82	جاكوار	F-PACE	SVR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000080	{}	\N	سيارة جاكوار F-PACE SVR	{"brand_english":"Jaguar","model_english":"F-PACE","trim_english":"SVR","imported_from":"cars.json"}	2025-08-02 17:28:31.679959	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
83	جاكوار	XF	P250 S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000081	{}	\N	سيارة جاكوار XF P250 S	{"brand_english":"Jaguar","model_english":"XF","trim_english":"P250 S","imported_from":"cars.json"}	2025-08-02 17:28:31.825255	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
84	جاكوار	XF	P250 SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000082	{}	\N	سيارة جاكوار XF P250 SE	{"brand_english":"Jaguar","model_english":"XF","trim_english":"P250 SE","imported_from":"cars.json"}	2025-08-02 17:28:31.970118	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
85	جاكوار	XF	P300 R-Dynamic S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000083	{}	\N	سيارة جاكوار XF P300 R-Dynamic S	{"brand_english":"Jaguar","model_english":"XF","trim_english":"P300 R-Dynamic S","imported_from":"cars.json"}	2025-08-02 17:28:32.115086	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
86	جاكوار	XF	P300 R-Dynamic SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000084	{}	\N	سيارة جاكوار XF P300 R-Dynamic SE	{"brand_english":"Jaguar","model_english":"XF","trim_english":"P300 R-Dynamic SE","imported_from":"cars.json"}	2025-08-02 17:28:32.259373	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
87	جاكوار	F-TYPE	P450 R-Dynamic	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000085	{}	\N	سيارة جاكوار F-TYPE P450 R-Dynamic	{"brand_english":"Jaguar","model_english":"F-TYPE","trim_english":"P450 R-Dynamic","imported_from":"cars.json"}	2025-08-02 17:28:32.403997	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
88	جاكوار	F-TYPE	P575 R	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000086	{}	\N	سيارة جاكوار F-TYPE P575 R	{"brand_english":"Jaguar","model_english":"F-TYPE","trim_english":"P575 R","imported_from":"cars.json"}	2025-08-02 17:28:32.553943	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
89	جاكوار	F-TYPE	75	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000087	{}	\N	سيارة جاكوار F-TYPE 75	{"brand_english":"Jaguar","model_english":"F-TYPE","trim_english":"75","imported_from":"cars.json"}	2025-08-02 17:28:32.698212	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
90	دفندر	ديفندر 90	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000088	{}	\N	سيارة دفندر ديفندر 90 S	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:28:32.84353	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
91	دفندر	ديفندر 90	X-ديناميك S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000089	{}	\N	سيارة دفندر ديفندر 90 X-ديناميك S	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"X-Dynamic S","imported_from":"cars.json"}	2025-08-02 17:28:32.989308	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
92	دفندر	ديفندر 90	X-ديناميك SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000090	{}	\N	سيارة دفندر ديفندر 90 X-ديناميك SE	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"X-Dynamic SE","imported_from":"cars.json"}	2025-08-02 17:28:33.134313	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
93	دفندر	ديفندر 90	X-ديناميك HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000091	{}	\N	سيارة دفندر ديفندر 90 X-ديناميك HSE	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"X-Dynamic HSE","imported_from":"cars.json"}	2025-08-02 17:28:33.27923	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
94	دفندر	ديفندر 90	X	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000092	{}	\N	سيارة دفندر ديفندر 90 X	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"X","imported_from":"cars.json"}	2025-08-02 17:28:33.424548	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
95	دفندر	ديفندر 90	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000093	{}	\N	سيارة دفندر ديفندر 90 V8	{"brand_english":"Defender","model_english":"Defender 90","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:33.57578	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
96	دفندر	ديفندر 110	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000094	{}	\N	سيارة دفندر ديفندر 110 S	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:28:33.720592	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
97	دفندر	ديفندر 110	X-ديناميك S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000095	{}	\N	سيارة دفندر ديفندر 110 X-ديناميك S	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"X-Dynamic S","imported_from":"cars.json"}	2025-08-02 17:28:33.865899	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
98	دفندر	ديفندر 110	X-ديناميك SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000096	{}	\N	سيارة دفندر ديفندر 110 X-ديناميك SE	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"X-Dynamic SE","imported_from":"cars.json"}	2025-08-02 17:28:34.011184	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
99	دفندر	ديفندر 110	X-ديناميك HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000097	{}	\N	سيارة دفندر ديفندر 110 X-ديناميك HSE	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"X-Dynamic HSE","imported_from":"cars.json"}	2025-08-02 17:28:34.15513	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
100	دفندر	ديفندر 110	X	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000098	{}	\N	سيارة دفندر ديفندر 110 X	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"X","imported_from":"cars.json"}	2025-08-02 17:28:34.299811	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
101	دفندر	ديفندر 110	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000099	{}	\N	سيارة دفندر ديفندر 110 V8	{"brand_english":"Defender","model_english":"Defender 110","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:34.445793	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
102	دفندر	ديفندر 130	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000100	{}	\N	سيارة دفندر ديفندر 130 S	{"brand_english":"Defender","model_english":"Defender 130","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:28:34.590917	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
103	دفندر	ديفندر 130	X-ديناميك SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000101	{}	\N	سيارة دفندر ديفندر 130 X-ديناميك SE	{"brand_english":"Defender","model_english":"Defender 130","trim_english":"X-Dynamic SE","imported_from":"cars.json"}	2025-08-02 17:28:34.735716	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
104	دفندر	ديفندر 130	آوت باوند	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000102	{}	\N	سيارة دفندر ديفندر 130 آوت باوند	{"brand_english":"Defender","model_english":"Defender 130","trim_english":"Outbound","imported_from":"cars.json"}	2025-08-02 17:28:34.882152	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
105	دفندر	ديفندر 130	X	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000103	{}	\N	سيارة دفندر ديفندر 130 X	{"brand_english":"Defender","model_english":"Defender 130","trim_english":"X","imported_from":"cars.json"}	2025-08-02 17:28:35.027175	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
106	دفندر	ديفندر 130	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000104	{}	\N	سيارة دفندر ديفندر 130 V8	{"brand_english":"Defender","model_english":"Defender 130","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:35.172096	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
107	رولز رويس	فانتوم	قاعدة عجلات قياسية	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000105	{}	\N	سيارة رولز رويس فانتوم قاعدة عجلات قياسية	{"brand_english":"Rolls-Royce","model_english":"Phantom","trim_english":"Standard Wheelbase","imported_from":"cars.json"}	2025-08-02 17:28:35.317056	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
108	رولز رويس	فانتوم	قاعدة عجلات ممتدة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000106	{}	\N	سيارة رولز رويس فانتوم قاعدة عجلات ممتدة	{"brand_english":"Rolls-Royce","model_english":"Phantom","trim_english":"Extended Wheelbase","imported_from":"cars.json"}	2025-08-02 17:28:35.462176	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
109	رولز رويس	جوست	قاعدة عجلات قياسية	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000107	{}	\N	سيارة رولز رويس جوست قاعدة عجلات قياسية	{"brand_english":"Rolls-Royce","model_english":"Ghost","trim_english":"Standard Wheelbase","imported_from":"cars.json"}	2025-08-02 17:28:35.607248	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
110	رولز رويس	جوست	قاعدة عجلات ممتدة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000108	{}	\N	سيارة رولز رويس جوست قاعدة عجلات ممتدة	{"brand_english":"Rolls-Royce","model_english":"Ghost","trim_english":"Extended Wheelbase","imported_from":"cars.json"}	2025-08-02 17:28:35.761783	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
111	رولز رويس	كولينان	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000109	{}	\N	سيارة رولز رويس كولينان ستاندرد	{"brand_english":"Rolls-Royce","model_english":"Cullinan","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:28:35.906948	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
112	رولز رويس	كولينان	بلاك بادج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000110	{}	\N	سيارة رولز رويس كولينان بلاك بادج	{"brand_english":"Rolls-Royce","model_english":"Cullinan","trim_english":"Black Badge","imported_from":"cars.json"}	2025-08-02 17:28:36.051226	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
113	رولز رويس	سبيكتر	كهربائية	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000111	{}	\N	سيارة رولز رويس سبيكتر كهربائية	{"brand_english":"Rolls-Royce","model_english":"Spectre","trim_english":"Electric","imported_from":"cars.json"}	2025-08-02 17:28:36.198856	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
114	شيفروليه	سيلفرادو	WT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000112	{}	\N	سيارة شيفروليه سيلفرادو WT	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"WT","imported_from":"cars.json"}	2025-08-02 17:28:36.343993	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
115	شيفروليه	سيلفرادو	كاستم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000113	{}	\N	سيارة شيفروليه سيلفرادو كاستم	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"Custom","imported_from":"cars.json"}	2025-08-02 17:28:36.587409	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
116	شيفروليه	سيلفرادو	LT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000114	{}	\N	سيارة شيفروليه سيلفرادو LT	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"LT","imported_from":"cars.json"}	2025-08-02 17:28:36.735527	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
117	شيفروليه	سيلفرادو	RST	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000115	{}	\N	سيارة شيفروليه سيلفرادو RST	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"RST","imported_from":"cars.json"}	2025-08-02 17:28:36.879169	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
118	شيفروليه	سيلفرادو	LTZ	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000116	{}	\N	سيارة شيفروليه سيلفرادو LTZ	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"LTZ","imported_from":"cars.json"}	2025-08-02 17:28:37.02522	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
119	شيفروليه	سيلفرادو	هاي كنتري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000117	{}	\N	سيارة شيفروليه سيلفرادو هاي كنتري	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"High Country","imported_from":"cars.json"}	2025-08-02 17:28:37.170301	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
120	شيفروليه	سيلفرادو	ZR2	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000118	{}	\N	سيارة شيفروليه سيلفرادو ZR2	{"brand_english":"Chevrolet","model_english":"Silverado","trim_english":"ZR2","imported_from":"cars.json"}	2025-08-02 17:28:37.315105	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
121	شيفروليه	تاهو	LS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000119	{}	\N	سيارة شيفروليه تاهو LS	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"LS","imported_from":"cars.json"}	2025-08-02 17:28:37.460155	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
122	شيفروليه	تاهو	LT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000120	{}	\N	سيارة شيفروليه تاهو LT	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"LT","imported_from":"cars.json"}	2025-08-02 17:28:37.606021	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
123	شيفروليه	تاهو	RST	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000121	{}	\N	سيارة شيفروليه تاهو RST	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"RST","imported_from":"cars.json"}	2025-08-02 17:28:37.754852	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
124	شيفروليه	تاهو	Z71	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000122	{}	\N	سيارة شيفروليه تاهو Z71	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"Z71","imported_from":"cars.json"}	2025-08-02 17:28:37.900608	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
125	شيفروليه	تاهو	بريمير	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000123	{}	\N	سيارة شيفروليه تاهو بريمير	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"Premier","imported_from":"cars.json"}	2025-08-02 17:28:38.04593	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
126	شيفروليه	تاهو	هاي كنتري	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000124	{}	\N	سيارة شيفروليه تاهو هاي كنتري	{"brand_english":"Chevrolet","model_english":"Tahoe","trim_english":"High Country","imported_from":"cars.json"}	2025-08-02 17:28:38.190852	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
127	شيفروليه	كورفيت	ستينغراي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000125	{}	\N	سيارة شيفروليه كورفيت ستينغراي	{"brand_english":"Chevrolet","model_english":"Corvette","trim_english":"Stingray","imported_from":"cars.json"}	2025-08-02 17:28:38.339202	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
128	شيفروليه	كورفيت	Z06	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000126	{}	\N	سيارة شيفروليه كورفيت Z06	{"brand_english":"Chevrolet","model_english":"Corvette","trim_english":"Z06","imported_from":"cars.json"}	2025-08-02 17:28:38.48406	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
129	شيفروليه	كورفيت	إي-راي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000127	{}	\N	سيارة شيفروليه كورفيت إي-راي	{"brand_english":"Chevrolet","model_english":"Corvette","trim_english":"E-Ray","imported_from":"cars.json"}	2025-08-02 17:28:38.628869	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
130	شيفروليه	كورفيت	ZR1	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000128	{}	\N	سيارة شيفروليه كورفيت ZR1	{"brand_english":"Chevrolet","model_english":"Corvette","trim_english":"ZR1","imported_from":"cars.json"}	2025-08-02 17:28:38.774594	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
131	شيفروليه	كامارو	1LS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000129	{}	\N	سيارة شيفروليه كامارو 1LS	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"1LS","imported_from":"cars.json"}	2025-08-02 17:28:38.919406	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
132	شيفروليه	كامارو	1LT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000130	{}	\N	سيارة شيفروليه كامارو 1LT	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"1LT","imported_from":"cars.json"}	2025-08-02 17:28:39.063131	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
133	شيفروليه	كامارو	2LT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000131	{}	\N	سيارة شيفروليه كامارو 2LT	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"2LT","imported_from":"cars.json"}	2025-08-02 17:28:39.207216	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
134	شيفروليه	كامارو	3LT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000132	{}	\N	سيارة شيفروليه كامارو 3LT	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"3LT","imported_from":"cars.json"}	2025-08-02 17:28:39.355976	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
135	شيفروليه	كامارو	LT1	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000133	{}	\N	سيارة شيفروليه كامارو LT1	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"LT1","imported_from":"cars.json"}	2025-08-02 17:28:39.50989	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
136	شيفروليه	كامارو	1SS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000134	{}	\N	سيارة شيفروليه كامارو 1SS	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"1SS","imported_from":"cars.json"}	2025-08-02 17:28:39.654666	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
137	شيفروليه	كامارو	2SS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000135	{}	\N	سيارة شيفروليه كامارو 2SS	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"2SS","imported_from":"cars.json"}	2025-08-02 17:28:39.799722	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
138	شيفروليه	كامارو	ZL1	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000136	{}	\N	سيارة شيفروليه كامارو ZL1	{"brand_english":"Chevrolet","model_english":"Camaro","trim_english":"ZL1","imported_from":"cars.json"}	2025-08-02 17:28:39.947681	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
139	جي إم سي	سييرا	برو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000137	{}	\N	سيارة جي إم سي سييرا برو	{"brand_english":"GMC","model_english":"Sierra","trim_english":"Pro","imported_from":"cars.json"}	2025-08-02 17:28:40.09235	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
140	جي إم سي	سييرا	SLE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000138	{}	\N	سيارة جي إم سي سييرا SLE	{"brand_english":"GMC","model_english":"Sierra","trim_english":"SLE","imported_from":"cars.json"}	2025-08-02 17:28:40.237059	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
141	جي إم سي	سييرا	إليفيشن	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000139	{}	\N	سيارة جي إم سي سييرا إليفيشن	{"brand_english":"GMC","model_english":"Sierra","trim_english":"Elevation","imported_from":"cars.json"}	2025-08-02 17:28:40.382363	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
142	جي إم سي	سييرا	SLT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000140	{}	\N	سيارة جي إم سي سييرا SLT	{"brand_english":"GMC","model_english":"Sierra","trim_english":"SLT","imported_from":"cars.json"}	2025-08-02 17:28:40.527752	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
143	جي إم سي	سييرا	AT4	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000141	{}	\N	سيارة جي إم سي سييرا AT4	{"brand_english":"GMC","model_english":"Sierra","trim_english":"AT4","imported_from":"cars.json"}	2025-08-02 17:28:40.673021	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
144	جي إم سي	سييرا	دينالي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000142	{}	\N	سيارة جي إم سي سييرا دينالي	{"brand_english":"GMC","model_english":"Sierra","trim_english":"Denali","imported_from":"cars.json"}	2025-08-02 17:28:40.818065	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
145	جي إم سي	سييرا	دينالي ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000143	{}	\N	سيارة جي إم سي سييرا دينالي ألتيميت	{"brand_english":"GMC","model_english":"Sierra","trim_english":"Denali Ultimate","imported_from":"cars.json"}	2025-08-02 17:28:40.963128	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
146	جي إم سي	سييرا	AT4X	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000144	{}	\N	سيارة جي إم سي سييرا AT4X	{"brand_english":"GMC","model_english":"Sierra","trim_english":"AT4X","imported_from":"cars.json"}	2025-08-02 17:28:41.108025	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
147	جي إم سي	يوكون	SLE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000145	{}	\N	سيارة جي إم سي يوكون SLE	{"brand_english":"GMC","model_english":"Yukon","trim_english":"SLE","imported_from":"cars.json"}	2025-08-02 17:28:41.26331	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
148	جي إم سي	يوكون	SLT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000146	{}	\N	سيارة جي إم سي يوكون SLT	{"brand_english":"GMC","model_english":"Yukon","trim_english":"SLT","imported_from":"cars.json"}	2025-08-02 17:28:41.407229	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
149	جي إم سي	يوكون	AT4	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000147	{}	\N	سيارة جي إم سي يوكون AT4	{"brand_english":"GMC","model_english":"Yukon","trim_english":"AT4","imported_from":"cars.json"}	2025-08-02 17:28:41.551922	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
150	جي إم سي	يوكون	دينالي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000148	{}	\N	سيارة جي إم سي يوكون دينالي	{"brand_english":"GMC","model_english":"Yukon","trim_english":"Denali","imported_from":"cars.json"}	2025-08-02 17:28:41.69764	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
151	جي إم سي	يوكون	دينالي ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000149	{}	\N	سيارة جي إم سي يوكون دينالي ألتيميت	{"brand_english":"GMC","model_english":"Yukon","trim_english":"Denali Ultimate","imported_from":"cars.json"}	2025-08-02 17:28:41.842473	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
152	جي إم سي	أكاديا	إليفيشن	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000150	{}	\N	سيارة جي إم سي أكاديا إليفيشن	{"brand_english":"GMC","model_english":"Acadia","trim_english":"Elevation","imported_from":"cars.json"}	2025-08-02 17:28:41.987533	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
153	جي إم سي	أكاديا	AT4	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000151	{}	\N	سيارة جي إم سي أكاديا AT4	{"brand_english":"GMC","model_english":"Acadia","trim_english":"AT4","imported_from":"cars.json"}	2025-08-02 17:28:42.132356	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
154	جي إم سي	أكاديا	دينالي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000152	{}	\N	سيارة جي إم سي أكاديا دينالي	{"brand_english":"GMC","model_english":"Acadia","trim_english":"Denali","imported_from":"cars.json"}	2025-08-02 17:28:42.276249	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
155	جي إم سي	تيرين	SLE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000153	{}	\N	سيارة جي إم سي تيرين SLE	{"brand_english":"GMC","model_english":"Terrain","trim_english":"SLE","imported_from":"cars.json"}	2025-08-02 17:28:42.420961	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
156	جي إم سي	تيرين	SLT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000154	{}	\N	سيارة جي إم سي تيرين SLT	{"brand_english":"GMC","model_english":"Terrain","trim_english":"SLT","imported_from":"cars.json"}	2025-08-02 17:28:42.566525	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
157	جي إم سي	تيرين	AT4	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000155	{}	\N	سيارة جي إم سي تيرين AT4	{"brand_english":"GMC","model_english":"Terrain","trim_english":"AT4","imported_from":"cars.json"}	2025-08-02 17:28:42.710197	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
158	جي إم سي	تيرين	دينالي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000156	{}	\N	سيارة جي إم سي تيرين دينالي	{"brand_english":"GMC","model_english":"Terrain","trim_english":"Denali","imported_from":"cars.json"}	2025-08-02 17:28:42.855127	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
159	مرسيدس	C-كلاس	C 200	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000157	{}	\N	سيارة مرسيدس C-كلاس C 200	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"C 200","imported_from":"cars.json"}	2025-08-02 17:28:42.999749	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
160	مرسيدس	C-كلاس	C 300	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000158	{}	\N	سيارة مرسيدس C-كلاس C 300	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"C 300","imported_from":"cars.json"}	2025-08-02 17:28:43.144289	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
161	مرسيدس	C-كلاس	AMG C 43	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000159	{}	\N	سيارة مرسيدس C-كلاس AMG C 43	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"AMG C 43","imported_from":"cars.json"}	2025-08-02 17:28:43.289517	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
162	مرسيدس	C-كلاس	AMG C 63	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000160	{}	\N	سيارة مرسيدس C-كلاس AMG C 63	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"AMG C 63","imported_from":"cars.json"}	2025-08-02 17:28:43.434239	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
163	مرسيدس	C-كلاس	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000161	{}	\N	سيارة مرسيدس C-كلاس سيدان	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:43.578878	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
164	مرسيدس	C-كلاس	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000162	{}	\N	سيارة مرسيدس C-كلاس كوبيه	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:43.723917	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
165	مرسيدس	C-كلاس	كابريوليه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000163	{}	\N	سيارة مرسيدس C-كلاس كابريوليه	{"brand_english":"Mercedes","model_english":"C-Class","trim_english":"Cabriolet","imported_from":"cars.json"}	2025-08-02 17:28:43.868774	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
166	مرسيدس	E-كلاس	E 350	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000164	{}	\N	سيارة مرسيدس E-كلاس E 350	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"E 350","imported_from":"cars.json"}	2025-08-02 17:28:44.014302	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
167	مرسيدس	E-كلاس	E 450	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000165	{}	\N	سيارة مرسيدس E-كلاس E 450	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"E 450","imported_from":"cars.json"}	2025-08-02 17:28:44.159603	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
168	مرسيدس	E-كلاس	AMG E 53	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000166	{}	\N	سيارة مرسيدس E-كلاس AMG E 53	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"AMG E 53","imported_from":"cars.json"}	2025-08-02 17:28:44.30436	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
169	مرسيدس	E-كلاس	AMG E 63 S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000167	{}	\N	سيارة مرسيدس E-كلاس AMG E 63 S	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"AMG E 63 S","imported_from":"cars.json"}	2025-08-02 17:28:44.449457	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
170	مرسيدس	E-كلاس	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000168	{}	\N	سيارة مرسيدس E-كلاس سيدان	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:44.594032	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
171	مرسيدس	E-كلاس	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000169	{}	\N	سيارة مرسيدس E-كلاس كوبيه	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:44.738583	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
172	مرسيدس	E-كلاس	كابريوليه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000170	{}	\N	سيارة مرسيدس E-كلاس كابريوليه	{"brand_english":"Mercedes","model_english":"E-Class","trim_english":"Cabriolet","imported_from":"cars.json"}	2025-08-02 17:28:44.884179	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
173	مرسيدس	S-كلاس	S 450	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000171	{}	\N	سيارة مرسيدس S-كلاس S 450	{"brand_english":"Mercedes","model_english":"S-Class","trim_english":"S 450","imported_from":"cars.json"}	2025-08-02 17:28:45.028789	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
174	مرسيدس	S-كلاس	S 500	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000172	{}	\N	سيارة مرسيدس S-كلاس S 500	{"brand_english":"Mercedes","model_english":"S-Class","trim_english":"S 500","imported_from":"cars.json"}	2025-08-02 17:28:45.174138	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
175	مرسيدس	S-كلاس	S 580	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000173	{}	\N	سيارة مرسيدس S-كلاس S 580	{"brand_english":"Mercedes","model_english":"S-Class","trim_english":"S 580","imported_from":"cars.json"}	2025-08-02 17:28:45.318079	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
176	مرسيدس	S-كلاس	S 680 (مايباخ)	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000174	{}	\N	سيارة مرسيدس S-كلاس S 680 (مايباخ)	{"brand_english":"Mercedes","model_english":"S-Class","trim_english":"S 680 (Maybach)","imported_from":"cars.json"}	2025-08-02 17:28:45.462285	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
177	مرسيدس	GLE	GLE 350	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000175	{}	\N	سيارة مرسيدس GLE GLE 350	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"GLE 350","imported_from":"cars.json"}	2025-08-02 17:28:45.607852	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
178	مرسيدس	GLE	GLE 450	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000176	{}	\N	سيارة مرسيدس GLE GLE 450	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"GLE 450","imported_from":"cars.json"}	2025-08-02 17:28:45.753495	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
179	مرسيدس	GLE	GLE 53	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000177	{}	\N	سيارة مرسيدس GLE GLE 53	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"GLE 53","imported_from":"cars.json"}	2025-08-02 17:28:45.898155	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
180	مرسيدس	GLE	GLE 63 S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000178	{}	\N	سيارة مرسيدس GLE GLE 63 S	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"GLE 63 S","imported_from":"cars.json"}	2025-08-02 17:28:46.043398	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
181	مرسيدس	GLE	SUV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000179	{}	\N	سيارة مرسيدس GLE SUV	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"SUV","imported_from":"cars.json"}	2025-08-02 17:28:46.187206	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
182	مرسيدس	GLE	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000180	{}	\N	سيارة مرسيدس GLE كوبيه	{"brand_english":"Mercedes","model_english":"GLE","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:46.331823	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
183	مرسيدس	G-كلاس	G 550	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000181	{}	\N	سيارة مرسيدس G-كلاس G 550	{"brand_english":"Mercedes","model_english":"G-Class","trim_english":"G 550","imported_from":"cars.json"}	2025-08-02 17:28:46.479651	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
184	مرسيدس	G-كلاس	AMG G 63	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000182	{}	\N	سيارة مرسيدس G-كلاس AMG G 63	{"brand_english":"Mercedes","model_english":"G-Class","trim_english":"AMG G 63","imported_from":"cars.json"}	2025-08-02 17:28:46.624224	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
185	بي إم دبليو	الفئة الثالثة	320i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000183	{}	\N	سيارة بي إم دبليو الفئة الثالثة 320i	{"brand_english":"BMW","model_english":"3 Series","trim_english":"320i","imported_from":"cars.json"}	2025-08-02 17:28:46.768177	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
186	بي إم دبليو	الفئة الثالثة	330i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000184	{}	\N	سيارة بي إم دبليو الفئة الثالثة 330i	{"brand_english":"BMW","model_english":"3 Series","trim_english":"330i","imported_from":"cars.json"}	2025-08-02 17:28:46.912779	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
187	بي إم دبليو	الفئة الثالثة	M340i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000185	{}	\N	سيارة بي إم دبليو الفئة الثالثة M340i	{"brand_english":"BMW","model_english":"3 Series","trim_english":"M340i","imported_from":"cars.json"}	2025-08-02 17:28:47.05813	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
188	بي إم دبليو	الفئة الثالثة	M3	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000186	{}	\N	سيارة بي إم دبليو الفئة الثالثة M3	{"brand_english":"BMW","model_english":"3 Series","trim_english":"M3","imported_from":"cars.json"}	2025-08-02 17:28:47.202876	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
189	بي إم دبليو	الفئة الثالثة	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000187	{}	\N	سيارة بي إم دبليو الفئة الثالثة سيدان	{"brand_english":"BMW","model_english":"3 Series","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:47.347711	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
190	بي إم دبليو	الفئة الثالثة	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000188	{}	\N	سيارة بي إم دبليو الفئة الثالثة تورينج	{"brand_english":"BMW","model_english":"3 Series","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:28:47.492821	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
191	بي إم دبليو	الفئة الخامسة	530i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000189	{}	\N	سيارة بي إم دبليو الفئة الخامسة 530i	{"brand_english":"BMW","model_english":"5 Series","trim_english":"530i","imported_from":"cars.json"}	2025-08-02 17:28:47.638493	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
192	بي إم دبليو	الفئة الخامسة	540i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000190	{}	\N	سيارة بي إم دبليو الفئة الخامسة 540i	{"brand_english":"BMW","model_english":"5 Series","trim_english":"540i","imported_from":"cars.json"}	2025-08-02 17:28:47.784687	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
193	بي إم دبليو	الفئة الخامسة	M560i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000191	{}	\N	سيارة بي إم دبليو الفئة الخامسة M560i	{"brand_english":"BMW","model_english":"5 Series","trim_english":"M560i","imported_from":"cars.json"}	2025-08-02 17:28:47.92973	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
194	بي إم دبليو	الفئة الخامسة	M5	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000192	{}	\N	سيارة بي إم دبليو الفئة الخامسة M5	{"brand_english":"BMW","model_english":"5 Series","trim_english":"M5","imported_from":"cars.json"}	2025-08-02 17:28:48.074924	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
195	بي إم دبليو	الفئة الخامسة	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000193	{}	\N	سيارة بي إم دبليو الفئة الخامسة سيدان	{"brand_english":"BMW","model_english":"5 Series","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:48.221199	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
196	بي إم دبليو	الفئة الخامسة	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000194	{}	\N	سيارة بي إم دبليو الفئة الخامسة تورينج	{"brand_english":"BMW","model_english":"5 Series","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:28:48.368088	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
197	بي إم دبليو	الفئة السابعة	740i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000195	{}	\N	سيارة بي إم دبليو الفئة السابعة 740i	{"brand_english":"BMW","model_english":"7 Series","trim_english":"740i","imported_from":"cars.json"}	2025-08-02 17:28:48.513023	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
198	بي إم دبليو	الفئة السابعة	760i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000196	{}	\N	سيارة بي إم دبليو الفئة السابعة 760i	{"brand_english":"BMW","model_english":"7 Series","trim_english":"760i","imported_from":"cars.json"}	2025-08-02 17:28:48.658182	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
199	بي إم دبليو	الفئة السابعة	i7	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000197	{}	\N	سيارة بي إم دبليو الفئة السابعة i7	{"brand_english":"BMW","model_english":"7 Series","trim_english":"i7","imported_from":"cars.json"}	2025-08-02 17:28:48.802334	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
200	بي إم دبليو	X5	xDrive40i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000198	{}	\N	سيارة بي إم دبليو X5 xDrive40i	{"brand_english":"BMW","model_english":"X5","trim_english":"xDrive40i","imported_from":"cars.json"}	2025-08-02 17:28:48.947421	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
201	بي إم دبليو	X5	xDrive50e	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000199	{}	\N	سيارة بي إم دبليو X5 xDrive50e	{"brand_english":"BMW","model_english":"X5","trim_english":"xDrive50e","imported_from":"cars.json"}	2025-08-02 17:28:49.092809	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
202	بي إم دبليو	X5	M60i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000200	{}	\N	سيارة بي إم دبليو X5 M60i	{"brand_english":"BMW","model_english":"X5","trim_english":"M60i","imported_from":"cars.json"}	2025-08-02 17:28:49.238583	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
203	بي إم دبليو	X5	X5 M	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000201	{}	\N	سيارة بي إم دبليو X5 X5 M	{"brand_english":"BMW","model_english":"X5","trim_english":"X5 M","imported_from":"cars.json"}	2025-08-02 17:28:49.384103	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
204	بي إم دبليو	X7	xDrive40i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000202	{}	\N	سيارة بي إم دبليو X7 xDrive40i	{"brand_english":"BMW","model_english":"X7","trim_english":"xDrive40i","imported_from":"cars.json"}	2025-08-02 17:28:49.530039	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
205	بي إم دبليو	X7	M60i	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000203	{}	\N	سيارة بي إم دبليو X7 M60i	{"brand_english":"BMW","model_english":"X7","trim_english":"M60i","imported_from":"cars.json"}	2025-08-02 17:28:49.67421	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
206	بي إم دبليو	X7	ألبينا XB7	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000204	{}	\N	سيارة بي إم دبليو X7 ألبينا XB7	{"brand_english":"BMW","model_english":"X7","trim_english":"Alpina XB7","imported_from":"cars.json"}	2025-08-02 17:28:49.818732	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
207	بنتلي	كونتيننتال GT	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000205	{}	\N	سيارة بنتلي كونتيننتال GT V8	{"brand_english":"Bentley","model_english":"Continental GT","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:49.963432	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
208	بنتلي	كونتيننتال GT	W12	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000206	{}	\N	سيارة بنتلي كونتيننتال GT W12	{"brand_english":"Bentley","model_english":"Continental GT","trim_english":"W12","imported_from":"cars.json"}	2025-08-02 17:28:50.107249	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
209	بنتلي	كونتيننتال GT	سبيد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000207	{}	\N	سيارة بنتلي كونتيننتال GT سبيد	{"brand_english":"Bentley","model_english":"Continental GT","trim_english":"Speed","imported_from":"cars.json"}	2025-08-02 17:28:50.252196	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
210	بنتلي	كونتيننتال GT	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000208	{}	\N	سيارة بنتلي كونتيننتال GT كوبيه	{"brand_english":"Bentley","model_english":"Continental GT","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:50.396916	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
211	بنتلي	كونتيننتال GT	كابريوليه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000209	{}	\N	سيارة بنتلي كونتيننتال GT كابريوليه	{"brand_english":"Bentley","model_english":"Continental GT","trim_english":"Convertible","imported_from":"cars.json"}	2025-08-02 17:28:50.542029	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
212	بنتلي	فلاينج سبير	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000210	{}	\N	سيارة بنتلي فلاينج سبير V8	{"brand_english":"Bentley","model_english":"Flying Spur","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:50.686834	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
213	بنتلي	فلاينج سبير	W12	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000211	{}	\N	سيارة بنتلي فلاينج سبير W12	{"brand_english":"Bentley","model_english":"Flying Spur","trim_english":"W12","imported_from":"cars.json"}	2025-08-02 17:28:50.831447	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
214	بنتلي	فلاينج سبير	هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000212	{}	\N	سيارة بنتلي فلاينج سبير هايبريد	{"brand_english":"Bentley","model_english":"Flying Spur","trim_english":"Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:50.976007	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
215	بنتلي	بينتايجا	V8	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000213	{}	\N	سيارة بنتلي بينتايجا V8	{"brand_english":"Bentley","model_english":"Bentayga","trim_english":"V8","imported_from":"cars.json"}	2025-08-02 17:28:51.120554	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
216	بنتلي	بينتايجا	هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000214	{}	\N	سيارة بنتلي بينتايجا هايبريد	{"brand_english":"Bentley","model_english":"Bentayga","trim_english":"Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:51.266625	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
217	بنتلي	بينتايجا	سبيد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000215	{}	\N	سيارة بنتلي بينتايجا سبيد	{"brand_english":"Bentley","model_english":"Bentayga","trim_english":"Speed","imported_from":"cars.json"}	2025-08-02 17:28:51.411826	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
218	بورشه	911	كاريرا	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000216	{}	\N	سيارة بورشه 911 كاريرا	{"brand_english":"Porsche","model_english":"911","trim_english":"Carrera","imported_from":"cars.json"}	2025-08-02 17:28:51.558197	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
219	بورشه	911	كاريرا S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000217	{}	\N	سيارة بورشه 911 كاريرا S	{"brand_english":"Porsche","model_english":"911","trim_english":"Carrera S","imported_from":"cars.json"}	2025-08-02 17:28:51.702301	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
220	بورشه	911	كاريرا GTS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000218	{}	\N	سيارة بورشه 911 كاريرا GTS	{"brand_english":"Porsche","model_english":"911","trim_english":"Carrera GTS","imported_from":"cars.json"}	2025-08-02 17:28:51.84654	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
221	بورشه	911	GT3	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000219	{}	\N	سيارة بورشه 911 GT3	{"brand_english":"Porsche","model_english":"911","trim_english":"GT3","imported_from":"cars.json"}	2025-08-02 17:28:51.991362	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
222	بورشه	911	توربو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000220	{}	\N	سيارة بورشه 911 توربو	{"brand_english":"Porsche","model_english":"911","trim_english":"Turbo","imported_from":"cars.json"}	2025-08-02 17:28:52.136716	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
223	بورشه	911	توربو S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000221	{}	\N	سيارة بورشه 911 توربو S	{"brand_english":"Porsche","model_english":"911","trim_english":"Turbo S","imported_from":"cars.json"}	2025-08-02 17:28:52.282496	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
224	بورشه	911	GT2 RS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000222	{}	\N	سيارة بورشه 911 GT2 RS	{"brand_english":"Porsche","model_english":"911","trim_english":"GT2 RS","imported_from":"cars.json"}	2025-08-02 17:28:52.427173	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
225	بورشه	911	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000223	{}	\N	سيارة بورشه 911 كوبيه	{"brand_english":"Porsche","model_english":"911","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:52.571971	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
226	بورشه	911	كابريوليه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000224	{}	\N	سيارة بورشه 911 كابريوليه	{"brand_english":"Porsche","model_english":"911","trim_english":"Cabriolet","imported_from":"cars.json"}	2025-08-02 17:28:52.7163	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
227	بورشه	911	تارغا	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000225	{}	\N	سيارة بورشه 911 تارغا	{"brand_english":"Porsche","model_english":"911","trim_english":"Targa","imported_from":"cars.json"}	2025-08-02 17:28:52.861831	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
228	بورشه	كايين	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000226	{}	\N	سيارة بورشه كايين بيز	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:28:53.006084	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
229	بورشه	كايين	إي-هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000227	{}	\N	سيارة بورشه كايين إي-هايبريد	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"E-Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:53.150495	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
230	بورشه	كايين	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000228	{}	\N	سيارة بورشه كايين S	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:28:53.295409	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
231	بورشه	كايين	GTS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000229	{}	\N	سيارة بورشه كايين GTS	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"GTS","imported_from":"cars.json"}	2025-08-02 17:28:53.440371	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
232	بورشه	كايين	توربو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000230	{}	\N	سيارة بورشه كايين توربو	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"Turbo","imported_from":"cars.json"}	2025-08-02 17:28:53.585595	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
233	بورشه	كايين	توربو إي-هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000231	{}	\N	سيارة بورشه كايين توربو إي-هايبريد	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"Turbo E-Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:53.729621	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
234	بورشه	كايين	توربو GT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000232	{}	\N	سيارة بورشه كايين توربو GT	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"Turbo GT","imported_from":"cars.json"}	2025-08-02 17:28:53.874503	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
235	بورشه	كايين	SUV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000233	{}	\N	سيارة بورشه كايين SUV	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"SUV","imported_from":"cars.json"}	2025-08-02 17:28:54.018966	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
236	بورشه	كايين	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000234	{}	\N	سيارة بورشه كايين كوبيه	{"brand_english":"Porsche","model_english":"Cayenne","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:28:54.163528	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
237	بورشه	باناميرا	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000235	{}	\N	سيارة بورشه باناميرا بيز	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:28:54.308845	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
238	بورشه	باناميرا	إي-هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000236	{}	\N	سيارة بورشه باناميرا إي-هايبريد	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"E-Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:54.453532	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
239	بورشه	باناميرا	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000237	{}	\N	سيارة بورشه باناميرا S	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:28:54.598895	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
240	بورشه	باناميرا	GTS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000238	{}	\N	سيارة بورشه باناميرا GTS	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"GTS","imported_from":"cars.json"}	2025-08-02 17:28:54.743744	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
241	بورشه	باناميرا	توربو إي-هايبريد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000239	{}	\N	سيارة بورشه باناميرا توربو إي-هايبريد	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"Turbo E-Hybrid","imported_from":"cars.json"}	2025-08-02 17:28:54.888551	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
242	بورشه	باناميرا	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000240	{}	\N	سيارة بورشه باناميرا سيدان	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:55.033464	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
243	بورشه	باناميرا	سبورت توريزمو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000241	{}	\N	سيارة بورشه باناميرا سبورت توريزمو	{"brand_english":"Porsche","model_english":"Panamera","trim_english":"Sport Turismo","imported_from":"cars.json"}	2025-08-02 17:28:55.178836	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
244	بورشه	تايكان	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000242	{}	\N	سيارة بورشه تايكان بيز	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:28:55.324012	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
245	بورشه	تايكان	4S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000243	{}	\N	سيارة بورشه تايكان 4S	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"4S","imported_from":"cars.json"}	2025-08-02 17:28:55.468972	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
246	بورشه	تايكان	GTS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000244	{}	\N	سيارة بورشه تايكان GTS	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"GTS","imported_from":"cars.json"}	2025-08-02 17:28:55.613652	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
247	بورشه	تايكان	توربو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000245	{}	\N	سيارة بورشه تايكان توربو	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Turbo","imported_from":"cars.json"}	2025-08-02 17:28:55.756949	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
248	بورشه	تايكان	توربو S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000246	{}	\N	سيارة بورشه تايكان توربو S	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Turbo S","imported_from":"cars.json"}	2025-08-02 17:28:55.903347	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
249	بورشه	تايكان	سيدان	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000247	{}	\N	سيارة بورشه تايكان سيدان	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Sedan","imported_from":"cars.json"}	2025-08-02 17:28:56.048541	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
250	بورشه	تايكان	كروس توريزمو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000248	{}	\N	سيارة بورشه تايكان كروس توريزمو	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Cross Turismo","imported_from":"cars.json"}	2025-08-02 17:28:56.193328	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
251	بورشه	تايكان	سبورت توريزمو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000249	{}	\N	سيارة بورشه تايكان سبورت توريزمو	{"brand_english":"Porsche","model_english":"Taycan","trim_english":"Sport Turismo","imported_from":"cars.json"}	2025-08-02 17:28:56.337828	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
252	لاند روفر	رنج روفر فوغ	HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000250	{}	\N	سيارة لاند روفر رنج روفر فوغ HSE	{"brand_english":"Land Rover","model_english":"Range Rover Vogue","trim_english":"HSE","imported_from":"cars.json"}	2025-08-02 17:28:56.482385	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
253	لاند روفر	رنج روفر فوغ	SV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000251	{}	\N	سيارة لاند روفر رنج روفر فوغ SV	{"brand_english":"Land Rover","model_english":"Range Rover Vogue","trim_english":"SV","imported_from":"cars.json"}	2025-08-02 17:28:56.626663	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
254	لاند روفر	رنج روفر فوغ	Autobiography	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000252	{}	\N	سيارة لاند روفر رنج روفر فوغ Autobiography	{"brand_english":"Land Rover","model_english":"Range Rover Vogue","trim_english":"Autobiography","imported_from":"cars.json"}	2025-08-02 17:28:56.771472	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
255	لاند روفر	رنج روفر فوغ	P530	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000253	{}	\N	سيارة لاند روفر رنج روفر فوغ P530	{"brand_english":"Land Rover","model_english":"Range Rover Vogue","trim_english":"P530","imported_from":"cars.json"}	2025-08-02 17:28:56.916013	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
256	لاند روفر	رنج روفر سبورت	Dynamic	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000254	{}	\N	سيارة لاند روفر رنج روفر سبورت Dynamic	{"brand_english":"Land Rover","model_english":"Range Rover Sport","trim_english":"Dynamic","imported_from":"cars.json"}	2025-08-02 17:28:57.060612	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
257	لاند روفر	رنج روفر سبورت	HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000255	{}	\N	سيارة لاند روفر رنج روفر سبورت HSE	{"brand_english":"Land Rover","model_english":"Range Rover Sport","trim_english":"HSE","imported_from":"cars.json"}	2025-08-02 17:28:57.206106	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
258	لاند روفر	رنج روفر سبورت	SVR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000256	{}	\N	سيارة لاند روفر رنج روفر سبورت SVR	{"brand_english":"Land Rover","model_english":"Range Rover Sport","trim_english":"SVR","imported_from":"cars.json"}	2025-08-02 17:28:57.350799	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
259	لاند روفر	رنج روفر سبورت	P400e	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000257	{}	\N	سيارة لاند روفر رنج روفر سبورت P400e	{"brand_english":"Land Rover","model_english":"Range Rover Sport","trim_english":"P400e","imported_from":"cars.json"}	2025-08-02 17:28:57.495146	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
260	لاند روفر	رنج روفر إيفوك	R-Dynamic	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000258	{}	\N	سيارة لاند روفر رنج روفر إيفوك R-Dynamic	{"brand_english":"Land Rover","model_english":"Range Rover Evoque","trim_english":"R-Dynamic","imported_from":"cars.json"}	2025-08-02 17:28:57.640411	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
261	لاند روفر	رنج روفر إيفوك	HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000259	{}	\N	سيارة لاند روفر رنج روفر إيفوك HSE	{"brand_english":"Land Rover","model_english":"Range Rover Evoque","trim_english":"HSE","imported_from":"cars.json"}	2025-08-02 17:28:57.784779	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
262	لاند روفر	رنج روفر إيفوك	Autobiography	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000260	{}	\N	سيارة لاند روفر رنج روفر إيفوك Autobiography	{"brand_english":"Land Rover","model_english":"Range Rover Evoque","trim_english":"Autobiography","imported_from":"cars.json"}	2025-08-02 17:28:57.929501	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
263	لاند روفر	رنج روفر إيفوك	P300e	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000261	{}	\N	سيارة لاند روفر رنج روفر إيفوك P300e	{"brand_english":"Land Rover","model_english":"Range Rover Evoque","trim_english":"P300e","imported_from":"cars.json"}	2025-08-02 17:28:58.074878	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
264	لاند روفر	رنج روفر كهربائي	First Edition	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000262	{}	\N	سيارة لاند روفر رنج روفر كهربائي First Edition	{"brand_english":"Land Rover","model_english":"Range Rover Electric","trim_english":"First Edition","imported_from":"cars.json"}	2025-08-02 17:28:58.219382	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
265	لاند روفر	رنج روفر كهربائي	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000263	{}	\N	سيارة لاند روفر رنج روفر كهربائي SE	{"brand_english":"Land Rover","model_english":"Range Rover Electric","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:28:58.363123	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
266	لاند روفر	رنج روفر كهربائي	HSE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000264	{}	\N	سيارة لاند روفر رنج روفر كهربائي HSE	{"brand_english":"Land Rover","model_english":"Range Rover Electric","trim_english":"HSE","imported_from":"cars.json"}	2025-08-02 17:28:58.508749	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
267	لاند روفر	رنج روفر كهربائي	Autobiography	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000265	{}	\N	سيارة لاند روفر رنج روفر كهربائي Autobiography	{"brand_english":"Land Rover","model_english":"Range Rover Electric","trim_english":"Autobiography","imported_from":"cars.json"}	2025-08-02 17:28:58.653264	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
268	لاند روفر	دفيندر	90	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000266	{}	\N	سيارة لاند روفر دفيندر 90	{"brand_english":"Land Rover","model_english":"Defender","trim_english":"90","imported_from":"cars.json"}	2025-08-02 17:28:58.798315	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
269	لاند روفر	دفيندر	110	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000267	{}	\N	سيارة لاند روفر دفيندر 110	{"brand_english":"Land Rover","model_english":"Defender","trim_english":"110","imported_from":"cars.json"}	2025-08-02 17:28:58.943096	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
270	لاند روفر	دفيندر	110 X	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000268	{}	\N	سيارة لاند روفر دفيندر 110 X	{"brand_english":"Land Rover","model_english":"Defender","trim_english":"110 X","imported_from":"cars.json"}	2025-08-02 17:28:59.088006	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
271	لاند روفر	دفيندر	90 Hard Top	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000269	{}	\N	سيارة لاند روفر دفيندر 90 Hard Top	{"brand_english":"Land Rover","model_english":"Defender","trim_english":"90 Hard Top","imported_from":"cars.json"}	2025-08-02 17:28:59.233197	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
272	لاند روفر	دفيندر	130	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000270	{}	\N	سيارة لاند روفر دفيندر 130	{"brand_english":"Land Rover","model_english":"Defender","trim_english":"130","imported_from":"cars.json"}	2025-08-02 17:28:59.378512	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
273	لامبورجيني	هوراكان	إيفو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000271	{}	\N	سيارة لامبورجيني هوراكان إيفو	{"brand_english":"Lamborghini","model_english":"Huracán","trim_english":"Evo","imported_from":"cars.json"}	2025-08-02 17:28:59.52344	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
274	لامبورجيني	هوراكان	STO	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000272	{}	\N	سيارة لامبورجيني هوراكان STO	{"brand_english":"Lamborghini","model_english":"Huracán","trim_english":"STO","imported_from":"cars.json"}	2025-08-02 17:28:59.668178	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
275	لامبورجيني	هوراكان	تيكنيكا	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000273	{}	\N	سيارة لامبورجيني هوراكان تيكنيكا	{"brand_english":"Lamborghini","model_english":"Huracán","trim_english":"Tecnica","imported_from":"cars.json"}	2025-08-02 17:28:59.878893	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
276	لامبورجيني	هوراكان	كوبيه	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000274	{}	\N	سيارة لامبورجيني هوراكان كوبيه	{"brand_english":"Lamborghini","model_english":"Huracán","trim_english":"Coupe","imported_from":"cars.json"}	2025-08-02 17:29:00.024445	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
277	لامبورجيني	هوراكان	سبايدر	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000275	{}	\N	سيارة لامبورجيني هوراكان سبايدر	{"brand_english":"Lamborghini","model_english":"Huracán","trim_english":"Spyder","imported_from":"cars.json"}	2025-08-02 17:29:00.168878	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
278	لامبورجيني	أوروس	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000276	{}	\N	سيارة لامبورجيني أوروس S	{"brand_english":"Lamborghini","model_english":"Urus","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:00.313497	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
279	لامبورجيني	أوروس	بيرفورمانتي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000277	{}	\N	سيارة لامبورجيني أوروس بيرفورمانتي	{"brand_english":"Lamborghini","model_english":"Urus","trim_english":"Performante","imported_from":"cars.json"}	2025-08-02 17:29:00.457007	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
280	لامبورجيني	ريفيلتو	هايبريد سوبركار	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000278	{}	\N	سيارة لامبورجيني ريفيلتو هايبريد سوبركار	{"brand_english":"Lamborghini","model_english":"Revuelto","trim_english":"Hybrid Supercar","imported_from":"cars.json"}	2025-08-02 17:29:00.601136	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
281	رينج (Roewe)	RX5	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000279	{}	\N	سيارة رينج (Roewe) RX5 فئات متنوعة	{"brand_english":"Roewe (previously Rocks)","model_english":"RX5","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:00.745889	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
282	رينج (Roewe)	RX8	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000280	{}	\N	سيارة رينج (Roewe) RX8 فئات متنوعة	{"brand_english":"Roewe (previously Rocks)","model_english":"RX8","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:00.891972	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
283	رينج (Roewe)	i5	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000281	{}	\N	سيارة رينج (Roewe) i5 فئات متنوعة	{"brand_english":"Roewe (previously Rocks)","model_english":"i5","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:01.036577	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
284	هونشي	H5	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000282	{}	\N	سيارة هونشي H5 فئات متنوعة	{"brand_english":"Hongqi","model_english":"H5","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:01.181418	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
285	هونشي	H9	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000283	{}	\N	سيارة هونشي H9 فئات متنوعة	{"brand_english":"Hongqi","model_english":"H9","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:01.32674	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
286	هونشي	E-HS9	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000284	{}	\N	سيارة هونشي E-HS9 فئات متنوعة	{"brand_english":"Hongqi","model_english":"E-HS9","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:01.471382	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
287	هونشي	HS5	فئات متنوعة	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000285	{}	\N	سيارة هونشي HS5 فئات متنوعة	{"brand_english":"Hongqi","model_english":"HS5","trim_english":"various trims","imported_from":"cars.json"}	2025-08-02 17:29:01.616193	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
288	لينكون	نافيجاتور	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000286	{}	\N	سيارة لينكون نافيجاتور ستاندرد	{"brand_english":"Lincoln","model_english":"Navigator","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:29:01.765559	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
289	لينكون	نافيجاتور	ريسيرف	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000287	{}	\N	سيارة لينكون نافيجاتور ريسيرف	{"brand_english":"Lincoln","model_english":"Navigator","trim_english":"Reserve","imported_from":"cars.json"}	2025-08-02 17:29:01.910082	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
290	لينكون	نافيجاتور	بلاك ليبل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000288	{}	\N	سيارة لينكون نافيجاتور بلاك ليبل	{"brand_english":"Lincoln","model_english":"Navigator","trim_english":"Black Label","imported_from":"cars.json"}	2025-08-02 17:29:02.054708	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
291	لينكون	أفياتور	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000289	{}	\N	سيارة لينكون أفياتور ستاندرد	{"brand_english":"Lincoln","model_english":"Aviator","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:29:02.199514	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
292	لينكون	أفياتور	ريسيرف	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000290	{}	\N	سيارة لينكون أفياتور ريسيرف	{"brand_english":"Lincoln","model_english":"Aviator","trim_english":"Reserve","imported_from":"cars.json"}	2025-08-02 17:29:02.345712	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
293	لينكون	أفياتور	جراند تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000291	{}	\N	سيارة لينكون أفياتور جراند تورينج	{"brand_english":"Lincoln","model_english":"Aviator","trim_english":"Grand Touring","imported_from":"cars.json"}	2025-08-02 17:29:02.49033	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
294	لينكون	أفياتور	بلاك ليبل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000292	{}	\N	سيارة لينكون أفياتور بلاك ليبل	{"brand_english":"Lincoln","model_english":"Aviator","trim_english":"Black Label","imported_from":"cars.json"}	2025-08-02 17:29:02.635453	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
295	لينكون	كورسير	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000293	{}	\N	سيارة لينكون كورسير ستاندرد	{"brand_english":"Lincoln","model_english":"Corsair","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:29:02.780145	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
296	لينكون	كورسير	ريسيرف	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000294	{}	\N	سيارة لينكون كورسير ريسيرف	{"brand_english":"Lincoln","model_english":"Corsair","trim_english":"Reserve","imported_from":"cars.json"}	2025-08-02 17:29:02.925323	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
297	لينكون	كورسير	جراند تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000295	{}	\N	سيارة لينكون كورسير جراند تورينج	{"brand_english":"Lincoln","model_english":"Corsair","trim_english":"Grand Touring","imported_from":"cars.json"}	2025-08-02 17:29:03.069887	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
298	تسلا	موديل S	مدى طويل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000296	{}	\N	سيارة تسلا موديل S مدى طويل	{"brand_english":"Tesla","model_english":"Model S","trim_english":"Long Range","imported_from":"cars.json"}	2025-08-02 17:29:03.215926	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
299	تسلا	موديل S	بلايد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000297	{}	\N	سيارة تسلا موديل S بلايد	{"brand_english":"Tesla","model_english":"Model S","trim_english":"Plaid","imported_from":"cars.json"}	2025-08-02 17:29:03.360549	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
300	تسلا	موديل 3	دفع خلفي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000298	{}	\N	سيارة تسلا موديل 3 دفع خلفي	{"brand_english":"Tesla","model_english":"Model 3","trim_english":"Rear-Wheel Drive","imported_from":"cars.json"}	2025-08-02 17:29:03.505073	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
301	تسلا	موديل 3	مدى طويل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000299	{}	\N	سيارة تسلا موديل 3 مدى طويل	{"brand_english":"Tesla","model_english":"Model 3","trim_english":"Long Range","imported_from":"cars.json"}	2025-08-02 17:29:03.650328	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
302	تسلا	موديل 3	بيرفورمانس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000300	{}	\N	سيارة تسلا موديل 3 بيرفورمانس	{"brand_english":"Tesla","model_english":"Model 3","trim_english":"Performance","imported_from":"cars.json"}	2025-08-02 17:29:03.795281	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
303	تسلا	موديل X	مدى طويل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000301	{}	\N	سيارة تسلا موديل X مدى طويل	{"brand_english":"Tesla","model_english":"Model X","trim_english":"Long Range","imported_from":"cars.json"}	2025-08-02 17:29:03.940078	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
304	تسلا	موديل X	بلايد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000302	{}	\N	سيارة تسلا موديل X بلايد	{"brand_english":"Tesla","model_english":"Model X","trim_english":"Plaid","imported_from":"cars.json"}	2025-08-02 17:29:04.084673	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
305	تسلا	موديل Y	دفع خلفي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000303	{}	\N	سيارة تسلا موديل Y دفع خلفي	{"brand_english":"Tesla","model_english":"Model Y","trim_english":"Rear-Wheel Drive","imported_from":"cars.json"}	2025-08-02 17:29:04.229861	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
306	تسلا	موديل Y	مدى طويل	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000304	{}	\N	سيارة تسلا موديل Y مدى طويل	{"brand_english":"Tesla","model_english":"Model Y","trim_english":"Long Range","imported_from":"cars.json"}	2025-08-02 17:29:04.375106	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
307	تسلا	موديل Y	بيرفورمانس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000305	{}	\N	سيارة تسلا موديل Y بيرفورمانس	{"brand_english":"Tesla","model_english":"Model Y","trim_english":"Performance","imported_from":"cars.json"}	2025-08-02 17:29:04.520555	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
308	تسلا	سايبرتراك	دفع خلفي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000306	{}	\N	سيارة تسلا سايبرتراك دفع خلفي	{"brand_english":"Tesla","model_english":"Cybertruck","trim_english":"Rear-Wheel Drive","imported_from":"cars.json"}	2025-08-02 17:29:04.665431	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
309	تسلا	سايبرتراك	دفع رباعي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000307	{}	\N	سيارة تسلا سايبرتراك دفع رباعي	{"brand_english":"Tesla","model_english":"Cybertruck","trim_english":"All-Wheel Drive","imported_from":"cars.json"}	2025-08-02 17:29:04.81017	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
310	تسلا	سايبرتراك	سايبربيست	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000308	{}	\N	سيارة تسلا سايبرتراك سايبربيست	{"brand_english":"Tesla","model_english":"Cybertruck","trim_english":"Cyberbeast","imported_from":"cars.json"}	2025-08-02 17:29:04.954983	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
333	كيا	سيراتو	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000331	{}	\N	سيارة كيا سيراتو EX	{"brand_english":"Kia","model_english":"Cerato/Forte","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:08.286743	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
311	لوسيد	إير	بيور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000309	{}	\N	سيارة لوسيد إير بيور	{"brand_english":"Lucid","model_english":"Air","trim_english":"Pure","imported_from":"cars.json"}	2025-08-02 17:29:05.099671	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
312	لوسيد	إير	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000310	{}	\N	سيارة لوسيد إير تورينج	{"brand_english":"Lucid","model_english":"Air","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:05.243119	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
313	لوسيد	إير	جراند تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000311	{}	\N	سيارة لوسيد إير جراند تورينج	{"brand_english":"Lucid","model_english":"Air","trim_english":"Grand Touring","imported_from":"cars.json"}	2025-08-02 17:29:05.388081	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
314	لوسيد	إير	سافاير	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000312	{}	\N	سيارة لوسيد إير سافاير	{"brand_english":"Lucid","model_english":"Air","trim_english":"Sapphire","imported_from":"cars.json"}	2025-08-02 17:29:05.533117	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
315	هيونداي	إلنترا	سمارت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000313	{}	\N	سيارة هيونداي إلنترا سمارت	{"brand_english":"Hyundai","model_english":"Elantra","trim_english":"Smart","imported_from":"cars.json"}	2025-08-02 17:29:05.678116	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
316	هيونداي	إلنترا	كمفورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000314	{}	\N	سيارة هيونداي إلنترا كمفورت	{"brand_english":"Hyundai","model_english":"Elantra","trim_english":"Comfort","imported_from":"cars.json"}	2025-08-02 17:29:05.822883	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
317	هيونداي	إلنترا	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000315	{}	\N	سيارة هيونداي إلنترا بريميوم	{"brand_english":"Hyundai","model_english":"Elantra","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:05.967566	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
318	هيونداي	سوناتا	سمارت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000316	{}	\N	سيارة هيونداي سوناتا سمارت	{"brand_english":"Hyundai","model_english":"Sonata","trim_english":"Smart","imported_from":"cars.json"}	2025-08-02 17:29:06.111117	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
319	هيونداي	سوناتا	كمفورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000317	{}	\N	سيارة هيونداي سوناتا كمفورت	{"brand_english":"Hyundai","model_english":"Sonata","trim_english":"Comfort","imported_from":"cars.json"}	2025-08-02 17:29:06.25573	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
320	هيونداي	سوناتا	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000318	{}	\N	سيارة هيونداي سوناتا بريميوم	{"brand_english":"Hyundai","model_english":"Sonata","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:06.400969	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
321	هيونداي	توسان	سمارت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000319	{}	\N	سيارة هيونداي توسان سمارت	{"brand_english":"Hyundai","model_english":"Tucson","trim_english":"Smart","imported_from":"cars.json"}	2025-08-02 17:29:06.54551	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
322	هيونداي	توسان	كمفورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000320	{}	\N	سيارة هيونداي توسان كمفورت	{"brand_english":"Hyundai","model_english":"Tucson","trim_english":"Comfort","imported_from":"cars.json"}	2025-08-02 17:29:06.690755	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
323	هيونداي	توسان	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000321	{}	\N	سيارة هيونداي توسان بريميوم	{"brand_english":"Hyundai","model_english":"Tucson","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:06.835596	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
324	هيونداي	توسان	HTRAC	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000322	{}	\N	سيارة هيونداي توسان HTRAC	{"brand_english":"Hyundai","model_english":"Tucson","trim_english":"HTRAC","imported_from":"cars.json"}	2025-08-02 17:29:06.980327	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
325	هيونداي	باليسيد	بيز	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000323	{}	\N	سيارة هيونداي باليسيد بيز	{"brand_english":"Hyundai","model_english":"Palisade","trim_english":"Base","imported_from":"cars.json"}	2025-08-02 17:29:07.124923	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
326	هيونداي	باليسيد	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000324	{}	\N	سيارة هيونداي باليسيد ليميتد	{"brand_english":"Hyundai","model_english":"Palisade","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:29:07.269731	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
327	هيونداي	باليسيد	كاليكرافي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000325	{}	\N	سيارة هيونداي باليسيد كاليكرافي	{"brand_english":"Hyundai","model_english":"Palisade","trim_english":"Calligraphy","imported_from":"cars.json"}	2025-08-02 17:29:07.414881	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
328	هيونداي	سنتافي	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000326	{}	\N	سيارة هيونداي سنتافي SE	{"brand_english":"Hyundai","model_english":"Santa Fe","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:29:07.559553	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
329	هيونداي	سنتافي	SEL	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000327	{}	\N	سيارة هيونداي سنتافي SEL	{"brand_english":"Hyundai","model_english":"Santa Fe","trim_english":"SEL","imported_from":"cars.json"}	2025-08-02 17:29:07.704065	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
330	هيونداي	سنتافي	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000328	{}	\N	سيارة هيونداي سنتافي ليميتد	{"brand_english":"Hyundai","model_english":"Santa Fe","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:29:07.848472	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
331	هيونداي	سنتافي	كاليكرافي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000329	{}	\N	سيارة هيونداي سنتافي كاليكرافي	{"brand_english":"Hyundai","model_english":"Santa Fe","trim_english":"Calligraphy","imported_from":"cars.json"}	2025-08-02 17:29:07.997174	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
332	كيا	سيراتو	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000330	{}	\N	سيارة كيا سيراتو LX	{"brand_english":"Kia","model_english":"Cerato/Forte","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:08.141854	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
334	كيا	سيراتو	GT لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000332	{}	\N	سيارة كيا سيراتو GT لاين	{"brand_english":"Kia","model_english":"Cerato/Forte","trim_english":"GT Line","imported_from":"cars.json"}	2025-08-02 17:29:08.43178	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
335	كيا	K5	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000333	{}	\N	سيارة كيا K5 LX	{"brand_english":"Kia","model_english":"K5 (Optima)","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:08.579266	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
336	كيا	K5	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000334	{}	\N	سيارة كيا K5 EX	{"brand_english":"Kia","model_english":"K5 (Optima)","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:08.724008	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
337	كيا	K5	GT لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000335	{}	\N	سيارة كيا K5 GT لاين	{"brand_english":"Kia","model_english":"K5 (Optima)","trim_english":"GT Line","imported_from":"cars.json"}	2025-08-02 17:29:08.869076	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
338	كيا	سبورتاج	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000336	{}	\N	سيارة كيا سبورتاج LX	{"brand_english":"Kia","model_english":"Sportage","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:09.013964	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
339	كيا	سبورتاج	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000337	{}	\N	سيارة كيا سبورتاج EX	{"brand_english":"Kia","model_english":"Sportage","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:09.159046	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
340	كيا	سبورتاج	SX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000338	{}	\N	سيارة كيا سبورتاج SX	{"brand_english":"Kia","model_english":"Sportage","trim_english":"SX","imported_from":"cars.json"}	2025-08-02 17:29:09.303695	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
341	كيا	سبورتاج	X-برو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000339	{}	\N	سيارة كيا سبورتاج X-برو	{"brand_english":"Kia","model_english":"Sportage","trim_english":"X-Pro","imported_from":"cars.json"}	2025-08-02 17:29:09.448583	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
342	كيا	سورينتو	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000340	{}	\N	سيارة كيا سورينتو LX	{"brand_english":"Kia","model_english":"Sorento","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:09.593436	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
343	كيا	سورينتو	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000341	{}	\N	سيارة كيا سورينتو S	{"brand_english":"Kia","model_english":"Sorento","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:09.739234	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
344	كيا	سورينتو	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000342	{}	\N	سيارة كيا سورينتو EX	{"brand_english":"Kia","model_english":"Sorento","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:09.886587	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
345	كيا	سورينتو	SX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000343	{}	\N	سيارة كيا سورينتو SX	{"brand_english":"Kia","model_english":"Sorento","trim_english":"SX","imported_from":"cars.json"}	2025-08-02 17:29:10.030166	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
346	كيا	سورينتو	X-لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000344	{}	\N	سيارة كيا سورينتو X-لاين	{"brand_english":"Kia","model_english":"Sorento","trim_english":"X-Line","imported_from":"cars.json"}	2025-08-02 17:29:10.174875	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
347	كيا	تيلورايد	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000345	{}	\N	سيارة كيا تيلورايد LX	{"brand_english":"Kia","model_english":"Telluride","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:10.320278	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
348	كيا	تيلورايد	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000346	{}	\N	سيارة كيا تيلورايد S	{"brand_english":"Kia","model_english":"Telluride","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:10.465106	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
349	كيا	تيلورايد	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000347	{}	\N	سيارة كيا تيلورايد EX	{"brand_english":"Kia","model_english":"Telluride","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:10.615827	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
350	كيا	تيلورايد	SX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000348	{}	\N	سيارة كيا تيلورايد SX	{"brand_english":"Kia","model_english":"Telluride","trim_english":"SX","imported_from":"cars.json"}	2025-08-02 17:29:10.760884	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
351	كيا	تيلورايد	X-برو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000349	{}	\N	سيارة كيا تيلورايد X-برو	{"brand_english":"Kia","model_english":"Telluride","trim_english":"X-Pro","imported_from":"cars.json"}	2025-08-02 17:29:10.905738	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
352	نيسان	ألتيما	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000350	{}	\N	سيارة نيسان ألتيما S	{"brand_english":"Nissan","model_english":"Altima","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:11.051207	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
353	نيسان	ألتيما	SV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000351	{}	\N	سيارة نيسان ألتيما SV	{"brand_english":"Nissan","model_english":"Altima","trim_english":"SV","imported_from":"cars.json"}	2025-08-02 17:29:11.196345	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
354	نيسان	ألتيما	SL	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000352	{}	\N	سيارة نيسان ألتيما SL	{"brand_english":"Nissan","model_english":"Altima","trim_english":"SL","imported_from":"cars.json"}	2025-08-02 17:29:11.341072	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
355	نيسان	ألتيما	SR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000353	{}	\N	سيارة نيسان ألتيما SR	{"brand_english":"Nissan","model_english":"Altima","trim_english":"SR","imported_from":"cars.json"}	2025-08-02 17:29:11.485106	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
356	نيسان	باترول	XE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000354	{}	\N	سيارة نيسان باترول XE	{"brand_english":"Nissan","model_english":"Patrol","trim_english":"XE","imported_from":"cars.json"}	2025-08-02 17:29:11.629765	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
357	نيسان	باترول	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000355	{}	\N	سيارة نيسان باترول SE	{"brand_english":"Nissan","model_english":"Patrol","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:29:11.774748	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
358	نيسان	باترول	LE (تيتانيوم)	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000356	{}	\N	سيارة نيسان باترول LE (تيتانيوم)	{"brand_english":"Nissan","model_english":"Patrol","trim_english":"LE (Titanium)","imported_from":"cars.json"}	2025-08-02 17:29:11.919361	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
359	نيسان	باترول	LE (بلاتينيوم)	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000357	{}	\N	سيارة نيسان باترول LE (بلاتينيوم)	{"brand_english":"Nissan","model_english":"Patrol","trim_english":"LE (Platinum)","imported_from":"cars.json"}	2025-08-02 17:29:12.064472	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
360	نيسان	إكس-تريل	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000358	{}	\N	سيارة نيسان إكس-تريل S	{"brand_english":"Nissan","model_english":"X-Trail/Rogue","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:12.209458	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
361	نيسان	إكس-تريل	SV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000359	{}	\N	سيارة نيسان إكس-تريل SV	{"brand_english":"Nissan","model_english":"X-Trail/Rogue","trim_english":"SV","imported_from":"cars.json"}	2025-08-02 17:29:12.353226	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
362	نيسان	إكس-تريل	SL	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000360	{}	\N	سيارة نيسان إكس-تريل SL	{"brand_english":"Nissan","model_english":"X-Trail/Rogue","trim_english":"SL","imported_from":"cars.json"}	2025-08-02 17:29:12.49765	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
363	نيسان	كيكس	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000361	{}	\N	سيارة نيسان كيكس S	{"brand_english":"Nissan","model_english":"Kicks","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:12.642636	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
364	نيسان	كيكس	SV	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000362	{}	\N	سيارة نيسان كيكس SV	{"brand_english":"Nissan","model_english":"Kicks","trim_english":"SV","imported_from":"cars.json"}	2025-08-02 17:29:12.787402	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
365	نيسان	كيكس	SR	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000363	{}	\N	سيارة نيسان كيكس SR	{"brand_english":"Nissan","model_english":"Kicks","trim_english":"SR","imported_from":"cars.json"}	2025-08-02 17:29:12.932596	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
366	هوندا	سيفيك	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000364	{}	\N	سيارة هوندا سيفيك LX	{"brand_english":"Honda","model_english":"Civic","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:13.07756	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
367	هوندا	سيفيك	سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000365	{}	\N	سيارة هوندا سيفيك سبورت	{"brand_english":"Honda","model_english":"Civic","trim_english":"Sport","imported_from":"cars.json"}	2025-08-02 17:29:13.222738	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
368	هوندا	سيفيك	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000366	{}	\N	سيارة هوندا سيفيك EX	{"brand_english":"Honda","model_english":"Civic","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:13.368285	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
369	هوندا	سيفيك	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000367	{}	\N	سيارة هوندا سيفيك تورينج	{"brand_english":"Honda","model_english":"Civic","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:13.51306	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
370	هوندا	أكورد	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000368	{}	\N	سيارة هوندا أكورد LX	{"brand_english":"Honda","model_english":"Accord","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:13.657763	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
371	هوندا	أكورد	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000369	{}	\N	سيارة هوندا أكورد EX	{"brand_english":"Honda","model_english":"Accord","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:13.80295	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
372	هوندا	أكورد	سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000370	{}	\N	سيارة هوندا أكورد سبورت	{"brand_english":"Honda","model_english":"Accord","trim_english":"Sport","imported_from":"cars.json"}	2025-08-02 17:29:13.947609	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
373	هوندا	أكورد	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000371	{}	\N	سيارة هوندا أكورد تورينج	{"brand_english":"Honda","model_english":"Accord","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:14.096662	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
374	هوندا	CR-V	LX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000372	{}	\N	سيارة هوندا CR-V LX	{"brand_english":"Honda","model_english":"CR-V","trim_english":"LX","imported_from":"cars.json"}	2025-08-02 17:29:14.241945	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
375	هوندا	CR-V	EX	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000373	{}	\N	سيارة هوندا CR-V EX	{"brand_english":"Honda","model_english":"CR-V","trim_english":"EX","imported_from":"cars.json"}	2025-08-02 17:29:14.386938	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
376	هوندا	CR-V	EX-L	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000374	{}	\N	سيارة هوندا CR-V EX-L	{"brand_english":"Honda","model_english":"CR-V","trim_english":"EX-L","imported_from":"cars.json"}	2025-08-02 17:29:14.532024	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
377	هوندا	CR-V	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000375	{}	\N	سيارة هوندا CR-V تورينج	{"brand_english":"Honda","model_english":"CR-V","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:14.677957	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
378	هوندا	بايلوت	سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000376	{}	\N	سيارة هوندا بايلوت سبورت	{"brand_english":"Honda","model_english":"Pilot","trim_english":"Sport","imported_from":"cars.json"}	2025-08-02 17:29:14.822884	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
379	هوندا	بايلوت	EX-L	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000377	{}	\N	سيارة هوندا بايلوت EX-L	{"brand_english":"Honda","model_english":"Pilot","trim_english":"EX-L","imported_from":"cars.json"}	2025-08-02 17:29:14.968631	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
380	هوندا	بايلوت	تريل سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000378	{}	\N	سيارة هوندا بايلوت تريل سبورت	{"brand_english":"Honda","model_english":"Pilot","trim_english":"TrailSport","imported_from":"cars.json"}	2025-08-02 17:29:15.113581	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
381	هوندا	بايلوت	إليت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000379	{}	\N	سيارة هوندا بايلوت إليت	{"brand_english":"Honda","model_english":"Pilot","trim_english":"Elite","imported_from":"cars.json"}	2025-08-02 17:29:15.257298	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
382	هوندا	بايلوت	بلاك إيديشن	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000380	{}	\N	سيارة هوندا بايلوت بلاك إيديشن	{"brand_english":"Honda","model_english":"Pilot","trim_english":"Black Edition","imported_from":"cars.json"}	2025-08-02 17:29:15.401277	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
383	فولكس فاجن	جولف	GTI	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000381	{}	\N	سيارة فولكس فاجن جولف GTI	{"brand_english":"Volkswagen","model_english":"Golf","trim_english":"GTI","imported_from":"cars.json"}	2025-08-02 17:29:15.546101	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
384	فولكس فاجن	جولف	R	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000382	{}	\N	سيارة فولكس فاجن جولف R	{"brand_english":"Volkswagen","model_english":"Golf","trim_english":"R","imported_from":"cars.json"}	2025-08-02 17:29:15.691242	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
385	فولكس فاجن	باسات	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000383	{}	\N	سيارة فولكس فاجن باسات S	{"brand_english":"Volkswagen","model_english":"Passat","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:15.836728	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
386	فولكس فاجن	باسات	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000384	{}	\N	سيارة فولكس فاجن باسات SE	{"brand_english":"Volkswagen","model_english":"Passat","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:29:15.980106	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
387	فولكس فاجن	باسات	R-لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000385	{}	\N	سيارة فولكس فاجن باسات R-لاين	{"brand_english":"Volkswagen","model_english":"Passat","trim_english":"R-Line","imported_from":"cars.json"}	2025-08-02 17:29:16.124444	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
388	فولكس فاجن	تيجوان	S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000386	{}	\N	سيارة فولكس فاجن تيجوان S	{"brand_english":"Volkswagen","model_english":"Tiguan","trim_english":"S","imported_from":"cars.json"}	2025-08-02 17:29:16.269499	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
389	فولكس فاجن	تيجوان	SE	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000387	{}	\N	سيارة فولكس فاجن تيجوان SE	{"brand_english":"Volkswagen","model_english":"Tiguan","trim_english":"SE","imported_from":"cars.json"}	2025-08-02 17:29:16.414526	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
390	فولكس فاجن	تيجوان	SEL R-لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000388	{}	\N	سيارة فولكس فاجن تيجوان SEL R-لاين	{"brand_english":"Volkswagen","model_english":"Tiguan","trim_english":"SEL R-Line","imported_from":"cars.json"}	2025-08-02 17:29:16.55966	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
391	فولكس فاجن	طوارق	R-لاين	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000389	{}	\N	سيارة فولكس فاجن طوارق R-لاين	{"brand_english":"Volkswagen","model_english":"Touareg","trim_english":"R-Line","imported_from":"cars.json"}	2025-08-02 17:29:16.704396	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
392	فولكس فاجن	طوارق	إليجانس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000390	{}	\N	سيارة فولكس فاجن طوارق إليجانس	{"brand_english":"Volkswagen","model_english":"Touareg","trim_english":"Elegance","imported_from":"cars.json"}	2025-08-02 17:29:16.849329	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
393	فولكس فاجن	طوارق	فئات حسب السوق	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000391	{}	\N	سيارة فولكس فاجن طوارق فئات حسب السوق	{"brand_english":"Volkswagen","model_english":"Touareg","trim_english":"various market-specific trims","imported_from":"cars.json"}	2025-08-02 17:29:16.995014	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
394	أودي	A4	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000392	{}	\N	سيارة أودي A4 بريميوم	{"brand_english":"Audi","model_english":"A4","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:17.139878	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
395	أودي	A4	بريميوم بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000393	{}	\N	سيارة أودي A4 بريميوم بلس	{"brand_english":"Audi","model_english":"A4","trim_english":"Premium Plus","imported_from":"cars.json"}	2025-08-02 17:29:17.284984	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
396	أودي	A4	برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000394	{}	\N	سيارة أودي A4 برستيج	{"brand_english":"Audi","model_english":"A4","trim_english":"Prestige","imported_from":"cars.json"}	2025-08-02 17:29:17.43021	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
397	أودي	A6	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000395	{}	\N	سيارة أودي A6 بريميوم	{"brand_english":"Audi","model_english":"A6","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:17.574226	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
398	أودي	A6	بريميوم بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000396	{}	\N	سيارة أودي A6 بريميوم بلس	{"brand_english":"Audi","model_english":"A6","trim_english":"Premium Plus","imported_from":"cars.json"}	2025-08-02 17:29:17.718616	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
399	أودي	A6	برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000397	{}	\N	سيارة أودي A6 برستيج	{"brand_english":"Audi","model_english":"A6","trim_english":"Prestige","imported_from":"cars.json"}	2025-08-02 17:29:17.862149	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
400	أودي	Q5	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000398	{}	\N	سيارة أودي Q5 بريميوم	{"brand_english":"Audi","model_english":"Q5","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:18.007159	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
401	أودي	Q5	بريميوم بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000399	{}	\N	سيارة أودي Q5 بريميوم بلس	{"brand_english":"Audi","model_english":"Q5","trim_english":"Premium Plus","imported_from":"cars.json"}	2025-08-02 17:29:18.151776	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
402	أودي	Q5	برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000400	{}	\N	سيارة أودي Q5 برستيج	{"brand_english":"Audi","model_english":"Q5","trim_english":"Prestige","imported_from":"cars.json"}	2025-08-02 17:29:18.296493	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
403	أودي	Q5	SQ5	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000401	{}	\N	سيارة أودي Q5 SQ5	{"brand_english":"Audi","model_english":"Q5","trim_english":"SQ5","imported_from":"cars.json"}	2025-08-02 17:29:18.441529	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
404	أودي	Q7	بريميوم	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000402	{}	\N	سيارة أودي Q7 بريميوم	{"brand_english":"Audi","model_english":"Q7","trim_english":"Premium","imported_from":"cars.json"}	2025-08-02 17:29:18.586868	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
405	أودي	Q7	بريميوم بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000403	{}	\N	سيارة أودي Q7 بريميوم بلس	{"brand_english":"Audi","model_english":"Q7","trim_english":"Premium Plus","imported_from":"cars.json"}	2025-08-02 17:29:18.73189	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
406	أودي	Q7	برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000404	{}	\N	سيارة أودي Q7 برستيج	{"brand_english":"Audi","model_english":"Q7","trim_english":"Prestige","imported_from":"cars.json"}	2025-08-02 17:29:18.87695	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
407	أودي	Q7	SQ7	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000405	{}	\N	سيارة أودي Q7 SQ7	{"brand_english":"Audi","model_english":"Q7","trim_english":"SQ7","imported_from":"cars.json"}	2025-08-02 17:29:19.021958	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
408	أودي	e-tron GT	ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000406	{}	\N	سيارة أودي e-tron GT ستاندرد	{"brand_english":"Audi","model_english":"e-tron GT","trim_english":"Standard","imported_from":"cars.json"}	2025-08-02 17:29:19.170255	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
409	أودي	e-tron GT	RS	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000407	{}	\N	سيارة أودي e-tron GT RS	{"brand_english":"Audi","model_english":"e-tron GT","trim_english":"RS","imported_from":"cars.json"}	2025-08-02 17:29:19.319415	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
410	فولفو	S60	كور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000408	{}	\N	سيارة فولفو S60 كور	{"brand_english":"Volvo","model_english":"S60","trim_english":"Core","imported_from":"cars.json"}	2025-08-02 17:29:19.46767	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
411	فولفو	S60	بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000409	{}	\N	سيارة فولفو S60 بلس	{"brand_english":"Volvo","model_english":"S60","trim_english":"Plus","imported_from":"cars.json"}	2025-08-02 17:29:19.612685	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
412	فولفو	S60	ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000410	{}	\N	سيارة فولفو S60 ألتيميت	{"brand_english":"Volvo","model_english":"S60","trim_english":"Ultimate","imported_from":"cars.json"}	2025-08-02 17:29:19.758697	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
413	فولفو	XC60	كور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000411	{}	\N	سيارة فولفو XC60 كور	{"brand_english":"Volvo","model_english":"XC60","trim_english":"Core","imported_from":"cars.json"}	2025-08-02 17:29:19.903862	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
414	فولفو	XC60	بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000412	{}	\N	سيارة فولفو XC60 بلس	{"brand_english":"Volvo","model_english":"XC60","trim_english":"Plus","imported_from":"cars.json"}	2025-08-02 17:29:20.049244	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
415	فولفو	XC60	ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000413	{}	\N	سيارة فولفو XC60 ألتيميت	{"brand_english":"Volvo","model_english":"XC60","trim_english":"Ultimate","imported_from":"cars.json"}	2025-08-02 17:29:20.193939	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
416	فولفو	XC90	كور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000414	{}	\N	سيارة فولفو XC90 كور	{"brand_english":"Volvo","model_english":"XC90","trim_english":"Core","imported_from":"cars.json"}	2025-08-02 17:29:20.338816	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
417	فولفو	XC90	بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000415	{}	\N	سيارة فولفو XC90 بلس	{"brand_english":"Volvo","model_english":"XC90","trim_english":"Plus","imported_from":"cars.json"}	2025-08-02 17:29:20.484697	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
418	فولفو	XC90	ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000416	{}	\N	سيارة فولفو XC90 ألتيميت	{"brand_english":"Volvo","model_english":"XC90","trim_english":"Ultimate","imported_from":"cars.json"}	2025-08-02 17:29:20.631184	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
419	فولفو	C40 ريتشارج	كور	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000417	{}	\N	سيارة فولفو C40 ريتشارج كور	{"brand_english":"Volvo","model_english":"C40 Recharge","trim_english":"Core","imported_from":"cars.json"}	2025-08-02 17:29:20.776455	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
420	فولفو	C40 ريتشارج	بلس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000418	{}	\N	سيارة فولفو C40 ريتشارج بلس	{"brand_english":"Volvo","model_english":"C40 Recharge","trim_english":"Plus","imported_from":"cars.json"}	2025-08-02 17:29:20.920078	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
421	فولفو	C40 ريتشارج	ألتيميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000419	{}	\N	سيارة فولفو C40 ريتشارج ألتيميت	{"brand_english":"Volvo","model_english":"C40 Recharge","trim_english":"Ultimate","imported_from":"cars.json"}	2025-08-02 17:29:21.065075	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
422	جينيسيس	G70	2.0T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000420	{}	\N	سيارة جينيسيس G70 2.0T ستاندرد	{"brand_english":"Genesis","model_english":"G70","trim_english":"2.0T Standard","imported_from":"cars.json"}	2025-08-02 17:29:21.210202	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
423	جينيسيس	G70	2.0T سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000421	{}	\N	سيارة جينيسيس G70 2.0T سبورت	{"brand_english":"Genesis","model_english":"G70","trim_english":"2.0T Sport","imported_from":"cars.json"}	2025-08-02 17:29:21.357257	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
424	جينيسيس	G70	2.0T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000422	{}	\N	سيارة جينيسيس G70 2.0T برستيج	{"brand_english":"Genesis","model_english":"G70","trim_english":"2.0T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:21.502353	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
425	جينيسيس	G70	3.3T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000423	{}	\N	سيارة جينيسيس G70 3.3T ستاندرد	{"brand_english":"Genesis","model_english":"G70","trim_english":"3.3T Standard","imported_from":"cars.json"}	2025-08-02 17:29:21.647453	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
426	جينيسيس	G70	3.3T سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000424	{}	\N	سيارة جينيسيس G70 3.3T سبورت	{"brand_english":"Genesis","model_english":"G70","trim_english":"3.3T Sport","imported_from":"cars.json"}	2025-08-02 17:29:21.792477	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
427	جينيسيس	G70	3.3T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000425	{}	\N	سيارة جينيسيس G70 3.3T برستيج	{"brand_english":"Genesis","model_english":"G70","trim_english":"3.3T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:21.93734	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
428	جينيسيس	GV70	2.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000426	{}	\N	سيارة جينيسيس GV70 2.5T ستاندرد	{"brand_english":"Genesis","model_english":"GV70","trim_english":"2.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:22.082023	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
429	جينيسيس	GV70	2.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000427	{}	\N	سيارة جينيسيس GV70 2.5T أدفانسد	{"brand_english":"Genesis","model_english":"GV70","trim_english":"2.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:22.226734	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
430	جينيسيس	GV70	2.5T سبورت برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000428	{}	\N	سيارة جينيسيس GV70 2.5T سبورت برستيج	{"brand_english":"Genesis","model_english":"GV70","trim_english":"2.5T Sport Prestige","imported_from":"cars.json"}	2025-08-02 17:29:22.371646	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
431	جينيسيس	GV70	3.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000429	{}	\N	سيارة جينيسيس GV70 3.5T ستاندرد	{"brand_english":"Genesis","model_english":"GV70","trim_english":"3.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:22.515057	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
432	جينيسيس	GV70	3.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000430	{}	\N	سيارة جينيسيس GV70 3.5T أدفانسد	{"brand_english":"Genesis","model_english":"GV70","trim_english":"3.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:22.659739	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
433	جينيسيس	GV70	3.5T سبورت برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000431	{}	\N	سيارة جينيسيس GV70 3.5T سبورت برستيج	{"brand_english":"Genesis","model_english":"GV70","trim_english":"3.5T Sport Prestige","imported_from":"cars.json"}	2025-08-02 17:29:22.804262	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
434	جينيسيس	G80	2.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000432	{}	\N	سيارة جينيسيس G80 2.5T ستاندرد	{"brand_english":"Genesis","model_english":"G80","trim_english":"2.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:22.948981	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
435	جينيسيس	G80	2.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000433	{}	\N	سيارة جينيسيس G80 2.5T أدفانسد	{"brand_english":"Genesis","model_english":"G80","trim_english":"2.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:23.093967	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
436	جينيسيس	G80	2.5T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000434	{}	\N	سيارة جينيسيس G80 2.5T برستيج	{"brand_english":"Genesis","model_english":"G80","trim_english":"2.5T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:23.238951	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
437	جينيسيس	G80	3.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000435	{}	\N	سيارة جينيسيس G80 3.5T ستاندرد	{"brand_english":"Genesis","model_english":"G80","trim_english":"3.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:23.384068	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
438	جينيسيس	G80	3.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000436	{}	\N	سيارة جينيسيس G80 3.5T أدفانسد	{"brand_english":"Genesis","model_english":"G80","trim_english":"3.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:23.530134	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
439	جينيسيس	G80	3.5T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000437	{}	\N	سيارة جينيسيس G80 3.5T برستيج	{"brand_english":"Genesis","model_english":"G80","trim_english":"3.5T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:23.675134	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
440	جينيسيس	GV80	2.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000438	{}	\N	سيارة جينيسيس GV80 2.5T ستاندرد	{"brand_english":"Genesis","model_english":"GV80","trim_english":"2.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:23.820022	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
441	جينيسيس	GV80	2.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000439	{}	\N	سيارة جينيسيس GV80 2.5T أدفانسد	{"brand_english":"Genesis","model_english":"GV80","trim_english":"2.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:23.964774	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
442	جينيسيس	GV80	2.5T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000440	{}	\N	سيارة جينيسيس GV80 2.5T برستيج	{"brand_english":"Genesis","model_english":"GV80","trim_english":"2.5T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:24.109377	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
443	جينيسيس	GV80	3.5T ستاندرد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000441	{}	\N	سيارة جينيسيس GV80 3.5T ستاندرد	{"brand_english":"Genesis","model_english":"GV80","trim_english":"3.5T Standard","imported_from":"cars.json"}	2025-08-02 17:29:24.254349	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
444	جينيسيس	GV80	3.5T أدفانسد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000442	{}	\N	سيارة جينيسيس GV80 3.5T أدفانسد	{"brand_english":"Genesis","model_english":"GV80","trim_english":"3.5T Advanced","imported_from":"cars.json"}	2025-08-02 17:29:24.39902	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
445	جينيسيس	GV80	3.5T برستيج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000443	{}	\N	سيارة جينيسيس GV80 3.5T برستيج	{"brand_english":"Genesis","model_english":"GV80","trim_english":"3.5T Prestige","imported_from":"cars.json"}	2025-08-02 17:29:24.543977	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
446	كرايسلر	300	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000444	{}	\N	سيارة كرايسلر 300 تورينج	{"brand_english":"Chrysler","model_english":"300","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:24.691451	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
447	كرايسلر	300	تورينج L	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000445	{}	\N	سيارة كرايسلر 300 تورينج L	{"brand_english":"Chrysler","model_english":"300","trim_english":"Touring L","imported_from":"cars.json"}	2025-08-02 17:29:24.835071	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
448	كرايسلر	300	300S	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000446	{}	\N	سيارة كرايسلر 300 300S	{"brand_english":"Chrysler","model_english":"300","trim_english":"300S","imported_from":"cars.json"}	2025-08-02 17:29:24.980581	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
449	كرايسلر	300	300C	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000447	{}	\N	سيارة كرايسلر 300 300C	{"brand_english":"Chrysler","model_english":"300","trim_english":"300C","imported_from":"cars.json"}	2025-08-02 17:29:25.125656	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
450	كرايسلر	باسيفيكا	تورينج	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000448	{}	\N	سيارة كرايسلر باسيفيكا تورينج	{"brand_english":"Chrysler","model_english":"Pacifica","trim_english":"Touring","imported_from":"cars.json"}	2025-08-02 17:29:25.271105	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
451	كرايسلر	باسيفيكا	تورينج L	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000449	{}	\N	سيارة كرايسلر باسيفيكا تورينج L	{"brand_english":"Chrysler","model_english":"Pacifica","trim_english":"Touring L","imported_from":"cars.json"}	2025-08-02 17:29:25.415902	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
452	كرايسلر	باسيفيكا	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000450	{}	\N	سيارة كرايسلر باسيفيكا ليميتد	{"brand_english":"Chrysler","model_english":"Pacifica","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:29:25.560631	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
453	كرايسلر	باسيفيكا	بيناكلي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000451	{}	\N	سيارة كرايسلر باسيفيكا بيناكلي	{"brand_english":"Chrysler","model_english":"Pacifica","trim_english":"Pinnacle","imported_from":"cars.json"}	2025-08-02 17:29:25.705297	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
454	دودج	تشارجر	SXT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000452	{}	\N	سيارة دودج تشارجر SXT	{"brand_english":"Dodge","model_english":"Charger","trim_english":"SXT","imported_from":"cars.json"}	2025-08-02 17:29:25.85043	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
455	دودج	تشارجر	GT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000453	{}	\N	سيارة دودج تشارجر GT	{"brand_english":"Dodge","model_english":"Charger","trim_english":"GT","imported_from":"cars.json"}	2025-08-02 17:29:25.995063	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
456	دودج	تشارجر	R/T	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000454	{}	\N	سيارة دودج تشارجر R/T	{"brand_english":"Dodge","model_english":"Charger","trim_english":"R/T","imported_from":"cars.json"}	2025-08-02 17:29:26.139796	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
457	دودج	تشارجر	سكات باك	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000455	{}	\N	سيارة دودج تشارجر سكات باك	{"brand_english":"Dodge","model_english":"Charger","trim_english":"Scat Pack","imported_from":"cars.json"}	2025-08-02 17:29:26.284733	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
458	دودج	تشارجر	هيلكات	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000456	{}	\N	سيارة دودج تشارجر هيلكات	{"brand_english":"Dodge","model_english":"Charger","trim_english":"Hellcat","imported_from":"cars.json"}	2025-08-02 17:29:26.4296	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
459	دودج	تشالنجر	SXT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000457	{}	\N	سيارة دودج تشالنجر SXT	{"brand_english":"Dodge","model_english":"Challenger","trim_english":"SXT","imported_from":"cars.json"}	2025-08-02 17:29:26.575733	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
460	دودج	تشالنجر	GT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000458	{}	\N	سيارة دودج تشالنجر GT	{"brand_english":"Dodge","model_english":"Challenger","trim_english":"GT","imported_from":"cars.json"}	2025-08-02 17:29:26.720519	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
461	دودج	تشالنجر	R/T	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000459	{}	\N	سيارة دودج تشالنجر R/T	{"brand_english":"Dodge","model_english":"Challenger","trim_english":"R/T","imported_from":"cars.json"}	2025-08-02 17:29:26.865339	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
462	دودج	تشالنجر	سكات باك	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000460	{}	\N	سيارة دودج تشالنجر سكات باك	{"brand_english":"Dodge","model_english":"Challenger","trim_english":"Scat Pack","imported_from":"cars.json"}	2025-08-02 17:29:27.010472	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
463	دودج	تشالنجر	هيلكات	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000461	{}	\N	سيارة دودج تشالنجر هيلكات	{"brand_english":"Dodge","model_english":"Challenger","trim_english":"Hellcat","imported_from":"cars.json"}	2025-08-02 17:29:27.155387	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
464	دودج	دورانجو	SXT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000462	{}	\N	سيارة دودج دورانجو SXT	{"brand_english":"Dodge","model_english":"Durango","trim_english":"SXT","imported_from":"cars.json"}	2025-08-02 17:29:27.300982	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
465	دودج	دورانجو	GT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000463	{}	\N	سيارة دودج دورانجو GT	{"brand_english":"Dodge","model_english":"Durango","trim_english":"GT","imported_from":"cars.json"}	2025-08-02 17:29:27.445733	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
466	دودج	دورانجو	R/T	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000464	{}	\N	سيارة دودج دورانجو R/T	{"brand_english":"Dodge","model_english":"Durango","trim_english":"R/T","imported_from":"cars.json"}	2025-08-02 17:29:27.59092	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
467	دودج	دورانجو	SRT	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000465	{}	\N	سيارة دودج دورانجو SRT	{"brand_english":"Dodge","model_english":"Durango","trim_english":"SRT","imported_from":"cars.json"}	2025-08-02 17:29:27.735967	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
468	جيب	رانجلر	سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000466	{}	\N	سيارة جيب رانجلر سبورت	{"brand_english":"Jeep","model_english":"Wrangler","trim_english":"Sport","imported_from":"cars.json"}	2025-08-02 17:29:27.880758	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
469	جيب	رانجلر	صحارى	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000467	{}	\N	سيارة جيب رانجلر صحارى	{"brand_english":"Jeep","model_english":"Wrangler","trim_english":"Sahara","imported_from":"cars.json"}	2025-08-02 17:29:28.025447	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
470	جيب	رانجلر	روبيكون	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000468	{}	\N	سيارة جيب رانجلر روبيكون	{"brand_english":"Jeep","model_english":"Wrangler","trim_english":"Rubicon","imported_from":"cars.json"}	2025-08-02 17:29:28.17042	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
471	جيب	رانجلر	ويليس	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000469	{}	\N	سيارة جيب رانجلر ويليس	{"brand_english":"Jeep","model_english":"Wrangler","trim_english":"Willys","imported_from":"cars.json"}	2025-08-02 17:29:28.315267	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
472	جيب	جراند شيروكي	لاريدو	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000470	{}	\N	سيارة جيب جراند شيروكي لاريدو	{"brand_english":"Jeep","model_english":"Grand Cherokee","trim_english":"Laredo","imported_from":"cars.json"}	2025-08-02 17:29:28.460083	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
473	جيب	جراند شيروكي	ليميتد	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000471	{}	\N	سيارة جيب جراند شيروكي ليميتد	{"brand_english":"Jeep","model_english":"Grand Cherokee","trim_english":"Limited","imported_from":"cars.json"}	2025-08-02 17:29:28.606031	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
474	جيب	جراند شيروكي	أوفرلاند	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000472	{}	\N	سيارة جيب جراند شيروكي أوفرلاند	{"brand_english":"Jeep","model_english":"Grand Cherokee","trim_english":"Overland","imported_from":"cars.json"}	2025-08-02 17:29:28.751387	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
475	جيب	جراند شيروكي	سميت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000473	{}	\N	سيارة جيب جراند شيروكي سميت	{"brand_english":"Jeep","model_english":"Grand Cherokee","trim_english":"Summit","imported_from":"cars.json"}	2025-08-02 17:29:28.977527	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
476	جيب	جراند شيروكي	سميت ريسيرف	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000474	{}	\N	سيارة جيب جراند شيروكي سميت ريسيرف	{"brand_english":"Jeep","model_english":"Grand Cherokee","trim_english":"Summit Reserve","imported_from":"cars.json"}	2025-08-02 17:29:29.122471	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
477	جيب	جلادياتور	سبورت	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000475	{}	\N	سيارة جيب جلادياتور سبورت	{"brand_english":"Jeep","model_english":"Gladiator","trim_english":"Sport","imported_from":"cars.json"}	2025-08-02 17:29:29.26784	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
478	جيب	جلادياتور	أوفرلاند	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000476	{}	\N	سيارة جيب جلادياتور أوفرلاند	{"brand_english":"Jeep","model_english":"Gladiator","trim_english":"Overland","imported_from":"cars.json"}	2025-08-02 17:29:29.412427	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
479	جيب	جلادياتور	روبيكون	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000477	{}	\N	سيارة جيب جلادياتور روبيكون	{"brand_english":"Jeep","model_english":"Gladiator","trim_english":"Rubicon","imported_from":"cars.json"}	2025-08-02 17:29:29.557628	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
480	جيب	جلادياتور	موهافي	2.0L	2024	أبيض	أسود	متوفر	شركة	ملك الشركة	المعرض	CHASSIS_000478	{}	\N	سيارة جيب جلادياتور موهافي	{"brand_english":"Jeep","model_english":"Gladiator","trim_english":"Mojave","imported_from":"cars.json"}	2025-08-02 17:29:29.703364	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, quotation_id, quote_number, inventory_item_id, manufacturer, category, trim_level, year, exterior_color, interior_color, chassis_number, engine_capacity, specifications, base_price, final_price, customer_name, customer_phone, customer_email, notes, status, payment_status, payment_method, paid_amount, remaining_amount, due_date, created_by, company_data, representative_data, pricing_details, qr_code_data, authorization_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leave_requests (id, user_id, user_name, request_type, start_date, end_date, duration, duration_type, reason, status, requested_by, requested_by_name, approved_by, approved_by_name, approved_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: location_transfers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.location_transfers (id, inventory_item_id, from_location, to_location, transfer_date, reason, transferred_by, notes) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locations (id, name, description, address, manager, phone, capacity, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: low_stock_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.low_stock_alerts (id, manufacturer, category, current_stock, min_stock_level, alert_level, is_read, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: manufacturers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.manufacturers (id, name_ar, name_en, logo, is_active, created_at, updated_at) FROM stdin;
1	أودي	Audi	/audi.png	t	2025-08-02 17:27:20.322047	2025-08-02 17:27:20.322047
2	بنتلي	Bentley	/bentley.png	t	2025-08-02 17:27:20.469234	2025-08-02 17:27:20.469234
3	بورشه	Porsche	/porsche.png	t	2025-08-02 17:27:20.613113	2025-08-02 17:27:20.613113
4	بي إم دبليو	BMW	/bmw.png	t	2025-08-02 17:27:20.757638	2025-08-02 17:27:20.757638
5	تسلا	Tesla	/tesla.png	t	2025-08-02 17:27:20.90208	2025-08-02 17:27:20.90208
6	تويوتا	Toyota	/toyota.png	t	2025-08-02 17:27:21.047111	2025-08-02 17:27:21.047111
7	جاكوار	Jaguar	/jaguar.png	t	2025-08-02 17:27:21.191884	2025-08-02 17:27:21.191884
8	جي إم سي	GMC	/gmc.png	t	2025-08-02 17:27:21.336227	2025-08-02 17:27:21.336227
9	جيب	Jeep	/jeep.png	t	2025-08-02 17:27:21.480699	2025-08-02 17:27:21.480699
10	جينيسيس	Genesis	/genesis.png	t	2025-08-02 17:27:21.626062	2025-08-02 17:27:21.626062
11	دفندر	Defender	/defender.png	t	2025-08-02 17:27:21.770784	2025-08-02 17:27:21.770784
12	دودج	Dodge	/dodge.png	t	2025-08-02 17:27:21.915078	2025-08-02 17:27:21.915078
13	رولز رويس	Rolls-Royce	/rolls-royce.png	t	2025-08-02 17:27:22.059933	2025-08-02 17:27:22.059933
14	رينج (Roewe)	Roewe	/roewe.png	t	2025-08-02 17:27:22.204785	2025-08-02 17:27:22.204785
15	شيفروليه	Chevrolet	/chevrolet.png	t	2025-08-02 17:27:22.353571	2025-08-02 17:27:22.353571
16	فورد	Ford	/ford.png	t	2025-08-02 17:27:22.498085	2025-08-02 17:27:22.498085
17	فولفو	Volvo	/volvo.png	t	2025-08-02 17:27:22.642452	2025-08-02 17:27:22.642452
18	فولكس فاجن	Volkswagen	/volkswagen.png	t	2025-08-02 17:27:22.788514	2025-08-02 17:27:22.788514
19	كرايسلر	Chrysler	/chrysler.png	t	2025-08-02 17:27:22.932041	2025-08-02 17:27:22.932041
20	كيا	Kia	/kia.png	t	2025-08-02 17:27:23.077043	2025-08-02 17:27:23.077043
21	لامبورجيني	Lamborghini	/lamborghini.png	t	2025-08-02 17:27:23.221492	2025-08-02 17:27:23.221492
22	لاند روفر	Land Rover	/land-rover.png	t	2025-08-02 17:27:23.366047	2025-08-02 17:27:23.366047
23	لكزس	Lexus	/lexus.png	t	2025-08-02 17:27:23.510459	2025-08-02 17:27:23.510459
24	لوسيد	Lucid	/lucid.png	t	2025-08-02 17:27:23.654882	2025-08-02 17:27:23.654882
25	لينكون	Lincoln	/lincoln.png	t	2025-08-02 17:27:23.799845	2025-08-02 17:27:23.799845
26	مرسيدس	Mercedes	/mercedes.png	t	2025-08-02 17:27:23.944504	2025-08-02 17:27:23.944504
27	نيسان	Nissan	/nissan.png	t	2025-08-02 17:27:24.088838	2025-08-02 17:27:24.088838
28	هوندا	Honda	/honda.png	t	2025-08-02 17:27:24.233924	2025-08-02 17:27:24.233924
29	هونشي	Hongqi	/hongqi.png	t	2025-08-02 17:27:24.378385	2025-08-02 17:27:24.378385
30	هيونداي	Hyundai	/hyundai.png	t	2025-08-02 17:27:24.523105	2025-08-02 17:27:24.523105
\.


--
-- Data for Name: ownership_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ownership_types (id, name, description, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: pdf_appearance_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pdf_appearance_settings (id, header_background_color, header_text_color, logo_background_color, table_header_background_color, table_header_text_color, table_row_background_color, table_row_text_color, table_alternate_row_background_color, table_border_color, primary_text_color, secondary_text_color, price_text_color, total_text_color, border_color, background_color, section_background_color, company_stamp, watermark_opacity, footer_background_color, footer_text_color, qr_code_background_color, qr_code_foreground_color, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotations (id, quote_number, inventory_item_id, manufacturer, category, trim_level, year, exterior_color, interior_color, chassis_number, engine_capacity, specifications, base_price, final_price, customer_name, customer_phone, customer_email, customer_title, notes, valid_until, status, created_by, company_data, representative_data, quote_appearance, pricing_details, qr_code_data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: specifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.specifications (id, manufacturer, category, trim_level, year, engine_capacity, chassis_number, engine_type, horsepower, torque, transmission, fuel_type, fuel_consumption, drivetrain, acceleration, top_speed, length, width, height, wheelbase, curb_weight, gross_weight, load_capacity, seating_capacity, safety_features, comfort_features, infotainment, driver_assistance, exterior_features, interior_features, tire_size, suspension, brakes, steering, ground_clearance, warranty, notes, detailed_description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_settings (id, manufacturer, category, min_stock_level, low_stock_threshold, critical_stock_threshold, auto_reorder_enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: terms_and_conditions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.terms_and_conditions (id, company_id, content, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: trim_levels; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.trim_levels (id, manufacturer, category, trim_level, description, created_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (id, user_id, login_time, logout_time, ip_address, user_agent, is_active) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, job_title, phone_number, username, password, role, created_at) FROM stdin;
1	مدير النظام	مدير	966555000001	admin	$2b$10$defaulthash	admin	2025-08-02 17:27:16.392444
2	احمد الزميتي	مندوب مبيعات	0557449997	ahmad_alzmaity	Pass49997	user	2025-08-02 17:27:16.546281
3	زايد حيدر	مندوب مبيعات	0554497773	zaid_haidar	Pass97773	user	2025-08-02 17:27:16.691373
4	عبدالله نصر	مندوب مبيعات	0503715148	abdullah_nasr	Pass15148	user	2025-08-02 17:27:16.836464
5	عمار المليكي	مندوب مبيعات	0550399991	ammar_almaliki	Pass9991	user	2025-08-02 17:27:16.981956
6	عزام الغنامي	مندوب مبيعات	0598147975	azzam_alghanami	Pass47975	user	2025-08-02 17:27:17.127649
7	ايمن الموشكي	مندوب مبيعات	0533014932	ayman_almoshki	Pass14932	user	2025-08-02 17:27:17.272906
8	ايمن المليكي	مدير المبيعات	0508059998	ayman_almaliki	Pass59998	user	2025-08-02 17:27:17.41862
9	احمد الجوهري	مندوب البنوك	0543266042	ahmad_aljawhary	Pass66042	accountant	2025-08-02 17:27:17.564404
10	احمد كمال	محاسب	0555053167	ahmad_kamal	Pass53167	accountant	2025-08-02 17:27:17.709941
11	محمود كمال	محاسب	0598084630	mahmoud_kamal	Pass84630	accountant	2025-08-02 17:27:17.854806
12	سامي احمد	محاسب	0532649681	sami_ahmad	Pass49681	accountant	2025-08-02 17:27:17.999762
13	ساوي	مندوب مبيعات	0559986086	sawi	Pass86086	user	2025-08-02 17:27:18.144592
14	فاروق الغنامي	محاسب	0508222813	farouq_alghanami	Pass22813	accountant	2025-08-02 17:27:18.288172
15	صادق الغنامي	محاسب	0551813362	sadiq_alghanami	Pass13362	accountant	2025-08-02 17:27:18.432646
16	عبدالمجيد عبدالله	المدير التنفيذي	0553336741	abdulmajeed_abdullah	Pass36741	admin	2025-08-02 17:27:18.577682
17	عبدالله الغنامي	المالك	0533339333	abdullah_alghanami	Pass39333	admin	2025-08-02 17:27:18.722376
\.


--
-- Data for Name: vehicle_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicle_categories (id, manufacturer_id, name_ar, name_en, is_active, created_at, updated_at) FROM stdin;
1	1	300	300	t	2025-08-02 17:27:24.667813	2025-08-02 17:27:24.667813
2	1	911	911	t	2025-08-02 17:27:24.815418	2025-08-02 17:27:24.815418
3	1	A4	A4	t	2025-08-02 17:27:24.96213	2025-08-02 17:27:24.96213
4	1	A6	A6	t	2025-08-02 17:27:25.108404	2025-08-02 17:27:25.108404
5	1	C-كلاس	C-كلاس	t	2025-08-02 17:27:25.252967	2025-08-02 17:27:25.252967
6	1	C40 ريتشارج	C40 ريتشارج	t	2025-08-02 17:27:25.397829	2025-08-02 17:27:25.397829
7	1	CR-V	CR-V	t	2025-08-02 17:27:25.542972	2025-08-02 17:27:25.542972
8	1	E-HS9	E-HS9	t	2025-08-02 17:27:25.687675	2025-08-02 17:27:25.687675
9	1	E-كلاس	E-كلاس	t	2025-08-02 17:27:25.83223	2025-08-02 17:27:25.83223
10	1	ES	ES	t	2025-08-02 17:27:25.976969	2025-08-02 17:27:25.976969
11	1	F-150	F-150	t	2025-08-02 17:27:26.122169	2025-08-02 17:27:26.122169
12	1	F-PACE	F-PACE	t	2025-08-02 17:27:26.266563	2025-08-02 17:27:26.266563
13	1	F-TYPE	F-TYPE	t	2025-08-02 17:27:26.410061	2025-08-02 17:27:26.410061
14	1	G-كلاس	G-كلاس	t	2025-08-02 17:27:26.554906	2025-08-02 17:27:26.554906
15	1	G70	G70	t	2025-08-02 17:27:26.700495	2025-08-02 17:27:26.700495
16	1	G80	G80	t	2025-08-02 17:27:26.847425	2025-08-02 17:27:26.847425
17	1	GLE	GLE	t	2025-08-02 17:27:26.992153	2025-08-02 17:27:26.992153
18	1	GV70	GV70	t	2025-08-02 17:27:27.13679	2025-08-02 17:27:27.13679
19	1	GV80	GV80	t	2025-08-02 17:27:27.281347	2025-08-02 17:27:27.281347
20	1	GX	GX	t	2025-08-02 17:27:27.425239	2025-08-02 17:27:27.425239
21	1	H5	H5	t	2025-08-02 17:27:27.570051	2025-08-02 17:27:27.570051
22	1	H9	H9	t	2025-08-02 17:27:27.714619	2025-08-02 17:27:27.714619
23	1	HS5	HS5	t	2025-08-02 17:27:27.859079	2025-08-02 17:27:27.859079
24	1	K5	K5	t	2025-08-02 17:27:28.003966	2025-08-02 17:27:28.003966
25	1	LX	LX	t	2025-08-02 17:27:28.148608	2025-08-02 17:27:28.148608
26	1	Q5	Q5	t	2025-08-02 17:27:28.29344	2025-08-02 17:27:28.29344
27	1	Q7	Q7	t	2025-08-02 17:27:28.437906	2025-08-02 17:27:28.437906
28	1	RX	RX	t	2025-08-02 17:27:28.582882	2025-08-02 17:27:28.582882
29	1	RX5	RX5	t	2025-08-02 17:27:28.727525	2025-08-02 17:27:28.727525
30	1	RX8	RX8	t	2025-08-02 17:27:28.873172	2025-08-02 17:27:28.873172
31	1	S-كلاس	S-كلاس	t	2025-08-02 17:27:29.017592	2025-08-02 17:27:29.017592
32	1	S60	S60	t	2025-08-02 17:27:29.162055	2025-08-02 17:27:29.162055
33	1	X5	X5	t	2025-08-02 17:27:29.306912	2025-08-02 17:27:29.306912
34	1	X7	X7	t	2025-08-02 17:27:29.451331	2025-08-02 17:27:29.451331
35	1	XC60	XC60	t	2025-08-02 17:27:29.595854	2025-08-02 17:27:29.595854
36	1	XC90	XC90	t	2025-08-02 17:27:29.741492	2025-08-02 17:27:29.741492
37	1	XF	XF	t	2025-08-02 17:27:29.886128	2025-08-02 17:27:29.886128
38	1	e-tron GT	e-tron GT	t	2025-08-02 17:27:30.030768	2025-08-02 17:27:30.030768
39	1	i5	i5	t	2025-08-02 17:27:30.175565	2025-08-02 17:27:30.175565
40	1	أفياتور	أفياتور	t	2025-08-02 17:27:30.320062	2025-08-02 17:27:30.320062
41	1	أكاديا	أكاديا	t	2025-08-02 17:27:30.465154	2025-08-02 17:27:30.465154
42	1	أكورد	أكورد	t	2025-08-02 17:27:30.609818	2025-08-02 17:27:30.609818
43	1	ألتيما	ألتيما	t	2025-08-02 17:27:30.754617	2025-08-02 17:27:30.754617
44	1	أوروس	أوروس	t	2025-08-02 17:27:30.898606	2025-08-02 17:27:30.898606
45	1	إكس-تريل	إكس-تريل	t	2025-08-02 17:27:31.042995	2025-08-02 17:27:31.042995
46	1	إكسبلورر	إكسبلورر	t	2025-08-02 17:27:31.187678	2025-08-02 17:27:31.187678
47	1	إلنترا	إلنترا	t	2025-08-02 17:27:31.33113	2025-08-02 17:27:31.33113
48	1	إير	إير	t	2025-08-02 17:27:31.476033	2025-08-02 17:27:31.476033
49	1	الفئة الثالثة	الفئة الثالثة	t	2025-08-02 17:27:31.620581	2025-08-02 17:27:31.620581
50	1	الفئة الخامسة	الفئة الخامسة	t	2025-08-02 17:27:31.766649	2025-08-02 17:27:31.766649
51	1	الفئة السابعة	الفئة السابعة	t	2025-08-02 17:27:31.910794	2025-08-02 17:27:31.910794
52	1	باترول	باترول	t	2025-08-02 17:27:32.055472	2025-08-02 17:27:32.055472
53	1	باسات	باسات	t	2025-08-02 17:27:32.19998	2025-08-02 17:27:32.19998
54	1	باسيفيكا	باسيفيكا	t	2025-08-02 17:27:32.344561	2025-08-02 17:27:32.344561
55	1	باليسيد	باليسيد	t	2025-08-02 17:27:32.489499	2025-08-02 17:27:32.489499
56	1	باناميرا	باناميرا	t	2025-08-02 17:27:32.634957	2025-08-02 17:27:32.634957
57	1	بايلوت	بايلوت	t	2025-08-02 17:27:32.779412	2025-08-02 17:27:32.779412
58	1	برونكو	برونكو	t	2025-08-02 17:27:32.923246	2025-08-02 17:27:32.923246
59	1	بينتايجا	بينتايجا	t	2025-08-02 17:27:33.068374	2025-08-02 17:27:33.068374
60	1	تاهو	تاهو	t	2025-08-02 17:27:33.213094	2025-08-02 17:27:33.213094
61	1	تايكان	تايكان	t	2025-08-02 17:27:33.358101	2025-08-02 17:27:33.358101
62	1	تشارجر	تشارجر	t	2025-08-02 17:27:33.504372	2025-08-02 17:27:33.504372
63	1	تشالنجر	تشالنجر	t	2025-08-02 17:27:33.648823	2025-08-02 17:27:33.648823
64	1	توسان	توسان	t	2025-08-02 17:27:33.793581	2025-08-02 17:27:33.793581
65	1	تيجوان	تيجوان	t	2025-08-02 17:27:33.938352	2025-08-02 17:27:33.938352
66	1	تيرين	تيرين	t	2025-08-02 17:27:34.083044	2025-08-02 17:27:34.083044
67	1	تيلورايد	تيلورايد	t	2025-08-02 17:27:34.227679	2025-08-02 17:27:34.227679
68	1	جراند شيروكي	جراند شيروكي	t	2025-08-02 17:27:34.371244	2025-08-02 17:27:34.371244
69	1	جلادياتور	جلادياتور	t	2025-08-02 17:27:34.519578	2025-08-02 17:27:34.519578
70	1	جوست	جوست	t	2025-08-02 17:27:34.664579	2025-08-02 17:27:34.664579
71	1	جولف	جولف	t	2025-08-02 17:27:34.809937	2025-08-02 17:27:34.809937
72	1	دفيندر	دفيندر	t	2025-08-02 17:27:34.955432	2025-08-02 17:27:34.955432
73	1	دورانجو	دورانجو	t	2025-08-02 17:27:35.099953	2025-08-02 17:27:35.099953
74	1	ديفندر 110	ديفندر 110	t	2025-08-02 17:27:35.2448	2025-08-02 17:27:35.2448
75	1	ديفندر 130	ديفندر 130	t	2025-08-02 17:27:35.389373	2025-08-02 17:27:35.389373
76	1	ديفندر 90	ديفندر 90	t	2025-08-02 17:27:35.534883	2025-08-02 17:27:35.534883
77	1	راف4	راف4	t	2025-08-02 17:27:35.679946	2025-08-02 17:27:35.679946
78	1	رانجلر	رانجلر	t	2025-08-02 17:27:35.82478	2025-08-02 17:27:35.82478
79	1	رنج روفر إيفوك	رنج روفر إيفوك	t	2025-08-02 17:27:35.969407	2025-08-02 17:27:35.969407
80	1	رنج روفر سبورت	رنج روفر سبورت	t	2025-08-02 17:27:36.11413	2025-08-02 17:27:36.11413
81	1	رنج روفر فوغ	رنج روفر فوغ	t	2025-08-02 17:27:36.258289	2025-08-02 17:27:36.258289
82	1	رنج روفر كهربائي	رنج روفر كهربائي	t	2025-08-02 17:27:36.402847	2025-08-02 17:27:36.402847
83	1	ريفيلتو	ريفيلتو	t	2025-08-02 17:27:36.547448	2025-08-02 17:27:36.547448
84	1	سايبرتراك	سايبرتراك	t	2025-08-02 17:27:36.691138	2025-08-02 17:27:36.691138
85	1	سبورتاج	سبورتاج	t	2025-08-02 17:27:36.83599	2025-08-02 17:27:36.83599
86	1	سبيكتر	سبيكتر	t	2025-08-02 17:27:36.980533	2025-08-02 17:27:36.980533
87	1	سنتافي	سنتافي	t	2025-08-02 17:27:37.125262	2025-08-02 17:27:37.125262
88	1	سوبرا	سوبرا	t	2025-08-02 17:27:37.270022	2025-08-02 17:27:37.270022
89	1	سورينتو	سورينتو	t	2025-08-02 17:27:37.414655	2025-08-02 17:27:37.414655
90	1	سوناتا	سوناتا	t	2025-08-02 17:27:37.559306	2025-08-02 17:27:37.559306
91	1	سيراتو	سيراتو	t	2025-08-02 17:27:37.703186	2025-08-02 17:27:37.703186
92	1	سيفيك	سيفيك	t	2025-08-02 17:27:37.847074	2025-08-02 17:27:37.847074
93	1	سيلفرادو	سيلفرادو	t	2025-08-02 17:27:37.991772	2025-08-02 17:27:37.991772
94	1	سييرا	سييرا	t	2025-08-02 17:27:38.136469	2025-08-02 17:27:38.136469
95	1	طوارق	طوارق	t	2025-08-02 17:27:38.281787	2025-08-02 17:27:38.281787
96	1	فانتوم	فانتوم	t	2025-08-02 17:27:38.426326	2025-08-02 17:27:38.426326
97	1	فلاينج سبير	فلاينج سبير	t	2025-08-02 17:27:38.570803	2025-08-02 17:27:38.570803
98	1	كامارو	كامارو	t	2025-08-02 17:27:38.715408	2025-08-02 17:27:38.715408
99	1	كامري	كامري	t	2025-08-02 17:27:38.859925	2025-08-02 17:27:38.859925
100	1	كايين	كايين	t	2025-08-02 17:27:39.004736	2025-08-02 17:27:39.004736
101	1	كورسير	كورسير	t	2025-08-02 17:27:39.149552	2025-08-02 17:27:39.149552
102	1	كورفيت	كورفيت	t	2025-08-02 17:27:39.293152	2025-08-02 17:27:39.293152
103	1	كورولا	كورولا	t	2025-08-02 17:27:39.438383	2025-08-02 17:27:39.438383
104	1	كولينان	كولينان	t	2025-08-02 17:27:39.583668	2025-08-02 17:27:39.583668
105	1	كونتيننتال GT	كونتيننتال GT	t	2025-08-02 17:27:39.731034	2025-08-02 17:27:39.731034
106	1	كيكس	كيكس	t	2025-08-02 17:27:39.876025	2025-08-02 17:27:39.876025
107	1	لاند كروزر	لاند كروزر	t	2025-08-02 17:27:40.02085	2025-08-02 17:27:40.02085
108	1	موديل 3	موديل 3	t	2025-08-02 17:27:40.166244	2025-08-02 17:27:40.166244
109	1	موديل S	موديل S	t	2025-08-02 17:27:40.311147	2025-08-02 17:27:40.311147
110	1	موديل X	موديل X	t	2025-08-02 17:27:40.455132	2025-08-02 17:27:40.455132
111	1	موديل Y	موديل Y	t	2025-08-02 17:27:40.599779	2025-08-02 17:27:40.599779
112	1	موستانج	موستانج	t	2025-08-02 17:27:40.745968	2025-08-02 17:27:40.745968
113	1	نافيجاتور	نافيجاتور	t	2025-08-02 17:27:40.890752	2025-08-02 17:27:40.890752
114	1	هايلوكس	هايلوكس	t	2025-08-02 17:27:41.03595	2025-08-02 17:27:41.03595
115	1	هوراكان	هوراكان	t	2025-08-02 17:27:41.180555	2025-08-02 17:27:41.180555
116	1	يوكون	يوكون	t	2025-08-02 17:27:41.324927	2025-08-02 17:27:41.324927
\.


--
-- Data for Name: vehicle_statuses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicle_statuses (id, name, description, color, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: vehicle_trim_levels; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicle_trim_levels (id, category_id, name_ar, name_en, is_active, created_at, updated_at) FROM stdin;
1	1	110	110	t	2025-08-02 17:27:41.46989	2025-08-02 17:27:41.46989
2	1	110 X	110 X	t	2025-08-02 17:27:41.619292	2025-08-02 17:27:41.619292
3	1	130	130	t	2025-08-02 17:27:41.764515	2025-08-02 17:27:41.764515
4	1	1LS	1LS	t	2025-08-02 17:27:41.909488	2025-08-02 17:27:41.909488
5	1	1LT	1LT	t	2025-08-02 17:27:42.053106	2025-08-02 17:27:42.053106
6	1	1SS	1SS	t	2025-08-02 17:27:42.198701	2025-08-02 17:27:42.198701
7	1	2.0	2.0	t	2025-08-02 17:27:42.343832	2025-08-02 17:27:42.343832
8	1	2.0T برستيج	2.0T برستيج	t	2025-08-02 17:27:42.48865	2025-08-02 17:27:42.48865
9	1	2.0T سبورت	2.0T سبورت	t	2025-08-02 17:27:42.634507	2025-08-02 17:27:42.634507
10	1	2.0T ستاندرد	2.0T ستاندرد	t	2025-08-02 17:27:42.779912	2025-08-02 17:27:42.779912
11	1	2.5T أدفانسد	2.5T أدفانسد	t	2025-08-02 17:27:42.924795	2025-08-02 17:27:42.924795
12	1	2.5T برستيج	2.5T برستيج	t	2025-08-02 17:27:43.069573	2025-08-02 17:27:43.069573
13	1	2.5T سبورت برستيج	2.5T سبورت برستيج	t	2025-08-02 17:27:43.213167	2025-08-02 17:27:43.213167
14	1	2.5T ستاندرد	2.5T ستاندرد	t	2025-08-02 17:27:43.358175	2025-08-02 17:27:43.358175
15	1	2LT	2LT	t	2025-08-02 17:27:43.50289	2025-08-02 17:27:43.50289
16	1	2SS	2SS	t	2025-08-02 17:27:43.64764	2025-08-02 17:27:43.64764
17	1	3.0	3.0	t	2025-08-02 17:27:43.792424	2025-08-02 17:27:43.792424
18	1	3.0 بريميوم	3.0 بريميوم	t	2025-08-02 17:27:43.937035	2025-08-02 17:27:43.937035
19	1	3.3T برستيج	3.3T برستيج	t	2025-08-02 17:27:44.082163	2025-08-02 17:27:44.082163
20	1	3.3T سبورت	3.3T سبورت	t	2025-08-02 17:27:44.22721	2025-08-02 17:27:44.22721
21	1	3.3T ستاندرد	3.3T ستاندرد	t	2025-08-02 17:27:44.379916	2025-08-02 17:27:44.379916
22	1	3.5T أدفانسد	3.5T أدفانسد	t	2025-08-02 17:27:44.527463	2025-08-02 17:27:44.527463
23	1	3.5T برستيج	3.5T برستيج	t	2025-08-02 17:27:44.672767	2025-08-02 17:27:44.672767
24	1	3.5T سبورت برستيج	3.5T سبورت برستيج	t	2025-08-02 17:27:44.817478	2025-08-02 17:27:44.817478
25	1	3.5T ستاندرد	3.5T ستاندرد	t	2025-08-02 17:27:44.961988	2025-08-02 17:27:44.961988
26	1	300C	300C	t	2025-08-02 17:27:45.106641	2025-08-02 17:27:45.106641
27	1	300S	300S	t	2025-08-02 17:27:45.251131	2025-08-02 17:27:45.251131
28	1	320i	320i	t	2025-08-02 17:27:45.396792	2025-08-02 17:27:45.396792
29	1	330i	330i	t	2025-08-02 17:27:45.541474	2025-08-02 17:27:45.541474
30	1	3LT	3LT	t	2025-08-02 17:27:45.685879	2025-08-02 17:27:45.685879
31	1	4S	4S	t	2025-08-02 17:27:45.830341	2025-08-02 17:27:45.830341
32	1	530i	530i	t	2025-08-02 17:27:45.975185	2025-08-02 17:27:45.975185
33	1	540i	540i	t	2025-08-02 17:27:46.119713	2025-08-02 17:27:46.119713
34	1	740i	740i	t	2025-08-02 17:27:46.264611	2025-08-02 17:27:46.264611
35	1	75	75	t	2025-08-02 17:27:46.40907	2025-08-02 17:27:46.40907
36	1	760i	760i	t	2025-08-02 17:27:46.554683	2025-08-02 17:27:46.554683
37	1	90	90	t	2025-08-02 17:27:46.699485	2025-08-02 17:27:46.699485
38	1	90 Hard Top	90 Hard Top	t	2025-08-02 17:27:46.844026	2025-08-02 17:27:46.844026
39	1	AMG C 43	AMG C 43	t	2025-08-02 17:27:46.989035	2025-08-02 17:27:46.989035
40	1	AMG C 63	AMG C 63	t	2025-08-02 17:27:47.134415	2025-08-02 17:27:47.134415
41	1	AMG E 53	AMG E 53	t	2025-08-02 17:27:47.322078	2025-08-02 17:27:47.322078
42	1	AMG E 63 S	AMG E 63 S	t	2025-08-02 17:27:47.467167	2025-08-02 17:27:47.467167
43	1	AMG G 63	AMG G 63	t	2025-08-02 17:27:47.612473	2025-08-02 17:27:47.612473
44	1	AT4	AT4	t	2025-08-02 17:27:47.757062	2025-08-02 17:27:47.757062
45	1	AT4X	AT4X	t	2025-08-02 17:27:47.902182	2025-08-02 17:27:47.902182
46	1	Autobiography	Autobiography	t	2025-08-02 17:27:48.046181	2025-08-02 17:27:48.046181
47	1	C 200	C 200	t	2025-08-02 17:27:48.190633	2025-08-02 17:27:48.190633
48	1	C 300	C 300	t	2025-08-02 17:27:48.334222	2025-08-02 17:27:48.334222
49	1	Dynamic	Dynamic	t	2025-08-02 17:27:48.47896	2025-08-02 17:27:48.47896
50	1	E 350	E 350	t	2025-08-02 17:27:48.624082	2025-08-02 17:27:48.624082
51	1	E 450	E 450	t	2025-08-02 17:27:48.7689	2025-08-02 17:27:48.7689
52	1	ES 250	ES 250	t	2025-08-02 17:27:48.915192	2025-08-02 17:27:48.915192
53	1	ES 300h	ES 300h	t	2025-08-02 17:27:49.060759	2025-08-02 17:27:49.060759
54	1	ES 350	ES 350	t	2025-08-02 17:27:49.204191	2025-08-02 17:27:49.204191
55	1	EX	EX	t	2025-08-02 17:27:49.348768	2025-08-02 17:27:49.348768
56	1	EX-L	EX-L	t	2025-08-02 17:27:49.492084	2025-08-02 17:27:49.492084
57	1	F سبورت	F سبورت	t	2025-08-02 17:27:49.636835	2025-08-02 17:27:49.636835
58	1	First Edition	First Edition	t	2025-08-02 17:27:49.781697	2025-08-02 17:27:49.781697
59	1	G 550	G 550	t	2025-08-02 17:27:49.924965	2025-08-02 17:27:49.924965
60	1	GL	GL	t	2025-08-02 17:27:50.069439	2025-08-02 17:27:50.069439
61	1	GLE	GLE	t	2025-08-02 17:27:50.214013	2025-08-02 17:27:50.214013
62	1	GLE 350	GLE 350	t	2025-08-02 17:27:50.358707	2025-08-02 17:27:50.358707
63	1	GLE 450	GLE 450	t	2025-08-02 17:27:50.502139	2025-08-02 17:27:50.502139
64	1	GLE 53	GLE 53	t	2025-08-02 17:27:50.647089	2025-08-02 17:27:50.647089
65	1	GLE 63 S	GLE 63 S	t	2025-08-02 17:27:50.792741	2025-08-02 17:27:50.792741
66	1	GLX	GLX	t	2025-08-02 17:27:50.937445	2025-08-02 17:27:50.937445
67	1	GT	GT	t	2025-08-02 17:27:51.082125	2025-08-02 17:27:51.082125
68	1	GT لاين	GT لاين	t	2025-08-02 17:27:51.227585	2025-08-02 17:27:51.227585
69	1	GT2 RS	GT2 RS	t	2025-08-02 17:27:51.371104	2025-08-02 17:27:51.371104
70	1	GT3	GT3	t	2025-08-02 17:27:51.515723	2025-08-02 17:27:51.515723
71	1	GTI	GTI	t	2025-08-02 17:27:51.66045	2025-08-02 17:27:51.66045
72	1	GTS	GTS	t	2025-08-02 17:27:51.805654	2025-08-02 17:27:51.805654
73	1	GX	GX	t	2025-08-02 17:27:51.950215	2025-08-02 17:27:51.950215
74	1	GX 460	GX 460	t	2025-08-02 17:27:52.098249	2025-08-02 17:27:52.098249
75	1	GX 550	GX 550	t	2025-08-02 17:27:52.243449	2025-08-02 17:27:52.243449
76	1	GXR	GXR	t	2025-08-02 17:27:52.388386	2025-08-02 17:27:52.388386
77	1	HSE	HSE	t	2025-08-02 17:27:52.533076	2025-08-02 17:27:52.533076
78	1	HTRAC	HTRAC	t	2025-08-02 17:27:52.67761	2025-08-02 17:27:52.67761
79	1	L	L	t	2025-08-02 17:27:52.822097	2025-08-02 17:27:52.822097
80	1	LE	LE	t	2025-08-02 17:27:52.966556	2025-08-02 17:27:52.966556
81	1	LE (بلاتينيوم)	LE (بلاتينيوم)	t	2025-08-02 17:27:53.11072	2025-08-02 17:27:53.11072
82	1	LE (تيتانيوم)	LE (تيتانيوم)	t	2025-08-02 17:27:53.255526	2025-08-02 17:27:53.255526
83	1	LS	LS	t	2025-08-02 17:27:53.39916	2025-08-02 17:27:53.39916
84	1	LT	LT	t	2025-08-02 17:27:53.544423	2025-08-02 17:27:53.544423
85	1	LT1	LT1	t	2025-08-02 17:27:53.688983	2025-08-02 17:27:53.688983
86	1	LTZ	LTZ	t	2025-08-02 17:27:53.834463	2025-08-02 17:27:53.834463
87	1	LX	LX	t	2025-08-02 17:27:53.978189	2025-08-02 17:27:53.978189
88	1	LX 600	LX 600	t	2025-08-02 17:27:54.123102	2025-08-02 17:27:54.123102
89	1	M3	M3	t	2025-08-02 17:27:54.267907	2025-08-02 17:27:54.267907
90	1	M340i	M340i	t	2025-08-02 17:27:54.412474	2025-08-02 17:27:54.412474
91	1	M5	M5	t	2025-08-02 17:27:54.557458	2025-08-02 17:27:54.557458
92	1	M560i	M560i	t	2025-08-02 17:27:54.702166	2025-08-02 17:27:54.702166
93	1	M60i	M60i	t	2025-08-02 17:27:54.846691	2025-08-02 17:27:54.846691
94	1	P250 S	P250 S	t	2025-08-02 17:27:54.992006	2025-08-02 17:27:54.992006
95	1	P250 SE	P250 SE	t	2025-08-02 17:27:55.137388	2025-08-02 17:27:55.137388
96	1	P300 R-Dynamic S	P300 R-Dynamic S	t	2025-08-02 17:27:55.282045	2025-08-02 17:27:55.282045
97	1	P300 R-Dynamic SE	P300 R-Dynamic SE	t	2025-08-02 17:27:55.426632	2025-08-02 17:27:55.426632
98	1	P300e	P300e	t	2025-08-02 17:27:55.570991	2025-08-02 17:27:55.570991
99	1	P400 R-Dynamic S	P400 R-Dynamic S	t	2025-08-02 17:27:55.717669	2025-08-02 17:27:55.717669
100	1	P400 R-Dynamic SE	P400 R-Dynamic SE	t	2025-08-02 17:27:55.861023	2025-08-02 17:27:55.861023
101	1	P400e	P400e	t	2025-08-02 17:27:56.006032	2025-08-02 17:27:56.006032
102	1	P450 R-Dynamic	P450 R-Dynamic	t	2025-08-02 17:27:56.150723	2025-08-02 17:27:56.150723
103	1	P530	P530	t	2025-08-02 17:27:56.29412	2025-08-02 17:27:56.29412
104	1	P575 R	P575 R	t	2025-08-02 17:27:56.43861	2025-08-02 17:27:56.43861
105	1	R	R	t	2025-08-02 17:27:56.583883	2025-08-02 17:27:56.583883
106	1	R-Dynamic	R-Dynamic	t	2025-08-02 17:27:56.729887	2025-08-02 17:27:56.729887
107	1	R-لاين	R-لاين	t	2025-08-02 17:27:56.9235	2025-08-02 17:27:56.9235
108	1	R/T	R/T	t	2025-08-02 17:27:57.06714	2025-08-02 17:27:57.06714
109	1	RS	RS	t	2025-08-02 17:27:57.211908	2025-08-02 17:27:57.211908
110	1	RST	RST	t	2025-08-02 17:27:57.356736	2025-08-02 17:27:57.356736
111	1	RX 350	RX 350	t	2025-08-02 17:27:57.503594	2025-08-02 17:27:57.503594
112	1	RX 450h	RX 450h	t	2025-08-02 17:27:57.648114	2025-08-02 17:27:57.648114
113	1	RX 500h	RX 500h	t	2025-08-02 17:27:57.792937	2025-08-02 17:27:57.792937
114	1	S	S	t	2025-08-02 17:27:57.937384	2025-08-02 17:27:57.937384
115	1	S 450	S 450	t	2025-08-02 17:27:58.082111	2025-08-02 17:27:58.082111
116	1	S 500	S 500	t	2025-08-02 17:27:58.226779	2025-08-02 17:27:58.226779
117	1	S 580	S 580	t	2025-08-02 17:27:58.371142	2025-08-02 17:27:58.371142
118	1	S 680 (مايباخ)	S 680 (مايباخ)	t	2025-08-02 17:27:58.516663	2025-08-02 17:27:58.516663
119	1	SE	SE	t	2025-08-02 17:27:58.660061	2025-08-02 17:27:58.660061
120	1	SEL	SEL	t	2025-08-02 17:27:58.804556	2025-08-02 17:27:58.804556
121	1	SEL R-لاين	SEL R-لاين	t	2025-08-02 17:27:58.948117	2025-08-02 17:27:58.948117
122	1	SL	SL	t	2025-08-02 17:27:59.093073	2025-08-02 17:27:59.093073
123	1	SLE	SLE	t	2025-08-02 17:27:59.238052	2025-08-02 17:27:59.238052
124	1	SLT	SLT	t	2025-08-02 17:27:59.382589	2025-08-02 17:27:59.382589
125	1	SQ5	SQ5	t	2025-08-02 17:27:59.527134	2025-08-02 17:27:59.527134
126	1	SQ7	SQ7	t	2025-08-02 17:27:59.671785	2025-08-02 17:27:59.671785
127	1	SR	SR	t	2025-08-02 17:27:59.815192	2025-08-02 17:27:59.815192
128	1	SR5	SR5	t	2025-08-02 17:27:59.960421	2025-08-02 17:27:59.960421
129	1	SRT	SRT	t	2025-08-02 17:28:00.104911	2025-08-02 17:28:00.104911
130	1	ST	ST	t	2025-08-02 17:28:00.249651	2025-08-02 17:28:00.249651
131	1	ST-لاين	ST-لاين	t	2025-08-02 17:28:00.394348	2025-08-02 17:28:00.394348
132	1	STO	STO	t	2025-08-02 17:28:00.539051	2025-08-02 17:28:00.539051
133	1	SUV	SUV	t	2025-08-02 17:28:00.683406	2025-08-02 17:28:00.683406
134	1	SV	SV	t	2025-08-02 17:28:00.828491	2025-08-02 17:28:00.828491
135	1	SVR	SVR	t	2025-08-02 17:28:00.972922	2025-08-02 17:28:00.972922
136	1	SX	SX	t	2025-08-02 17:28:01.117466	2025-08-02 17:28:01.117466
137	1	SXT	SXT	t	2025-08-02 17:28:01.26195	2025-08-02 17:28:01.26195
138	1	TRD	TRD	t	2025-08-02 17:28:01.406657	2025-08-02 17:28:01.406657
139	1	TRD أوف-رود	TRD أوف-رود	t	2025-08-02 17:28:01.554082	2025-08-02 17:28:01.554082
140	1	V8	V8	t	2025-08-02 17:28:01.703862	2025-08-02 17:28:01.703862
141	1	VXR	VXR	t	2025-08-02 17:28:01.848545	2025-08-02 17:28:01.848545
142	1	W12	W12	t	2025-08-02 17:28:01.993414	2025-08-02 17:28:01.993414
143	1	WT	WT	t	2025-08-02 17:28:02.138149	2025-08-02 17:28:02.138149
144	1	X	X	t	2025-08-02 17:28:02.283369	2025-08-02 17:28:02.283369
145	1	X-برو	X-برو	t	2025-08-02 17:28:02.42793	2025-08-02 17:28:02.42793
146	1	X-ديناميك HSE	X-ديناميك HSE	t	2025-08-02 17:28:02.57315	2025-08-02 17:28:02.57315
147	1	X-ديناميك S	X-ديناميك S	t	2025-08-02 17:28:02.717483	2025-08-02 17:28:02.717483
148	1	X-ديناميك SE	X-ديناميك SE	t	2025-08-02 17:28:02.862555	2025-08-02 17:28:02.862555
149	1	X-لاين	X-لاين	t	2025-08-02 17:28:03.006229	2025-08-02 17:28:03.006229
150	1	X5 M	X5 M	t	2025-08-02 17:28:03.153747	2025-08-02 17:28:03.153747
151	1	XE	XE	t	2025-08-02 17:28:03.297097	2025-08-02 17:28:03.297097
152	1	XL	XL	t	2025-08-02 17:28:03.441934	2025-08-02 17:28:03.441934
153	1	XLE	XLE	t	2025-08-02 17:28:03.5868	2025-08-02 17:28:03.5868
154	1	XLE بريميوم	XLE بريميوم	t	2025-08-02 17:28:03.731237	2025-08-02 17:28:03.731237
155	1	XLT	XLT	t	2025-08-02 17:28:03.876053	2025-08-02 17:28:03.876053
156	1	XSE	XSE	t	2025-08-02 17:28:04.020628	2025-08-02 17:28:04.020628
157	1	Z06	Z06	t	2025-08-02 17:28:04.167743	2025-08-02 17:28:04.167743
158	1	Z71	Z71	t	2025-08-02 17:28:04.31246	2025-08-02 17:28:04.31246
159	1	ZL1	ZL1	t	2025-08-02 17:28:04.458561	2025-08-02 17:28:04.458561
160	1	ZR1	ZR1	t	2025-08-02 17:28:04.603188	2025-08-02 17:28:04.603188
161	1	ZR2	ZR2	t	2025-08-02 17:28:04.74873	2025-08-02 17:28:04.74873
162	1	i7	i7	t	2025-08-02 17:28:04.892071	2025-08-02 17:28:04.892071
163	1	xDrive40i	xDrive40i	t	2025-08-02 17:28:05.036671	2025-08-02 17:28:05.036671
164	1	xDrive50e	xDrive50e	t	2025-08-02 17:28:05.179931	2025-08-02 17:28:05.179931
165	1	آوت باوند	آوت باوند	t	2025-08-02 17:28:05.324655	2025-08-02 17:28:05.324655
166	1	أدفينشر	أدفينشر	t	2025-08-02 17:28:05.469077	2025-08-02 17:28:05.469077
167	1	ألبينا XB7	ألبينا XB7	t	2025-08-02 17:28:05.614377	2025-08-02 17:28:05.614377
168	1	ألترا لكجري	ألترا لكجري	t	2025-08-02 17:28:05.75912	2025-08-02 17:28:05.75912
169	1	ألتيميت	ألتيميت	t	2025-08-02 17:28:05.903137	2025-08-02 17:28:05.903137
170	1	أوتر بانكس	أوتر بانكس	t	2025-08-02 17:28:06.048103	2025-08-02 17:28:06.048103
171	1	أوفر تريل	أوفر تريل	t	2025-08-02 17:28:06.192814	2025-08-02 17:28:06.192814
172	1	أوفرلاند	أوفرلاند	t	2025-08-02 17:28:06.338131	2025-08-02 17:28:06.338131
173	1	إليت	إليت	t	2025-08-02 17:28:06.483086	2025-08-02 17:28:06.483086
174	1	إليجانس	إليجانس	t	2025-08-02 17:28:06.627776	2025-08-02 17:28:06.627776
175	1	إليفيشن	إليفيشن	t	2025-08-02 17:28:06.772209	2025-08-02 17:28:06.772209
176	1	إي-راي	إي-راي	t	2025-08-02 17:28:06.916118	2025-08-02 17:28:06.916118
177	1	إي-هايبريد	إي-هايبريد	t	2025-08-02 17:28:07.062189	2025-08-02 17:28:07.062189
178	1	إيفو	إيفو	t	2025-08-02 17:28:07.206753	2025-08-02 17:28:07.206753
179	1	إيكوبوست	إيكوبوست	t	2025-08-02 17:28:07.355403	2025-08-02 17:28:07.355403
180	1	باد لاندز	باد لاندز	t	2025-08-02 17:28:07.500972	2025-08-02 17:28:07.500972
181	1	برستيج	برستيج	t	2025-08-02 17:28:07.645503	2025-08-02 17:28:07.645503
182	1	برو	برو	t	2025-08-02 17:28:07.791713	2025-08-02 17:28:07.791713
183	1	بريمير	بريمير	t	2025-08-02 17:28:07.935084	2025-08-02 17:28:07.935084
184	1	بريميوم	بريميوم	t	2025-08-02 17:28:08.081133	2025-08-02 17:28:08.081133
185	1	بريميوم بلس	بريميوم بلس	t	2025-08-02 17:28:08.22563	2025-08-02 17:28:08.22563
186	1	بلاتينيوم	بلاتينيوم	t	2025-08-02 17:28:08.37053	2025-08-02 17:28:08.37053
187	1	بلاك إيديشن	بلاك إيديشن	t	2025-08-02 17:28:08.515216	2025-08-02 17:28:08.515216
188	1	بلاك بادج	بلاك بادج	t	2025-08-02 17:28:08.661254	2025-08-02 17:28:08.661254
189	1	بلاك دايموند	بلاك دايموند	t	2025-08-02 17:28:08.805647	2025-08-02 17:28:08.805647
190	1	بلاك ليبل	بلاك ليبل	t	2025-08-02 17:28:08.952109	2025-08-02 17:28:08.952109
191	1	بلايد	بلايد	t	2025-08-02 17:28:09.097343	2025-08-02 17:28:09.097343
192	1	بلس	بلس	t	2025-08-02 17:28:09.242939	2025-08-02 17:28:09.242939
193	1	بيج بيند	بيج بيند	t	2025-08-02 17:28:09.387564	2025-08-02 17:28:09.387564
194	1	بيرفورمانتي	بيرفورمانتي	t	2025-08-02 17:28:09.532162	2025-08-02 17:28:09.532162
195	1	بيرفورمانس	بيرفورمانس	t	2025-08-02 17:28:09.677104	2025-08-02 17:28:09.677104
196	1	بيز	بيز	t	2025-08-02 17:28:09.822432	2025-08-02 17:28:09.822432
197	1	بيناكلي	بيناكلي	t	2025-08-02 17:28:09.96735	2025-08-02 17:28:09.96735
198	1	بيور	بيور	t	2025-08-02 17:28:10.118044	2025-08-02 17:28:10.118044
199	1	تارغا	تارغا	t	2025-08-02 17:28:10.263638	2025-08-02 17:28:10.263638
200	1	تريل سبورت	تريل سبورت	t	2025-08-02 17:28:10.40946	2025-08-02 17:28:10.40946
201	1	توربو	توربو	t	2025-08-02 17:28:10.555327	2025-08-02 17:28:10.555327
202	1	توربو GT	توربو GT	t	2025-08-02 17:28:10.699166	2025-08-02 17:28:10.699166
203	1	توربو S	توربو S	t	2025-08-02 17:28:10.844242	2025-08-02 17:28:10.844242
204	1	توربو إي-هايبريد	توربو إي-هايبريد	t	2025-08-02 17:28:10.989602	2025-08-02 17:28:10.989602
205	1	تورينج	تورينج	t	2025-08-02 17:28:11.133188	2025-08-02 17:28:11.133188
206	1	تورينج L	تورينج L	t	2025-08-02 17:28:11.280481	2025-08-02 17:28:11.280481
207	1	تيكنيكا	تيكنيكا	t	2025-08-02 17:28:11.42511	2025-08-02 17:28:11.42511
208	1	تيمبرلاين	تيمبرلاين	t	2025-08-02 17:28:11.569699	2025-08-02 17:28:11.569699
209	1	جراند تورينج	جراند تورينج	t	2025-08-02 17:28:11.713301	2025-08-02 17:28:11.713301
210	1	دارك هورس	دارك هورس	t	2025-08-02 17:28:11.857987	2025-08-02 17:28:11.857987
211	1	دفع خلفي	دفع خلفي	t	2025-08-02 17:28:12.003146	2025-08-02 17:28:12.003146
212	1	دفع رباعي	دفع رباعي	t	2025-08-02 17:28:12.147864	2025-08-02 17:28:12.147864
213	1	دينالي	دينالي	t	2025-08-02 17:28:12.292856	2025-08-02 17:28:12.292856
214	1	دينالي ألتيميت	دينالي ألتيميت	t	2025-08-02 17:28:12.439342	2025-08-02 17:28:12.439342
215	1	رابتور	رابتور	t	2025-08-02 17:28:12.584267	2025-08-02 17:28:12.584267
216	1	روبيكون	روبيكون	t	2025-08-02 17:28:12.7288	2025-08-02 17:28:12.7288
217	1	ريسيرف	ريسيرف	t	2025-08-02 17:28:12.873156	2025-08-02 17:28:12.873156
218	1	سافاير	سافاير	t	2025-08-02 17:28:13.017906	2025-08-02 17:28:13.017906
219	1	سايبربيست	سايبربيست	t	2025-08-02 17:28:13.162336	2025-08-02 17:28:13.162336
220	1	سبايدر	سبايدر	t	2025-08-02 17:28:13.307482	2025-08-02 17:28:13.307482
221	1	سبورت	سبورت	t	2025-08-02 17:28:13.453043	2025-08-02 17:28:13.453043
222	1	سبورت توريزمو	سبورت توريزمو	t	2025-08-02 17:28:13.597381	2025-08-02 17:28:13.597381
223	1	سبيد	سبيد	t	2025-08-02 17:28:13.741927	2025-08-02 17:28:13.741927
224	1	ستاندرد	ستاندرد	t	2025-08-02 17:28:13.888128	2025-08-02 17:28:13.888128
225	1	ستينغراي	ستينغراي	t	2025-08-02 17:28:14.032633	2025-08-02 17:28:14.032633
226	1	سكات باك	سكات باك	t	2025-08-02 17:28:14.226365	2025-08-02 17:28:14.226365
227	1	سمارت	سمارت	t	2025-08-02 17:28:14.37162	2025-08-02 17:28:14.37162
228	1	سميت	سميت	t	2025-08-02 17:28:14.515153	2025-08-02 17:28:14.515153
229	1	سميت ريسيرف	سميت ريسيرف	t	2025-08-02 17:28:14.659857	2025-08-02 17:28:14.659857
230	1	سيدان	سيدان	t	2025-08-02 17:28:14.804385	2025-08-02 17:28:14.804385
231	1	شيلبي GT500	شيلبي GT500	t	2025-08-02 17:28:14.949008	2025-08-02 17:28:14.949008
232	1	صحارى	صحارى	t	2025-08-02 17:28:15.093542	2025-08-02 17:28:15.093542
233	1	فئات حسب السوق	فئات حسب السوق	t	2025-08-02 17:28:15.238425	2025-08-02 17:28:15.238425
234	1	فئات متنوعة	فئات متنوعة	t	2025-08-02 17:28:15.383499	2025-08-02 17:28:15.383499
235	1	قاعدة عجلات قياسية	قاعدة عجلات قياسية	t	2025-08-02 17:28:15.52779	2025-08-02 17:28:15.52779
236	1	قاعدة عجلات ممتدة	قاعدة عجلات ممتدة	t	2025-08-02 17:28:15.672507	2025-08-02 17:28:15.672507
237	1	كابريوليه	كابريوليه	t	2025-08-02 17:28:15.816899	2025-08-02 17:28:15.816899
238	1	كاريرا	كاريرا	t	2025-08-02 17:28:15.961617	2025-08-02 17:28:15.961617
239	1	كاريرا GTS	كاريرا GTS	t	2025-08-02 17:28:16.106067	2025-08-02 17:28:16.106067
240	1	كاريرا S	كاريرا S	t	2025-08-02 17:28:16.250513	2025-08-02 17:28:16.250513
241	1	كاستم	كاستم	t	2025-08-02 17:28:16.395119	2025-08-02 17:28:16.395119
242	1	كاليكرافي	كاليكرافي	t	2025-08-02 17:28:16.539569	2025-08-02 17:28:16.539569
243	1	كبينة مزدوجة	كبينة مزدوجة	t	2025-08-02 17:28:16.684013	2025-08-02 17:28:16.684013
244	1	كبينة واحدة	كبينة واحدة	t	2025-08-02 17:28:16.828518	2025-08-02 17:28:16.828518
245	1	كروس توريزمو	كروس توريزمو	t	2025-08-02 17:28:17.074661	2025-08-02 17:28:17.074661
246	1	كمفورت	كمفورت	t	2025-08-02 17:28:17.219656	2025-08-02 17:28:17.219656
247	1	كهربائية	كهربائية	t	2025-08-02 17:28:17.363172	2025-08-02 17:28:17.363172
248	1	كوبيه	كوبيه	t	2025-08-02 17:28:17.507829	2025-08-02 17:28:17.507829
249	1	كور	كور	t	2025-08-02 17:28:17.653678	2025-08-02 17:28:17.653678
250	1	كينج رانش	كينج رانش	t	2025-08-02 17:28:17.798236	2025-08-02 17:28:17.798236
251	1	لاريات	لاريات	t	2025-08-02 17:28:17.942741	2025-08-02 17:28:17.942741
252	1	لاريدو	لاريدو	t	2025-08-02 17:28:18.087867	2025-08-02 17:28:18.087867
253	1	لكجري	لكجري	t	2025-08-02 17:28:18.23239	2025-08-02 17:28:18.23239
254	1	ليميتد	ليميتد	t	2025-08-02 17:28:18.376711	2025-08-02 17:28:18.376711
255	1	مدى طويل	مدى طويل	t	2025-08-02 17:28:18.521591	2025-08-02 17:28:18.521591
256	1	موهافي	موهافي	t	2025-08-02 17:28:18.666951	2025-08-02 17:28:18.666951
257	1	نايت شيد	نايت شيد	t	2025-08-02 17:28:18.811308	2025-08-02 17:28:18.811308
258	1	هاي كنتري	هاي كنتري	t	2025-08-02 17:28:18.955669	2025-08-02 17:28:18.955669
259	1	هايبريد	هايبريد	t	2025-08-02 17:28:19.099171	2025-08-02 17:28:19.099171
260	1	هايبريد سوبركار	هايبريد سوبركار	t	2025-08-02 17:28:19.24393	2025-08-02 17:28:19.24393
261	1	هيلكات	هيلكات	t	2025-08-02 17:28:19.388077	2025-08-02 17:28:19.388077
262	1	وايلدتراك	وايلدتراك	t	2025-08-02 17:28:19.533959	2025-08-02 17:28:19.533959
263	1	ويليس	ويليس	t	2025-08-02 17:28:19.678408	2025-08-02 17:28:19.678408
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: appearance_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.appearance_settings_id_seq', 1, false);


--
-- Name: bank_interest_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bank_interest_rates_id_seq', 1, false);


--
-- Name: banks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.banks_id_seq', 10, true);


--
-- Name: color_associations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.color_associations_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, false);


--
-- Name: financing_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.financing_calculations_id_seq', 1, false);


--
-- Name: financing_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.financing_rates_id_seq', 1, false);


--
-- Name: image_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.image_links_id_seq', 1, false);


--
-- Name: import_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.import_types_id_seq', 1, false);


--
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 480, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: location_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.location_transfers_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: low_stock_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.low_stock_alerts_id_seq', 1, false);


--
-- Name: manufacturers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.manufacturers_id_seq', 30, true);


--
-- Name: ownership_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.ownership_types_id_seq', 1, false);


--
-- Name: pdf_appearance_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pdf_appearance_settings_id_seq', 1, false);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotations_id_seq', 1, false);


--
-- Name: specifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.specifications_id_seq', 1, false);


--
-- Name: stock_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_settings_id_seq', 1, false);


--
-- Name: terms_and_conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.terms_and_conditions_id_seq', 1, false);


--
-- Name: trim_levels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.trim_levels_id_seq', 1, false);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_sessions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: vehicle_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vehicle_categories_id_seq', 116, true);


--
-- Name: vehicle_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vehicle_statuses_id_seq', 1, false);


--
-- Name: vehicle_trim_levels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vehicle_trim_levels_id_seq', 263, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: appearance_settings appearance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appearance_settings
    ADD CONSTRAINT appearance_settings_pkey PRIMARY KEY (id);


--
-- Name: bank_interest_rates bank_interest_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_interest_rates
    ADD CONSTRAINT bank_interest_rates_pkey PRIMARY KEY (id);


--
-- Name: banks banks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banks
    ADD CONSTRAINT banks_pkey PRIMARY KEY (id);


--
-- Name: color_associations color_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.color_associations
    ADD CONSTRAINT color_associations_pkey PRIMARY KEY (id);


--
-- Name: companies companies_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_unique UNIQUE (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: financing_calculations financing_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financing_calculations
    ADD CONSTRAINT financing_calculations_pkey PRIMARY KEY (id);


--
-- Name: financing_rates financing_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financing_rates
    ADD CONSTRAINT financing_rates_pkey PRIMARY KEY (id);


--
-- Name: image_links image_links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.image_links
    ADD CONSTRAINT image_links_pkey PRIMARY KEY (id);


--
-- Name: import_types import_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_types
    ADD CONSTRAINT import_types_name_unique UNIQUE (name);


--
-- Name: import_types import_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.import_types
    ADD CONSTRAINT import_types_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_chassis_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_chassis_number_unique UNIQUE (chassis_number);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: location_transfers location_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_transfers
    ADD CONSTRAINT location_transfers_pkey PRIMARY KEY (id);


--
-- Name: locations locations_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_name_unique UNIQUE (name);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: low_stock_alerts low_stock_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.low_stock_alerts
    ADD CONSTRAINT low_stock_alerts_pkey PRIMARY KEY (id);


--
-- Name: manufacturers manufacturers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.manufacturers
    ADD CONSTRAINT manufacturers_pkey PRIMARY KEY (id);


--
-- Name: ownership_types ownership_types_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ownership_types
    ADD CONSTRAINT ownership_types_name_unique UNIQUE (name);


--
-- Name: ownership_types ownership_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ownership_types
    ADD CONSTRAINT ownership_types_pkey PRIMARY KEY (id);


--
-- Name: pdf_appearance_settings pdf_appearance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pdf_appearance_settings
    ADD CONSTRAINT pdf_appearance_settings_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quote_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quote_number_unique UNIQUE (quote_number);


--
-- Name: specifications specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.specifications
    ADD CONSTRAINT specifications_pkey PRIMARY KEY (id);


--
-- Name: stock_settings stock_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_settings
    ADD CONSTRAINT stock_settings_pkey PRIMARY KEY (id);


--
-- Name: terms_and_conditions terms_and_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.terms_and_conditions
    ADD CONSTRAINT terms_and_conditions_pkey PRIMARY KEY (id);


--
-- Name: trim_levels trim_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.trim_levels
    ADD CONSTRAINT trim_levels_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vehicle_categories vehicle_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_categories
    ADD CONSTRAINT vehicle_categories_pkey PRIMARY KEY (id);


--
-- Name: vehicle_statuses vehicle_statuses_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_statuses
    ADD CONSTRAINT vehicle_statuses_name_unique UNIQUE (name);


--
-- Name: vehicle_statuses vehicle_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_statuses
    ADD CONSTRAINT vehicle_statuses_pkey PRIMARY KEY (id);


--
-- Name: vehicle_trim_levels vehicle_trim_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_trim_levels
    ADD CONSTRAINT vehicle_trim_levels_pkey PRIMARY KEY (id);


--
-- Name: bank_interest_rates bank_interest_rates_bank_id_banks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bank_interest_rates
    ADD CONSTRAINT bank_interest_rates_bank_id_banks_id_fk FOREIGN KEY (bank_id) REFERENCES public.banks(id);


--
-- Name: invoices invoices_quotation_id_quotations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_quotation_id_quotations_id_fk FOREIGN KEY (quotation_id) REFERENCES public.quotations(id);


--
-- Name: terms_and_conditions terms_and_conditions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.terms_and_conditions
    ADD CONSTRAINT terms_and_conditions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: vehicle_categories vehicle_categories_manufacturer_id_manufacturers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_categories
    ADD CONSTRAINT vehicle_categories_manufacturer_id_manufacturers_id_fk FOREIGN KEY (manufacturer_id) REFERENCES public.manufacturers(id);


--
-- Name: vehicle_trim_levels vehicle_trim_levels_category_id_vehicle_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicle_trim_levels
    ADD CONSTRAINT vehicle_trim_levels_category_id_vehicle_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.vehicle_categories(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

