/**
 * TRADING PSYCHOLOGY PLATFORM - GOOGLE APPS SCRIPT DATABASE ENDPOINT
 * =================================================================
 * 
 * ቋንቋ፦ አማርኛ እና እንግሊዘኛ (Bilingual: Amharic & English)
 * ይህንን ኮድ ኮፒ በማድረግ በጎግል ሺትዎ ላይ (Extensions -> Apps Script) ላይ በመለጠፍ
 * እንደ ዌብ አፕሊኬሽን (Deploy as Web App) ማተም ይችላሉ።
 * ይህ ዌብሳይትዎ ከማንም እይታ ነጻ በሆነ መልኩ የእርስዎን ጎግል ሺት እንደ ዳታቤዝ እንዲጠቀም ያስችለዋል።
 * 
 * HOW TO INSTALL:
 * 1. Open Google Sheet -> Go to Extensions -> Apps Script.
 * 2. Delete any existing code and paste this code.
 * 3. Create 4 tabs (Sheets) in your active spreadsheet named:
 *    - "users" (Columns: userId, name, email, phone, password, isAdmin)
 *    - "papers" (Columns: id, title, abstract, authors, likes, content)
 *    - "comments" (Columns: id, paperId, author, email, text, timestamp)
 *    - "proposals" (Columns: id, name, contact, title, abstract, timestamp)
 * 4. Click 'Deploy' -> 'New deployment' -> Select type 'Web app'.
 * 5. Set Execute as: "Me" and Who has access: "Anyone".
 * 6. Copy the Web App URL and place it in your .env as GOOGLE_SHEETS_SCRIPT_URL=url_here
 */

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action;
    
    if (action === "get_all") {
      // Fetch everything
      const data = {
        users: getSheetDataAsJson(sheet.getSheetByName("users")),
        papers: getSheetDataAsJson(sheet.getSheetByName("papers")),
        comments: getSheetDataAsJson(sheet.getSheetByName("comments")),
        proposals: getSheetDataAsJson(sheet.getSheetByName("proposals"))
      };
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Default ping
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Google Sheets DB Live System Active" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "register_user") {
      const usersSheet = sheet.getSheetByName("users");
      const name = postData.name;
      const email = postData.email;
      const phone = postData.phone;
      const password = postData.password;
      
      // Calculate first 3 letters of name
      let cleanName = name.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (cleanName.length < 3) {
        cleanName = (name.trim() + "TRD").slice(0, 3).toUpperCase();
      }
      let prefix = cleanName.slice(0, 3);
      
      // Extract digits from phone number
      const phoneDigits = phone.replace(/\D/g, '');
      let suffixLen = 4;
      let suffix = phoneDigits.slice(-suffixLen);
      
      let userId = prefix + suffix;
      
      // Check collision
      let usersData = getSheetDataAsJson(usersSheet);
      let collision = usersData.some(function(u) { return u.userId === userId; });
      
      if (collision) {
        // Try last 5 digits as requested
        suffixLen = 5;
        suffix = phoneDigits.slice(-suffixLen);
        userId = prefix + suffix;
        
        // Double check collision
        collision = usersData.some(function(u) { return u.userId === userId; });
        if (collision) {
          // If still collides, append random integer
          userId = userId + Math.floor(Math.random() * 9 + 1);
        }
      }
      
      // Save user
      usersSheet.appendRow([userId, name, email, phone, password, "FALSE"]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        userId: userId,
        user: { name: name, email: email, phone: phone, userId: userId, isAdmin: false } 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "add_comment") {
      const commentsSheet = sheet.getSheetByName("comments");
      const commentId = "comment-" + Date.now();
      const paperId = postData.paperId;
      const author = postData.author;
      const email = postData.email;
      const text = postData.text;
      const timestamp = new Date().toISOString();
      
      commentsSheet.appendRow([commentId, paperId, author, email, text, timestamp]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: commentId }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "add_proposal") {
      const proposalsSheet = sheet.getSheetByName("proposals");
      const id = "prop-" + Date.now();
      const name = postData.name;
      const contact = postData.contact;
      const title = postData.title;
      const abstract = postData.abstract;
      const timestamp = new Date().toISOString();
      
      proposalsSheet.appendRow([id, name, contact, title, abstract, timestamp]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "create_paper") {
      const papersSheet = sheet.getSheetByName("papers");
      const id = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'paper-' + Date.now();
      const title = postData.title;
      const abstract = postData.abstract;
      const authors = postData.authors;
      const content = postData.content;
      
      papersSheet.appendRow([id, title, abstract, authors, 0, content]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update_paper") {
      const papersSheet = sheet.getSheetByName("papers");
      const rows = papersSheet.getDataRange().getValues();
      const id = postData.id;
      
      let foundIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == id) {
          foundIndex = i + 1; // 1-based index
          break;
        }
      }
      
      if (foundIndex !== -1) {
        papersSheet.getCell(foundIndex, 2).setValue(postData.title);
        papersSheet.getCell(foundIndex, 3).setValue(postData.abstract);
        papersSheet.getCell(foundIndex, 4).setValue(postData.authors);
        papersSheet.getCell(foundIndex, 6).setValue(postData.content);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "delete_paper") {
      const papersSheet = sheet.getSheetByName("papers");
      const rows = papersSheet.getDataRange().getValues();
      const id = postData.id;
      
      let foundIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == id) {
          foundIndex = i + 1;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        papersSheet.deleteRow(foundIndex);
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper to convert sheet into JSON representation array
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const results = [];
  
  for (let r = 1; r < values.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[r][c];
    }
    results.push(obj);
  }
  return results;
}
