export type IntFields = {
  readonly int1?: number;
  readonly int2?: number;
  readonly int3?: number;
  readonly int4?: number;
  readonly int5?: number;
  readonly int6?: number;
  readonly int7?: number;
  readonly int8?: number;
  readonly int9?: number;
  readonly int10?: number;
};

export type StringFields = {
  readonly string1?: string;
  readonly string2?: string;
  readonly string3?: string;
  readonly string4?: string;
  readonly string5?: string;
  readonly string6?: string;
  readonly string7?: string;
  readonly string8?: string;
  readonly string9?: string;
  readonly string10?: string;
};

export type PresetFields = IntFields & StringFields;

export type EventProps = PresetFields & {
  readonly [key: string]: string | number | boolean | undefined;
};
