// server.js (Backend Entry Point)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware (Applied Immediately) ---

// CORS for frontend communication
app.use(cors()); 

// Body parser (CRUCIAL for reading JSON req.body)
app.use(express.json({ extended: false }));

// Serve static uploaded files (images) from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Define Routes ---
// NOTE: Assuming routes files are in a directory like './routes/api/auth.js'
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaint'));


// --- Root Route for Health Check ---
app.get('/', (req, res) => res.send('VCRS Backend API Running'));


// --- Connect Database & Start Server ---
const connectDB = async () => {
    try {
        // Ensure MONGO_URI is set correctly in .env
        await mongoose.connect(process.env.MONGO_URI); 
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 8070;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));