// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());

// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const householdRoutes = require('./routes/householdRoutes');
const invitationRoutes = require('./routes/invitationRoutes'); // Add this line

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/invitations', invitationRoutes); // Add this line

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});