import { getDbClient } from '@/database/connection'
import { tblBlogs, tblTagBlogs, tblVideoBlogs } from '@/models/blog.schema'
import { Blog, VideoBlog } from '@/types/blog'
import { asc, eq, desc } from 'drizzle-orm'

export const insertBlog = async (
  title: string,
  author: string,
  readTime: string,
  tags: string[],
  content: string,
  image: string
): Promise<Blog | string> => {
  const db = getDbClient()
  const insertBlog = await db
    .insert(tblBlogs)
    .values({
      title,
      author,
      readTime,
      image,
      content
    })
    .returning()
    .then((rows) => rows[0])

  if (!insertBlog) {
    throw new Error('error when trying to insert blog')
  }
  const insertTagBlog = await db
    .insert(tblTagBlogs)
    .values(
      tags.map((tag) => ({
        blogID: insertBlog.id,
        tag
      }))
    )
    .returning({ tag: tblTagBlogs.tag })

  const result: Blog = {
    id: insertBlog.id,
    title: insertBlog.title,
    author: insertBlog.author,
    readTime: insertBlog.readTime,
    releaseDate: insertBlog.releaseDate as Date,
    tags: insertTagBlog
      .map((tagRow) => tagRow.tag)
      .filter((tag): tag is string => tag !== null),
    image: insertBlog.image,
    content: insertBlog.content
  }

  return result
}

export const insertVideoBlog = async (
  title: string,
  url: string,
  image: string
): Promise<VideoBlog | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const insertVideoBlog = await trx
      .insert(tblVideoBlogs)
      .values({ title, url, image })
      .returning()

    if (!insertVideoBlog) throw new Error('cannot insert new video blog')
    return insertVideoBlog[0] as VideoBlog
  })
}

export const getVideoBlogList = async (): Promise<VideoBlog[] | string> => {
  const db = getDbClient()
  const query = await db
    .select({
      id: tblVideoBlogs.id,
      title: tblVideoBlogs.title,
      url: tblVideoBlogs.url,
      image: tblVideoBlogs.image
    })
    .from(tblVideoBlogs)
  return query as VideoBlog[]
}

export const getBlogsList = async (
  sort: 'asc' | 'desc' = 'asc',
  limit: number | 20
): Promise<Blog[] | string> => {
  const db = getDbClient()

  const orderCondition = sort === 'asc' ? asc : desc

  const queryListBlog = await db
    .select({
      id: tblBlogs.id,
      title: tblBlogs.title,
      author: tblBlogs.author,
      readTime: tblBlogs.readTime,
      releaseDate: tblBlogs.releaseDate,
      image: tblBlogs.image,
      content: tblBlogs.content
    })
    .from(tblBlogs)
    .orderBy(orderCondition(tblBlogs.releaseDate))
    .limit(limit)

  const queryTagBlog = await db
    .select({ tag: tblTagBlogs.tag })
    .from(tblTagBlogs)
    .where(eq(tblTagBlogs.blogID, queryListBlog[0].id))

  const result: Blog[] = queryListBlog.map((blog) => ({
    id: blog.id,
    title: blog.title,
    author: blog.author,
    readTime: blog.readTime,
    releaseDate: blog.releaseDate as Date,
    tags: queryTagBlog
      .map((tagRow) => tagRow.tag)
      .filter((tag): tag is string => tag !== null),
    image: blog.image,
    content: blog.content
  }))
  return result
}

export const getBlogDetail = async (blogID: number): Promise<Blog | string> => {
  const db = getDbClient()
  const [queryBlogPost] = await db
    .select({
      id: tblBlogs.id,
      title: tblBlogs.title,
      author: tblBlogs.author,
      readTime: tblBlogs.readTime,
      releaseDate: tblBlogs.releaseDate,
      image: tblBlogs.image,
      content: tblBlogs.content
    })
    .from(tblBlogs)
    .where(eq(tblBlogs.id, blogID))

  const queryTagBlog = await db
    .select({ tag: tblTagBlogs.tag })
    .from(tblTagBlogs)
    .where(eq(tblTagBlogs.blogID, queryBlogPost.id))

  const result: Blog = {
    id: queryBlogPost.id,
    title: queryBlogPost.title,
    author: queryBlogPost.author,
    readTime: queryBlogPost.readTime,
    releaseDate: queryBlogPost.releaseDate as Date,
    tags: queryTagBlog
      .map((tagRow) => tagRow.tag)
      .filter((tag): tag is string => tag !== null),
    image: queryBlogPost.image,
    content: queryBlogPost.content
  }

  return result
}
