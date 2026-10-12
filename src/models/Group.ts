export interface GroupStudent {
  cui: string;
  dni?: string;
  first_name: string;
  last_name: string;
  institutional_email?: string;
}

export interface GroupDetail {
  id: number;
  course_id: number;
  course_name?: string;
  course_lab_code?: string;
  course_year?: number;
  name: string;
  schedule_range: string;
  initial_vacancies: number;
  available_vacancies: number;
  enrolled_count: number;
  is_full?: boolean;
  students: GroupStudent[];
}

export interface UpdateGroupDTO {
  name: string;
  schedule_range: string;
  initial_vacancies: number;
}
