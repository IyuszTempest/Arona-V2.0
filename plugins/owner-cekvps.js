const os = require('os')
const axios = require('axios')

let handler = async (m, { conn }) => {
  // Definisi fkontak
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  try {
    const uptimeSec = os.uptime()
    const botUptimeSec = process.uptime()
    const bootTime = new Date(Date.now() - uptimeSec * 1000)

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    const cpus = os.cpus()
    const cpuModel = cpus[0].model
    const cpuCores = cpus.length

    const formatBytes = bytes => (bytes / 1024 / 1024 / 1024).toFixed(2)

    const formatTime = sec => {
  // Kalau waktunya 0 atau kurang, langsung aja kasih 0 detik, biar simpel!
  if (sec <= 0) {
    return '0 detik';
  }

  const d = Math.floor(sec / (3600 * 24));
  const h = Math.floor((sec % (3600 * 24)) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);

  // Kita kumpulin semua bagian waktu yang lebih dari nol
  const parts = [];
  if (d > 0) parts.push(`${d} hari`);
  if (h > 0) parts.push(`${h} jam`);
  if (m > 0) parts.push(`${m} menit`);
  if (s > 0) parts.push(`${s} detik`);

  // Gabungin semua jadi satu string yang keren!
  return parts.join(' ');
};

    const publicIP = await axios.get('https://api.ipify.org?format=json')
    const ip = publicIP.data.ip || 'Tidak ditemukan'

    const msg = `Halo! Ini laporan status VPS yang digunakan bot ini! ✨

╭─「 *INFO SERVER* 」
│ 💻 *Platform:* ${os.platform()}
│ 📆 *Aktif Sejak:* ${bootTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
│ ⏱️ *Uptime VPS:* ${formatTime(uptimeSec)}
│ 🤖 *Runtime Bot:* ${formatTime(botUptimeSec)}
╰─────────────

╭─「 *JARINGAN* 」
│ 🌐 *Alamat IP:* ${ip}
│ 🏙️ *Region:* Singapore
╰─────────────

╭─「 *CPU* 」
│ 🧠 *Model:* ${cpuModel}
│ 🔢 *Total Core:* ${cpuCores} Core
╰─────────────

╭─「 *MEMORI* 」
│ 💾 *RAM Terpakai:* ${formatBytes(usedMem)} GB / ${formatBytes(totalMem)} GB
╰─────────────

Semua sistem berjalan dengan normal!`.trim()

    await conn.reply(m.chat, msg, fkontak)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Waduh, Sensei! Gagal mengambil data VPS.', fkontak)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
}

handler.help = ['cekvps']
handler.tags = ['tools']
handler.command = /^cekvps$/i
handler.owner= true;

module.exports = handler
