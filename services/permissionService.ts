export const normalizeRole = (role?: string | null): string => {
  if (!role) return "";
  return String(role).toUpperCase().replace(/\s+/g, "_").trim();
};

export const isAdmin = (role?: string | null) => normalizeRole(role) === "ADMIN";
export const isContingentCommander = (role?: string | null) => normalizeRole(role) === "CONTINGENT_COMMANDER";

// --- PERSONNEL ---
export const canViewPersonnel = (role?: string | null) => true; // Everyone can view

export const canCreatePersonnel = (role?: string | null) => {
  const r = normalizeRole(role);
  if (r === "ADMIN") return true; 
  return ["ADJUTANT", "PA_CC"].includes(r); // Removed COMPANY_CLERK
};

export const canEditPersonnel = (role?: string | null) => canCreatePersonnel(role);
export const canDeletePersonnel = (role?: string | null) => {
  const r = normalizeRole(role);
  if (r === "ADMIN") return true; 
  return ["ADJUTANT", "CONTINGENT_COMMANDER"].includes(r);
};

// --- TASKS ---
export const canViewTasks = (role?: string | null) => {
  const r = normalizeRole(role);
  if (r === "ADMIN") return true;
  return r === "CONTINGENT_COMMANDER"; 
};

export const canAssignTasks = (role?: string | null) => canViewTasks(role);
export const canEditTask = (role?: string | null) => canViewTasks(role);
export const canDeleteTask = (role?: string | null) => canViewTasks(role);

// --- SYSTEM ---
export const canManageUsers = (role?: string | null) => {
  const r = normalizeRole(role);
  if (r === "ADMIN") return true;
  return r === "CONTINGENT_COMMANDER";
};