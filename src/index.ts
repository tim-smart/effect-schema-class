/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import { pipe } from "@effect/data/Function"
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
  extend,
  instanceOf,
  struct,
  transform,
  validate,
} from "@effect/schema/Schema"

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
}

/**
 * @category model
 * @since 1.0.0
 */
export interface SchemaClassExtends<C extends SchemaClass<any, any>, I, A> {
  new (props: A): A &
    CopyWith<A> &
    Data.Case &
    Omit<InstanceType<C>, "copyWith">

  schema<T extends new (...args: any) => any>(
    this: T,
  ): Schema<I, InstanceType<T>>

  structSchema(): Schema<I, A>
}

/**
 * @category constructor
 * @since 1.0.0
 */
export const RawSchemaClass = <I, A extends Record<string, any>>(
  schema_: Schema<I, A>,
): SchemaClass<I, A> => {
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
> => RawSchemaClass(struct(fields as any)) as any

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
    (Base extends SchemaClass<infer I, infer _A> ? I : never) & {
      readonly [K in Exclude<keyof Fields, FromOptionalKeys<Fields>>]: From<
        Fields[K]
      >
    } & { readonly [K in FromOptionalKeys<Fields>]?: From<Fields[K]> }
  >,
  Spread<
    (Base extends SchemaClass<infer _I, infer A> ? A : never) & {
      readonly [K in Exclude<keyof Fields, ToOptionalKeys<Fields>>]: To<
        Fields[K]
      >
    } & { readonly [K in ToOptionalKeys<Fields>]?: To<Fields[K]> }
  >
> => {
  const schema_ = pipe(base.structSchema(), extend(struct(fields)))
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
