import { getDbClient } from '@/database/connection'
import { tblAddress, tblUser } from '@/models/user.schema'
import { Address } from '@/types/user'
import { eq } from 'drizzle-orm'

export const insertAddress = async (
  userID: string,
  name: string,
  address: string,
  district: string,
  city: string,
  country: string
): Promise<Address | string> => {
  const db = getDbClient()
  const checkUser = await db
    .select({ id: tblUser.id })
    .from(tblUser)
    .where(eq(tblUser.id, userID))
    .limit(1)
  if (checkUser.length === 0)
    throw new Error('can not found user, pls try again')

  const resAddress = await db
    .insert(tblAddress)
    .values({
      userID,
      name,
      address,
      district,
      city,
      country
    })
    .returning()
  if (!resAddress) throw new Error('something wrong happen')
  return resAddress[0] as Address
}
