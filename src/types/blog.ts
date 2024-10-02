export type Blog = {
  id: number
  title: string
  author: string
  readTime: string
  tags: string[]
  releaseDate: Date
  content: string
  image: string
  comment?: Comment[]
}

export type VideoBlog = {
  id: number
  title: string
  url: string
  image: string
}
