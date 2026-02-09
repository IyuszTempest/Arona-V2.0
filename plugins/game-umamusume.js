/**
 * Modified by Gemini for Yus (IyuszTempest)
 * Feature: Weather System & Performance Variance
 */

const horseNames = [
    "Special Week", "Silence Suzuka", "Tokai Teio", "Mejiro McQueen",
    "Gold Ship", "Daiwa Scarlet", "Vodka", "Grass Wonder", "T.M. Opera O"
];

const weathers = [
    { name: "Cerah ☀️", multiplier: 1.2 },
    { name: "Mendung ☁️", multiplier: 1.0 },
    { name: "Hujan 🌧️", multiplier: 0.8 },
    { name: "Badai ⛈️", multiplier: 0.5 }
];

function startRace(betHorses = []) {
    const weather = weathers[Math.floor(Math.random() * weathers.length)];
    const randomRange = (min, max) => Math.random() * (max - min) + min;
    
    const results = horseNames.map(name => {
        const speed = randomRange(80, 100);
        const stamina = randomRange(75, 100);
        const motivation = randomRange(0.8, 1.2); // Mood kuda
        // Inovasi: Cuaca mempengaruhi performa akhir
        const performance = ((speed * 0.6) + (stamina * 0.4)) * motivation * weather.multiplier;

        return { horse: name, performance };
    });

    results.sort((a, b) => b.performance - a.performance);

    const output = results.map((r, index) => ({
        horse: r.horse,
        win: index === 0,
        finished: index + 1,
        bet: betHorses.includes(r.horse)
    }));

    const winnerHorse = output.find(h => h.win).horse;
    const betWin = betHorses.includes(winnerHorse);

    return { output, weather, betWin };
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const fkontak = {
        key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "UmaMusume" },
        message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Euphy;;;\nFN:Euphy\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } },
        participant: "0@s.whatsapp.net"
    };

    let user = global.db.data.users[m.sender];
    const horseList = horseNames.map((name, index) => `┃ ${index + 1}. ${name}`).join('\n');
    
    const usage = `╭━━〔 ⛩️ *𝚄𝙼𝙰 𝙼𝚄𝚂𝚄𝙼𝙴 𝚁𝙰𝙲𝙴* ⛩️ 〕━━┓
┃
┃ *Cara bermain:*
┃ ${usedPrefix + command} <taruhan> <nomor>
┃
┃ *Contoh:*
┃ ${usedPrefix + command} 5000 1
┃
┣━━〔 🐎 *𝙳𝙰𝙵𝚃𝙰𝚁 𝙺𝚄𝙳𝙰* 〕━━┓
${horseList}
┗━━━━━━━━━━━━━━━━━━━━┛`;

    if (!text) return conn.reply(m.chat, usage, fkontak);

    const args = text.trim().split(/\s+/);
    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) return conn.reply(m.chat, `⚠️ Jumlah taruhan harus angka!`, fkontak);
    if (user.money < betAmount) return conn.reply(m.chat, `❌ Uangmu kurang, Saldomu cuma: ${user.money.toLocaleString()}`, fkontak);

    const horseNumbers = args.slice(1).map(n => parseInt(n));
    if (horseNumbers.length === 0 || horseNumbers.length > 3) return conn.reply(m.chat, `⚠️ Pilih 1-3 nomor kuda!`, fkontak);

    const betHorses = [];
    for (const num of horseNumbers) {
        if (!isNaN(num) && num >= 1 && num <= horseNames.length) {
            betHorses.push(horseNames[num - 1]);
        }
    }

    if (betHorses.length === 0) return conn.reply(m.chat, `⚠️ Nomor kuda tidak valid!`, fkontak);

    user.money -= betAmount;

    const { output, weather, betWin } = startRace(betHorses);

    let startMsg = `🏇 *BALAPAN DIMULAI!* 🏇\n\n`
    startMsg += `🏟️ *Arena:* Nakayama Racecourse\n`
    startMsg += `🌦️ *Cuaca:* ${weather.name}\n`
    startMsg += `💰 *Taruhan:* ${betAmount.toLocaleString()}\n`
    startMsg += `🐎 *Jagoan:* ${betHorses.join(', ')}\n\n`
    startMsg += `_Para Uma Musume mulai memasuki gate..._`

    await conn.reply(m.chat, startMsg, fkontak);

    // Simulasi Delay biar seru
    await new Promise(resolve => setTimeout(resolve, 4000));
    await conn.reply(m.chat, `🏁 *GATE TERBUKA!* Mereka melesat dengan kecepatan tinggi!`, m);
    await new Promise(resolve => setTimeout(resolve, 4000));

    let resultText = `🏁 *HASIL BALAPAN* 🏁\n`
    resultText += `Cuaca: ${weather.name}\n\n`
    
    output.slice(0, 5).forEach(r => {
        const medal = r.finished === 1 ? '🥇' : r.finished === 2 ? '🥈' : r.finished === 3 ? '🥉' : '🏃';
        resultText += `${medal} *${r.finished}. ${r.horse}* ${r.bet ? '⭐' : ''}\n`;
    });

    resultText += `\n`

    if (betWin) {
        const prize = Math.ceil(betAmount * 2.5); // Bonus cuaca cerah/hujan bisa ditambah logikanya di sini
        user.money += prize;
        resultText += `🎉 *MENANG!* Kuda jagoanmu juara 1!\n`
        resultText += `🎁 Hadiah: *+${prize.toLocaleString()} Money*`;
    } else {
        resultText += `💔 *KALAH...* Jagoanmu gagal mencapai podium pertama. Taruhan hangus!`;
    }

    await conn.reply(m.chat, resultText, fkontak);
};

handler.help = ['umamusume <bet> <no>'];
handler.tags = ['game'];
handler.command = /^(umamusume|race|balapkuda)$/i;
handler.group = true;

module.exports = handler;
        
