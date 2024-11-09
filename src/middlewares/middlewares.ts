import express from 'express'
import passport from 'passport'
import cors from 'cors'

const applyMiddlewares = () => {
  return [passport.initialize(), express.json()]
}

export default applyMiddlewares
