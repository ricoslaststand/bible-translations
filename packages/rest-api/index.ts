import Fastify from 'fastify'

import connection from '../core/db/index'

const fastify = Fastify({
    logger: true
})

fastify.route({
  method: 'GET',
  url: '/',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        translations: { type: 'string' }
      },
      required: ['translations']
    }
  },
  handler: async (request, reply) => {
    return {
      hello: 'world'
    }
  }
})

fastify.get('/health', async () => {
  let databaseStatus

  try {
    await connection.raw('SELECT 1')

    databaseStatus = 'ok'
  } catch (err) {
    databaseStatus = 'error'
  } finally {
    return {
      database: databaseStatus,
    }
  }
})

async function main() {
  // Run the server!
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()