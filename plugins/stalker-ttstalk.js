const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  // Memastikan username disediakan
  const username = args[0]; // Ambil username dari argumen
  if (!username) {
    return m.reply("Silakan berikan username TikTok.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/tiktok/profile?username=${encodeURIComponent(username)}`;

  try {
    // Mengambil data dari API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Memeriksa status respons
    if (data.status === 200) {
      const { username, nickname, country, profilePicture, profileUrl, stats, engagementRates, averageVideoPerformance, hashtags, mostUsedHashtags, recentPosts } = data.result;

      // Menyusun pesan hasil dengan gambar profil
      const resultMessage = `
      *Profile Information*
      *👤 Username:* ${username}
      *🪪 Nickname:* ${nickname}
      *🌏 Country:* ${country}
      *🔗 Profile URL:* ${profileUrl}
      *🖼️ Profile Picture:* ${profilePicture}

      *Stats:*
      - 👥 Total Followers: ${stats.totalFollowers}
      - ♥️ Total Likes: ${stats.totalLikes}
      - 🎥 Total Videos: ${stats.totalVideos}
      - ➕ Following: ${stats.following}

      *Engagement Rates:*
      - 📌 Overall Engagement: ${engagementRates.overallEngagement}
      - 📌 Likes Rate: ${engagementRates.likesRate}
      - 📌 Comments Rate: ${engagementRates.commentsRate}
      - 📌 Shares Rate: ${engagementRates.sharesRate}

      *Average Video Performance:*
      - 📌 Avg Views: ${averageVideoPerformance.avgViews}
      - 📌 Avg Likes: ${averageVideoPerformance.avgLikes}
      - 📌 Avg Comments: ${averageVideoPerformance.avgComments}
      - 📌 Avg Shares: ${averageVideoPerformance.avgShares}

      *Hashtags:*
      ${hashtags.join(', ')}

      *Most Used Hashtags:*
      ${mostUsedHashtags.map(tag => `${tag.hashtag} (Count: ${tag.count})`).join('\n')}

      *Recent Posts:*
      ${recentPosts.map(post => `
      - *🖼️ Image:* ${post.image}
      - *👁️ Views:* ${post.views}
      - *👍 Likes:* ${post.likes}
      - *✍️ Comments:* ${post.comments}
      - *↪️ Shares:* ${post.shares}
      - *📝 Description:* ${post.description}
      - *⏰ Created Time:* ${post.createdTime}
      `).join('\n')}
      `;

      // Mengirimkan informasi profil dan gambar profil dalam satu pesan
      await conn.sendMessage(m.chat, {
        image: { url: profilePicture },
        caption: resultMessage
      }, { quoted: m });
    } else {
      m.reply("Terjadi kesalahan: " + data.content);
    }
  } catch (error) {
    console.error(error);
    m.reply("Terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ['ttstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^ttstalk$/i;

module.exports = handler;