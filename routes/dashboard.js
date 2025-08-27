const express = require('express');
const router = express.Router();

// Dashboard main page
router.get('/', (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard - Hospital Bed Tracker'
  });
});

// Admin panel
router.get('/admin', (req, res) => {
  res.render('admin', { 
    title: 'Admin Panel - Hospital Bed Tracker'
  });
});

module.exports = router;
