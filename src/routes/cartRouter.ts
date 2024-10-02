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
  router.patch(
    '/update/:cartItemID',
    updateQuantityValidation(),
    wrap(updateQuantityItm)
  )

  router.delete(
    '/delete/:cartItemID',
    deleteCartItemValidation(),
    wrap(deleteCart)
  )
  router.delete('/delete', wrap(deleteCartItem))

  return router
}

export { getCartRouter }
