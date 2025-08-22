/**
 * @ ✨ Kontak Owner, Creator, Sponsor, & Bot
 * @ Description: Plugin ini menampilkan informasi kontak owner, creator, sponsor, dan bot
 * dalam format vCard (kartu kontak) dengan custom quoted message.
 **/

const handler = async (m, { conn }) => {
    try {
        const nameowner = global.nameowner;
        const numberowner = global.numberowner;
        const gmailowner = global.mailowner;
        const instagramowner = global.instagramowner;

        const namecreator = global.namecreator;
        const numbercreator = global.numbercreator;
        const gmailcreator = global.mailcreator;

        const namesponsor = global.namesponsor;
        const numbersponsor = global.numbersponsor;
        const gmailsponsor = global.mailsponsor;

        const botname = global.botname ?? conn.user.name;
        const botnumber = conn.user.id.split('@')[0];

        const fkontak = {
            key: {
                participants: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                fromMe: false,
                id: "Halo"
            },
            message: {
                contactMessage: {
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${nameowner};Bot;;;\nFN:${nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            },
            participant: "0@s.whatsapp.net"
        };

        const vcardOwner = `BEGIN:VCARD
VERSION:3.0
N:${nameowner};;;
FN:${nameowner}
ORG:Owner-sama 👑
TEL;type=CELL;type=VOICE;waid=${numberowner}:${numberowner}
URL:${instagramowner}
EMAIL:${gmailowner}
NOTE:Ini Owner-ku, orangnya baik lho!
ADR:;;Indonesia;;;;
END:VCARD`;

        const vcardCreator = `BEGIN:VCARD
VERSION:3.0
N:${namecreator};;;
FN:${namecreator}
ORG:Creator 🎨
TEL;type=CELL;type=VOICE;waid=${numbercreator}:${numbercreator}
EMAIL:${gmailcreator}
NOTE:Senpai yang buat aku! Sugoi!
ADR:;;Indonesia;;;;
END:VCARD`;

        const vcardSponsor = `BEGIN:VCARD
VERSION:3.0
N:${namesponsor};;;
FN:${namesponsor}
ORG:Sponsor 💖
TEL;type=CELL;type=VOICE;waid=${numbersponsor}:${numbersponsor}
EMAIL:${gmailsponsor}
NOTE:Sponsor-chan yang baik hati! Arigatou~
ADR:;;Indonesia;;;;
END:VCARD`;

        const vcardBot = `BEGIN:VCARD
VERSION:3.0
N:${botname};;;
FN:${botname}
ORG:Bot 🤖
TEL;type=CELL;type=VOICE;waid=${botnumber}:${botnumber}
NOTE:Ini nomor aku, jangan di-spam ya, Onii-chan! >.<
ADR:;;Indonesia;;;;
END:VCARD`;

        // --- Jurus Kirim Pesan: Final Attack! ---
        const sentMsg = await conn.sendMessage(
            m.chat,
            {
                contacts: {
                    displayName: `Kontak Penting Bot ✨`,
                    contacts: [
                        { vcard: vcardOwner },
                        { vcard: vcardCreator },
                        { vcard: vcardSponsor },
                        { vcard: vcardBot }
                    ]
                }
            },
            { quoted: fkontak }
        );

        await conn.reply(m.chat, `Moshi moshi, ${m.pushName}! Ini daftar kontak pentingnya ya. Disimpan baik-baik, jangan sampai hilang! 😉`, sentMsg);

    } catch (e) {
        console.error(e);
        m.reply('Gomenasai, Senpai! Ada yang salah pas aku mau kasih info kontak. Coba lagi nanti ya! 🙏');
    }
};

handler.command = handler.help = ['owner', 'creator', 'sponsor', 'botkontak'];
handler.tags = ['info'];
handler.limit = false;

module.exports = handler;
