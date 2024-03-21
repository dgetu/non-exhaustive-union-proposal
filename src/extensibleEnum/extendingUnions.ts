import { ResourceProvisioningState } from "@azure-tools/typespec-azure-resource-manager";
import { Extensible } from "../util/extensibleUnion";
import { NonExhaustive } from "../util/nonExhaustiveHelperType";

type ExtensibleProvisioningState = Extensible<"inProgress" | ResourceProvisioningState, string>;
//or
type ExtensibleProvisioningState2 = Extensible<
  "inProgress" | "Succeeded" | "Failed" | "Canceled",
  string
>;

type NonExhaustiveProvisioningState = NonExhaustive<"inProgress" | ResourceProvisioningState>;
//or
type NonExhaustiveProvisioningState2 = NonExhaustive<
  "inProgress" | "Succeeded" | "Failed" | "Canceled"
>;
