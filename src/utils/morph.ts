import { TypeFormatFlags } from "ts-morph";

export function getPureType(prop: any) {
  return prop?.getType()?.getText(prop, TypeFormatFlags.None);
}
