const { describe, it, before, beforeEach, afterEach } = require('mocha')
const request = require('supertest')
const { expect } = require('chai')
const sinon = require('sinon')

const CarService = require('../../src/services/carService')
const SERVER_TEST_PORT = 4000

const mocks = {
  validCar: require('./../mocks/valid-car.json'),
  validCarCategory: require('./../mocks/valid-carCategory.json'),
  validCustomer: require('./../mocks/valid-customer.json'),
}

describe('API Tests Suite', () => {
  let app = {}
  let sandbox = {}

  before(() => {
    const api = require('../../src/api')
    const carService = new CarService({
      cars: '../../database/cars.json'
    })
    const instance = api({ carService })
    app = {
      instance,
      server: instance.initialize(SERVER_TEST_PORT)
    }
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return HTTP Status 404 when accessing an inexistent route', async () => {
    const response = await request(app.server)
      .get('/inexistent-route')
      .expect(404)
    expect(response.text).to.be.equal('Page not found')
  })

  describe('POST /get-available-car', () => {
    it('given a carCategory it should return an available car', async () => {
      const car = mocks.validCar
      const carCategory = {
        ...mocks.validCarCategory,
        carIds: [car.id]
      }

      sandbox.stub(
        app.instance.carService.carRepository,
        app.instance.carService.carRepository.find.name,
      ).resolves(car)

      const expected = car

      const response = await request(app.server)
        .post('/get-available-car')
        .send(carCategory)
        .expect(200)

      expect(response.body).to.be.deep.equal(expected)
    })
  })

  describe('POST /calculate-final-price', () => {
    it('given a carCategory, customer and numberOfDays it should calculate the final amount in real', async () => {
      const car = mocks.validCar
      const carCategory = {
        ...mocks.validCarCategory,
        price: 37.6
      }
      const customer = {
        ...mocks.validCustomer,
        age: 50
      }

      const numberOfDays = 5

      const body = {
        carCategory,
        customer,
        numberOfDays
      }

      sandbox.stub(
        app.instance.carService.carRepository,
        app.instance.carService.carRepository.find.name,
      ).resolves(car)

      const expected = {
        result: app.instance.carService.currencyFormat.format(244.40)
      }

      const response = await request(app.server)
        .post('/calculate-final-price')
        .send(body)
        .expect(200)
      expect(response.body.result).to.be.equal(expected.result)
    })
  })

  describe('POST /rent', () => {
    it('given a customer and a car category it should return a transaction receipt', async () => {
      const car = mocks.validCar
      const carCategory = {
        ...mocks.validCarCategory,
        price: 37.6,
        carIds: [car.id]
      }
      const customer = {
        ...mocks.validCustomer,
        age: 20
      }

      const numberOfDays = 5
      const dueDate = '10 de novembro de 2020'

      const now = new Date(2020, 10, 5)
      sandbox.useFakeTimers(now.getTime())

      const body = {
        carCategory,
        customer,
        numberOfDays
      }

      sandbox.stub(
        app.instance.carService.carRepository,
        app.instance.carService.carRepository.find.name,
      ).resolves(car)

      const expectedAmount = app.instance.carService.currencyFormat.format(206.8)
      const expected = {
        customer,
        car,
        amount: expectedAmount,
        dueDate
      }

      const response = await request(app.server)
        .post('/rent')
        .send(body)
        .expect(200)

      expect(response.body).to.be.deep.equal(expected)
    })
  })
})