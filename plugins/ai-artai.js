const handler = async (m, { conn, text }) => {
if (!text) return m.reply('Masukkan Promt.\nExample : artai Cute Girl')
await conn.sendMessage(m.chat, {
image: { url: `https://www.abella.icu/art-ai?q=${encodeURIComponent(text)}` }
}, { quoted: m })
}
handler.help = ['artai']
handler.tags = ['ai','image','premium']
handler.command = ['artai']
handler.premium = true;
module.exports = handler