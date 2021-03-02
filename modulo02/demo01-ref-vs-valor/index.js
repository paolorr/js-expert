const { deepStrictEqual } = require('assert')

let counter = 0
let counter2 = counter

// tipo pimitivo gera copia em memoria
counter2++
deepStrictEqual(counter, 0)
deepStrictEqual(counter2, 1)



const item = { counter: 0 }
const item2 = item

// tipo de referencia copia o endereco em memoria
// e aponta pra o mesmo lugar
item2.counter++
deepStrictEqual(item, { counter: 1 })
item.counter++
deepStrictEqual(item2, { counter: 2 })
