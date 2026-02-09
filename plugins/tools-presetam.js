/* Plugin: Preset AM (Alight Motion)
   Source: iyusztempest.my.id
   Feature: Fetch latest aesthetic presets
*/

const fetch = require('node-fetch');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Fast React biar makin sat-set 🗿
    await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

    try {
        const res = await fetch('https://iyusztempest.my.id/api/tools?feature=presetam');
        const json = await res.json();

        if (json.status !== 'success' || !json.data || !json.data.text) {
            return m.reply('Gomen, database presetnya lagi kosong atau API lagi maintenance 😥');
        }

        // --- PROSES PERCANTIK TEKS ---
        let caption = `*–––––『 🎬 𝙿𝚁𝙴𝚂𝙴𝚃 𝙰𝙻𝙸𝙶𝙷𝚃 𝙼𝙾𝚃𝙸𝙾𝙽 』–––––*\n\n`
        caption += `📝 *𝙼𝚎𝚜𝚜𝚊𝚐𝚎:* ${json.message || 'Preset kece buat lu!'}\n`
        caption += `━━━━━━━━━━━━━━━━━━━━\n\n`
        caption += `${json.data.text}\n\n`
        caption += `*© Euphy by IyuszTempest ✨*`

        // Kirim dengan AdReply biar ada thumbnail-nya
        await conn.sendMessage(m.chat, {
            text: caption,
            contextInfo: {
                externalAdReply: {
                    title: 'PRESET AM AESTHETIC',
                    body: 'Klik buat ambil preset terbaru!',
                    thumbnailUrl: global.fallbackthumb, // Lu bisa ganti link gambar AM lu
                    sourceUrl: 'https://iyusztempest.my.id',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply('Waduh, koneksi ke database lagi bermasalah! Coba cek panel Pterodactyl');
    }
}

handler.help = ['presetam']
handler.tags = ['tools']
handler.command = /^(presetam)$/i
handler.limit = true

module.exports = handler;
