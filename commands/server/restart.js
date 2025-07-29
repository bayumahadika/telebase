export function handler(bot, msg) {
  console.log(msg);
  bot
    .sendMessage(msg.chat.id, "Server akan dijalankan ulang nih! 🚀")
    .then(() => process.send("restart"));
}

handler.description = "Restart server";
handler.onlyOwner = false;
handler.onlyGroup = false;
