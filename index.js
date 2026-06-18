const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
const PORT = process.env.PORT || 3001

// Abilita CORS per il frontend React
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Solar Backend attivo', version: '1.0.0' })
})

// Proxy GeoTIFF — scarica server-to-server senza CORS
app.post('/api/geotiff', async (req, res) => {
  try {
    const { url } = req.body
    
    // Sicurezza: accetta solo URL di Google Solar API
    if (!url.includes('solar.googleapis.com')) {
      return res.status(403).json({ error: 'URL non autorizzato' })
    }
    
    console.log('Scaricamento GeoTIFF:', url.substring(0, 80) + '...')
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Google Solar API error: ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    
    res.setHeader('Content-Type', 'image/tiff')
    res.setHeader('Content-Length', buffer.byteLength)
    res.send(Buffer.from(buffer))
    
    console.log(`GeoTIFF scaricato: ${buffer.byteLength} bytes`)
    
  } catch (error) {
    console.error('Errore GeoTIFF:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Proxy Building Insights
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

// Proxy Data Layers
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

app.listen(PORT, () => {
  console.log(`Solar Backend in ascolto su porta ${PORT}`)
})
