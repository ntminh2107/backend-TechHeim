import {
  addToCartCtrl,
  deleteCart,
  deleteCartItem,
  getCart,
  updateQuantityItm
} from '@/controllers/cart.controller'
import authentication from '@/middlewares/authentication'
import { Router } from 'express'
import wrap from '@/utils/wrapError'

const getCartRouter = () => {
  const router = Router()
  router.use(authentication)

  router.post('/add', wrap(addToCartCtrl))
  router.get('/me', wrap(getCart))
  router.post('/update', wrap(updateQuantityItm))

  router.delete('/delete/all', wrap(deleteCart))
  router.delete('/delete', wrap(deleteCartItem))

  return router
}

export { getCartRouter }
