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
import {
  addToCartValidation,
  deleteCartItemValidation,
  updateQuantityValidation
} from '@/validators'

const getCartRouter = () => {
  const router = Router()
  router.use(authentication)

  router.post('/add', addToCartValidation(), wrap(addToCartCtrl))
  router.get('/me', wrap(getCart))
  router.post('/update', updateQuantityValidation(), wrap(updateQuantityItm))

  router.delete('/delete/all', deleteCartItemValidation(), wrap(deleteCart))
  router.delete('/delete', wrap(deleteCartItem))

  return router
}

export { getCartRouter }
