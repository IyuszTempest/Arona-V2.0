/*
   Created By Dana
   Source From: https://github.com/DanaPutra133/Aquabot-V3/blob/main/aqua%20bot/plugins/search-cerpen.js
   Github: https://github.com/DanaPutra133/Aquabot-V3/
   Created At: 13 June 2024
   Dont Delete This Watermark and Sell This Code !!!!
*/

const fetch = require('node-fetch')

//mulai

let handler = async (m, {conn, command}) => {

    let anu = `----(*${command}*)----\n\n`;

    if (command === 'remaja') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=remaja&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'anak') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=anak&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'misteri') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=misteri&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'budaya') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=budaya&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'romantis') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=romantis&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'galau') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=galau&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'gokil') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=gokil&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'inspiratif') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=inspiratif&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'kehidupan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=kehidupan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'sastra') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=sastra&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerjapan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=jepang&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerkorea') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=korea&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'keluarga') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=keluarga&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'persahabatan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=persahabatan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'kristen') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=kristen&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'ramadhan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=ramadhan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'liburan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=liburan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'lingkungan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=lingkungan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'mengharukan') {
        const res = await (await fetch(`https://api.betabotz.eu.org/api/story/cerpen?type=mengharukan&apikey=${betabotz}`)).json();
        anu += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }

    m.reply(anu)
    try {
      } catch (e) {
        console.log(e);
        m.reply('Maaf, cerpen tidak di temukan');
        await conn.sendMessage(m.chat, {
          react: {
              text: '😞',
              key: m.key,
          }
      })
      }

};



handler.help = handler.command = ['remaja', 'anak', 'budaya', 'misteri', 'romantis', 'cinta', 'gokil', 'galau', 'Kehidupan', 'inspiratif', 'sastra', 'cerjapan', 'cerkorea', 'keluarga', 'persahabatan', 'kristen', 'ramadhan', 'liburan', 'lingkungan', 'mengharukan'];
handler.tags = ['internet']
handler.group = false;
handler.limit = true;
module.exports = handler;

//dana_putra13
