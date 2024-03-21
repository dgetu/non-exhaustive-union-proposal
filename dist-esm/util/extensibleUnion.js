function operation(color) {
    return color;
}
// Completions are good
const knownColor = "red";
// Unknown variants require a type cast
const unknownColor = "green";
const outputColor = operation(knownColor);
if (outputColor === "red") {
    // No type cast required
    const red = outputColor;
}
else {
    // Good behavior - the contextual type here wouldn't break if a new variant were added
    // Error message is not good
    // @ts-expect-error
    const maybeBlue = outputColor;
    if (outputColor === "blue") {
        // Good behavior - contextual typing works as expected
        const blue = outputColor;
    }
    else {
        // Bad behavior - requires a type cast when consuming an unknown variant
        // Error message is not good
        // @ts-expect-error
        const spuriousError = outputColor;
        if (outputColor === "green") {
            const green = outputColor;
        }
        const unknown = outputColor;
    }
}
export {};
//# sourceMappingURL=extensibleUnion.js.map