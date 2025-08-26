const axios = require('axios');

let handler = async (m, { conn, usedPrefix, command }) => {
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

    try {
        await conn.reply(m.chat, 'Sabar, lagi ngambil jadwal bola terbaru...', fkontak);

        const response = await axios.get('https://api.zenzxz.my.id/info/jadwalbola');
        const matches = response.data.data;
        const apiDate = response.data.date;

        if (!matches || matches.length === 0) {
            return conn.reply(m.chat, 'Gak ada jadwal pertandingan hari ini.', fkontak);
        }

        const now = new Date();
        const upcomingMatches = [];

        const convertToWIB = (timeStr) => {
            if (timeStr.toLowerCase() === 'postponed') return null;
            
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (period.toLowerCase() === 'pm' && hours !== 12) {
                hours += 12;
            }
            if (period.toLowerCase() === 'am' && hours === 12) {
                hours = 0;
            }

            const matchDate = new Date(apiDate);
            matchDate.setUTCHours(hours + 4, minutes); 
            return matchDate;
        };

        for (const match of matches) {
            const matchTimeWIB = convertToWIB(match.time);
            if (matchTimeWIB && matchTimeWIB > now) {
                upcomingMatches.push({ ...match, matchTimeWIB });
            }
        }

        if (upcomingMatches.length === 0) {
            return conn.reply(m.chat, 'Semua pertandingan yang dijadwalkan hari ini sudah selesai.', fkontak);
        }
        
        const groupedByLeague = upcomingMatches.reduce((acc, match) => {
            if (!acc[match.liga]) {
                acc[match.liga] = [];
            }
            acc[match.liga].push(match);
            return acc;
        }, {});

        let output = `⚽ *Jadwal Pertandingan Sepak Bola Akan Datang*\n`;
        output += `📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
        output += `_(Semua waktu dalam WIB)_\n\n`;
        output += `================================\n\n`;

        for (const liga in groupedByLeague) {
            output += `🏆 *${liga}*\n`;
            groupedByLeague[liga].forEach(match => {
                const wibTime = match.matchTimeWIB.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
                output += `  🕒 *${wibTime}* - ${match.team1} vs ${match.team2}\n`;
            });
            output += `\n`;
        }

        await conn.reply(m.chat, output.trim(), fkontak);

    } catch (error) {
        console.error("Error fetching jadwal bola:", error);
        await conn.reply(m.chat, 'Gagal ngambil jadwal bola. API-nya mungkin lagi ada masalah.', fkontak);
    }
};

handler.help = ['jadwalbola'];
handler.tags = ['info', 'internet'];
handler.command = ['jadwalbola'];
handler.limit = true;

module.exports = handler;