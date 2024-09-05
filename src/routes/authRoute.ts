import registerUser from '@src/controller/auth.controller'
import { registerValidation } from '@src/validation'
import { Router } from 'express'

const getAuthRouter = () => {
  const router = Router()

  router.post('/register', registerValidation(), registerUser)

  return router
}
export { getAuthRouter }
