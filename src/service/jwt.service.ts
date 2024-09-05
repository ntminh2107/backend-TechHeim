import jwt from 'jsonwebtoken'

const accessTokenKey = process.env.ACCESS_TOKEN_KEY || ''
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY || ''

export const generateAccessToken = (userID: string) => {
  return jwt.sign(userID, accessTokenKey, { expiresIn: '15m' })
}

export const generateRefreshToken = (userID: string) => {
  return jwt.sign(userID, refreshTokenKey, { expiresIn: '7d' })
}
