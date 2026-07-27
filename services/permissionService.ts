export function isAdmin(user: any) {
  return user?.role === "ADMIN";
}

export function isContingentCommander(user: any) {
  return user?.role === "CONTINGENT COMMANDER";
}

export function isDeputyContingentCommander(user: any) {
  return user?.role === "DEPUTY CONTINGENT COMMANDER";
}

export function isCompanyCommander(user: any) {
  return user?.role === "COMPANY COMMANDER";
}

export function isPlatoonCommander(user: any) {
  return user?.role === "PLATOON COMMANDER";
}

export function isCompanyClerk(user: any) {
  return user?.role === "COMPANY CLERK";
}

export function canManageUsers(user: any) {
  return isAdmin(user);
}

export function canManageSettings(user: any) {
  return isAdmin(user);
}

export function canManageLookups(user: any) {
  return isAdmin(user);
}

export function canAssignTasks(user: any) {
  return (
    isAdmin(user) ||
    isContingentCommander(user) ||
    isDeputyContingentCommander(user) ||
    isCompanyCommander(user) ||
    isPlatoonCommander(user)
  );
}

export function canViewTasks(user: any) {
  return (
    isAdmin(user) ||
    isContingentCommander(user) ||
    isDeputyContingentCommander(user) ||
    isCompanyCommander(user) ||
    isPlatoonCommander(user)
  );
}

export function canEditPersonnel(user: any) {
  return (
    isAdmin(user) ||
    isContingentCommander(user) ||
    isDeputyContingentCommander(user) ||
    isCompanyCommander(user) ||
    isPlatoonCommander(user) ||
    isCompanyClerk(user)
  );
}

export function canDeletePersonnel(user: any) {
  return (
    isAdmin(user) ||
    isContingentCommander(user) ||
    isDeputyContingentCommander(user)
  );
}