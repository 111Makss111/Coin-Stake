require('dotenv').config();
const { Telegraf } = require('telegraf');
const Joi = require('joi');
const path = require('path');
const express = require('express');
const session = require('express-session');

const app = express();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token);

const imageUrl = './img/trx.jpg';

const webAppDataSchema = Joi.object({
    data: Joi.string().required(),
    message: Joi.object({
        chat: Joi.object({
            id: Joi.number().required()
        }).required()
    }).required()
});

app.use(session({
    secret: 'your_secret_key', // Замініть на більш надійний секрет
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.send(`Hello, ${req.session.user.name}`);
    }
});

bot.start((ctx) => {
    const chatId = ctx.chat.id;
    const welcomeMessage = `
Welcome to CoinStake!

🚀 Explore the revolutionary Mine-To-Earn app built on Telegram!

Complete missions, invite friends, and rent additional mining power to earn even more.

Don't miss the opportunity to increase your income and strive for financial independence with us! ⚡️💰🚀

Tap Start App 👇
`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Start App 🚀', web_app: { url: 'https://coin-stake.vercel.app' } }],
                [{ text: 'Information ⚡️', callback_data: 'information' }],
                [{ text: 'Earn More 💰', callback_data: 'earn_more' }]
            ]
        }
    };

    ctx.replyWithPhoto({ source: imageUrl }, { caption: welcomeMessage, ...options });
});

bot.on('callback_query', (ctx) => {
    const chatId = ctx.chat.id;
    const data = ctx.callbackQuery.data;

    if (data === 'information') {
        ctx.reply('Here is some information about the CoinStake App...');
    } else if (data === 'start_app') {
        ctx.reply('Starting the app...');
    } else if (data === 'invite_friends') {
        ctx.reply('Invite your friends using this link...');
    } else if (data === 'earn_more') {
        ctx.reply('Earn more by completing missions and renting additional mining power.');
    }
});

bot.on('web_app_data', (ctx) => {
    const webAppData = ctx.message.web_app_data;
    const { error } = webAppDataSchema.validate(webAppData);
    if (error) {
        return;
    }

    const chatId = webAppData.message.chat.id;
    ctx.reply(`You have opened the web app with data: ${webAppData.data}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

bot.launch();
