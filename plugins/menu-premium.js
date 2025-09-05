/* Menu Premium Khusus by Gemini
CH: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
*/

const fs = require('fs');

const defaultMenuPremium = {
    before: `
💎 *MENU KHUSUS PREMIUM, %name!* 💎

Terima kasih telah menjadi pengguna premium.
Berikut adalah daftar fitur eksklusif yang bisa Anda nikmati.

◦ *Library:* Baileys
◦ *Function:* Premium Menu Dedicated
┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '⭐ *%category*',
    body: '│  ◦ %cmd',
    footer: '└  ',
    after: `Nikmati keistimewaan sebagai Pengguna Premium!`
};

const premiumCommandCategories = {
    'premium': '⭐ SEMUA FITUR PREMIUM'
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

        let allPremiumCommands = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled && plugin.premium)
            .map(plugin => {
                return {
                    help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                    tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                    prefix: 'customPrefix' in plugin,
                    limit: plugin.limit,
                    premium: plugin.premium,
                };
            });

        let menuContent = defaultMenuPremium.before;
        let commandDisplayed = false;

        for (const tagKey in premiumCommandCategories) {
            const categoryName = premiumCommandCategories[tagKey];
            
            if (allPremiumCommands.length > 0) {
                commandDisplayed = true;
                menuContent += `\n\n${defaultMenuPremium.header.replace(/%category/g, categoryName)}\n`;
                for (let cmdData of allPremiumCommands) {
                    for (let cmdName of cmdData.help) {
                        if (!cmdName) continue;
                        menuContent += defaultMenuPremium.body
                            .replace(/%cmd/g, cmdData.prefix ? cmdName : _p + cmdName)
                            .replace(/%islimit/g, '')
                            .replace(/%isPremium/g, '') + '\n';
                    }
                }
                menuContent += defaultMenuPremium.footer;
            }
        }

        if (!commandDisplayed) {
            menuContent += "\n\nSaat ini belum ada fitur premium yang tersedia. 😥";
        }
        menuContent += `\n\n${defaultMenuPremium.after}`;

        let replacements = { '%': '%', p: _p, uptime, name, date, time, };
        let finalText = menuContent.replace(new RegExp(`%(${Object.keys(replacements).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
            (_, key) => replacements[key]
        );
        
        let mainPremiumImageUrl = "./arona/menuprem.jpg";
        let premiumAdThumbnail = global.thumbnailutama;

        let messageOptions = {
            caption: finalText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "👑 Menu Khusus Premium 👑",
                    body: "Fitur Eksklusif Untuk Kamu!",
                    mediaType: 1, 
                    previewType: "IMAGE",
                    renderLargerThumbnail: true,
                    thumbnailUrl: premiumAdThumbnail, 
                    sourceUrl: global.gc
                }
            }
        };
        
        if (isValidHttpUrl(mainPremiumImageUrl)) {
            messageOptions.image = { url: mainPremiumImageUrl };
        } else if (fs.existsSync(mainPremiumImageUrl)) {
            messageOptions.image = { url: mainPremiumImageUrl };
        } else {
            console.log(`[PremiumMenu] File media utama di '${mainPremiumImageUrl}' tidak ditemukan. Mengirim tanpa gambar utama.`);
        }

        await conn.sendMessage(m.chat, messageOptions, { quoted: m });

    } catch (error) {
        console.error("Error di plugin premium-menu.js:", error);
        m.reply('Waduh, menu premium sedang ada kendala. Coba lagi nanti, ya!');
    }
};

handler.help = ['menupremium', 'premiummenu'];
handler.tags = ['premium'];
handler.command = /^(menupremium|premiummenu)$/i;
handler.premium = false;
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
  return url.protocol === "http:" || url.protocol === "https:";
}
