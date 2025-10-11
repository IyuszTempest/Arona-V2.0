/*Plugins CJS 
Bot Status & Mode
*/
let os = require('os')
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
    let old = performance.now();
    let _uptime = process.uptime() * 1000;
    let uptimex = clockString(_uptime);
    let video = './arona/mode.mp4';
    let modeText = global.opts?.['self'] ? 'Self (Private)' : 'Public';
    let usersCount = Object.keys(global.db?.data?.users || {}).length;
    const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));

    let bannedUsersCount = 0;
    if (global.db?.data?.settings && global.db.data.settings[conn.user.jid]) {
        bannedUsersCount = global.db.data.settings[conn.user.jid].bannedUsers?.length || 0;
    }

    let featuresUsedCount = 0;
    if (global.db?.data?.stats) {
        featuresUsedCount = Object.values(global.db.data.stats).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
    }

    let neww = performance.now();
    let speed = neww - old;

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

    let tio = `Halo Sensei! Ini laporan status Bot saat ini! ✨

╭─「 *INFO BOT* 」
│💠 *Mode:* ${modeText}
│⏰ *Aktif:* ${uptimex}
│⚡ *Kecepatan:* ${speed.toFixed(4)} ms
╰─────────────

╭─「 *STATISTIK* 」
│👥 *Total Pengguna:* ${usersCount}
│💬 *Total Chat:* ${chats.length}
│🏢 *Grup Terdaftar:* ${groupsIn.length}
│🚫 *Pengguna Diblokir:* ${bannedUsersCount}
│⚙️ *Total Perintah:* ${featuresUsedCount}
╰─────────────

╭─「 *SERVER* 」
│💻 *Platform:* ${os.platform()}
│💾 *RAM:* ${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}
│🎛️ *CPU:* ${os.cpus()[0].model.trim()}
╰─────────────

Aku adalah *${global.namebot}*, asisten pribadimu!
Jika tidak ada balasan, mungkin Bot sedang istirahat atau ada pemeliharaan. Mohon bersabar ya! 🙏`.trim();


    try {
        await conn.sendMessage(m.chat, {
            video: { url: video },
            caption: tio,
            gifPlayback: true,
            footer: wm,
            mimetype: 'video/mp4'
        }, { quoted: fkontak });
        
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
