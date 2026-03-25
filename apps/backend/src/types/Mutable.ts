export class Immutable {
  constructor(public readonly myProp: string) {}
}

export type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};
