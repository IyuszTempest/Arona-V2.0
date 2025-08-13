let handler = async (m, { conn }) => {
	let q = m.quoted ? m.quoted : m
	try {
	let media = await q.download?.()
	await conn.sendFile(m.chat, media, null, '', m)
	} catch (e) {
      m.reply('Media gagal dimuat!')
	}
}

handler.help = ['rvo2']
handler.tags = ['tools']
handler.command = ['readviewonce2', 'read2', 'rvo2', 'liat2', 'readvo2']
handler.premium = false
handler.register = false
handler.fail = null

module.exports = handler