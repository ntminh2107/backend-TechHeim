import { HttpError } from '@/libs/HttpError'
import {
  getBlogDetail,
  getBlogsList,
  getVideoBlogList,
  insertBlog,
  insertVideoBlog
} from '@/services/blog.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addBlogPost = async (req: Request, res: Response) => {
  const { title, author, readTime, tags, content, image } = req.body

  const data = await insertBlog(title, author, readTime, tags, content, image)
  if (!data)
    throw new HttpError(
      'Error while adding blog',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  res.status(HttpStatusCode.CREATED).json(data)
}

const addVideoBlogPost = async (req: Request, res: Response) => {
  const { title, url, image } = req.body
  const data = await insertVideoBlog(title, url, image)
  if (!data)
    throw new HttpError(
      'Error while adding new video blog',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  res.status(HttpStatusCode.CREATED).json(data)
}

const listVideoBlogPost = async (_req: Request, res: Response) => {
  const data = await getVideoBlogList()
  if (!data)
    throw new HttpError(
      'Error while retrieve list video blog',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const listBlogPost = async (req: Request, res: Response) => {
  const sort = req.params.sort === 'desc' ? 'desc' : 'asc'
  const limit = req.params.limit
  const data = await getBlogsList(sort, Number(limit))

  if (!data)
    throw new HttpError(
      'Error while retrieve list blog',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const BlogDetail = async (req: Request, res: Response) => {
  const { blogID } = req.params
  const data = await getBlogDetail(Number(blogID))

  if (!data)
    throw new HttpError(
      'Error while retrieve blog detail',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

export {
  addBlogPost,
  listBlogPost,
  BlogDetail,
  listVideoBlogPost,
  addVideoBlogPost
}
