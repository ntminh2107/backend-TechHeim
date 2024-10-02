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
import { insertAddress } from '@/services/user.service'

const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, phoneNumber } = req.body
  const registerRs = await register(fullName, email, password, phoneNumber)

  if (typeof registerRs === 'string')
    throw new HttpError(
      'User is not created successfully: ' + registerRs,
      HttpStatusCode.BAD_REQUEST
    )

  const data = generateAccessToken(registerRs.id, registerRs.role as string)
  res.status(HttpStatusCode.CREATED).json(data)
}

const login = async (req: Request, res: Response) => {
  const data = await findUserByEmail(req.body.email)
  if (!data) {
    throw new HttpError(
      "user doesn't exist, pls try again!!",
      HttpStatusCode.NOT_FOUND
    )
  }

  const isCorrectPassword = await bcrypt.compare(
    req.body.password,
    data.password
  )

  if (!isCorrectPassword) {
    throw new HttpError(
      'Password is not correct, pls try again!!',
      HttpStatusCode.NOT_MATCH
    )
  }

  if (!data.id || !data.role) {
    throw new HttpError(
      'User information is incomplete, unable to login!',
      HttpStatusCode.BAD_REQUEST
    )
  }

  const token = generateAccessToken(data.id, data.role)
  res.status(HttpStatusCode.ACCEPTED).json(token)
}

const getUser = async (req: Request, res: Response) => {
  const userID = req.user?.id

  if (!userID)
    throw new HttpError(
      'no user found with this ID',
      HttpStatusCode.NOT_ALLOWED
    )

  const data = await findUserByID(userID)

  res.status(HttpStatusCode.OK).json(data)
}

const addAddress = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { name, address, district, city, country } = req.body
  if (!userID)
    throw new HttpError(
      'no user found with this ID',
      HttpStatusCode.NOT_ALLOWED
    )
  const data = await insertAddress(
    userID,
    name,
    address,
    district,
    city,
    country
  )

  return res.status(HttpStatusCode.CREATED).json(data)
}

// const logout = async (req: Request, res: Response) => {}

export { registerUser, login, getUser, addAddress }
