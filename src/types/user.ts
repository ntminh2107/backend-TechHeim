export type User = {
  id: string
  fullName: string
  email: string
  password: string
  phoneNumber: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
}

export type Role = {
  id: number
  role: string
}

export type Address = {
  id: number
  fullname: string
  address: string
  district: string
  city: string
  country: string
}
