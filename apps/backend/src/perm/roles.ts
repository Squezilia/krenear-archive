import { permission } from "./perms";

export default [
  {
    id: "default",
    name: "Varsayılan",
    permissions: [permission.USER_MANAGE_DEPLOYMENTS, permission.USER_MANAGE_RECORDS],
  },
  {
    id: "admin",
    name: "Yönetici",
    permissions: [
      permission.ADMIN_ACCESS_WORKERS,
      permission.ADMIN_MANAGE_ACCOUNTS,
      permission.ADMIN_MANAGE_DEPLOYMENTS,
      permission.ADMIN_MANAGE_RECORDS,
    ],
  },
];

/* export default {
  DEFAULT: permission.USER_MANAGE_DEPLOYMENTS | permission.USER_MANAGE_RECORDS,
  ADMIN:
    permission.ADMIN_MANAGE_ACCOUNTS |
    permission.ADMIN_MANAGE_DEPLOYMENTS |
    permission.ADMIN_MANAGE_RECORDS |
    permission.ADMIN_ACCESS_WORKERS,
};
 */
