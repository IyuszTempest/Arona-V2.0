/*Plugins CJS 
Fake ML
*Sumber:* _https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635_
*/
const { createCanvas, loadImage, registerFont } = require('canvas')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

let handler = async (m, { conn, text }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
        return conn.reply(m.chat, 'Mana gambarnya, masbro? Reply gambar dengan caption!', fkontak);
    }
    
    await conn.reply(m.chat, 'Wait...', fkontak);

    const tmpDir = process.cwd()
    const fontUrl = 'https://cloudkuimages.com/uploads/files/CL8QHRYN.ttf'
    const fontPath = path.join(tmpDir, 'CL8QHRYN.ttf')

    try {
        if (!fs.existsSync(fontPath)) {
            const res = await axios.get(fontUrl, { responseType: 'arraybuffer' })
            fs.writeFileSync(fontPath, Buffer.from(res.data))
        }
        registerFont(fontPath, { family: 'CustomFont' })

        const mediaBuffer = await q.download()
        const userImage = await loadImage(mediaBuffer)
        const bg = await loadImage('https://files.catbox.moe/liplnf.jpg')
        const frameOverlay = await loadImage('https://files.catbox.moe/2vm2lt.png')

        const canvas = createCanvas(bg.width, bg.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

        const avatarSize = 205
        const frameSize = 293
        const centerX = (canvas.width - frameSize) / 2
        const centerY = (canvas.height - frameSize) / 2 - 282
        const avatarX = centerX + (frameSize - avatarSize) / 2
        const avatarY = centerY + (frameSize - avatarSize) / 2 - 3

        const { width, height } = userImage
        const minSide = Math.min(width, height)
        const cropX = (width - minSide) / 2
        const cropY = (height - minSide) / 2
        
        ctx.drawImage(userImage, cropX, cropY, minSide, minSide, avatarX, avatarY, avatarSize, avatarSize)
        ctx.drawImage(frameOverlay, centerX, centerY, frameSize, frameSize)

        const nickname = (text || '').trim() || 'Player'
        const maxFontSize = 36
        const minFontSize = 24
        const maxChar = 11
        let fontSize = maxFontSize
        if (nickname.length > maxChar) {
            const excess = nickname.length - maxChar
            fontSize -= excess * 2
            if (fontSize < minFontSize) fontSize = minFontSize
        }
        
        ctx.font = `${fontSize}px CustomFont`
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(nickname, canvas.width / 2 + 13, centerY + frameSize + 15)

        const buffer = canvas.toBuffer('image/png')
        await conn.sendMessage(m.chat, { image: buffer, caption: 'Done' }, { quoted: fkontak })
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan: ${e.message}`, fkontak);
    }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['maker', 'tools']
handler.command = /^fakeml$/i
handler.limit = true;

module.exports = handler;
