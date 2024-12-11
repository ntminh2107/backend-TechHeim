import {
  addCommentToProduct,
  addProduct,
  createBrand,
  createCategory,
  editProductController,
  filteredProduct,
  filteredProductPagination,
  getAllProductController,
  getBrandsList,
  getCategoriesList,
  getProductComments,
  getProductDetail,
  getSaleProductsList,
  getSearchProducts,
  listFilteredByBrand,
  removeBrand,
  removeCategory,
  specFilter,
  updateBrand,
  updateCategory
} from '@/controllers/product.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
// import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { productValidation } from '@/validators'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  /* list of product by category or brand */
  router.get('', wrap(getAllProductController))
  router.get('/search-product', wrap(getSearchProducts))

  router.get('/sale', wrap(getSaleProductsList))
  router.get('/test/:category', wrap(filteredProductPagination))
  router.get('/brand/:brand', wrap(listFilteredByBrand))
  router.get('/category/:category', wrap(filteredProduct))

  router.get('/spec/:category', wrap(specFilter))
  router.get('/brand-list', wrap(getBrandsList))
  router.get('/category-list', wrap(getCategoriesList))

  /* product detail */
  router.get('/detail/:id', wrap(getProductDetail))

  router.get('/comment/list/:productID', wrap(getProductComments))
  /*use authen for specific function */
  router.use(authentication)

  /* add a product */
  // router.post('/add', authorize('admin'), productValidation(), wrap(addProduct))
  router.post('/add', productValidation(), authorize('admin'), wrap(addProduct))

  /* Category routes */
  router.post('/category', authorize('admin'), wrap(createCategory)) // Create a new category
  router.put('/category/:id', authorize('admin'), wrap(updateCategory)) // Update an existing category
  router.delete('/category/:id', authorize('admin'), wrap(removeCategory)) // Delete a category

  /* Brand routes */
  router.post('/brand', authorize('admin'), wrap(createBrand)) // Create a new brand
  router.put('/brand/:id', authorize('admin'), wrap(updateBrand)) // Update an existing brand
  router.delete('/brand/:id', authorize('admin'), wrap(removeBrand)) // Delete a brand
  router.put(
    '/edit/:productID',
    authorize('admin'),
    wrap(editProductController)
  ) // Add route for editing product
  router.post('/comment/add', authorize('admin'), wrap(addCommentToProduct))

  return router
}

export { getProductRouter }
