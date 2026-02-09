/* Plugin: Config Manager (Euphy Version)
   Feature: Ambil & Update file config.js secara realtime
*/

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, command, isOwner }) => {
    // 1. KEAMANAN: Cuma Yus-kun yang boleh akses! 🎀
    if (!isOwner) return m.reply('Hmph! Kamu siapa? Fitur ini cuma boleh diakses sama Ownerku tersayang! ✨');

    const configPath = path.join(__dirname, '../config.js');

    try {
        // --- FITUR AMBIL CONFIG ---
        if (command === 'getconfig') {
            await conn.sendMessage(m.chat, { react: { text: '📑', key: m.key } });
            
            if (!fs.existsSync(configPath)) throw new Error('Duh, file config.js nya nggak ketemu...');
            
            const configContent = fs.readFileSync(configPath, 'utf8');
            
            await conn.sendMessage(m.chat, {
                document: Buffer.from(configContent),
                mimetype: 'application/javascript',
                fileName: 'config.js',
                caption: 'Ini file config.js nya! ✨\n\nHati-hati ya pas edit, jangan sampai ada yang typo biar aku nggak pusing dan crash! 🎵'
            }, { quoted: m });
        }

        // --- FITUR SIMPAN CONFIG ---
        if (command === 'saveconfig') {
            if (!m.quoted || !m.quoted.text) {
                return m.reply(`*– Cara Pakai:* Balas file config yang udah di edit tadi terus ketik \`.saveconfig\` ya!`);
            }

            await conn.sendMessage(m.chat, { react: { text: '💾', key: m.key } });
            
            const newConfig = m.quoted.text;
            
            // Backup dulu biar aman
            const backupPath = configPath + '.bak';
            fs.copyFileSync(configPath, backupPath);

            // Tulis ulang file config.js
            fs.writeFileSync(configPath, newConfig, 'utf8');

            await m.reply('Yatta! *config.js* udah berhasil di-update! 🌸\n\nNanti aku bakal restart otomatis kalau panel Pterodactyl kamu udah diset auto-restart ya.');
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

    } catch (e) {
        console.error(e);
        m.reply(`Aduuh, ada error! ❌\n\n\`\`\`${e.message}\`\`\``);
    }
}

handler.help = ['getconfig', 'saveconfig']
handler.tags = ['owner']
handler.command = /^(getconfig|saveconfig)$/i
handler.owner = true 

module.exports = handler;
