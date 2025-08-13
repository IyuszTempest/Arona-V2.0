/* Menu AI Khusus by Gemini & Yus
CH: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
*/

const fs = require('fs');

const defaultMenuAi = {
    before: `
🤖 *PUSAT KECERDASAN BUATAN (AI), %name!* 🤖

Selamat datang di pusat komando ${global.namebot}
Tanyakan apa saja, buat gambar, atau gunakan fitur AI canggih lainnya.

◦ *Library:* Baileys
◦ *Function:* AI Menu Dedicated
┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '✨ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `AI siap melayani!\nContoh: %pai Rekomendasi anime seru`
};

const aiCommandCategories = {
    'ai': '🧠 SEMUA FITUR AI'
};

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        let name = `@${m.sender.split('@')[0]}`;
        
        let d = new Date(new Date + 3600000);
        let locale = 'id';
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        let _uptime = process.uptime() * 1000;
        let uptime = clockString(_uptime);

        const targetTags = Object.keys(aiCommandCategories);
        
        let allAiCommands = Object.values(global.plugins)
            .filter(plugin => {
                if (!plugin || plugin.disabled || !plugin.tags) {
                    return false;
                }
                if (Array.isArray(plugin.tags)) {
                    return plugin.tags.some(tag => targetTags.includes(tag));
                }
                if (typeof plugin.tags === 'string') {
                    return targetTags.includes(plugin.tags);
                }
                return false;
            })
            .map(plugin => {
                return {
                    help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                    tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                    prefix: 'customPrefix' in plugin,
                    limit: plugin.limit,
                    premium: plugin.premium,
                };
            });

        let menuContent = defaultMenuAi.before;
        let commandDisplayed = false;

        for (const tagKey in aiCommandCategories) {
            const categoryName = aiCommandCategories[tagKey];
            const commandsInThisCategory = allAiCommands.filter(cmdData => {
                if (!cmdData.tags) return false;
                if (Array.isArray(cmdData.tags)) {
                    return cmdData.tags.includes(tagKey) && cmdData.help[0];
                }
                if (typeof cmdData.tags === 'string') {
                    return cmdData.tags === tagKey && cmdData.help[0];
                }
                return false;
            });

            if (commandsInThisCategory.length > 0) {
                commandDisplayed = true;
                menuContent += `\n\n${defaultMenuAi.header.replace(/%category/g, categoryName)}\n`;
                for (let cmdData of commandsInThisCategory) {
                    for (let cmdName of cmdData.help) {
                        if (!cmdName) continue;
                        menuContent += defaultMenuAi.body
                            .replace(/%cmd/g, cmdData.prefix ? cmdName : _p + cmdName)
                            .replace(/%islimit/g, cmdData.limit ? '(Ⓛ)' : '')
                            .replace(/%isPremium/g, cmdData.premium ? '(Ⓟ)' : '') + '\n';
                    }
                }
                menuContent += defaultMenuAi.footer;
            }
        }

        if (!commandDisplayed) {
            menuContent += "\n\nHmm, sepertinya fitur AI sedang dalam perbaikan atau belum ada. 🤖";
        }
        menuContent += `\n\n${defaultMenuAi.after}`;

        let replacements = { '%': '%', p: _p, uptime, name, date, time, };
        let finalText = menuContent.replace(new RegExp(`%(${Object.keys(replacements).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
            (_, key) => replacements[key]
        );
        
        let mainAiImageUrl = "./arona/menuai.jpg";
        let aiAdThumbnail = global.thumbnailutama;

        let messageOptions = {
            caption: finalText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "✨ Menu Kecerdasan Buatan ✨",
                    body: "Tanyakan Apa Saja, Buat Apa Saja!",
                    mediaType: 1, 
                    previewType: "IMAGE",
                    renderLargerThumbnail: true,
                    thumbnailUrl: aiAdThumbnail, 
                    sourceUrl: global.gc
                }
            }
        };

        if (isValidHttpUrl(mainAiImageUrl)) {
            messageOptions.image = { url: mainAiImageUrl };
        } else if (fs.existsSync(mainAiImageUrl)) {
            messageOptions.image = { url: mainAiImageUrl };
        } else {
            console.log(`[AIMenu] File media utama di '${mainAiImageUrl}' tidak ditemukan. Mengirim tanpa gambar utama.`);
        }

        await conn.sendMessage(m.chat, messageOptions, { quoted: m });

    } catch (error) {
        console.error("Error di plugin ai-menu.js:", error);
        m.reply('Waduh, lagi error nih. Coba lagi nanti ya!');
    }
};

handler.help = ['menuai', 'aimenu', 'ai'];
handler.tags = ['ai'];
handler.command = /^(menuai|aimenu|ai)$/i;
handler.exp = 3;

module.exports = handler;

function clockString(ms) {
    if (isNaN(ms)) return '--';
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https";
}