import { getUser, login, registerUser } from '@/controllers/auth.controller'
import authentication from '@/middlewares/authentication'
import { authorize } from '@/middlewares/authorization'
import HttpStatusCode from '@/utils/httpStatusCode'
import wrap from '@/utils/wrapError'

import { loginValidation, registerValidation } from '@/validators'
import { Request, Response, Router } from 'express'

const getAuthRouter = () => {
  const router = Router()

  router.post('/register', registerValidation(), wrap(registerUser))

  router.post('/login', loginValidation(), wrap(login))

  router.use(authentication)

  router.get('/user/me', wrap(getUser))

  router.get(
    '/admin',
    authorize('admin'),
    wrap((_req: Request, res: Response) => {
      res.status(HttpStatusCode.ACCEPTED).json({ message: 'welcome admin' })
    })
  )

  router.get(
    '/profile',
    authorize('admin', 'user'),
    wrap((req: Request, res: Response) => {
      res
        .status(HttpStatusCode.ACCEPTED)
        .json({ message: `welcome ${req.user?.role}` })
    })
  )

  return router
}
export { getAuthRouter }
