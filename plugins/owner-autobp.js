const moment = require('moment-timezone')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const timeZone = 'Asia/Jakarta'

let configPath = './autobp-config.json'
let config = { enabled: false, lastBackup: 0 }

// Load config kalau ada
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
} catch (e) {}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

async function createBackupZip() {
  const outputPath = path.resolve('./backup-plugins.zip')
  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip')

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(outputPath))
    archive.on('error', err => reject(err))

    archive.pipe(output)
    archive.directory('./plugins/', false)
    archive.finalize()
  })
}

let handler = async (m, { conn, command, args, isOwner }) => {
  if (!isOwner) throw 'Perintah ini hanya untuk owner bot!'

  if (command === 'autobp') {
    if (!args[0]) throw 'Silakan masukkan parameter on/off'

    let setting = args[0].toLowerCase()

    if (setting === 'on') {
      config.enabled = true
      saveConfig()

      try {
        const backupFile = await createBackupZip()
        await conn.sendMessage(global.numberowner + '@s.whatsapp.net', {
          document: fs.readFileSync(backupFile),
          mimetype: 'application/zip',
          fileName: 'backup-plugins.zip'
        })

        m.reply('Auto backup plugins berhasil diaktifkan! Backup akan dilakukan setiap 6 jam sekali.')
      } catch (error) {
        console.error('Error during backup:', error)
        m.reply('Terjadi kesalahan saat melakukan backup!')
      }
    } else if (setting === 'off') {
      config.enabled = false
      saveConfig()
      m.reply('Auto backup plugins telah dinonaktifkan!')
    } else {
      throw 'Parameter tidak valid! Gunakan on/off'
    }
  }
}

async function performAutoBackup(conn) {
  if (!config.enabled) return

  const now = Date.now()
  if (now - config.lastBackup < 6 * 60 * 60 * 1000) return

  try {
    const backupFile = await createBackupZip()
    config.lastBackup = now
    saveConfig()

    await conn.sendMessage(global.numberowner + '@s.whatsapp.net', {
      document: fs.readFileSync(backupFile),
      mimetype: 'application/zip',
      fileName: 'backup-plugins.zip'
    })

    console.log('Auto backup performed successfully:', moment().tz(timeZone).format('YYYY-MM-DD HH:mm:ss'))
  } catch (error) {
    console.error('Error during auto backup:', error)
  }
}

const backupInterval = 6 * 60 * 60 * 1000 // 6 jam

setInterval(() => {
  if (global.conn) performAutoBackup(global.conn)
}, backupInterval)

handler.help = ['autobp on/off']
handler.tags = ['owner']
handler.command = /^autobp$/i
handler.owner = true

module.exports = handler
