import http from "http";
import express from "express";
import TelegramBot from "node-telegram-bot-api";
import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";
dotenv.config();

const isDev = process.argv.some((val) => val === "--dev");
const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const bot = new TelegramBot(token, { polling: false });

// Route Webhook
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot Command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Halo bro, bot-nya udah jalan nih! 🚀");
});

// Ngrok & Webhook Setup
const server = http.createServer(app);
const start = async () => {
  server.listen(port, async () => {
    const url = (
      await ngrok.connect({
        addr: server.address().port,
        authtoken_from_env: true,
      })
    ).url();
    const webhookUrl = `${url}/bot${token}`;

    console.log(`PORT: ${server.address().port}\n🌍 Public URL: ${webhookUrl}`);
    await bot.setWebHook(webhookUrl);
    console.log("✅ Webhook berhasil di-set!");
  });
};

start();
