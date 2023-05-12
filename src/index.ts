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
  instanceOf,
  struct,
  transform,
  transformResult,
  validate,
} from "@effect/schema/Schema"
import type { ParseResult } from "@effect/schema/ParseResult"

/**
 * @category model
 * @since 1.0.0
 */
export interface CopyWith<A> {
  copyWith<T>(this: T, props: Partial<A>): T
}

/**
 * @category model
 * @since 1.0.0
 */
export interface SchemaClass<I, A> {
  new (props: A): A & CopyWith<A> & Data.Case

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
  new (props: A): A &
    CopyWith<A> &
    Data.Case &
    Omit<InstanceType<C>, "copyWith" | keyof A>

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
  new (props: A): A &
    CopyWith<A> &
    Data.Case &
    Omit<InstanceType<C>, "copyWith" | keyof A>

  schema<T extends new (...args: any) => any>(
    this: T,
  ): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>
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
  const schema_ = struct(fields)
  const validater = validate(schema_)

  const fn = function (this: any, props: unknown) {
    Object.assign(this, validater(props))
  }
  Object.setPrototypeOf(fn.prototype, Data.Class.prototype)
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
  fn.fields = fields
  fn.prototype.copyWith = function copyWith(this: any, props: any) {
    return new (this.constructor as any)({
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
  const schema_ = struct({
    ...base.fields,
    ...fields,
  })
  const validater = validate(schema_)

  const fn = function (this: any, props: unknown) {
    Object.assign(this, validater(props))
  }
  Object.setPrototypeOf(fn.prototype, base.prototype)
  fn.structSchema = function structSchema() {
    return schema_
  }
  fn.schema = function schema(this: any) {
    return transform(
      schema_,
      instanceOf(this),
      (_) => Object.setPrototypeOf(_, this.prototype),
      (_) => Object.setPrototypeOf(_, Object.prototype),
    )
  }
  fn.fields = fields
  fn.prototype.copyWith = function copyWith(this: any, props: any) {
    return new (this.constructor as any)({
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
  const schema_ = transformResult(
    base.structSchema(),
    struct({
      ...base.fields,
      ...fields,
    }) as any,
    decode,
    encode,
  )
  const validater = validate(schema_)

  const fn = function (this: any, props: unknown) {
    Object.assign(this, validater(props))
  }
  Object.setPrototypeOf(fn.prototype, base.prototype)
  fn.structSchema = function structSchema() {
    return schema_
  }
  fn.schema = function schema(this: any) {
    return transform(
      schema_,
      instanceOf(this),
      (_) => Object.setPrototypeOf(_, this.prototype),
      (_) => Object.setPrototypeOf(_, Object.prototype),
    )
  }
  fn.prototype.copyWith = function copyWith(this: any, props: any) {
    return new (this.constructor as any)({
      ...this,
      ...props,
    })
  }

  return fn as any
}
