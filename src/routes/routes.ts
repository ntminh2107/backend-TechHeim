import { Router } from 'express'
import { getAuthRouter } from './authRouter'

const getRouter = () => {
  const router = Router()

  router.use('/auth', getAuthRouter())

  return router
}

export default getRouter
