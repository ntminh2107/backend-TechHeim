import { getDbClient } from '@/database/connection'
import { tblUser } from '@/models/user.schema'
import { User } from '@/types/user'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const register = async (
  fullName: string,
  email: string,
  password: string,
  phoneNumber: string
): Promise<User | string> => {
  const db = getDbClient()
  const currentTime = new Date()
  console.log('worked')
  const existedUser = await db
    .select()
    .from(tblUser)
    .where(eq(tblUser.email, email))
    .limit(1)

  if (existedUser && existedUser.length > 0) {
    throw new Error(
      'User is already existed, please try to use another email or username'
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await db
    .insert(tblUser)
    .values({
      email,
      fullName,
      password: hashedPassword,
      phoneNumber,
      created_at: currentTime,
      updated_at: currentTime
    })
    .returning()

  if (result && result.length > 0) {
    console.log(`Register success with email: ${email}`)
    return result[0] as User
  } else {
    throw new Error('User registration failed, no user returned.')
  }
}

export const findUserByEmail = async (email: string): Promise<User | false> => {
  const db = getDbClient()

  const user = await db.select().from(tblUser).where(eq(tblUser.email, email))

  if (user?.length === 0) throw new Error('No user found')
  return user[0] as User
}

export const findUserByID = async (userID: string): Promise<User | string> => {
  const db = getDbClient()

  const user = await db.select().from(tblUser).where(eq(tblUser.id, userID))

  if (user.length === 0) throw new Error('no user found')
  return user[0] as User
}
