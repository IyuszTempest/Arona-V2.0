const fetch = require("node-fetch");

let handler = async (m, { 
    conn, 
    usedPrefix, 
    command 
}) => {
    await conn.reply(m.chat, 'Fetching data...', m);
    
    try {
        // Mengambil data dari API
        let response = await fetch('https://api.siputzx.my.id/api/r/lahelu');
        let data = await response.json();

        // Memeriksa apakah data berhasil diambil
        if (data && data.status) {
            let posts = data.data; // Mengambil array data postingan
            if (posts.length > 0) {
                let result = posts.map(post => {
                    return `**Judul:** ${post.title}\n` +
                           `**Total Upvotes:** ${post.totalUpvotes}\n` +
                           `**Total Downvotes:** ${post.totalDownvotes}\n` +
                           `**Total Comments:** ${post.totalComments}\n` +
                           `**Dibuat Oleh:** [${post.userInfo.username}](https://lahelu.com/user/${post.userInfo.username})\n` +
                           `**Link Post:** [Lihat Post](https://lahelu.com/post/${post.postId})\n` +
                           `**Media:** ${post.content.map(content => content.value).join('\n')}\n\n`;
                }).join('---\n\n');

                // Mengirimkan hasil ke pengguna
                await m.reply(result);
            } else {
                await m.reply('Tidak ada hasil yang ditemukan.');
            }
        } else {
            await m.reply('Terjadi kesalahan saat mengambil data.');
        }
    } catch (e) {
        console.log(e);
        await m.reply(`[ ! ] Terjadi kesalahan saat mengambil data.`);
    }
};

handler.help = ['lahelu'];
handler.command = ['lahelu'];
handler.tags = ['internet'];
handler.premium = false;
handler.limit = true;

module.exports = handler;