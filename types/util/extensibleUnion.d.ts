declare const Unknown: unique symbol;
type UnknownVariant<Default> = Default extends object ? UnknownObject<Default> : typeof Unknown;
type UnknownObject<Default extends object> = {
    [K in keyof Default]: UnknownVariant<Default[K]>;
};
export type Extensible<T, Default> = T | UnknownVariant<Default>;
export type Color = Extensible<"red" | "blue", string>;
export {};
//# sourceMappingURL=extensibleUnion.d.ts.map