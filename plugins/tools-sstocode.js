/*
* Nama fitur : Image to code (html)
* Type : Plugin CJS
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzzXD
 */

const readFileSync = require('fs')
const WebSocket = require('ws')

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg||q).mimetype||''
  if (!mime.startsWith('image/')) return m.reply(`kirim atau replay gambar dengan command : \n.sstocode`)

  await m.reply('wett')

  try {
    let buffer = await q.download()
    let code = await ss2code(buffer)
    if (!code) return m.reply('gagal dapetin kode dri gambar lu')
    m.reply(code)
  } catch (e) {
    console.error(e)
    m.reply(`Eror kak : ${e?.message||e}`)
  }
}

handler.help = ['sstocode']
handler.tags = ['tools']
handler.command = ['sstocode']
handler.limit = true

module.exports = handler

async function ss2code(imageBuffer) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://screenshot-code.onrender.com/generate-code')
    let finalCode = ''
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        generationType: 'create',
        image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        inputMode: 'image',
        openAiApiKey: null,
        openAiBaseURL: null,
        anthropicApiKey: null,
        screenshotOneApiKey: null,
        isImageGenerationEnabled: true,
        editorTheme: 'cobalt',
        generatedCodeConfig: 'html_tailwind',
        codeGenerationModel: 'gpt-4o-2024-05-13',
        isTermOfServiceAccepted: false
      }))
    })

    ws.on('message', (message) => {
      const response = JSON.parse(message.toString())
      if (response.type === 'setCode') {
        finalCode = response.value
      }
    })

    ws.on('close', () => {
      resolve(finalCode.trim())
    })

    ws.on('error', (error) => {
      reject(new Error(error.message))
    })
  })
}