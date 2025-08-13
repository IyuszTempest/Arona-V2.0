/*Di conver Arona AI 
ch: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
source: https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z/1913
*/
const axios = require('axios');

let handler = async (m, { text, conn, args }) => {
  if (!text) return m.reply('Masukkan username Pinterest ya!\n\n*Contoh :* .pinstalk pahlawangitarsibocchi');

  try {
    let { data } = await axios.get(`https://www.abella.icu/pinstalk?username=${encodeURIComponent(text)}`);
    if (!data.success) return m.reply('Hmm, gagal ambil datanya. Coba pastiin username-nya bener ya!');

    let res = data.result;
    let caption = `*Pinterest Stalker*\n\n` +
      `• ID : ${res.id}\n` +
      `• Username : ${res.username}\n` +
      `• Nama : ${res.full_name}\n` +
      `• Bio : ${res.bio || '-'}\n` +
      `• Website : ${res.website || '-'}\n` +
      `• Negara : ${res.country || '-'}\n` +
      `• Verified : ${res.is_verified ? 'Iya' : 'Nggak'}\n` +
      `• Total Pin : ${res.stats?.pins || 0}\n` +
      `• Followers : ${res.stats?.followers || 0}\n` +
      `• Following : ${res.stats?.following || 0}\n` +
      `• Boards : ${res.stats?.boards || 0}\n` +
      `• Dibuat : ${res.created_at || '-'}\n\n` +
      `• Link Profile : ${res.profile_url}`;

    await conn.sendMessage(m.chat, { image: { url: res.image.original }, caption }, { quoted: m });
  } catch (e) {
    m.reply('Aduh, ada yang salah nih. Mungkin username-nya nggak ketemu.');
  }
};

handler.help = ['pinstalk'].map(v => v + ' <username>');
handler.command = ['pinstalk'];
handler.tags = ['stalker'];

module.exports = handler;