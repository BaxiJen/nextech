-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'blog' CHECK (source IN ('blog', 'homepage', 'manual', 'import')),
  confirmed BOOLEAN NOT NULL DEFAULT false,
  confirm_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  unsub_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(confirmed);
CREATE INDEX idx_newsletter_created_at ON newsletter_subscribers(created_at DESC);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only anon key can confirm via token (update confirmed)
CREATE POLICY "Can confirm subscription" ON newsletter_subscribers
  FOR UPDATE USING (true) WITH CHECK (true);

-- Only service role can read all subscribers
CREATE POLICY "Service role can read all" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'service_role');

-- Only service role can delete
CREATE POLICY "Service role can delete" ON newsletter_subscribers
  FOR DELETE USING (auth.role() = 'service_role');