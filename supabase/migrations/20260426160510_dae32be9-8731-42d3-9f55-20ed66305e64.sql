ALTER TABLE public.properties
ADD COLUMN description_heading_style text NOT NULL DEFAULT 'soft'
CHECK (description_heading_style IN ('h3', 'soft'));