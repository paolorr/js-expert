const http = require('http')

const DEFAULT_PORT = 3000
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

class Api {
  constructor(dependencies) {
    this.carService = dependencies.carService
  }

  initialize(port = DEFAULT_PORT) {
    const server = http.createServer(this.handler.bind(this))
      .listen(port, () => console.log('app running at', port))
    return server
  }

  handler(request, response) {
    const { url, method } = request
    const routeKey = `${url}:${method.toLowerCase()}`

    const routes = this.getRoutes()
    const chosen = routes[routeKey] || routes.default

    response.writeHead(200, DEFAULT_HEADERS)
    return chosen(request, response)
  }

  getRoutes() {
    return {
      '/get-available-car:post': async (request, response) => {
        for await (const data of request) {
          const carCategory = JSON.parse(data)

          const result = await this.carService.getAvailableCar(carCategory)

          response.writeHead(200, DEFAULT_HEADERS)
          response.write(JSON.stringify(result))
          return response.end()
        }
      },

      '/calculate-final-price:post': async (request, response) => {
        for await (const data of request) {
          const { carCategory, customer, numberOfDays } = JSON.parse(data)

          const result = this.carService.calculateFinalPrice(customer, carCategory, numberOfDays)

          response.writeHead(200, DEFAULT_HEADERS)
          response.write(JSON.stringify({ result }))
          return response.end()
        }
      },

      '/rent:post': async (request, response) => {
        for await (const data of request) {
          const { carCategory, customer, numberOfDays } = JSON.parse(data)

          const result = await this.carService.rent(customer, carCategory, numberOfDays)

          response.writeHead(200, DEFAULT_HEADERS)
          response.write(JSON.stringify(result))
          return response.end()
        }
      },

      default: (request, response) => {
        response.writeHead(404)
        response.write('Page not found')
        return response.end()
      }
    }
  }
}

module.exports = (dependencies) => new Api(dependencies)