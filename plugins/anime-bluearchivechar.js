const axios = require('axios');

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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!text) {
        return conn.reply(m.chat, `Masukin nama karakter Blue Archive yang mau dicari!\n\n*Contoh:* ${usedPrefix + command} hoshino`, fkontak);
    }

    try {
        await conn.reply(m.chat, `🔎 Sabar ya sensei, lagi nyari data untuk *${text}*...`, fkontak);

        const charName = encodeURIComponent(text.toLowerCase());
        const { data: response } = await axios.get(`https://iyusztempest.my.id/api/fun?feature=bluearchive&char=${charName}`);

        if (response.status !== 'success' || !response.data) {
            throw new Error(`Karakter "${text}" tidak ditemukan atau terjadi error di API.`);
        }

        const data = response.data;
        
        let output = `*${data.name}*\n;`
        output += `_${data.bio}_\n\n;`
        output += `*🛡 Role:* ${data.role} | *🎯 Posisi:* ${data.position} | *⚔ Tipe:* ${data.type}\n;`
        output += `\n================================\n\n;`
        output += `*👤 Profil Lengkap*\n;`
        output += `  - Nama Keluarga: ${data.profile.familyName}\n`;
        output += `  - Umur: ${data.profile.age}\n`;
        output += `  - Tinggi: ${data.profile.height}\n`;
        output += `  - Sekolah: ${data.profile.school}\n`;
        output += `  - Klub: ${data.profile.club}\n`;
        output += `  - Hobi: ${data.profile.hobby}\n`;
        output += `  - CV: ${data.profile.CV}\n\n`;
        output += `*⚔ Skills*\n;`
        data.skills.forEach(skill => {
            const cleanDesc = skill.description.replace(/{[0-9]}/g, '').replace(/<[^>]*>/g, '');
            output += `  - ${skill.name} (${skill.type})\n`;
            output += `    > ${cleanDesc.trim()}\n\n`;
        });
        output += `*🔫 Senjata: ${data.weapon.name}* (${data.weapon.type})\n;`
        output += `_${data.weapon.desc}_\n\n;`
        if (data.skillprio) {
            output += `*📊 Prioritas Skill & Investasi*\n;`
            output += `  - Prioritas Umum: ${data.skillprio["General Skill Priority"]}\n`;
            output += `  - Rekomendasi Awal: ${data.skillprio["Early to Mid Game investments"]}\n`;
            output += `  - Rekomendasi Akhir: ${data.skillprio["Recommended Investment pre UE40"]}\n`;
            output += `  - Catatan: ${data.skillprio.Notes}\n`;
        }

        await conn.sendMessage(m.chat, {
            text: output.trim(),
            contextInfo: {
                externalAdReply: {
                    title: data.name,
                    body: `${data.role} | ${data.profile.school}`,
                    thumbnailUrl: data.img, 
                    sourceUrl: `https://bluearchive.fandom.com/wiki/${data.name.replace(' ', '_')}`,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: fkontak });

    } catch (error) {
        console.error("Error fetching Blue Archive data:", error);
        await conn.reply(m.chat, error.message || 'Gagal mengambil data. Pastikan nama karakternya bener.', fkontak);
    }
};

handler.help = ['bachar <karakter>'];
handler.tags = ['anime'];
handler.command = ['bachar'];
handler.limit = true;

module.exports = handler;
