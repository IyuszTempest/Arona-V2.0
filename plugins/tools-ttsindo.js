const axios = require('axios'); // Menggunakan require untuk CommonJS

const _tokoh = {
  jokowi: { speed: -30, model: 'id-ID-ArdiNeural-Male', tune: -3 },
  megawati: { speed: -20, model: 'id-ID-GadisNeural-Female', tune: -3 },
  prabowo: { speed: -30, model: 'id-ID-ArdiNeural-Male', tune: -3 },
  gusdur: { speed: -15, model: 'id-ID-ArdiNeural-Male', tune: -2 }
};

let handler = async (m, { conn, text, args, usedPrefix, command }) => { // Tambahkan usedPrefix
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

  const tokoh = args[0]?.toLowerCase();
  const kalimat = args.slice(1).join(' ').trim(); // Trim kalimat juga

  if (!tokoh || !kalimat) {
    let listTokoh = Object.keys(_tokoh).map(v => `> ${v}`).join('\n');
    return conn.reply(m.chat, `*Format salah.* Contoh: *${usedPrefix + command}* jokowi we wok de tok not onli tok de tok\n\n*List Tokoh Tersedia:*\n${listTokoh}`, fkontak); // Pakai fkontak
  }

  if (!Object.keys(_tokoh).includes(tokoh)) {
    let listTokoh = Object.keys(_tokoh).map(v => `> ${v}`).join('\n');
    return conn.reply(m.chat, `Tokoh *${tokoh}* tidak tersedia.\n\n*List Tokoh Tersedia:*\n${listTokoh}`, fkontak); // Pakai fkontak
  }
  
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    const session_hash = Math.random().toString(36).substring(2);
    // Request untuk memulai proses TTS di HF Space
    await axios.post('https://deddy-tts-rvc-tokoh-indonesia.hf.space/queue/join?', {
      data: [
        tokoh,
        _tokoh[tokoh].speed,
        kalimat,
        _tokoh[tokoh].model,
        _tokoh[tokoh].tune,
        'rmvpe', // Parameter default
        0.5, // Parameter default
        0.33 // Parameter default
      ],
      event_data: null,
      fn_index: 0,
      trigger_id: 20, // Ini bisa berubah kalo UI di webnya berubah
      session_hash: session_hash
    });

    let resultAudioUrl;
    let pollingAttempts = 0;
    const maxPollingAttempts = 60; // Maksimal 60 percobaan (60 detik jika interval 1s)
    const pollingInterval = 1000; // Cek setiap 1 detik

    // Polling untuk mendapatkan hasil
    while (!resultAudioUrl && pollingAttempts < maxPollingAttempts) {
      const { data } = await axios.get(`https://deddy-tts-rvc-tokoh-indonesia.hf.space/queue/data?session_hash=${session_hash}`);

      const lines = data.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const d = JSON.parse(line.substring(6));
            if (d.msg === 'process_completed' && d.output?.data?.[2]?.url) {
              resultAudioUrl = d.output.data[2].url;
              break;
            } else if (d.msg === 'process_starts' || d.msg === 'send_data' || d.msg === 'estimation') {
              // Proses masih berjalan atau informasi estimasi
            } else if (d.msg === 'queue_full') {
              throw new Error('Antrean TTS penuh, coba lagi nanti.');
            } else if (d.msg === 'process_failed') {
              throw new Error('Proses TTS gagal di server.');
            }
          } catch (parseError) {
            // console.warn('Warning: Could not parse line data or incomplete data:', parseError.message);
          }
        }
      }
      
      if (!resultAudioUrl) {
        pollingAttempts++;
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
    }

    if (!resultAudioUrl) {
        throw new Error('Timeout: Gagal mendapatkan audio dari TTS.');
    }

    await conn.sendFile(m.chat, resultAudioUrl, 'ttsindo.mp3', `✅ *Berhasil!* Suara ${tokoh} mengatakan: "${kalimat}"`, fkontak, true, { type: "audioMessage", ptt: true }); // Kirim sebagai VN
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

  } catch (e) {
    console.error('Error di plugin TTS Indonesia:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
    await conn.reply(m.chat, `❌ Terjadi kesalahan saat membuat audio: ${e.message}. Coba lagi ya!`, fkontak); // Pakai fkontak
  }
};

handler.help = ['ttsindo <tokoh> <teks>'];
handler.tags = ['tools']; // Tambah tag 'audio'
handler.command = ['ttsindo'];
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;