import { findUserByEmail, register } from '@src/service/auth.service'
import HttpStatusCode from '@src/utils/httpStatusCode'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { generateAccessToken } from '@src/service/jwt.service'

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

    res.status(HttpStatusCode.CREATED).json({
      message: 'User created successfully',
      user
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserByEmail(req.body.email)
    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        message: "user doesn't exist, pls try again!!"
      })
    }
    console.log(user)

    const isCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    )

    console.log(isCorrectPassword)

    if (!isCorrectPassword) {
      return res
        .status(HttpStatusCode.NOT_MATCH)
        .json({ message: 'Password is not correct, pls try again!!' })
    }

    const jwtToken = generateAccessToken(user.id)
    res.status(HttpStatusCode.ACCEPTED).json({
      token: jwtToken
    })
  } catch (err) {
    next(err)
  }
}

export { registerUser, login }
