export interface IngressRule {
  host: string;
  http: {
    paths: [
      {
        path: string;
        pathType: "ImplementationSpecific" | "Exact" | "Prefix";
        backend: {
          service: {
            name: string;
            port: {
              number: number;
            };
          };
        };
      }
    ];
  };
}

export interface TLSRule {
  hosts: string[];
  secretName: string;
}
