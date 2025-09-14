const os = require('os')
const axios = require('axios')

let handler = async (m, { conn }) => {
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
      const d = Math.floor(sec / (3600 * 24))
      const h = Math.floor((sec % (3600 * 24)) / 3600)
      const m = Math.floor((sec % 3600) / 60)
      const s = Math.floor(sec % 60)
      return [
        d > 0 ? ${d} hari : '',
        h > 0 ? ${h} jam : '',
        m > 0 ? ${m} menit : '',
        d === 0 && h === 0 ? ${s} detik : ''
      ].filter(v => v).join(' ')
    }

    const publicIP = await axios.get('https://api.ipify.org?format=json')
    const ip = publicIP.data.ip || 'Tidak ditemukan'

    const msg = `
🖥 Informasi VPS & Bot

📆 VPS aktif sejak: ${bootTime.toLocaleString('en-GB')}
⏱ Uptime VPS: ${formatTime(uptimeSec)}
🤖 Runtime Bot: ${formatTime(botUptimeSec)}
🌐 IP ${ip}
🏙 Region: Singapore

🧠 CPU: ${cpuModel}
🔢 Core: ${cpuCores} Core

📦 RAM: ${formatBytes(usedMem)} GB / ${formatBytes(totalMem)} GB
`.trim()

    await conn.reply(m.chat, msg, m)

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil data VPS.')
  }
}

handler.help = ['cekvps']
handler.tags = ['tools']
handler.command = /^cekvps$/i
handler.owner= true;

module.exports = handler
