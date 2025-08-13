/*Plugins CJS 
YouTube Video Summarizer
*/
const axios = require('axios');

let handler = async (m, { conn, args }) => {
    // Definisi fkontak dipindahkan ke dalam handler agar 'm' terdefinisi
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                // 'N:Sy;Bot;;;' dan 'FN:y' diganti jadi 'N:Bot;;;' dan 'FN:Bot'
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        if (!args[0]) return m.reply('Mana Linknya?\n\n*Example :* .ytsummary https://youtu.be/dQw4w9WgXcQ')
        let youtubeUrl = args[0]
        if (!youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/)) {
            return m.reply('Link Nya Yang Valid Donk')
        }
        m.reply('Summary...')
        let {
            data
        } = await axios.post('https://gist.ly/youtube-summarizer', JSON.stringify([youtubeUrl]), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/x-component',
                'Content-Type': 'text/plain;charset=UTF-8',
                'next-action': '4a7bcb3b7b0d542f749ed96cf307cefe242c59cd',
                'origin': 'https://gist.ly',
                'referer': 'https://gist.ly/youtube-summarizer'
            }
        })
        let lines = data.trim().split('\n')
        let parsed = {}
        for (let line of lines) {
            let match = line.match(/^(\d+):(.+)$/)
            if (match) {
                parsed[match[1]] = JSON.parse(match[2])
            }
        }
        let slug = parsed["1"]?.data
        let result = await axios.get(`https://gist.ly/youtube-summarizer/${slug}`)
        let html = result.data
        let matches = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"]\)/g)]
        let selectedMarkdown = null
        for (let match of matches) {
            let content = match[1]
            if (content.includes('## ')) {
                selectedMarkdown = content
                break
            }
        }
        let cleaned = selectedMarkdown
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
        let firstHeadingIndex = cleaned.indexOf('## ')
        let article = cleaned.substring(firstHeadingIndex).trim()
        await conn.reply(m.chat, `${article}`, fkontak);
    } catch (e) {
        m.reply(e.message)
    }
}
handler.help = ['ytsummary']
handler.command = ['ytsummary']
handler.tags = ['tools']

module.exports = handler;
