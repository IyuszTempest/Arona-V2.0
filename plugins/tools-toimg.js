const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) return m.reply(`🚩 Reply sticker dengan command *${usedPrefix + command}*`);

    let q = m.quoted;
    let mime = q.mimetype || '';

    if (!/webp/.test(mime)) return m.reply(`🚩 Reply sticker dengan command *${usedPrefix + command}*`);

    let media = await q.download();
    let filePath = path.join(__dirname, '../tmp/', `${Date.now()}.webp`);
    let outputPath = filePath.replace('.webp', '.png');

    fs.writeFileSync(filePath, media);

    exec(`ffmpeg -i ${filePath} ${outputPath}`, async (err) => {
        if (err) {
            console.error(err);
            return m.reply("🚩 Gagal mengonversi stiker ke gambar!");
        }

        await conn.sendFile(m.chat, outputPath, 'converted.png', '✨ *Sticker to Image* ✨', m);

        fs.unlinkSync(filePath);
        fs.unlinkSync(outputPath);
    });
};

handler.help = ['toimg'];
handler.tags = ['sticker'];
handler.command = /^toimg$/i;

module.exports = handler;