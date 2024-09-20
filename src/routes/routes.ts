import { Router } from 'express'
import { getAuthRouter } from './authRouter'
import { getProductRouter } from './productRouter'
import { getCartRouter } from './cartRouter'
import { getOrderRouter } from './orderRouter'

const getRouter = () => {
  const router = Router()

  /* Router setup */
  router.use('/auth', getAuthRouter())
  router.use('/product', getProductRouter())
  router.use('/cart', getCartRouter())
  router.use('/order', getOrderRouter())
  return router
}

export default getRouter
