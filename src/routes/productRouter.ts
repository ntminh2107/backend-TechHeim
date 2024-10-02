import {
  addProduct,
  filteredProduct,
  getBrandsList,
  getCategoriesList,
  getProductDetail,
  getProducts,
  getSaleProductsList,
  getSearchProducts,
  listFilteredByBrand,
  specFilter
} from '@/controllers/product.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { productValidation } from '@/validators'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  /* list of product by category or brand */
  router.get('', wrap(getProducts))
  router.get('/search-product', wrap(getSearchProducts))
  router.get('/sale', wrap(getSaleProductsList))
  router.get('/brand/:brand', wrap(listFilteredByBrand))
  router.get('/category/:category', wrap(filteredProduct))

  router.get('/spec/:category', wrap(specFilter))
  router.get('/brand-list', wrap(getBrandsList))
  router.get('/category-list', wrap(getCategoriesList))

  /* product detail */
  router.get('/detail/:id', wrap(getProductDetail))

  /*use authen for specific function */
  router.use(authentication)

  /* add a product */
  router.post('/add', authorize('admin'), productValidation(), wrap(addProduct))

  return router
}

export { getProductRouter }
