const simple = require('./lib/simple')
const util = require('util')
const chalk = require('chalk')

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    async handler(chatUpdate) {
        if (global.db.data == null) await loadDatabase()
        this.msgqueque = this.msgqueque || []
        // console.log(chatUpdate)
        if (!chatUpdate) return
        // if (chatUpdate.messages.length > 2 || !chatUpdate.messages.length) return
        if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        //console.log(JSON.stringify(m, null, 4))
        try {
            m = await simple.smsg(this, m) || m
            if (!m) return
            m.exp = 0
            m.limit = false
            try {
                const defaultUser = {
                      taxi: 0,
                      lasttaxi: 0,
                      lastyoutuber: 0,
                      subscribers: 0,
                      viewers: 0,
                      like: 0,
                      playButton: 0,
                      saldo: 0,
                      pengeluaran: 0,
                      health: 100,
                      energi: 100,
                      power: 100,
                      title: 0,
                      haus: 100,
                      laper: 100,
                      tprem: 0,
                      stamina : 100,
                      level: 0,
                      follow: 0,
                      lastfollow: 0,
                      followers: 0,
                      pasangan: '',
                      sahabat: '', 
                      location: 'Gubuk', 
                      titlein: 'Belum Ada',
                      ultah: '', 
                      waifu: 'Belum Di Set',
                      husbu: 'Belum Di Set',
                      pc : 0,
                      exp: 0,
                      coin: 0,
                      atm: 0,
                      limit: 100,
                      skata: 0,
                      tigame: 5,
                      lastclaim: 0,
                      judilast: 0,
                      lastnambang: 0,
                      lastnebang: 0,
                      lastmulung: 0,
                      lastkerja: 0,
                      lastmaling: 0,
                      lastbunuhi: 0,
                      lastbisnis: 0,
                      lastberbisnis: 0,
                      bisnis: 0,
                      glimit: 10,
                      berbisnis: 0,
                      lastmancing: 0,
                      pancing: 0,
                      pancingan: 0,
                      totalPancingan: 0,
                      kardus: 0,
                      botol: 0,
                      kaleng: 0,
                      money: 0,
                      litecoin: 0,
                      chip: 0,
                      tiketcoin: 0,
                      lastbossbattle: 0,
                      poin: 0,
                      bank: 0,
                      balance: 0,
                      diamond: 0,
                      emerald: 0,
                      rock: 0,
                      wood: 0,
                      berlian: 0,
                      iron: 0,
                      emas: 0,
                      common: 0,
                      uncommon: 0,
                      mythic: 0,
                      as: 0,
                      psepick: 0,
                      psenjata: 0,
                      glory: 0,
                      enchant: 0,
                      legendary: 0,
                      rumahsakit: 0,
                      tambang: 0,
                      pertambangan: 0,
                      camptroops: 0,
                      pertanian: 0,
                      fortress: 0,
                      lastmulung: 0,
                      lastbunuhi: 0,
                      trofi: 0,
                      rtrofi: 'perunggu',
                      makanan: 0,
                      troopcamp: 0,
                      shield: 0,
                      arlok: 0,
                      ojekk: 0,
                      ojek: 0,
                      polisi: 0,
                      pedagang: 0,
                      dokter: 0,
                      petani: 0,
                      montir: 0,
                      kuli: 0,
                      korbanngocok: 0,
                      coal: 0,
                      korekapi: 0,
                      ayambakar: 0,
                      gulai: 0,
                      rendang: 0,
                      ayamgoreng: 0,
                      oporayam: 0,
                      steak: 0,
                      babipanggang: 0,
                      ikanbakar: 0,
                      lelebakar: 0,
                      nilabakar: 0,
                      bawalbakar: 0,
                      udangbakar: 0,
                      pausbakar: 0,
                      kepitingbakar: 0,
                      soda: 0,
                      vodka: 0,
                      ganja: 0,
                      bandage: 0,
                      sushi: 0,
                      roti: 0,
                      ramuan: 0,
                      lastramuanclaim: 0,
                      gems: 0,
                      cupon: 0, // typo? maybe coupon
                      lastgemsclaim: 0,
                      eleksirb: 0,
                      penduduk: 0,
                      archer: 0,
                      shadow: 0,
                      laststringclaim: 0,
                      lastpotionclaim: 0,
                      lastswordclaim: 0,
                      lastweaponclaim: 0,
                      lastironclaim: 0,
                      lastmancingclaim: 0,
                      anakpancingan: 0,
                      paus: 0,
                      kepiting: 0,
                      gurita: 0,
                      cumi: 0,
                      buntal: 0,
                      dory: 0,
                      lumba: 0,
                      lobster: 0,
                      hiu: 0,
                      lele: 0,
                      nila: 0,
                      bawal: 0,
                      udang: 0,
                      ikan: 0,
                      orca: 0,
                      banteng: 0,
                      harimau: 0,
                      gajah: 0,
                      kambing: 0,
                      panda: 0,
                      buaya: 0,
                      kerbau : 0,
                      sapi: 0,
                      monyet : 0,
                      babihutan: 0,
                      babi: 0,
                      ayam: 0, // duplicate
                      apel: 20,
                      ayamb: 0,
                      ayamg: 0,
                      ssapi: 0,
                      sapir: 0,
                      leleb: 0,
                      leleg: 0,
                      esteh: 0,
                      anggur: 0,
                      jeruk: 0,
                      semangka: 0,
                      mangga: 0,
                      stroberi: 0,
                      pisang: 0,
                      bibitanggur: 0,
                      bibitpisang: 0,
                      pet: 0,
                      potion: 0,
                      sampah: 0,
                      kucing: 0,
                      kucinglastclaim: 0,
                      kucingexp: 0,
                      kuda: 0,
                      kudalastclaim: 0,
                      rubah: 0,
                      rubahlastclaim: 0,
                      rubahexp: 0,
                      anjing: 0,
                      anjinglastclaim: 0,
                      anjingexp: 0,
                      naga: 0,
                      nagalastclaim: 0,
                      griffin: 0,
                      griffinlastclaim: 0,
                      centaur: 0,
                      fightnaga: 0,
                      centaurlastclaim: 0,
                      serigala: 0,
                      serigalalastclaim: 0,
                      serigalaexp: 0,
                      phonix: 0,
                      phonixlastclaim: 0,
                      phonixexp : 0,
                      makanannaga: 0,
                      makananphonix: 0,
                      makanancentaur: 0,
                      makananserigala: 0,
                      makananpet: 0,
                      healthmonster: 0,
                      kyubi: 0,
                      anakkyubi: 0,
                      Banneduser: false,
                      BannedReason: '',
                      banned: false, 
                      bannedTime: 0,
                      warn: 0,
                      afk: -1,
                      lastIstigfar: 0,
                      lastseen: 0,
                      afkReason: '',
                      anakkucing: 0,
                      anakkuda: 0,
                      anakrubah: 0,
                      anakanjing: 0,
                      makananpet: 0,
                      makananPet: 0,
                      antispam: 0,
                      antispamlastclaim: 0,
                      kayu: 0,
                      batu: 0,
                      kingdom: false,
                      string: 0,
                      umpan: 0,
                      armor: 0,
                      armordurability: 0,
                      weapon: 0,
                      weapondurability: 0,
                      sword: 0,
                      sworddurability: 0,
                      pickaxe: 0,
                      pickaxedurability: 0,
                      fishingrod: 0,
                      fishingroddurability: 0,
                      katana: 0,
                      katanadurability: 0,
                      bow: 0,
                      bowdurability: 0,
                      kapak: 0,
                      kapakdurability: 0,
                      axe: 0,
                      axedurability: 0,
                      pisau: 0,
                      pisaudurability: 0,                  
                      kerjasatu: 0,
                      kerjadua: 0,
                      kerjatiga: 0,
                      kerjaempat: 0,
                      kerjalima: 0,
                      kerjaenam: 0,
                      kerjatujuh: 0,
                      kerjadelapan: 0,
                      kerjasembilan: 0,
                      kerjasepuluh: 0,
                      kerjasebelas: 0,
                      kerjaduabelas: 0,
                      kerjatigabelas: 0,
                      kerjaempatbelas: 0,
                      kerjalimabelas: 0,    
                      pekerjaansatu: 0,
                      pekerjaandua: 0,
                      pekerjaantiga: 0,
                      pekerjaanempat: 0,
                      pekerjaanlima: 0,
                      pekerjaanenam: 0,
                      pekerjaantujuh: 0,
                      pekerjaandelapan: 0,
                      pekerjaansembilan: 0,
                      pekerjaansepuluh: 0,
                      pekerjaansebelas: 0,
                      pekerjaanduabelas: 0,
                      pekerjaantigabelas: 0,
                      pekerjaanempatbelas: 0,
                      pekerjaanlimabelas: 0,                    
                      lastadventure: 0,
                      lastwar: 0,
                      lastberkebon: 0,
                      lastberburu: 0,
                      lastbansos: 0,
                      lastrampok: 0,
                      lastngocok: 0,
                      lastngocokk: 0,
                      ngocokk: 0,
                      lastngewe: 0,
                      ngewe: 0,
                      jualan: 0,
                      lastjualan: 0,
                      lastkill: 0,
                      lastfishing: 0,
                      lastdungeon: 0,
                      lastduel: 0,
                      lastmining: 0,
                      lastmaling: 0,
                      lasthourly: 0,
                      lastdagang: 0,
                      lasthunt: 0,
                      lasthun : 0,
                      lastweekly: 0,
                      lastmonthly: 0,
                      lastturu: 0,
                      lastyearly: 0,
                      lastjb: 0,
                      lastrob: 0,
                      lastcodereg: 0,
                      lastngojek: 0,
                      lastgrab: 0,
                      lastSetStatus: 0,
                      registered: false,
                      name: this.getName(m.sender),
                      age: -1,
                      regTime: -1,
                      premiumDate: -1, 
                      premium: false,
                      premiumTime: 0,
                      vip: 'tidak', 
                      vipPoin: 0,
                      job: 'Pengangguran', 
                      jobexp: 0,
                      jail: false, 
                      penjara: false, 
                      antarpaket: 0,
                      dirawat: false, 
                      lbars: '[▒▒▒▒▒▒▒▒▒]', 
                      role: 'Newbie ㋡', 
                      registered: false,
                      autolevelup: true,
                      skill: "",
                      korps: "",
                      korpsgrade: "",
                      demon: "",
                      breaths: "",
                      magic: "",
                      darahiblis: 0,
                      demonblood: 0,
                      demonkill: 0,
                      hashirakill: 0,
                      alldemonkill: 0,
                      allhashirakill: 0,
                      attack: 0,
                      speed: 0,
                      strenght: 0,
                      defense: 0,
                      regeneration: 0,
                      ovo: 0,
                      dana: 0,
                      gopay: 0,
                      lastngaji: 0,
                      lastlonte: 0,
                      lastkoboy: 0,
                      lastdate: 0,
                      lasttambang: 0,
                      lastngepet: 0,
                };

                let user = global.db.data.users[m.sender];
                if (typeof user !== 'object') {
                    global.db.data.users[m.sender] = {};
                }
                // Using spread operator to merge defaults with existing user data
                global.db.data.users[m.sender] = {
                    ...defaultUser,
                    ...user,
                    name: user?.name || this.getName(m.sender) // Ensure name is set
                };

                let chat = global.db.data.chats[m.chat]
                if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
                if (chat) {
                    if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!isNumber(chat.welcometype)) chat.welcometype = 1
                if (!('detect' in chat)) chat.detect = false
                if (!('isBannedTime' in chat)) chat.isBannedTime = false
                if (!('mute' in chat)) chat.mute = false
                if (!('listStr' in chat)) chat.listStr = {}
                if (!('sWelcome' in chat)) chat.sWelcome = 'Hai, @user!\nSelamat datang di grup @subject\n\n@desc'
                if (!('sBye' in chat)) chat.sBye = 'Selamat tinggal @user!'
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('delete' in chat)) chat.delete = true
                if (!('antiLink' in chat)) chat.antiLink = true
                if (!('antiLinknokick' in chat)) chat.antiLinknokick = false
                if (!('antiSticker' in chat)) chat.antiSticker = false
                if (!('antiStickernokick' in chat)) chat.antiStickernokick = false
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('antiToxic' in chat)) chat.antiToxic = false
                if (!isNumber(chat.expired)) chat.expired = 0
                if (!("memgc" in chat)) chat.memgc = {}
                if (!('antilinkig' in chat)) chat.antilinkig = false
                if (!('antilinkignokick' in chat)) chat.antilinkignokick = false
                if (!('antilinkfb' in chat)) chat.antilinkfb = false
                if (!('antilinkfbnokick' in chat)) chat.antilinkfbnokick = false
                if (!('antilinktwit' in chat)) chat.antilinktwit = false
                if (!('antilinktwitnokick' in chat)) chat.antilinktwitnokick = false
                if (!('antilinkyt' in chat)) chat.antilinkyt = false
                if (!('antilinkytnokick' in chat)) chat.antilinkytnokick = false
                if (!('antilinktele' in chat)) chat.antilinktele = false
                if (!('antilinktelenokick' in chat)) chat.antilinktelenokick = false
                if (!('antilinkwame' in chat)) chat.antilinkwame = false
                if (!('antilinkwamenokick' in chat)) chat.antilinkwamenokick = false
                if (!('antilinkall' in chat)) chat.antilinkall = false
                if (!('antilinkallnokick' in chat)) chat.antilinkallnokick = false
                if (!('antilinktt' in chat)) chat.antilinktt = false
                if (!('antilinkttnokick' in chat)) chat.antilinkttnokick = false
                if (!('antibot' in chat)) chat.antibot = false
                } else global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    welcometype: 1,
                    detect: false,
                    isBannedTime: false,
                    mute: false,
                    listStr: {},
                    sWelcome: 'Hai, @user!\nSelamat datang di grup @subject\n\n@desc',
                    sBye: 'Sayonara @user!',
                    sPromote: '',
                    sDemote: '',
                    delete: false, 
                    antiLink: false,
                    antiLinknokick: false,
                    antiSticker: false, 
                    antiStickernokick: false, 
                    viewonce: false,
                    antiToxic: true,
                    antilinkig: false, 
                    antilinkignokick: false, 
                    antilinkyt: false, 
                    antilinkytnokick: false, 
                    antilinktwit: false, 
                    antilinktwitnokick: false, 
                    antilinkfb: false, 
                    antilinkfbnokick: false, 
                    antilinkall: false, 
                    antilinkallnokick: false, 
                    antilinkwame: false,
                    antilinkwamenokick: false, 
                    antilinktele: false, 
                    antilinktelenokick: false, 
                    antilinktt: false, 
                    antilinkttnokick: false, 
                    antibot: false, 
                    rpg: false, 
                }
                let memgc = global.db.data.chats[m.chat]?.memgc?.[m.sender];
                if (typeof memgc !== 'object' || memgc === null) {
                    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
                    global.db.data.chats[m.chat].memgc = global.db.data.chats[m.chat].memgc || {};
                    global.db.data.chats[m.chat].memgc[m.sender] = {};
                    memgc = global.db.data.chats[m.chat].memgc[m.sender];
                }
                if (memgc) {
                    if (!('blacklist' in memgc)) memgc.blacklist = false;
                    if (!('banned' in memgc)) memgc.banned = false;
                    if (!isNumber(memgc.bannedTime)) memgc.bannedTime = 0;
                    if (!isNumber(memgc.chat)) memgc.chat = 0;
                    if (!isNumber(memgc.chatTotal)) memgc.chatTotal = 0;
                    if (!isNumber(memgc.command)) memgc.command = 0;
                    if (!isNumber(memgc.commandTotal)) memgc.commandTotal = 0;
                    if (!isNumber(memgc.lastseen)) memgc.lastseen = 0;
                } else {
                    global.db.data.chats[m.chat].memgc[m.sender] = {
                    blacklist: false,
                    banned: false,
                    bannedTime: 0,
                    chat: 0,
                    chatTotal: 0,
                    command: 0,
                    commandTotal: 0,
                    lastseen: 0
                    };
                }
            } catch (e) {
                console.error(e);
            }
            if (opts['nyimak']) return
            if (!m.fromMe && opts['self']) return
            if (opts['pconly'] && m.chat.endsWith('g.us')) return
            if (opts['gconly'] && !m.chat.endsWith('g.us')) return
            if (opts['swonly'] && m.chat !== 'status@broadcast') return
            if (typeof m.text !== 'string') m.text = ''
            if (opts['queque'] && m.text) {
                this.msgqueque.push(m.id || m.key.id)
                await delay(this.msgqueque.length * 1000)
            }
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!plugin.all) continue
                if (typeof plugin.all !== 'function') continue
                try {
                    await plugin.all.call(this, m, chatUpdate)
                } catch (e) {
                    if (typeof e === 'string') continue
                    console.error(e)
                }
            }
        //if (m.id.startsWith('BAE5') && m.id.length === 16 || m.isBaileys && m.fromMe) return
	if (m.id.startsWith('3EB0') || (m.id.startsWith('BAE5') && m.id.length === 16 || m.isBaileys && m.fromMe)) return;	
            m.exp += Math.ceil(Math.random() * 10)

            let usedPrefix
            let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

            const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
            const ownerNumbers = global.owner.map(v => v.replace(/[^0-9]/g, '')); 
            const mappedOwners = ownerNumbers.map(v => v + detectwhat); 
            console.log('DEBUG: mappedOwners (JID format for comparison):', mappedOwners);
            const isROwner = mappedOwners.includes(m.sender);
            const isOwner = isROwner || m.fromMe
            const isMods = isROwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
            const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) || (db.data.users[m.sender].premiumTime > 0 || db.data.users[m.sender].premium === true);           
            async function getLidFromJid(id, conn) {
                if (id.endsWith('@lid')) return id
                const res = await conn.onWhatsApp(id).catch(() => [])
                return res[0]?.lid || id
            }   
            global.getLidFromJid = getLidFromJid;
            const senderLid = await getLidFromJid(m.sender, this)
            const botLid = await getLidFromJid(this.user.jid, this)
            const senderJid = m.sender
            const botJid = this.user.jid
            const groupMetadata = (m.isGroup ? (conn.chats[m.chat] || {}).metadata : {}) || {}
            const participants = m.isGroup ? (groupMetadata.participants || []) : []
            const user = participants.find(p => p.id === senderLid || p.id === senderJid) || {}
            const bot = participants.find(p => p.id === botLid || p.id === botJid) || {}
            const isRAdmin = user?.admin === "superadmin" || false
            const isAdmin = isRAdmin || user?.admin === "admin" || false
            const isBotAdmin = !!bot?.admin || false

            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) {
                    // global.dfail('restrict', m, this)
                    continue
                }
                const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
                let match = (_prefix instanceof RegExp ? // RegExp Mode?
                    [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ? // Array?
                        _prefix.map(p => {
                            let re = p instanceof RegExp ? // RegExp in Array?
                                p :
                                new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]
                        }) :
                        typeof _prefix === 'string' ? // String?
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp]]
                ).find(p => p[1])
                if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                })) continue
                if (typeof plugin !== 'function') continue
                if ((usedPrefix = (match[0] || '')[0])) {
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    command = (command || '').toLowerCase()
                    let fail = plugin.fail || global.dfail // When failed
                    let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
                        plugin.command.test(command) :
                        Array.isArray(plugin.command) ? // Array?
                            plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                                cmd.test(command) :
                                cmd === command
                            ) :
                            typeof plugin.command === 'string' ? // String?
                                plugin.command === command :
                                false

                    if (!isAccept) continue
                    m.plugin = name
                    if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                        let chat = global.db.data.chats[m.chat]
                        let user = global.db.data.users[m.sender]
                        if (name != 'group-modebot.js' && name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && (chat?.isBanned || chat?.mute))
                        return
                        if (name != 'unbanchat.js' && chat && chat.isBanned) return // Except this
                        if (name != 'unbanuser.js' && user && user.banned) return
                        if (m.isGroup) {
                            chat.memgc[m.sender].command++
                            chat.memgc[m.sender].commandTotal++
                            chat.memgc[m.sender].lastCmd = Date.now()
                        }
                        user.command++
                        user.commandTotal++
                        user.lastCmd = Date.now()
                    }
                    
                    if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.rowner && !isROwner) { // Real Owner
                        fail('rowner', m, this)
                        continue
                    }
                    if (plugin.owner && !isOwner) { // Number Owner
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.mods && !isMods) { // Moderator
                        fail('mods', m, this)
                        continue
                    }
                    if (plugin.premium && !isPrems) { // Premium
                        fail('premium', m, this)
                        continue
                    }
                    if (plugin.group && !m.isGroup) { // Group Only
                        fail('group', m, this)
                        continue
                    } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
                        fail('botAdmin', m, this)
                        continue
                    } else if (plugin.admin && !isAdmin) { // User Admin
                        fail('admin', m, this)
                        continue
                    }
                    if (plugin.private && m.isGroup) { // Private Chat Only
                        fail('private', m, this)
                        continue
                    }
                    if (plugin.register == true && _user.registered == false) { // Butuh daftar?
                        fail('unreg', m, this)
                        continue
                    }
                    m.isCommand = true
                    let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 // XP Earning per command
                    if (xp > 200) m.reply('Ngecit -_-') // Hehehe
                    else m.exp += xp
                    if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                        this.reply(m.chat, `Limit lu dah habis, silahkan beli melalui *${usedPrefix}buy* atau beli di *${usedPrefix}shop*`, m)
                        continue // Limit habis
                    }
                    if (plugin.level > _user.level) {
                        this.reply(m.chat, `diperlukan level ${plugin.level} untuk menggunakan fitur ini. Level lu ${_user.level}\m gunakan .levelup untuk menaikan level!`, m)
                        continue // If the level has not been reached
                    }
                    let extra = {
                        match,
                        usedPrefix,
                        noPrefix,
                        _args,
                        args,
                        command,
                        text,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        chatUpdate,
                    }                          
                    try {
                        await plugin.call(this, m, extra)
                        if (!isPrems) m.limit = m.limit || plugin.limit || false
                    } catch (e) {
                        // Error occured
                        m.error = e
                        console.error(e)
                        if (e) {
                            let text = util.format(e)
                            for (let key of Object.values(APIKeys))
                                text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                            if (e.name)
                            for (let jid of owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid)) {
                                let data = (await this.onWhatsApp(jid))[0] || {}// Cek jika data.exists (misal: log chat/nomor owner sudah diset)
                                if (data.exists) {
                                  m.reply(
                                    `*❗ Laporan Error Plugin ❗*\n\n` +
                                    `*🔌 Plugin:* ${m.plugin}\n` +
                                    `*👤 Sender:* @${m.sender.split('@')[0]}\n` +
                                    `*💬 Chat:* ${m.chat}\n` +
                                    `*👥 Chat Name:* ${await this.getName(m.chat)}\n` +
                                    `*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n` +
                                    `*📄 Pesan Error Lengkap:*\n` +
                                    `\`\`\`${text}\`\`\``.trim(), 
                                    data.jid, 
                                    { mentions: [m.sender] }
                                );
                                
                                }
                            }
                        }
                    } finally {
                        // m.reply(util.format(_user))
                        if (typeof plugin.after === 'function') {
                            try {
                                await plugin.after.call(this, m, extra)
                            } catch (e) {
                                console.error(e)
                            }
                        }
                        // --- BARIS INI YANG DIPERBAIKI ---
                        if (m.limit) {
                            m.reply(`${m.limit} Limit terpakai`)
                        }
                    }
                    break
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
             //conn.sendPresenceUpdate('composing', m.chat) // kalo pengen auto vn hapus // di baris dekat conn
            //console.log(global.db.data.users[m.sender])
            let user, stats = global.db.data.stats
            if (m) {
                if (m.sender && (user = global.db.data.users[m.sender])) {
                    user.exp += m.exp
                    user.limit -= m.limit * 1
                }

                let stat
                if (m.plugin) {
                    let now = + new Date
                    if (m.plugin in stats) {
                        stat = stats[m.plugin]
                        if (!isNumber(stat.total)) stat.total = 1
                        if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                        if (!isNumber(stat.last)) stat.last = now
                        if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                    } else stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                    stat.total += 1
                    stat.last = now
                    if (m.error == null) {
                        stat.success += 1
                        stat.lastSuccess = now
                    }
                }
            }

            try {
                 require('./lib/print')(m, this)
             } catch (e) {
                 console.log(m, m.quoted, e)
             }
            if (opts['autoread']) await this.readMessages([m.key])
        }
    },
	
  async participantsUpdate({ id, participants, action }) {
        if (opts['self']) return
        // if (id in conn.chats) return // First login will spam
        if (global.isInit) return
        let chat = db.data.chats[id] || {}
        let text = ''
        switch (action) {
        case 'add':
        case 'remove':
		case 'leave':
		case 'invite':
		case 'invite_v4':
                // Logic ini di-handle oleh plugins/group-event-welcomebye.js untuk menghindari pesan ganda.
                // Jika ingin mengaktifkan kembali, hapus atau comment file plugins/group-event-welcomebye.js
                break                    
            case 'promote':
                text = (chat.sPromote || this.spromote || conn.spromote || '@user is now Admin')
            case 'demote':
                if (!text) text = (chat.sDemote || this.sdemote || conn.sdemote || '@user is no longer Admin')
                text = text.replace('@user', '@' + participants[0].split('@')[0])
                if (chat.detect) this.sendMessage(id, text, {
                    contextInfo: {
                        mentionedJid: this.parseMention(text)
                    }
                })
                break
        }
    },
    async delete({ remoteJid, fromMe, id, participant }) {
        /*if (fromMe) return
        let chats = Object.entries(conn.chats).find(([user, data]) => data.messages && data.messages[id])
        if (!chats) return
        let msg = JSON.parse(chats[1].messages[id])
        let chat = global.db.data.chats[msg.key.remoteJid] || {}
        if (chat.delete) return
        await this.reply(msg.key.remoteJid, `
Terdeteksi @${participant.split`@`[0]} telah menghapus pesan
Untuk mematikan fitur ini, ketik
.enable delete
`.trim(), msg, {
            mentions: [participant]
        })
        this.copyNForward(msg.key.remoteJid, msg).catch(e => console.log(e, msg))*/
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: 'Lu bukan owner woy 😡',
        owner: 'Lu bukan owner woy 🙄',
        mods: 'Perintah ini hanya dapat digunakan oleh Moderator !',
        premium: 'Lu belum beli premium, beli dulu sono! 😆',
        group: 'Fitur ini cuma bisa dipakai di grup ya! ✨',
        private: 'Fitur ini sangat privasi, silahkan gunakan di pribadi chat dengan bijak 🤨',
        admin: 'Lu admin, lu berkuasa. lu member bisa apa? :v',
        botAdmin: `Jadikan bot ${global.namebot} sebagai *Admin* untuk menggunakan fitur ini! 😁`,
        unreg: `*Dibaca loh rek!!* Silahkan daftar dulu buat pakai bot ${global.namebot} dengan cara mengetik:\n\n*.daftar nama.umur*\n\nContoh: *.daftar Iyus.18*`,
        restrict: 'Fitur ini di matikan/disable!'
    } [type]
    if (msg) return m.reply(msg)
}

let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    delete require.cache[file]
    if (global.reloadHandler) console.log(global.reloadHandler())
})
