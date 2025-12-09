// Email Service using EmailJS
// EmailJS allows sending emails directly from the browser

// EmailJS Configuration
// Default credentials (can be overridden via Admin Panel → Emails → Configure)
const DEFAULT_CONFIG = {
  publicKey: 'EPO61S4tPNKPKy6UH',
  serviceId: 'service_ly8htul',
  templates: {
    welcome: 'template_sghhqdn',
    notification: 'template_notify',
    announcement: 'template_announce',
    results: 'template_results'
  }
};

// Get config from localStorage or use defaults
function getEmailConfig() {
  const saved = localStorage.getItem('emailjs_settings');
  if (saved) {
    const settings = JSON.parse(saved);
    return {
      publicKey: settings.publicKey || DEFAULT_CONFIG.publicKey,
      serviceId: settings.serviceId || DEFAULT_CONFIG.serviceId,
      templates: {
        welcome: settings.templateWelcome || DEFAULT_CONFIG.templates.welcome,
        notification: settings.templateNotify || DEFAULT_CONFIG.templates.notification,
        announcement: settings.templateAnnounce || DEFAULT_CONFIG.templates.announcement,
        results: settings.templateResults || DEFAULT_CONFIG.templates.results
      }
    };
  }
  return DEFAULT_CONFIG;
}

// Dynamic config getter
const EMAILJS_CONFIG = {
  get publicKey() { return getEmailConfig().publicKey; },
  get serviceId() { return getEmailConfig().serviceId; },
  get templates() { return getEmailConfig().templates; }
};

// Initialize EmailJS
let emailjsLoaded = false;

export async function initEmailJS() {
  if (emailjsLoaded) return true;
  
  return new Promise((resolve, reject) => {
    // Load EmailJS SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      if (window.emailjs) {
        window.emailjs.init(EMAILJS_CONFIG.publicKey);
        emailjsLoaded = true;
        console.log('EmailJS initialized');
        resolve(true);
      } else {
        reject(new Error('EmailJS failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS SDK'));
    document.head.appendChild(script);
  });
}

// Send Welcome Email to new user
export async function sendWelcomeEmail(userData) {
  try {
    await initEmailJS();
    
    const templateParams = {
      to_name: userData.name,
      to_email: userData.email,  // Use real contact email
      university_id: userData.university_id,
      faculty: userData.faculty,
      major: userData.major,
      role: userData.role,
      login_url: window.location.origin
    };
    
    const response = await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.welcome,
      templateParams
    );
    
    console.log('Welcome email sent:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Send Election/Poll Notification
export async function sendNotificationEmail(recipients, notification) {
  try {
    await initEmailJS();
    
    const results = [];
    
    for (const recipient of recipients) {
      // Skip if no contact email
      if (!recipient.contact_email) continue;
      
      const templateParams = {
        to_name: recipient.name,
        to_email: recipient.contact_email,
        notification_type: notification.type, // 'election' or 'poll'
        title: notification.title,
        description: notification.description,
        start_date: notification.startDate,
        end_date: notification.endDate,
        action_url: window.location.origin
      };
      
      try {
        const response = await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templates.notification,
          templateParams
        );
        results.push({ email: templateParams.to_email, success: true });
      } catch (err) {
        results.push({ email: templateParams.to_email, success: false, error: err.message });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return { success: false, error: error.message };
  }
}

// Send Announcement Email
export async function sendAnnouncementEmail(recipients, announcement) {
  try {
    await initEmailJS();
    
    const results = [];
    
    for (const recipient of recipients) {
      // Skip if no contact email
      if (!recipient.contact_email) continue;
      
      const templateParams = {
        to_name: recipient.name,
        to_email: recipient.contact_email,
        subject: announcement.subject,
        message: announcement.message,
        from_name: announcement.fromName || 'University E-Voting Admin'
      };
      
      try {
        const response = await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templates.announcement,
          templateParams
        );
        results.push({ email: templateParams.to_email, success: true });
      } catch (err) {
        results.push({ email: templateParams.to_email, success: false, error: err.message });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Failed to send announcement:', error);
    return { success: false, error: error.message };
  }
}

// Send Results Email
export async function sendResultsEmail(recipients, results) {
  try {
    await initEmailJS();
    
    const emailResults = [];
    
    for (const recipient of recipients) {
      // Skip if no contact email
      if (!recipient.contact_email) continue;
      
      const templateParams = {
        to_name: recipient.name,
        to_email: recipient.contact_email,
        election_title: results.title,
        winner_name: results.winnerName,
        winner_votes: results.winnerVotes,
        total_votes: results.totalVotes,
        results_url: window.location.origin
      };
      
      try {
        const response = await window.emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templates.results,
          templateParams
        );
        emailResults.push({ email: templateParams.to_email, success: true });
      } catch (err) {
        emailResults.push({ email: templateParams.to_email, success: false, error: err.message });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { success: true, results: emailResults };
  } catch (error) {
    console.error('Failed to send results:', error);
    return { success: false, error: error.message };
  }
}

// Check if EmailJS is configured
export function isEmailConfigured() {
  return EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' && 
         EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID';
}

// Get configuration status
export function getEmailConfigStatus() {
  return {
    configured: isEmailConfigured(),
    publicKey: EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY',
    serviceId: EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID'
  };
}

// Get full email config
export { getEmailConfig };

export default {
  initEmailJS,
  sendWelcomeEmail,
  sendNotificationEmail,
  sendAnnouncementEmail,
  sendResultsEmail,
  isEmailConfigured,
  getEmailConfigStatus,
  getEmailConfig
};

