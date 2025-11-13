const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Road', 'Streetlight', 'Drainage', 'Garbage', 'Water Supply', 'Other'],
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String, // Path where Multer stores the image
        default: null,
    },
    status: {
        type: String,
        enum: ['Pending', 'In-Progress', 'Resolved'],
        default: 'Pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);