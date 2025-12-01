const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, company, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.FOLIO_EMAIL,
                pass: process.env.FOLIO_PASSWORD,
            },
        });

        // Verify transporter
        await transporter.verify();

        // Send email
        const info = await transporter.sendMail({
            from: `"${name}" <${process.env.FOLIO_EMAIL}>`,
            to: process.env.FOLIO_EMAIL,
            subject: `${name} <${email}> ${
                company ? `from ${company}` : ''
            } submitted a contact form`,
            text: message,
        });

        console.log('Email sent:', info);
        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
};

