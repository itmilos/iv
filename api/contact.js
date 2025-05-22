// api/contact.js - Vercel Serverless Function for handling contact form submissions
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Replace these with your actual email service credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@example.com',
      pass: process.env.EMAIL_PASSWORD || 'your-password',
    },
  });
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract form data
    const { name, email, audience, message } = req.body;
    
    // Validate form data
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Send email using nodemailer
    const transporter = createTransporter();
    
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'info@ivarchitecture.com';
    
    const emailContent = {
      from: `"IV Architecture Contact Form" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to: recipientEmail,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Category: ${audience || 'Not specified'}
        
        Message:
        ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Category:</strong> ${audience || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };
    
    // Check if we have proper email configuration
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(emailContent);
    } else {
      // Log the email content if not in production or missing email config
      console.log('Email would be sent with the following content:', emailContent);
      console.log('Set up EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD environment variables to enable sending');
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.' 
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
} 