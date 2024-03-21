function operation(color) {
    return color;
}
// Completions are good
const knownColor = "red";
// No cast required here
const unknownColor = "green";
const outputColor = operation(knownColor);
if (outputColor === "red") {
    // Bad behavior: this assignment requires a type cast
    const red = outputColor;
}
else {
    // Good behavior - the contextual type here wouldn't break if a new variant were added
    // Error message is not good
    // @ts-expect-error
    const maybeBlue = outputColor;
    if (outputColor === "blue") {
        // Bad behavior: this assignment requires a type cast
        const blue = outputColor;
    }
    else {
        if (outputColor === "green") {
            const green = outputColor;
        }
        const unknown = outputColor;
    }
}
export {};
//# sourceMappingURL=nonExhaustiveHelperType.js.map