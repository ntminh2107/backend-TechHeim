import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { connectionToDB } from './database/connection'
import errorHandler from './middlewares/errorHandler'
import getRouter from './routes/routes'

import ApplyMiddlewares from './middlewares/middlewares'

const app = express()

const start = async () => {
  ApplyMiddlewares(app)

  app.use('/api', getRouter())
  app.use(errorHandler)

  app.listen(process.env.ENV_PORT, () => {
    console.log(`server is running on ${process.env.ENV_PORT}`)
  })
}

Promise.all([connectionToDB()]).then(async () => await start())
