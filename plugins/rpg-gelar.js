let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const axios = require("axios")

let handler = async (m, { conn, text, usedPrefix, command }) => {
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
        return conn.reply(m.chat, `Format input salah atau pengguna tidak valid.\n\nContoh:\n• *${usedPrefix + command} @taguser*\n• *${usedPrefix + command} 628xxxxxxxxx*\n• *${usedPrefix + command}* (untuk gelar Anda sendiri)\n• *Reply pesan seseorang* dengan command ini.`, fkontak);
    }

    // Cek apakah user ada di database
    if (typeof global.db.data.users[who] == 'undefined') {
        return conn.reply(m.chat, 'Pengguna tidak ada didalam data base.', fkontak);
    }

    let { level } = global.db.data.users[who];
    let username = conn.getName(who);

    // --- FITUR GELAR KEBANGSAWANAN ALA ANIME ---
    let gelarBangsawan = 'Rakyat Jelata';

    // *** PERBAIKAN DI SINI: Gelar Raja Iblis hanya untuk Owner ***
    // Pastikan global.owner adalah array berisi nomor owner (tanpa '@s.whatsapp.net')
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
    // *** AKHIR PERBAIKAN ***

    let str = `
┌─⊷ *GELAR KEBANGSAWANAN*
👤 • *Username:* ${username} (@${who.split`@`[0]})
👑 • *Gelar:* ${gelarBangsawan}
└──────────────
`.trim()
     let mentionedJid = [who]
 	await conn.reply(m.chat, str, fkontak, { contextInfo: { mentionedJid: conn.parseMention(str) }})
}

handler.help = ['gelar [@user]']
handler.tags = ['info', 'rpg','anime']
handler.command = /^(gelar|gelarku)$/i 
handler.limit = false
handler.register = false
handler.group = true

module.exports = handler;