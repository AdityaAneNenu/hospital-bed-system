const express = require('express');
const router = express.Router();

// API for hospital data
router.get('/hospitals', async (req, res) => {
  try {
    // This will be implemented when Supabase is configured
    res.json({
      success: true,
      message: 'API endpoint ready - configure Supabase to enable data',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API for availability updates
router.post('/availability', async (req, res) => {
  try {
    // This will be implemented when Supabase is configured
    res.json({
      success: true,
      message: 'Update endpoint ready - configure Supabase to enable updates'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
