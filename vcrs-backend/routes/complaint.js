const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');
const { protect, adminOnly, citizenOnly } = require('../middleware/auth');

// --- Multer Configuration for File Upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        // Use field name + date + extension to ensure unique file names
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/complaints
// @desc    Create Complaint (Citizen only)
// @access  Private (Citizen)
router.post(
    '/',
    [protect, citizenOnly, upload.single('image')], // 'image' is the name of the file input field
    async (req, res) => {
        try {
            const { title, description, category, location } = req.body;

            // Get image path if file was uploaded
            const imagePath = req.file ? req.file.path : null;
            
            const newComplaint = new Complaint({
                citizenId: req.user.id,
                title,
                description,
                category,
                location,
                imagePath,
            });

            const complaint = await newComplaint.save();
            res.json(complaint);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/complaints/user/:id
// @desc    Get complaints of a specific citizen
// @access  Private (Citizen must match ID or Admin)
router.get('/user/:id', protect, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Security check: Only allow admin or the user themselves to view their complaints
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized access to user complaints' });
        }

        const complaints = await Complaint.find({ citizenId: userId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/complaints
// @desc    Admin: Get all complaints
// @access  Private (Admin)
router.get('/', [protect, adminOnly], async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('citizenId', 'name email') // Populate citizen details
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/complaints/:id
// @desc    Get complaint details
// @access  Private (Any authenticated user)
router.get('/:id', protect, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate('citizenId', 'name email');
        
        if (!complaint) {
            return res.status(404).json({ msg: 'Complaint not found' });
        }
        
        // Basic check: Citizen can only view their own, Admin can view all
        if (complaint.citizenId._id.toString() !== req.user.id && req.user.role !== 'admin') {
             return res.status(403).json({ msg: 'Unauthorized access' });
        }
        
        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        // Handle invalid ID format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Complaint not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/complaints/:id/status
// @desc    Admin: Update complaint status
// @access  Private (Admin)
router.put('/:id/status', [protect, adminOnly], async (req, res) => {
    const { status } = req.body;
    
    // Validate status input
    if (!['Pending', 'In-Progress', 'Resolved'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status value' });
    }

    try {
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ msg: 'Complaint not found' });
        }
        
        // Update the status
        complaint.status = status;
        await complaint.save();

        res.json(complaint);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;