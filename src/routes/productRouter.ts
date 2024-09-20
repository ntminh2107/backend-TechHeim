import {
  addProduct,
  filteredProduct,
  getProductDetail,
  listFilteredByBrand,
  specFilterCtrl
} from '@/controllers/product.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { productValidation } from '@/validators'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  /* list of product by category or brand */
  router.get('/brand/:brand', wrap(listFilteredByBrand))
  router.get('/category/:category', wrap(filteredProduct))

  router.get('/spec/:category', wrap(specFilterCtrl))

  /* product detail */
  router.get('/detail/:id', wrap(getProductDetail))

  /*use authen for specific function */
  router.use(authentication)

  /* add a product */
  router.post('/add', authorize('admin'), productValidation(), wrap(addProduct))

  return router
}

export { getProductRouter }
