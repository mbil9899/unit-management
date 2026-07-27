export interface UserProfile {
  id: string;

  full_name: string;

  email: string;

  role: string;

  company_id: number | null;

  is_active: boolean;

  companies?: {
    name: string;
  };
}