const cluster = require('cluster');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const chalk = require('chalk');
const app = express();

// --- Logger Kustom untuk Tampilan yang Lebih Baik ---
const log = (text, color = 'white') => {
    console.log(chalk.gray('┌─' + '─'.repeat(17)));
    console.log(chalk[color](`│ [${new Date().toLocaleTimeString()}]`), chalk[color].bold(text));
    console.log(chalk.gray('└─' + '─'.repeat(17)));
};
const info = (text) => {
    console.log(chalk.cyan('┌─[') + chalk.cyan.bold('INFO') + chalk.cyan(']───────────'));
    console.log(chalk.cyan(`│ [${new Date().toLocaleTimeString()}]`), chalk.cyan.bold(text));
    console.log(chalk.cyan('└' + '─'.repeat(19)));
};
const warn = (text) => {
    console.log(chalk.yellow('┌─[') + chalk.yellow.bold('WARNING') + chalk.yellow(']────────'));
    console.log(chalk.yellow(`│ [${new Date().toLocaleTimeString()}]`), chalk.yellow.bold(text));
    console.log(chalk.yellow('└' + '─'.repeat(19)));
};
const error = (text) => {
    console.log(chalk.red('┌─[') + chalk.red.bold('ERROR') + chalk.red(']──────────'));
    console.log(chalk.red(`│ [${new Date().toLocaleTimeString()}]`), chalk.red.bold(text));
    console.log(chalk.red('└' + '─'.repeat(19)));
};
const success = (text) => {
    console.log(chalk.green('┌─[') + chalk.green.bold('SUCCESS') + chalk.green(']────────'));
    console.log(chalk.green(`│ [${new Date().toLocaleTimeString()}]`), chalk.green.bold(text));
    console.log(chalk.green('└' + '─'.repeat(19)));
};
// ---


// Express.js 
const ports = [4000, 3000, 5000, 8000, 8080, 4444];
let availablePortIndex = 0;

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      server.close();
      resolve(true);
    });
    server.on('error', reject);
  });
}

async function startServer() {
  const port = ports[availablePortIndex];
  const isPortAvailable = await checkPort(port);

  if (isPortAvailable) {
    info(`🌐 Port ${port} is open and ready.`);
    app.get('/', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      const data = {
        status: 'true',
        message: 'Bot Sudah Aktif!',
        author: 'IyuszTempest'
      };
      const result = {
        response: data
      };
      res.send(JSON.stringify(result, null, 2));
    });
  } else {
    warn(`Port ${port} is already in use. Trying another port...`);
    availablePortIndex++;

    if (availablePortIndex >= ports.length) {
      error('No more available ports. Exiting...');
      process.exit(1);
    } else {
      ports[availablePortIndex] = parseInt(port) + 1;
      startServer();
    }
  }
}

startServer();

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [path.join(__dirname, file), ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  p.on("message", (data) => {
    success(`🟢 RECEIVED: ${data}`);
    switch (data) {
      case "reset":
        p.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case "uptime":
        p.send(process.uptime());
        break;
    }
  });

  p.on("exit", (code) => {
    isRunning = false;
    error(`Exited with code: ${code}`);

    if (code === 0) return; // Jangan restart jika keluar secara normal

    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
	  warn(`File ${args[0]} has been modified. Restarting script...`);
      start("main.js");
    });
  });

  p.on("error", (err) => {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
    p.kill();
    isRunning = false;
    error(`An error occurred. Restarting script...`);
    start("main.js");
  });

  // --- Tampilkan Info Sistem dalam Kotak ---
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
  const sysInfo = [
      { text: `🖥️  ${os.type()}, ${os.release()} - ${os.arch()}`, color: 'cyan' },
      { text: `💾  Total RAM: ${ramInGB.toFixed(2)} GB`, color: 'green' },
      { text: `💽  Free RAM: ${freeRamInGB.toFixed(2)} GB`, color: 'yellow' },
      { text: `📃 Script rename By IyuszTempest`, color: 'magenta' },
      { text: `🔗 Base Ori: https://github.com/BOTCAHX/RTXZY-MD`, color: 'blue' }
  ];
  const boxWidth = Math.max(...sysInfo.map(line => line.text.length)) + 4;
  const rainbow = ['red', 'yellow', 'green', 'blue', 'magenta'];
  console.log(chalk.magenta('┌' + '─'.repeat(boxWidth) + '┐'));
  sysInfo.forEach((line, index) => {
      console.log(chalk.magenta('│ ') + chalk[rainbow[index % rainbow.length]].bold(line.text.padEnd(boxWidth - 3)) + chalk.magenta('│'));
  });
  console.log(chalk.magenta('└' + '─'.repeat(boxWidth) + '┘'));
  // ---

  const pluginsFolder = path.join(__dirname, "plugins");

  fs.readdir(pluginsFolder, (err, files) => {
    if (err) {
      error(`Error reading plugins folder: ${err}`);
      return;
    }
    info(`Found ${files.length} plugins in folder ${pluginsFolder}`);
  });

  setInterval(() => {}, 1000);
}

start("main.js");

const tmpDir = './tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    info(`📁 Created directory ${tmpDir}`);
}

process.on('unhandledRejection', (reason) => {
  error(`Unhandled promise rejection: ${reason}`);
  warn('Unhandled promise rejection. Restarting script...');
  start('main.js');
});

process.on('exit', (code) => {
  error(`Exited with code: ${code}. Restarting script...`);
  start('main.js');
});
