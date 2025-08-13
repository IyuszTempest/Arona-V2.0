const axios = require('axios')
async function robloxStalk(username) {
try {
const headers = {
'Content-Type': 'application/json',
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
Accept: 'application/json',
}
async function getUsernameData() {
const res = await axios.post(
'https://users.roblox.com/v1/usernames/users',
{ usernames: [username] },
{ headers }
)
return res.data?.data?.[0] || null
}
async function getUserData(id) {
try {
const res = await axios.get(`https://users.roblox.com/v1/users/${id}`, { headers })
return res.data
} catch {
return {}
}
}
async function getProfile(id) {
try {
const res = await axios.get(
`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=720x720&format=Png&isCircular=false`,
{ headers }
)
return res.data?.data?.[0]?.imageUrl || null
} catch {
return null
}
}
async function getPresence(id) {
try {
const res = await axios.post(
'https://presence.roblox.com/v1/presence/users',
{ userIds: [id] },
{ headers }
)
const p = res.data?.userPresences?.[0] || {}
return {
isOnline: p.userPresenceType === 2,
lastOnline: p.lastOnline || 'Tidak tersedia',
location: p.lastLocation || '❌ Tidak sedang bermain apa pun (offline)'
}
} catch {
return {
isOnline: false,
lastOnline: 'Tidak tersedia',
location: '❌ Tidak sedang bermain apa pun (offline)'
}
}
}
async function getFriendCount(id) {
try {
const res = await axios.get(`https://friends.roblox.com/v1/users/${id}/friends/count`, { headers })
return res.data?.count || 0
} catch {
return 0
}
}
async function getFollowers(id) {
try {
const res = await axios.get(`https://friends.roblox.com/v1/users/${id}/followers/count`, { headers })
return res.data?.count || 0
} catch {
return 0
}
}
async function getFollowing(id) {
try {
const res = await axios.get(`https://friends.roblox.com/v1/users/${id}/followings/count`, { headers })
return res.data?.count || 0
} catch {
return 0
}
}
async function getBadges(id) {
try {
const res = await axios.get(
`https://badges.roblox.com/v1/users/${id}/badges?limit=10&sortOrder=Desc`,
{ headers }
)
return res.data?.data?.map(b => ({
name: b.name,
description: b.description,
iconImageId: b.iconImageId
})) || []
} catch {
return []
}
}
async function getFriendList(id) {
try {
const res = await axios.get(`https://friends.roblox.com/v1/users/${id}/friends`, { headers })
return res.data?.data?.map(f => ({
id: f.id,
name: f.name,
displayName: f.displayName,
isOnline: f.isOnline,
profilePicture: `https://www.roblox.com/headshot-thumbnail/image?userId=${f.id}&width=150&height=150&format=png`
})) || []
} catch {
return []
}
}
const userData = await getUsernameData()
if (!userData) throw new Error('Username tidak ditemukan.')
const id = userData.id
const [
userDetails,
profilePicture,
presence,
friendCount,
followers,
following,
badges,
friendList
] = await Promise.all([
getUserData(id),
getProfile(id),
getPresence(id),
getFriendCount(id),
getFollowers(id),
getFollowing(id),
getBadges(id),
getFriendList(id)
])
return {
account: {
username: userDetails.name,
displayName: userDetails.displayName,
profilePicture,
description: userDetails.description || '-',
created: userDetails.created,
isBanned: userDetails.isBanned || false,
hasVerifiedBadge: userDetails.hasVerifiedBadge || false,
},
presence: {
isOnline: presence.isOnline,
lastOnline: presence.lastOnline,
recentGame: presence.location
},
stats: {
friendCount,
followers,
following
},
badges,
friendList
}
} catch (err) {
console.error('[ROBLOX STALK ERROR]', err.response?.status, err.response?.data || err.message)
return null
}
}
let handler = async (m, { conn, args, text }) => {
if (!text) {
return conn.reply(m.chat, '❌ Masukkan username Roblox!\n\nContoh: .robloxstalk elz_gokilll', m)
}
conn.reply(m.chat, '⏳ Sedang mengambil data profil Roblox...', m)
try {
const result = await robloxStalk(text)
if (!result) {
return conn.reply(m.chat, '❌ Gagal mengambil data profil. Username mungkin tidak ditemukan atau terjadi kesalahan.', m)
}
const { account, presence, stats, badges, friendList } = result
let message = `🎮 *ROBLOX PROFILE STALKER*\n\n`
message += `👤 *INFORMASI AKUN*\n`
message += `• Username: ${account.username}\n`
message += `• Display Name: ${account.displayName}\n`
message += `• Deskripsi: ${account.description}\n`
message += `• Dibuat: ${new Date(account.created).toLocaleDateString('id-ID')}\n`
message += `• Status: ${account.isBanned ? '🚫 Banned' : '✅ Aktif'}\n`
message += `• Verified Badge: ${account.hasVerifiedBadge ? '✅ Ya' : '❌ Tidak'}\n\n`
message += `🌐 *STATUS KEHADIRAN*\n`
message += `• Online: ${presence.isOnline ? '🟢 Ya' : '🔴 Tidak'}\n`
message += `• Terakhir Online: ${presence.lastOnline}\n`
message += `• Sedang Bermain: ${presence.recentGame}\n\n`
message += `📊 *STATISTIK*\n`
message += `• Teman: ${stats.friendCount.toLocaleString()}\n`
message += `• Followers: ${stats.followers.toLocaleString()}\n`
message += `• Following: ${stats.following.toLocaleString()}\n\n`
if (badges.length > 0) {
message += `🏆 *BADGE TERBARU (${badges.length})*\n`
badges.slice(0, 5).forEach((badge, i) => {
message += `${i + 1}. ${badge.name}\n`
})
message += `\n`
}
if (friendList.length > 0) {
message += `👥 *DAFTAR TEMAN (${friendList.length > 10 ? '10 dari ' + friendList.length : friendList.length})*\n`
friendList.slice(0, 10).forEach((friend, i) => {
const status = friend.isOnline ? '🟢' : '🔴'
message += `${i + 1}. ${status} ${friend.displayName} (@${friend.name})\n`
})
}
if (account.profilePicture) {
await conn.sendFile(m.chat, account.profilePicture, 'profile.png', message, m)
} else {
conn.reply(m.chat, message, m)
}
} catch (error) {
console.error('Roblox stalk error:', error)
conn.reply(m.chat, '❌ Terjadi kesalahan saat mengambil data profil. Coba lagi nanti.', m)
}
}
handler.help = ['robloxstalk']
handler.tags = ['tools','stalk']
handler.command = /^(robloxstalk|rbxstalk)$/i
handler.limit = true
handler.register = true
module.exports = handler