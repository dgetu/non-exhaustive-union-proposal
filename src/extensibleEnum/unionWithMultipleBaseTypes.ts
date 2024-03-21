import { Extensible } from "../util/extensibleUnion";
import { NonExhaustive } from "../util/nonExhaustiveHelperType";

export interface ExtensibleShirt {
  sizing: Extensible<32 | 34 | "small" | "medium", number | string>;
}

export interface NonExhaustiveShirt {
  sizing: NonExhaustive<32 | 34 | "small" | "medium">;
}
