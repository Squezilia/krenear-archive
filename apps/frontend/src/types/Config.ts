export default interface Config {
  name: string;
  id: string;
  purpose: string;
  tags: string[];
  version: string;
  subscription: Subscription;
  image: string;
  port: string;
  labels: string[];
  schemas: Schema[];
}

export type TypeNames = "string" | "number" | "boolean";

export interface Schema {
  icon?: string;
  id: string;
  name: string;
  types: Record<string, TypeNames>;
}

export interface Subscription {
  id: string;
  name: string;
  limits: {
    deployment: number;
  };
}
