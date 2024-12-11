import { getDbClient } from '@/database/connection'
import { tblAddresses, tblUsers } from '@/models/user.schema'
import { Address } from '@/types/user'
import { and, eq } from 'drizzle-orm'

export const insertAddress = async (
  userID: string,
  fullname: string,
  phoneNumber: string,
  address: string,
  district: string,
  city: string,
  country: string
): Promise<Address | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const checkUser = await trx
      .select({ id: tblUsers.id })
      .from(tblUsers)
      .where(eq(tblUsers.id, userID))
      .limit(1)
      .then((rows) => rows[0])
    if (!checkUser) throw new Error('can not found user, pls try again')

    const [resAddress] = await trx
      .insert(tblAddresses)
      .values({
        userID,
        fullname,
        phoneNumber,
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

export const getAllAddressesByUserID = async (userID: string) => {
  const db = getDbClient()
  const addresses = await db
    .select()
    .from(tblAddresses)
    .where(eq(tblAddresses.userID, userID))
    .then((rows) => rows)
  return addresses as Address[]
}

export const deleteAnAddress = async (
  userID: string,
  addressID: number
): Promise<string> => {
  const db = getDbClient()

  const deletedCount = await db
    .delete(tblAddresses)
    .where(and(eq(tblAddresses.userID, userID), eq(tblAddresses.id, addressID)))
    .returning()

  if (deletedCount.length === 0) {
    throw new Error('Address not found or does not belong to the user')
  }

  return `Address with ID ${addressID} has been deleted successfully.`
}
