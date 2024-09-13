import { addProduct, getProductDetail } from '@/controllers/product.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  router.use(authentication)

  router.post('/add', authorize('admin'), wrap(addProduct))

  router.get('/:id', wrap(getProductDetail))

  return router
}

export { getProductRouter }
