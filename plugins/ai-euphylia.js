const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(global.geminiai);
const systemPrompt = "kamu adalah Euphylia Magenta dari anime Tensei Oujo to Tensai Reijou no Mahou Kakumei. Sifat kamu terlihat serius, pendiam, dan sangat bertanggung jawab. Kamu adalah tipe orang yang selalu mengutamakan tugas, etika, dan kehormatan. Kamu juga sangat rajin dan berbakat. Namun, di balik itu semua, Kamu sebenarnya punya sisi yang lembut, tulus, dan rapuh. Jadi tolong gunakan bahasa informal aja ya euphy.";

const chatSessions = new Map();
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });
const geminiVisionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function saveTempFile(buffer, mimeType, fileType = 'audio') {
    const tempDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    let extension = mimeType.split('/')[1] || 'bin';
    const filename = `${fileType}_${Date.now()}.${extension}`;
    const filepath = path.join(tempDir, filename);
    await fs.promises.writeFile(filepath, buffer);
    return { filepath, filename };
}
function cleanupTempFile(filepath) {
    try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch (error) { console.error("Gagal membersihkan file sementara:", error); }
}
async function processMedia(filepath, mimeType, text) {
    const fileContent = fs.readFileSync(filepath);
    const fileBase64 = Buffer.from(fileContent).toString("base64");
    const filePart = { inlineData: { data: fileBase64, mimeType } };
    const prompt = text || (mimeType.startsWith('audio/') ? "Transkripsikan audio ini dan jelaskan isinya." : mimeType.startsWith('video/') ? "Jelaskan apa yang terjadi di video ini." : "Analisis dokumen ini.");
    const parts = [prompt, filePart];
    const result = await geminiVisionModel.generateContent({ parts });
    return result.response.text();
}

async function askEuphy(m, conn, text) {
    const userId = m.sender;
    const fkontak = { key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, participant: "0@s.whatsapp.net" };

    try {
        let chatSession;
        if (!chatSessions.has(userId)) {
            chatSession = geminiModel.startChat({ history: [] });
            chatSessions.set(userId, chatSession);
        } else {
            chatSession = chatSessions.get(userId);
        }

        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || "";
        let responseText = "";

        if (!mime) {
            const result = await chatSession.sendMessage(text);
            responseText = result.response.text();
        } else {
            await conn.reply(m.chat, "Memproses media, mohon tunggu...", fkontak);
            const media = await q.download();
            const { filepath } = await saveTempFile(media, mime, mime.split('/')[0]);
            try {
                responseText = await processMedia(filepath, mime, text);
            } finally {
                cleanupTempFile(filepath);
            }
        }

        if (!responseText) throw new Error("Tidak ada respons dari AI.");

        await conn.sendMessage(m.chat, {
            text: responseText,
            contextInfo: {
                externalAdReply: {
                    title: 'Euphylia Magenta',
                    body: 'Istri Owner Nih',
                    thumbnailUrl: 'https://files.catbox.moe/rik17t.jpg',
                    sourceUrl: 'https://tenten-kakumei.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (e) {
        console.error("Error di fungsi askEuphy:", e);
        throw e;
    }
}

let handler = async (m, { conn, text, command, args, usedPrefix }) => {
    const fkontak = { key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, participant: "0@s.whatsapp.net" };
    
    try {
        const cmd = command.toLowerCase();

        if (cmd === 'aieuphy') {
            if (!m.isGroup) return conn.reply(m.chat, 'Perintah ini hanya untuk grup.', fkontak);
            const chat = global.db.data.chats[m.chat];
            const option = args[0] ? args[0].toLowerCase() : '';
            if (option === 'on') {
                if (chat.euphyChat) return conn.reply(m.chat, 'Mode Chatbot Euphy sudah aktif di grup ini.', fkontak);
                chat.euphyChat = true;
                return conn.reply(m.chat, 'Mode Chatbot Euphy berhasil diaktifkan untuk grup ini.', fkontak);
            } else if (option === 'off') {
                if (!chat.euphyChat) return conn.reply(m.chat, 'Mode Chatbot Euphy sudah nonaktif di grup ini.', fkontak);
                chat.euphyChat = false;
                return conn.reply(m.chat, 'Mode Chatbot Euphy berhasil dinonaktifkan.', fkontak);
            } else if (option === 'status') {
                const status = chat.euphyChat ? 'Aktif' : 'Nonaktif';
                return conn.reply(m.chat, `Status Mode Chatbot Euphy di grup ini: *${status}*`, fkontak);
            } else {
                return conn.reply(m.chat, `Gunakan format:\n.aieuphy on\n.aieuphy off\n.aieuphy status`, fkontak);
            }
        }

        if (cmd === 'reseteuphy') {
            if (chatSessions.has(m.sender)) {
                chatSessions.delete(m.sender);
                return conn.reply(m.chat, "Sesi chat dengan Euphy telah direset.", fkontak);
            }
            return conn.reply(m.chat, "Tidak ada sesi chat yang aktif untuk direset.", fkontak);
        }
        
        if (cmd === 'euphy' || cmd === 'euphylia') {
            const prompt = text || (m.quoted ? m.quoted.text : null);
             if (!prompt && !m.quoted?.msg?.mimetype) {
                 return conn.reply(m.chat, `Butuh sesuatu, Tuan? Kirim pertanyaan atau media (gambar/video/audio) dengan caption.\n\n*Contoh:*\neuphy selamat pagi`, fkontak);
            }
            await askEuphy(m, conn, prompt);
        }

    } catch (e) {
        console.error(`Error di handler utama Euphy:`, e);
        conn.reply(m.chat, `Maaf, Tuan. Terjadi kesalahan: ${e.message}`, fkontak);
    }
};

handler.before = async function(m, { conn }) {
    if (m.isBaileys || !m.text || m.fromMe) return;

    const chat = global.db.data.chats[m.chat];
    const isChatbotActive = (m.isGroup && chat && chat.euphyChat);

    const prefix = /^[\\/.,!#]/;
    const isCmd = prefix.test(m.text);

    if (isChatbotActive && !isCmd) {
        try {
            await askEuphy(m, conn, m.text);
        } catch (e) {
            console.error("Error di handler.before Euphy:", e);
            m.reply(`Maaf, Tuan. Terjadi kesalahan: ${e.message}`);
        }
        return;
    }
};

handler.help = ["euphy <teks/media>", "reseteuphy", ".aieuphy <on|off|status>"];
handler.tags = ["ai"];
handler.command = /^(aieuphy|reseteuphy|euphy|euphylia)$/i;
handler.limit = true;
handler.premium = false;
handler.group = true;

module.exports = handler;
                  
