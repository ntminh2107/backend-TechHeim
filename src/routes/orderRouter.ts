import { addAnOrder, getAnOrder } from '@/controllers/order.controller'
import authentication from '@/middlewares/authentication'
import wrap from '@/utils/wrapError'
import { orderValidation } from '@/validators'
import { Router } from 'express'

const getOrderRouter = () => {
  const router = Router()
  router.use(authentication)

  router.post('/add', orderValidation(), wrap(addAnOrder))

  router.get('/:orderID', wrap(getAnOrder))

  return router
}

export { getOrderRouter }
