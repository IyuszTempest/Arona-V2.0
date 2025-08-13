/*
📌 Nama Fitur: Play Soundcloud
🏷️ Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029Vaim5GzISTkTPWB4d51d
✍️ Convert By ZenzXD
*/
const fetch = require('node-fetch');
const handler = async (m, { conn, text, command }) => {
if (!text) return m.reply(`Masukkan judul lagu.\nContoh:\n.${command} where we are`);
try {
m.reply('Mencari lagu...');
const search = await fetch(`https://zenz.biz.id/search/SoundCloud?query=${encodeURIComponent(text)}`);
const result = await search.json();
if (!result.status || !result.result || !result.result[0]) {
return m.reply('Lagu tidak ditemukan.');
}
const url = result.result[0].url;
const res = await fetch(`https://zenz.biz.id/downloader/SoundCloud?url=${encodeURIComponent(url)}`);
const json = await res.json();
if (!json.status || !json.audio_url) {
return m.reply('Gagal mengunduh lagu.');
}
await conn.sendMessage(m.chat, {
audio: { url: json.audio_url },
mimetype: 'audio/mpeg',
ptt: false,
fileName: `${json.title}.mp3`,
caption: `Judul: ${json.title}\nAuthor: ${json.author}\nDurasi: ${json.duration}`,
contextInfo: {
externalAdReply: {
title: json.title,
body: json.author,
thumbnailUrl: json.thumbnail,
mediaType: 2,
mediaUrl: json.source_url,
sourceUrl: json.source_url,
renderLargerThumbnail: true,
},
},
}, { quoted: m });
} catch (err) {
console.error(err);
m.reply('Terjadi kesalahan.');
}
};
handler.help = ['scplay <judul>'];
handler.tags = ['downloader','premium'];
handler.command = /^scplay$/i;
handler.premium = true;
module.exports = handler;