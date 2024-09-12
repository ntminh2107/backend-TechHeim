import { Router } from 'express'
import { getAuthRouter } from './authRouter'
import { getProductRouter } from './productRouter'

const getRouter = () => {
  const router = Router()

  /* Router setup */
  router.use('/auth', getAuthRouter())
  router.use('/product', getProductRouter())

  return router
}

export default getRouter
