/*Plugins CJS 
Source Code Info
*/
let handler = async (m, { conn }) => {
    // Definisi fkontak
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

    let ye = `@${m.sender.split`@`[0]}`;
    let esce = `
*✨ Script Bot Arona* ✨

Halo *${ye}*!
Bot ini menggunakan base script *Arona MD V15*, yang dikembangkan oleh *IyuszTempest*. Script ini menggunakan base dari Botcahx!!

_Repository_ utama bisa dicek di sini:
*➤ Repository Arona MD:*
🔗 https://github.com/IyuszTempest/Arona-MD

*➤ Base Original:*
🔗 https://github.com/BOTCAHX/RTXZY-MD

${global.wm}
`.trim();

    await conn.reply(m.chat, esce, fkontak);
};

handler.help = ['sc', 'sourcecode'];
handler.tags = ['info'];
handler.command = /^(sc|sourcecode)$/i;
handler.limit = false;

module.exports = handler;
