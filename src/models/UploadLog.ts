export interface DuplicatedItem {
  identifier: string; // Código teórico o CUI
  name: string;       // Nombre de la asignatura o del estudiante
  reason: string;     // Motivo de omisión
}

export interface UploadResult {
  filename: string;
  status: string;
  total_rows: number;
  created_count: number;
  duplicated_count: number;
  duplicated_items: DuplicatedItem[];
  message: string;
}

export interface UploadHistoryItem {
  id: number;
  upload_type: 'courses' | 'students';
  filename: string;
  total_rows: number;
  created_count: number;
  duplicated_count: number;
  duplicated_items: DuplicatedItem[];
  created_at: string;
}
