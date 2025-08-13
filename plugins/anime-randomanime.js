let handler = async (m, { conn }) => {
await conn.sendMessage(m.chat, {
image: { url: 'https://pic.re/image' }
}, { quoted: m });
};
handler.help = ['randomanime'];
handler.command = ['randomanime'];
handler.tags = ['anime']
module.exports = handler;