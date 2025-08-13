const axios = require('axios');
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`Contoh penggunaan:
${usedPrefix + command} cewek anime imut di taman`);
const payload = {
prompt: text,
seed: 0,
num_images: 1,
aspect_ratio: 'IMAGE_ASPECT_RATIO_SQUARE',
model: 'uncen'
};
const headers = {
'Accept': '*/*',
'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
'Content-Type': 'application/json',
'Sec-CH-UA': '"Chromium";v="137", "Not/A)Brand";v="24"',
'Sec-CH-UA-Mobile': '?1',
'Sec-CH-UA-Platform': '"Android"',
'Sec-Fetch-Dest': 'empty',
'Sec-Fetch-Mode': 'cors',
'Sec-Fetch-Site': 'same-origin',
'Referer': 'https://chat.infip.pro/'
};
try {
const response = await axios.post('https://chat.infip.pro/api/generate', payload, { headers });
const data = response.data;
if (data.success && Array.isArray(data.image_urls)) {
let url = data.image_urls[0];
await conn.sendMessage(m.chat, { image: { url }, caption: `Hasil gambar untuk:
*${text}*` }, { quoted: m });
} else {
m.reply('Gagal menghasilkan gambar. Coba lagi nanti.');
}
} catch (error) {
console.error(error);
m.reply('Terjadi kesalahan saat mengakses API.');
}
};
handler.help = ['infip <prompt>'];
handler.tags = ['ai', 'image','premium'];
handler.command = /^infip$/i;
handler.premium = true;
module.exports = handler;