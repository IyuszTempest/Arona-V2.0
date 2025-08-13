const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) return m.reply('Silakan kirim atau reply *media* (foto, video, audio, dokumen) untuk diupload.')

    let media = await q.download()
    let ext = mime.split('/')[1].split(';')[0] || 'bin'
    let file = `./tmpupload.${ext}`
    fs.writeFileSync(file, media)

    let form = new FormData()
    form.append('file', fs.createReadStream(file))

    let { data } = await axios.post('https://fgsi1-restapi.hf.space/api/upload/uploadMediaFire', form, {
      headers: form.getHeaders()
    })

    let d = data.data
    let text = `📁 Nama File : ${d.filename}\n♻️ Ukuran : ${d.size} byte\n🔎 Tipe : ${d.mimetype}\n👤 Uploader : ${d.owner_name}\n🔗 Download : ${d.links.normal_download}`
    await m.reply(text)
    fs.unlinkSync(file)
  } catch (e) {
    m.reply(`Gagal mengupload: ${e.message}`)
  }
}

handler.help = ['upmediafire']
handler.command = ['upmf','upmediafire']
handler.tags = ['tools']

module.exports = handler