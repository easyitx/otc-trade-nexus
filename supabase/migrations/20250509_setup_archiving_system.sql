
-- This migration file sets up the database functions needed for the archiving system

-- Function to enable necessary extensions
CREATE OR REPLACE FUNCTION public.setup_archiving_extensions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create extension pg_cron if it doesn't exist
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  
  -- Create extension pg_net if it doesn't exist
  CREATE EXTENSION IF NOT EXISTS pg_net;
END;
$$;

-- Function to set up or replace the cron job
CREATE OR REPLACE FUNCTION public.setup_archive_cron_job(function_url text, anon_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop the cron job if it already exists to avoid duplicates
  PERFORM cron.unschedule('archive-expired-orders-hourly');
  
  -- Create a new cron job that runs every hour
  -- It calls our edge function to archive expired orders
  PERFORM cron.schedule(
    'archive-expired-orders-hourly',
    '0 * * * *', -- Run at the start of every hour (cron syntax: minute hour day month weekday)
    $$
    SELECT
      net.http_post(
        url:=$$ || quote_literal(function_url) || $$,
        headers:=$$ || quote_literal(format('{"Content-Type": "application/json", "Authorization": "Bearer %s"}', anon_key))::text || $$::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
END;
$$;

-- Create a one-time function that can be called manually to archive expired orders right now
CREATE OR REPLACE FUNCTION public.archive_expired_orders_now()
RETURNS TABLE(archived_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update orders that have expired but are not yet archived
  RETURN QUERY
  UPDATE public.orders
  SET status = 'ARCHIVED'
  WHERE 
    status != 'ARCHIVED' AND
    expires_at < NOW()
  RETURNING id as archived_id;
END;
$$;
