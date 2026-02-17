const axios = require('axios');

async function amdata(url) {
    try {
        const match = url.match(/\/u\/([^\/]+)\/p\/([^\/\?#]+)/);
        if (!match) throw new Error('Invalid Alight Motion share URL. Please provide a valid URL.');
        
        const uid = match[1];
        const pid = match[2];

        const { data } = await axios.post('https://us-central1-alight-creative.cloudfunctions.net/getProjectMetadata', {
            data: {
                uid: uid,
                pid: pid,
                platform: 'android',
                appBuild: 1002592, // Versi appBuild ini mungkin perlu diupdate kalau Alight Motion merilis versi baru.
                acctTestMode: 'normal'
            }
        }, {
            headers: {
                'content-type': 'application/json; charset=utf-8'
            }
        });
        
        // Cek jika ada error dari API Alight Motion
        if (data.error) {
            throw new Error(`Alight Motion API Error: ${data.error.message || 'Unknown error'}`);
        }

        return data.result;

    } catch (error) {
        console.error('Error in amdata function:', error.message);
        throw new Error(`Gagal mengambil data Alight Motion: ${error.message}`);
    }
}

// Handler untuk bot (contoh sederhana)
async function handler(m, { conn, text, command }) {
    if (!text) {
        return conn.reply(m.chat, `kasih aku link share Alight Motion dong!\nContoh: *${command} https://alightcreative.com/am/share/u/RsfkC8TAxpVcTxPTdlFaC7Y9AFq2/p/U4xccZ37om-45162df0719976ec*`, m);
    }

    if (!text.startsWith('https://alightcreative.com/am/share/')) {
        return conn.reply(m.chat, 'Itu bukan link share Alight Motion yang valid. Coba cek lagi deh.', m);
    }

    await conn.reply(m.chat, 'Oke, gw lagi nyari data preset Alight Motionnya nih, sabar ya...', m);

    try {
        const result = await amdata(text);

        if (!result) {
            return conn.reply(m.chat, 'Aduh, data preset Alight Motionnya nggak ketemu atau kosong nih.', m);
        }

        let caption = `✨ *Data Preset Alight Motion*\n\n`;
        caption += `*Judul:* ${result.projectTitle || 'Tidak Diketahui'}\n`;
        caption += `*Deskripsi:* ${result.projectDescription || 'Tidak Ada Deskripsi'}\n`;
        caption += `*Kreator:* ${result.userDisplayName || 'Tidak Diketahui'}\n`;
        caption += `*Diperbarui:* ${new Date(result.updatedAt).toLocaleString('id-ID')}\n`; // Format tanggal ke lokal Indonesia
        caption += `*Share Link:* ${text}\n`;
        caption += `*Download Link (XML/MP):* ${result.projectDownloadUrl || 'Tidak Tersedia'}\n`;
        caption += `*Ukuran File:* ${result.sizeInBytes ? (result.sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'Tidak Diketahui'}\n`;

        // Mengirim thumbnail jika ada
        if (result.thumbnailUrl) {
            await conn.sendFile(m.chat, result.thumbnailUrl, 'thumbnail.jpg', caption, m);
        } else {
            await conn.reply(m.chat, caption, m);
        }

    } catch (e) {
        console.error('Error in handler (alightmotion.js):', e);
        await conn.reply(m.chat, `Aduh, ada error nih pas ngambil data Alight Motion: ${e.message}. Coba lagi nanti atau cek linknya ya`, m);
    }
}

handler.help = ['alightmotion <url>'];
handler.tags = ['downloader'];
handler.command = /^(alightmotion)$/i;

module.exports = handler;
