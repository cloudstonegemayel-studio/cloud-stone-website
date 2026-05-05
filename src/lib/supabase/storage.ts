import { createClient } from "@/lib/supabase/client";

const BUCKET = "project-media";

export async function uploadProjectImage(
  file: File,
  projectId: string,
  scope = "misc"
): Promise<string> {
  const supabase = createClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${projectId}/${scope}/${name}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProjectImage(url: string): Promise<void> {
  const supabase = createClient();
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
