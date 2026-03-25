export default interface Deployment {
  id: string;
  name: string;
  createdAt: Date;
  defaultDomain: string;
  domains: string[];
  ownerId: string;
  configuration: string;
  version: string;
  labels: string[];
  workers: Worker[];
}

export interface Change {
  date: string;
  update: number;
  data: { [key: string]: any };
}

export interface Record {
  id: string;
  updatedAt: string;
  createdAt: string;
  deploymentId: string;
  data: { [key: string]: any };
  schemaId: string;
  schema: {
    id: string;
    icon: string;
    name: string;
    types: string[];
    deploymentId: string;
  };
}

export interface Schema {
  id: string;
  icon: string;
  name: string;
  types: string[];
  deploymentId: string;
}
