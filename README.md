# chau
colorful diffs for MongoDB's JSON

## How to use

before.json
```json
{
  "foo": foo,
  "bar": bar
}
```

after.json
```json
{
  "foo": foo2,
  "bar": bar2
}
```

chau -b before.json -a after.json foo

```json
{
  "bar" : "bar2" // != "bar"
}
```

-b: before json file.

-a: after json file.

other: filter key words.
