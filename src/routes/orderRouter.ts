import { addAnOrder, getAnOrder } from '@/controllers/order.controller'
import authentication from '@/middlewares/authentication'
import wrap from '@/utils/wrapError'
import { Router } from 'express'

const getOrderRouter = () => {
  const router = Router()
  router.use(authentication)

  router.post('/add', wrap(addAnOrder))

  router.get('/:orderID', wrap(getAnOrder))

  return router
}

export { getOrderRouter }
