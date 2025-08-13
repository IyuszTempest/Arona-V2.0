/*Plugins CJS 
Join Group via Link
*/
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i

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

    let [_, code] = text.match(linkRegex) || []
    if (!code) {
        return conn.reply(m.chat, 'Linknya mana, sensei. Contohnya kayak gini:\nhttps://chat.whatsapp.com/BfN24F7jCqR4N9M0fL4YtG', fkontak);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        let res = await conn.groupAcceptInvite(code)
        await conn.reply(m.chat, `✅ Berhasil join grup!`, fkontak);
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, '❌ Gagal join grup. Mungkin linknya udah kadaluarsa atau botnya udah di dalam grup.', fkontak);
    }
}

handler.help = ['join <chat.whatsapp.com>']
handler.tags = ['tools']
handler.command = /^join$/i
handler.owner = true;

module.exports = handler;
