export function getRoleName(user) {
  const roleName = user?.role?.name;
  if (typeof roleName === "string" && roleName.trim()) return roleName.trim();

  // Small fallback in case a DTO changes
  const roleNameAlt = user?.role?.Name;
  if (typeof roleNameAlt === "string" && roleNameAlt.trim()) return roleNameAlt.trim();

  if (typeof user?.role === "string" && user.role.trim()) return user.role.trim();
  if (typeof user?.Role === "string" && user.Role.trim()) return user.Role.trim();

  return "";
}

export function isAdminOrOwner(user) {
  const role = getRoleName(user).toLowerCase();
  return role === "admin" || role === "owner";
}

export function isAdmin(user) {
  const role = getRoleName(user).toLowerCase();
  return role === "admin";
}

export function canUseSchedule(user) {
  const role = getRoleName(user).toLowerCase();
  return role === "admin" || role === "owner" || role === "worker";
}

export function getAuthorizedRedirect(path, user) {
  const destination = typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
    ? path
    : "/";

  if (destination === "/schedule") {
    return canUseSchedule(user) ? destination : "/";
  }

  if (destination === "/admin/users") {
    return isAdminOrOwner(user) ? destination : "/";
  }

  return destination;
}
