/* Plugins CJS 
   Bot Status & Mode - Euphylia Edition (No Prefix)
*/
let os = require('os')
let { performance } = require('perf_hooks')
let { sizeFormatter } = require('human-readable')
let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn }) => {
    let old = performance.now();
    let _uptime = process.uptime() * 1000;
    let uptimex = clockString(_uptime);
    
    let image = 'https://h.uguu.se/zpGWmmde.jpg'; 
    
    let modeText = global.opts?.['self'] ? 'Self (Private)' : 'Public';
    let usersCount = Object.keys(global.db?.data?.users || {}).length;
    const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));

    let neww = performance.now();
    let speed = (neww - old).toFixed(4);

    const fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        participant: "0@s.whatsapp.net"
    };

    let caption = `*––––––『 ⛩️ 𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚄𝚂 ⛩️ 』––––––*

Hai! ✨
Berikut adalah laporan kondisi sistem *Euphy* saat ini. Semuanya terpantau stabil!

┏━━〔 🤖 *𝙸𝙽𝙵𝙾 𝙱𝙾𝚃* 〕━━┓
┃ 💠 *𝙼𝚘𝚍𝚎:* ${modeText}
┃ 🕒 *𝚄𝚙𝚝𝚒𝚖𝚎:* ${uptimex}
┃ ⚡ *𝚂𝚙𝚎𝚎𝚍:* ${speed} ms
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 📊 *𝚂𝚃𝙰𝚃𝙸𝚂𝚃𝙸𝙺* 〕━━┓
┃ 👥 *𝚄𝚜𝚎𝚛𝚜:* ${usersCount}
┃ 💬 *𝙲𝚑𝚊𝚝𝚜:* ${chats.length}
┃ 🏢 *𝙶𝚛𝚘𝚞𝚙𝚜:* ${groupsIn.length}
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 💻 *𝚂𝙴𝚁𝚅𝙴𝚁* 〕━━┓
┃ 💾 *𝚁𝙰𝙼:* ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}
┃ 🎛️ *𝙲𝙿𝚄:* ${os.cpus()[0].model.trim()}
┗━━━━━━━━━━━━━━━━━┛

Euphy siap melayani segala kebutuhanmu. Semoga hari ini menyenangkan! 🌸`.trim();

    try {
        await conn.sendMessage(m.chat, {
            image: { url: image },
            caption: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `𝙴𝚞𝚙𝚑𝚢𝚕𝚒𝚊 𝙼𝚊𝚐𝚎𝚗𝚝𝚊`,
                    body: `𝙾𝚗𝚕𝚒𝚗𝚎 𝚂𝚝𝚊𝚝𝚞𝚜`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    thumbnailUrl: image,
                    sourceUrl: global.gc
                }
            }
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply("Gomen ne... Ada gangguan saat memuat status sistem.");
    }
};

handler.help = ['mode', 'euphy'];
handler.tags = ['main'];
// customPrefix dibuat agar bot mengenali kata langsung tanpa titik
handler.customPrefix = /^(mode|euphy)$/i; 
handler.command = new RegExp;

module.exports = handler;

function clockString(ms) {
    let h = Math.floor(ms / 3600000) % 24;
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return `${h}j ${m}m ${s}d`;
  }
