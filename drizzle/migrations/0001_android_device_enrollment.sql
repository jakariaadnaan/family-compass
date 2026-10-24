CREATE TABLE public.device_credentials (
 device_id uuid PRIMARY KEY REFERENCES public.devices(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL DEFAULT now() + interval '90 days'
);
GRANT ALL ON public.device_credentials TO service_role;
ALTER TABLE public.device_credentials ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.enrollment_rate_limit (
 minute timestamptz PRIMARY KEY,
 attempts integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.enrollment_rate_limit TO service_role;
ALTER TABLE public.enrollment_rate_limit ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.enroll_android(_code text, _token_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE c public.device_pairing_codes%ROWTYPE; d uuid; attempts_now integer;
BEGIN
 IF _code !~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$' OR _token_hash !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('error','invalid_request'); END IF;
 INSERT INTO public.enrollment_rate_limit(minute, attempts) VALUES(date_trunc('minute',now()),1)
 ON CONFLICT(minute) DO UPDATE SET attempts = enrollment_rate_limit.attempts + 1 RETURNING attempts INTO attempts_now;
 DELETE FROM public.enrollment_rate_limit WHERE minute < now() - interval '1 hour';
 IF attempts_now > 120 THEN RETURN jsonb_build_object('error','rate_limited'); END IF;
 SELECT * INTO c FROM public.device_pairing_codes WHERE code_hash = encode(digest(_code,'sha256'),'hex') AND used_at IS NULL AND expires_at > now() FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('error','invalid_pairing_code'); END IF;
 INSERT INTO public.devices(owner_id,name,platform,status,last_seen_at) VALUES(c.owner_id,c.device_name,'android','active',now()) RETURNING id INTO d;
 INSERT INTO public.device_credentials(device_id,token_hash) VALUES(d,_token_hash);
 UPDATE public.device_pairing_codes SET used_at=now() WHERE id=c.id;
 INSERT INTO public.audit_logs(user_id,action,target) VALUES(c.owner_id,'device.enrolled',c.device_name);
 RETURN jsonb_build_object('device_id',d,'device_name',c.device_name,'expires_at',now()+interval '90 days');
END $$;
REVOKE ALL ON FUNCTION public.enroll_android(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enroll_android(text,text) TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.android_status(_token_hash text, _disconnect boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d uuid;
BEGIN
 SELECT device_id INTO d FROM public.device_credentials WHERE token_hash=_token_hash AND expires_at>now() FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('error','unauthorized'); END IF;
 IF _disconnect THEN
  DELETE FROM public.devices WHERE id=d;
  RETURN jsonb_build_object('disconnected',true);
 END IF;
 UPDATE public.devices SET last_seen_at=now(),status='active' WHERE id=d;
 RETURN jsonb_build_object('synced_at',now());
END $$;
REVOKE ALL ON FUNCTION public.android_status(text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.android_status(text,boolean) TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.audit_device_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF tg_op='DELETE' THEN
  INSERT INTO audit_logs(user_id,action,target) VALUES(old.owner_id,'device.removed',old.name); RETURN old;
 ELSIF tg_op='UPDATE' THEN
  IF new.name IS DISTINCT FROM old.name OR new.location_consent IS DISTINCT FROM old.location_consent OR new.usage_consent IS DISTINCT FROM old.usage_consent OR new.status IS DISTINCT FROM old.status THEN
   INSERT INTO audit_logs(user_id,action,target) VALUES(new.owner_id,'device.updated',new.name);
  END IF;
  RETURN new;
 END IF;
 RETURN new;
END $$;