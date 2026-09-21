export interface ApiResponse {
  filename: string;
  status: string;
  message: string;
  detail?: string; // Opcional para mostrar errores del servidor
}
