import { Extensible } from "../util/extensibleUnion";
import { NonExhaustive } from "../util/nonExhaustiveHelperType";

export interface ExtensibleWidget {
  color: Extensible<"red" | "blue", string>;
}

export interface NonExhaustiveWidget {
  color: NonExhaustive<"red" | "blue">;
}
