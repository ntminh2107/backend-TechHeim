import express from 'express'
import passport from 'passport'

const applyMiddlewares = () => {
  return [passport.initialize(), express.json()]
}

export default applyMiddlewares
