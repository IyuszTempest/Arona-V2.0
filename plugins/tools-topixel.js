const Jimp = require('jimp')

let handler = async (m, { conn, args }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  
  if (!mime.startsWith('image/')) return m.reply('Mana gambarnya?')

  let pixelSize = parseInt(args[0]) || 32
  if (pixelSize < 8) pixelSize = 8
  if (pixelSize > 1024) pixelSize = 1024
  
  m.reply('Wait...')
  const media = await q.download()
  
  try {
    const image = await Jimp.read(media)
    const small = image.clone().resize(pixelSize, pixelSize, Jimp.RESIZE_NEAREST_NEIGHBOR)
    const pixelated = small.resize(image.bitmap.width, image.bitmap.height, Jimp.RESIZE_NEAREST_NEIGHBOR)
    const buffer = await pixelated.getBufferAsync(Jimp.MIME_JPEG)
    
    let wm = global.wm2;// watermark di caption aja
    await conn.sendMessage(
      m.chat,
      { image: buffer, caption: `Pixelated image (size : ${pixelSize})\n\n${wm}` },
      { quoted: m }
    )
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['topixel <size>']
handler.tags = ['tools']
handler.command = /^(topixel)$/i

module.exports = handler
