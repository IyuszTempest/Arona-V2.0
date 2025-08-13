/*Plugins CJS
Zonerai Image 
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
const FormData = require('form-data');
const https = require('https');
const reso = {
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
  square: { width: 1024, height: 1024 },
  ultra: { width: 1536, height: 1536 },
  tall: { width: 832, height: 1344 },
  wide: { width: 1344, height: 832 },
};
async function Txt2IMG(prompt, resolusi, upscale = 2) {
  const selected = reso[resolusi] || reso.portrait;
  const { width, height } = selected;
  const promises = Array.from({ length: 3 }, (_, idx) => {
    const form = new FormData();
    form.append('Prompt', prompt);
    form.append('Language', 'eng_Latn'); // Bahasa default
    form.append('Size', `${width}x${height}`);
    form.append('Upscale', upscale.toString());
    form.append('Batch_Index', idx.toString());
    const agent = new https.Agent({ rejectUnauthorized: false });
    return axios.post(
      'https://api.zonerai.com/zoner-ai/txt2img',
      form,
      {
        httpsAgent: agent,
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://zonerai.com/',
          'Origin': 'https://zonerai.com/',
          'Accept': 'application/json, text/plain, */*',
        },
        timeout: 60000
      }
    );
  });
  try {
    const responses = await Promise.all(promises);
    const imageUrls = [];
    for (const res of responses) {
      if (res.data && res.data.success && res.data.url) {
        imageUrls.push(res.data.url);
      } else {
        console.warn(`Zoner AI: Respon batch gagal: ${JSON.stringify(res.data)}`);
      }
    }
    if (imageUrls.length === 0) {
      throw new Error('Tidak ada gambar yang berhasil digenerate dari Zoner AI.');
    }
    return imageUrls;
  } catch (error) {
    console.error('Error in Txt2IMG (Zoner AI):', error.message);
    if (error.response && error.response.data) {
        console.error('Zoner AI Response Error:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal membuat gambar AI: ${error.message}`);
  }
}


let handler = async (m, { conn, text, usedPrefix, command }) => {
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
    const availableReso = Object.keys(reso);
    if (!text) {
        return conn.reply(m.chat, `Mau buat gambar AI apa, masbro? Contoh: *${usedPrefix + command}* a cat playing guitar\n\n` +
                          `Format: *${usedPrefix + command}* <prompt>|[resolusi]\n` +
                          `*Resolusi Tersedia:* ${availableReso.join(', ')} (default: portrait)\n\n` +
                          `*Contoh:* \n` +
                          `  *${usedPrefix + command}* a futuristic city|landscape\n` +
                          `  *${usedPrefix + command}* cute anime girl|square`, fkontak);
    }

    const args = text.split('|').map(s => s.trim());
    const prompt = args[0];
    const resolusi = args[1] ? args[1].toLowerCase() : 'portrait';

    if (!prompt) {
        return conn.reply(m.chat, 'Prompt tidak boleh kosong, masbro!', fkontak);
    }
    if (!availableReso.includes(resolusi)) {
        return conn.reply(m.chat, `Resolusi *${resolusi}* tidak valid. Pilih salah satu: ${availableReso.join(', ')}`, fkontak);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const imageUrls = await Txt2IMG(prompt, resolusi);
        if (!imageUrls || imageUrls.length === 0) {
            throw new Error('Tidak ada gambar yang dihasilkan oleh AI.');
        }
        let sentCount = 0;
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            if (url) {
                 await conn.sendMessage(m.chat, {
                    image: { url: url },
                    caption: `✅ *Zoner AI Image Generated!* (Batch ${i + 1}/${imageUrls.length})\n\n*Prompt:* ${prompt}\n*Resolusi:* ${resolusi}\n\n_Sumber: zonerai.com_`,
                 }, { quoted: fkontak });
                 sentCount++;
                 await delay(1000);
            }
        }
        
        if (sentCount === 0) {
            throw new Error('Semua gambar gagal dikirim.');
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Zoner AI Text to Image:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat membuat gambar AI: ${e.message}. Coba lagi nanti ya.`, fkontak);
    }
};

handler.help = ['zoneraiimg <prompt>|[resolusi]'];
handler.tags = ['ai', 'image'];
handler.command = /^(zoneraiimg|zonerimg)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;