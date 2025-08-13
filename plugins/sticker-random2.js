var { 
sticker5 
} = require('../lib/sticker')
var handler = async (m, {
 conn, 
 command
 }) => {
    var error = (`https://telegra.ph/file/12141dd462ecabeed1347.png`)
    try {
        if (command == 'dinokuning' || command == 'sdino') {
        const res = `https://api.betabotz.eu.org/api/sticker/dinokuning?apikey=${betabotz}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'patrick' || command == 'spatrick') {
        const res = `https://api.betabotz.eu.org/api/sticker/patrick?apikey=${betabotz}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'spongebob' || command == 'sspongebob') {
        const res = `https://api.betabotz.eu.org/api/sticker/spongebob?apikey=${betabotz}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'doge' || command == 'sdoge') {
        const res = `https://api.betabotz.eu.org/api/sticker/doge?apikey=${betabotz}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'manusialidi' || command == 'smanusialidi') {
        const res = `https://api.betabotz.eu.org/api/sticker/manusialidi?apikey=${betabotz}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
    } catch (e) {
        console.log(e)
        await conn.sendFile(m.chat, error, 'error.webp', '', m)
    }
}

handler.command = handler.help = ['dinokuning2', 'patrick2', 'spongebob2', 'doge2', 'manusialidi2', 'sdino2', 'spatrick2', 'sspongebob2', 'sdoge2', 'smanusialidi2']
handler.tags = ['sticker']
handler.limit = true
module.exports = handler
