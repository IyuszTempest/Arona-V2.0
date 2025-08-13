/* plugins  uhd  type cjs
  tqto kiuur
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029VbB2nGuDZ4LWVu9nlY1h
   ai yang buat bang jadi gak kaku tangan ku coding😹
  */


const axios = require('axios');
const FormData = require('form-data');

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply('Balas gambar dengan caption *hd* untuk meningkatkan kualitasnya.');
    }

    await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

    const imgBuffer = await q.download();

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', imgBuffer, 'uhd.jpg');

    const upload = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    const catboxUrl = upload.data;
    if (!catboxUrl.includes('https://files.catbox.moe')) throw '❌ Gagal upload ke Catbox.';

    const api = `https://api.privatezia.biz.id/api/generator/uhd?url=${encodeURIComponent(catboxUrl)}`;
    const { data } = await axios.get(api, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(data);

    await conn.sendFile(m.chat, buffer, 'uhd.jpg', '✅ Gambar berhasil ditingkatkan ke HD', m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply('❌ Gagal memproses gambar dengan  HD');
  }
};

handler.help = ['uhd'];
handler.tags = ['ai','tools'];
handler.command = /^uhd$/i;

module.exports = handler;