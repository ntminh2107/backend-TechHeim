import {
  addProduct,
  getProductDetail,
  listFilteredByBrand,
  listFilteredByCategory
} from '@/controllers/product.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  router.use(authentication)

  /* add a product */
  router.post('/add', authorize('admin'), wrap(addProduct))

  /* product detail */
  router.get('/detail/:id', wrap(getProductDetail))

  /* list of product by category or brand */
  router.get('/brand/:brand', wrap(listFilteredByBrand))
  router.get('/category/:category', wrap(listFilteredByCategory))

  return router
}

export { getProductRouter }
