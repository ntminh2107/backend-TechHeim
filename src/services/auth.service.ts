import { getDbClient } from '@/database/connection'
import { tblRoles, tblUsers } from '@/models/user.schema'
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

  const existedUser = await db
    .select()
    .from(tblUsers)
    .where(eq(tblUsers.email, email))
    .limit(1)

  if (existedUser && existedUser.length > 0) {
    throw new Error(
      'User is already existed, please try to use another email or username'
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  return await db.transaction(async (trx) => {
    const result = await trx
      .insert(tblUsers)
      .values({
        email,
        fullName,
        password: hashedPassword,
        phoneNumber,
        createdAt: currentTime,
        updatedAt: currentTime
      })
      .returning()

    if (result && result.length > 0) {
      console.log(`Register success with email: ${email}`)
      return result[0] as User
    } else {
      throw new Error('User registration failed, no user returned.')
    }
  })
}

export const findUserByEmail = async (email: string): Promise<User | false> => {
  const db = getDbClient()

  const user = await db
    .select({
      id: tblUsers.id,
      email: tblUsers.email,
      password: tblUsers.password,
      role: tblRoles.role
    })
    .from(tblUsers)
    .innerJoin(tblRoles, eq(tblUsers.roleID, tblRoles.id))
    .where(eq(tblUsers.email, email))
    .limit(1)
    .then((rows) => rows[0])

  if (!user) throw new Error('No user found')
  return user as User
}

export const findUserByID = async (userID: string): Promise<User | string> => {
  const db = getDbClient()

  const user = await db
    .select({
      id: tblUsers.id,
      fullName: tblUsers.fullName,
      email: tblUsers.email,
      phoneNumber: tblUsers.phoneNumber,
      role: tblRoles.role,
      createdAt: tblUsers.createdAt,
      updatedAt: tblUsers.updatedAt
    })
    .from(tblUsers)
    .innerJoin(tblRoles, eq(tblUsers.roleID, tblRoles.id))
    .where(eq(tblUsers.id, userID))
    .limit(1)
    .then((rows) => rows[0])

  if (!user) throw new Error('no user found')
  return user as User
}
