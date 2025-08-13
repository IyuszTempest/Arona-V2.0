let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const axios = require("axios")

let handler = async (m, { conn, text, usedPrefix, command }) => { // isOwner tidak diperlukan di sini
	const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

	function no(number){
        return number.replace(/\s/g,'').replace(/([@+-])/g,'')
    }

	text = no(text)

    let who; 
    
    if (m.isGroup) {
        if (m.mentionedJid && m.mentionedJid[0]) { 
            who = m.mentionedJid[0];
        } else if (m.quoted?.sender) { 
            who = m.quoted.sender;
        } else if (text && text.match(/\d{5,15}/)) { 
            who = text.match(/\d+/)[0] + '@s.whatsapp.net';
            if (!who.startsWith('62')) { 
                return conn.reply(m.chat, 'Hanya bisa mengecek nomor Indonesia ya masbro. (Dimulai dengan 62)', fkontak);
            }
        } else { 
            who = m.sender;
        }
    } else { 
        who = m.sender;
    }

    if (!who || !who.endsWith('@s.whatsapp.net')) {
        return conn.reply(m.chat, `Format input salah atau pengguna tidak valid.\n\nContoh:\n• *${usedPrefix}profile @taguser*\n• *${usedPrefix}profile 628xxxxxxxxx*\n• *${usedPrefix}profile* (untuk profil Anda sendiri)\n• *Reply pesan seseorang* dengan command ini.`, fkontak);
    }

    let pp = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU'
    try {
        pp = await conn.profilePictureUrl(who, 'image')
    } catch (e) { }

    if (typeof global.db.data.users[who] == 'undefined') {
        return conn.reply(m.chat, 'Pengguna tidak ada didalam data base.', fkontak);
    }

	let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
    let participants = m.isGroup ? groupMetadata.participants : []
	let number = who.split('@')[0]
	let about = (await conn.fetchStatus(who).catch(console.error) || {}).status || 'Tidak ada info di About.'
    
    let { 
        name, 
        pasangan, 
        limit, 
        exp, 
        money, 
        bank, 
        lastclaim, 
        premiumDate, 
        premium, 
        registered, 
        regTime, 
        age, 
        level, 
        role,
        husbu, 
        waifu 
    } = global.db.data.users[who];

    let now = new Date() * 1
    let { min, xp: currentXP, max } = levelling.xpRange(level, global.multiplier)
    let username = conn.getName(who)
    let math = max - currentXP;
	let sn = createHash('md5').update(m.sender).digest('hex')
    let prem = global.prems.includes(who.split`@`[0])
    let jodoh = pasangan ? `Berpacaran @${pasangan.split`@`[0]}` : 'Jomblo';

    // --- FITUR GELAR KEBANGSAWANAN ALA ANIME ---
    let gelarBangsawan = 'Rakyat Jelata';

    // Pengecekan owner yang akurat
    const isTargetOwner = global.owner.includes(who.replace('@s.whatsapp.net', ''));

    if (isTargetOwner) { 
        gelarBangsawan = 'Raja Iblis';
    } else if (level >= 500) { 
        gelarBangsawan = 'Raja/Ratu';
    } else if (level >= 250) {
        gelarBangsawan = 'Grand Duke';
    } else if (level >= 100) {
        gelarBangsawan = 'Duke';
    } else if (level >= 85) {
        gelarBangsawan = 'Count';
    } else if (level >= 65) {
        gelarBangsawan = 'Baron';
    } else if (level >= 50) {
        gelarBangsawan = 'Kesatria';
    } else if (level >= 15) {
        gelarBangsawan = 'Pelayan';
    } else { 
        gelarBangsawan = 'Rakyat Jelata';
    }
    // --- AKHIR FITUR GELAR KEBANGSAWANAN ---

    // --- FITUR STATUS WIBU ---
    let statusWibu = 'Tidak Wibu';
    if ((husbu && husbu !== 'Belum Di Set') || (waifu && waifu !== 'Belum Di Set')) {
        statusWibu = 'Wibu Sejati';
    }
    // --- AKHIR FITUR STATUS WIBU ---


    let str = `
┌─⊷ *PROFILE*
👤 • *Username:* ${username} ${registered ? '(' + name + ') ': ''}(@${who.split`@`[0]})
👥 • *About:* ${about}
🏷 • *Status:* ${jodoh}
📞 • *Number:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
🔢 • *Serial Number:* ${sn}
🔗 • *Link:* https://wa.me/${who.split`@`[0]}
👥 • *Umur:* ${registered ? age : 'Belum Terdaftar'}
└──────────────

┌─⊷ *GELAR KEBANGSAWANAN*
👑 • *Gelar:* ${gelarBangsawan}
└──────────────

┌─⊷ *STATUS WIBU*
🎌 • *Status:* ${statusWibu}
${waifu && waifu !== 'Belum Di Set' ? `💖 • *Waifu:* ${waifu}\n` : ''}
${husbu && husbu !== 'Belum Di Set' ? `💙 • *Husbu:* ${husbu}\n` : ''}
└──────────────

┌─⊷ *PROFILE RPG*
▢ XP: TOTAL ${exp} (${exp - min} / ${currentXP}) [${math <= 0 ? `Siap untuk *${usedPrefix}levelup*` : `${math} XP lagi untuk levelup`}]
▢ Level: ${level}
▢ Role: *${role}*
▢ Limit: ${limit}
▢ Money: ${money}
▢ Bank: ${bank || 0}
└──────────────

┌─⊷ *STATUS*
📑 • *Registered:* ${registered ? 'Yes (' + new Date(regTime).toLocaleString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) + ')': 'No'}
🌟 • *Premium:* ${premium ? 'Yes' : 'No'}
⏰ • *PremiumTime:* ${(premiumDate - now) > 1 ? msToDate(premiumDate - now) : '*Tidak diatur expired premium!*'}
${lastclaim > 0 ? '🗓️ *Terakhir Klaim:* ' + new Date(lastclaim).toLocaleString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}) : ''}
└──────────────
`.trim()
     let mentionedJid = [who]
 	await conn.sendFile(m.chat, pp, 'profile.jpg', str, fkontak, false, { contextInfo: { mentionedJid: conn.parseMention(str) }})
}

handler.help = ['profile [@user]']
handler.tags = ['info']
handler.command = /^profile$/i
handler.limit = false
handler.register = false
handler.group = true

module.exports = handler;

function msToDate(ms) {
		temp = ms
		days = Math.floor(ms / (24*60*60*1000));
		daysms = ms % (24*60*60*1000);
		hours = Math.floor((daysms)/(60*60*1000));
		hoursms = ms % (60*60*1000);
		minutes = Math.floor((hoursms)/(60*1000));
		minutesms = ms % (60*1000);
		sec = Math.floor((minutesms)/(1000));
		return days+" Hari "+hours+" Jam "+ minutes + " Menit";
  }