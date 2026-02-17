const fetch = require('node-fetch')

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw(`Berikan Text Dan Karakter!\nExample: ${usedPrefix + command} Euphylia|kamu sedang apa?`)    
  try {
    let [ logic, prompt ] = text.split('|')
    m.reply(`Wait...`)
    let res = await fetch(`https://api.botcahx.eu.org/api/search/c-ai?apikey=${btc}&char=${logic}&prompt=${prompt}`)
    let json = await res.json()
    m.reply(json.message)
  } catch (e) {
    throw eror
  }
}

handler.command = handler.help = ['cai']
handler.tags = ['tools']
handler.owner = false
handler.limit = true
handler.group = false
handler.private = false

module.exports = handler
