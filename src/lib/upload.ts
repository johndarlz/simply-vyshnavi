import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-media";

export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  // Bucket is private, so hand back a long-lived signed URL (10 years).
  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signError || !signed) throw signError ?? new Error("Could not create media URL");
  return signed.signedUrl;
}
