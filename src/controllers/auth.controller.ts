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
import {
  deleteAnAddress,
  getAllAddressesByUserID,
  insertAddress
} from '@/services/user.service'
import { calculateRevenueEachMonth } from '@/services/order.service'

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
  console.log('req', req.body)
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
  const { fullName, address, district, city, phoneNumber, country } = req.body
  if (!userID)
    throw new HttpError(
      'no user found with this ID',
      HttpStatusCode.NOT_ALLOWED
    )
  const data = await insertAddress(
    userID,
    fullName,
    phoneNumber,
    address,
    district,
    city,
    country
  )

  return res.status(HttpStatusCode.CREATED).json(data)
}

const getAllAddresses = async (req: Request, res: Response) => {
  const userID = req.user?.id

  if (!userID) {
    throw new HttpError(
      'User ID not found in request',
      HttpStatusCode.NOT_ALLOWED
    )
  }

  try {
    const addresses = await getAllAddressesByUserID(userID)
    if (addresses.length === 0) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: 'No addresses found for this user' })
    }
    return res.status(HttpStatusCode.OK).json(addresses)
  } catch (error) {
    throw new HttpError(
      'Failed to retrieve addresses',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  }
}

const deleteSelectedAddress = async (req: Request, res: Response) => {
  const userID = req.user?.id // Assuming req.user contains the authenticated user's data
  const { addressID } = req.params

  if (!userID) {
    throw new HttpError(
      'User ID not found in request',
      HttpStatusCode.NOT_MATCH
    )
  }

  if (!addressID) {
    throw new HttpError('Address ID is required', HttpStatusCode.BAD_REQUEST)
  }

  try {
    const result = await deleteAnAddress(userID, Number(addressID))

    return res.status(HttpStatusCode.OK).json({
      message: result
    })
  } catch (error) {
    console.error('Error deleting address:', error)
    throw new HttpError(
      'Failed to delete address',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  }
}

const revenueDisplay = async (_req: Request, res: Response) => {
  const data = await calculateRevenueEachMonth()
  return res.status(HttpStatusCode.OK).json(data)
}

export {
  registerUser,
  login,
  getUser,
  addAddress,
  getAllAddresses,
  deleteSelectedAddress,
  revenueDisplay
}
