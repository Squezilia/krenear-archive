export default interface Deployment {
  source: {
    uri: string;
    target: "krenear" | "public";
  };
  server: string;
  file: string;
}

export interface Cluster {
  id: string;
  config: Deployment;
  logs: string[];
}
