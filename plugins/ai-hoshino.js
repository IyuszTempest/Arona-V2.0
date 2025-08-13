const axios = require('axios')
const sessions = {}, shownSession = {}
function generateUserId() {
return `user-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
}
let handler = async (m, { conn, text }) => {
conn.hoshinoAI = conn.hoshinoAI || {}
if (!text) return m.reply('Contoh : .hoshino Halo')
if (text.toLowerCase() === 'off') {
if (conn.hoshinoAI[m.sender]) {
delete conn.hoshinoAI[m.sender]
return m.reply('Hoshino dinonaktifkan. Session ID tetap tersimpan')
}
return m.reply('Hoshino belum aktif')
}
if (text.toLowerCase() === 'delete') {
delete conn.hoshinoAI[m.sender]
if (sessions[m.sender]) {
let old = sessions[m.sender]
delete sessions[m.sender]
delete shownSession[m.sender]
return m.reply(`Session ID dihapus : ${old}`)
}
return m.reply('Tidak ada Session ID')
}
if (!conn.hoshinoAI[m.sender]) conn.hoshinoAI[m.sender] = true
if (!sessions[m.sender]) sessions[m.sender] = generateUserId()
let sessionId = sessions[m.sender]
if (!shownSession[m.sender]) {
shownSession[m.sender] = true
await m.reply(`Hoshino aktif\nSession ID : ${sessionId}`)
}
try {
let { data } = await axios.post('https://luminai.my.id/', {
content: text,
user: sessionId,
agent: 'hoshino'
}, {
headers: {
'Content-Type': 'application/json',
'X-XSS-Protection': '1; mode=block',
'X-Content-Type-Options': 'nosniff',
'Referrer-Policy': 'strict-origin-when-cross-origin'
}
})
m.reply(data?.result || '[Hoshino tidak merespons]')
} catch (e) {
m.reply(e.message)
}
}
handler.command = ['hoshino']
handler.help = ['hoshino [teks/off/delete]']
handler.tags = ['ai']
handler.before = async (m, { conn }) => {
if (!m.text || m.isBaileys || m.fromMe) return
conn.hoshinoAI = conn.hoshinoAI || {}
if (!conn.hoshinoAI[m.sender]) return
if (/^[!./#\\]/.test(m.text)) return
if (!sessions[m.sender]) {
sessions[m.sender] = generateUserId()
shownSession[m.sender] = true
await m.reply(`Hoshino aktif\nSession ID : ${sessions[m.sender]}`)
}
try {
let { data } = await axios.post('https://luminai.my.id/', {
content: m.text,
user: sessions[m.sender],
agent: 'hoshino'
}, {
headers: {
'Content-Type': 'application/json',
'X-XSS-Protection': '1; mode=block',
'X-Content-Type-Options': 'nosniff',
'Referrer-Policy': 'strict-origin-when-cross-origin'
}
})
m.reply(data?.result || '[Hoshino tidak merespons]')
} catch (e) {
m.reply(e.message)
}
}
module.exports = handler