import { addToCartCtrl, getCart } from '@/controllers/cart.controller'
import authentication from '@/middlewares/authentication'
import { Router } from 'express'
import wrap from '@/utils/wrapError'

const getCartRouter = () => {
  const router = Router()
  router.use(authentication)

  router.post('/add', wrap(addToCartCtrl))
  router.get('/me', wrap(getCart))

  return router
}

export { getCartRouter }
