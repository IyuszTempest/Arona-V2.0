/* All-in-One Menu Euphylia Magenta
   Library: @adiwajshing/baileys
   Style: Clean Japanese & Spaced Category (Most Stable)
*/

process.env.TZ = 'Asia/Jakarta'
let fs = require('fs')
let path = require('path')

const allTags = {
    'ai': '🤖 ‹ 𝙰𝙸 𝙸𝙽𝚃𝙴𝙻𝙻𝙸𝙶𝙴𝙽𝙲𝙴 ›',
    'anime': '🌸 ‹ 𝚆𝙸𝙱𝚄 𝙲𝙾𝚁𝙽𝙴𝚁 ›',
    'downloader': '📥 ‹ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ›',
    'rpg': '⚔️ ‹ 𝚁𝙿𝙶 𝙰𝙳𝚅𝙴𝙽𝚃𝚄𝚁𝙴 ›',
    'nsfw': '🔞 ‹ 𝙳𝙰𝚁𝙺 𝚉𝙾𝙽𝙴 ›',
    'tools': '🛠️ ‹ 𝚃𝙾𝙾𝙻𝚂 ›',
    'premium': '💎 ‹ 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ›',
    'sticker': '🎨 ‹ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 ›',
    'main': '🏠 ‹ 𝙼𝙰𝙸𝙽 𝙼𝙴𝙽𝚄 ›',
    'xp': '⚡ ‹ 𝙻𝙴𝚅𝙴𝙻𝙸𝙽𝙶 ›',
    'fun': '🎲 ‹ 𝙶𝙰𝙼𝙴𝚂 ›',
    'group': '👥 ‹ 𝙶𝚁𝙾𝚄𝙿 ›',
    'owner': '👑 ‹ 𝙾𝚆𝙽𝙴𝚁 ›',
    'internet': '🌐 ‹ 𝚂𝙴𝙰𝚁𝙲𝙷 ›',
    'quotes': '✍️ ‹ 𝚀𝚄𝙾𝚃𝙴𝚂 ›'
};

let handler = async (m, { conn, usedPrefix: _p, args = [] }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "🏮", key: m.key } });

        let user = global.db.data.users[m.sender]
        if (!user) return m.reply('Sistem sedang memuat data, coba lagi...')
        
        let { level = 0, husbu = '', waifu = '' } = user
        let name = `@${m.sender.split`@`[0]}`
        const imageMenu = global.menuimg; // Fixed typo koma

        let gelar = (global.owner.includes(m.sender.replace('@s.whatsapp.net', ''))) ? 'Raja Iblis 👺' : (level >= 100) ? 'Grand Duke 🏰' : (level >= 50) ? 'Kesatria ⚔️' : 'Rakyat Jelata';
        let wibustatus = (husbu && husbu !== 'Belum Di Set') || (waifu && waifu !== 'Belum Di Set') ? 'Wibu Sejati 🎌' : 'Normal 👤';
        let uptime = clockString(process.uptime() * 1000)

        // --- Dashboard Utama ---
        let menuList = `╭━━〔 ⛩️ *𝙴𝚄𝙿𝙷𝚈𝙻𝙸𝙰 𝙼𝙰𝙶𝙴𝙽𝚃𝙰* ⛩️ 〕━━┓\n`
        menuList += `┃ 👤 *𝚄𝚜𝚎𝚛:* ${name}\n`
        menuList += `┃ 👑 *𝙶𝚎𝚕𝚊𝚛:* ${gelar}\n`
        menuList += `┃ 🎌 *𝚂𝚝𝚊𝚝𝚞𝚜:* ${wibustatus}\n`
        menuList += `┃ 🕒 *𝚄𝚙𝚝𝚒𝚖𝚎:* ${uptime}\n`
        menuList += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`
        
        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
            help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
            tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
        }))

        // --- Logika Pengelompokan Kategori ---
        for (let tag in allTags) {
            let categoryCommands = help.filter(m => m.tags.includes(tag)).map(m => {
                return m.help.map(cmd => `  ◦ ⁠✿ ${_p + cmd}`).join('\n')
            }).join('\n')
            
            if (categoryCommands) {
                menuList += `${allTags[tag]}\n${categoryCommands}\n\n`
            }
        }
        
        menuList += `_Total Fitur: ${help.length}_\n${global.wm}`

        // Mengirim pesan gambar yang stabil
        return await conn.sendMessage(m.chat, {
            image: { url: imageMenu },
            caption: menuList,
            contextInfo: { 
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `𝙴𝚞p𝚑𝚢𝚕𝚒𝚊 𝙼𝚊𝚐𝚎𝚗𝚝𝚊 𝙼𝚞𝚕𝚝𝚒𝚍𝚎𝚟𝚒𝚌𝚎`,
                    body: `𝚂𝚢𝚜𝚝𝚎𝚖 𝙾𝚗𝚕𝚒𝚗𝚎 - 𝟸𝟶𝟸𝟼`,
                    mediaType: 1,
                    sourceUrl: global.gc,
                    thumbnailUrl: imageMenu, 
                    renderLargerThumbnail: false 
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('Waduh, sistem menunya nge-crash! Cek log terminal ya')
    }
}

handler.help = ['menu', 'help']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i
module.exports = handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
