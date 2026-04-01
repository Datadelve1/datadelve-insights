import { supabase } from "@/integrations/supabase/client";

interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  onProgress: (percent: number) => void;
}

export async function uploadWithProgress({ bucket, path, file, onProgress }: UploadOptions): Promise<string> {
  // Get the upload URL and auth token
  const { data: { session } } = await supabase.auth.getSession();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const token = session?.access_token || anonKey;

  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 90); // 0-90% for upload
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(95);
        resolve("ok");
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed: network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.send(file);
  });
}
