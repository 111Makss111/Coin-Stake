require('dotenv').config();
const { Telegraf } = require('telegraf');
const Joi = require('joi');
const path = require('path');
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
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

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://coin-stake.vercel.app/oauth2callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

app.use(session({
    secret: 'your_secret_key', // Замініть на більш надійний секрет
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
    });
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const ticket = await oAuth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.session.user = payload;

    res.redirect('/profile'); // Redirect to the profile page after successful login
});

app.get('/profile', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.send(`Hello, ${req.session.user.name}`);
    }
});

// Запуск бота
const startBot = async () => {
    try {
        // Перевірка та видалення попереднього вебхука
        await bot.telegram.deleteWebhook();
        
        // Налаштування нового вебхука
        await bot.telegram.setWebhook('https://coin-stake.vercel.app/telegraf/your_secret_path');

        // Запуск обробки оновлень
        app.post('/telegraf/your_secret_path', (req, res) => {
            bot.handleUpdate(req.body, res);
        });

        console.log('Bot started and webhook set');
        await bot.launch();
    } catch (error) {
        console.error('Error starting bot', error);
    }
};

startBot();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Обробка команд бота
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
        ctx.reply('Here is some information about the Tron Space App...');
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
