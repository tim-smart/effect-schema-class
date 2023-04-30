# effect-schema-class

The power of @effect/schema and classes combined!

## Example

```ts
import * as S from "@effect/schema/Schema"

class Person extends SchemaClass({
  name: S.string,
}) {
  get upperName() {
    return this.name.toUpperCase()
  }
}

class PersonWithAge extends SchemaClassExtends(Person, {
  age: S.number,
}) {
  get isAdult() {
    return this.age >= 18
  }
}

const person = new Person({ name: "Tim" })
const parsePerson = S.parse(Person.schema())

assert(person instanceof Data.Class) // extends Data for equality checks
```

## License

The MIT License (MIT)
