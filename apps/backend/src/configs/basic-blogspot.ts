import subscriptions from "../subscriptions";
import Config from "../types/Config";

export default {
  id: "basic-blogspot",
  name: "Basic Blogspot",
  purpose: "Blogspot",
  tags: ["Blog", "CMS"],
  version: "1.0",
  subscription: subscriptions.find((sub) => sub.id == "default"),
  image: "basic-blogspot",
  port: "80",
  labels: ["title", "content", "createdAt"],
  schemas: [
    {
      icon: "solar:file-text-bold",
      id: "post",
      name: "Post",
      types: {
        title: "string",
        content: "string",
        createdAt: "string"
      },
    },
  ],
} as Config;
