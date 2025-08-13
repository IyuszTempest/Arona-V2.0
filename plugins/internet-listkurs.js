/*Plugins CJS 
Supported Currency List
sumber: https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/
const fetch = require('node-fetch');

let handler = async (m, { conn, usedPrefix, command }) => {
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    await conn.reply(m.chat, global.wait, fkontak);

    try {
        const apiUrl = `https://api.siputzx.my.id/api/currency/list`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.data) {
            return conn.reply(m.chat, 'Gagal mengambil daftar mata uang.', fkontak);
        }

        const fiatList = data.data.fiat;
        const cryptoList = data.data.crypto;
        
        let message = `*📊 Daftar Mata Uang yang Didukung* 📊\n\n`;
        
        message += `*— Fiat (${fiatList.length}) —*\n`;
        message += `\`\`\`\n${fiatList.join(', ')}\n\`\`\`\n\n`;
        
        message += `*— Crypto (${cryptoList.length}) —*\n`;
        message += `\`\`\`\n${cryptoList.join(', ')}\n\`\`\``;
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['listkurs'];
handler.tags = ['internet', 'tools'];
handler.command = /^(listkurs|listcurrency)$/i;
handler.limit = true;

module.exports = handler;
