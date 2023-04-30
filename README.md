# effect-schema-class

The power of @effect/schema and classes combined!

## Example

```ts
import * as S from "@effect/schema/Schema"
import { SchemaClass, SchemaClassExtends } from "effect-schema-class"

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

const person = new Person({ name: "Tim" }) // constructors validate the props
const parsePerson = S.parse(Person.schema())

assert(person instanceof Data.Class) // extends Data for equality checks

// clone a instance and validate the props
const john = person.copyWith({ name: "John" })
```

## License

The MIT License (MIT)
