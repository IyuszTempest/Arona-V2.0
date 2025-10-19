/*
PLUGIN CJS Identitas owner
Author : Alfat.syah 
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const imageUrl = `${global.mediabiodata}`;
const sourceUrl = `${global.instagramowner}`;
const title = "👑 Owner Bot"
const body = "Informasi lengkap tentang owner bot ini"

const handler = async (m, { conn }) => {
  let text = `
╭───〔 👑 IDENTITAS OWNER 👑 〕───
│
├ 📛 Nama : ${global.nameowner}
├ 🎂 Umur : ${global.umurowner}
├ 🚹 Gender : ${global.genderowner}
├ 🙏 Agama : ${global.agamaowner}
├ 🎮 Game Fav : ${global.gamefav}
├ 📺 Anime Fav : ${global.animefav}
├ 💘 Waifu/Husbu : ${global.waifuowner}
├ 🎨 Hobi : ${global.hobiowner}
│
├─〔 SOSIAL MEDIA 〕
│
├ 📱 WhatsApp : ${global.ownerlink}
├ 📸 Instagram : ${global.instagramowner}
├ 🐱 Facebook : ${global.facebookowner}
├ 📌 Pinterest : ${global.pinterestowner}
├ ▶ YouTube : ${global.youtubeowner}
├ 💻 Github : ${global.githubowner}
│
╰───────────────────`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl },
    caption: text,
    contextInfo: {
      externalAdReply: {
        mediaUrl: sourceUrl,
        mediaType: 1,
        description: body,
        title: title,
        body: body,
        thumbnailUrl: imageUrl,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })


  await conn.sendContact(m.chat, `[[${global.numberowner}, ${global.nameowner}]]`, m,)
}

handler.help = ['infoowner', 'biodataowner']
handler.tags = ['info']
handler.command = /^(infoowner|identitasowner|biodataowner)$/i

module.exports = handler
