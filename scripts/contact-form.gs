/**
 * Google Apps Script Backend - Multi-Funnel Lead Capture & Business Intake
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets and create a new Spreadsheet.
 * 2. Name the sheet "Lead Intake Database" (or any name).
 * 3. Go to "Extensions" > "Apps Script".
 * 4. Replace all code in the script editor with this script.
 * 5. Update the CONFIG properties below (your personal email).
 * 6. Click "Deploy" > "New Deployment".
 * 7. Select type: "Web App".
 * 8. Set settings:
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial to allow public form POSTs).
 * 9. Click Deploy, Authorize Permissions, and copy the "Web App URL".
 * 10. Replace the SCRIPT_URL placeholders in your HTML landing pages with your copied URL.
 */

// --- CONFIGURATION ---
const CONFIG = {
  notificationEmail: "arttu@working-draft.org", // Where you want to receive lead alerts
  senderName: "Arttu Pitou At",
  calendarLink: "https://working-draft.org/cv/", // Fallback review page
  telegramUsername: "AtPitou"
};

/**
 * Handle POST request from frontend form submissions
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Acquire a 30-second lock to prevent concurrent writing collisions on the sheet
    lock.waitLock(30000);
    
    // 1. Resolve and open spreadsheet
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getActiveSheet();
    
    // Ensure sheet headers are established if this is a blank sheet
    initializeHeaders(sheet);
    
    // 2. Parse form parameters safely
    const params = e.parameter;
    const timestamp = new Date();
    
    const name = params.name || "N/A";
    const email = params.email || "N/A";
    const organization = params.organization || "N/A";
    const telegram = params.telegram || "N/A";
    const location = params.location || "N/A";
    const timezone = params.timezone || "N/A";
    const interest = params.interest || "N/A";
    const message = params.message || "N/A";
    const urgency = params.urgency || "Normal";
    const source = params.source || "Unknown Funnel";
    
    // 3. Append parsed data to Google Sheet row
    sheet.appendRow([
      timestamp,
      name,
      email,
      organization,
      telegram,
      location,
      timezone,
      interest,
      message,
      urgency,
      source
    ]);
    
    // 4. Send Instant Alert Email to Arttu
    sendAlertToArttu(timestamp, name, email, organization, telegram, location, timezone, interest, message, urgency, source);
    
    // 5. Send Professional Auto-Reply Email to the Lead (if email is valid)
    if (email !== "N/A" && email.includes("@")) {
      sendAutoReplyToLead(name, email, organization, interest, source);
    }
    
    // 6. Return standard success JSON output
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Intake parsed and logged." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error to Apps Script dashboard and return error JSON
    Logger.log(error);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } finally {
    // Always release lock
    lock.releaseLock();
  }
}

/**
 * Set up spreadsheet header columns if the sheet is completely blank
 */
function initializeHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp", 
      "Full Name", 
      "Email Address", 
      "Organization", 
      "Telegram/Phone", 
      "Location Entered", 
      "System Timezone", 
      "Area of Interest", 
      "Message/Challenge Details", 
      "Urgency Level", 
      "Intake Source"
    ];
    sheet.appendRow(headers);
    // Format headers (bold text, light gray background)
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#f3f4f6")
      .setBorder(true, true, true, true, true, true);
    sheet.setFrozenRows(1);
  }
}

/**
 * Dispatch a highly formatted HTML email to Arttu's inbox
 */
