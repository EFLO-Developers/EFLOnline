// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sequelize = require('./config/database');
const EFLOAuthRoutes = require('./routes/EFLOAuthRoutes');

console.log('Environment Variables:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.PORT);

const app = express();


// Use CORS middleware to allow any origin
app.use(cors({
  origin: '*', // Allow any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  credentials: true, // Allow cookies to be sent
}));

// Handle preflight requests
app.options('*', cors());




app.use(express.json());
app.use('/api', EFLOAuthRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false, alter: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});