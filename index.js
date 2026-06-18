const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'Solar Backend attivo', version: '1.0.0', porta: PORT })
})

app.post('/api/geotiff', async (req, res) => {
  try {
    const { url } = req.body
    if (!url || !url.includes('solar.googleapis.com')) {
      return res.status(403).json({ error: 'URL non autorizzato' })
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Google error: ${response.status}`)
    const buffer = await response.arrayBuffer()
    res.setHeader('Content-Type', 'image/tiff')
    res.send(Buffer.from(buffer))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/data-layers', async (req, res) => {
  try {
    const { lat, lng, apiKey } = req.query
    const url = `https://solar.googleapis.com/v1/dataLayers:get?location.latitude=${lat}&location.longitude=${lng}&radiusMeters=60&view=FULL_LAYERS&requiredQuality=LOW&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/building-insights', async (req, res) => {
  try {
    const { lat, lng, apiKey } = req.query
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Solar Backend attivo su porta ${PORT}`)
})
