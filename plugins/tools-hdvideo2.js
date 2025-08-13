const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ENHANCEMENT_OPTIONS = {
'1': {
name: 'Basic Enhancement',
desc: 'Noise reduction + sharpening',
filters: [
'hqdn3d=4:3:6:4.5',
'unsharp=5:5:1.0:5:5:0.0'
]
},
'2': {
name: 'Super Sharp',
desc: 'Maximum sharpening + detail enhancement',
filters: [
'unsharp=7:7:2.5:7:7:0.0',
'smartblur=1.5:-0.35:-3.5:0.65:0.25:2.0'
]
},
'3': {
name: 'AI Upscale',
desc: 'Resolution upscaling + quality boost',
filters: [
'scale=iw*2:ih*2:flags=lanczos',
'hqdn3d=2:1:2:3',
'unsharp=5:5:1.0:5:5:0.0'
]
},
'4': {
name: 'Low Light Boost',
desc: 'Brightness + shadow enhancement',
filters: [
'eq=brightness=0.2:contrast=1.3:gamma=1.1',
'hqdn3d=3:2:3:3',
'unsharp=3:3:0.8:3:3:0.0'
]
}
};
function checkFFmpegFilters() {
return new Promise((resolve) => {
exec('ffmpeg -filters', (error, stdout) => {
if (error) {
resolve({
nlmeans: false,
deshake: false,
smartblur: false,
colorbalance: false
});
return;
}
const output = stdout.toLowerCase();
resolve({
nlmeans: output.includes('nlmeans'),
deshake: output.includes('deshake'),
smartblur: output.includes('smartblur'),
colorbalance: output.includes('colorbalance')
});
});
});
}
function adaptFiltersForFFmpeg(filters, availableFilters) {
return filters.map(filter => {
if (filter.startsWith('nlmeans') && !availableFilters.nlmeans) {
return 'hqdn3d=8:6:12:9';
}
if (filter === 'deshake' && !availableFilters.deshake) {
return null;
}
if (filter.startsWith('smartblur') && !availableFilters.smartblur) {
return 'unsharp=3:3:0.5:3:3:0.0';
}
if (filter.startsWith('colorbalance') && !availableFilters.colorbalance) {
return 'eq=contrast=1.1:saturation=1.05';
}
if (filter.includes('curves=vintage')) {
return 'eq=contrast=1.1:brightness=0.05:gamma=0.9';
}
return filter;
}).filter(f => f !== null);
}
let handler = async (m, { conn, usedPrefix, command, text }) => {
if (!text) {
let optionsList = Object.entries(ENHANCEMENT_OPTIONS)
.map(([key, option]) => `*${key}.* ${option.name}\n   └ ${option.desc}`)
.join('\n\n');
return conn.reply(m.chat,
`🎥 *VIDEO ENHANCEMENT OPTIONS*\n\n${optionsList}\n\n` +
`📝 *Usage:* ${usedPrefix + command} <option_number>\n` +
`📎 Reply to a video with the command\n` +
`⚠️ *Max input size:* 70MB`, m);
}
let q = m.quoted ? m.quoted : m;
let mime = (q.msg || q).mimetype || '';
if (!mime.startsWith('video/')) {
return conn.reply(m.chat, `❌ Please reply to a video file!`, m);
}
const option = ENHANCEMENT_OPTIONS[text.trim()];
if (!option) {
return conn.reply(m.chat, `❌ Invalid option! Choose 1, 2, 3, or 4`, m);
}
let media = await q.download();
const inputFileSize = media.length || media.byteLength || 0;
const inputSizeMB = (inputFileSize / (1024 * 1024)).toFixed(2);
if (inputFileSize > 70 * 1024 * 1024) {
return conn.reply(m.chat,
`❌ *File too large!*\n\n` +
`📊 *Your file:* ${inputSizeMB} MB\n` +
`📝 *Max allowed:* 70 MB\n\n` +
`Please compress your video first.`, m);
}
await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
const tempDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
const randomId = crypto.randomBytes(8).toString('hex');
const inputPath = path.join(tempDir, `input_${randomId}.mp4`);
const outputPath = path.join(tempDir, `enhanced_${randomId}.mp4`);
try {
await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });
fs.writeFileSync(inputPath, media);
await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });
const availableFilters = await checkFFmpegFilters();
const adaptedFilters = adaptFiltersForFFmpeg(option.filters, availableFilters);
const filterComplex = adaptedFilters.join(',');
const ffmpegCommand = [
'ffmpeg',
'-i', inputPath,
'-vf', filterComplex,
'-c:v', 'libx264',
'-preset', 'medium',
'-crf', '18',
'-c:a', 'aac',
'-b:a', '192k',
'-movflags', '+faststart',
'-y',
outputPath
].join(' ');
console.log('Executing FFmpeg command:', ffmpegCommand);
await new Promise((resolve, reject) => {
exec(ffmpegCommand, {
maxBuffer: 1024 * 1024 * 100,
timeout: 300000
}, (error, stdout, stderr) => {
if (error) {
console.error('FFmpeg Error:', error);
console.error('FFmpeg stderr:', stderr);
reject(error);
} else {
console.log('FFmpeg completed successfully');
resolve();
}
});
});
if (!fs.existsSync(outputPath)) {
throw new Error('Enhancement failed - output file not created');
}
await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });
const stats = fs.statSync(outputPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
const outputSizeBytes = stats.size;
const caption = `✅ *Video Enhanced Successfully!*\n\n` +
`🎬 *Enhancement:* ${option.name}\n` +
`📝 *Description:* ${option.desc}\n` +
`📊 *Input Size:* ${inputSizeMB} MB\n` +
`📊 *Output Size:* ${fileSizeMB} MB\n` +
`⚡ *Filters Applied:* ${adaptedFilters.length}\n\n` +
`_Enhanced with FFmpeg professional filters_`;
if (outputSizeBytes > 100 * 1024 * 1024) {
await conn.sendMessage(m.chat, {
document: fs.readFileSync(outputPath),
fileName: `enhanced_${option.name.toLowerCase().replace(/\s+/g, '_')}.mp4`,
mimetype: 'video/mp4',
caption: caption + `\n\n⚠️ *Sent as document due to large file size*`
}, { quoted: m });
} else {
await conn.sendFile(m.chat, outputPath, `enhanced_${option.name.toLowerCase().replace(/\s+/g, '_')}.mp4`, caption, m);
}
fs.unlinkSync(inputPath);
fs.unlinkSync(outputPath);
} catch (error) {
console.error('Video Enhancement Error:', error);
[inputPath, outputPath].forEach(file => {
if (fs.existsSync(file)) fs.unlinkSync(file);
});
let errorMsg = '❌ Enhancement failed: ';
if (error.message.includes('timeout')) {
errorMsg += 'Video too large or complex (timeout)';
} else if (error.message.includes('not found')) {
errorMsg += 'FFmpeg not installed on server';
} else if (error.message.includes('nlmeans')) {
errorMsg += 'Advanced filters not available, try basic options (1, 2, 3, 4)';
} else {
errorMsg += error.message;
}
conn.reply(m.chat, errorMsg, m);
}
};
handler.help = ["hdvid2","hdvideo2"];
handler.tags = ["tools","premium"];
handler.premium = true;
handler.register = true;
handler.command = ["hdvid2","hdvideo2"];
module.exports = handler;