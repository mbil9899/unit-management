export interface Task {

  id: string;

  task_number: string;

  title: string;

  description?: string;

  category_id?: number;

  assigned_to?: string;

  assigned_by?: string;

  company_id?: number;

  status: string;

  start_date?: string;

  due_date?: string;

  completion_date?: string;

  evaluation?: string;

  remarks?: string;

  created_at?: string;

  updated_at?: string;

}