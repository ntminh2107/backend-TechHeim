import { register } from '@src/service/auth.service'
import HttpStatusCode from '@src/utils/httpStatusCode'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

const errorMessage = (res: Response, errorMessage: unknown) => {
  if (typeof errorMessage === 'string') {
    res.status(HttpStatusCode.BAD_REQUEST).json({ message: errorMessage })
    return
  }
  if (errorMessage instanceof Error) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .json({ message: errorMessage.message })
    return
  }
  res.status(HttpStatusCode.BAD_REQUEST).json({ message: errorMessage })
}

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req)
  if (!validationError.isEmpty()) {
    return errorMessage(res, validationError.array())
  }

  try {
    const user = await register(
      req.body.fullName,
      req.body.email,
      req.body.password,
      req.body.phoneNumber
    )

    if (typeof user === 'string') {
      return errorMessage(res, 'User is not created successfully: ' + user)
    }

    // Respond with the newly created user data
    res.status(HttpStatusCode.CREATED).json({
      message: 'User created successfully',
      user
    })
  } catch (err) {
    next(err)
  }
}

export default registerUser
