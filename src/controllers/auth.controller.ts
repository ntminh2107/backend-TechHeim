import {
  findUserByEmail,
  findUserByID,
  register
} from '@/services/auth.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { generateAccessToken } from '@/services/jwt.service'
import { HttpError } from '@/libs/HttpError'

const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, phoneNumber } = req.body
  const user = await register(fullName, email, password, phoneNumber)

  if (typeof user === 'string')
    throw new HttpError(
      'User is not created successfully: ' + user,
      HttpStatusCode.BAD_REQUEST
    )

  res.status(HttpStatusCode.CREATED).json({
    message: 'User created successfully',
    user
  })
}

const login = async (req: Request, res: Response) => {
  const user = await findUserByEmail(req.body.email)
  if (!user) {
    throw new HttpError(
      "user doesn't exist, pls try again!!",
      HttpStatusCode.NOT_FOUND
    )
  }

  const isCorrectPassword = await bcrypt.compare(
    req.body.password,
    user.password
  )

  if (!isCorrectPassword) {
    throw new HttpError(
      'Password is not correct, pls try again!!',
      HttpStatusCode.NOT_MATCH
    )
  }

  const jwtToken = generateAccessToken(user.id)
  res.status(HttpStatusCode.ACCEPTED).json({
    token: jwtToken
  })
}

const getUser = async (req: Request, res: Response) => {
  const userID = req.user?.id

  if (!userID)
    throw new HttpError('no user found with this ID', HttpStatusCode.NOT_FOUND)

  const user = await findUserByID(userID)

  res.status(HttpStatusCode.OK).json({
    message: 'User information retrieve successfully',
    user
  })
}

export { registerUser, login, getUser }
