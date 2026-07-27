import TelegramBot from 'node-telegram-bot-api';
import { evaluateHomework } from './evaluator';

export function setupTelegramBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn("BOT_TOKEN is not provided in environment variables. Telegram bot will not start.");
    return null;
  }

  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, { polling: true });

  const userStates = new Map<number, 'idle' | 'waiting_for_image'>();
  const userStats = new Map<number, { checked: number }>();

  // Button labels
  const CHECK_HOMEWORK_BTN = "📝 Uyga vazifani tekshirish";
  const STATISTICS_BTN = "📊 Statistika";

  // Keyboard layout
  const mainMenuKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: CHECK_HOMEWORK_BTN }, { text: STATISTICS_BTN }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };

  // Listen for any kind of message. There are different kinds of messages.
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle /start command
    if (text === '/start') {
      userStates.set(chatId, 'idle');
      bot.sendMessage(chatId, "Assalomu alaykum! Men matematikadan uyga vazifalarni tekshirib beruvchi botman. Tugmalardan birini tanlang:", mainMenuKeyboard);
      return;
    }

    // Handle button clicks
    if (text === CHECK_HOMEWORK_BTN) {
      userStates.set(chatId, 'waiting_for_image');
      bot.sendMessage(chatId, "Iltimos, tekshirish uchun uyga vazifangiz rasmini yuboring.", {
        reply_markup: {
          remove_keyboard: true
        }
      });
      return;
    }

    if (text === STATISTICS_BTN) {
      const stats = userStats.get(chatId) || { checked: 0 };
      bot.sendMessage(chatId, `📊 *Sizning statistikangiz*\n\nTekshirilgan vazifalar soni: ${stats.checked}`, { parse_mode: 'Markdown' });
      return;
    }

    // Handle image upload
    if (msg.photo) {
      const state = userStates.get(chatId);
      if (state !== 'waiting_for_image') {
        bot.sendMessage(chatId, "Iltimos, oldin 'Uyga vazifani tekshirish' tugmasini bosing.");
        return;
      }

      // Reset state
      userStates.set(chatId, 'idle');
      
      const processingMsg = await bot.sendMessage(chatId, "Rasm qabul qilindi. Tahlil qilinmoqda, iltimos kuting... ⏳");

      try {
        // Get the highest resolution photo (the last one in the array)
        const photo = msg.photo[msg.photo.length - 1];
        const fileId = photo.file_id;
        
        // Get file path from Telegram API
        const file = await bot.getFile(fileId);
        if (!file.file_path) {
          throw new Error("Rasm yo'li topilmadi.");
        }

        const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        
        // Download the image
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageBase64 = buffer.toString('base64');
        const mimeType = "image/jpeg"; // Telegram photos are JPEGs

        // Evaluate using Gemini
        const evaluation = await evaluateHomework([{ imageBase64, mimeType }]);

        // Update stats
        const stats = userStats.get(chatId) || { checked: 0 };
        stats.checked += 1;
        userStats.set(chatId, stats);

        // Format response
        const statusEmoji = evaluation.isCorrect ? "✅" : (evaluation.isPartiallyCorrect ? "⚠️" : "❌");
        const statusText = evaluation.isCorrect ? "To'g'ri" : (evaluation.isPartiallyCorrect ? "Qisman to'g'ri" : "Noto'g'ri");
        
        let report = `Natija: ${statusEmoji} ${statusText}\n`;
        report += `Baho: ${evaluation.score}/10\n\n`;
        report += `Fikr va tavsiyalar:\n${evaluation.feedback}\n`;
        
        if (evaluation.errorSteps && evaluation.errorSteps.length > 0) {
          report += `\nXatoliklar:\n`;
          evaluation.errorSteps.forEach((step: string, index: number) => {
            report += `${index + 1}. ${step}\n`;
          });
        }

        // Send evaluation back to user
        // Split report into chunks of max 4000 chars to avoid "message is too long" error
        const MAX_LENGTH = 4000;
        if (report.length <= MAX_LENGTH) {
          await bot.sendMessage(chatId, report);
        } else {
          // Split by chunks
          const lines = report.split('\n');
          let currentChunk = '';
          for (const line of lines) {
            if ((currentChunk + line + '\n').length > MAX_LENGTH) {
              await bot.sendMessage(chatId, currentChunk);
              currentChunk = line + '\n';
            } else {
              currentChunk += line + '\n';
            }
          }
          if (currentChunk.trim().length > 0) {
            await bot.sendMessage(chatId, currentChunk);
          }
        }
        // After sending report, show the main menu again
        bot.sendMessage(chatId, "Yana qanday yordam bera olaman?", mainMenuKeyboard);

      } catch (error: any) {
        console.error("Bot error:", error);
        await bot.sendMessage(chatId, `Kechirasiz, xatolik yuz berdi: ${error.message || "Noma'lum xato"}`);
        bot.sendMessage(chatId, "Asosiy menyu", mainMenuKeyboard);
      } finally {
        // Delete the processing message
        bot.deleteMessage(chatId, processingMsg.message_id).catch(() => {});
      }
      return;
    }

    // Default fallback
    bot.sendMessage(chatId, "Iltimos, tugmalardan birini tanlang yoki /start buyrug'ini yuboring.", mainMenuKeyboard);
  });

  console.log("Telegram bot successfully started");
  return bot;
}
