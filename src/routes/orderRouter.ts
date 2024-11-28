import {
  addAnOrder,
  addShipMethod,
  getAnOrderDetail,
  getShipMethods
} from '@/controllers/order.controller'
import authentication from '@/middlewares/authentication'
import wrap from '@/utils/wrapError'
import { orderValidation } from '@/validators'
import { Router } from 'express'

const getOrderRouter = () => {
  const router = Router()
  router.get('/ship', wrap(getShipMethods))
  router.use(authentication)

  router.post('/add', orderValidation(), wrap(addAnOrder))
  router.get('/detail/:orderID', wrap(getAnOrderDetail))

  router.post('/ship/add', wrap(addShipMethod))

  // router.post('/transaction/add', wrap(addTransaction))

  return router
}

export { getOrderRouter }
