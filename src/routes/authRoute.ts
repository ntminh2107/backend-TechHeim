import { login, registerUser } from '@src/controller/auth.controller'
import { loginValidation, registerValidation } from '@src/validation'
import { Router } from 'express'

const getAuthRouter = () => {
  const router = Router()

  router.post('/register', registerValidation(), registerUser)

  router.post('/login', loginValidation, login)

  return router
}
export { getAuthRouter }
