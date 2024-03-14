"use strict";
// Function Parameter
function setPosition(position) {
    console.log(position);
}
// Autocomplete + any value
setPosition("two!");
// As Output
function getPosition() {
    return "one";
}
const position = getPosition();
// Type narrowing
if (position === "one") {
    const x = position;
    console.log("Got one");
}
else {
    console.log(position);
}
//# sourceMappingURL=nonExhaustiveHelperType.js.map