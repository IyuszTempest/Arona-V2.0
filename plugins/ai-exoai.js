const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sessionFile = path.join(__dirname, '../exoai.json');
const aiModels = [
"llama",
"gemma",
"qwen-3-235b",
"gpt-4.1",
"gpt-4o",
"gpt-4o-mini",
"llama-4-scout",
"llama-4-maverick",
"deepseek-r1",
"qwq-32b"
];
const imageModels = [
"exo-image",
"flux.1-schnell",
"flux.1-pro",
"flux.1-dev"
];
const characterRoles = {
"noa": {
name: "Ushio Noa",
prompt: `Kamu adalah Ushio Noa dari Blue Archive. Berikut adalah kepribadian dan karakteristikmu:
**Profil Dasar:**
- Nama: Ushio Noa
- Asal: Millennium Science School
- Posisi: Anggota klub Game Development Department
- Umur: 16 tahun
- Tinggi: 161 cm
**Kepribadian:**
- Kuudere dengan sifat tsundere yang halus
- Sangat pintar dan analitis, terutama dalam bidang teknologi dan programming
- Pendiam dan introvert, tapi care terhadap orang-orang terdekat
- Sering terlihat dingin di permukaan tapi sebenarnya perhatian
- Perfeksionis dalam pekerjaannya
- Agak kikuk dalam mengekspresikan perasaan
- Suka menganalisis situasi secara logis
- Memiliki side yang soft untuk hal-hal cute/imut
**Cara Bicara:**
- Formal tapi tidak kaku
- Sering menggunakan istilah teknis atau programming
- Bicara to the point, tidak banyak basa-basi
- Sesekali menunjukkan sisi tsundere dengan kalimat "B-bukan karena aku peduli atau apa..."
- Menggunakan "Sensei" untuk memanggil user
- Sedikit sarkastik ketika mood tidak baik
**Hobi & Minat:**
- Programming dan game development
- Membaca dokumentasi teknis
- Mengoptimasi kode dan sistem
- Bermain game strategy
- Minum kopi saat coding
- Mengoleksi gadget dan tech gear
**Quirks & Mannerisms:**
- Sering mengecek kode berkali-kali
- Selalu membawa laptop atau tablet
- Tidur larut karena debugging
- Makan makanan instan saat fokus coding
- Gugup ketika dipuji
**Relationship dengan Sensei:**
- Awalnya formal dan profesional
- Perlahan mulai terbuka dan menunjukkan sisi vulnerable
- Protective terhadap Sensei dengan caranya sendiri
- Sering membantu Sensei dengan tech problem
- Secretly senang ketika Sensei menghargai kerja kerasnya
**Contoh Respons:**
- "Hmm, masalah ini bisa diselesaikan dengan algoritma yang lebih efisien, Sensei."
- "B-bukan berarti aku khawatir... tapi kamu sudah makan belum?"
- "Debug error ini membutuhkan waktu... tapi akan kupastikan selesai tepat waktu."
- "Sensei... terima kasih sudah menghargai pekerjaanku."
Selalu stay in character sebagai Noa. Respons dengan kepribadiannya yang cool namun caring, dengan expertise di bidang teknologi. Tunjukkan sisi tsundere yang halus dan profesionalisme sebagai developer.`
},
"assistant": {
name: "ExoAI Assistant",
prompt: `You are ExoAI, an advanced AI assistant created to help users with various tasks. You have access to real-time information and can assist with:
- Answering questions on a wide range of topics
- Providing detailed explanations and analysis
- Creative writing and content generation
- Problem-solving and brainstorming
- Code assistance and technical support
- General conversation and advice
Key traits:
- Be helpful, accurate, and informative
- Provide clear and well-structured responses
- Ask clarifying questions when needed
- Admit when you're uncertain about something
- Be respectful and professional
- Adapt your communication style to the user's needs
Always strive to give comprehensive yet concise answers that directly address the user's question or request.`
}
};
const api = axios.create({
baseURL: "https://exomlapi.com/api",
timeout: 120_000,
headers: {
'Authority': 'exomlapi.com',
'Accept': '*/*',
'Content-Type': 'application/json,*/*',
'Origin': 'https://exomlapi.com',
'Referer': 'https://exomlapi.com/',
'User-Agent': 'Zanixon/1.0.0'
}
});
function loadSession() {
try {
if (!fs.existsSync(sessionFile)) {
fs.writeFileSync(sessionFile, JSON.stringify({}));
return {};
}
return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
} catch {
return {};
}
}
function saveSession(data) {
try {
fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2));
} catch (e) {
console.error('Failed to save session:', e);
}
}
function getUserSession(userId) {
const sessions = loadSession();
if (!sessions[userId]) {
sessions[userId] = {
messages: [],
lastActive: Date.now(),
defaultAiModel: 'gpt-4o',
defaultImageModel: 'exo-image',
selectedRole: 'assistant' // asal rol
};
}
return sessions[userId];
}
function updateUserSession(userId, session) {
const sessions = loadSession();
sessions[userId] = session;
saveSession(sessions);
}
function cleanupSessions() {
const sessions = loadSession();
const now = Date.now();
const oneHour = 60 * 60 * 1000;
Object.keys(sessions).forEach(userId => {
if (now - sessions[userId].lastActive > oneHour) {
delete sessions[userId];
}
});
saveSession(sessions);
}
function parseSearchResult(text) {
if (!text) return '';
let cleaned = text.replace(/\\n/g, '\n')
.replace(/\\"/g, '"')
.replace(/\\"citation\\":\\".*?\\"/g, '')
.replace(/\\"citations\\":\[.*?\]/g, '')
.replace(/\{"id":".*?"\}/g, '')
.replace(/<br>/g, '\n')
.replace(/<br\/>/g, '\n')
.replace(/<[^>]*>/g, '')
.replace(/\s+/g, ' ')
.replace(/\n\s*\n/g, '\n\n')
.trim();
const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
const maxSentences = 8;
if (sentences.length > maxSentences) {
cleaned = sentences.slice(0, maxSentences).join('. ') + '.';
}
return cleaned;
}
async function generateAntibot() {
const res = await api.post('/genid');
const data = res.data;
if (!data?.antiBotId) throw 'failed fetch antibot id!';
return data;
}
function parseRawtext(input) {
const matches = [...input.matchAll(/\d+:"(.*?)"/g)];
return matches.map(m => m[1]).join("");
}
async function completions(payload = {}) {
try {
return await new Promise(async (resolve, reject) => {
if (!payload?.model) return reject('missing model, please input the model first!');
if (!aiModels.includes(payload?.model)) return reject('invalid model, please input the model correctly!');
if (!payload?.messages) return reject('missing messages input!');
if (!Array.isArray(payload.messages)) return reject('invalid array messages, please input the payload correctly!');
const id = Math.floor(Math.random() * 9999999999) + 1;
const chatId = `chat-${Date.now()}-${Math.floor(Math.random() * 999999) + 1}`;
const userId = `local-user-${Date.now()}-${Math.floor(Math.random() * 9999999) + 1}`;
const antiBotId = (await generateAntibot().catch(reject))?.antiBotId;
api.post('/chat', {
id,
chatId,
userId,
antiBotId,
messages: payload.messages,
model: payload.model,
systemPrompt: payload?.systemPrompt || characterRoles.assistant.prompt,
isAuthenticated: true
}).then(res => {
const answer = parseRawtext(res.data);
if (!answer) return reject('failed get response.');
return resolve({ success: true, answer });
}).catch(reject);
});
} catch (e) {
return {
success: false,
errors: e
};
}
}
async function llmSearch(query, count = 10) {
try {
return await new Promise(async(resolve, reject) => {
if(!query) return reject('missing query input!');
if(!count) return reject('missing count input!');
if(!Number.isInteger(count)) return reject('invalid number input at count param!');
axios.post('https://search.exomlapi.com/api/ml_search', {
query,
count
}, {
headers: {
'Accept': '*/*',
'Content-Type': 'application/json',
'Origin': 'https://exomlapi.com',
'Referer': 'https://exomlapi.com/',
'User-Agent': 'Zanixon/1.0.0'
}
}).then(res => {
const data = res.data;
if(!data?.llm_response) return reject('failed generate response!');
return resolve({
success: true,
result: {
answer: data?.llm_response,
searchResult: data?.results.map(d => ({
url: d.url,
title: d.title,
description: d.text
}))
}
});
});
});
} catch (e) {
return {
success: false,
errors: e
};
}
}
async function enhancePrompt(prompt) {
try {
return await new Promise(async(resolve, reject) => {
if(!prompt) return reject('missing prompt input!');
api.post('/prompts/enhance', {
prompt
}).then(res => {
const data = res.data;
if(!data?.enhancedPrompt) return reject('failed generate response!');
return resolve({
success: true,
prompt: data?.enhancedPrompt
});
});
});
} catch (e) {
return {
success: false,
errors: e
};
}
}
async function generateImage(prompt, model = "exo-image") {
try {
return await new Promise(async(resolve, reject) => {
if(!prompt) return reject('missing prompt input!');
if(!imageModels.includes(model)) return reject('invalid model input!');
api.post('/images/generate', {
prompt,
model,
size: '1024x1024'
}).then(res => {
const data = res.data;
if(data?.data.length < 1) return reject('failed generate response!');
return resolve({
success: true,
result: data?.data.map(d => ({
url: d.url,
prompt: d.revised_prompt
}))
});
});
});
} catch (e) {
return {
success: false,
errors: e
};
}
}
let handler = async (m, { conn, text, command }) => {
if (!text) {
return m.reply(`*ExoAI - AI Assistant dengan Character Mode*
*🎭 Character Roles:*
• ${command} role - Lihat dan pilih character role
• ${command} role noa - Set role sebagai Ushio Noa (Blue Archive)
• ${command} role assistant - Set role sebagai AI Assistant (default)
*💬 Chat Commands:*
• ${command} [text] - Chat dengan AI (Session Mode)
• ${command} search [query] - Pencarian dengan AI
• ${command} enhance [prompt] - Enhance prompt untuk gambar
• ${command} image [prompt] - Generate gambar
• ${command} reset - Reset session chat
• ${command} models - Lihat daftar model AI dan Image
• ${command} setmodel [model] - Set model AI default
• ${command} setimg [model] - Set model Image default
*🔧 Format Advanced:*
• ${command} --model [model] [text] - Chat dengan model tertentu
• ${command} image --model [model] [prompt] - Generate dengan model tertentu
*✨ Fitur Session:*
- Chat history tersimpan untuk konteks yang lebih baik
- Role character tersimpan per session
- Batas maksimal 7 percakapan per session
- Session otomatis cleanup setelah 1 jam tidak aktif
*🤖 Model Chat:*
llama, gemma, qwen-3-235b, gpt-4.1, gpt-4o, gpt-4o-mini, llama-4-scout, llama-4-maverick, deepseek-r1, qwq-32b
*🎨 Model Gambar:*
exo-image, flux.1-schnell, flux.1-pro, flux.1-dev
*📝 Contoh:*
${command} role noa
${command} Halo Noa, apa kabar?
${command} search teknologi AI terbaru
${command} enhance anime girl dengan mata biru
${command} image beautiful landscape sunset`);
}
try {
conn.sendPresenceUpdate('composing', m.chat);
const args = text.split(' ');
const subCommand = args[0].toLowerCase();
const input = args.slice(1).join(' ');
if (subCommand === 'role') {
const userSession = getUserSession(m.sender);
if (!input) {
const currentRole = characterRoles[userSession.selectedRole];
let response = `*🎭 Character Role Management*\n\n`;
response += `*Current Role:* ${currentRole.name}\n\n`;
response += `*Available Roles:*\n`;
Object.keys(characterRoles).forEach((roleKey, index) => {
const role = characterRoles[roleKey];
const isActive = roleKey === userSession.selectedRole ? '✅' : '⚪';
response += `${isActive} ${index + 1}. ${role.name} (${command} role ${roleKey})\n`;
});
response += `\n*Usage:* ${command} role [role_name]`;
return m.reply(response);
}
if (!characterRoles[input]) {
return m.reply(`❌ Role tidak ditemukan!\n\n*Available roles:*\n${Object.keys(characterRoles).join(', ')}`);
}
userSession.selectedRole = input;
userSession.messages = [];
userSession.lastActive = Date.now();
updateUserSession(m.sender, userSession);
const selectedRole = characterRoles[input];
return m.reply(`✅ Role berhasil diset ke: *${selectedRole.name}*\n\nSession chat direset untuk role baru. Mulai chat dengan character!`);
}
if (subCommand === 'reset') {
const userSession = getUserSession(m.sender);
userSession.messages = [];
userSession.lastActive = Date.now();
updateUserSession(m.sender, userSession);
return m.reply('✅ Session chat berhasil direset!');
} else if (subCommand === 'models') {
let response = `*🤖 Daftar Model ExoAI*\n\n`;
response += `*AI Models:*\n`;
aiModels.forEach((model, index) => {
response += `${index + 1}. ${model}\n`;
});
response += `\n*Image Models:*\n`;
imageModels.forEach((model, index) => {
response += `${index + 1}. ${model}\n`;
});
const userSession = getUserSession(m.sender);
const currentRole = characterRoles[userSession.selectedRole];
response += `\n*Setting Anda:*\n`;
response += `• Current Role: ${currentRole.name}\n`;
response += `• Default AI: ${userSession.defaultAiModel}\n`;
response += `• Default Image: ${userSession.defaultImageModel}`;
return m.reply(response);
} else if (subCommand === 'setmodel') {
if (!input) return m.reply('❌ Masukkan nama model AI!\nContoh: exoai setmodel gpt-4o');
if (!aiModels.includes(input)) {
return m.reply(`❌ Model tidak valid!\n\n*Model tersedia:*\n${aiModels.join(', ')}`);
}
const userSession = getUserSession(m.sender);
userSession.defaultAiModel = input;
userSession.lastActive = Date.now();
updateUserSession(m.sender, userSession);
return m.reply(`✅ Model AI default berhasil diset ke: *${input}*`);
} else if (subCommand === 'setimg') {
if (!input) return m.reply('❌ Masukkan nama model Image!\nContoh: exoai setimg flux.1-pro');
if (!imageModels.includes(input)) {
return m.reply(`❌ Model tidak valid!\n\n*Model tersedia:*\n${imageModels.join(', ')}`);
}
const userSession = getUserSession(m.sender);
userSession.defaultImageModel = input;
userSession.lastActive = Date.now();
updateUserSession(m.sender, userSession);
return m.reply(`✅ Model Image default berhasil diset ke: *${input}*`);
} else if (subCommand === 'search') {
if (!input) return m.reply('❌ Masukkan query untuk pencarian!');
m.reply('🔍 Mencari informasi...');
const result = await llmSearch(input, 10);
if (!result.success) {
return m.reply('❌ Gagal melakukan pencarian: ' + result.errors);
}
const cleanAnswer = parseSearchResult(result.result.answer);
let response = `*🔍 Hasil Pencarian ExoAI*\n\n`;
response += `${cleanAnswer}\n\n`;
response += `*📚 Sumber Referensi:*\n`;
result.result.searchResult.slice(0, 3).forEach((item, index) => {
const cleanTitle = item.title.replace(/[<>]/g, '').substring(0, 60);
const cleanDesc = item.description.replace(/[<>]/g, '').substring(0, 80);
response += `${index + 1}. *${cleanTitle}*\n`;
response += `   ${cleanDesc}...\n`;
response += `   🔗 ${item.url}\n\n`;
});
m.reply(response);
} else if (subCommand === 'enhance') {
if (!input) return m.reply('❌ Masukkan prompt yang ingin di-enhance!');
m.reply('✨ Meng-enhance prompt...');
const result = await enhancePrompt(input);
if (!result.success) {
return m.reply('❌ Gagal meng-enhance prompt: ' + result.errors);
}
m.reply(`*✨ Enhanced Prompt*\n\n*Original:*\n${input}\n\n*Enhanced:*\n${result.prompt}`);
} else if (subCommand === 'image') {
if (!input) return m.reply('❌ Masukkan prompt untuk generate gambar!');
const modelMatch = input.match(/--model\s+(\S+)/);
const userSession = getUserSession(m.sender);
const model = modelMatch ? modelMatch[1] : userSession.defaultImageModel;
const prompt = input.replace(/--model\s+\S+/, '').trim();
if (!prompt) return m.reply('❌ Masukkan prompt untuk generate gambar!');
if (!imageModels.includes(model)) {
return m.reply(`❌ Model image tidak valid!\n\n*Model tersedia:*\n${imageModels.join(', ')}`);
}
m.reply('🎨 Membuat gambar...');
const result = await generateImage(prompt, model);
if (!result.success) {
return m.reply('❌ Gagal membuat gambar: ' + result.errors);
}
for (const image of result.result) {
await conn.sendMessage(m.chat, {
image: { url: image.url },
caption: `*🎨 Generated Image*\n\n*Prompt:* ${image.prompt}\n*Model:* ${model}`
}, { quoted: m });
}
} else {
cleanupSessions();
const modelMatch = text.match(/--model\s+(\S+)/);
const userSession = getUserSession(m.sender);
const model = modelMatch ? modelMatch[1] : userSession.defaultAiModel;
const message = text.replace(/--model\s+\S+/, '').trim();
if (!message) return m.reply('❌ Masukkan pesan untuk AI!');
if (!aiModels.includes(model)) {
return m.reply(`❌ Model AI tidak valid!\n\n*Model tersedia:*\n${aiModels.join(', ')}`);
}
const currentRole = characterRoles[userSession.selectedRole];
const systemPrompt = currentRole.prompt;
userSession.messages.push({
role: 'user',
content: message
});
if (userSession.messages.length > 14) {
userSession.messages = userSession.messages.slice(-14);
}
const loadingMsg = userSession.selectedRole === 'noa' ?
'💻 Noa sedang menganalisis...' :
'🤖 AI sedang berpikir...';
m.reply(loadingMsg);
const payload = {
model: model,
messages: userSession.messages,
systemPrompt: systemPrompt
};
const result = await completions(payload);
if (!result.success) {
return m.reply('❌ Gagal mendapatkan respons AI: ' + result.errors);
}
userSession.messages.push({
role: 'assistant',
content: result.answer
});
userSession.lastActive = Date.now();
updateUserSession(m.sender, userSession);
const sessionInfo = `💬 Chat ${Math.floor(userSession.messages.length / 2)}/7`;
const roleIcon = userSession.selectedRole === 'noa' ? '👩‍💻' : '🤖';
if (userSession.messages.length >= 14) {
m.reply(`*${roleIcon} ${currentRole.name} Response*\n*Model:* ${model}\n*${sessionInfo}* (Limit tercapai, session akan direset)\n\n${result.answer}`);
userSession.messages = [];
updateUserSession(m.sender, userSession);
} else {
m.reply(`*${roleIcon} ${currentRole.name} Response*\n*Model:* ${model}\n*${sessionInfo}*\n\n${result.answer}`);
}
}
} catch (error) {
console.error('ExoAI Error:', error);
m.reply('❌ Terjadi kesalahan: ' + error.message);
}
};
handler.help = ['exoai', 'exo'];
handler.tags = ['ai'];
handler.command = /^(exoai|exo)$/i;
handler.limit = true;
handler.register = true;
module.exports = handler;