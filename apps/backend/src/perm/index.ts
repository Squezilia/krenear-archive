import { permission } from "./perms";
import roles from "./roles";

export function getRolesPermissions(userRoles: string[]) {
  let perms: permission[] = [];

  for (let role of roles) {
    if (userRoles.includes(role.id)) perms = [...perms, ...role.permissions];
  }

  return perms;
}
