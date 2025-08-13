const fetch = require('node-fetch');

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    let url = text.split(' ')[0];

    if (!url) {
        return conn.reply(m.chat, `Gunakan format: ${usedPrefix}${command} <url>`, m);
    }

    // Display status message
    conn.reply(m.chat, 'Sedang mengirim permintaan...', m);

    let downloadUrl = `https://ytdownloader.nvlgroup.my.id/Spotify?url=${url}`;
    let audioRes = await fetch(downloadUrl);
    if (!audioRes.ok) return conn.reply(m.chat, 'Gagal mengunduh audio dari Spotify', m);

    let audioBuffer = await audioRes.buffer();
    let audioSize = audioBuffer.length / (1024 * 1024);

    // Mengirimkan hasil unduhan audio
    if (audioSize > 100) {
        await conn.sendMessage(m.chat, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `audio.mp3`
        });
    } else {
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: "audio/mpeg",
            ptt: true // This sets the audio as a voice note (PTT)
        }, {
            quoted: m
        });
    }

    // Update status to success
    conn.reply(m.chat, 'Permintaan sukses dikirim', m);
}

handler.help = ['spotifydl']
handler.command = ['spotifydl']
handler.tags = ['main']

module.exports = handler;