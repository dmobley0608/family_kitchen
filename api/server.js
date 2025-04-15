const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const optionalAuth = require('./middleware/optionalAuth');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Import models first to register with mongoose
require('./models/User');
require('./models/Household');
require('./models/Invitation');
// Import any other models here

// Create Express app
const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply optional authentication to all routes
app.use(optionalAuth);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/households', require('./routes/householdRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/ingredients', require('./routes/ingredientRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));
app.use('/api/shopping-lists', require('./routes/shoppingListRoutes'));
app.use('/api/meal-plans', require('./routes/mealPlanRoutes')); 

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Catch-all route for any request that doesn't start with /api
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
