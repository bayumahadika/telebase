export function handler(bot, msg) {
  console.log(msg);
  bot.sendMessage(msg.chat.id, "Halo bro, botnya udah jalan nih! 🚀");
}

handler.description = "Start bot";
handler.onlyOwner = false;
handler.onlyGroup = false;
