const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  const username = args[0];
  if (!username) {
    return m.reply("Silakan berikan username Instagram.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/instagram?username=${encodeURIComponent(username)}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 200) {
      const { name, description, followers, uploads, engagementRate, averageActivity, postsPerWeek, postsPerMonth, amountOfPosts, mostPopularPostTime, hashtags, mostCommentedPosts, mostLikedPosts } = data.result;

      const resultMessage = `
      *Profile Information*
      *👤 Username:* ${name}
      *📝 Description:* ${description}
      *👥 Followers:* ${followers}
      *📹 Uploads:* ${uploads}
      *📈 Engagement Rate:* ${engagementRate}
      *📊 Average Activity:* ${averageActivity}
      *📅 Posts Per Week:* ${postsPerWeek}
      *📅 Posts Per Month:* ${postsPerMonth}
      *📅 Total Posts:* ${amountOfPosts}
      *🗓️ Most Popular Post Time** ${mostPopularPostTime}

      *Hashtags:*
      ${hashtags.join(', ')}

      *Most Commented Posts:*
      ${mostCommentedPosts.map(post => `- *💬 Comments:* ${post.comments}, *👍 Likes:* ${post.likes}, *Link:* ${post.link}`).join('\n')}

      *Most Liked Posts:*
      ${mostLikedPosts.map(post => `- *💬 Comments:* ${post.comments}, *👍 Likes:* ${post.likes}, *Link:* ${post.link}`).join('\n')}
      `;

      await conn.sendMessage(m.chat, { text: resultMessage }, { quoted: m });
    } else {
      m.reply("Terjadi kesalahan: " + data.content);
    }
  } catch (error) {
    console.error(error);
    m.reply("Terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ['igstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^igstalk$/i;

module.exports = handler;