import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'medbook-super-secret-jwt-key-2026'
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  sub: string // User ID
  email: string
  role: 'PATIENT' | 'DOCTOR'
  fullName: string
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}
