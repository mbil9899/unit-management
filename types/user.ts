export const USER_ROLES = {
  ADMIN: "ADMIN",
  CONTINGENT_COMMANDER: "CONTINGENT_COMMANDER",
  ADJUTANT: "ADJUTANT",
  PA_CC: "PA_CC",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  army_no?: string;
  rank_id?: string;
  company_id?: string;
  platoon_id?: string;
  section_id?: string;
  created_at: string;
  updated_at: string;
}