const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');  // Your Mongoose model

// Vercel expects a function to export and handle requests
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { name, email, phone, message } = req.body;

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
            // Save to MongoDB (use Vercel's MongoDB connection)
            const newContact = new Contact({ name, email, phone, message });
            await newContact.save();

            // Send the email
            await transporter.sendMail(mailOptions);

            return res.status(200).json({ message: 'Email sent and data saved successfully!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to send email or save data', error });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
};
