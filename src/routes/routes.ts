import { Router } from 'express'
import { getAuthRouter } from './authRouter'
import HttpStatusCode from '@/utils/httpStatusCode'

const getRouter = () => {
  const router = Router()

  /*Health check */
  router.get('/healthcheck', (_, res) =>
    res.sendStatus(HttpStatusCode.ACCEPTED).json({ message: 'healthy' })
  )

  /* Router setup */
  router.use('/auth', getAuthRouter())

  return router
}

export default getRouter
