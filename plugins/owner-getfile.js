const fs = require('fs')
const path = require('path')

const botRootDir = process.cwd()

let handler = async (m, { usedPrefix, command, text }) => {
    if (!text) {
        throw `Di mana nama file atau path-nya?\n\nContoh:\n${usedPrefix}${command} plugins/menu.js\n${usedPrefix}${command} owner/setprefix\n${usedPrefix}${command} index.js`
    }

    let requestedPath = path.resolve(botRootDir, text)

    if (!requestedPath.startsWith(botRootDir)) {
        throw `Akses ditolak: Kamu tidak bisa mengakses file di luar direktori root bot.`
    }

    let finalPath = requestedPath
    if (!fs.existsSync(finalPath) && !/\.js$/i.test(finalPath)) {
        finalPath += '.js'
    }

    if (!fs.existsSync(finalPath)) {
        return m.reply(`File tidak ditemukan: '${text}'\n\nPastikan path dan nama file benar.`)
    }
    const stats = fs.statSync(finalPath)
    if (stats.isDirectory()) {
        return m.reply(`'${text}' adalah direktori, bukan file. Tolong tentukan path ke sebuah file.`)
    }
    try {
        const fileContent = fs.readFileSync(finalPath, 'utf8')
        m.reply(fileContent)
    } catch (e) {
        console.error(e) 
        m.reply(`Gagal membaca file '${text}': ${e.message}`)
    }
}

handler.help = ['getfile'].map(v => v + ' <filepath>')
handler.tags = ['owner']
handler.command = /^(getfile|get ?file|gf)$/i
handler.owner = true
module.exports = handler
