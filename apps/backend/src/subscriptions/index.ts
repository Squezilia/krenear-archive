import { Subscription } from "../types/Config";

export default [
  {
    id: "default",
    name: "Free",
    limits: {
      deployment: 3,
      domains: 4,
    },
  },
  {
    id: "banking",
    name: "Banking",
    limits: {
      deployment: 10,
      domains: 20,
    },
  },
  {
    id: "social",
    name: "Social",
    limits: {
      deployment: 10,
      domains: 20,
    },
  },
  {
    id: "goverment",
    name: "Goverment",
    limits: {
      deployment: 10,
      domains: 20,
    },
  },
  {
    id: "special",
    name: "Special",
    limits: {
      deployment: 3,
      domains: 4,
    },
  },
] as Subscription[];
