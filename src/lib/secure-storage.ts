import { supabase } from '@/integrations/supabase/client';

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/secure-storage`;

export type StorageBucket =
  | 'customer-documents'
  | 'contract-documents'
  | 'internal-documents'
  | 'ombudsman-attachments'
  | 'form-attachments'
  | 'resumes'
  | 'property-images';

interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  /** Folder prefix (e.g. user_id for ownership isolation) */
  folder?: string;
}

interface UploadResult {
  path: string;
  bucket: string;
  size: number;
  originalName: string;
}

interface DownloadResult {
  url: string;
  expiresIn: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

/**
 * Upload a file securely through the edge function.
 * - Validates file type, size, extension server-side
 * - Generates non-predictable filenames
 * - Logs the operation to audit_log
 */
export async function secureUpload({ bucket, file, folder }: UploadOptions): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);
  if (folder) formData.append('folder', folder);

  const headers = await getAuthHeaders();

  const res = await fetch(`${FUNCTION_URL}?action=upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro no upload');
  return data as UploadResult;
}

/**
 * Get a short-lived signed URL for downloading a file.
 * - Validates ownership for client-facing buckets
 * - Returns URL with 60s expiration (5min for public images)
 * - Logs the operation to audit_log
 */
export async function secureDownload(bucket: StorageBucket, path: string): Promise<DownloadResult> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${FUNCTION_URL}?action=download`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket, path }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro no download');
  return data as DownloadResult;
}

/**
 * Delete a file (admin only).
 * - Validates admin role server-side
 * - Logs the operation to audit_log
 */
export async function secureDelete(bucket: StorageBucket, path: string): Promise<void> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${FUNCTION_URL}?action=delete`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket, path }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao excluir');
}

/** Client-side pre-validation before sending to edge function */
export function validateFileClient(file: File, bucket: StorageBucket): string | null {
  const maxSizes: Record<string, number> = {
    'customer-documents': 10 * 1024 * 1024,
    'contract-documents': 10 * 1024 * 1024,
    'internal-documents': 10 * 1024 * 1024,
    'ombudsman-attachments': 10 * 1024 * 1024,
    'form-attachments': 10 * 1024 * 1024,
    'resumes': 5 * 1024 * 1024,
    'property-images': 20 * 1024 * 1024,
  };

  const max = maxSizes[bucket];
  if (max && file.size > max) {
    return `Arquivo excede o tamanho máximo de ${Math.round(max / 1024 / 1024)}MB`;
  }

  const blockedExts = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.msi', '.dll', '.php', '.html', '.htm', '.svg'];
  const lower = file.name.toLowerCase();
  if (blockedExts.some(ext => lower.includes(ext))) {
    return 'Tipo de arquivo não permitido';
  }

  return null;
}
