import { Router } from 'express'
import { getAuthRouter } from './authRouter'
import { getProductRouter } from './productRouter'
import { getCartRouter } from './cartRouter'

const getRouter = () => {
  const router = Router()

  /* Router setup */
  router.use('/auth', getAuthRouter())
  router.use('/product', getProductRouter())
  router.use('/cart', getCartRouter())
  return router
}

export default getRouter
