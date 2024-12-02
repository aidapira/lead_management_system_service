require('dotenv').config();
const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();

const cors = require("cors");

const corsOptions = {
  origin: "https://lead-management-system-ui.onrender.com/", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Add CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Enable cookies and HTTP credentials
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/leads', require('./routes/leads'));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
