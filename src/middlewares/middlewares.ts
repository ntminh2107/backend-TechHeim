import express from 'express'
import passport from 'passport'

const ApplyMiddlewares = (app: express.Application) => {
  app.use(passport.initialize())
  app.use(express.json())
}

export default ApplyMiddlewares
