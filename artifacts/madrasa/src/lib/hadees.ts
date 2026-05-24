export interface Hadees {
  id: number;
  arabic: string;
  en: string;
  ur: string;
  reference: string;
}

export const HADEES_LIST: Hadees[] = [
  { id: 1,  arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", en: "Actions are judged by intentions.", ur: "اعمال کا دارومدار نیتوں پر ہے۔", reference: "Sahih Bukhari 1" },
  { id: 2,  arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", en: "Seeking knowledge is obligatory upon every Muslim.", ur: "علم حاصل کرنا ہر مسلمان پر فرض ہے۔", reference: "Ibn Majah 224" },
  { id: 3,  arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", en: "The best among you are those who learn the Qur'an and teach it.", ur: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔", reference: "Sahih Bukhari 5027" },
  { id: 4,  arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", en: "None of you truly believes until he loves for his brother what he loves for himself.", ur: "تم میں سے کوئی شخص اس وقت تک مومن نہیں ہوتا جب تک وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔", reference: "Sahih Bukhari 13" },
  { id: 5,  arabic: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", en: "Allah is beautiful and loves beauty.", ur: "اللہ تعالیٰ خوبصورت ہے اور خوبصورتی کو پسند کرتا ہے۔", reference: "Sahih Muslim 91" },
  { id: 6,  arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ", en: "The strong believer is better and more beloved to Allah than the weak believer.", ur: "مومنِ قوی مومنِ ضعیف سے بہتر اور اللہ کو زیادہ محبوب ہے۔", reference: "Sahih Muslim 2664" },
  { id: 7,  arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", en: "Whoever believes in Allah and the Last Day should speak good or remain silent.", ur: "جو شخص اللہ اور یوم آخرت پر ایمان رکھتا ہے، وہ اچھی بات کہے یا خاموش رہے۔", reference: "Sahih Bukhari 6475" },
  { id: 8,  arabic: "لَا تَغْضَبْ", en: "Do not become angry.", ur: "غصہ نہ کرو۔", reference: "Sahih Bukhari 6116" },
  { id: 9,  arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ", en: "Cleanliness is half of faith.", ur: "پاکیزگی ایمان کا آدھا حصہ ہے۔", reference: "Sahih Muslim 223" },
  { id: 10, arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", en: "The best of you is the best to his family.", ur: "تم میں سب سے بہتر وہ ہے جو اپنے گھر والوں کے لیے بہتر ہو۔", reference: "Tirmidhi 3895" },
  { id: 11, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", en: "A Muslim is one from whose tongue and hand other Muslims are safe.", ur: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔", reference: "Sahih Bukhari 10" },
  { id: 12, arabic: "مَنْ لَا يَرْحَمْ لَا يُرْحَمْ", en: "Whoever does not show mercy will not be shown mercy.", ur: "جو رحم نہیں کرتا اس پر رحم نہیں کیا جاتا۔", reference: "Sahih Bukhari 7376" },
  { id: 13, arabic: "الدِّينُ النَّصِيحَةُ", en: "Religion is sincere advice.", ur: "دین خیر خواہی کا نام ہے۔", reference: "Sahih Muslim 55" },
  { id: 14, arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", en: "Whoever cheats us is not one of us.", ur: "جس نے ہمیں دھوکہ دیا وہ ہم میں سے نہیں۔", reference: "Sahih Muslim 101" },
  { id: 15, arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", en: "Smiling at your brother is charity.", ur: "اپنے بھائی کے سامنے مسکرانا صدقہ ہے۔", reference: "Tirmidhi 1956" },
  { id: 16, arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", en: "A good word is charity.", ur: "اچھی بات کہنا بھی صدقہ ہے۔", reference: "Sahih Bukhari 2989" },
  { id: 17, arabic: "مَنْ صَمَتَ نَجَا", en: "Whoever stays silent is saved.", ur: "جو خاموش رہا اس نے نجات پائی۔", reference: "Tirmidhi 2501" },
  { id: 18, arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ", en: "Allah loves that when one of you does a work, he perfects it.", ur: "اللہ تعالیٰ پسند کرتا ہے کہ جب تم میں سے کوئی کام کرے تو اسے بہترین طریقے سے کرے۔", reference: "Tabarani" },
  { id: 19, arabic: "الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ", en: "Paradise lies beneath the feet of mothers.", ur: "جنت ماؤں کے قدموں کے نیچے ہے۔", reference: "Nasai 3104" },
  { id: 20, arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", en: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.", ur: "جو علم کی تلاش میں راستہ چلے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔", reference: "Sahih Muslim 2699" },
  { id: 21, arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", en: "A believer to another believer is like a building whose parts strengthen each other.", ur: "ایک مومن دوسرے مومن کے لیے عمارت کی طرح ہے، جس کا ایک حصہ دوسرے کو مضبوط کرتا ہے۔", reference: "Sahih Bukhari 481" },
  { id: 22, arabic: "مَنْ كَانَ آخِرُ كَلَامِهِ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ", en: "Whoever's last words are 'La ilaha illallah' will enter Paradise.", ur: "جس کا آخری کلمہ لا الٰہ الا اللہ ہو، وہ جنت میں داخل ہوگا۔", reference: "Abu Dawud 3116" },
  { id: 23, arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ", en: "Truthfulness leads to righteousness.", ur: "بے شک سچائی نیکی کی طرف رہنمائی کرتی ہے۔", reference: "Sahih Bukhari 6094" },
  { id: 24, arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", en: "Fear Allah wherever you are.", ur: "جہاں کہیں بھی ہو، اللہ سے ڈرتے رہو۔", reference: "Tirmidhi 1987" },
  { id: 25, arabic: "مَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ يَوْمَ الْقِيَامَةِ", en: "Whoever conceals a Muslim's faults, Allah will conceal his on the Day of Judgment.", ur: "جو کسی مسلمان کا پردہ ڈھانپے، اللہ قیامت کے دن اس کا پردہ ڈھانپے گا۔", reference: "Sahih Bukhari 2442" },
  { id: 26, arabic: "أَفْضَلُ الصَّدَقَةِ سَقْيُ الْمَاءِ", en: "The best charity is giving water to drink.", ur: "سب سے افضل صدقہ پانی پلانا ہے۔", reference: "Abu Dawud 1679" },
  { id: 27, arabic: "الصَّلَاةُ عَلَى وَقْتِهَا", en: "Prayer at its proper time (is the best deed).", ur: "نماز وقت پر پڑھنا (سب سے بہتر عمل ہے)۔", reference: "Sahih Bukhari 527" },
  { id: 28, arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ", en: "Whoever performs Hajj for Allah and avoids obscenity and sin will return as on the day his mother gave birth to him.", ur: "جو اللہ کے لیے حج کرے اور فحش گوئی و گناہ سے بچے، وہ ایسے لوٹے گا جیسے ماں نے اسے جنا تھا۔", reference: "Sahih Bukhari 1521" },
  { id: 29, arabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ", en: "Islam is built on five (pillars).", ur: "اسلام کی بنیاد پانچ ستونوں پر ہے۔", reference: "Sahih Bukhari 8" },
  { id: 30, arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", en: "Whoever fasts in Ramadan with faith and seeking reward, his previous sins are forgiven.", ur: "جو رمضان کے روزے ایمان اور ثواب کی نیت سے رکھے، اس کے پچھلے گناہ بخش دیے جاتے ہیں۔", reference: "Sahih Bukhari 38" },
  { id: 31, arabic: "إِنَّ اللَّهَ كَتَبَ الْإِحْسَانَ عَلَى كُلِّ شَيْءٍ", en: "Allah has prescribed excellence in everything.", ur: "اللہ نے ہر چیز میں احسان (بہترین انداز) کو لازم کیا ہے۔", reference: "Sahih Muslim 1955" },
  { id: 32, arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", en: "The most beloved deeds to Allah are those done consistently, even if small.", ur: "اللہ کو سب سے محبوب وہ عمل ہے جو ہمیشہ کیا جائے، چاہے تھوڑا ہی ہو۔", reference: "Sahih Bukhari 6464" },
  { id: 33, arabic: "مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ", en: "Whoever guides someone to good has the same reward as the one who does it.", ur: "جو نیکی کی طرف رہنمائی کرے، اسے کرنے والے کے برابر اجر ملتا ہے۔", reference: "Sahih Muslim 1893" },
  { id: 34, arabic: "الْجَارُ ثُمَّ الدَّارُ", en: "The neighbour first, then the home.", ur: "پہلے پڑوسی، پھر گھر۔", reference: "Bayhaqi" },
  { id: 35, arabic: "إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الْأَخْلَاقِ", en: "I was only sent to perfect noble character.", ur: "مجھے تو اخلاقِ حسنہ کی تکمیل کے لیے بھیجا گیا ہے۔", reference: "Muwatta Malik" },
  { id: 36, arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", en: "The upper hand (giver) is better than the lower hand (receiver).", ur: "اوپر والا ہاتھ (دینے والا) نیچے والے ہاتھ (لینے والے) سے بہتر ہے۔", reference: "Sahih Bukhari 1429" },
  { id: 37, arabic: "إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ", en: "Beware of suspicion, for suspicion is the most untrue speech.", ur: "بدگمانی سے بچو، کیونکہ بدگمانی سب سے جھوٹی بات ہے۔", reference: "Sahih Bukhari 6064" },
  { id: 38, arabic: "مَنْ تَوَاضَعَ لِلَّهِ رَفَعَهُ اللَّهُ", en: "Whoever humbles himself for Allah, Allah will raise him.", ur: "جو اللہ کے لیے عاجزی کرے، اللہ اسے بلند کرتا ہے۔", reference: "Sahih Muslim 2588" },
  { id: 39, arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ", en: "The best of people are those most beneficial to people.", ur: "بہترین لوگ وہ ہیں جو دوسروں کے لیے سب سے زیادہ نفع بخش ہوں۔", reference: "Daraqutni" },
  { id: 40, arabic: "ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ", en: "Invite to the way of your Lord with wisdom and good instruction.", ur: "اپنے رب کے راستے کی طرف حکمت اور اچھی نصیحت سے بلاؤ۔", reference: "Qur'an 16:125" },
];
