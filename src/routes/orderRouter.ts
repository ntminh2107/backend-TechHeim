import { revenueDisplay } from '@/controllers/auth.controller'
import {
  addAnOrder,
  addShipMethod,
  getAllOrdersController,
  getAllOrdersForAdminController,
  getAnOrderDetail,
  getBestSellers,
  getInvoice,
  getShipMethods,
  getStatisticController,
  saveTransactionController
} from '@/controllers/order.controller'
import authentication from '@/middlewares/authentication'
import wrap from '@/utils/wrapError'
import { orderValidation } from '@/validators'
import { Router } from 'express'

const getOrderRouter = () => {
  const router = Router()
  router.get('/ship', wrap(getShipMethods))
  router.get('/best-sellers', wrap(getBestSellers))

  router.get('/invoice/:orderId', wrap(getInvoice))
  router.get('/revenue', wrap(revenueDisplay))
  router.get('/statistic', wrap(getStatisticController))

  router.use(authentication)

  router.post('/add', orderValidation(), wrap(addAnOrder))
  router.get('/detail/:orderID', wrap(getAnOrderDetail))

  router.post('/ship/add', wrap(addShipMethod))

  router.post('/transaction/add', wrap(saveTransactionController))

  router.get('/all', wrap(getAllOrdersController))
  router.get('/admin/all', wrap(getAllOrdersForAdminController))
  router.get('/admin/detail/:orderID', wrap(getAllOrdersForAdminController))
  router.get('/bill/:orderID', wrap(getAnOrderDetail))

  return router
}

export { getOrderRouter }
