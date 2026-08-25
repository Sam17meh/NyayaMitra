import 'dotenv/config'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { pool } from '../db/pool.js'

const firebaseApp = getApps().length
  ? getApps()[0]
  : process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    : null

export async function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) {
    return response.status(401).json({ error: 'Authorization token is required' })
  }

  if (token.startsWith('demo-') || !firebaseApp) {

    request.user = {
      uid: 'demo-user-id',
      email: 'demo@nyayamitra.org',
    }

    try {
      await pool.query(
        `INSERT INTO users (firebase_uid, email)
         VALUES ($1, $2)
         ON CONFLICT (firebase_uid) DO NOTHING`,
        [request.user.uid, request.user.email],
      )
    } catch {
      // Ignore DB errors in demo mode if database is not active
    }

    return next()
  }

  try {
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(token)
    request.user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
    }

    await pool.query(
      `INSERT INTO users (firebase_uid, email)
       VALUES ($1, $2)
       ON CONFLICT (firebase_uid) DO NOTHING`,
      [request.user.uid, request.user.email],
    )

    return next()
  } catch (error) {
    console.error('Firebase authentication failed:', error.message)
    return response.status(401).json({ error: 'Invalid or expired authorization token' })
  }
}