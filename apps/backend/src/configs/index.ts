import Config from "../types/Config";
import basicBlogspot from "./basic-blogspot";

export const configs: Config[] = [
  basicBlogspot
];

export default function getConfig(name: string): Config | undefined {
  return configs.find((conf) => {
    return conf.id == name;
  });
}

export const configsSize = configs.length;
