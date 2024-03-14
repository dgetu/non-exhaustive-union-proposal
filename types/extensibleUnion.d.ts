declare const Unknown: unique symbol;
export type Extensible<T, Default> = T | UnknownVariant<Default>;
type UnknownVariant<Default> = Default extends object ? UnknownObject<Default> : typeof Unknown;
type UnknownObject<Default extends object> = {
    [K in keyof Default]: UnknownVariant<Default[K]>;
};
export {};
//# sourceMappingURL=extensibleUnion.d.ts.map