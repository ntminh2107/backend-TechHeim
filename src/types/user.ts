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
