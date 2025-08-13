const axios = require("axios");
const FormData = require("form-data");
async function Uguu(buffer, filename) {
const form = new FormData();
form.append('files[]', buffer, { filename });
const { data } = await axios.post('https://uguu.se/upload.php', form, {
headers: form.getHeaders(),
});
if (data.files && data.files[0]) {
return data.files[0].url;
} else {
throw new Error('Upload gagal');
}
}
let handler = async (m, { conn, text }) => {
if (!text.includes('|')) return m.reply(`Kirim gambar +\n\nNama|Username|verified(true/false)|Followers|Following|Likes|Bio|dark(true/false)|isFollow(true/false) *Example Use :* .faketiktok Bella Bell|bellabell|true|150000|500|200000|Jangan Lupa Makan Rendang|true|false`);
let q = m.quoted ? m.quoted : m;
let mime = (q.msg || q).mimetype || '';
if (!mime || !mime.startsWith('image/')) throw 'Silakan kirim atau reply *Gambar* untuk foto profil.';
let buffer = await q.download();
let ext = mime.split('/')[1];
let filename = `pp.${ext}`;
let pp = await Uguu(buffer, filename);
let [name, username, verified, followers, following, likes, bio, dark = 'true', isFollow = 'true'] = text.split('|').map(v => v.trim());
if (!name || !username || !followers || !following || !likes || !bio)
return m.reply('Semua Harus Ada Ya');
await conn.sendMessage(m.chat, {
image: {
url: `https://FlowFalcon.dpdns.org/imagecreator/faketiktok?name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&pp=${encodeURIComponent(pp)}&verified=${verified}&followers=${followers}&following=${following}&likes=${likes}&bio=${encodeURIComponent(bio)}&dark=${dark}&isFollow=${isFollow}`
}
}, { quoted: m });
};
handler.help = ['faketiktok','fakett'];
handler.tags = ['tools'];
handler.command = ['faketiktok','fakett'];
module.exports = handler;