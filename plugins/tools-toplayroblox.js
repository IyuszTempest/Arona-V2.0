/* Plugins CJS
Toplayroblox
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
Author : F6F411
*/
const axios = require('axios');
const sharp = require('sharp');

let handler = async (m, { conn }) => {
    try {
        m.reply('⏳ Sedang memproses...');
        const api1 = new URL('https://apis.roblox.com');
        api1.pathname = 'explore-api/v1/get-sort-content';
        api1.search = new URLSearchParams({
            sessionId: '17996246-1290-440d-b789-d49484115b9a',
            sortId: 'top-playing-now',
            cpuCores: '8',
            maxResolution: '1920x1080',
            maxMemory: '8192',
            networkType: '4g'
        }).toString();

        const { data: json1 } = await axios.get(api1.toString());
        const gameList = json1?.games?.slice(0, 10);
        if (!gameList?.length) throw new Error('gamelist kosong');

        const payload = gameList.map(v => ({
            type: 'GameIcon',
            targetId: v.universeId,
            format: 'webp',
            size: '256x256'
        }));

        const { data: json2 } = await axios.post('https://thumbnails.roblox.com/v1/batch', payload);
        const thumbList = json2.data;
        const mergedList = gameList.map((v, i) => ({ ...v, ...thumbList[i] }));

        const images = await Promise.all(
            mergedList.map(v =>
                axios.get(v.imageUrl, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data))
            )
        );

        const imageBuffer = await sharp({
            create: {
                width: 256 * 5 + 40,
                height: 256 * 2 + 30,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite(
                images.map((buf, idx) => ({
                    input: buf,
                    top: Math.floor(idx / 5) * (256 + 10) + 10,
                    left: (idx % 5) * (256 + 10) + 10
                }))
            )
            .png()
            .toBuffer();

        const separator = '-'.repeat(60);

        const caption = mergedList
            .map((v, i) =>
                `${i + 1} | ${v.name}\n👥 player count ${v.playerCount.toLocaleString('id-ID')}\n👍 likes ${(
                    (v.totalUpVotes / (v.totalUpVotes + v.totalDownVotes)) *
                    100
                ).toFixed()}%\n🎮 play now https://www.roblox.com/games/${v.rootPlaceId}`
            )
            .join(`\n${separator}\n`);

        await conn.sendFile(m.chat, imageBuffer, '_zenn.png', caption, m);
    } catch (e) {
        m.reply(`Eror kak : ${e.message}`);
    }
};

handler.help = ['toplayroblox'];
handler.tags = ['tools'];
handler.command = ['toplayroblox', 'toplayrbx'];

module.exports = handler;