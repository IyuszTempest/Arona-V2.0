const axios = require('axios');

async function MinecraftStalk(username) {
  try {
    const response = await axios.get(`https://playerdb.co/api/player/minecraft/${username}`);
    const data = response.data;

    if (data.success) {
      const player = data.data.player;

      // Ambil data skin model dari Mojang session server
      let skinModel = 'Tidak diketahui';
      try {
        const sessionRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${player.id}`);
        // Pastikan properties[0] dan value ada sebelum di-parse
        if (sessionRes.data.properties && sessionRes.data.properties[0] && sessionRes.data.properties[0].value) {
            const textures = JSON.parse(Buffer.from(sessionRes.data.properties[0].value, 'base64').toString());
            skinModel = textures.textures.SKIN.metadata && textures.textures.SKIN.metadata.model === 'slim' ? 'Alex (slim)' : 'Steve (default)';
        } else {
            skinModel = 'Tidak ada data model skin';
        }
      } catch (e) {
        console.error("Error fetching Minecraft skin model:", e.message);
        skinModel = 'Gagal ambil model';
      }

      const result = {
        username: player.username,
        id: player.id,
        short_id: player.id.replace(/-/g, ''),
        raw_id: player.raw_id,
        avatar: player.avatar, // Ini URL avatar/head
        skin_texture: player.skin_texture, // Ini URL skin file .png
        name_history: player.name_history || [],
        head_preview: `https://mc-heads.net/head/${username}`,
        full_body_preview_hd: `https://crafatar.com/renders/body/${player.id}?scale=10&overlay`, // Gambar full body
        skin_download: `https://mc-heads.net/download/${username}`, // Link download skin .png
        qr_uuid: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${player.id}`, // QR UUID
        profile_valid: data.code === 'player.found', // Apakah akun premium/valid Mojang
        skin_model: skinModel,
        namemc_url: `https://namemc.com/profile/${username}`
      };

      return {
        status: 200,
        data: result
      };
    } else {
      return {
        status: 404,
        msg: '🧨 Pemain tidak ditemukan di database PlayerDB!'
      };
    }
  } catch (error) {
    console.error("Error in MinecraftStalk function:", error.message);
    return {
      status: 500,
      msg: '🚫 Terjadi kesalahan saat memproses permintaan.',
      error: error.message
    };
  }
}

let handler = async (m, { args, conn, usedPrefix, command }) => { // Tambahkan usedPrefix, command
  // Definisi fkontak di sini untuk plugin ini
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };

  if (!args[0]) {
    return conn.reply(m.chat, `📌 Masukkan username Minecraft!\nContoh: *${usedPrefix + command}* dream`, fkontak); // Pakai fkontak
  }

  const username = args[0];
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    const result = await MinecraftStalk(username);

    if (result.status === 200) {
      const player = result.data;
      const history = player.name_history.length
        ? player.name_history.map((name, i) => `${i + 1}. ${name.name}${name.changedToAt ? ` (⏱ ${new Date(name.changedToAt).toLocaleDateString('id-ID')})` : ''}`).join('\n')
        : '❌ Tidak ada riwayat nama ditemukan.';

      const message = 
        `🎮 *Minecraft Player Info*\n\n` +
        `> 👤 *Username:* ${player.username}\n` +
        `> 🆔 *UUID:* ${player.id}\n` +
        `> 🔡 *UUID (Short):* ${player.short_id}\n` +
        `> 📦 *Raw ID:* ${player.raw_id}\n` +
        `> 🧍‍♂️ *Skin Model:* ${player.skin_model}\n` +
        `> 🌐 *NameMC:* ${player.namemc_url}\n` +
        `> 🖼️ *Skin Texture:* ${player.skin_texture}\n` +
        `> 📥 *Download Skin:* ${player.skin_download}\n` +
        `> ✅ *Premium Account:* ${player.profile_valid ? 'Ya' : 'Tidak'}\n` +
        `> 📊 *Total Name History:* ${player.name_history.length}\n` +
        `> 📜 *Name History:*\n${history}`;

      // Kirim gambar full-body HD + caption
      await conn.sendMessage(m.chat, {
        image: { url: player.full_body_preview_hd },
        caption: message
      }, { quoted: fkontak }); // Pakai fkontak

      // Kirim QR UUID terpisah
      await conn.sendMessage(m.chat, {
        image: { url: player.qr_uuid },
        caption: `📌 *QR Code UUID*\nUUID dari ${player.username}`
      }, { quoted: fkontak }); // Pakai fkontak

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } else { // Handle status 404 atau 500 dari MinecraftStalk
      await conn.reply(m.chat, result.msg, fkontak); // Pakai fkontak
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
    }
  } catch (e) { // Catch error jika ada masalah di luar fungsi MinecraftStalk
      console.error("Error di handler stalkmc:", e.message);
      await conn.reply(m.chat, `🚫 Terjadi kesalahan umum: ${e.message}`, fkontak);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
  }
};

handler.command = ['mcstalk','minecraftstalk','stalkmc'];
handler.tags = ['stalk']; // Tambah tag 'stalk'
handler.help = ['mcstalk <username>'];
handler.limit = true;
handler.premium = false; // Ganti error ke premium jika ini premium command
// error: true tidak diperlukan jika error ditangani di handler

module.exports = handler;
