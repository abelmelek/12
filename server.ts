import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// ------------------------------
// PERSISTENT DB HELPERS & GOOGLE SHEETS PROXY
// ------------------------------
const dbPath = path.join(__dirname, 'src', 'db.json');
const GOOGLE_SHEETS_SCRIPT_URL = process.env.GOOGLE_SHEETS_SCRIPT_URL || '';

async function queryGoogleSheets(action: string, payload: any = {}) {
  if (!GOOGLE_SHEETS_SCRIPT_URL) return null;
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error("Google Sheets API communication failed:", err);
  }
  return null;
}

async function fetchGoogleSheetsData() {
  if (!GOOGLE_SHEETS_SCRIPT_URL) return null;
  try {
    const url = `${GOOGLE_SHEETS_SCRIPT_URL}?action=get_all`;
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.error("Google Sheets GET data pull failed:", err);
  }
  return null;
}

function mergeSheetsData(localDb: any, sheetsData: any) {
  if (!sheetsData) return localDb;
  const mergedUsers = [...(localDb.users || [])];
  const sheetsUsers = sheetsData.users || [];
  sheetsUsers.forEach((su: any) => {
    if (su && su.email) {
      const idx = mergedUsers.findIndex((mu: any) => mu.email && mu.email.toLowerCase() === su.email.toLowerCase());
      if (idx !== -1) {
        mergedUsers[idx] = { ...mergedUsers[idx], ...su };
      } else {
        mergedUsers.push(su);
      }
    }
  });
  return {
    ...localDb,
    research_papers: sheetsData.papers || localDb.research_papers || [],
    comments: sheetsData.comments || localDb.comments || [],
    proposals: sheetsData.proposals || localDb.proposals || [],
    users: mergedUsers
  };
}

// ------------------------------
// TELEGRAM BOT CONFIG & PROPOSAL NOTIFICATIONS (DYNAMIC REFRESH)
// ------------------------------
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

function refreshTelegramConfig() {
  try {
    const db = readDB();
    if (db.settings) {
      if (db.settings.TELEGRAM_BOT_TOKEN) {
        TELEGRAM_BOT_TOKEN = db.settings.TELEGRAM_BOT_TOKEN.trim();
      }
      if (db.settings.TELEGRAM_CHAT_ID) {
        TELEGRAM_CHAT_ID = db.settings.TELEGRAM_CHAT_ID.trim();
      }
    }
  } catch (err) {
    console.error("Failed to refresh Telegram config:", err);
  }
}
refreshTelegramConfig();

function escapeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