function sendAlertToArttu(timestamp, name, email, organization, telegram, location, timezone, interest, message, urgency, source) {
  const isUrgent = urgency.toLowerCase() === "urgent" || urgency.toLowerCase() === "high";
  const urgencyBadge = isUrgent 
    ? '<span style="background-color: #ff4fa8; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-weight: bold;">URGENT</span>'
    : '<span style="background-color: #ec99b9; color: #050505; padding: 4px 10px; border-radius: 4px;">Normal</span>';
    
  const subject = `${isUrgent ? "[🚨 URGENT] " : ""}New Lead Captured: ${name} (${interest})`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ec99b9; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #050505; color: #f5f1e8; padding: 24px; text-align: center; border-bottom: 3px solid #ec99b9;">
        <h2 style="margin: 0; font-size: 1.5rem; letter-spacing: 0.05em;">INCOMING LEAD DETECTED</h2>
        <p style="margin: 6px 0 0; color: #b8b0a5; font-size: 0.9rem;">Source Funnel: <strong>${source}</strong></p>
      </div>
      
      <div style="padding: 24px; color: #111111; line-height: 1.5;">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 12px;">
          <span><strong>Urgency Level:</strong></span>
          ${urgencyBadge}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #4a5568;">Full Name:</td>
            <td style="padding: 10px 0;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Organization:</td>
            <td style="padding: 10px 0;">${organization}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Email Address:</td>
            <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #ff4fa8;">${email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Telegram / Phone:</td>
            <td style="padding: 10px 0;"><a href="https://t.me/${telegram.replace('@', '')}" style="color: #ff4fa8; font-weight: bold;">${telegram}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Location/Tz:</td>
            <td style="padding: 10px 0;">${location} <br><small style="color: #718096;">(${timezone})</small></td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: bold; color: #4a5568;">Main Area:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #ec99b9;">${interest}</td>
          </tr>
        </table>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #ec99b9; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px; color: #4a5568; font-size: 0.95rem; text-transform: uppercase;">Challenge Details / Project Scope</h4>
          <p style="margin: 0; font-size: 0.95rem; white-space: pre-wrap; color: #2d3748;">${message}</p>
        </div>
        
        <p style="margin: 0; font-size: 0.82rem; color: #718096; text-align: center;">Logged to Spreadsheet database at ${timestamp.toISOString()}</p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: CONFIG.notificationEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Dispatch an auto-reply confirmation email customized to the funnel source
 */
function sendAutoReplyToLead(name, email, organization, interest, source) {
  let isEdu = source === "edu_landing";
  
  // Custom copy tailored by sector
  let sectorGreeting = isEdu 
    ? "Thank you for initiating a Google Workspace Directory & School Systems Security Audit request."
    : "Thank you for reaching out regarding a Fractional CTO, Cloud Migration, or Systems Audit engagement.";
    
  let sectorExpectations = isEdu
    ? "As an expert in K-12 systems directory governance and security hardening across APAC, I understand that student directories and multi-campus logistics require highly structured, resilient policies (COPPA-aligned, CIS Control audited)."
    : "As a Fractional systems leader and cloud infrastructure architect, I specialize in stabilizing tech stacks, auditing database permissions, drafting SOPs, and engineering secure, stateless deployments.";
    
  const subject = `Confirmation: Technical Intake Initialized - ${CONFIG.senderName}`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #fdfdfd;">
      <div style="background-color: #111111; color: #ffffff; padding: 30px; text-align: center; border-bottom: 4px solid #ec99b9;">
        <h1 style="margin: 0; font-size: 1.6rem; letter-spacing: 0.05em; font-weight: normal;">Arttu Pitou At</h1>
        <p style="margin: 6px 0 0; color: #ec99b9; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.1em;">Systems Architecture &amp; Fractional Leadership</p>
      </div>
      
      <div style="padding: 32px; color: #2d3748; line-height: 1.6; font-size: 1rem;">
        <p>Hello ${name},</p>
        
        <p>${sectorGreeting} Your request has been securely parsed into my workspace database.</p>
        
        <p>${sectorExpectations}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #111111; font-size: 1.1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px;">Logged Engagement Profile</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 0.95rem;">
            <li style="margin-bottom: 6px;"><strong>Target Organization:</strong> ${organization}</li>
            <li style="margin-bottom: 6px;"><strong>Core Scope:</strong> ${interest}</li>
            <li style="margin-bottom: 6px;"><strong>Intake Channel:</strong> ${source}</li>
          </ul>
        </div>
        
        <h3 style="color: #111111; font-size: 1.1rem; margin-top: 28px;">Next Steps:</h3>
        <ol style="color: #4a5568; padding-left: 20px; font-size: 0.95rem;">
          <li style="margin-bottom: 10px;"><strong>Intake Review:</strong> I will review your directory/project parameters within the context of your region and timezone.</li>
          <li style="margin-bottom: 10px;"><strong>Initial Consultation Call:</strong> I will reach out to you via **Telegram or Email** within **24 hours** to schedule a video diagnostic call (standard Google Meet or Zoom).</li>
        </ol>
        
        <p style="margin-top: 28px;">
          In the meantime, feel free to review my complete structural experience, deliverables sheet, and printable PDF CV at:
          <br>
          <a href="${CONFIG.calendarLink}" style="color: #ff4fa8; font-weight: bold; text-decoration: underline;">working-draft.org/cv/</a>
        </p>
        
        <p style="margin-top: 32px; border-top: 1px solid #cbd5e1; padding-top: 20px;">
          Best regards,<br>
          <strong>${CONFIG.senderName}</strong><br>
          <span style="color: #718096; font-size: 0.9rem;">Fractional CTO &amp; Systems Lead</span><br>
          <span style="color: #718096; font-size: 0.9rem;">Phnom Penh, Cambodia (Serving APAC &amp; Worldwide)</span><br>
          <a href="https://t.me/${CONFIG.telegramUsername}" style="color: #ff4fa8; font-weight: bold;">t.me/${CONFIG.telegramUsername}</a> | arttu@working-draft.org
        </p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: email,
    replyTo: CONFIG.notificationEmail,
    name: CONFIG.senderName,
    subject: subject,
    htmlBody: htmlBody
  });
}
