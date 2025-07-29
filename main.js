import "./config/global.js";
import http from "http";
import express from "express";
import TelegramBot from "node-telegram-bot-api";
import ngrok from "@ngrok/ngrok";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const isDev = process.argv.some((val) => val === "--dev");
const token = global.BOT_TOKEN;
const port = global.PORT || 0;
const app = express();
app.use(morgan("dev"));
app.use(express.json());

const bot = new TelegramBot(token, { polling: false, request: { family: 4 } });

const commandsPath = path.join(process.cwd(), "commands");
const commandsFile = fs
  .readdirSync(commandsPath, { recursive: true })
  .filter((val) => val.endsWith(".js"));
let commands = [];

for await (let file of commandsFile) {
  const { handler } = await import(path.join(commandsPath, file));
  handler.command = path.basename(file).replace(".js", "");
  commands.push(handler);
}

// Route Webhook
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot Command
commands.forEach((handler) => {
  bot.onText(new RegExp(`\\/${handler.command}`), (msg) => handler(bot, msg));
});

// Ngrok & Webhook Setup
const server = http.createServer(app);
const start = async () => {
  server.listen(port, async () => {
    let appUrl = global.APP_URL;
    let webhookUrl = "";

    if (appUrl) {
      webhookUrl = `${appUrl}/bot${token}`;
    } else {
      appUrl = (
        await ngrok.connect({
          addr: server.address().port,
          authtoken: global.NGROK_AUTHTOKEN,
        })
      ).url();
      webhookUrl = `${appUrl}/bot${token}`;
    }

    console.log(`Public URL: ${appUrl}`);
    console.log(`PORT: ${server.address().port}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    const resSetWebhook = await bot.setWebHook(webhookUrl);
    console.log(
      `${resSetWebhook ? "✅ Set Webhook berhasil" : "❌ Set Webhook Gagal"}`,
    );
  });
};

start();
