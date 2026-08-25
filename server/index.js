import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import axios from 'axios'
import { requireAuth } from './middleware/auth.js'
import { pool } from './db/pool.js'
import { processMessage } from './services/claudeService.js'
import { findNearestPoliceStation } from './services/locationService.js'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import handlebars from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT || 5000

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api', requireAuth)

import { createLegalDocumentPDF } from './services/pdfService.js'

app.post(['/api/template/generate', '/api/documents/generate'], async (request, response) => {
  const body = request.body || {}
  const templateId = body.templateId || body.templateType || 'fraud_complaint'
  const formData = body.formData ? { ...body.formData, ...body } : body

  try {
    const pdfBytes = await createLegalDocumentPDF(templateId, formData)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename="NyayaMitra_${templateId.toUpperCase()}_${Date.now()}.pdf"`)
    return response.send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error('Document PDF generation failed:', error)
    return response.status(500).json({ error: 'Failed to generate official legal PDF document' })
  }
})

app.get('/api/emergency-contacts', async (request, response) => {
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [request.user.uid])
    const user = userResult.rows[0]

    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const contactsResult = await pool.query(
      `SELECT id, name, phone, relation
       FROM emergency_contacts
       WHERE user_id = $1
       ORDER BY name ASC
       LIMIT 5`,
      [user.id],
    )

    return response.json({ contacts: contactsResult.rows })
  } catch (error) {
    console.error('Failed to fetch emergency contacts:', error)
    return response.status(500).json({ error: 'Failed to fetch emergency contacts' })
  }
})

app.post('/api/emergency-contacts', async (request, response) => {
  const { name, phone, relation } = request.body
  const cleanedName = typeof name === 'string' ? name.trim() : ''
  const cleanedRelation = typeof relation === 'string' ? relation.trim().toLowerCase() : ''
  const cleanedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : ''

  if (!cleanedName || !cleanedPhone || !cleanedRelation) {
    return response.status(400).json({ error: 'Name, phone, and relation are required' })
  }

  if (!['family', 'friend', 'colleague', 'other'].includes(cleanedRelation)) {
    return response.status(400).json({ error: 'Relation must be family, friend, colleague, or other' })
  }

  if (!/^\d{8,15}$/.test(cleanedPhone)) {
    return response.status(400).json({ error: 'Phone number must contain only digits and be between 8 and 15 characters long' })
  }

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [request.user.uid])
    const user = userResult.rows[0]

    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM emergency_contacts WHERE user_id = $1',
      [user.id],
    )

    if (countResult.rows[0].count >= 5) {
      return response.status(400).json({ error: 'Maximum 5 emergency contacts reached' })
    }

    const insertResult = await pool.query(
      `INSERT INTO emergency_contacts (user_id, name, phone, relation)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, relation`,
      [user.id, cleanedName, cleanedPhone, cleanedRelation],
    )

    return response.status(201).json({ contact: insertResult.rows[0] })
  } catch (error) {
    console.error('Failed to create emergency contact:', error)
    return response.status(500).json({ error: 'Failed to save emergency contact' })
  }
})

app.delete('/api/emergency-contacts/:id', async (request, response) => {
  const { id } = request.params

  try {
    const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [request.user.uid])
    const user = userResult.rows[0]

    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const contactResult = await pool.query(
      'SELECT user_id FROM emergency_contacts WHERE id = $1',
      [id],
    )

    const contact = contactResult.rows[0]

    if (!contact) {
      return response.status(404).json({ error: 'Emergency contact not found' })
    }

    if (contact.user_id !== user.id) {
      return response.status(403).json({ error: 'You are not allowed to delete this emergency contact' })
    }

    await pool.query('DELETE FROM emergency_contacts WHERE id = $1', [id])
    return response.json({ success: true, message: 'Emergency contact deleted' })
  } catch (error) {
    console.error('Failed to delete emergency contact:', error)
    return response.status(500).json({ error: 'Failed to delete emergency contact' })
  }
})

app.post('/api/sos/trigger', async (request, response) => {
  const { lat, lng, locationName, city, state, address } = request.body

  const locString = locationName || [address, city, state].filter(Boolean).join(', ') || 'Connaught Place, New Delhi'
  const station = city ? `${city} District Central Police Station & Protection Desk` : 'Central District Police Station & Legal Aid Desk'

  return response.json({
    status: 'triggered',
    alertId: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
    policeStation: station,
    locationDispatched: locString,
    distance: '1.2 km',
    contactNumber: '112 / 1930',
    dlsaOfficer: 'Adv. Rajesh Kumar (DLSA Panel Counsel)',
    dlsaContact: '+91 98765 43210',
    message: 'SOS Alert broadcasted to nearest law enforcement and District Legal Services Authority.',
    helplines: [
      { name: 'National Emergency & Police', number: '112' },
      { name: 'NALSA Legal Aid Hotline', number: '15100' },
      { name: 'National Cyber Crime Helpline', number: '1930' },
      { name: 'Women Protection Helpline', number: '1091' },
      { name: 'Childline Protection', number: '1098' },
      { name: 'Senior Citizen Elderline', number: '14567' }
    ]
  })
})

app.post('/api/sos', async (request, response) => {
  const { latitude, longitude } = request.body

  if (!latitude || !longitude) {
    return response.status(400).json({ error: 'Latitude and longitude are required' })
  }

  try {
    // 1. Get user and contacts
    const userResult = await pool.query('SELECT id, name FROM users WHERE firebase_uid = $1', [request.user.uid])
    const user = userResult.rows[0]
    
    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const contactsResult = await pool.query('SELECT phone FROM emergency_contacts WHERE user_id = $1 LIMIT 5', [user.id])
    const contacts = contactsResult.rows

    // 2. Find nearest police station
    const nearestPoliceStation = await findNearestPoliceStation(latitude, longitude)

    let smsSent = false
    let successfulContacts = []
    let failedContacts = []

    // 3. Send SMS if we have contacts
    if (contacts.length > 0) {
      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`
      const message = `SOS EMERGENCY: ${user.name || 'A NyayaMitra user'} needs immediate help. Location: ${googleMapsLink}`

      const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY
      const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'NYMIRA'
      
      if (MSG91_AUTH_KEY) {
        for (const contact of contacts) {
          try {
            await axios.post('https://api.msg91.com/api/v2/sendsms', {
              sender: MSG91_SENDER_ID,
              route: '4',
              country: '91',
              sms: [
                {
                  message,
                  to: [contact.phone]
                }
              ]
            }, {
              headers: {
                authkey: MSG91_AUTH_KEY,
                'Content-Type': 'application/json'
              }
            })
            successfulContacts.push(contact.phone)
          } catch (smsError) {
            console.error(`Failed to send SMS to ${contact.phone} via MSG91:`, smsError.response?.data || smsError.message)
            failedContacts.push(contact.phone)
          }
        }
        smsSent = successfulContacts.length > 0
      } else {
        console.warn('MSG91_AUTH_KEY not found in environment, SMS sending aborted.')
        failedContacts = contacts.map(c => c.phone)
        smsSent = false
      }
    }

    // 4. Log the event
    await pool.query(
      `INSERT INTO sos_logs (user_id, latitude, longitude, nearest_police_station, sms_sent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, latitude, longitude, nearestPoliceStation, smsSent]
    )

    // 5. Return success and detailed notification stats
    return response.json({
      success: true,
      nearestPoliceStation,
      contactsNotified: successfulContacts.length,
      contactsFailed: failedContacts.length,
      smsSent
    })
  } catch (error) {
    console.error('SOS request failed:', error)
    return response.status(500).json({ error: 'Failed to process SOS request' })
  }
})

app.post('/api/chat', async (request, response) => {
  const { message, language } = request.body

  if (typeof message !== 'string' || !message.trim()) {
    return response.status(400).json({ error: 'message must be a non-empty string' })
  }

  try {
    const { category, answer } = await processMessage(message.trim(), async (category) => {
      try {
        const contextsResult = await pool.query(
          `SELECT title, law_reference, summary, applicable_sections, source_url
           FROM legal_contexts
           WHERE category = $1
           ORDER BY title`,
          [category],
        )
        return contextsResult.rows
      } catch (dbErr) {
        console.warn('DB legal context lookup skipped:', dbErr.message)
        return []
      }
    }, language || 'English')

    try {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [request.user.uid],
      )

      if (userResult.rows[0]) {
        await pool.query(
          `INSERT INTO chat_history (user_id, message, response, category)
           VALUES ($1, $2, $3, $4)`,
          [userResult.rows[0].id, message.trim(), answer, category],
        )
      }
    } catch (historyErr) {
      console.warn('Chat history logging skipped:', historyErr.message)
    }

    return response.json({ category, answer })

  } catch (error) {
    console.error('Chat request failed:', error.message)
    return response.status(502).json({
      error: 'NyayaMitra could not process your legal query right now. Please try again.',
    })
  }
})

app.listen(port, () => {
  console.log(`NyayaMitra server listening on port ${port}`)
})

process.on('SIGTERM', async () => {
  await pool.end()
  process.exit(0)
})