/*Menu RPG by Gemini Ai
CH: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
*/

const fs = require('fs');

const defaultMenuRpg = {
    before: `
⚔️ *Selamat Datang di Dunia RPG, %name!* ⚔️

Berikut adalah daftar petualangan yang bisa kamu jalani:

◦ *Library:* Baileys
◦ *Function:* RPG Menu Dedicated
┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '✨ *%category*',
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `Ketik command di atas untuk memulai!\nContoh: %pclaimharian`
};

const rpgCategories = {
    'rpg': '🏹 MENU PETUALANGAN RPG',
    'rpgG': '🛡️ MENU GUILD RPG'
    // Tambahkan tag RPG lain jika ada, misal 'rpgShop': '💰 TOKO RPG'
};

let handler = async (m, { conn, usedPrefix }) => {
    try {
        let name = `@${m.sender.split('@')[0]}`;
        
        let d = new Date(new Date + 3600000);
        let locale = 'id';
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        let _uptime = process.uptime() * 1000;
        let uptime = clockString(_uptime);

        let allCommands = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled && plugin.tags && plugin.help)
            .map(plugin => {
                return {
                    help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                    tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
                    prefix: 'customPrefix' in plugin,
                    limit: plugin.limit,
                    premium: plugin.premium,
                };
            });

        let menuContent = defaultMenuRpg.before;
        for (const tag in rpgCategories) {
            const categoryName = rpgCategories[tag];
            const commandsInThisCategory = allCommands.filter(cmd => cmd.tags.includes(tag) && cmd.help[0]);

            if (commandsInThisCategory.length > 0) {
                menuContent += `\n\n${defaultMenuRpg.header.replace(/%category/g, categoryName)}\n`;
                for (let cmdData of commandsInThisCategory) {
                    for (let cmdName of cmdData.help) {
                        if (!cmdName) continue;
                        menuContent += defaultMenuRpg.body
                            .replace(/%cmd/g, cmdData.prefix ? cmdName : usedPrefix + cmdName)
                            .replace(/%islimit/g, cmdData.limit ? '(Ⓛ)' : '')
                            .replace(/%isPremium/g, cmdData.premium ? '(Ⓟ)' : '') + '\n';
                    }
                }
                menuContent += defaultMenuRpg.footer;
            }
        }
        menuContent += `\n\n${defaultMenuRpg.after}`;

        let replacements = {
            '%': '%',
            p: usedPrefix,
            uptime,
            name,
            date,
            time,
        };
        let finalText = menuContent.replace(new RegExp(`%(${Object.keys(replacements).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
            (_, key) => replacements[key]
        );
        
        let mainImageUrlOrPath = "./arona/rpg.jpg";
        let rpgThumbnailForAd = global.thumbnailutama;

        let messageOptions = {
            caption: finalText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "🛡️ Menu Khusus RPG 🛡️",
                    body: "Petualangan Menantimu!",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: rpgThumbnailForAd, 
                    sourceUrl: global.gc
                }
            }
        };

        if (isValidHttpUrl(mainImageUrlOrPath)) {
            messageOptions.image = { url: mainImageUrlOrPath };
        } else if (fs.existsSync(mainImageUrlOrPath)) {
            messageOptions.image = fs.readFileSync(mainImageUrlOrPath);
        } else {
            console.log(`[RPGMenu] File media utama di '${mainImageUrlOrPath}' tidak ditemukan atau bukan URL valid. Mengirim tanpa gambar utama.`);
            delete messageOptions.image;
        }

        /*
         // Contoh penggunaan video lokal sebagai media utama:
         let mainVideoPath = "./video/intro-rpg.mp4";
         if (fs.existsSync(mainVideoPath)) {
             delete messageOptions.image;
             messageOptions.video = fs.readFileSync(mainVideoPath);
             messageOptions.gifPlayback = true;
         } else {
             console.log(`[RPGMenu] File video di '${mainVideoPath}' tidak ditemukan.`);
         }
        */

        await conn.sendMessage(m.chat, messageOptions, { quoted: m });

        /*
        // Opsional: Pengiriman audio terpisah
        let rpgAudioPath = "./audio/theme-rpg.mp3";
         if (fs.existsSync(rpgAudioPath)) {
             await conn.sendFile(m.chat, rpgAudioPath, "audio.mp3", null, m, true, {
                 type: "audioMessage", ptt: true,
             });
        }
        */

    } catch (error) {
        console.error("Error di plugin rpg-menu:", error);
        m.reply('Waduh, menu RPG lagi error, Coba lagi nanti ya!');
    }
};

handler.help = ['menurpg', 'rpg', 'rpglist']; 
handler.tags = ['rpg'];
handler.command = /^(menurpg|rpg|rpglist)$/i;
handler.exp = 5; 

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