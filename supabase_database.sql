-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auth_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ip_address character varying NOT NULL,
  email character varying,
  user_id uuid,
  attempt_type character varying NOT NULL,
  success boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auth_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT auth_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  service_type character varying NOT NULL,
  package_id character varying NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  instagram_username character varying NOT NULL,
  post_url text,
  status character varying DEFAULT 'pending'::character varying,
  payment_id character varying,
  payment_preference_id character varying,
  payment_status character varying,
  pix_qr_code text,
  pix_qr_code_base64 text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.password_resets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  token_hash text NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT password_resets_pkey PRIMARY KEY (id),
  CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  role character varying DEFAULT 'user'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);