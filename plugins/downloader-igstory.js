/*Plugins CJS 
Instagram Story Downloader
*Sumber:* _https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635_
*/

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

async function igstory(url) {
    try {
        if (!/^https:\/\/www\.instagram\.com\/stories\/[a-zA-Z0-9_.]+\/?/.test(url)) throw new Error('Invalid ig story url');
        
        const rynn = new FormData();
        rynn.append('url', url);
        const { data: a } = await axios.post('https://savevid.net/api/userverify', rynn, {
            headers: rynn.getHeaders()
        });
        
        const form = new FormData();
        form.append('q', url);
        form.append('t', 'media');
        form.append('lang', 'en');
        form.append('v', 'v2');
        form.append('cftoken', a.token);
        const { data } = await axios.post('https://v3.savevid.net/api/ajaxSearch', form, {
            headers: form.getHeaders()
        });
        const $ = cheerio.load(data.data);
        const stories = [];
    
        $('ul.download-box > li').each((_, rynn) => {
            const dl_url = $(rynn).find('.download-items__btn:not(.dl-thumb) a').attr('href');
            if (dl_url) stories.push(dl_url);
        });
    
        return stories;
    } catch (error) {
        throw new Error(error.message);
    }
}

let handler = async (m, { conn, args }) => {
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

    if (!args[0]) {
        return conn.reply(m.chat, 'Mana link Instagram Story-nya, masbro?\nContoh: .igstory https://www.instagram.com/stories/username/', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const stories = await igstory(args[0]);

        if (stories.length === 0) {
            return conn.reply(m.chat, 'Gagal mengambil story atau tidak ada story yang tersedia.', fkontak);
        }

        for (const url of stories) {
            const isVideo = url.includes('.mp4');
            const messageType = isVideo ? 'video' : 'image';

            await conn.sendMessage(m.chat, {
                [messageType]: { url: url },
                caption: '✅ Story berhasil diunduh.',
                mimetype: isVideo ? 'video/mp4' : 'image/jpeg'
            }, { quoted: fkontak });
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        console.error("Error di plugin igstory:", error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan: ${error.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['igstory <url>'];
handler.command = ['igstory'];
handler.tags = ['downloader'];
handler.limit = true;

module.exports = handler;
