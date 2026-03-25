import { defineStore } from "pinia";
import Deployment, { Schema } from "../types/Deployment";

export const messageStore = defineStore("message", {
  state: () => ({
    trialMessage: true,
  }),
  actions: {
    async save() {
      localStorage.setItem("message", JSON.stringify(this.$state));
    },

    async load() {
      const messages = localStorage.getItem("message");
      if (messages) {
        this.$patch(JSON.parse(messages));
      }
    },
  },
});

export const userStore = defineStore("user", {
  state: () => ({
    id: "",
    username: "",
    createdAt: "",
    roles: [] as Array<String>,
    subscription: {
      start: "",
      end: "",
      levels: [] as Array<String>,
    },
    token: "",
  }),
  actions: {
    async save() {
      localStorage.setItem("user", JSON.stringify(this.$state));
    },

    async load() {
      const user = localStorage.getItem("user");
      if (user) {
        this.$patch(JSON.parse(user));
      }
    },

    async logout() {
      this.$patch({
        id: "",
        username: "",
        createdAt: "",
        roles: [] as Array<String>,
        subscription: {
          start: "",
          end: "",
          levels: [] as Array<String>,
        },
        token: "",
      });

      this.save();
    },
  },
});

export const configurationStore = defineStore("configuration", {
  state: () => ({
    apiURL: import.meta.env.VITE_API_URL,
    socketURL: "ws://localhost:3000/",
  }),
});

export const selectedDeploymentStore = defineStore("selectedDeployment", {
  state: () => ({
    id: "",
    name: "",
    createdAt: new Date(),
    defaultDomain: "",
    domains: [] as Array<string>,
    ownerId: "",
    configuration: "",
    version: "",
    labels: [] as Array<string>,
    workers: [] as Array<Worker>,
    schemas: [] as Array<Schema>,
  }),
  actions: {
    async update(deployment: Deployment) {
      this.$patch(deployment);
    },

    async save() {
      localStorage.setItem("selectedDeployment", JSON.stringify(this.$state));
    },

    async load() {
      const user = localStorage.getItem("selectedDeployment");
      if (user) {
        this.$patch(JSON.parse(user));
      }
    },
  },
});
