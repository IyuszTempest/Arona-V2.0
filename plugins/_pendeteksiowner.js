// --- Plugins CJS ---
// --- Sambutan Spesial ---

let handler = m => m;
handler.before = async function(m, { conn, participants, isPrems, isAdmin }) {
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

  const isOwner = global.owner.some(number => m.sender.startsWith(number));
  const isCreator = m.sender.startsWith(global.numbercreator);
  const isSponsor = m.sender.startsWith(global.numbersponsor);
  const isOwner2 = m.sender.startsWith(global.numberowner2);

  // Mengatur cooldown per grup
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  const chat = global.db.data.chats[m.chat];
  const cooldownTime = 600; // Cooldown 10 menit
  const currentTime = Date.now();

  if (!m.isGroup || !m.fromMe) {
    return;
  }
  
  let messageText = "";
  
  if (isOwner) {
    messageText = "📣 *Perhatian semua* 📣, Owner wibu yang udah ga ketolong telah datang";
  } else if (isCreator) {
    messageText = "📣 *Perhatian semua* 📣, Sang creator karbit telah datang!!";
  } else if (isSponsor) {
    messageText = "📣 *Perhatian semua* 📣, Sponsorku telah datang, beri hormat semua!!!";
  } else if (isOwner2) {
    messageText = "📣 *Perhatian semua* 📣, Ownerku yang pintar udah datang!!";
  }

  if (messageText && (currentTime - (chat.lastJoinMessage || 0) > cooldownTime * 1000)) {
    await conn.sendMessage(
      m.chat,
      {
        text: messageText,
        mentions: [m.sender],
      },
      {
        quoted: fkontak,
      }
    );
    chat.lastJoinMessage = currentTime;
  } 
}

module.exports = handler;

//base code by adrian
//edit by dana
//penyesuaian by IyuszTempest
