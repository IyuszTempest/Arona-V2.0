/*
📌 Nama Fitur: Transfermarkt
🏷️ Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029Vaim5GzISTkTPWB4d51d
✍️ Convert By ZenzXD
*/
const fetch = require ('node-fetch')
let handler = async (m, { text, conn }) => {
if (!text) throw 'Masukin nama pemain nya\nContoh: .transfermarkt Ole Romeny'
await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
const res = await fetch(`https://zenz.biz.id/search/transfermarkt?query=${encodeURIComponent(text)}`)
const json = await res.json()
if (!json.status || !json.data) throw 'Data pemain lu gaada wok'
const data = json.data
const caption = `
Nama          : ${data.name}
Nomor Punggung: ${data.shirtNumber}
Tanggal Lahir : ${data.birthdate}
Kebangsaan    : ${data.nationality}
Tinggi        : ${data.height}
Kaki Dominan  : ${data.foot}
Posisi        : ${data.position}
Agen          : ${data.agent}
Kontrak Hingga: ${data.contractUntil}
Market Value  : ${data.marketValue}
Klub          : ${data.club}
Kompetisi     : ${data.league}
`.trim()
await conn.sendFile(m.chat, data.photo, 'photo.jpg', caption, m)
await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}
handler.help = ['transfermarkt <nama pemain>']
handler.tags = ['internet']
handler.command = /^transfermarkt$/i
handler.premium = false
handler.limit = false
module.exports = handler;