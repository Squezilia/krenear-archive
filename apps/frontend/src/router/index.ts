import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    name: "Login",
    path: "/login",
    component: () => import("../views/Login.vue"),
  },
  {
    name: "Register",
    path: "/register",
    component: () => import("../views/Register.vue"),
  },
  {
    name: "Index",
    path: "/",
    component: () => import("../views/Index.vue"),
  },
  {
    name: "Deployments",
    path: "/deployments",
    component: () => import("../views/Deployments.vue"),
  },
  {
    name: "Create Deployment",
    path: "/deployments/create",
    component: () => import("../views/CreateDeployment.vue"),
  },
  {
    name: "Deployment",
    path: "/deployment/:deploymentId",
    children: [
      {
        name: "Dashboard",
        path: "",
        component: () => import("../views/Deployment.vue"),
      },
      {
        name: "Records",
        path: "records",
        component: () => import("../views/Records.vue"),
      },
      {
        name: "Create Record",
        path: "records/:schemaId",
        component: () => import("../views/CreateRecord.vue"),
      },
      {
        name: "Domains",
        path: "domains",
        component: () => import("../views/Domains.vue"),
      },
      {
        name: "Analytics",
        path: "analytics",
        component: () => import("../views/Analytics.vue"),
      },
      {
        name: "Settings",
        path: "settings",
        component: () => import("../views/Settings.vue"),
      },
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
