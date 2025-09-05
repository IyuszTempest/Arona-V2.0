//#Settings Info Owner dan Bot
global.owner = ['6282255810534','6285245307548','12773870301387','181067281604634'] //masukin lid nya juga
global.mods = ['6282255810534','12773870301387','181067281604634'] //lid nya jangan lupa
global.prems = ['6282255810534','6285245307548','12773870301387','181067281604634'] //jangan lupa lid nya mas
global.nameowner = 'IyuszTempest' //owner utama
global.namebot = 'Arona AI Multidevice' //nama bot lu
global.namecreator = 'IyuszTempest' //kalau ga ada jangan diubah ntar error
global.namesponsor = 'Alfat.syah' //kalau ga ada jangan diubah ntar error
global.numberowner = '6282255810534' //nomor owner utama, wajib
global.numberowner2 = '6285245307548' //kalau ga ada masukan owner utama aja
global.numbercreator = '6285750351830' //kalau ga ada jangan diubah takut error
global.numbersponsor = '6285872169153' //kalau ga ada jangan diubah takut error
global.storelink = 'https://wa.me/6285245307548' //masukin kayak gitu biar kalau ada orang yang tertarik ama sewa bot lu
global.mail = 'aronamail@desu' //bebas mau kek mana, jangan dikosongin
global.mailowmer = 'iyusztempest@gmail.com' //wajib masukin, ini juga termasuk akun mega lu
global.mailcreator = 'thecreator@mail.co.id' //biarin aja jangan diubah
global.mailsponsor = 'thesponsor@mail.com' //biarin aja jangan diubah
global.gc = 'https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c' //bebas mau ch atau gc
global.instagramowner = 'https://www.instagram.com/iyusz_tempest?igsh=MWdoemNtdmoxdTBzbA==' //wajib
global.websiteowner = 'https://linkbio.iyusztempest.biz.id' //kalau ga ada ya biarin aja biar ga error
global.wm = '© Arona Bot Multidevice' //wm bot
global.wm2 = 'By IyuszTempest'
global.pwmega = 'passwordmegalu' //ini password akun mega lu, buat plugin up mega)



//#Settings Thumbnail Link yang ada di plugins
global.thumbnailutama = 'https://files.catbox.moe/0x7lr2.jpg' //thumbnail reply di semua menu
global.gambarsewa1 = 'https://files.catbox.moe/ml8yts.jpg' //dari plugins info-sewa
global.gambarsewa2 = 'https://files.catbox.moe/t0a7im.jpg'
global.gambarsewa3 = 'https://files.catbox.moe/ftgesl.jpg'
global.gambarsewa4 = 'https://files.catbox.moe/yl9k3i.jpg'
global.fallbackthumb = 'https://file.idnet.my.id/api/preview.php?file=kg62lb3n.jpg'
global.bcgc = 'https://file.idnet.my.id/api/preview.php?file=kg62lb3n.jpg'


//#Settings Loading
global.wait = '_*lagi di proses kak...*_'
global.eror = '_*yah lagi error nih, coba lagi nanti ya kak*_'



//#Settings bagian perstikeran :v
global.stiker_wait = '*⫹⫺ Stiker lagi dibuat nih...*'
global.packname = 'Arona Bot Multidevice'
global.author = 'By IyzTempest'



//#Settings Bot Dan Grup (False & True)
global.autobio = false // Set true/false untuk mengaktifkan atau mematikan autobio (default: false)
global.antiporn = false // Set true/false untuk Auto delete pesan porno (bot harus admin) (default: true)
global.spam = true // Set true/false untuk anti spam (default: true)
global.gcspam = false // Set true/false untuk menutup grup ketika spam (default: false)
global.maxwarn = '5' // Peringatan maksimum Warn
    
    

//#Settings Api
global.btc = 'Apikey_Lu_Mas' //Daftar terlebih dahulu https://api.botcahx.eu.org
global.betabotz = 'Apikey_Lu_Mas' // Daftar https://api.betabotz.eu.org
global.geminiai = 'Apikey_Lu_Mas' // https://ai.google.dev/gemini-api/docs?hl=id 
global.geminimaker ='Apikey_Lu_Mas' // dapetin api nya dari api gemini juga
global.lolkey = 'Apikey_Lu_Mas' //dapatkan apikya di https://api.lolhuman.xyz/
global.fgsiapi = 'Apikey_Lu_Mas' // dapatkan apinya disini https://fgsi.koyeb.app/


//Bagian Ini Jangan Diubah Kalau Ga Mau Error!!!!
global.APIs = {   
  btc: 'https://api.botcahx.eu.org'
}

global.APIKeys = { 
  'https://api.botcahx.eu.org': global.btc
}


let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})

/*
###INFO AJA MAS###
• Base Ori by Botchax: https://github.com/BOTCAHX/RTXZY-MD
• SC Bot Arona AI Multidevice: https://github.com/IyuszTempest/Arona-MD
• dapatkan lid dengan mengetik .lid di grup, terus lu salin di config.js
*/
