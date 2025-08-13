/* Menu NSFW Khusus by Gemini & Yus
CH: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
*/

const fs = require('fs'); // Untuk cek file gambar/video lokal

// Desain tampilan menu NSFW
const defaultMenuNsfw = {
    before: `
🔞 *PERINGATAN: KONTEN DEWASA!* 🔞

Hai %name! Menu ini khusus untuk kamu yang sudah cukup umur.
Pastikan kamu bijak saat mengaksesnya ya. Jangan disalahgunakan!

◦ *Library:* Baileys
◦ *Function:* NSFW Menu Dedicated
┌  ◦ Uptime : %uptime
│  ◦ Tanggal : %date
│  ◦ Waktu : %time
└  ◦ Prefix Used : *[ %p ]*
`.trimStart(),
    header: '*%category*', // Emoji & judul kategori bisa diganti
    body: '│  ◦ %cmd %islimit %isPremium',
    footer: '└  ',
    after: `Ingat, dosa ditanggung sendiri ya! 😉\nContoh: %phentai`
};

// Kategori untuk command NSFW (biasanya cuma 'nsfw')
// Jika kamu punya sub-kategori (misal 'hentai', 'irl'), kamu bisa tambahkan di sini
// dan pastikan pluginnya punya tag yang sesuai.
// Untuk sekarang, kita fokus semua masuk ke satu kategori utama.
const nsfwCommandCategories = {
    'nsfw': '🔞 KUMPULAN MENU NSFW 🔞'
};

let handler = async (m, { conn, usedPrefix: _p, args, command }) => {
    try {
        let name = `@${m.sender.split('@')[0]}`;
        
        let d = new Date(new Date + 3600000);
        let locale = 'id';
        let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
        let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
        let _uptime = process.uptime() * 1000;
        let uptime = clockString(_uptime);

        // Langkah 1: Kumpulkan SEMUA plugin yang ditandai nsfw: true dan tidak di-disable.
        let allPluginsMarkedNsfw = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled && plugin.nsfw)
            .map(plugin => {
                return {
                    help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                    // 'tags' properti bisa tetap ada jika dibutuhkan untuk logika lain,
                    // tapi untuk filter utama di sini kita hanya pakai plugin.nsfw
                    tags: Array.isArray(plugin.tags) ? plugin.tags : [],
                    prefix: 'customPrefix' in plugin,
                    limit: plugin.limit,
                    premium: plugin.premium,
                };
            });

        let menuContent = defaultMenuNsfw.before;
        let commandDisplayed = false;

        // Karena kita ingin semua plugin yang nsfw:true masuk ke kategori utama,
        // kita akan iterasi nsfwCommandCategories (yang mungkin hanya punya satu entri 'nsfw').
        for (const categoryKey in nsfwCommandCategories) {
            const categoryName = nsfwCommandCategories[categoryKey];
            
            // Ambil semua command dari allPluginsMarkedNsfw yang valid (punya help).
            // Ini mengasumsikan jika categoryKey adalah 'nsfw', semua plugin nsfw masuk sini.
            // Jika kamu punya kategori lain di nsfwCommandCategories seperti 'hentai',
            // maka kamu perlu logika tambahan untuk memfilter berdasarkan plugin.tags.includes(categoryKey)
            // untuk kategori spesifik tersebut.
            let commandsForThisCategory;
            if (categoryKey === 'nsfw') { // Asumsi 'nsfw' adalah kunci untuk kategori utama
                commandsForThisCategory = allPluginsMarkedNsfw.filter(cmdData => cmdData.help && cmdData.help[0]);
            } else {
                // Jika ada kategori lain (misal 'hentai', 'irl') di nsfwCommandCategories,
                // maka plugin tersebut HARUS punya tag yang sesuai dengan categoryKey.
                commandsForThisCategory = allPluginsMarkedNsfw.filter(cmdData => cmdData.tags.includes(categoryKey) && cmdData.help && cmdData.help[0]);
            }


            if (commandsForThisCategory.length > 0) {
                commandDisplayed = true;
                menuContent += `\n\n${defaultMenuNsfw.header.replace(/%category/g, categoryName)}\n`;
                for (let cmdData of commandsForThisCategory) {
                    for (let cmdName of cmdData.help) {
                        if (!cmdName) continue; // Lewati jika nama command kosong
                        menuContent += defaultMenuNsfw.body
                            .replace(/%cmd/g, cmdData.prefix ? cmdName : _p + cmdName)
                            .replace(/%islimit/g, cmdData.limit ? '(Ⓛ)' : '')
                            .replace(/%isPremium/g, cmdData.premium ? '(Ⓟ)' : '') + '\n';
                    }
                }
                menuContent += defaultMenuNsfw.footer;
            }
        }

        if (!commandDisplayed) {
            menuContent += "\n\nYah, sepertinya belum ada command NSFW yang bisa ditampilkan saat ini. Mungkin belum ada yang diaktifkan atau belum ada pluginnya yang cocok.";
        }
        menuContent += `\n\n${defaultMenuNsfw.after}`;

        let replacements = { '%': '%', p: _p, uptime, name, date, time, };
        let finalText = menuContent.replace(new RegExp(`%(${Object.keys(replacements).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
            (_, key) => replacements[key]
        );
        
        // --- Media untuk Menu NSFW ---
        let mainNsfwImageUrl = "./arona/nsfw.jpg"; // GANTI DENGAN PATH GAMBAR UTAMA MENU NSFW LU
        let nsfwAdThumbnail = global.thumbnailutama;

        let messageOptions = {
            caption: finalText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "🔞 MENU KHUSUS DEWASA 🔞",
                    body: "Klik Dengan Risiko Sendiri!",
                    mediaType: 1, 
                    previewType: "IMAGE",
                    renderLargerThumbnail: true,
                    thumbnailUrl: nsfwAdThumbnail, 
                    sourceUrl: global.gc
                }
            }
        };

        if (isValidHttpUrl(mainNsfwImageUrl)) {
            messageOptions.image = { url: mainNsfwImageUrl };
        } else if (fs.existsSync(mainNsfwImageUrl)) {
            messageOptions.image = { url: mainNsfwImageUrl }; 
        } else {
            console.log(`[NSFWMenu] File media utama di '${mainNsfwImageUrl}' tidak ditemukan atau bukan URL valid. Mengirim tanpa gambar utama.`);
        }
        
        await conn.sendMessage(m.chat, messageOptions, { quoted: m });

    } catch (error) {
        console.error("Error di plugin nsfw-menu.js:", error);
        m.reply('Waduh, menu NSFW lagi ada sedikit gangguan teknis nih. Coba lagi nanti, ya!');
    }
};

// --- Definisi Handler ---
handler.help = ['menunsfw'];
handler.tags = ['nsfw'];
handler.command = /^(menunsfw)$/i;
handler.nsfw = true;
handler.owner = false; 
handler.register = true; 
handler.exp = 5; 

module.exports = handler;

// --- Fungsi Helper ---
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
