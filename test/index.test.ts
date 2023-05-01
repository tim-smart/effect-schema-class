import * as Data from "@effect/data/Data"
import * as S from "@effect/schema/Schema"
import { SchemaClass, SchemaClassExtends } from "effect-schema-class"

class Person extends SchemaClass({
  id: S.number,
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
    const person = new Person({ id: 1, name: "John" })
    assert(person.name === "John")
    assert(person.upperName === "JOHN")
  })

  it("schema", () => {
    const person = S.parse(Person.schema())({ id: 1, name: "John" })
    assert(person.name === "John")
  })

  it("extends", () => {
    const person = S.parse(PersonWithAge.schema())({
      id: 1,
      name: "John",
      age: 30,
    })
    assert(person.name === "John")
    assert(person.upperName === "JOHN")
    assert(person.age === 30)
    assert(person.isAdult === true)
  })

  it("extends error", () => {
    expect(() =>
      S.parse(PersonWithAge.schema())({ id: 1, name: "John" }),
    ).toThrowError(
      new Error(`error(s) found
└─ ["age"]
   └─ is missing`),
    )
  })

  it("Data.Class", () => {
    const person = new Person({ id: 1, name: "John" })
    const personAge = new PersonWithAge({ id: 1, name: "John", age: 30 })
    assert(person instanceof Data.Class)
    assert(personAge instanceof Data.Class)
  })

  it("copyWith", () => {
    const person = new Person({ id: 1, name: "John" })
    const joe = person.copyWith({ name: "Joe" })
    assert(joe.id === 1)
    assert(joe.name === "Joe")
  })
})
