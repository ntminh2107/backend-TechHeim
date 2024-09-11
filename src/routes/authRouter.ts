import { getUser, login, registerUser } from '@/controllers/auth.controller'
import verifyJWT from '@/middlewares/authentication'
import { authorizeRole } from '@/middlewares/authorization'
import HttpStatusCode from '@/utils/httpStatusCode'
import wrapError from '@/utils/wrapError'
import { loginValidation, registerValidation } from '@/validators'
import { Request, Response, Router } from 'express'

const getAuthRouter = () => {
  const router = Router()

  router.post('/register', registerValidation(), wrapError(registerUser))

  router.post('/login', loginValidation(), wrapError(login))

  router.use(verifyJWT)

  router.get('/user/me', wrapError(getUser))

  router.get(
    '/admin',
    authorizeRole('admin'),
    (_req: Request, res: Response) => {
      res.status(HttpStatusCode.ACCEPTED).json({ message: 'welcome admin' })
    }
  )

  router.get(
    '/profile',
    authorizeRole('admin', 'user'),
    (req: Request, res: Response) => {
      res
        .status(HttpStatusCode.ACCEPTED)
        .json({ message: `welcome ${req.user?.role}` })
    }
  )

  return router
}
export { getAuthRouter }
