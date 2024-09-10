import { getUser, login, registerUser } from '@/controllers/auth.controller'
import verifyJWT from '@/middlewares/authentication'
import wrapError from '@/utils/wrapError'
import { loginValidation, registerValidation } from '@/validators'
import { Router } from 'express'

const getAuthRouter = () => {
  const router = Router()

  router.post('/register', registerValidation(), wrapError(registerUser))

  router.post('/login', loginValidation(), wrapError(login))

  router.use(verifyJWT)

  router.get('/user/me', wrapError(getUser))

  return router
}
export { getAuthRouter }
