import { Router } from 'express'
import { getAuthRouter } from './authRouter'
import { getProductRouter } from './productRouter'
import { getCartRouter } from './cartRouter'
import { getOrderRouter } from './orderRouter'
import { getBlogRouter } from './blogRouter'

const getRouter = () => {
  const router = Router()

  /* Router setup */
  router.use('/product', getProductRouter())
  router.use('/auth', getAuthRouter())
  router.use('/cart', getCartRouter())
  router.use('/order', getOrderRouter())
  router.use('/blog', getBlogRouter())
  return router
}

export default getRouter
