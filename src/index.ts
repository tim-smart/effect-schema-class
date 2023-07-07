/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import type {
  From,
  FromOptionalKeys,
  PropertySignature,
  Schema,
  Spread,
  To,
  ToOptionalKeys,
} from "@effect/schema/Schema"
import {
  from,
  to,
  instanceOf,
  struct,
  transform,
  transformResult,
  validateSync,
} from "@effect/schema/Schema"
import type { ParseResult } from "@effect/schema/ParseResult"

/**
 * @category model
 * @since 1.0.0
 */
export interface CopyWith<A> {
  copy<T>(this: T, props: Partial<A>): T
  unsafeCopy<T>(this: T, props: Partial<A>): T
}

/**
 * @category model
 * @since 1.0.0
 */
export interface SchemaClass<I, A> {
  new (props: A): A & CopyWith<A> & Data.Case

  unsafe<T extends new (...args: any) => any>(
    this: T,
    props: A,
  ): InstanceType<T>

  schema<T extends new (...args: any) => any>(
    this: T,
  ): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>

  readonly fields: Record<string, Schema<I, A>>
}

/**
 * @since 1.0.0
 */
export namespace SchemaClass {
  /**
   * @since 1.0.0
   */
  export type To<A> = A extends SchemaClass<infer _F, infer T> ? T : never

  /**
   * @since 1.0.0
   */
  export type From<A> = A extends SchemaClass<infer F, infer _T> ? F : never
}

/**
 * @category model
 * @since 1.0.0
 */
export interface SchemaClassExtends<C extends SchemaClass<any, any>, I, A> {
  new (
    props: A,
  ): A &
    CopyWith<A> &
    Data.Case &
    Omit<InstanceType<C>, keyof CopyWith<unknown> | keyof A>

  unsafe<T extends new (...args: any) => any>(
    this: T,
    props: A,
  ): InstanceType<T>

  schema<T extends new (...args: any) => any>(
    this: T,
  ): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>

  readonly fields: Record<string, Schema<I, A>>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface SchemaClassTransform<C extends SchemaClass<any, any>, I, A> {
  new (
    props: A,
  ): A &
    CopyWith<A> &
    Data.Case &
    Omit<InstanceType<C>, keyof CopyWith<unknown> | keyof A>

  unsafe<T extends new (...args: any) => any>(
    this: T,
    props: A,
  ): InstanceType<T>

  schema<T extends new (...args: any) => any>(
    this: T,
  ): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>
}

const make = <I, A>(schema_: Schema<I, A>, base: any) => {
  const validater = validateSync(schema_)
  const fn = function (this: any, props: unknown) {
    Object.assign(this, validater(props))
  }
  Object.setPrototypeOf(fn.prototype, base)
  fn.unsafe = function unsafe(this: any, props: unknown) {
    return Object.setPrototypeOf({ ...(props as any) }, this.prototype)
  }
  fn.structSchema = function structSchema() {
    return schema_
  }
  fn.schema = function schema(this: any) {
    return transform(
      schema_,
      instanceOf(this),
      (input) => Object.setPrototypeOf({ ...(input as any) }, this.prototype),
      (input) => ({ ...(input as any) }),
    )
  }
  fn.prototype.copy = function copy(this: any, props: any) {
    return new (this.constructor as any)({
      ...this,
      ...props,
    })
  }
  fn.prototype.unsafeCopy = function unsafeCopy(this: any, props: any) {
    return (this.constructor as any).unsafe({
      ...this,
      ...props,
    })
  }

  return fn as any
}

/**
 * @category constructor
 * @since 1.0.0
 */
export const SchemaClass = <
  Fields extends Record<
    PropertyKey,
    | Schema<any>
    | Schema<never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >,
>(
  fields: Fields,
): SchemaClass<
  Spread<
    {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<
        Fields[K]
      >
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> }
  >,
  Spread<
    {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >
> => {
  const schema = struct(fields)
  const fn = make(schema, Data.Class.prototype)
  fn.fields = fields
  return fn
}

/**
 * @category constructor
 * @since 1.0.0
 */
export const SchemaClassExtends = <
  Base extends SchemaClass<any, any>,
  Fields extends Record<
    PropertyKey,
    | Schema<any>
    | Schema<never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >,
>(
  base: Base,
  fields: Fields,
): SchemaClassExtends<
  Base,
  Spread<
    Omit<SchemaClass.From<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<
        Fields[K]
      >
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> }
  >,
  Spread<
    Omit<SchemaClass.To<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >
> => {
  const schema = struct({
    ...base.fields,
    ...fields,
  })
  const fn = make(schema, base.prototype)
  fn.fields = {
    ...base.fields,
    ...fields,
  }
  return fn
}

/**
 * @category constructor
 * @since 1.0.0
 */
export const SchemaClassTransform = <
  Base extends SchemaClass<any, any>,
  Fields extends Record<
    PropertyKey,
    | Schema<any>
    | Schema<never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >,
>(
  base: Base,
  fields: Fields,
  decode: (input: SchemaClass.To<Base>) => ParseResult<
    Omit<SchemaClass.To<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >,
  encode: (
    input: Omit<SchemaClass.To<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> },
  ) => ParseResult<SchemaClass.To<Base>>,
): SchemaClassTransform<
  Base,
  SchemaClass.From<Base>,
  Spread<
    Omit<SchemaClass.To<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >
> => {
  const schema = transformResult(
    base.structSchema(),
    to(
      struct({
        ...base.fields,
        ...fields,
      }),
    ) as any,
    decode,
    encode,
  )
  const fn = make(schema, base.prototype)
  fn.fields = {
    ...base.fields,
    ...fields,
  }
  return fn
}

/**
 * @category constructor
 * @since 1.0.0
 */
export const SchemaClassTransformFrom = <
  Base extends SchemaClass<any, any>,
  Fields extends Record<
    PropertyKey,
    | Schema<any>
    | Schema<never>
    | PropertySignature<any, boolean, any, boolean>
    | PropertySignature<never, boolean, never, boolean>
  >,
>(
  base: Base,
  fields: Fields,
  decode: (input: SchemaClass.From<Base>) => ParseResult<
    Omit<SchemaClass.From<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<
        Fields[K]
      >
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> }
  >,
  encode: (
    input: Omit<SchemaClass.From<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<
        Fields[K]
      >
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> },
  ) => ParseResult<SchemaClass.From<Base>>,
): SchemaClassTransform<
  Base,
  SchemaClass.From<Base>,
  Spread<
    Omit<SchemaClass.To<Base>, keyof Fields> & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >
> => {
  const schema = transformResult(
    from(base.structSchema()),
    struct({
      ...base.fields,
      ...fields,
    }) as any,
    decode,
    encode,
  )
  const fn = make(schema, Data.Class.prototype)
  fn.fields = {
    ...base.fields,
    ...fields,
  }
  return fn
}
