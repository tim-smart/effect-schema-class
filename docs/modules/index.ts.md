---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructor](#constructor)
  - [RawSchemaClass](#rawschemaclass)
  - [SchemaClass](#schemaclass)
  - [SchemaClassExtends](#schemaclassextends)
- [model](#model)
  - [CopyWith (interface)](#copywith-interface)
  - [SchemaClass (interface)](#schemaclass-interface)
  - [SchemaClassExtends (interface)](#schemaclassextends-interface)

---

# constructor

## RawSchemaClass

**Signature**

```ts
export declare const RawSchemaClass: <I, A extends Record<string, any>>(schema_: Schema<I, A>) => SchemaClass<I, A>
```

Added in v1.0.0

## SchemaClass

**Signature**

```ts
export declare const SchemaClass: <
  Fields extends Record<
    string | number | symbol,
    | Schema<any, any>
    | Schema<never, never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >
>(
  fields: Fields
) => SchemaClass<
  Spread<
    { readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<Fields[K]> } & {
      readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> | undefined
    }
  >,
  Spread<
    { readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<Fields[K]> } & {
      readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> | undefined
    }
  >
>
```

Added in v1.0.0

## SchemaClassExtends

**Signature**

```ts
export declare const SchemaClassExtends: <
  Base extends SchemaClass<any, any>,
  Fields extends Record<
    string | number | symbol,
    | Schema<any, any>
    | Schema<never, never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >
>(
  base: Base,
  fields: Fields
) => SchemaClassExtends<
  Base,
  Spread<
    (Base extends SchemaClass<infer I, infer _A> ? I : never) & {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<Fields[K]>
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> | undefined }
  >,
  Spread<
    (Base extends SchemaClass<infer _I, infer A> ? A : never) & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<Fields[K]>
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> | undefined }
  >
>
```

Added in v1.0.0

# model

## CopyWith (interface)

**Signature**

```ts
export interface CopyWith<A> {
  copyWith<T>(this: T, props: Partial<A>): T
}
```

Added in v1.0.0

## SchemaClass (interface)

**Signature**

```ts
export interface SchemaClass<I, A> {
  new (props: A): A & CopyWith<A> & Data.Case

  schema<T extends new (...args: any) => any>(this: T): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>
}
```

Added in v1.0.0

## SchemaClassExtends (interface)

**Signature**

```ts
export interface SchemaClassExtends<C extends SchemaClass<any, any>, I, A> {
  new (props: A): A & CopyWith<A> & Data.Case & Omit<InstanceType<C>, 'copyWith'>

  schema<T extends new (...args: any) => any>(this: T): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>
}
```

Added in v1.0.0
