/*Plugins CJS 
Ping & Server Info (Estetik)
*/
const { totalmem, freemem } = require('os');
const os = require('os');
const util = require('util');
const osu = require('node-os-utils');
const { performance } = require('perf_hooks');
const { sizeFormatter } = require('human-readable');
const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn }) => {
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
        const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
        const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
        const used = process.memoryUsage();
        const cpus = os.cpus().map(cpu => {
            cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
            return cpu;
        });
        const cpu = cpus.reduce(
            (last, cpu, _, { length }) => {
                last.total += cpu.total;
                last.speed += cpu.speed / length;
                last.times.user += cpu.times.user;
                last.times.nice += cpu.times.nice;
                last.times.sys += cpu.times.sys;
                last.times.idle += cpu.times.idle;
                last.times.irq += cpu.times.irq;
                return last;
            }, {
                speed: 0,
                total: 0,
                times: {
                    user: 0,
                    nice: 0,
                    sys: 0,
                    idle: 0,
                    irq: 0,
                },
            }
        );
        let _muptime;
        if (process.send) {
            process.send('uptime');
            _muptime = await new Promise(resolve => {
                process.once('message', resolve);
                setTimeout(resolve, 1000);
            }) * 1000;
        }
        let muptime = clockString(_muptime);
        let old = performance.now();
        let neww = performance.now();
        let speed = neww - old;
        
        const txt = `
*⚡️ Kecepatan Respon:*
${Math.round(neww - old)} ms
${speed} ms

*⏱️ Uptime:*
${muptime}

*📊 Statistik Chat:*
•  Group: *${groupsIn.length}*
•  Personal: *${chats.length - groupsIn.length}*
•  Total: *${chats.length}*

*⚙️ Informasi Server:*
──────────────────
•  *OS:* ${os.platform()}
•  *Platform:* ${os.platform()}
•  *Hostname:* ${os.hostname()}
•  *Model CPU:* ${os.cpus()[0].model.trim()}
•  *Kecepatan CPU:* ${cpu.speed} MHZ
•  *Core CPU:* ${cpus.length}
──────────────────

*📈 Penggunaan Memori:*
•  *RAM:* ${format(totalmem() - freemem())} / ${format(totalmem())}
•  *Free RAM:* ${format(freemem())}

_NodeJS Memory Usage_
\`\`\`
${Object.keys(used)
            .map(
                (key, _, arr) =>
                    `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")}: ${format(
                        used[key]
                    )}`
            )
            .join("\n")}
\`\`\`

`.trim();

        conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: txt,
                contextInfo: {
                    externalAdReply: {
                        title: `${require('os').cpus()[0].model}`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg',
                        sourceUrl: ''
                    }
                },
                mentions: [m.sender]
            }
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['ping', 'speed'];
handler.tags = ['info'];
handler.command = /^(ping|speed|pong|ingfo)$/i;
module.exports = handler;

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, 'D ', h, 'H ', m, 'M ', s, 'S '].map(v => v.toString().padStart(2, 0)).join('');
}
