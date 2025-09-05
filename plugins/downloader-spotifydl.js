/**
 * Plugin: Spotify Downloader (Dual API Fallback)
 * Author: @alfat.syah
 * Endpoint 1: https://api.siputzx.my.id/api/d/spotify
 * Endpoint 2: https://api.siputzx.my.id/api/d/spotifyv2
 * Commands: spotify | spotifydl
 */

const axios = require('axios');

async function getSpotifyData(url) {
  const api1 = `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`;
  const api2 = `https://api.siputzx.my.id/api/d/spotifyv2?url=${encodeURIComponent(url)}`;

  try {
    // Coba API pertama
    const res1 = await axios.get(api1, { headers: { accept: '*/*' } });
    if (res1.data && res1.data.result) {
      const { title, artist, duration, thumbnail, download_url } = res1.data.result;
      return {
        status: true,
        source: 'APIv1',
        data: {
          url,
          title,
          description: '',
          songTitle: title,
          artist,
          coverImage: thumbnail,
          mp3DownloadLink: download_url,
          coverDownloadLink: thumbnail
        }
      };
    }
  } catch (e) {
    console.log('[API1 ERROR]', e.message);
  }

  try {
    // Jika gagal, coba API kedua
    const res2 = await axios.get(api2, { headers: { accept: '*/*' } });
    if (res2.data && res2.data.data) {
      const d = res2.data.data;
      return {
        status: true,
        source: 'APIv2',
        data: {
          url: d.url,
          title: d.title,
          description: d.description || '',
          songTitle: d.songTitle,
          artist: d.artist,
          coverImage: d.coverImage,
          mp3DownloadLink: d.mp3DownloadLink,
          coverDownloadLink: d.coverDownloadLink
        }
      };
    }
  } catch (e) {
    console.log('[API2 ERROR]', e.message);
  }

  return { status: false, message: 'All API failed' };
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🚩 *Example:* ${usedPrefix + command} https://open.spotify.com/track/...`;

  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:SpotifyDL\nTEL;type=CELL;type=VOICE;waid=0:+0\nEND:VCARD`
      }
    }
  };

  await conn.sendMessage(m.chat, {
    react: {
      text: '🎵',
      key: m.key
    }
  });

  const result = await getSpotifyData(text);

  if (!result.status) throw '❌ Semua API gagal. Coba lagi nanti.';

  const { title, artist, coverImage, mp3DownloadLink } = result.data;

  const caption = `🎧 *Spotify Downloader*\n\n` +
                  `🎵 Judul: ${title}\n` +
                  `👤 Artis: ${artist}\n` +
                  `📦 Source: ${result.source}\n\n` +
                  `✅ *Download akan segera dikirim...*`;

  await conn.sendMessage(m.chat, {
    image: { url: coverImage },
    caption,
    quoted: fkontak
  });

  // Kirim audio
  await conn.sendMessage(m.chat, {
    audio: { url: mp3DownloadLink },
    mimetype: 'audio/mpeg',
    fileName: `${title}.mp3`
  }, { quoted: fkontak });
};

handler.help = ['spotidl', 'spotifydl'];
handler.tags = ['downloader'];
handler.command = /^(spotidl|spotifydl)$/i;

module.exports = handler;
