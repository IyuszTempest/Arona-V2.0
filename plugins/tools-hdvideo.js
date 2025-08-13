/*
- Fitur: Hd Video makai ffmpeg
- Info: Hd kan video dengan ffmpeg 
- Requirement: npm install ffmpeg-static
- Type: Plugins `ESM`& `CJS`
- By: SkyWalker
- [ `SUMBER` ]
- https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
*/

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { writeFile, unlink, mkdir } = require('fs').promises;
const { existsSync, createReadStream } = require('fs');

ffmpeg.setFfmpegPath(ffmpegStatic);

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!mime) throw `Mana videonya?`;
    if (!/video\/(mp4|mov|avi|mkv)/.test(mime)) throw `Format ${mime} tidak didukung`;

    conn.reply(m.chat, ' Sedang memproses video, mohon tunggu sebentar sekitar *2 - 4 menit* tergantung lama nya video 😹...', m);

    let videoBuffer = await q.download?.();
    let tempDir = './tmp';
    if (!existsSync(tempDir)) await mkdir(tempDir, { recursive: true });

    let inputPath = `${tempDir}/input_${Date.now()}.mp4`;
    let outputPath = `${tempDir}/output_${Date.now()}.mp4`;

    await writeFile(inputPath, videoBuffer);

    try {
        await enhanceVideo(inputPath, outputPath);
        await conn.sendFile(m.chat, outputPath, 'HD-Video.mp4', 'Video berhasil di-HD-kan', m);
    } catch (err) {
        console.error(err);
        conn.reply(m.chat, 'Gagal meningkatkan kualitas video.', m);
    } finally {
        setTimeout(() => {
            unlink(inputPath).catch(() => {});
            unlink(outputPath).catch(() => {});
        }, 2000);
    }
}

handler.help = ['hdvideo'];
handler.tags = ['tools','premium'];
handler.command = /^(hdvideo|hdvid)$/i;
handler.premium = true;
handler.limit = true;

module.exports = handler;

async function enhanceVideo(input, output) {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .outputOptions([
                '-vf', 'scale=iw*1.5:ih*1.5:flags=lanczos,eq=contrast=1:saturation=1.5,hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.8:5:5:0.8', // sesuaikan sendiri
                '-r', '60', // fps
                '-preset', 'veryfast', // setting slow|medium untuk hasil bagus namun lama
                '-crf', '25', // semakin besar angka semakin besar ukuran namun hasil bagus
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '128k' // kualitas buffer audio
            ])
            .on('end', resolve)
            .on('error', reject)
            .save(output);
    });
}