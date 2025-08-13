/*
* Nama fitur : iqc (Iphone quoted)
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzzXD
 */

const fetch = require('node-fetch')

let handler = async (m, { conn, text }) => {
  if (!text) throw 'gunakan : .iqc jam|batre|pesan\ncontoh : .iqc 18:00|40|hai hai'

  let [time, battery, ...msg] = text.split('|')
  if (!time||!battery||msg.length === 0) throw 'format salahh gunakan :\n.iqc jam|batre|pesan\nContoh:\n.iqc 18:00|40|hai hai'

  await conn.reply(m.chat, 'waitt', m)

  let messageText = encodeURIComponent(msg.join('|').trim())
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=${battery}&carrierName=INDOSAT&messageText=${messageText}&emojiStyle=apple`

  let res = await fetch(url)
  if (!res.ok) throw 'gagal fetch url'

  let buffer = await res.buffer()
  await conn.sendMessage(m.chat, { image: buffer }, { quoted: m })
}

handler.help = ['iqc jam|batre|pesan'];
handler.tags = ['tools'];
handler.command = ['iqc'];

module.exports = handler;