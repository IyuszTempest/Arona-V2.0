/* * Plugins CJS - Brat Video Sticker
 * API diganti ke Zenzxz.my.id
 * Menggunakan ffmpeg untuk konversi ke stiker
 */

const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const path = require('path');

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

    let text = args.join(' ') || (m.quoted && m.quoted.text);
    if (!text) {
        return conn.reply(m.chat, `🚩 *Gunakan:* ${usedPrefix + command} teks\n*Contoh:* ${usedPrefix + command} Halo Halo`, fkontak);
    }

    const gifPath = path.join(tmpdir(), `bratvid_${Date.now()}.gif`);
    const webpPath = path.join(tmpdir(), `bratvid_${Date.now()}.webp`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        // --- API DIGANTI KE ZENZXZ.MY.ID ---
        const apiUrl = `https://api.zenzxz.my.id/api/maker/bratvid?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        if (response.status !== 200) throw new Error("🚩 Gagal mendapatkan video dari API Zenz.");

        fs.writeFileSync(gifPath, response.data);

        await new Promise((resolve, reject) => {
            const ffmpegCmd = `ffmpeg -i ${gifPath} -c:v libwebp -filter:v fps=15,scale=512:512:flags=lanczos -loop 0 -an -vsync 0 ${webpPath}`;
            exec(ffmpegCmd, (err) => {
                if (err) {
                    console.error("FFMPEG Error:", err);
                    reject(new Error("Gagal mengkonversi video ke stiker. Pastikan ffmpeg terinstall."));
                } else {
                    resolve();
                }
            });
        });

        await conn.sendMessage(m.chat, {
            sticker: fs.readFileSync(webpPath)
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        conn.reply(m.chat, `🚩 Terjadi kesalahan:\n\n${e.message}`, fkontak);
    } finally {
        if (fs.existsSync(gifPath)) fs.unlinkSync(gifPath);
        if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
    }
}

handler.help = ['bratvid <teks>', 'bratvideo <teks>'];
handler.tags = ['sticker'];
handler.command = /^brat(vid|video)$/i;
handler.limit = true; 

module.exports = handler;
