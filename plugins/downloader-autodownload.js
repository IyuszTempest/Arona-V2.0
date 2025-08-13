
  
const axios = require('axios');
const fetch = require('node-fetch');
 
let handler = m => m;
 
handler.before = async (m, { conn }) => {
    if (m.isBaileys || m.fromMe || m.text.startsWith('.') || m.text.startsWith('!')) return;
 
    const now = Date.now();
    conn.lastDownload = conn.lastDownload || {};
    const last = conn.lastDownload[m.chat] || 0;
    if (now - last < 5000) return;
 
    const text = m.text.trim();
    if (!/^https?:\/\/[^\s]+$/i.test(text)) return;
 
    conn.lastDownload[m.chat] = now;
 
    const url = text;
 
    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) return await handleYouTube(conn, m, url);
        if (url.includes('twitter.com') || url.includes('x.com')) return await handleTwitter(conn, m, url);
        if (url.includes('tiktok.com') || url.includes('vt.tiktok.com')) return await handleTikTok(conn, m, url);
        if (url.includes('instagram.com') || url.includes('instagr.am')) return await handleInstagram(conn, m, url);
        if (url.includes('facebook.com') || url.includes('fb.watch')) return await handleFacebook(conn, m, url);
        if (url.includes('spotify.com') && url.includes('track')) return await handleSpotify(conn, m, url);
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
    }
};
 
async function handleYouTube(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const res = await axios.get(`https://api.ownblox.my.id/api/ytdl?url=${encodeURIComponent(url)}&type=mp4`);
        const result = res.data;
        if (!result.status || !result.result || !result.result.video_download) {
            return conn.reply(m.chat, 'Gagal mengambil data video YouTube.', m);
        }
        const { title, thumbnail, video_download, quality, duration } = result.result;
        await conn.sendFile(m.chat, video_download, 'ytmp4.mp4', `📽 *Judul:* ${title}\n🎞 *Kualitas:* ${quality}\n⏱ *Durasi:* ${duration} detik`, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        console.error(err);
        await conn.reply(m.chat, 'Terjadi kesalahan saat memproses video YouTube.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
 
async function handleTwitter(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const res = await axios.get(`https://api.ownblox.my.id/api/twitterdl?url=${encodeURIComponent(url)}`);
        const result = res.data;
        if (!result || !result.download_link || result.download_link.length === 0) throw new Error('Gagal mendapatkan video dari Twitter');
        const videoUrl = result.download_link[0];
        await conn.sendFile(m.chat, videoUrl, 'twitter.mp4', `✅ *Berhasil mengunduh video dari Twitter!*\n\n🌐 *Sumber:* ${result.source}`, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        console.error(err);
        await conn.reply(m.chat, 'Terjadi kesalahan saat mengunduh video Twitter.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
 
async function handleTikTok(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const res = await axios.get(`https://api.ownblox.my.id/api/ttdl?url=${encodeURIComponent(url)}`);
        const json = res.data;
        if (!json.status || !json.result || !json.result.video) throw new Error("Gagal mendapatkan media TikTok. Gunakan link lain.");
        const { video, audio, title, author } = json.result;
        let caption = `🎥 *Judul:* ${title}\n👤 *Author:* ${author}\n✅ *Berhasil mengunduh video TikTok!*`;
        await conn.sendMessage(m.chat, {
            video: { url: video },
            caption: caption
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, 'Terjadi kesalahan saat memproses video TikTok.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
 
async function handleInstagram(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        let res = await fetch(`https://api.siputzx.my.id/api/d/igdl?url=${url}`);
        let json = await res.json();
        if (!json || !json.data || json.data.length === 0) throw "Gagal mendapatkan data Instagram.";
        for (let i of json.data) {
            await conn.sendFile(m.chat, i.url, null, `*🌐Status:* _Sukses_\n> Auto Downloader`, m);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error("Error:", error);
        await conn.reply(m.chat, 'Terjadi kesalahan saat memproses konten Instagram.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
 
async function handleFacebook(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const res = await axios.get(`https://api.ownblox.my.id/api/fbdl?url=${encodeURIComponent(url)}`);
        const result = res.data;
        if (!result || !result.download_link) return conn.reply(m.chat, 'Gagal mengambil video dari Facebook.', m);
        await conn.sendFile(m.chat, result.download_link, 'fb.mp4', `✅ *Berhasil mengambil video!*\n\n🌐 *Sumber:* ${result.source}`, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        console.error(err);
        await conn.reply(m.chat, 'Terjadi kesalahan saat mengunduh video Facebook.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
 
async function handleSpotify(conn, m, url) {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const res = await fetch(`https://fastrestapis.fasturl.cloud/downup/spotifydown?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (!json.result || !json.result.success || !json.result.link) throw 'Gagal mengambil data lagu!';
        const { title, artists, cover } = json.result.metadata;
        const audioUrl = json.result.link;
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: `🎤 Artis: ${artists}`,
                    mediaType: 1,
                    thumbnailUrl: cover,
                    renderLargerThumbnail: true,
                    mediaUrl: url,
                    sourceUrl: url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
        console.error(err);
        await conn.reply(m.chat, '❌ Gagal mendownload lagu dari Spotify. Pastikan link benar atau coba lagi nanti.', m);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
}
handler.premium = true;
 
module.exports = handler;