let handler = async (m, { conn, text }) => {
	if(!text) return m.reply(`Contoh penggunaan:\n\n.fp menu`)
    let found = []

   try {
    for (let nazz in plugins) {
        let plug = plugins[nazz];
        if (plug == undefined) continue
        if (Array.isArray(plug.command)) {
            if (plug.command.includes(text)) {
                found.push(nazz) 
            }
        } else if (typeof plug.command === 'object') {
            if (plug.command.test(text)) {
                found.push(nazz) 
            }
        } else if (typeof plug.command === 'string') {
            if (plug.command === text) {
                found.push(nazz) 
            } 
        } else continue
        }
       } catch (e) {
       	m.reply(e.message) 
       }
    
  m.reply((found.length) ? `plug dengan command "${text}" di temukan! \n\n${found.map(v => `*${v}*`).join("\n")}`:`plug dengan command "${text}" tidak di temukan!`)
}

handler.command = /^fp|findplug|findplugin$/i
handler.help = "fp <commands name>"
handler.tags = "owner"
handler.owner = true

module.exports = handler