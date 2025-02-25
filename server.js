const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Contact = require('./models/Contact');  // Import the Contact model

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));  // Allows form data parsing

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Test email route (renamed to /send-test-email)
app.post('/send-test-email', async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'infosenseconsulting@gmail.com', // Replace with your email address to test
        subject: 'Test Email',
        text: 'This is a test email.',
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Failed to send test email', error });
    }
});

// Contact form route (unchanged)
app.post('/send-email', async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: 'infosenseconsulting@gmail.com',
        subject: `Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
    };

    try {
        // Save to MongoDB
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent and data saved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send email or save data', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
