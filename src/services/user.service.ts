import { getDbClient } from '@/database/connection'
import { tblAddress, tblUser } from '@/models/user.schema'
import { Address } from '@/types/user'
import { eq } from 'drizzle-orm'

export const insertAddress = async (
  userID: string,
  fullname: string,
  address: string,
  district: string,
  city: string,
  country: string
): Promise<Address | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const checkUser = await trx
      .select({ id: tblUser.id })
      .from(tblUser)
      .where(eq(tblUser.id, userID))
      .limit(1)
      .then((rows) => rows[0])
    if (!checkUser) throw new Error('can not found user, pls try again')

    const [resAddress] = await trx
      .insert(tblAddress)
      .values({
        userID,
        fullname,
        address,
        district,
        city,
        country
      })
      .returning()
    if (!resAddress) throw new Error('something wrong happen')
    return resAddress as Address
  })
}
