import * as Data from "@effect/data/Data"
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

describe("SchemaClass", () => {
  it("constructor", () => {
    const person = new Person({ name: "John" })
    assert(person.name === "John")
    assert(person.upperName === "JOHN")
  })

  it("schema", () => {
    const person = S.parse(Person.schema())({ name: "John" })
    assert(person.name === "John")
  })

  it("extends", () => {
    const person = S.parse(PersonWithAge.schema())({ name: "John", age: 30 })
    assert(person.name === "John")
    assert(person.upperName === "JOHN")
    assert(person.age === 30)
    assert(person.isAdult === true)
  })

  it("extends error", () => {
    expect(() =>
      S.parse(PersonWithAge.schema())({ name: "John" }),
    ).toThrowError(
      new Error(`error(s) found
└─ ["age"]
   └─ is missing`),
    )
  })

  it("Data.Class", () => {
    const person = new Person({ name: "John" })
    const personAge = new PersonWithAge({ name: "John", age: 30 })
    assert(person instanceof Data.Class)
    assert(personAge instanceof Data.Class)
  })
})
