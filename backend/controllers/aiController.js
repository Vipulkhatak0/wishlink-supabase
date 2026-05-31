const asyncHandler = require('../middleware/async');

const MESSAGES = {
  birthday: {
    english: (r, rel) => `Dearest ${r}, on this special day, every memory we've shared shines brighter than ever. Your ${rel} presence in my life is the greatest gift. May this birthday mark the beginning of your most beautiful chapter yet. With all my love and warmest wishes! 🎂💕`,
    hindi: (r, rel) => `प्रिय ${r}, आज तुम्हारे जन्मदिन पर दिल से बधाई! तुम्हारे साथ बिताए हर पल को मैं संजोए रखता/रखती हूं। तुम मेरे जीवन में एक ${rel} की तरह हो — हमेशा साथ, हमेशा खास। यह दिन तुम्हारे लिए बेहद खुशियों भरा हो। जन्मदिन मुबारक! 🎂💖`,
    punjabi: (r, rel) => `ਪਿਆਰੇ ${r}, ਤੁਹਾਡੇ ਜਨਮਦਿਨ 'ਤੇ ਦਿਲੋਂ ਮੁਬਾਰਕਾਂ! ਤੁਸੀਂ ਮੇਰੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਇੱਕ ਚੰਗੇ ${rel} ਵਾਂਗੂ ਹੋ। ਰੱਬ ਕਰੇ ਤੁਹਾਡੀ ਹਰ ਖੁਆਹਿਸ਼ ਪੂਰੀ ਹੋਵੇ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ! 🎉`,
  },
  anniversary: {
    english: (r, rel) => `${r}, every year with you feels like a beautiful new beginning. You are my home, my peace, my greatest adventure. Happy Anniversary, my love — here's to forever and beyond! 💍✨`,
    hindi: (r, rel) => `${r}, तुम्हारे साथ हर साल एक नई कहानी की तरह है। तुम मेरी ज़िंदगी के सबसे खूबसूरत हिस्से हो। सालगिरह मुबारक! हमारा प्यार यूं ही बढ़ता रहे। 💑`,
    punjabi: (r, rel) => `${r}, ਤੇਰੇ ਨਾਲ ਹਰ ਸਾਲ ਇੱਕ ਨਵੀਂ ਕਹਾਣੀ ਵਾਂਗੂ ਹੈ। ਸਾਲਗਿਰਾਹ ਮੁਬਾਰਕ! ਸਾਡਾ ਪਿਆਰ ਹਮੇਸ਼ਾ ਇਸ ਤਰ੍ਹਾਂ ਹੀ ਮਹਿਕਦਾ ਰਹੇ। 💕`,
  },
  proposal: {
    english: (r) => `${r}, from the very first moment I saw you, I knew my heart had found its forever home. Will you make me the happiest person alive? Will you be mine — today, tomorrow, and always? 💍❤️`,
    hindi: (r) => `${r}, जिस दिन से तुम मेरी ज़िंदगी में आई/आए हो, हर दिन खूबसूरत हो गया है। क्या तुम मेरी ज़िंदगी की सबसे प्यारी कहानी बनोगी/बनोगे? 💍`,
    punjabi: (r) => `${r}, ਜਦੋਂ ਤੋਂ ਤੁਸੀਂ ਮੇਰੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਆਏ ਹੋ, ਹਰ ਦਿਨ ਸੋਹਣਾ ਲੱਗਦਾ ਹੈ। ਕੀ ਤੁਸੀਂ ਮੇਰੇ ਹੋਵੋਗੇ? 💍`,
  },
  mother: {
    english: (r) => `Dear ${r || 'Mom'}, no words can ever capture the depth of gratitude and love I carry for you. You are my first teacher, my strongest pillar, and my forever safe place. Thank you for everything. I love you infinitely! 🌸`,
    hindi: (r) => `माँ, तेरे प्यार की कोई मिसाल नहीं। तूने जो दिया है वो दुनिया की कोई चीज़ नहीं दे सकती। तुझसे बेहद प्यार है और हमेशा रहेगा। 🌸`,
    punjabi: (r) => `ਮਾਂ, ਤੇਰੇ ਪਿਆਰ ਦੀ ਕੋਈ ਤੁਲਨਾ ਨਹੀਂ। ਤੂੰ ਮੇਰੀ ਜ਼ਿੰਦਗੀ ਦੀ ਸਭ ਤੋਂ ਵੱਡੀ ਤਾਕਤ ਹੈਂ। ਬਹੁਤ ਪਿਆਰ ਹੈ ਤੈਨੂੰ। 🌸`,
  },
  graduation: {
    english: (r) => `${r}, you did it! All those sleepless nights, the hard work, the tears — they all led to this incredible moment. This is just the beginning of your amazing story. Congratulations! 🎓✨`,
    hindi: (r) => `${r}, तुमने कर दिखाया! यह सफलता तुम्हारी मेहनत का फल है। अब एक नई दुनिया तुम्हारा इंतज़ार कर रही है। बधाई हो! 🎓`,
    punjabi: (r) => `${r}, ਤੁਸੀਂ ਇਹ ਕਰ ਲਿਆ! ਮਿਹਨਤ ਦਾ ਫਲ ਮਿਲਿਆ। ਵਧਾਈਆਂ! 🎓`,
  },
};

exports.generateMessage = asyncHandler(async (req, res) => {
  const { occasion, receiverName, relationship, language } = req.body;
  const lang = language || 'english';
  const occasionMessages = MESSAGES[occasion] || MESSAGES.birthday;
  const langFn = occasionMessages[lang] || occasionMessages.english;
  const message = langFn(receiverName || 'my dear', relationship || 'special person');
  res.status(200).json({ success: true, message, occasion, language: lang });
});

exports.generateLoveLetter = asyncHandler(async (req, res) => {
  const { name, language } = req.body;
  const letters = {
    english: `My dearest ${name}, where do I even begin? You are the reason my mornings feel like poetry and my evenings feel like home. Every laugh we share, every silence we sit in — it all feels like the most beautiful gift. I don't know what I did to deserve someone like you, but I promise to spend every day being worthy of your love. You are my person — completely and forever. 💕`,
    hindi: `प्रिय ${name}, मेरे शब्दों में इतनी ताकत नहीं कि मैं तुम्हारे लिए अपने दिल की बात कह सकूं। लेकिन फिर भी... तुम मेरे हर सुबह की खुशी हो, हर रात की सुकून। तुम्हारे साथ हर पल ऐसा लगता है जैसे ज़िंदगी सच में जीने लायक है। मैं तुमसे बेपनाह मोहब्बत करता/करती हूं। 💕`,
    punjabi: `ਪਿਆਰੇ ${name}, ਤੂੰ ਮੇਰੀ ਜ਼ਿੰਦਗੀ ਦੀ ਸਭ ਤੋਂ ਸੁੰਦਰ ਕਵਿਤਾ ਹੈਂ। ਤੇਰੇ ਨਾਲ ਹਰ ਪਲ ਖਾਸ ਲੱਗਦਾ ਹੈ। ਮੈਂ ਤੈਨੂੰ ਬੇਹੱਦ ਪਿਆਰ ਕਰਦਾ/ਕਰਦੀ ਹਾਂ। 💕`,
  };
  res.status(200).json({ success: true, letter: letters[language] || letters.english });
});
