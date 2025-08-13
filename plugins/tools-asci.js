const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    // Ambil angka lebar dari argumen
    let width = parseInt(text?.trim());
    if (isNaN(width) || width < 10 || width > 300) width = 100;

    // Ambil gambar dari reply atau caption
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    if (!/image\/(jpe?g|png)/.test(mime)) {
      throw `⚠️ Balas gambar dengan perintah:\n${usedPrefix + command} <width>\nContoh: ${usedPrefix + command} 100`;
    }

    const img = await q.download();
    if (!img) throw `❌ Gagal mengunduh gambar.`;

    // Kirim reaksi ⏳
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const ascii = await img2ascii(img, { width });

    // Kirim file .html saja
    const htmlContent = `<pre style="font-family: monospace; white-space: pre-wrap;">${ascii}</pre>`;
    await conn.sendMessage(m.chat, {
      document: Buffer.from(htmlContent),
      fileName: 'ascii.html',
      mimetype: 'text/html'
    }, { quoted: m });

    // Kirim reaksi ✅
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`❌ Terjadi kesalahan:\n${err.message}`);
  }
};

handler.command = /^ascii$/i;
handler.help = ['ascii <width>'];
handler.tags = ['tools', 'fun'];
handler.limit = true;

module.exports = handler;

// Fungsi konversi
async function img2ascii(buffer, { width = 100, mode = 'mono' } = {}) {
  if (!Buffer.isBuffer(buffer)) throw new Error('Buffer tidak valid');

  const { mime } = await fromBuffer(buffer);
  if (!/image/.test(mime)) throw new Error('File bukan gambar');

  const form = new FormData();
  form.append('art_type', mode);
  form.append('userfile', buffer, `${Date.now()}_ascii.jpg`);
  form.append('width', width.toString());

  const { data: html } = await axios.post('https://www.ascii-art-generator.org/', form, {
    headers: form.getHeaders()
  });

  const match = html.match(/\/FW\/result\.php\?name=[a-f0-9]{32}/);
  if (!match) throw new Error('Gagal mengambil link hasil.');

  const { data: resultPage } = await axios.get('https://www.ascii-art-generator.org' + match[0]);
  const $ = cheerio.load(resultPage);
  const ascii = $('#result-preview-wrap').text().trim();
  if (!ascii) throw new Error('Gagal mengambil hasil ASCII');

  return ascii;
}