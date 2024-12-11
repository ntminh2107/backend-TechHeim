import { HttpError } from '@/libs/HttpError'
import {
  editBlog,
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
  const currentPage = parseInt(req.query.page as string, 10) || 1
  const itemsPerPage = parseInt(req.query.pageSize as string, 10) || 4

  // Extract sort order, default to 'asc'
  const sortOrder: 'asc' | 'desc' =
    (req.query.sortOrder as 'asc' | 'desc') || 'asc'
  const searchQuery = req.query.search as string

  const data = await getBlogsList(
    sortOrder,
    itemsPerPage,
    currentPage,
    searchQuery
  )

  // Return the response with the blog data and pagination meta
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

const editBlogPost = async (req: Request, res: Response) => {
  const { id } = req.params // Extract blog ID from route parameters
  const { title, author, readTime, tags, content, image } = req.body

  try {
    // Validate the ID
    const blogID = parseInt(id, 10)
    if (isNaN(blogID)) {
      throw new HttpError('Invalid blog ID', HttpStatusCode.BAD_REQUEST)
    }

    // Call the editBlog service
    const data = await editBlog(blogID, {
      title,
      author,
      readTime,
      tags,
      content,
      image
    })

    if (!data) {
      throw new HttpError(
        'Error while editing blog',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      )
    }

    res.status(HttpStatusCode.OK).json(data)
  } catch (error) {
    console.error('Error while editing blog:', error)
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message })
    } else {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' })
    }
  }
}

export {
  addBlogPost,
  listBlogPost,
  BlogDetail,
  listVideoBlogPost,
  addVideoBlogPost,
  editBlogPost
}
