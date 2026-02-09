/* Profile Plugin (Euphylia Magenta Style)
   Update: Pamer Waifu & Husbu Edition
*/

let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "💖", key: m.key } });

    const fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Profile" },
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        participant: "0@s.whatsapp.net"
    };

    let who = m.isGroup ? (m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender))) : m.sender;

    if (!global.db.data.users[who]) return m.reply('Aduh, user ini belum ada di database aku nih... 😥');

    let pp = 'https://telegra.ph/file/0c09038289a584348602b.jpg'
    try { pp = await conn.profilePictureUrl(who, 'image') } catch (e) { }

    let { name, pasangan, limit, exp, money, bank, lastclaim, premiumDate, premium, registered, regTime, age, level, role, husbu, waifu } = global.db.data.users[who];
    let username = conn.getName(who)
    let { min, xp: currentXP, max } = levelling.xpRange(level, global.multiplier)
    let math = max - currentXP
    let isOwner = global.owner.includes(who.split`@`[0])
    
    let gelar = isOwner ? 'Raja Iblis 👺' : (level >= 100) ? 'Grand Duke 🏰' : (level >= 50) ? 'Kesatria ⚔️' : 'Rakyat Jelata';
    let statusWibu = ((husbu && husbu !== 'Belum Di Set') || (waifu && waifu !== 'Belum Di Set')) ? 'Wibu Sejati 🎌' : 'Normal 👤';

    let str = `
╭━━〔 ⛩️ *𝚄𝚂𝙴𝚁 𝙿𝚁𝙾𝙵𝙸𝙻𝙴* ⛩️ 〕━━┓
┃ 👤 *𝚄𝚜𝚎𝚛:* ${username}
┃ 👑 *𝙶𝚎𝚕𝚊𝚛:* ${gelar}
┃ 🎂 *𝚄𝚖𝚞𝚛:* ${registered ? age : 'Belum Daftar'}
┃ 🏷️ *𝙹𝚘𝚍𝚘𝚑:* ${pasangan ? '@' + pasangan.split('@')[0] : 'Jomblo Akut'}
┗━━━━━━━━━━━━━━━━━━━━┛

╭━━〔 🎌 *𝚆𝙸𝙱𝚄 𝚂𝚃𝙰𝚃𝚄𝚂* 〕━━┓
┃ 🎭 *𝚂𝚝𝚊𝚝𝚞𝚜:* ${statusWibu}
${waifu && waifu !== 'Belum Di Set' ? `┃ 💖 *𝚆𝚊𝚒𝚏𝚞:* ${waifu}\n` : ''}${husbu && husbu !== 'Belum Di Set' ? `┃ 💙 *𝙷𝚞𝚜𝚋𝚞:* ${husbu}\n` : ''}┗━━━━━━━━━━━━━━━━━━━━┛

╭━━〔 ⚡ *𝚂𝚃𝙰𝚃𝙸𝚂𝚃𝙸𝙲𝚂* 〕━━┓
┃ 📊 *𝙻𝚎𝚟𝚎𝚕:* ${level}
┃ 🎖️ *𝚁𝚘𝚕𝚎:* ${role}
┃ 📈 *𝚇𝙿:* ${exp} (${exp - min}/${currentXP})
┃ 💰 *𝙼𝚘𝚗𝚎𝚢:* ${money.toLocaleString()}
┃ 🎟️ *𝙻𝚒𝚖𝚒𝚝:* ${limit}
┗━━━━━━━━━━━━━━━━━━━━┛`.trim()

    await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: str,
        contextInfo: {
            mentionedJid: [who, pasangan].filter(v => v),
            externalAdReply: {
                title: `𝙿𝚁𝙾𝙵𝙸𝙻𝙴: ${username}`,
                body: `𝚂𝚝𝚊𝚝𝚞𝚜: ${statusWibu}`,
                thumbnailUrl: pp,
                sourceUrl: global.gc,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: fkontak })
}

handler.help = ['profile']
handler.tags = ['info', 'tools']
handler.command = /^profile$/i
handler.group = true

module.exports = handler
