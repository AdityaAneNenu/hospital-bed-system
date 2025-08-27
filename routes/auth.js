const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - Hospital Bed Tracker',
    error: null,
    success: null 
  });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Register - Hospital Bed Tracker',
    error: null,
    success: null 
  });
});

// Logout (redirect to login)
router.get('/logout', (req, res) => {
  res.redirect('/auth/login?message=logged_out');
});

module.exports = router;
