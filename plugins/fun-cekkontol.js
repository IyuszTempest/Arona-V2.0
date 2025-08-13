let handler = async (m, { conn, command, text }) => {
	
    if (!text) return conn.reply(m.chat, '• *Example :* .cekkontol Bapak Komintod', m)
	
  conn.reply(m.chat, `
╭━━━━°「 *kontolnya ${text}* 」°
┃
┊• Nama : ${text}
┃• kontol : ${pickRandom(['Putih mulus','Putih','Hitam'])}
┊• Jembut : ${pickRandom(['Lebat','Tipis','Gada Jembut', 'Bersih'])}
┃• Status : ${pickRandom(['perjaka','Ga perjaka','Besar','Panjang','Disunat','Blom Disunat'])}
╰═┅═━––––––๑
`.trim(), m)
}
handler.help = ['cekkontol *<name>*']
handler.tags = ['fun']
handler.command = /^cekkontol/i

module.exports = handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}