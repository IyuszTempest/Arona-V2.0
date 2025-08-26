/*Plugins CJS 
Fitur Brat
*Sumber:* _https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635_
*/

var { 
sticker5 
} = require('../lib/sticker');
var fs = require('fs');

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
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

    let packname = 'Sticker Brat';
    
    text = text || (m.quoted ? m.quoted.text || m.quoted.caption : '');
    
    if (!text) {
        return conn.reply(m.chat, `Teksnya mana woy?\nContoh: *${usedPrefix + command}* Lagi Ruwet`, fkontak);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `https://api.zenzxz.my.id/maker/brat?text=${encodeURIComponent(text.substring(0, 151))}`;
    
    try {
        var stiker = await sticker5(apiUrl, { packname });
        await conn.sendFile(m.chat, stiker, 'brat.webp', '', m);
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ Gagal membuat sticker. Coba lagi nanti.`, fkontak);
    }
};

handler.command = handler.help = ['brat'];
handler.tags = ['sticker'];
handler.limit = true;

module.exports = handler;
