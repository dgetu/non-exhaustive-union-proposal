import "@azure-tools/typespec-azure-resource-manager";

union ProvisioningState {
  string,
  inProgress: "inProgress",
  Azure.ResourceManager.ResourceProvisioningState,
}