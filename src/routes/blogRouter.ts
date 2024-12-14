import {
  addBlogPost,
  addVideoBlogPost,
  BlogDetail,
  deleteBlogPostController,
  editBlogPost,
  listBlogPost,
  listBlogPostUserController,
  listVideoBlogPost
} from '@/controllers/blog.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
// import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { Router } from 'express'

const getBlogRouter = () => {
  const router = Router()
  router.get('', wrap(listBlogPost))
  router.get('/list', wrap(listBlogPostUserController))
  router.get('/video', wrap(listVideoBlogPost))
  router.get('/:blogID', wrap(BlogDetail))

  router.use(authentication)
  // router.post('/add', authorize('admin'), wrap(addBlogPost))
  // router.post('/video/add', authorize('admin'), wrap(addVideoBlogPost))
  router.post('/add', authorize('admin'), wrap(addBlogPost))
  router.put('/edit/:id', authorize('admin'), wrap(editBlogPost))
  router.delete(
    '/delete/:id',
    authorize('admin'),
    wrap(deleteBlogPostController)
  )
  router.post('/video/add', authorize('admin'), wrap(addVideoBlogPost))

  return router
}

export { getBlogRouter }
