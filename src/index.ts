import express from 'express'
import passport from 'passport'
import { connectionToDB } from './database/connection'
import { getAuthRouter } from './routes/authRoute'

const app = express()

const start = async () => {
  await connectionToDB()

  app.use(passport.initialize())
  app.use(express.json())

  app.use('/api/auth', getAuthRouter())

  app.listen(4000, () => {
    console.log(`server is running on 4000`)
  })

  app.get('/test', (_, res) => {
    res.send('API is working')
  })
}

start()
