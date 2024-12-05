import {
  addImagePreview,
  addProduct,
  createBrand,
  createCategory,
  editProductController,
  filteredProduct,
  getBrandsList,
  getCategoriesList,
  getProductDetail,
  getProducts,
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
// import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { productValidation } from '@/validators'
import { Router } from 'express'

const getProductRouter = () => {
  const router = Router()

  /* list of product by category or brand */
  router.get('', wrap(getProducts))
  router.get('/search-product', wrap(getSearchProducts))
  router.post('/add-image', wrap(addImagePreview))
  router.get('/sale', wrap(getSaleProductsList))
  router.get('/brand/:brand', wrap(listFilteredByBrand))
  router.get('/category/:category', wrap(filteredProduct))

  router.get('/spec/:category', wrap(specFilter))
  router.get('/brand-list', wrap(getBrandsList))
  router.get('/category-list', wrap(getCategoriesList))

  /* product detail */
  router.get('/detail/:id', wrap(getProductDetail))
  router.put('/edit/:productID', wrap(editProductController)) // Add route for editing product

  /*use authen for specific function */
  router.use(authentication)

  /* add a product */
  // router.post('/add', authorize('admin'), productValidation(), wrap(addProduct))
  router.post('/add', productValidation(), wrap(addProduct))

  /* Category routes */
  router.post('/category', wrap(createCategory)) // Create a new category
  router.put('/category/:id', wrap(updateCategory)) // Update an existing category
  router.delete('/category/:id', wrap(removeCategory)) // Delete a category

  /* Brand routes */
  router.post('/brand', wrap(createBrand)) // Create a new brand
  router.put('/brand/:id', wrap(updateBrand)) // Update an existing brand
  router.delete('/brand/:id', wrap(removeBrand)) // Delete a brand

  return router
}

export { getProductRouter }
