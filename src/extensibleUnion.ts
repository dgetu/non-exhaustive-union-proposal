declare const Unknown: unique symbol;

export type Extensible<T, Default> = T | UnknownVariant<Default>;
type UnknownVariant<Default> = Default extends object ? UnknownObject<Default> : typeof Unknown;
type UnknownObject<Default extends object> = {
  [K in keyof Default]: UnknownVariant<Default[K]>;
};

type OldFoo = Extensible<"foo", string>;
type Foo = Extensible<"foo" | "bar", string>;
type OldFooUnion = Extensible<FooType, { kind: string }>;
type FooUnion = Extensible<FooType | BarType, { kind: string }>;

function operation(): Foo {
  return "baz" as Foo;
}

function operation2(): FooUnion {
  // New API surface that isn't exposed in the client
  return { kind: "baz", baz: true } as unknown as FooUnion;
}

interface FooBase {
  kind: Foo;
}

interface FooType extends FooBase {
  kind: "foo";
  foo: string;
}

interface BarType extends FooBase {
  kind: "bar";
  bar: number;
}

interface BazType {
  kind: "baz";
  baz: boolean;
}

// userland

// Table stakes: is it an extensible enum

() => {
  const foo: Foo = "Adding a variant doesn't break this assignment" as "foo" | "bar";
  // @ts-expect-error
  // Type 'Foo' is not assignable to type '"foo" | "bar"'.
  //  Type '"baz"' is not assignable to type '"foo" | "bar"'.
  const bar: "foo" | "bar" =
    "This assignment never works, even if there are no variants in the enum" as Foo;
};

() => {
  const result = operation();
  if (result === "foo") {
    // Can be coerced to the specific variant with a type guard
    const foo: "foo" = result;
  } else {
    // Even though the kind should default to something like `string`, we don't have a way to
    // inform the type system of that fact.
    // @ts-expect-error
    // Type 'string | typeof Unknown' is not assignable to type 'string'.
    //  Type 'typeof Unknown' is not assignable to type 'string'.
    const foo: string = result;
    // This continues to cause a build failure.
    // @ts-expect-error
    // Type '"baz" | "bar" | unique symbol' is not assignable to type '"bar"'.
    //  Type '"baz"' is not assignable to type '"bar"'.
    const foo2: "bar" = result;
    // If the user expects a shape that's unknown at generation time, they can use a type cast
    if ((result as string) === "baz") {
      const foo3: "baz" = result as "baz";
    }
  }
};

() => {
  const result = operation2();
  if (result.kind === "foo") {
    // Can be coerced to the specific variant with a type guard
    const foo: "foo" = result.kind;
    const foo2: string = result.foo;
  } else {
    // Even though the kind should default to something like `string`, we don't have a way to
    // inform the type system of that fact.
    // @ts-expect-error
    // Type 'string | typeof Unknown' is not assignable to type 'string'.
    //  Type 'typeof Unknown' is not assignable to type 'string'.
    const kind: string = result.kind;
    // Even if it's the last variant, `result` isn't a "bar" until it goes through a type guard.
    // @ts-expect-error
    // Property 'bar' does not exist on type 'BarType | BazType | UnknownObject<{ kind: string; }>'.
    //  Property 'bar' does not exist on type 'BazType'.
    const bar2: number = result.bar;
    // This typecast continues to have the correct behavior
    if ((result.kind as string) === "baz") {
      const baz: boolean = (result as unknown as BazType).baz;
    }
  }
};

// Some constructed types don't cause problems
function good(foo: Foo): Exclude<Foo, "foo"> | undefined {
  if (foo === "foo") {
    return;
  }
  return foo;
}

// A user could easily fall into this trap. We shouldn't make it easy for them to construct their
// own extensible unions with our unique symbol. Avoid exposing the symbol type, or any parametric
// types that allow someone to extend it.
function bad(foo: Foo): Extensible<"foo", string> | undefined {
  // Error expected when `Foo` is extended with `"bar"`.
  // @ts-expect-error
  // Type '"foo" | "bar" | unique symbol' is not assignable to type 'Extensible<"foo", string> |
  //  undefined'.
  //
  //  Type '"bar"' is not assignable to type 'Extensible<"foo", string> | undefined'.
  return foo;
}

// Assume the user names this symbol with the same name. Unique symbols have a type that's unique to
// their instance, so unless we export the symbol, the user has no way to access its type directly.
// This means that there's no way to make this compile in userland. Users have to cast, which means
// we won't break them if we add a known variant. But some users...
declare const DeterminedUser: unique symbol;
function niceTry(foo: Foo): "bar" | typeof DeterminedUser | undefined {
  if (foo === "foo") {
    return;
  }
  // @ts-expect-error
  // Type '"bar" | unique symbol' is not assignable to type '"bar" | unique symbol | undefined'.
  //  Type 'unique symbol' is not assignable to type '"bar" | unique symbol | undefined'.
  return foo;
}

// ...will find a way to shoot themselves in the foot. We'll need to think about how users might
// construct edge cases like this in normal use, and how much type magic we care to entertain before
// we stop supporting it.
type Footgun<T> = T extends string ? never : T;
type Problem = Footgun<Foo>;
function why(foo: OldFoo): "foo" | Problem {
  // Error is expected here
  // This breaks when `Foo` is extended with `"bar"`.
  return foo;
}