async function sendTelegramNotification(proposal: {
  name: string,
  contact: string,
  title: string,
  abstract: string,
  fileName?: string,
  fileType?: string,
  fileData?: string
}) {
  refreshTelegramConfig();
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram Bot integration not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment). Skipping notification.");
    return;
  }

  const escapedTitle = escapeHTML(proposal.title);
  const escapedName = escapeHTML(proposal.name);
  const escapedContact = escapeHTML(proposal.contact);
  const escapedAbstract = escapeHTML(proposal.abstract);
  const escapedFileName = proposal.fileName ? escapeHTML(proposal.fileName) : '';

  const message = `<b>🚨 አዲስ የጥናት ፕሮፖዛል ቀርቧል! (New Study Proposal)</b>\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `👤 <b>የአቅራቢው ስም (Name):</b> ${escapedName}\n` +
                  `📞 <b>እውቂያ/መገናኛ (Contact):</b> ${escapedContact || 'ያልተጋራ'}\n` +
                  `📚 <b>የጥናቱ ርዕስ (Title):</b> ${escapedTitle}\n` +
                  `📝 <b>ማጠቃለያ (Abstract Summary):</b>\n<i>${escapedAbstract}</i>\n` +
                  (escapedFileName ? `📎 <b>የተያያዘ ፋይል (Attached file):</b> ${escapedFileName}\n` : '') +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `📅 <b>የቀረበበት ቀን (Date UTC):</b> ${new Date().toISOString()}`;

  try {
    const sendMsgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const msgRes = await fetch(sendMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!msgRes.ok) {
      const errorText = await msgRes.text();
      console.error(`Telegram sendMessage failed. Status: ${msgRes.status}. Output: ${errorText}`);
    } else {
      console.log(`Telegram alert sent successfully for proposal from "${escapedName}".`);
    }

    if (proposal.fileData && proposal.fileName) {
      const sendDocUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
      
      let base64Content = proposal.fileData;
      if (base64Content.includes(';base64,')) {
        base64Content = base64Content.split(';base64,')[1];
      }
      
      const buffer = Buffer.from(base64Content, 'base64');
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('caption', `📎 ${proposal.fileName} - Submitted by ${escapedName}`);
      
      const fileBlob = new Blob([buffer], { type: proposal.fileType || 'application/octet-stream' });
      formData.append('document', fileBlob, proposal.fileName);
      
      const docRes = await fetch(sendDocUrl, {
        method: 'POST',
        body: formData
      });

      if (!docRes.ok) {
        const docErrText = await docRes.text();
        console.error(`Telegram sendDocument failed. Status: ${docRes.status}. Output: ${docErrText}`);
      } else {
        console.log(`Telegram document file "${proposal.fileName}" sent successfully.`);
      }
    }
  } catch (err) {
    console.error("Error communicating with Telegram Bot endpoint API:", err);
  }
}

async function sendTelegramQuestionNotification(question: {
  name: string,
  userId: string,
  email: string,
  text: string
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram Bot integration not configured. Skipping live Q&A dispatch.");
    return;
  }

  const escapedName = escapeHTML(question.name);
  const escapedUserId = escapeHTML(question.userId);
  const escapedEmail = escapeHTML(question.email);
  const escapedText = escapeHTML(question.text);

  const message = `<b>❓ አዲስ የጥያቄ መልዕክት ደርሷል! (New Q&A Question)</b>\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `👤 <b>አባል (Member):</b> ${escapedName}\n` +
                  `🆔 <b>መለዮ (User ID):</b> ${escapedUserId || 'GUEST (አባል ያልሆነ)'}\n` +
                  `📧 <b>ኢሜይል (Email):</b> ${escapedEmail}\n` +
                  `💬 <b>ጥያቄ (Question):</b>\n<i>${escapedText}</i>\n` +
                  `━━━━━━━━━━━━━━━━━━━━━━\n` +
                  `📅 <b>የቀረበበት ሰዓት (Date UTC):</b> ${new Date().toISOString()}\n\n` +
                  `💡 <b>ይህንን ጥያቄ ለመመለስ ወደ አድሚን ዳሽቦርድ ድረ-ገጹ በመግባት "ሪፕላይ/Reply" የሚለውን ይጫኑ!</b>`;

  try {
    const sendMsgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(sendMsgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    console.log(`Telegram live question alert sent to agent bot.`);
  } catch (err) {
    console.error("Error dispatching live question notification to Telegram Bot:", err);
  }
}

// ------------------------------
// DYNAMIC TELEGRAM WEBHOOK REGISTRATION & EVENT DISPATCHING
// ------------------------------
function getAppBaseUrl(req?: express.Request): string {
  if (process.env.APP_URL) {
    let url = process.env.APP_URL.trim();
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      url = url.replace(/:\d+$/, '');
    }
    return url;
  }
  
  if (req) {
    const rawHost = (req.headers['x-forwarded-host'] || req.get('host') || '') as string;
    let host = rawHost.split(',')[0].trim();
    
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
      host = host.replace(/:\d+$/, '');
    }
    
    const rawProto = (req.headers['x-forwarded-proto'] || 'https') as string;
    const protocol = rawProto.split(',')[0].trim();
    return `${protocol}://${host}`;
  }
  
  return 'https://localhost:3000';
}

let webhookRegistered = false;

app.use(async (req, res, next) => {
  refreshTelegramConfig();
  if (!webhookRegistered && TELEGRAM_BOT_TOKEN) {
    const baseUrl = getAppBaseUrl(req);
    
    if (baseUrl && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      webhookRegistered = true;
      const webhookUrl = `${baseUrl}/api/telegram/webhook`;
      console.log(`[Telegram Webhook] Automatically registering webhook to: ${webhookUrl}`);
      
      try {
        const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
        const registerRes = await fetch(setWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl })
        });
        const regStatus = await registerRes.json();
        console.log(`[Telegram Webhook] Registration result:`, regStatus);
      } catch (err) {
        console.error(`[Telegram Webhook] Set webhook failed dynamically:`, err);
        webhookRegistered = false;
      }
    }
  }
  next();
});

