// api/contact.js - Vercel Serverless Function for handling contact form submissions
import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

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

    // Check if we have Brevo API key
    if (!process.env.BREVO_API_KEY) {
      console.log('Email would be sent with the following content:', { name, email, audience, message });
      console.log('Set up BREVO_API_KEY environment variable to enable sending');
      
      // Return success even in development without API key
      return res.status(200).json({ 
        success: true, 
        message: 'Thank you for your message! We will get back to you soon.' 
      });
    }

    // Create email content
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'info@ivarchitecture.com';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `New Contact Form Submission from ${name}`;
    sendSmtpEmail.htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Category:</strong> ${audience || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
    sendSmtpEmail.sender = { 
      name: "IV Architecture Contact Form", 
      email: process.env.SENDER_EMAIL || "noreply@ivarchitecture.com" 
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.replyTo = { email, name };
    
    // Send email using Brevo
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
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