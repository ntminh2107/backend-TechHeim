import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { connectionToDB } from './database/connection'
import errorHandler from './middlewares/errorHandler'
import getRouter from './routes/routes'

import HttpStatusCode from './utils/httpStatusCode'
import applyMiddlewares from './middlewares/middlewares'

const app = express()

const start = async () => {
  app.use(applyMiddlewares())

  /*Health check */
  app.get('/healthcheck', (_, res) =>
    res.sendStatus(HttpStatusCode.ACCEPTED).json({ message: 'healthy' })
  )

  app.use('/api', getRouter())
  app.use(errorHandler)
  app.listen(process.env.ENV_PORT, () => {
    console.log(`server is running on ${process.env.ENV_PORT}`)
  })
}

Promise.all([connectionToDB()]).then(async () => await start())
