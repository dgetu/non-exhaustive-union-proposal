# Non-Exhaustive

- [Non-Exhaustive](#non-exhaustive)
  - [Current](#current)
  - [Proposals](#proposals)
    - [Non-Exhaustive Helper Type](#non-exhaustive-helper-type)
    - [Extensible Unions](#extensible-unions)
    - [Comparison](#comparison)

From time to time the conversation of non-exhaustive unions gets brought up, most of the time sparking from the way we have been representing enums.

There are 2 types of enums from a service definition point of view

- ##### Fixed Enums
  - Enums which have a defined set of known values. Any other value is invalid.
- ##### Extensible Enums
  - Enums which have a defined set of known values but values outside of the set are also valid.

In TypeScript, we can easily represent fixed enums with string literal unions. It is efficient as no runtime code is needed and idiomatic to TypeScript developers. In this case, `const enum` declarations are also worth considering. They're inlined at compile-time, so they have no runtime overhead. However, in practice, this only applies where the enum is consumed by the package that declares the const enum. They [must](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls) otherwise be exposed to consumers of the package as a non-const enum through the [`preserveConstEnums`](https://www.typescriptlang.org/tsconfig#preserveConstEnums) compiler option.

The challenge lies in representing extensible enums. The first impulse would be to represent as a union of the known values and the primitive type such as `type foo = "one" | "two" | "three" | string`. However, given how TypeScript works, this collapses the type to `string`, losing information about the known values.

Here we'll explore the different approaches we have discussed in the past in hopes to find a winner 🙂

## Current

Currently, we represent extensible enums as strings and also provide enums with the known values as a convenience. These enums aren't directly consumed by any part of the public API.

```ts
export enum KnownPositionValues {
  one: "one",
  two: "two",
  three: "three"
}

// Known Values: "one", "two", "three"
export type Position = string;

declare function foo(position: Position);

// usage
foo("one");
foo(KnownPositionValues.one);
foo("ten");
```

This approach has a few drawbacks:

- As all APIs consuming an extensible enum are exposing an alias to the `string` type, editors can't suggest known values to the user through the language service.
- Discoverability and ergonomics are very poor.
  - Users have to find out that the corresponding enum exists. They might already be familiar with the pattern, or they have to look at the TSDoc comments for a link to the corresponding type.
  - It then has to be imported, potentially without the aid of the language service.
  - Even when the correct enum is in scope, the language service doesn't provide any completions. Users must ensure that they're using the correct enum.
  - Users have no way to indicate to the compiler/other tooling that their unknown variant is meant to be consumed in place of an extensible enum. Even if the user declares/casts an unknown variant to either the public API type or its corresponding known variant enum type, reviewers get no help in determining whether or not an unknown variant is being consumed in a position that the author intended.
  - The known variant enums are runtime objects. The overhead is minimal, but it exists.

Even with these drawbacks, it provides some benefits that we would hope to preserve moving forward:

- Known values are exposed through the type system. Free square.
- When used as an output type, this approach prevents us from breaking customer code when we add known variants.
- Known values are syntactically distinct from unknown values. Unknown values are specified as string literals or a variable with a type assignable to `string`. Though known values can be specified in the same way, the known-variant enum quickly indicates to the user that the variant is indeed known.
- The (minimal) runtime overhead of the enum declaration is opt-in for users. Users aren't forced to incur the memory and property access penalties that the convenience offers.

## Proposals

### Non-Exhaustive Helper Type

[(sample)](../util/nonExhaustiveHelperType.ts)

Instead of defining a string type and an enum separately, we can define an extensible enum like this:

```ts
type Position = NonExhaustive<"one" | "two" | "three">;
```

In this case Position would accept any string, while also suggesting "foo", "bar", and "baz" as autocomplete options in the editor. This approach would provide a more intuitive and flexible API for our users, also a cleaner API.

- Pros
  - LSP completions FIXME
  - Inputs don't require a type cast
  - Inputs of an unknown variant don't require a type cast
- Cons
  - Contextual typing doesn't strip the unknown tag, so enum outputs can't be assigned to the literal variant without a cast.

### Extensible Unions

[(sample)](../util/extensibleUnion.ts)

Instead of defining a string type and an enum separately, we can define an extensible enum like this:

```ts
type Position = Extensible<"one" | "two" | "three", string>;
```

- Pros
  - LSP completions function as expected.
  - No type casts for known variants.
  - The contextual type of known variants works as expected.
- Cons
  - In both input and output positions, a type cast is required for unknown variants

### Comparison

```ts
// Known colors: "red" | "blue"
declare function operation(color: Color);
```

<table>
<thead>
  <tr>
    <th>Scenario</th>
    <th>

[Extensible Union](../util/extensibleUnion.ts)

</th>
<th>

[Non-exhaustive Helper Type](../util/nonExhaustiveHelperType.ts)

</th>

  </tr>
</thead>
<tbody>
  <tr>
    <td>Create a known variant</td>
    <td>

```ts
// LSP completions are good
const knownColor: Color = "red";
```

</td>
<td>

```ts
// LSP completions are good
const knownColor: Color = "red";
```

</td>
  </tr>
  <tr>
    <td>Create an unknown variant</td>
    <td>

```ts
// Unknown variants require a type cast
const unknownColor: Color = "green" as Color;
```

</td><td>

```ts
// No cast required here
const unknownColor: Color = "green";
```

</td>
  </tr>
  <tr>
    <td>Use a known variant as an input</td>
    <td>

```ts
colorOperation("red");
```

</td><td>

```ts
colorOperation("red");
```

</td>
  </tr>
  <tr>
    <td>Use an unknown variant as an input</td>
    <td>

```ts
colorOperation("green" as Color);
```

</td><td>

```ts
colorOperation("green");
```

</td>
  </tr>
  <tr>
    <td>Use contextual typing to affirmatively narrow a value to a known variant</td>
    <td>

```ts
if (outputColor === "red") {
  // No type cast required
  const red: "red" = outputColor;
}
```

</td><td>

```ts
if (outputColor === "red") {
  // Bad behavior: this assignment requires a type cast
  const red: "red" = outputColor as "red";
}
```

</td>
  </tr>
  <tr>
    <td>Use contextual typing to affirmatively narrow a value to an unknown variant</td>
    <td>

```ts
if ((outputColor as string) === "green") {
  const green: "green" = outputColor as "green";
}
```

</td><td>

```ts
if (outputColor === "green") {
  const green: "green" = outputColor as "green";
}
```

</td>
  </tr>
  <tr>
    <td>Disallow contextual typing from narrowing unknown variants before exhausting known variants</td>
    <td>

```ts
if (outputColor === "red") {
  ...
} else {
  // Good behavior - the contextual type here wouldn't break if a new variant were added
  // Error message is not good
  // @ts-expect-error
  const maybeBlue: "blue" = outputColor;
}
```

</td><td>

```ts
if (outputColor === "red") {
  ...
} else {
  // Good behavior - the contextual type here wouldn't break if a new variant were added
  // Error message is not good
  // @ts-expect-error
  const maybeBlue: "blue" = outputColor;
}
```

</td>
  </tr>
  <tr>
    <td>Use contextual typing to default to an unknown variant type when known variants are exhausted</td>
    <td>

```ts
if (outputColor === "red") {
    ...
} else if (outputColor === "blue") {
    ...
} else {
  const unknown: string = outputColor as unknown as string;
}
```

</td><td>

```ts
if (outputColor === "red") {
    ...
} else if (outputColor === "blue") {
    ...
} else {
  const unknown: string = outputColor;
}
```

</td>
  </tr>
</tbody>
</table>
