// api/contact.js - Vercel Serverless Function for handling contact form submissions
import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Brevo API clients
const emailApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const contactsApiInstance = new SibApiV3Sdk.ContactsApi();

// Set API key for both clients
const apiKey = process.env.BREVO_API_KEY || '';
emailApiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
contactsApiInstance.setApiKey(SibApiV3Sdk.ContactsApiApiKeys.apiKey, apiKey);

// Function to create or update a contact in Brevo
async function createOrUpdateContact(contactData) {
  try {
    // Create contact attributes
    const createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = contactData.email;
    createContact.attributes = {
      FIRSTNAME: contactData.name.split(' ')[0] || '',
      LASTNAME: contactData.name.split(' ').slice(1).join(' ') || '',
      AUDIENCE_TYPE: contactData.audience || '',
      LAST_CONTACT_DATE: new Date().toISOString(),
      SOURCE: 'Contact Form'
    };
    
    // Add to list if specified
    if (process.env.BREVO_LIST_ID) {
      createContact.listIds = [parseInt(process.env.BREVO_LIST_ID)];
    }
    
    // Try to create the contact
    // If it fails with 400 (contact already exists), we'll update it instead
    try {
      await contactsApiInstance.createContact(createContact);
      console.log(`Created new contact: ${contactData.email}`);
    } catch (error) {
      if (error.status === 400) {
        // Contact already exists, update it
        const updateContact = new SibApiV3Sdk.UpdateContact();
        updateContact.attributes = createContact.attributes;
        
        // If we have a list ID, add to list
        if (process.env.BREVO_LIST_ID) {
          updateContact.listIds = [parseInt(process.env.BREVO_LIST_ID)];
        }
        
        await contactsApiInstance.updateContact(contactData.email, updateContact);
        console.log(`Updated existing contact: ${contactData.email}`);
      } else {
        // Re-throw if it's not a "contact exists" error
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating/updating contact in Brevo:', error);
    // Don't fail the whole request if contact creation fails
    return false;
  }
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract form data
    const { name, email, audience, message } = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if we have Brevo API key
    if (!process.env.BREVO_API_KEY) {
      console.log('Contact form submission received:', req.body);
      console.log('Set up BREVO_API_KEY environment variable to enable sending');
      
      // Return success even in development without API key
      return res.status(200).json({ 
        success: true, 
        message: 'Thank you for your message! We will get back to you soon.' 
      });
    }

    // Create or update contact in Brevo
    await createOrUpdateContact({
      name,
      email,
      audience,
      message
    });

    // Create email content
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'info@ivarchitecture.com';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `New Contact Form Submission from ${name}`;
    sendSmtpEmail.htmlContent = `
      <h2>New Contact Form Submission</h2>
      
      <h3>Contact Information</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Audience Type:</strong> ${audience || 'Not specified'}</p>
      
      <h3>Message</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
    
    sendSmtpEmail.sender = { 
      name: "IV Architecture Contact Form", 
      email: process.env.SENDER_EMAIL || "noreply@ivarchitecture.com" 
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.replyTo = { email, name };
    
    // Send email using Brevo
    await emailApiInstance.sendTransacEmail(sendSmtpEmail);
    
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