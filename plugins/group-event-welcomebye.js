// Plugins Group Welcome & Goodbye
const moment = require("moment-timezone")

let handler = m => m

handler.before = async function (m, { conn, db }) {
    if (!m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}
    chat = global.db.data.chats[m.chat]

    // default state
    if (chat.welcome === undefined) chat.welcome = false
    if (chat.goodbye === undefined) chat.goodbye = false
    if (!chat.setWelcome) chat.setWelcome = "👋 Hai @user, selamat datang di grup *@group*!\n\n@desc"
    if (!chat.setGoodbye) chat.setGoodbye = "👋 Selamat tinggal @user, semoga betah di luar grup *@group*!"
    if (!chat.welcomeThumb) chat.welcomeThumb = null
    if (!chat.goodbyeThumb) chat.goodbyeThumb = null

    // Fallback Thumbnail (langsung pasang punya lo)
    const fallbackThumb = global.fallbackthumb;

    // detect event
    if (m.messageStubType === 27 && chat.welcome) { // add
        let user = m.messageStubParameters[0]
        let groupMetadata = await conn.groupMetadata(m.chat)
        let replaceText = chat.setWelcome
            .replace(/@user/g, "@" + user.split("@")[0])
            .replace(/@group/g, groupMetadata.subject)
            .replace(/@desc/g, groupMetadata.desc?.toString() || "")

        // custom thumbnail / pp / fallback
        let thumbUrl = chat.welcomeThumb
        let pp
        try {
            pp = await conn.profilePictureUrl(user, 'image')
        } catch {
            pp = fallbackThumb
        }

        await conn.sendMessage(m.chat, {
            image: { url: thumbUrl || pp || fallbackThumb },
            caption: replaceText,
            mentions: [user],
            contextInfo: {
                externalAdReply: {
                    title: global.namebot,
                    body: global.wm2,
                    thumbnailUrl: thumbUrl || pp || fallbackThumb,
                    sourceUrl: global.instagramowner
                }
            }
        })
    }

    if (m.messageStubType === 28 && chat.goodbye) { // remove
        let user = m.messageStubParameters[0]
        let groupMetadata = await conn.groupMetadata(m.chat)
        let replaceText = chat.setGoodbye
            .replace(/@user/g, "@" + user.split("@")[0])
            .replace(/@group/g, groupMetadata.subject)
            .replace(/@desc/g, groupMetadata.desc?.toString() || "")

        let thumbUrl = chat.goodbyeThumb
        let pp
        try {
            pp = await conn.profilePictureUrl(user, 'image')
        } catch {
            pp = fallbackThumb
        }

        await conn.sendMessage(m.chat, {
            image: { url: thumbUrl || pp || fallbackThumb },
            caption: replaceText,
            mentions: [user],
            contextInfo: {
                externalAdReply: {
                    title: global.namebot,
                    body: global.wm2,
                    thumbnailUrl: thumbUrl || pp || fallbackThumb,
                    sourceUrl: global.instagramowner
                }
            }
        })
    }
}

module.exports = handler