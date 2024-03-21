declare const Unknown: unique symbol;
type UnknownVariant<Default> = Default extends object ? UnknownObject<Default> : typeof Unknown;
type UnknownObject<Default extends object> = {
  [K in keyof Default]: UnknownVariant<Default[K]>;
};
export type Extensible<T, Default> = T | UnknownVariant<Default>;

export type Color = Extensible<"red" | "blue", string>;

function operation(color: Color) {
  return color;
}

// Completions are good
const knownColor: Color = "red";
// Unknown variants require a type cast
const unknownColor: Color = "green" as Color;
const outputColor = operation(knownColor);

if (outputColor === "red") {
  // No type cast required
  const red: "red" = outputColor;
} else {
  // Good behavior - the contextual type here wouldn't break if a new variant were added
  // Error message is not good
  // @ts-expect-error
  const maybeBlue: "blue" = outputColor;
  if (outputColor === "blue") {
    // Good behavior - contextual typing works as expected
    const blue: "blue" = outputColor;
  } else {
    // Bad behavior - requires a type cast when consuming an unknown variant
    // Error message is not good
    // @ts-expect-error
    const spuriousError: string = outputColor;
    if ((outputColor as unknown as string) === "green") {
      const green: "green" = outputColor as unknown as "green";
    }
    const unknown: string = outputColor as unknown as string;
  }
}
