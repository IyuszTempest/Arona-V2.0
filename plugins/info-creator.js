/**
 * @ ✨ Kontak Owner, Creator, Sponsor, & Bot
 * @ Description: Plugin ini menampilkan informasi kontak owner, creator, sponsor, dan bot
 * dalam format vCard (kartu kontak) dengan custom quoted message.
 **/

// Pastikan variabel global ini sudah didefinisikan di file utama bot lo
// Kalau belum ada, nilainya akan menggunakan default di bawah.
var nameowner = global.nameowner;
var numberowner = global.numberowner;
var gmailowner = global.mailowner;
var instagramowner = global.instagramowner;
var websiteowner = global.websiteowner;

var namecreator = global.namecreator;
var numbercreator = global.numbercreator;
var gmailcreator = global.mailcreator;

var namesponsor = global.namesponsor;
var numbersponsor = global.numbersponsor;
var gmailsponsor = global.mailsponsor;

// Variabel untuk informasi bot (biasanya sudah ada di global bot)
var botname = global.botname;
var botnumber = conn.user.jid.split('@')[0]; // Nomor bot dari koneksi langsung

var handler = async (m, { conn }) => {

    // Custom quoted message (fkontak)
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo" // ID pesan sembarang
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${nameowner};Bot;;;\nFN:${nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    // --- Kontak Owner ---
    const vcardOwner = `BEGIN:VCARD
VERSION:3.0
N:${nameowner};Bot;;;
FN: ${nameowner} (Owner)
ORG:Owner Bot
TEL;waid=${numberowner}:${numberowner}@s.whatsapp.net
X-ABLabel:Nomor Owner Bot
EMAIL;type=INTERNET:${gmailowner}
X-ABLabel:Email Owner
ADR:;;🇮🇩 Indonesia;;;;
URL:${instagramowner}
X-ABLabel:Instagram Owner
END:VCARD`;

    // --- Kontak Creator ---
    const vcardCreator = `BEGIN:VCARD
VERSION:3.0
N:${namecreator};Bot;;;
FN: ${namecreator} (Creator)
ORG:Creator Bot
TEL;waid=${numbercreator}:${numbercreator}@s.whatsapp.net
X-ABLabel:Nomor Creator
EMAIL;type=INTERNET:${gmailcreator}
X-ABLabel:Email Creator
ADR:;;🇮🇩 Indonesia;;;;
END:VCARD`;

    // --- Kontak Sponsor ---
    const vcardSponsor = `BEGIN:VCARD
VERSION:3.0
N:${namesponsor};Bot;;;
FN: ${namesponsor} (Sponsor)
ORG:Sponsor Bot
TEL;waid=${numbersponsor}:${numbersponsor}@s.whatsapp.net
X-ABLabel:Nomor Sponsor
EMAIL;type=INTERNET:${gmailsponsor}
X-ABLabel:Email Sponsor
ADR:;;🇮🇩 Indonesia;;;;
END:VCARD`;

    // --- Kontak Bot ---
    const vcardBot = `BEGIN:VCARD
VERSION:3.0
N:${namebot};Bot;;;
FN: ${namebot}
ORG:Whatsapp Bot
TEL;waid=${botnumber}:${botnumber}@s.whatsapp.net
X-ABLabel:Nomor Bot
ADR:;;🇮🇩 Indonesia;;;;
END:VCARD`;

    // Mengirim beberapa vCard dalam satu pesan kontak
    const sentMsg  = await conn.sendMessage(
        m.chat,
        { 
            contacts: { 
                displayName: `Owner, Creator, Sponsor, & Bot`, // Nama tampilan di list kontak
                contacts: [
                    { vcard: vcardOwner },
                    { vcard: vcardCreator },
                    { vcard: vcardSponsor },
                    { vcard: vcardBot } // Tambahkan kontak bot di sini
                ] 
            }
        },
        { quoted: fkontak } // Menggunakan fkontak sebagai quoted message
    );

    // Reply dengan pesan teks, dan gunakan sentMsg sebagai quoted message
    await conn.reply(m.chat, "Ini adalah kontak Owner, Creator, Sponsor, dan nomor bot kami!", sentMsg);
};

handler.command = handler.help = ['owner', 'creator', 'sponsor', 'botkontak']; // Tambah 'botkontak' di command
handler.tags = ['info'];
handler.limit = false; 

module.exports = handler;
