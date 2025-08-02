const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Validate API key
app.post('/api/validate-key', async (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  try {
    const response = await axios.get('https://api.apify.com/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return res.json({ valid: true, user: response.data });
  } catch (error) {
    console.error('API key validation error:', error.message);
    return res.status(401).json({ valid: false, error: 'Invalid API key' });
  }
});

// Get list of actors
app.get('/api/actors', async (req, res) => {
  const { apiKey } = req.query;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  try {
    const response = await axios.get('https://api.apify.com/v2/acts', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        limit: 100
      }
    });
    
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching actors:', error.message);
    return res.status(500).json({ error: 'Failed to fetch actors' });
  }
});

// Get actor details including input schema
app.get('/api/actors/:actorId', async (req, res) => {
  const { actorId } = req.params;
  const { apiKey } = req.query;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  try {
    const response = await axios.get(`https://api.apify.com/v2/acts/${actorId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return res.json(response.data);
  } catch (error) {
    console.error(`Error fetching actor ${actorId}:`, error.message);
    return res.status(500).json({ error: 'Failed to fetch actor details' });
  }
});

// Run an actor
app.post('/api/actors/:actorId/run', async (req, res) => {
  const { actorId } = req.params;
  const { apiKey, input } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  try {
    // Start the actor run
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs`, 
      { ...input },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const runId = runResponse.data.data.id;
    
    // Poll for run status until it's finished
    let runFinished = false;
    let runResult = null;
    let attempts = 0;
    const maxAttempts = 30; // Maximum polling attempts
    
    while (!runFinished && attempts < maxAttempts) {
      attempts++;
      
      // Wait for 2 seconds between polling attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check run status
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      const status = statusResponse.data.data.status;
      
      if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'ABORTED') {
        runFinished = true;
        
        if (status === 'SUCCEEDED') {
          // Get the run results
          const resultResponse = await axios.get(
            `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`
              }
            }
          );
          
          runResult = resultResponse.data;
        } else {
          runResult = { error: `Run ${status.toLowerCase()}` };
        }
      }
    }
    
    if (!runFinished) {
      return res.status(504).json({ error: 'Run timed out' });
    }
    
    return res.json({ result: runResult, runId });
  } catch (error) {
    console.error(`Error running actor ${actorId}:`, error.message);
    return res.status(500).json({ error: 'Failed to run actor' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});