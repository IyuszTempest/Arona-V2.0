/*Plugins CJS 
Menu Utama
*/
const {
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
} = require('@adiwajshing/baileys')

process.env.TZ = 'Asia/Jakarta'
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')

let arrayMenu = [
  'all', 'ai', 'main', 'database', 'sticker', 'advanced', 'xp', 'fun', 'game', 'github', 'group', 'image', 'info', 'internet', 'islam', 'kerang', 'maker', 'news', 'owner', 'voice', 'quotes', 'store', 'stalk', 'shortlink', 'tools', 'anonymous', ''
];

const allTags = {
    'all': 'SEMUA MENU', 
    'ai': 'MENU AI (Gunakan .menuai)',
    'anime': 'MENU WIBU (Gunakan .menuanime)', 
    'main': 'MENU UTAMA',
    'downloader': 'MENU DOWNLOADER (Gunakan .menudownloader)',
    'database': 'MENU DATABASE',
    'rpg': 'MENU RPG (Gunakan .menurpg)', 'rpgG': 'MENU RPG GUILD (Gunakan .menurpg)',
    'sticker': 'MENU CONVERT', 'advanced': 'ADVANCED', 'xp': 'MENU EXP', 'fun': 'MENU FUN',
    'game': 'MENU GAME', 'github': 'MENU GITHUB', 'group': 'MENU GROUP', 'image': 'MENU IMAGE',
    'nsfw': 'MENU NSFW (Gunakan .menunsfw)', 'info': 'MENU INFO', 'internet': 'INTERNET', 'islam': 'MENU ISLAMI',
    'kerang': 'MENU KERANG', 'maker': 'MENU MAKER', 'news': 'MENU NEWS',
    'owner': 'MENU OWNER', 'premium':'MENU PREMIUM (Gunakan .menupremium)', 'voice': 'PENGUBAH SUARA', 'quotes': 'MENU QUOTES',
    'store': 'MENU STORE', 'stalk': 'MENU STALK', 'shortlink': 'SHORT LINK',
    'tools': 'MENU TOOLS (Gunakan .menutools)', 'anonymous': 'ANONYMOUS CHAT', '': 'NO CATEGORY'
};

const defaultMenu = {
    before: `Hai *%name*! ✨
Aku, *${global.namebot}*, siap membantu!
┌───「 👤 *STATUS KAMU* 」
│ ⚜️ *Level:* %level
│ ⚡ *Exp:* %exp
│ 칭 *Role:* %role
│ 👑 *Gelar:* %gelar
│ 🎌 *Status Wibu:* %wibustatus
│ 💖 *Waifu:* %waifu
│ 💙 *Husbu:* %husbu
└──────────────

┌───「 🤖 *INFO BOT* 」
│ 🕒 *Uptime:* %uptime
│ 📆 *Tanggal:* %date
│ ⏰ *Waktu:* %time
└──────────────
Ini daftar perintah yang bisa kamu gunakan.`,
    header: '┌─「 *%category* 」',
    body: '│ 👾 %cmd %islimit %isPremium',
    footer: '└────',
    after: `
${global.wm}`
}; 

