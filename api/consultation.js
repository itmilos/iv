// api/consultation.js - Vercel Serverless Function for handling consultation form submissions
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
      FIRSTNAME: contactData.firstName,
      LASTNAME: contactData.lastName,
      PHONE: contactData.phone,
      LOCATION: contactData.location,
      PROJECT_TYPE: contactData.projectType,
      BUDGET: contactData.budget,
      TIMELINE: contactData.timeline,
      DESIGN_STYLES: Array.isArray(contactData.designStyle) 
        ? contactData.designStyle.join(', ') 
        : (contactData.designStyle || ''),
      REFERRAL_SOURCE: contactData.referral || '',
      LAST_CONSULTATION_REQUEST: new Date().toISOString()
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
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      projectType,
      projectDescription,
      budget,
      timeline,
      designStyle,
      inspirationLinks,
      additionalNotes,
      referral,
      images
    } = req.body;
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'projectType'];
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
      console.log('Consultation form submission received:', req.body);
      console.log('Set up BREVO_API_KEY environment variable to enable sending');
      
      // Return success even in development without API key
      return res.status(200).json({ 
        success: true, 
        message: 'Thank you for your consultation request! We will get back to you soon.' 
      });
    }

    // Create or update contact in Brevo
    await createOrUpdateContact({
      firstName,
      lastName,
      email,
      phone,
      location,
      projectType,
      budget,
      timeline,
      designStyle,
      referral
    });

    // Format design styles if selected
    const designStylesText = Array.isArray(designStyle) 
      ? designStyle.join(', ') 
      : (designStyle || 'Not specified');

    // Format inspiration links
    const linksText = Array.isArray(inspirationLinks) && inspirationLinks.length > 0
      ? inspirationLinks.filter(link => link.trim()).join('\n')
      : 'None provided';

    // Create email content
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'info@ivarchitecture.com';
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `New Consultation Request from ${firstName} ${lastName}`;
    sendSmtpEmail.htmlContent = `
      <h2>New Consultation Request</h2>
      
      <h3>Contact Information</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Referral Source:</strong> ${referral || 'Not specified'}</p>
      
      <h3>Project Details</h3>
      <p><strong>Project Type:</strong> ${projectType}</p>
      <p><strong>Budget Range:</strong> ${budget || 'Not specified'}</p>
      <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
      
      <h3>Project Description</h3>
      <p>${projectDescription.replace(/\n/g, '<br>')}</p>
      
      <h3>Design Preferences</h3>
      <p><strong>Selected Styles:</strong> ${designStylesText}</p>
      
      <h3>Inspiration Links</h3>
      <p>${linksText.replace(/\n/g, '<br>')}</p>
      
      ${additionalNotes ? `
      <h3>Additional Notes</h3>
      <p>${additionalNotes.replace(/\n/g, '<br>')}</p>
      ` : ''}
      
      ${images && images.length > 0 ? `
      <h3>Attached Images</h3>
      <p>${images.length} image(s) attached</p>
      ` : ''}
    `;
    
    sendSmtpEmail.sender = { 
      name: "IV Architecture Consultation Form", 
      email: process.env.SENDER_EMAIL || "noreply@ivarchitecture.com" 
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.replyTo = { email, name: `${firstName} ${lastName}` };
    
    // Send email using Brevo
    await emailApiInstance.sendTransacEmail(sendSmtpEmail);
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your consultation request! Our team will review your information and contact you within 24-48 hours to schedule your consultation.' 
    });
    
  } catch (error) {
    console.error('Error processing consultation form:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
} 