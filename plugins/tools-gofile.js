const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

let handler = async (m, { conn, args, usedPrefix, command }) => { // Tambahkan usedPrefix dan command
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

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  
  if (!mime) {
    return conn.reply(m.chat, `Kirim/reply file yang ingin diupload ke GoFile.io ya, masbro! Contoh: ${usedPrefix + command} (lalu reply file)`, fkontak);
  }
  
  // --- PERBAIKAN DI SINI: Pengecekan fileLength yang lebih aman ---
  // Pastikan q.msg ada dan q.msg.fileLength adalah angka sebelum dibandingkan
  if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 100 * 1024 * 1024) { 
      return conn.reply(m.chat, 'Ukuran file terlalu besar! Maksimal 100 MB ya, masbro.', fkontak);
  }
  // --- AKHIR PERBAIKAN ---

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu
  
  try {
    const media = await q.download(); // Download file ke buffer
    if (!media || media.length === 0) {
        throw new Error('Gagal mengunduh file.');
    }

    const form = new FormData();
    // --- PERBAIKAN DI SINI: Pengecekan fileName yang lebih aman ---
    // Pastikan q.msg ada dan q.msg.fileName ada sebelum diakses
    const fileName = (q.msg && q.msg.fileName) || `file.${mime.split('/')[1] || 'bin'}`; 
    // --- AKHIR PERBAIKAN ---
    form.append('file', media, fileName);
    
    // Gunakan headers yang lebih lengkap jika dibutuhkan oleh GoFile.io
    const headers = {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://gofile.io/'
    };

    const { data } = await axios.post('https://upload.gofile.io/uploadFile', form, { headers });
    
    if (data.status !== 'ok' || !data.data || !data.data.downloadPage) {
        throw new Error(data.error || 'Gagal upload ke GoFile.io. Respons tidak valid.');
    }
    
    await conn.reply(m.chat, `✅ *File berhasil diupload ke GoFile.io!* \n\n🔗 *Link Download:* ${data.data.downloadPage}\n\n_File ini mungkin akan dihapus otomatis jika tidak ada aktivitas download setelah beberapa waktu._`, fkontak);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

  } catch (e) {
    console.error('Error di plugin GoFile.io:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
    await conn.reply(m.chat, `❌ Gagal upload file ke GoFile.io: ${e.message}. Coba lagi nanti ya.`, fkontak);
  }
}

handler.help = ['gofile'];
handler.command = ['gofile']; // Tambah alias command
handler.tags = ['tools'];
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;