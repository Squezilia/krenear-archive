export type MapSchemaTypes = {
  string: string;
  integer: number;
  object: BlankObject;
  "string?": string | undefined;
};

export type MapSchema<T extends Record<string, keyof MapSchemaTypes>> = {
  -readonly [K in keyof T]: MapSchemaTypes[T[K]];
};

interface BlankObject {
  [key: string]: any;
}

interface BlankMap {
  [key: string]: "string" | "integer" | "object" | "string?";
}

export default async function validateSchema<MappedSchema extends BlankObject>(
  schema: BlankMap,
  data: MappedSchema
) {
  for (let [key] of Object.entries(schema)) {
    let typeCheckes = [
      schema[key]?.endsWith("?")
        ? schema[key]?.slice(0, (schema[key] || "").length - 1)
        : schema[key],
    ];
    if (schema[key]?.endsWith("?")) typeCheckes.push("undefined");

    if (!typeCheckes.includes(typeof data[key])) {
      return `Entry ${key} value is ${typeof data[key]} but should be ${
        schema[key]
      }`;
    }
    if (
      typeof data[key] == "number" &&
      (data[key] > 2147483647 || data[key] < -2147483648)
    )
      return `Entry ${key} value is bigger than int32.`;

    if (typeof data[key] == "string" && data[key].length > 255)
      return `Entry ${key} value is longer than 255 characters.`;

    if (typeof data[key] == "bigint")
      return `Entry ${key} value is bigint should be int32.`;
  }
  return undefined;
}
