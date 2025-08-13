let fs = require('fs')
let path = require('path')
let levelling = require('../lib/levelling')

const defaultMenu = {
    before: `Hai %name 👋

    🗓️ Tanggal: *%date*
    🕰️ Waktu: *%time*
    ⏳ Uptime: *%uptime*
    
    Berikut adalah daftar command untuk kategori Tools:`,
    header: '┌───「 *%category* 」',
    body: '│ ◦ %cmd %islimit %isPremium',
    footer: '└─────────────────✤',
    after: `Powered by ${global.wm}`
};

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        let packageInfo = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
        let { exp, limit, level, role } = global.db.data.users[m.sender]
        let name = `@${m.sender.split`@`[0]}`

        let d = new Date(new Date + 3600000)
        let locale = 'id'
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
        let _uptime = process.uptime() * 1000
        let uptime = clockString(_uptime)

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
        let replaceVars = { '%': '%', p: _p, uptime, name, date, time, exp, limit, level, role };
        
        let menuCategoryContent = defaultMenu.before + '\n\n';
        menuCategoryContent += defaultMenu.header.replace(/%category/g, 'MENU TOOLS') + '\n';
        
        // Filter command khusus untuk 'tools'
        let categoryCommands = help.filter(menu => menu.tags && menu.tags.includes('tools') && menu.help && menu.help[0]);

        if (categoryCommands.length === 0) {
            menuCategoryContent += `│  ◦ (Tidak ada command di kategori ini)\n`;
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
        menuCategoryContent += '\n' + defaultMenu.after.replace(/<category>/g, 'Menu Tools');

        let textOutput = menuCategoryContent.replace(new RegExp(`%(${Object.keys(replaceVars).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, key) => '' + replaceVars[key]);
        let imageUrl = "./arona/menutools.jpg";

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            mimetype: 'image/jpeg',
            caption: textOutput,
            contextInfo: {
                mentionedJid: [m.sender],
                 externalAdReply: {
                        title: `Menu Kategori: MENU TOOLS`,
                        body: global.namebot,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: global.thumbnailutama,
                        sourceUrl: global.gc
                    }
            }
        }, { quoted: m });

    } catch (e) {
        conn.reply(m.chat, 'Waduh, menu tools lagi error nih. Coba lagi nanti ya.', m);
        console.error("Error di menutools.js:", e);
    }
}

handler.help = ['menutools'];
handler.tags = ['main'];
handler.command = /^(menutools)$/i
handler.exp = 3

module.exports = handler

function clockString(ms) {
    if (isNaN(ms)) return '--';
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

