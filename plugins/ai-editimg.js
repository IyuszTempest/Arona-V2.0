const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

// --- PENTING: AMANKAN API KEY INI DI ENVIRONMENT VARIABLE! ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'Bearer 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'; // Ganti dengan key lo jika tidak pakai env var (TIDAK DISARANKAN)

async function editImage(imageBuffer, prompt) {
  // OpenAI DALL-E image/edits API biasanya butuh gambar PNG dengan transparansi
  // Pastikan imageBuffer yang masuk adalah PNG atau konversi jika perlu.
  // Jika imageBuffer bukan PNG, ini bisa error.
  const form = new FormData();
  form.append('image', imageBuffer, {
    filename: 'image.png', // OpenAI butuh PNG
    contentType: 'image/png'
  });
  form.append('prompt', prompt);
  form.append('model', 'dall-e-2'); // Model yang disarankan untuk edit adalah dall-e-2
  form.append('n', '1');
  form.append('size', '1024x1024'); // Atau '512x512'

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}` // Menggunakan API Key dari variabel lingkungan
        }
      }
    );

    const base64 = response.data?.data?.[0]?.b64_json;
    if (!base64) {
        throw new Error('Tidak ada respons gambar yang valid dari API OpenAI.');
    }
    return Buffer.from(base64, 'base64');

  } catch (err) {
    console.error('Error in editImage (OpenAI API):', err.message);
    if (err.response && err.response.data) {
        console.error('OpenAI API Error Response:', JSON.stringify(err.response.data));
        throw new Error(`OpenAI API Error: ${err.response.data.error?.message || err.response.data.message || 'Respons tidak valid'}`);
    }
    throw new Error(`Gagal mengedit gambar: ${err.message}`);
  }
}

const handler = async (m, { conn, text, command, usedPrefix }) => { // Tambahkan usedPrefix
  // Definisi fkontak di sini untuk plugin ini
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
      return conn.reply(m.chat, `Kirim atau reply gambar dengan caption\nContoh: *${usedPrefix + command}* ubah jadi anime`, fkontak); // Pakai fkontak
  }
  if (!text) {
      return conn.reply(m.chat, `Mau diubah jadi apa gambarnya, masbro? Berikan promptnya!\nContoh: *${usedPrefix + command}* ubah jadi anime`, fkontak); // Pakai fkontak
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    let img = await q.download(); // Download gambar dari pesan
    if (!img) {
        throw new Error('Gagal mengunduh gambar dari pesan.');
    }

    // OpenAI image/edits biasanya butuh gambar PNG. Jika gambar asli bukan PNG, ini bisa bermasalah.
    // Untuk konversi ke PNG bisa pakai library seperti sharp atau jimp jika diperlukan.
    // Tapi itu akan menambah kompleksitas dan dependencies. Untuk saat ini, asumsikan input PNG.

    let resultBuffer = await editImage(img, text);

    if (!resultBuffer || resultBuffer.length === 0) {
        throw new Error('Tidak ada gambar hasil edit yang diterima.');
    }

    await conn.sendMessage(m.chat, { image: resultBuffer, caption: "✅ Done!" }, { quoted: fkontak }); // Pakai fkontak
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Reaksi sukses

  } catch (err) {
    console.error('Error di plugin Edit Foto AI:', err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi gagal
    await conn.reply(m.chat, `❌ Eror kak: ${err.message}\n\n*Catatan:* OpenAI image edits (DALL-E) membutuhkan gambar PNG (idealnya dengan latar transparan) dan mungkin memakan kredit OpenAI Anda.`, fkontak); // Pakai fkontak
  }
}

handler.help = ['editfoto <prompt>'];
handler.tags = ['ai', 'image', 'premium']; // Tambah tag 'image' dan 'premium'
handler.command = ['editfoto', 'editimg', 'dalleedit']; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = true; // Ini API berbayar, jadi sangat disarankan premium

module.exports = handler;
