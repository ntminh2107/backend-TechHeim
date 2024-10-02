import {
  addBlogPost,
  addVideoBlogPost,
  BlogDetail,
  listBlogPost,
  listVideoBlogPost
} from '@/controllers/blog.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import wrap from '@/utils/wrapError'
import { Router } from 'express'

const getBlogRouter = () => {
  const router = Router()
  router.get('', wrap(listBlogPost))
  router.get('/video', wrap(listVideoBlogPost))
  router.get('/:blogID', wrap(BlogDetail))

  router.use(authentication)
  router.post('/add', authorize('admin'), wrap(addBlogPost))
  router.post('/video/add', authorize('admin'), wrap(addVideoBlogPost))

  return router
}

export { getBlogRouter }