let handler = async (m, { conn, usedPrefix: _p, args = [], command }) => {
    try {
        let packageInfo = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
        let { exp, limit, level, role, husbu, waifu } = global.db.data.users[m.sender]
        let { min, xp: userXP, max } = levelling.xpRange(level, global.multiplier)
        let name = `@${m.sender.split`@`[0]}`
        let requestedCategory = args[0] ? args[0].toLowerCase() : '';

        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)

        // --- Logika Gelar & Status Wibu ---
        let gelar = 'Rakyat Jelata';
        const isOwner = global.owner.includes(m.sender.replace('@s.whatsapp.net', ''));
        if (isOwner) {
            gelar = 'Raja Iblis';
        } else if (level >= 500) {
            gelar = 'Raja/Ratu';
        } else if (level >= 250) {
            gelar = 'Grand Duke';
        } else if (level >= 100) {
            gelar = 'Duke';
        } else if (level >= 85) {
            gelar = 'Count';
        } else if (level >= 65) {
            gelar = 'Baron';
        } else if (level >= 50) {
            gelar = 'Kesatria';
        } else if (level >= 15) {
            gelar = 'Pelayan';
        }

        let wibustatus = 'Tidak Wibu';
        if ((husbu && husbu !== 'Belum Di Set') || (waifu && waifu !== 'Belum Di Set')) {
            wibustatus = 'Wibu Sejati';
        }
        // --- Akhir Logika ---



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


        let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
            return {
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                prefix: 'customPrefix' in plugin,
                limit: plugin.limit,
                premium: plugin.premium,
                enabled: !plugin.disabled,
            }
        })
        let replaceVars = { '%': '%', p: _p, uptime, name, date, time, exp, limit, level, role, gelar, wibustatus, waifu: waifu || 'Belum di set', husbu: husbu || 'Belum di set' };

        if (!requestedCategory || requestedCategory === 'all') {
            let menuList = `${defaultMenu.before}\n`;
            menuList += `\n┌─「 🌟 *MENU SPESIAL* 」\n`;
            menuList += `│ • ⭐ *.menupremium*\n`;
            menuList += `│ • 🌸 *.menuanime*\n`;
            menuList += `│ • ⚔️ *.menurpg*\n`;
            menuList += `│ • 🔞 *.menunsfw*\n`;
            menuList += `│ • 🛠️ *.menutools*\n`;
            menuList += `│ • 🤖 *.menuai*\n`;
            menuList += `│ • 📥 *.menudownloader*\n`;
            menuList += `└──────────────\n\n`;
            
            menuList += `┌─「 📚 *MENU LAINNYA* 」\n`;

            for (let tag of arrayMenu) {
                if (tag && tag !== 'all' && tag !== '' && allTags[tag] && !['rpg', 'rpgG', 'nsfw', 'tools', 'sticker', 'ai', 'downloader', 'anime', 'premium'].includes(tag)) {
                    menuList += `│ 📁 *${_p}menu* ${tag}\n`;
                }
            }
            menuList += `╰─────────────\n\n${defaultMenu.after.replace(/<category>/g, 'Semua Menu')}`;

            let textOutput = menuList.replace(new RegExp(`%(${Object.keys(replaceVars).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, key) => '' + replaceVars[key]);
            
            await conn.sendMessage(m.chat, {
                image: { url: "./arona/menu.jpg" },
                caption: textOutput,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: `Daftar Menu ${global.namebot}`,
                        body: `Versi: ${packageInfo.version || 'Unknown'}`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: global.thumbnailutama,
                        sourceUrl: global.gc
                    }
                }
            }, { quoted: fkontak });
            return;
        }

        if (requestedCategory === 'premium') {
            return conn.reply(m.chat, `⭐ Untuk melihat daftar menu premium, gunakan command *${_p}menupremium* ya!`, fkontak);
        }
        if (requestedCategory === 'anime') {
            return conn.reply(m.chat, `🌸 Untuk semua menu anime, sekarang pakai command *${_p}menuanime* ya!`, fkontak);
        }
        if (requestedCategory === 'rpg' || requestedCategory === 'rpgg') {
            return conn.reply(m.chat, `⚔️ Untuk menu RPG, sekarang pakai command *${_p}menurpg* ya!`, fkontak);
        }
        if (requestedCategory === 'nsfw') {
            return conn.reply(m.chat, `Ehem! 🔞 Untuk menu "spesial" itu, ketik *${_p}menunsfw* ya, Sensei.`, fkontak);
        }
        if (requestedCategory === 'tools' || requestedCategory === 'sticker') {
             return conn.reply(m.chat, `🛠️ Untuk menu tools dan stiker, sekarang pakai command *${_p}menutools* ya!`, fkontak);
        }
        if (requestedCategory === 'ai') {
            return conn.reply(m.chat, `🤖 Untuk semua fitur AI, sekarang pakai command *${_p}menuai* ya, Sensei!`, fkontak);
        }
        if (requestedCategory === 'downloader') {
            return conn.reply(m.chat, `📥 Semua command downloader sekarang ada di *${_p}menudownloader* ya!`, fkontak);
        }

        if (!allTags[requestedCategory]) {
            return conn.reply(m.chat, `🤔 Sensei, menu "${requestedCategory}" tidak ada dalam daftar.\nKetik *${_p}menu* untuk melihat semua kategori yang tersedia ya.`, fkontak);
        }

        let menuCategoryContent = defaultMenu.before + '\n\n';
        menuCategoryContent += defaultMenu.header.replace(/%category/g, allTags[requestedCategory]) + '\n';
        let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes(requestedCategory) && menu.help && menu.help[0]);

        if (categoryCommands.length === 0) {
            menuCategoryContent += `│  • (Tidak ada command di kategori ini)\n`;
        } else {
            for (let menu of categoryCommands) {
                for (let cmdName of menu.help) {
                    if (!cmdName) continue;
                    menuCategoryContent += defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmdName : _p + cmdName)
                                             .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                                             .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '') + '\n';
                }
            }
        }
        menuCategoryContent += defaultMenu.footer + '\n';
        menuCategoryContent += '\n' + defaultMenu.after.replace(/<category>/g, allTags[requestedCategory]);

        let textOutputSpecific = menuCategoryContent.replace(new RegExp(`%(${Object.keys(replaceVars).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, key) => '' + replaceVars[key]);
        let imageUrlSpecific = "./arona/menuall.jpg";

        await conn.sendMessage(m.chat, {
            image: { url: imageUrlSpecific },
            caption: textOutputSpecific,
            contextInfo: {
                mentionedJid: [m.sender],
                 externalAdReply: {
                        title: `Menu Kategori: ${allTags[requestedCategory]}`,
                        body: `${global.wm}`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: global.thumbnailutama,
                        sourceUrl: global.gc
                    }
            }
        }, { quoted: fkontak });
        return;

    } catch (e) {
        conn.reply(m.chat, global.eror, fkontak);
        console.error("Error di menu.js:", e);
    }
}

handler.help = ['menu', 'help', 'menuall', '?'];
handler.tags = ['main'];
handler.command = /^(menu|help|menuall|\?)$/i;
handler.exp = 3;

module.exports = handler;

function clockString(ms) {
    if (isNaN(ms)) return '--';
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
