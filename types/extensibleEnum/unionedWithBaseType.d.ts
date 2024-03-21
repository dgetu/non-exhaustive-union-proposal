import { Extensible } from "../util/extensibleUnion";
import { NonExhaustive } from "../util/nonExhaustiveHelperType";
export type ExtensibleColors = Extensible<"red" | "blue", string>;
export type NonExhaustiveColors = NonExhaustive<"red" | "blue">;
//# sourceMappingURL=unionedWithBaseType.d.ts.map