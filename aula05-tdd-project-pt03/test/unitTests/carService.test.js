const { describe, it, before, beforeEach, afterEach } = require('mocha')
const { join } = require('path')
const assert = require('assert')
const { expect } = require('chai')
const sinon = require('sinon')

const CarService = require('../../src/services/carService')

const carsDatabase = join(__dirname, '../../database', 'cars.json')

const mocks = {
  validCarCategory: require('../mocks/valid-carCategory.json'),
  validCar: require('../mocks/valid-car.json'),
  validCustomer: require('../mocks/valid-customer.json')
}

describe('CarService Tests Suite', () => {
  let carService = {}
  let sandbox = {}

  before(() => {
    carService = new CarService({
      cars: carsDatabase
    })
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should retrieve a random position from an array', () => {
    const data = [0, 1, 2, 3, 4]
    const result = carService.getRandomPositionFromArray(data)

    expect(result).to.be.lte(data.length).and.to.be.gte(0)
  })

  it('should choose the first id from cardIds in carCategory', () => {
    const carCategory = mocks.validCarCategory
    const carIdIndex = 0

    sandbox.stub(carService, carService.getRandomPositionFromArray.name)
      .returns(carIdIndex)

    const result = carService.chooseRandomCar(carCategory)
    const expected = carCategory.carIds[carIdIndex]

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok
    expect(result).to.be.equal(expected)
  })

  it('given a carCategory it should return an available car', async () => {
    const car = mocks.validCar
    const carCategory = Object.create(mocks.validCarCategory)
    carCategory.carIds = [car.id]

    sandbox.stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car)

    sandbox.spy(carService, carService.chooseRandomCar.name)

    const result = await carService.getAvailableCar(carCategory)
    const expected = car

    expect(carService.chooseRandomCar.calledOnce).to.be.ok
    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok
    expect(result).to.be.deep.equal(expected)
  })

  it('given a carCategory, customer and numberOfDays it should calculate the final amount in real', async () => {
    // aos valores fixos foram retirados do use case

    const customer = Object.create(mocks.validCustomer)
    customer.age = 50

    const carCategory = Object.create(mocks.validCarCategory)
    carCategory.price = 37.6

    const numberOfDays = 5

    sandbox.stub(carService, "taxesBasedOnAge")
      .get(() => [{ from: 40, to: 50, then: 1.3 }])

    const expected = carService.currencyFormat.format(244.40)
    const result = await carService.calculateFinalPrice(customer, carCategory, numberOfDays)

    expect(result).to.be.deep.equal(expected)
  })
})