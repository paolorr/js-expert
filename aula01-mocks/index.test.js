const { rejects, deepStrictEqual } = require('assert')

const { error } = require('./src/constants')
const File = require('./src/file')

  ;
(async () => {
  {
    const filePath = './mocks/emptyFile-invalid.csv'
    const rejection = new Error(error.FILE_LENGTH_ERROR_MESSAGE)
    const result = File.csvToJson(filePath)
    await rejects(result, rejection)
  }

  {
    const filePath = './mocks/fourItems-invalid.csv'
    const rejection = new Error(error.FILE_LENGTH_ERROR_MESSAGE)
    const result = File.csvToJson(filePath)
    await rejects(result, rejection)
  }

  {
    Date.prototype.getFullYear = () => 2020
    const filePath = './mocks/threeItems-valid.csv'
    const result = await File.csvToJson(filePath)
    const expected = [
      {
        "id": 123,
        "name": "John Doe",
        "profession": "Developer",
        "birthDay": 1995
      },
      {
        "id": 321,
        "name": "Foo Bar",
        "profession": "Designer",
        "birthDay": 1940
      },
      {
        "id": 456,
        "name": "Mary Jane",
        "profession": "Manager",
        "birthDay": 1990
      }
    ]
    deepStrictEqual(JSON.stringify(result), JSON.stringify(expected))
  }
})()