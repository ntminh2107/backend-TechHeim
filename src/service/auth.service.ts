import { connectionToDB } from '@src/database/connection'
import { tblUser } from '@src/model/user.schema'
import { User } from '@src/types/user'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const register = async (
  fullName: string,
  email: string,
  password: string,
  phoneNumber: string
): Promise<User | string> => {
  try {
    const db = await connectionToDB()
    const currentTime = new Date()

    const existedUser = await db
      ?.select()
      .from(tblUser)
      .where(eq(tblUser.email, email))
      .limit(1)

    if (existedUser && existedUser.length > 0) {
      return 'User is already existed, please try to use another email or username'
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert the new user
    const result = await db
      ?.insert(tblUser)
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
  } catch (err) {
    console.error('Error registering user:', err)
    // Ensure the client gets a response even if an error occurs
    return `Error registering user: ${err}`
  }
}
