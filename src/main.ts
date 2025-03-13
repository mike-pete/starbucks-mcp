

// Bun.write("./x.json", JSON.stringify(JSON.parse(x)))

// const xx = x

const f = Bun.file( import.meta.dir + "/../example.json")
const json = await f.json()
const example = JSON.stringify(json)


export default example