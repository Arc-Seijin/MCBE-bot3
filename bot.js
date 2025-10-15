const bedrock = require('bedrock-protocol');
const express = require('express');
const http = require('http');

const SERVER_HOST = 'Test-LEaV.aternos.me';
const SERVER_PORT = 31944;
const USERNAME_1 = 'Haru';
const USERNAME_2 = 'Fuyu';

let bot1 = null;
let bot2 = null;

function startBot(username) {
    console.log(`[BOT] Connecting as ${username}...`);
    const bot = bedrock.createClient({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username,
        offline: true
    });

    bot.on('login', () => console.log(`[BOT] ${username} Logged in.`));
    bot.on('spawn', () => console.log(`[BOT] ${username} Spawned.`));
    bot.on('disconnect', reason => console.log(`[BOT] ${username} Disconnected: ${reason}`));
    bot.on('kicked', reason => console.log(`[BOT] ${username} Kicked: ${reason}`));
    bot.on('error', err => console.log(`[BOT] ${username} Error:`, err));

    return bot;
}

async function botCycle() {
    console.log('[CYCLE] Running bot cycle...');
    while (true) {
        if (!bot1) bot1 = startBot(USERNAME_1);
        await wait(60000);

        bot2 = startBot(USERNAME_2);
        await wait(5000);

        if (bot1) {
            bot1.disconnect();
            bot1 = null;
        }

        await wait(60000);
        bot1 = startBot(USERNAME_1);
        await wait(5000);

        if (bot2) {
            bot2.disconnect();
            bot2 = null;
        }
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Health check
const app = express();
app.get('/', (req, res) => res.send('Bots are alive!'));
app.listen(3000, () => console.log('[SERVER] Health check on port 3000'));

// Self-ping
function keepAlive() {
    setInterval(() => {
        http.get('http://localhost:3000', res => {
            console.log(`[Self-Ping] Status: ${res.statusCode}`);
        }).on('error', err => {
            console.error('[Self-Ping] Error:', err.message);
        });
    }, 5 * 60 * 1000);
}

keepAlive();
botCycle();
