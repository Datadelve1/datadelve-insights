INSERT INTO storage.buckets (id, name, public) VALUES ('ambassador-assets', 'ambassador-assets', true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read ambassador assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'ambassador-assets');