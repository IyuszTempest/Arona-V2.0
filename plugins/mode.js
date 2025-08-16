/*Plugins CJS 
Bot Status & Mode
*/
let { totalmem, freemem } = require('os')
let os = require('os')
let util = require('util')
let osu = require('node-os-utils')
let { performance } = require('perf_hooks')
let { sizeFormatter } = require('human-readable')
let format = sizeFormatter({
  std: 'JEDEC', // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn, prefix }) => {
    let wm = global.wm;
    let _uptime = process.uptime() * 1000;
    let uptimex = clockString(_uptime);
    let video = './arona/mode.mp4';
    let modeText = global.opts?.['self'] ? 'Self (Private)' : 'Public';
    let usersCount = Object.keys(global.db?.data?.users || {}).length;
    let bannedUsersCount = 0;
    if (global.db?.data?.settings && global.db.data.settings[conn.user.jid]) {
        bannedUsersCount = global.db.data.settings[conn.user.jid].bannedUsers?.length || 0;
    }

    let featuresUsedCount = 0;
    if (global.db?.data?.stats) {
        featuresUsedCount = Object.values(global.db.data.stats).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
    }

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

    let tio = `
╭━━━「 🤖 *STATUS BOT* 🤖 」━━━╮
│
│💠 *Mode Bot:* ${modeText}
│⏱️ *Aktif Selama:* ${uptimex}
│👥 *Total Pengguna:* ${usersCount} Pengguna
│🚫 *Diblokir:* ${bannedUsersCount} Pengguna
│⚙️ *Total Perintah Dicoba:* ${featuresUsedCount} Perintah
│
├─◈「 ✨ *INFO* ✨ 」◈─
│ Aku adalah ${global.namebot}, asisten pribadimu!
│ Jika tidak ada balasan dalam beberapa saat,
│ kemungkinan bot sedang istirahat atau
│ ada pemeliharaan. Mohon bersabar ya! 🙏
│
╰━━━━「 ${wm} 」━━━━╯
    `.trim();

    let vn = "./arona/mode.mp3";

    try {
        await conn.sendMessage(m.chat, {
            video: { url: video },
            caption: tio,
            gifPlayback: true,
            footer: wm,
            mimetype: 'video/mp4'
        }, { quoted: fkontak });

        if (require('fs').existsSync(vn)) {
            // Mengirim audio sebagai voice note murni tanpa thumbnail
            await conn.sendMessage(m.chat, {
                audio: { url: vn },
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: fkontak });
        } else {
            console.log(`File audio tidak ditemukan di path: ${vn}`);
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error saat mengirim pesan mode:", e);
        conn.reply(m.chat, "Waduh, ada masalah pas mau nampilin status bot. Coba lagi nanti ya.", fkontak);
    }
};

handler.help = ['mode','arona'];
handler.tags = ['main'];
handler.customPrefix = /^(mode|arona)$/i;
handler.command = new RegExp;
handler.limit = false;

module.exports = handler;

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`;
}