app.get('/api/telegram/setup-webhook', async (req, res) => {
  refreshTelegramConfig();
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN environment variable/setting is not defined." });
  }
  const baseUrl = getAppBaseUrl(req);
  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  
  try {
    const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    const registerRes = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });
    const result = await registerRes.json();
    return res.json({ success: true, webhookUrl, registrationResult: result });
  } catch (err: any) {
    return res.status(500).json({ error: "SetWebhook request failed", details: err.message });
  }
});

app.post('/api/telegram/settings', async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    const db = readDB();
    if (!db.settings) {
      db.settings = {};
    }
    db.settings.TELEGRAM_BOT_TOKEN = (botToken || '').trim();
    db.settings.TELEGRAM_CHAT_ID = (chatId || '').trim();
    writeDB(db);
    
    refreshTelegramConfig();
    return res.json({ success: true, settings: db.settings });
  } catch (err: any) {
    console.error('Error saving Telegram settings:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/telegram/status', async (req, res) => {
  refreshTelegramConfig();
  if (!TELEGRAM_BOT_TOKEN) {
    return res.json({
      configured: false,
      botToken: '',
      chatId: TELEGRAM_CHAT_ID,
      error: "TELEGRAM_BOT_TOKEN is missing in configuration."
    });
  }
  const baseUrl = getAppBaseUrl(req);
  const expectedUrl = `${baseUrl}/api/telegram/webhook`;

  try {
    const getWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const response = await fetch(getWebhookUrl);
    const result = await response.json();
    
    const getMeUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
    const meResponse = await fetch(getMeUrl);
    const meResult = await meResponse.json();

    return res.json({
      configured: true,
      botTokenProvided: true,
      chatIdProvided: !!TELEGRAM_CHAT_ID,
      botToken: TELEGRAM_BOT_TOKEN,
      chatId: TELEGRAM_CHAT_ID,
      expectedWebhookUrl: expectedUrl,
      botInfo: meResult.ok ? meResult.result : null,
      webhookInfo: result.ok ? result.result : null
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      botToken: TELEGRAM_BOT_TOKEN,
      chatId: TELEGRAM_CHAT_ID,
      error: `Telegram server lookup failed: ${err.message}`
    });
  }
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    refreshTelegramConfig();
    const update = req.body;
    console.log('[Telegram Webhook Web API] Received update:', JSON.stringify(update));

    if (!update || !update.message) {
      return res.status(200).json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from?.id;
    const fromName = [message.from?.first_name || '', message.from?.last_name || ''].join(' ').trim() || 'Anonymous User';
    const username = message.from?.username ? `@${message.from.username}` : 'የሌለው (None)';
    const text = message.text || message.caption || '';

    if (text.startsWith('/start') || text.startsWith('/help')) {
      const welcomeMsg = `እንኳን በደህና መጡ! 🌟 በትሬዲንግ ስነ-ልቦና እና ጥናት (Trading Psychology Research Bot) ማዕከል ወደሚገኘው የውይይት ረዳት ቦት በደህና መጡ።\n\n` +
                         `ማንኛውንም ጥያቄ ወይም የምርምር ጥናት ሰነድ (PDF, DOCS, Word, etc.) እዚህ መፃፍ እና መላክ ይችላሉ። ጥያቄዎን ወይም አስተያየትዎን እንደላኩ ፈጣን ምላሽ ከአድሚኑ ይደርስዎታል።\n\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `Welcome! 🌟 You can directly ask any questions here regarding your trading journey or research papers. Send your message or attach research documents directly, and the administrator will review and answer you here!`;
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeMsg
        })
      });
      return res.status(200).json({ ok: true });
    }

    const isAdmin = String(userId).trim() === String(TELEGRAM_CHAT_ID).trim();

    if (isAdmin && text.startsWith('/reply')) {
      const parts = text.split(/\s+/);
      if (parts.length >= 3) {
        const targetChatId = parts[1];
        const replyText = text.substring(text.indexOf(targetChatId) + targetChatId.length).trim();

        if (targetChatId && replyText) {
          try {
            const sendReplyUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const replyRes = await fetch(sendReplyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: targetChatId,
                text: replyText
              })
            });

            if (replyRes.ok) {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: TELEGRAM_CHAT_ID,
                  text: `✅ <b>ምላሽዎ ለደንበኛው በተሳካ ሁኔታ ተልኳል!</b> (Reply sent to user ID: <code>${targetChatId}</code>)`,
                  parse_mode: 'HTML'
                })
              });
            } else {
              const errTxt = await replyRes.text();
              throw new Error(errTxt);
            }
          } catch (replyErr: any) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: `❌ <b>ስህተት ተከስቷል:</b> ምላሽዎን ለተጠቃሚው ማድረስ አልተቻለም። Error: ${escapeHTML(replyErr.message || 'unknown')}`,
                parse_mode: 'HTML'
              })
            });
          }
        }
      } else {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `⚠️ <b>ስህተት:</b> እባክዎን ትክክለኛውን የትዕዛዝ አፃፃፍ ይጠቀሙ።\nለምሳሌ፦ <code>/reply 6830413620 👋 ሰላም ገነት፦</code>`,
            parse_mode: 'HTML'
          })
        });
      }
      return res.status(200).json({ ok: true });
    }

    if (!isAdmin) {
      const escapedUserId = escapeHTML(String(userId));
      const adminForwardMsg = `📬 <b>አዲስ መልእክት ከደንበኛ!</b>\n\n` +
                              `👤 <b>የቴሌግራም ስም:</b> ${escapeHTML(fromName)}\n` +
                              `✈️ <b>Username:</b> ${escapeHTML(username)}\n` +
                              `🆔 <b>ID:</b> <code>${escapedUserId}</code>\n\n` +
                              `💬 <b>መልእክት:</b> ${escapeHTML(text || '[ጽሁፍ አልተካተተም / ሰነድ ማያያዣ]')}\n\n` +
                              `────────────────────\n` +
                              `📥 <b>ለ${escapeHTML(fromName)} ምላሽ ለመስጠት፦</b>\n` +
                              `<code>/reply ${escapedUserId} 👋 ሰላም ${escapeHTML(message.from?.first_name || 'ወዳጅ')}፦ </code>`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: adminForwardMsg,
          parse_mode: 'HTML'
        })
      });

      if (message.document) {
        const fileId = message.document.file_id;
        const fileName = message.document.file_name || 'document.pdf';
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            document: fileId,
            caption: `📎 <b>የተያያዘ የጥናት ሰነድ:</b> ${escapeHTML(fileName)}\n👤 ከአባል: ${escapeHTML(fromName)} (<code>${escapedUserId}</code>)`,
            parse_mode: 'HTML'
          })
        });
      }

      const db = readDB();
      if (!db.questions) db.questions = [];
      db.questions.push({
        id: 'msg-' + Date.now(),
        name: fromName,
        userId: String(userId),
        email: username,
        text: text || '[ፋይል/ሰነድ ተያይዟል]',
        timestamp: new Date().toISOString(),
        adminReply: '',
        replyTimestamp: '',
        isAnswered: false
      });
      writeDB(db);

      const ackMessage = `📬 መልእክትዎ በተሳካ ሁኔታ ለአድሚን ተልኳል! ፈጣን ምላሽ በቅርቡ እዚህ ይደርስዎታል። እናመሰግናለን።\n\n` +
                         `Your message or document has been received by our administrators. You will receive a response right here in this bot shortly!`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: ackMessage
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[Telegram Webhook Listener Exception]:', err);
    return res.status(200).json({ ok: true, error: err.message });
  }
});

function readDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { research_papers: [], comments: [], users: [], proposals: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { research_papers: [], comments: [], users: [], proposals: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// ------------------------------
// RESEARCH PORTION ENDPOINTS (DATABASE)
// ------------------------------
app.get('/api/research', async (req, res) => {
  try {
    let db = readDB();
    const sheetsData = await fetchGoogleSheetsData();
    if (sheetsData) {
      db = mergeSheetsData(db, sheetsData);
    }

    const deletedIds = db.deleted_paper_ids || [];
    db.research_papers = (db.research_papers || []).filter((p: any) => p && !deletedIds.includes(p.id));

    const maskEmails = db.settings?.maskEmails === true || db.settings?.maskEmails === "true";

    const response = db.research_papers.map((paper: any) => {
      let paperComments = db.comments.filter((c: any) => c.paperId === paper.id);
      if (maskEmails) {
        paperComments = paperComments.map((c: any) => {
          const emailStr = c.email || '';
          const parts = emailStr.split('@');
          let masked = emailStr;
          if (parts.length === 2) {
            const usernameStr = parts[0];
            const domainStr = parts[1];
            const mLength = Math.min(3, usernameStr.length);
            const visible = usernameStr.slice(0, mLength);
            masked = `${visible}***@${domainStr}`;
          }
          return { ...c, email: masked };
        });
      }
      return { ...paper, comments: paperComments };
    });
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to read research records: ' + error.message });
  }
});

app.post('/api/research/like', (req, res) => {
  try {
    const { paperId, email } = req.body;
    if (!paperId || !email) {
      return res.status(400).json({ error: 'Paper ID and user email are required.' });
    }

    const db = readDB();
    const paper = db.research_papers.find((p: any) => p.id === paperId);
    if (!paper) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    if (!paper.likedBy) {
      paper.likedBy = [];
    }

    const userLikedIndex = paper.likedBy.indexOf(email);
    if (userLikedIndex > -1) {
      paper.likedBy.splice(userLikedIndex, 1);
      paper.likes = Math.max(0, (paper.likes || 1) - 1);
    } else {
      paper.likedBy.push(email);
      paper.likes = (paper.likes || 0) + 1;
    }

    writeDB(db);
    res.json({ success: true, likes: paper.likes, likedBy: paper.likedBy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research/comment', async (req, res) => {
  try {
    const { paperId, author, email, text } = req.body;
    if (!paperId || !author || !email || !text) {
      return res.status(400).json({ error: 'Missing comment fields: paperId, author, text' });
    }

    const db = readDB();
    const newComment = {
      id: 'comment-' + Date.now(),
      paperId,
      author,
      email,
      text,
      timestamp: new Date().toISOString()
    };

    if (GOOGLE_SHEETS_SCRIPT_URL) {
      await queryGoogleSheets("add_comment", { paperId, author, email, text });
    }

    db.comments.push(newComment);
    writeDB(db);

    res.json({ success: true, comment: newComment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research/create', async (req, res) => {
  try {
    const { title, abstract, content, authors, seedInitialChart, image } = req.body;
    if (!title || !abstract || !content || !authors) {
      return res.status(400).json({ error: 'Missing research creation parameters.' });
    }

    const db = readDB();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'paper-' + Date.now();

    const chartData = seedInitialChart || [
      { day: 0, capital: 100 },
      { day: 20, capital: 130 },
      { day: 40, capital: 169 },
      { day: 60, capital: 220 },
      { day: 80, capital: 286 },
      { day: 100, capital: 372 }
    ];

    const newPaper = { id, title, abstract, authors, likes: 0, likedBy: [], content, chartData, image: image || "" };

    if (GOOGLE_SHEETS_SCRIPT_URL) {
      await queryGoogleSheets("create_paper", { title, abstract, content, authors, image });
    }

    db.research_papers.push(newPaper);
    writeDB(db);

    res.json({ success: true, paper: newPaper });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research/update', async (req, res) => {
  try {
    const { id, title, abstract, content, authors, image } = req.body;
    if (!id || !title || !abstract || !content || !authors) {
      return res.status(400).json({ error: 'Missing research update parameters.' });
    }

    const db = readDB();
    const paperIdx = db.research_papers.findIndex((p: any) => p.id === id);
    if (paperIdx === -1) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    db.research_papers[paperIdx] = {
      ...db.research_papers[paperIdx],
      title,
      abstract,
      content,
      authors,
      image: image !== undefined ? image : db.research_papers[paperIdx].image || ""
    };

    if (GOOGLE_SHEETS_SCRIPT_URL) {
      await queryGoogleSheets("update_paper", { id, title, abstract, content, authors, image });
    }

    writeDB(db);
    res.json({ success: true, paper: db.research_papers[paperIdx] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research/delete', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Paper ID is required.' });
    }

    const db = readDB();
    db.deleted_paper_ids = db.deleted_paper_ids || [];
    if (!db.deleted_paper_ids.includes(id)) {
      db.deleted_paper_ids.push(id);
    }
    db.research_papers = db.research_papers.filter((p: any) => p.id !== id);
    db.comments = db.comments.filter((c: any) => c.paperId !== id);

    if (GOOGLE_SHEETS_SCRIPT_URL) {
      await queryGoogleSheets("delete_paper", { id });
    }

    writeDB(db);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research/add-image', async (req, res) => {
  try {
    const { id, image } = req.body;
    if (!id || !image) {
      return res.status(400).json({ error: 'Paper ID and image data are required.' });
    }

    const db = readDB();
    const paperIdx = db.research_papers.findIndex((p: any) => p.id === id);
    if (paperIdx === -1) {
      return res.status(404).json({ error: 'Research paper not found.' });
    }

    db.research_papers[paperIdx].image = image;
    writeDB(db);

    res.json({ success: true, paper: db.research_papers[paperIdx] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please provide name, email, phone and password.' });
    }

    let db = readDB();
    const sheetsData = await fetchGoogleSheetsData();
    if (sheetsData) {
      db = mergeSheetsData(db, sheetsData);
    }

    const existing = db.users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email has already been registered. Please login.' });
    }

    let cleanName = name.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleanName.length < 3) {
      cleanName = (name.trim() + "TRD").slice(0, 3).toUpperCase();
    }
    const prefix = cleanName.slice(0, 3);
    
    const phoneDigits = phone.replace(/\D/g, '');
    let suffixLen = 4;
    let suffix = phoneDigits.slice(-suffixLen) || "1234";
    let userId = prefix + suffix;
    
    let collision = db.users.some((u: any) => u.userId === userId || u.id === userId);
    if (collision) {
      suffixLen = 5;
      suffix = phoneDigits.slice(-suffixLen) || "12345";
      userId = prefix + suffix;
      
      collision = db.users.some((u: any) => u.userId === userId || u.id === userId);
      if (collision) {
        userId = userId + Math.floor(Math.random() * 9 + 1);
      }
    }

    const newUser = {
      userId,
      name,
      email: email.toLowerCase(),
      phone,
      password,
      isAdmin: false
    };

    if (GOOGLE_SHEETS_SCRIPT_URL) {
      await queryGoogleSheets("register_user", { name, email, phone, password });
    }

    db.users.push(newUser);
    writeDB(db);

    res.json({ success: true, user: { userId, name: newUser.name, email: newUser.email, phone: newUser.phone, isAdmin: false } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------
// PRIVACY GOVERNANCE & PRIVACY PURGE ENDPOINTS
// ------------------------------
app.post('/api/admin/privacy/settings', (req, res) => {
  try {
    const { maskEmails, supervisorPin } = req.body;
    if (supervisorPin !== "privacy99") {
      return res.status(403).json({ error: "Unauthorized access: Invalid privacy supervisor security credential PIN." });
    }
    const db = readDB();
    if (!db.settings) db.settings = {};
    db.settings.maskEmails = maskEmails === true || maskEmails === "true";
    writeDB(db);
    res.json({ success: true, settings: db.settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/privacy/purge-user', (req, res) => {
  try {
    const { email, supervisorPin } = req.body;
    if (supervisorPin !== "privacy99") {
      return res.status(403).json({ error: "Unauthorized access: Invalid privacy supervisor security credential PIN." });
    }
    if (!email) {
      return res.status(400).json({ error: "Target email address context parameter is mandatory." });
    }

    const db = readDB();
    const normalizedEmail = email.toLowerCase().trim();

    const originalCount = db.users?.length || 0;
    db.users = (db.users || []).filter((u: any) => !u.email || u.email.toLowerCase().trim() !== normalizedEmail);
    const newCount = db.users?.length || 0;

    db.comments = (db.comments || []).filter((c: any) => !c.email || c.email.toLowerCase().trim() !== normalizedEmail);
    db.proposals = (db.proposals || []).filter((p: any) => !p.contact || !p.contact.toLowerCase().includes(normalizedEmail));

    writeDB(db);

    res.json({
      success: true,
      message: `User with email ${email} successfully anonymized and erased from system records.`,
      erasedUserCount: originalCount - newCount
    });
  } catch (error: any) {
    res.status(550).json({ error: error.message });
  }
});

app.get('/api/admin/privacy/export', (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Production bundling static handler
if (process.env.NODE_ENV === 'production') {
  // 💡 ማብራሪያ፡ በ ቢልድ ሰዓት ሰርቨሩ ራሱ dist ውስጥ ስለሚሆን __dirname እራሱ dist ን ይወክላል።
  // ስለዚህ path.join(__dirname, 'dist') ከማለት ይልቅ __dirname ን በቀጥታ መጠቀም ወይም ወደ ኋላ መመለስ ያስፈልጋል።
  
  const distPath = path.resolve(__dirname, 'index.html').includes('dist') 
    ? __dirname 
    : path.join(__dirname, 'dist');

  console.log(`[Production Static Mode] Serving frontend from: ${distPath}`);

  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // @ts-ignore
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
