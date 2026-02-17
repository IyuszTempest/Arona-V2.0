const fetch = require('node-fetch'); // Menggunakan require untuk CommonJS

const fbvdl = async (fbUrl) => {
  const fixUrl = (url) => url?.replace(/\\/g, "") || null; // Perbaiki regex escape
  
  if (typeof(fbUrl) !== "string" || !fbUrl.startsWith('http')) throw new Error('URL Facebook tidak valid atau kosong.');
  
  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0",
  };
  
  const response = await fetch(fbUrl, { headers });
  if(!response.ok) throw new Error(`Gagal akses Facebook. Status: ${response.status} ${response.statusText}`);
  
  const html = await response.text();
  
  // Regex untuk mencari URL video SD dan HD
  const m_sd = html.match(/"browser_native_sd_url":"(.+?)",/)?.[1];
  const m_hd = html.match(/"browser_native_hd_url":"(.+?)",/)?.[1];
  // Regex untuk mencari URL audio
  const m_a = html.match(/"mime_type":"audio\\\/mp4","codecs":"mp4a\.40\.5","base_url":"(.+?)",/)?.[1];
  
  const result = {
    sd : fixUrl(m_sd),
    hd : fixUrl(m_hd),
    audio : fixUrl(m_a)
  };
  
  // Periksa apakah setidaknya ada link video SD/HD atau audio
  if (!result.sd && !result.hd && !result.audio) {
      throw new Error('Tidak ada link video atau audio yang ditemukan di halaman Facebook.');
  }

  return result;
};

let handler = async (m, { conn, text, usedPrefix, command }) => { // Ganti 'args' jadi 'text'
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

    try {
        if (!text) return conn.reply(m.chat, `Berikan Link Video Facebook\n\n*Example :* *${usedPrefix + command}* https://www.facebook.com/share/v/15gF9f7TeA/`, fkontak); // Pakai fkontak
        
        // Validasi URL Facebook
        if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
            return conn.reply(m.chat, 'Link yang kamu berikan bukan link Facebook yang valid, masbro.', fkontak); // Pakai fkontak
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu
        
        const { hd, sd, audio } = await fbvdl(text); // Panggil dengan 'text'
        
        let message = `✅ *Video Facebook Ditemukan!*`;
        let videoSent = false;
        let audioSent = false;

        // Prioritaskan HD, jika tidak ada, pakai SD
        if (hd) {
            await conn.sendMessage(m.chat, { video: { url: hd }, caption: `${message}\n\n*Kualitas:* HD` }, { quoted: fkontak }); // Pakai fkontak
            videoSent = true;
        } else if (sd) {
            await conn.sendMessage(m.chat, { video: { url: sd }, caption: `${message}\n\n*Kualitas:* SD` }, { quoted: fkontak }); // Pakai fkontak
            videoSent = true;
        }
        
        if (audio) {
            if (videoSent) { // Tambahkan delay jika video sudah dikirim duluan
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4', fileName: 'facebook_audio.mp3' }, { quoted: fkontak }); // Pakai fkontak
            audioSent = true;
        }
        
        if (!videoSent && !audioSent) {
            throw new Error('Tidak ada link video atau audio yang berhasil diunduh dari Facebook.');
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses
        
    } catch (e) {
        console.error('Error di plugin Facebook Downloader (fbvdl4):', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat mendownload video Facebook: ${e.message}. Coba lagi atau link mungkin tidak valid.`, fkontak); // Pakai fkontak
    }
}

handler.help = ['fb2 <url>'];
handler.command = ['fb2'];
handler.tags = ['downloader'];
handler.limit = true; // Bisa pakai limit
handler.premium = false; // Ganti jadi true jika command premium

module.exports = handler;
