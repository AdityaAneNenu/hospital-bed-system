const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for now (can be configured later)
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make environment variables available to templates
app.locals.SUPABASE_URL = process.env.SUPABASE_URL || 'your_project_url_here';
app.locals.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your_anon_key_here';

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);

// Main routes
app.get('/', (req, res) => {
  res.render('login', { 
    title: 'Hospital Bed Tracker - Login',
    error: null,
    success: null 
  });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { 
    title: 'Hospital Bed Tracker - Dashboard'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    error: 'The page you requested does not exist.',
    statusCode: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Server Error',
    error: 'Something went wrong on our end. Please try again later.',
    statusCode: 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Hospital Bed Tracker server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
