function operation() {
    return "baz";
}
function operation2() {
    return { kind: "baz", baz: true };
}
function operation3() {
    return { kind: "baz", baz: true };
}
// userland
// Table stakes: is it an extensible enum
() => {
    const foo = "Adding a variant doesn't break this assignment";
    // @ts-expect-error
    // Type 'Foo' is not assignable to type '"foo" | "bar"'.
    //  Type '"baz"' is not assignable to type '"foo" | "bar"'.
    const bar = "This assignment never works, even if there are no variants in the enum";
};
() => {
    const result = operation();
    if (result === "foo") {
        // Can be coerced to the specific variant with a type guard
        const foo = result;
    }
    else {
        // Even though the kind should default to something like `string`, we don't have a way to
        // inform the type system of that fact.
        // @ts-expect-error
        // Type 'string | typeof Unknown' is not assignable to type 'string'.
        //  Type 'typeof Unknown' is not assignable to type 'string'.
        const foo = result;
        // This continues to cause a build failure.
        // @ts-expect-error
        // Type '"baz" | "bar" | unique symbol' is not assignable to type '"bar"'.
        //  Type '"baz"' is not assignable to type '"bar"'.
        const foo2 = result;
        // If the user expects a shape that's unknown at generation time, they can use a type cast
        if (result === "baz") {
            const foo3 = result;
        }
    }
};
() => {
    const result = operation2();
    if (result.kind === "foo") {
        // Can be coerced to the specific variant with a type guard
        const foo = result.kind;
        const foo2 = result.foo;
    }
    else {
        // Even though the kind should default to something like `string`, we don't have a way to
        // inform the type system of that fact.
        // @ts-expect-error
        // Type 'string | typeof Unknown' is not assignable to type 'string'.
        //  Type 'typeof Unknown' is not assignable to type 'string'.
        const kind = result.kind;
        // Even if it's the last variant, `result` isn't a "bar" until it goes through a type guard.
        // @ts-expect-error
        // Property 'bar' does not exist on type 'BarType | BazType | UnknownObject<{ kind: string; }>'.
        //  Property 'bar' does not exist on type 'BazType'.
        const bar2 = result.bar;
        const asdf = { kind: "sfjn" };
        // This typecast continues to have the correct behavior
        if (result.kind === "baz") {
            const baz = result.baz;
        }
    }
};
() => {
    const result = operation3();
    if (result.kind === "foo") {
        // Some sanity checks for assignability
        const fooKindLiteralType = result;
        const fooKind = result;
        const kind = result.kind;
    }
    else {
        // Exactly the same as above, but suppose the user somehow knows this is a "baz" even though
        // it's not an extensible enum
        const baz = result;
    }
};
// Some constructed types don't cause problems
function good(foo) {
    if (foo === "foo") {
        return;
    }
    return foo;
}
// A user could easily fall into this trap. We shouldn't make it easy for them to construct their
// own extensible unions with our unique symbol. Avoid exposing the symbol type, or any generics
// that allow someone to extend it.
function bad(foo) {
    if (foo === "foo") {
        return;
    }
    // Error expected when `Foo` is extended with `"baz"`.
    // @ts-expect-error
    // Type '"bar" | "baz" | unique symbol' is not assignable to type 'Extensible<"bar", string> | undefined'.
    //  Type '"baz"' is not assignable to type 'Extensible<"bar", string> | undefined'.
    return foo;
}
function niceTry(foo) {
    if (foo === "foo") {
        return;
    }
    // @ts-expect-error
    // Type '"bar" | "baz" | unique symbol' is not assignable to type '"bar" | unique symbol | undefined'.
    //  Type '"baz"' is not assignable to type '"bar" | unique symbol | undefined'.
    return foo;
}
function why(foo) {
    if (foo === "foo") {
        return;
    }
    // Error expected when `Foo` is extended with `"baz"`.
    // @ts-expect-error
    // Type '"bar" | "baz" | unique symbol' is not assignable to type '"bar" | unique symbol | undefined'.
    //  Type '"baz"' is not assignable to type '"bar" | unique symbol | undefined'.
    return foo;
}
export {};
//# sourceMappingURL=extensibleUnion.js.map