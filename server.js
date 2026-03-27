const express = require('express');
const RunwayML = require('@runwayml/sdk').default;
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve all static files (index.html, sketch.js, libraries, etc.)
app.use(express.static('.'));

// Initialize Runway client (reads RUNWAYML_API_SECRET from .env)
const client = new RunwayML();

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voicePreset } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const taskPromise = client.textToSpeech.create({
      model: 'eleven_multilingual_v2',
      promptText: text,
      voice: {
        type: 'runway-preset',
        presetId: voicePreset || 'Maya'
      }
    });

    const result = await taskPromise.waitForTaskOutput();
    res.json({ audioUrl: result.output[0] });
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Prevent unhandled rejections from crashing the server
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
