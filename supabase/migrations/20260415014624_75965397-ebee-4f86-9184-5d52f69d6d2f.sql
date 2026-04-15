
-- Allow internal roles to upload images to property-images bucket
CREATE POLICY "Internal roles can upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND has_any_role(auth.uid(), ARRAY['corretor','vendas','administrativo','superadmin']::app_role[])
);

-- Allow internal roles to update their uploaded images
CREATE POLICY "Internal roles can update property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND has_any_role(auth.uid(), ARRAY['corretor','vendas','administrativo','superadmin']::app_role[])
);

-- Allow internal roles to delete property images
CREATE POLICY "Internal roles can delete property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND has_any_role(auth.uid(), ARRAY['corretor','vendas','administrativo','superadmin']::app_role[])
);
