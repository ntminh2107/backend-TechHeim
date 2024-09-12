import { Router } from 'express'
import { getAuthRouter } from './authRouter'

const getRouter = () => {
  const router = Router()

  /* Router setup */
  router.use('/auth', getAuthRouter())

  return router
}

export default getRouter
