/**
 * Credit
 * - ZTRdiamond
 * - Source: https://whatsapp.com/channel/0029VbC6NKM96H4ZW9Q5az2R
 * - Source: https://whatsapp.com/channel/0029VagFeoY9cDDa9ulpwM0T
 * 
 * Modified and integrated by Arona for Arona-MD
 */

const horseNames = [
    "Special Week", "Silence Suzuka", "Tokai Teio", "Mejiro McQueen",
    "Gold Ship", "Daiwa Scarlet", "Vodka", "Grass Wonder", "T.M. Opera O"
];

function startRace(betHorses = []) {
    if (!Array.isArray(betHorses)) throw new Error("Taruhan harus berupa array.");
    if (betHorses.length === 0) throw new Error("Minimal pasang 1 kuda untuk taruhan.");
    if (betHorses.length > 3) throw new Error("Maksimal pasang 3 kuda untuk taruhan.");

    const randomRange = (min, max) => Math.random() * (max - min) + min;
    const results = horseNames.map(name => {
        const speed = randomRange(80, 100);
        const stamina = randomRange(75, 100);
        const mood = randomRange(0.8, 1.2);
        const performance = ((speed * 0.6) + (stamina * 0.4)) * mood;

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

    return output.map(o => ({ ...o, betWin }));
}

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
                vcard: BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD
            }
        },
        participant: "0@s.whatsapp.net"
    };

    let user = global.db.data.users[m.sender];
    
    const horseList = horseNames.map(name => › ${name}).join('\n');
    const usage = 🎌 *Selamat Datang di Arena Balap Kuda!* 🎌\n\nTaruh taruhanmu pada kuda jagoanmu dan menangkan hadiahnya!\n\n*Cara bermain:*\n${usedPrefix + command} <nama_kuda>|<jumlah_taruhan>\n\n*Contoh:*\n${usedPrefix + command} "Special Week"|5000\n\n*Catatan:*\n- Gunakan tanda kutip (") untuk nama kuda yang lebih dari satu kata.\n- Kamu bisa bertaruh pada 1 hingga 3 kuda, pisahkan dengan koma.\nContoh: \${usedPrefix + command} "Special Week", "Gold Ship"|10000\\n\n*Daftar Kuda Pacu:*\n${horseList};

    if (!text) return conn.reply(m.chat, usage, fkontak);

    const parts = text.split('|');
    if (parts.length < 2) return conn.reply(m.chat, Format salah, Sensei!\n\n${usage}, fkontak);

    const betAmount = parseInt(parts[parts.length - 1]);
    if (isNaN(betAmount) || betAmount <= 0) return conn.reply(m.chat, 'Jumlah taruhan harus angka dan lebih dari 0!', fkontak);
    if (user.money < betAmount) return conn.reply(m.chat, Uangmu tidak cukup untuk taruhan sebesar ${betAmount.toLocaleString()}!, fkontak);

    const betHorseInput = parts.slice(0, parts.length - 1).join('|');
    const betHorses = betHorseInput.match(/"[^"]+"|\w+/g)?.map(h => h.replace(/"/g, '')) || [];

    if (betHorses.length === 0) return conn.reply(m.chat, 'Kamu harus memilih setidaknya satu kuda!', fkontak);
    if (betHorses.length > 3) return conn.reply(m.chat, 'Maksimal hanya bisa bertaruh pada 3 kuda!', fkontak);

    const invalidHorses = betHorses.filter(h => !horseNames.includes(h));
    if (invalidHorses.length > 0) {
        return conn.reply(m.chat, Kuda bernama *"${invalidHorses.join(', ')}"* tidak ada dalam daftar pacuan.\n\n${usage}, fkontak);
    }

    user.money -= betAmount;

    await conn.reply(m.chat, 🏇 *Balapan Dimulai!* 🏇\n\nSensei bertaruh *${betAmount.toLocaleString()}* pada kuda: *${betHorses.join(', ')}*.\n\nPara kuda sudah bersiap di garis start..., fkontak);

    await new Promise(resolve => setTimeout(resolve, 5000));
    await conn.reply(m.chat, 'Mereka melesat! Debu beterbangan di arena!', m);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await conn.reply(m.chat, 'Tikungan terakhir! Siapakah yang akan menjadi juara?', m);
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        const raceResults = startRace(betHorses);
        const winner = raceResults.find(r => r.win);
        const didBetWin = raceResults[0].betWin;

        let resultText = 🏁 *Hasil Balapan* 🏁\n\nJuara pertama adalah... *${winner.horse}*!\n\n;
        resultText += '┌─「 Papan Peringkat 」\n';
        raceResults.forEach(r => {
            const betMarker = r.bet ? '🏇' : '';
            resultText += │ ${r.finished}. ${r.horse} ${betMarker}\n;
        });
        resultText += '└──────────\n\n';

        if (didBetWin) {
            const prize = betAmount * 2;
            user.money += prize;
            resultText += 🎉 *Selamat, Sensei!* 🎉\nTaruhanmu pada *${winner.horse}* menang!\nKamu mendapatkan hadiah *${prize.toLocaleString()}* Money!;
        } else {
            resultText += 💔 *Yah, Kalah...* 💔\nSayang sekali, taruhanmu tidak menang kali ini. Uang taruhan *${betAmount.toLocaleString()}* hangus. Coba lagi lain kali!;
        }

        await conn.reply(m.chat, resultText, fkontak);

    } catch (e) {
        console.error(e);
        user.money += betAmount;
        await conn.reply(m.chat, Gomen, Sensei! Terjadi kesalahan saat balapan: ${e.message}. Uang taruhanmu sudah dikembalikan., fkontak);
    }
};

handler.help = ['umamusume <"nama_kuda">|<taruhan>'];
handler.tags = ['game'];
handler.command = /^(umamusume|race|balapkuda)$/i;
handler.group = true;
handler.limit = true;

module.exports = handler;
