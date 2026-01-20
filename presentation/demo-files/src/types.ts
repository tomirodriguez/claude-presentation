// Tipos compartidos para los demos

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

export interface Session {
  userId: string
  token: string
  expiresAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
