/**
 * Banglish Smart Converter
 * Context-aware Banglish (Romanized Bengali) → Unicode Bengali
 * 500+ common words + phonetic fallback + shareable state support
 */

// ─── Core Dictionary: 500+ most common Banglish words ───
const WORD_MAP = new Map([
  // Pronouns (25)
  ['ami','আমি'], ['amr','আমার'], ['amra','আমরা'],
  ['tumi','তুমি'], ['tomr','তোমার'], ['tomra','তোমরা'],
  ['apni','আপনি'], ['apnr','আপনার'], ['apnra','আপনারা'],
  ['she','সে'], ['tar','তার'], ['tara','তারা'],
  ['o','ও'], ['or','ওর'], ['ora','ওরা'],
  ['ke','কে'], ['kake','কাকে'], ['kar','কার'],
  ['ki','কী'], ['kichu','কিছু'], ['kew','কেউ'],
  ['sobai','সবাই'], ['keo','কেউ'], ['nijei','নিজেই'],
  ['nije','নিজে'], ['nijer','নিজের'],

  // Common verbs - present (40)
  ['achi','আছি'], ['acho','আছো'], ['ache','আছে'], ['achen','আছেন'],
  ['jai','যাই'], ['jao','যাও'], ['jaye','যায়'], ['jan','যান'],
  ['asi','আসি'], ['aso','আসো'], ['ase','আসে'], ['asen','আসেন'],
  ['kori','করি'], ['koro','করো'], ['kore','করে'], ['koren','করেন'],
  ['khai','খাই'], ['khao','খাও'], ['khay','খায়'], ['khan','খান'],
  ['pai','পাই'], ['pao','পাও'], ['pay','পায়'], ['pan','পান'],
  ['boli','বলি'], ['bolo','বলো'], ['bole','বলে'], ['bolen','বলেন'],
  ['dei','দেই'], ['deo','দেও'], ['dey','দেয়'], ['den','দেন'],
  ['nei','নেই'], ['neo','নেও'], ['ney','নেয়'], ['nen','নেন'],
  ['chai','চাই'], ['chao','চাও'], ['chay','চায়'],
  ['jani','জানি'], ['jano','জানো'], ['jane','জানে'], ['janen','জানেন'],
  ['pari','পারি'], ['paro','পারো'], ['pare','পারে'], ['paren','পারেন'],

  // Common verbs - past (30)
  ['pelam','পেলাম'], ['pelen','পেলেন'], ['peyechi','পেয়েছি'],
  ['diyechi','দিয়েছি'], ['diyeche','দিয়েছে'], ['diyechilo','দিয়েছিলো'],
  ['korechi','করেছি'], ['koreche','করেছে'], ['korechilo','করেছিলো'],
  ['gechi','গেছি'], ['geche','গেছে'], ['gechilo','গেছিলো'],
  ['eshechi','এসেছি'], ['esheche','এসেছে'], ['eshechilo','এসেছিলো'],
  ['bolchi','বলছি'], ['bolche','বলছে'], ['bolchilo','বলছিলো'],
  ['portechi','পড়তেছি'], ['porteche','পড়তেছে'], ['portechilo','পড়তেছিলো'],
  ['khetchi','খেতেছি'], ['khetche','খেতেছে'], ['khetchilo','খেতেছিলো'],
  ['jetechi','যেতেছি'], ['jeteche','যেতেছে'], ['jetechilo','যেতেছিলো'],

  // Common verbs - future (25)
  ['asbe','আসবে'], ['asbo','আসবো'], ['asben','আসবেন'],
  ['jabo','যাবো'], ['jabe','যাবে'], ['jaben','যাবেন'],
  ['korbo','করবো'], ['korbe','করবে'], ['korben','করবেন'],
  ['parbo','পারবো'], ['parbe','পারবে'], ['parben','পারবেন'],
  ['lagbe','লাগবে'], ['lagbo','লাগবো'],
  ['hobe','হবে'], ['hobo','হবো'], ['hoben','হবেন'],
  ['thakbo','থাকবো'], ['thakbe','থাকবে'], ['thake','থাকে'], ['thaki','থাকি'],
  ['bolbo','বলবো'], ['bolbe','বলবে'], ['bolben','বলবেন'],
  ['shunbo','শুনবো'], ['shunbe','শুনবে'],

  // Adjectives (35)
  ['valo','ভালো'], ['bhalo','ভালো'], ['kharap','খারাপ'],
  ['sundor','সুন্দর'], ['sotto','সত্য'], ['mittha','মিথ্যা'],
  ['boro','বড়'], ['choto','ছোট'], ['lomba','লম্বা'],
  ['mota','মোটা'], ['patla','পাতলা'], ['chikna','চিকন'],
  ['taja','তাজা'], ['puraton','পুরাতন'], ['notun','নতুন'],
  ['shobuj','সবুজ'], ['lal','লাল'], ['nil','নীল'],
  ['shada','সাদা'], ['kalo','কালো'], ['holud','হলুদ'],
  ['baje','বাজে'], ['onek','অনেক'], ['oneke','অনেকে'],
  ['sab','সব'], ['sob','সব'], ['sokol','সকল'],
  ['ek','এক'], ['dui','দুই'], ['tin','তিন'], ['char','চার'],
  ['panch','পাঁচ'], ['choy','ছয়'], ['sat','সাত'], ['at','আট'], ['noy','নয়'], ['dosh','দশ'],
  ['sostho','সুস্থ'], ['bimar','বিমার'], ['asthir','অস্থির'], ['shanto','শান্ত'],
  ['khusi','খুশি'], ['dukhi','দুঃখী'], ['raag','রাগ'],
  ['bhoy','ভয়'], ['sahosh','সাহস'],
  ['shohoj','সহজ'], ['kothin','কঠিন'],
  ['moja','মজা'], ['mojar','মজার'],
  ['besh','বেশি'], ['kom','কম'], ['besi','বেশি'],

  // Common nouns - people (30)
  ['manush','মানুষ'], ['meye','মেয়ে'], ['chele','ছেলে'],
  ['baba','বাবা'], ['ma','মা'], ['ammu','আম্মু'], ['abbu','আব্বু'],
  ['dada','দাদা'], ['dadi','দাদী'], ['nana','নানা'], ['nani','নানী'],
  ['mama','মামা'], ['mami','মামী'], ['kaka','কাকা'], ['kaki','কাকী'],
  ['bhai','ভাই'], ['bon','বোন'], ['bhaiya','ভাইয়া'],
  ['bondhu','বন্ধু'], ['bandhobi','বান্ধবী'], ['shohokormi','সহকর্মী'],
  ['shikkhok','শিক্ষক'], ['shikkhika','শিক্ষিকা'], ['chatro','ছাত্র'], ['chatri','ছাত্রী'],
  ['daktar','ডাক্তার'], ['police','পুলিশ'], ['soldier','সৈনিক'],

  // Common nouns - places (25)
  ['bari','বাড়ি'], ['ghor','ঘর'], ['basha','বাসা'], ['flat','ফ্ল্যাট'],
  ['hotel','হোটেল'], ['bajar','বাজার'], ['dukan','দোকান'], ['office','অফিস'],
  ['school','স্কুল'], ['college','কলেজ'], ['university','ইউনিভার্সিটি'],
  ['hospital','হাসপাতাল'], ['mosjid','মসজিদ'], ['mondir','মন্দির'],
  ['rasta','রাস্তা'], ['ghat','ঘাট'],
  ['dhaka','ঢাকা'], ['chittagong','চট্টগ্রাম'], ['sylhet','সিলেট'],
  ['khulna','খুলনা'], ['barishal','বরিশাল'], ['rangpur','রংপুর'],
  ['bangladesh','বাংলাদেশ'], ['india','ভারত'],

  // Common nouns - things (25)
  ['gari','গাড়ি'], ['bus','বাস'], ['train','ট্রেন'], ['plane','বিমান'],
  ['bike','বাইক'], ['boi','বই'], ['khata','খাতা'], ['kolom','কলম'],
  ['phone','ফোন'], ['mobile','মোবাইল'], ['computer','কম্পিউটার'],
  ['tv','টিভি'], ['khabar','খাবার'], ['pani','পানি'], ['dudh','দুধ'],
  ['bhat','ভাত'], ['roti','রুটি'], ['dal','ডাল'],
  ['mangsho','মাংস'], ['mach','মাছ'], ['dim','ডিম'],
  ['taka','টাকা'], ['poisha','পয়সা'], ['dollar','ডলার'],

  // Time (20)
  ['shokal','সকাল'], ['dupur','দুপুর'], ['bikel','বিকেল'],
  ['raat','রাত'], ['rat','রাত'], ['din','দিন'],
  ['aj','আজ'], ['kal','কাল'], ['ekhon','এখন'],
  ['shomoy','সময়'], ['mohurto','মুহূর্ত'], ['khon','ক্ষণ'],
  ['taratari','তাড়াতাড়ি'], ['age','আগে'], ['pore','পরে'],
  ['sara din','সারা দিন'], ['sara rat','সারা রাত'],
  ['sara shoptah','সারা সপ্তাহ'], ['sara mash','সারা মাস'], ['sara bochor','সারা বছর'],

  // Conjunctions / Particles (30)
  ['ar','আর'], ['abar','আবার'], ['jodi','যদি'], ['tahole','তাহলে'],
  ['karon','কারণ'], ['jonno','জন্য'], ['jonnye','জন্য'],
  ['sate','সাথে'], ['sathe','সাথে'], ['dara','দ্বারা'],
  ['moddhe','মধ্যে'], ['bitor','ভিতর'], ['bahire','বাইরে'],
  ['upore','উপরে'], ['niche','নিচে'], ['pashe','পাশে'],
  ['jokhon','যখন'], ['tokhon','তখন'], ['jemon','যেমন'],
  ['temon','তেমন'], ['je','যে'], ['ja','যা'], ['jara','যারা'],
  ['kintu','কিন্তু'], ['tabe','তবে'], ['tai','তাই'],
  ['tao','তাও'], ['hoyto','হয়তো'], ['keno','কেন'],
  ['kothay','কোথায়'], ['kivabe','কিভাবে'], ['kokhon','কখন'], ['koto','কত'],
  ['jeno','যেন'], ['jate','যাতে'], ['odi','যদিও'], ['tobuo','তবুও'],
  ['porojonto','পর্যন্ত'], ['shudu','শুধু'], ['shudhu','শুধু'],
  ['matro','মাত্র'], ['proti','প্রতি'], ['prottek','প্রত্যেক'],

  // Greetings / Social (25)
  ['assalamualaikum','আসসালামু আলাইকুম'], ['walaikumussalam','ওয়ালাইকুমুস সালাম'],
  ['adab','আদাব'], ['nomoshkar','নমস্কার'],
  ['hello','হ্যালো'], ['hi','হাই'], ['bye','বাই'],
  ['shubho shokal','শুভ সকাল'], ['shubho dupur','শুভ দুপুর'],
  ['shubho ratri','শুভ রাত্রি'], ['shubho bikel','শুভ বিকেল'],
  ['eid mubarak','ঈদ মুবারক'], ['shubho eid','শুভ ঈদ'],
  ['shubho jonmodin','শুভ জন্মদিন'],
  ['dhonnobad','ধন্যবাদ'], ['shukria','শুকরিয়া'],
  ['muph','মাফ'], ['maaf','মাফ'], ['maaf korben','মাফ করবেন'],
  ['kosto','কষ্ট'], ['dukho','দুঃখ'], ['anondo','আনন্দ'],
  ['bhalobasha','ভালোবাসা'], ['bhalobasi','ভালোবাসি'], ['bhalobaso','ভালোবাসো'],
  ['shagotom','স্বাগতম'], ['biday','বিদায়'],
  ['shustho thakben','সুস্থ থাকবেন'], ['bhalo thakben','ভালো থাকবেন'],
  ['allah hafez','আল্লাহ হাফেজ'],

  // Tech / Social Media (30)
  ['facebook','ফেসবুক'], ['messenger','মেসেঞ্জার'], ['whatsapp','হোয়াটসঅ্যাপ'],
  ['youtube','ইউটিউব'], ['tiktok','টিকটক'], ['instagram','ইনস্টাগ্রাম'],
  ['twitter','টুইটার'], ['linkedin','লিংকডইন'], ['github','গিটহাব'],
  ['google','গুগল'], ['email','ইমেইল'], ['website','ওয়েবসাইট'],
  ['password','পাসওয়ার্ড'], ['username','ইউজারনেম'],
  ['login','লগইন'], ['logout','লগআউট'], ['signup','সাইনআপ'],
  ['download','ডাউনলোড'], ['upload','আপলোড'], ['share','শেয়ার'],
  ['like','লাইক'], ['comment','কমেন্ট'], ['follow','ফলো'],
  ['subscribe','সাবস্ক্রাইব'], ['message','মেসেজ'], ['call','কল'],
  ['video','ভিডিও'], ['photo','ফটো'], ['audio','অডিও'],
  ['music','মিউজিক'], ['song','গান'], ['movie','মুভি'],
  ['wifi','ওয়াইফাই'], ['internet','ইন্টারনেট'], ['app','অ্যাপ'],
  ['software','সফটওয়্যার'], ['code','কোড'], ['bug','বাগ'],
  ['error','এরর'], ['update','আপডেট'],

  // Common phrases (40)
  ['ki khobor','কি খবর'], ['kemon cholche','কেমন চলছে'],
  ['sab thik','সব ঠিক'], ['sab bhalo','সব ভালো'],
  ['ki hoyeche','কি হয়েছে'], ['ki hobe','কি হবে'],
  ['kothay jaite chai','কোথায় যেতে চাই'],
  ['kake dorkar','কাকে দরকার'], ['kake lagbe','কাকে লাগবে'],
  ['ki korte hobe','কি করতে হবে'], ['ki kora jabe','কি করা যাবে'],
  ['ki kora uchit','কি করা উচিত'], ['ki kora dorkar','কি করা দরকার'],
  ['ki bolte chai','কি বলতে চাই'], ['ki bolte chay','কি বলতে চায়'],
  ['ki shunte chai','কি শুনতে চাই'], ['ki dekhte chai','কি দেখতে চাই'],
  ['ki pete chai','কি পেতে চাই'], ['ki khete chai','কি খেতে চাই'],
  ['ki nite chai','কি নিতে চাই'], ['ki dite chai','কি দিতে চাই'],
  ['ki hote pare','কি হতে পারে'], ['ki hocche','কি হচ্ছে'],
  ['ki hobena','কি হবে না'], ['ki hobe na','কি হবে না'],
  ['ki korte pari','কি করতে পারি'], ['ki korte parbo','কি করতে পারবো'],
  ['ki korte parbe','কি করতে পারবে'], ['ki korte hoy','কি করতে হয়'],
  ['ki korte lage','কি করতে লাগে'], ['ki korte hobe','কি করতে হবে'],
  ['ki kora jay','কি করা যায়'], ['ki bolbo','কি বলবো'],
  ['ki bolbe','কি বলবে'], ['ki bolben','কি বলবেন'],
  ['ki shunbo','কি শুনবো'], ['ki shunbe','কি শুনবে'],
  ['ki dekhechi','কি দেখেছি'], ['ki dekheche','কি দেখেছে'],
  ['ki peyechi','কি পেয়েছি'], ['ki peyeche','কি পেয়েছে'],
  ['ki kheyechi','কি খেয়েছি'], ['ki kheyeche','কি খেয়েছে'],
  ['ki niyechi','কি নিয়েছি'], ['ki niyeche','কি নিয়েছে'],
  ['ki diyechi','কি দিয়েছি'], ['ki diyeche','কি দিয়েছে'],

  // Emotions / Feelings (20)
  ['bhalo laglo','ভালো লাগলো'], ['bhalo lage','ভালো লাগে'],
  ['bhalo lagbe','ভালো লাগবে'], ['bhalo lagena','ভালো লাগে না'],
  ['moja laglo','মজা লাগলো'], ['moja lage','মজা লাগে'],
  ['kharap laglo','খারাপ লাগলো'], ['kharap lage','খারাপ লাগে'],
  ['kosto laglo','কষ্ট লাগলো'], ['kosto lage','কষ্ট লাগে'],
  ['dukh laglo','দুঃখ লাগলো'], ['dukh lage','দুঃখ লাগে'],
  ['anondo laglo','আনন্দ লাগলো'], ['anondo lage','আনন্দ লাগে'],
  ['shanti laglo','শান্তি লাগলো'], ['shanti lage','শান্তি লাগে'],
  ['bhoy laglo','ভয় লাগলো'], ['bhoy lage','ভয় লাগে'],
  ['bhalobasha laglo','ভালোবাসা লাগলো'], ['bhalobasha lage','ভালোবাসা লাগে'],

  // Food (20)
  ['ranna','রান্না'], ['ranna korbo','রান্না করবো'],
  ['biryani','বিরিয়ানি'], ['polao','পোলাও'], ['khichuri','খিচুড়ি'],
  ['shorshe ilish','সরষে ইলিশ'], ['dal bhat','ডাল ভাত'],
  ['roshogolla','রসগোল্লা'], ['mishti','মিষ্টি'],
  ['shingara','সিঙ্গারা'], ['jilapi','জিলাপি'], ['pitha','পিঠা'],
  ['cha','চা'], ['coffee','কফি'], ['doi','দই'],
  ['alu vorta','আলু ভর্তা'], ['begun vorta','বেগুন ভর্তা'],

  // Weather / Nature (15)
  ['roddur','রোদ্দুর'], ['gorom','গরম'], ['brishti','বৃষ্টি'],
  ['borsha','বর্ষা'], ['sheet','শীত'], ['sheetkal','শীতকাল'],
  ['akash','আকাশ'], ['megh','মেঘ'], ['meghla','মেঘলা'],
  ['tara','তারা'], ['chad','চাঁদ'], ['surjo','সূর্য'],
  ['batash','বাতাস'], ['hawa','হাওয়া'], ['ful','ফুল'],

  // Education / Career (15)
  ['porashona','পড়াশুনা'], ['lekha','লেখা'], ['porano','পড়ানো'],
  ['shikkha','শিক্ষা'], ['shikkhok','শিক্ষক'], ['chatro','ছাত্র'],
  ['exam','এক্সাম'], ['result','রেজাল্ট'], ['pass','পাস'], ['fail','ফেল'],
  ['chakri','চাকরি'], ['bekar','বেকার'], ['office e jabo','অফিসে যাবো'],
  ['presentation dibo','প্রেজেন্টেশন দিবো'], ['report likhbo','রিপোর্ট লিখবো'],

  // Money (10)
  ['taka','টাকা'], ['poisha','পয়সা'], ['dollar','ডলার'],
  ['bank','ব্যাংক'], ['loan','লোন'], ['profit','প্রফিট'],
  ['loss','লস'], ['salary','স্যালারি'], ['dam','দাম'], ['dam koto','দাম কত'],

  // Sports (15)
  ['cricket','ক্রিকেট'], ['football','ফুটবল'], ['player','প্লেয়ার'],
  ['match','ম্যাচ'], ['world cup','ওয়ার্ল্ড কাপ'],
  ['bangladesh team','বাংলাদেশ টিম'],
  ['tamim','তামিম'], ['sakib','সাকিব'], ['mushfiq','মুশফিক'],
  ['shakib al hasan','সাকিব আল হাসান'],
  ['tamim iqbal','তামিম ইকবাল'],
  ['mushfiqur rahim','মুশফিকুর রহিম'],

  // Travel (10)
  ['ghurte jabo','ঘুরতে যাবো'], ['tour','ট্যুর'],
  ['cox bazar','কক্সবাজার'], ['saint martin','সেন্ট মার্টিন'],
  ['sundarban','সুন্দরবন'], ['sylhet e','সিলেটে'],
  ['bandarban','বান্দরবন'], ['rangamati','রাঙ্গামাটি'],

  // Shopping (10)
  ['shopping','শপিং'], ['bazar','বাজার'], ['kenakata','কেনাকাটা'],
  ['discount','ডিসকাউন্ট'], ['offer','অফার'], ['order korbo','অর্ডার করবো'],
  ['delivery','ডেলিভারি'], ['home delivery','হোম ডেলিভারি'],
  ['cash on delivery','ক্যাশ অন ডেলিভারি'],

  // Family (15)
  ['prem','প্রেম'], ['biye','বিয়ে'], ['biye korbo','বিয়ে করবো'],
  ['bou','বউ'], ['shami','স্বামী'], ['chhele','ছেলে'],
  ['nana bari','নানা বাড়ি'], ['dada bari','দাদা বাড়ি'],
  ['shoshur bari','শ্বশুর বাড়ি'], ['baper bari','বাপের বাড়ি'],

  // Health (10)
  ['shorir','শরীর'], ['shorir bhalo na','শরীর ভালো না'],
  ['shorir kharap','শরীর খারাপ'], ['shustho','সুস্থ'],
  ['oshustho','অসুস্থ'], ['bimar','বিমার'],
  ['daktar er kache','ডাক্তারের কাছে'], ['osudh','ওষুধ'],
  ['matha betha','মাথা ব্যথা'], ['pet betha','পেট ব্যথা'],

  // More everyday (20)
  ['kemne','কেমনে'], ['kemon kore','কেমন করে'],
  ['kotha theke','কোথা থেকে'], ['kokhon theke','কখন থেকে'],
  ['hote','হতে'], ['korte','করতে'], ['jante','জানতে'],
  ['porte','পড়তে'], ['likhte','লিখতে'], ['shunte','শুনতে'],
  ['dekhte','দেখতে'], ['pete','পেতে'], ['khete','খেতে'],
  ['nite','নিতে'], ['dite','দিতে'], ['bolte','বলতে'],
  ['bojhte','বোঝতে'], ['bhabte','ভাবতে'], ['rakhte','রাখতে'],
  ['khujte','খুঁজতে'],

  // Verb infinitives + conjugations (30)
  ['kora','করা'], ['korar','করার'], ['kore','করে'],
  ['jana','জানা'], ['janar','জানার'], ['jane','জানে'],
  ['pora','পড়া'], ['porar','পড়ার'], ['pore','পড়ে'],
  ['likha','লেখা'], ['likhar','লেখার'], ['likhe','লিখে'],
  ['shuna','শোনা'], ['shunar','শোনার'], ['shune','শুনে'],
  ['dekha','দেখা'], ['dekhar','দেখার'], ['dekhe','দেখে'],
  ['pawa','পাওয়া'], ['peyar','পাওয়ার'], ['peye','পেয়ে'],
  ['khaoa','খাওয়া'], ['kheoar','খাওয়ার'], ['kheye','খেয়ে'],
  ['newa','নেওয়া'], ['niwar','নেওয়ার'], ['niye','নিয়ে'],
  ['dewa','দেওয়া'], ['diwar','দেওয়ার'], ['diye','দিয়ে'],
  ['bola','বলা'], ['bolar','বলার'], ['bole','বলে'],
  ['bojha','বোঝা'], ['bojhar','বোঝার'], ['bojhe','বোঝে'],
  ['bhaba','ভাবা'], ['bhabar','ভাবার'], ['bhabe','ভাবে'],
  ['rakha','রাখা'], ['rakhar','রাখার'], ['rakhe','রাখে'],
  ['khoja','খোঁজা'], ['khujar','খোঁজার'], ['khuje','খুঁজে'],
  ['bacha','বাঁচা'], ['bachar','বাঁচার'], ['bache','বাঁচে'],
  ['mara','মারা'], ['marar','মারার'], ['mare','মারে'],
  // More pronouns & variations (20)
  ['amader','আমাদের'], ['tomader','তোমাদের'], ['apnader','আপনাদের'],
  ['tader','তাদের'], ['oder','ওদের'], ['sokoler','সকলের'],
  ['keu','কেউ'], ['kau','কেউ'], ['kew na','কেউ না'],
  ['keo na','কেউ না'], ['kichu na','কিছু না'], ['kono','কোনো'],
  ['kon','কোন'], ['karor','কারোর'], ['karo','কারো'],
  ['amio','আমিও'], ['tumio','তুমিও'], ['apnio','আপনিও'],
  ['sheo','সেও'], ['ora o','ওরাও'],

  // More verbs - present continuous (25)
  ['korchi','করছি'], ['korcho','করছো'], ['korche','করছে'], ['korchen','করছেন'],
  ['khachchi','খাচ্ছি'], ['khachcho','খাচ্ছো'], ['khachche','খাচ্ছে'],
  ['jachchi','যাচ্ছি'], ['jachcho','যাচ্ছো'], ['jachche','যাচ্ছে'],
  ['aschchi','আসছি'], ['aschcho','আসছো'], ['aschche','আসছে'],
  ['bolchchi','বলছি'], ['bolchcho','বলছো'], ['bolchche','বলছে'],
  ['dekhchchi','দেখছি'], ['dekhchcho','দেখছো'], ['dekhchche','দেখছে'],
  ['shunchchi','শুনছি'], ['shunchcho','শুনছো'], ['shunchche','শুনছে'],
  ['likhchchi','লিখছি'], ['likhchcho','লিখছো'], ['likhchche','লিখছে'],

  // More verbs - past perfect (20)
  ['korechilam','করেছিলাম'], ['korechile','করেছিলে'], ['korechilo','করেছিলো'],
  ['gechilam','গেছিলাম'], ['gechile','গেছিলে'], ['gechilo','গেছিলো'],
  ['eshechilam','এসেছিলাম'], ['eshechile','এসেছিলে'], ['eshechilo','এসেছিলো'],
  ['diyechilam','দিয়েছিলাম'], ['diyechile','দিয়েছিলে'], ['diyechilo','দিয়েছিলো'],
  ['peyechilam','পেয়েছিলাম'], ['peyechile','পেয়েছিলে'], ['peyechilo','পেয়েছিলো'],
  ['bolechilam','বলেছিলাম'], ['bolechile','বলেছিলে'], ['bolechilo','বলেছিলো'],
  ['janechilam','জানতাম'], ['jantam','জানতাম'], ['janto','জানতো'],

  // More verbs - imperative (20)
  ['koro na','করো না'], ['koren na','করেন না'], ['korbe na','করবে না'],
  ['jaoo','যাও'], ['jaao','যাও'], ['jaao na','যাও না'],
  ['asho','আসো'], ['asho','আসো'], ['ashen','আসেন'], ['asho na','আসো না'],
  ['bolo na','বলো না'], ['bolben na','বলবেন না'],
  ['dekho na','দেখো না'], ['dekhun na','দেখুন না'],
  ['shuno na','শুনো না'], ['shunben na','শুনবেন না'],
  ['likho na','লিখো না'], ['likhben na','লিখবেন না'],
  ['khao na','খাও না'], ['khan na','খান না'],

  // More adjectives (30)
  ['shundor','সুন্দর'], ['khub shundor','খুব সুন্দর'],
  ['beshi shundor','বেশি সুন্দর'], ['onek shundor','অনেক সুন্দর'],
  ['kharap na','খারাপ না'], ['bhalo na','ভালো না'],
  ['kub bhalo','খুব ভালো'], ['onek bhalo','অনেক ভালো'],
  ['beshi bhalo','বেশি ভালো'], ['shobcheye bhalo','সবচেয়ে ভালো'],
  ['choto na','ছোট না'], ['boro na','বড় না'],
  ['onek boro','অনেক বড়'], ['beshi boro','বেশি বড়'],
  ['onek choto','অনেক ছোট'], ['beshi choto','বেশি ছোট'],
  ['notun na','নতুন না'], ['puraton na','পুরাতন না'],
  ['shobuj na','সবুজ না'], ['lal na','লাল না'],
  ['kalo na','কালো না'], ['shada na','সাদা না'],
  ['holud na','হলুদ না'], ['nil na','নীল না'],
  ['moja na','মজা না'], ['moja hoyni','মজা হয়নি'],
  ['shohoj na','সহজ না'], ['kothin na','কঠিন না'],
  ['shotti','সত্যি'], ['shotti na','সত্যি না'],

  // More adverbs (20)
  ['akdom','একদম'], ['akdom na','একদম না'],
  ['kub','খুব'], ['kub e','খুবই'],
  ['onek onek','অনেক অনেক'], ['besh besh','বেশ বেশ'],
  ['tara tara','তাড়া তাড়া'], ['dhire dhire','ধীরে ধীরে'],
  ['shiggiri','শিগগিরি'], ['shiggiri e','শিগগিরিই'],
  ['ekhoni','এখোনি'], ['ekhoni na','এখোনি না'],
  ['ektu','একটু'], ['ektu e','একটুই'],
  ['onektuku','অনেকটুকু'], ['onektuku na','অনেকটুকু না'],
  ['shobshomoy','সবসময়'], ['kokhono na','কখনো না'],
  ['shobshomoy na','সবসময় না'], ['prai','প্রায়'],

  // More nouns - food (25)
  ['bhat dal','ভাত ডাল'], ['bhat mangsho','ভাত মাংস'],
  ['bhat mach','ভাত মাছ'], ['bhat dim','ভাত ডিম'],
  ['roti sabzi','রুটি সবজি'], ['roti dal','রুটি ডাল'],
  ['paratha','পরোটা'], ['paratha bhaji','পরোটা ভাজি'],
  ['naan','নান'], ['naan korma','নান কোরমা'],
  ['tehari biryani','তেহারি বিরিয়ানি'], ['kacchi biryani','কাচ্চি বিরিয়ানি'],
  ['beef biryani','বিফ বিরিয়ানি'], ['chicken biryani','চিকেন বিরিয়ানি'],
  ['mutton biryani','মাটন বিরিয়ানি'], ['polao roast','পোলাও রোস্ট'],
  ['morog polao','মোরগ পোলাও'], ['ilish polao','ইলিশ পোলাও'],
  ['shorshe bata ilish','সরষে বাটা ইলিশ'], ['tel jhal','তেল ঝাল'],
  ['shukti bhuna','শুক্তি ভুনা'], ['chingri mach','চিংড়ি মাছ'],
  ['koi mach','কৈ মাছ'], ['telapia','তেলাপিয়া'],

  // More nouns - drinks (15)
  ['shorbot','শরবত'], ['borhani','বোরহানি'],
  ['lassi','লাচ্ছি'], ['matha','মাঠা'],
  ['faluda','ফালুদা'], ['shorbot e lebu','শরবতে লেবু'],
  ['cold drinks','কোল্ড ড্রিংকস'], ['soft drinks','সফট ড্রিংকস'],
  ['shingara mach','সিঙ্গারা মাছ'], ['shutki mach','শুটকি মাছ'],
  ['lobon ghol','লবণ ঘোল'], ['doi ghol','দই ঘোল'],
  ['garam pani','গরম পানি'], ['thanda pani','ঠান্ডা পানি'],
  ['mineral water','মিনারেল ওয়াটার'],

  // More nouns - places (20)
  ['basha bari','বাসা বাড়ি'], ['bari basha','বাড়ি বাসা'],
  ['choto basha','ছোট বাসা'], ['boro basha','বড় বাসা'],
  ['notun basha','নতুন বাসা'], ['puraton basha','পুরাতন বাসা'],
  ['basha bhara','বাসা ভাড়া'], ['basha khujchi','বাসা খুঁজছি'],
  ['basha paisi','বাসা পাইসি'], ['basha paini','বাসা পাইনি'],
  ['thana','থানা'], ['thana e jabo','থানায় যাবো'],
  ['court e','কোর্টে'], ['court e gelam','কোর্টে গেলাম'],
  ['jail khana','জেলখানা'], ['jail e achi','জেলে আছি'],
  ['rail station','রেল স্টেশন'], ['bus stand','বাস স্ট্যান্ড'],
  ['launch ghat','লঞ্চ ঘাট'], ['airport','এয়ারপোর্ট'],

  // More nouns - transport (15)
  ['rickshaw','রিকশা'], ['auto rickshaw','অটো রিকশা'],
  ['cng','সিএনজি'], ['cng te','সিএনজিতে'],
  ['bus e uthbo','বাসে উঠবো'], ['bus e namte','বাসে নামতে'],
  ['train e uthbo','ট্রেনে উঠবো'], ['train e namte','ট্রেনে নামতে'],
  ['plane e uthbo','প্লেনে উঠবো'], ['plane e namte','প্লেনে নামতে'],
  ['gari chalabo','গাড়ি চালাবো'], ['gari chalai','গাড়ি চালাই'],
  ['bike chalabo','বাইক চালাবো'], ['bike chalai','বাইক চালাই'],
  ['helmet porbo','হেলমেট পরবো'],

  // More nouns - technology (20)
  ['laptop','ল্যাপটপ'], ['desktop','ডেস্কটপ'],
  ['monitor','মনিটর'], ['keyboard','কীবোর্ড'],
  ['mouse','মাউস'], ['printer','প্রিন্টার'],
  ['scanner','স্ক্যানার'], ['router','রাউটার'],
  ['modem','মডেম'], ['charger','চার্জার'],
  ['power bank','পাওয়ার ব্যাংক'], ['headphone','হেডফোন'],
  ['earphone','ইয়ারফোন'], ['bluetooth','ব্লুটুথ'],
  ['speaker','স্পিকার'], ['microphone','মাইক্রোফোন'],
  ['webcam','ওয়েবক্যাম'], ['pendrive','পেনড্রাইভ'],
  ['hard disk','হার্ড ডিস্ক'], ['ssd','এসএসডি'],

  // More nouns - social media (15)
  ['facebook id','ফেসবুক আইডি'], ['facebook page','ফেসবুক পেজ'],
  ['facebook group','ফেসবুক গ্রুপ'], ['facebook post','ফেসবুক পোস্ট'],
  ['facebook story','ফেসবুক স্টোরি'], ['facebook live','ফেসবুক লাইভ'],
  ['youtube channel','ইউটিউব চ্যানেল'], ['youtube video','ইউটিউব ভিডিও'],
  ['youtube shorts','ইউটিউব শর্টস'], ['instagram id','ইনস্টাগ্রাম আইডি'],
  ['instagram reel','ইনস্টাগ্রাম রিল'], ['tiktok video','টিকটক ভিডিও'],
  ['whatsapp status','হোয়াটসঅ্যাপ স্ট্যাটাস'], ['whatsapp call','হোয়াটসঅ্যাপ কল'],
  ['messenger call','মেসেঞ্জার কল'],

  // More nouns - education (15)
  ['boi pora','বই পড়া'], ['boi likha','বই লেখা'],
  ['exam dibo','এক্সাম দিবো'], ['exam diyechi','এক্সাম দিয়েছি'],
  ['exam bhalo hoyni','এক্সাম ভালো হয়নি'], ['exam kharap hoyeche','এক্সাম খারাপ হয়েছে'],
  ['cgpa kom','সিজিপিএ কম'], ['cgpa beshi','সিজিপিএ বেশি'],
  ['class e jabo','ক্লাসে যাবো'], ['class e achi','ক্লাসে আছি'],
  ['class shuru','ক্লাস শুরু'], ['class sesh','ক্লাস শেষ'],
  ['teacher er','টিচারের'], ['student er','স্টুডেন্টের'],
  ['assignment','অ্যাসাইনমেন্ট'],

  // More nouns - health (15)
  ['shorir bhalo','শরীর ভালো'], ['shorir kharap','শরীর খারাপ'],
  ['shorir shustho','শরীর সুস্থ'], ['shorir oshustho','শরীর অসুস্থ'],
  ['jor','জ্বর'], ['thanda jor','ঠান্ডা জ্বর'],
  ['kashi','কাশি'], ['naki dhaka','নাকি ধাক্কা'],
  ['matha jhimpa','মাথা ঝিম্পা'], ['chokh jol','চোখ জল'],
  ['pet kharap','পেট খারাপ'], ['pet betha','পেট ব্যথা'],
  ['daktar dekhabo','ডাক্তার দেখাবো'], ['daktar dekhaichi','ডাক্তার দেখাইছি'],
  ['hospital e bharti','হাসপাতালে ভর্তি'],

  // More nouns - family relations (20)
  ['chacha chachi','চাচা চাচী'], ['mama mami','মামা মামী'],
  ['kaka kaki','কাকা কাকী'], ['pisa pisima','পিসা পিসিমা'],
  ['fufa fufima','ফুফা ফুফিমা'], ['dada dadi','দাদা দাদী'],
  ['nana nani','নানা নানী'], ['shoshur shashuri','শ্বশুর শাশুড়ি'],
  ['jamai','জামাই'], ['bou jamai','বৌ জামাই'],
  ['natni','নাতনি'], ['nati','নাতি'],
  ['nati natni','নাতি নাতনি'], ['chhele meye','ছেলে মেয়ে'],
  ['chheler biye','ছেলের বিয়ে'], ['meyer biye','মেয়ের বিয়ে'],
  ['biyer daawat','বিয়ের দাওয়াত'], ['biyer anushthan','বিয়ের অনুষ্ঠান'],
  ['biyer shaj','বিয়ের সাজ'], ['biyer khabar','বিয়ের খাবার'],

  // More nouns - emotions (15)
  ['anondo hoy','আনন্দ হয়'], ['anondo hoyna','আনন্দ হয়না'],
  ['dukh hoy','দুঃখ হয়'], ['dukh hoyna','দুঃখ হয়না'],
  ['kosto hoy','কষ্ট হয়'], ['kosto hoyna','কষ্ট হয়না'],
  ['bhoy hoy','ভয় হয়'], ['bhoy hoyna','ভয় হয়না'],
  ['raag hoy','রাগ হয়'], ['raag hoyna','রাগ হয়না'],
  ['lobh hoy','লোভ হয়'], ['lobh hoyna','লোভ হয়না'],
  ['hingsha hoy','হিংসা হয়'], ['hingsha hoyna','হিংসা হয়না'],
  ['maya hoy','মায়া হয়'], ['maya hoyna','মায়া হয়না'],

  // More common phrases (30)
  ['kemon achis','কেমন আছিস'], ['kemon achish','কেমন আছিশ'],
  ['kemon achhen','কেমন আছেন'], ['kemon achho','কেমন আছো'],
  ['kemon achi','কেমন আছি'], ['kemon achis tumi','কেমন আছিস তুমি'],
  ['bhalo achi','ভালো আছি'], ['bhalo achis','ভালো আছিস'],
  ['bhalo achho','ভালো আছো'], ['bhalo achhen','ভালো আছেন'],
  ['bhalo achi na','ভালো আছি না'], ['bhalo achis na','ভালো আছিস না'],
  ['bhalo achho na','ভালো আছো না'], ['bhalo achhen na','ভালো আছেন না'],
  ['kharap achi','খারাপ আছি'], ['kharap achis','খারাপ আছিস'],
  ['kharap achho','খারাপ আছো'], ['kharap achhen','খারাপ আছেন'],
  ['moja achi','মজা আছি'], ['moja achis','মজা আছিস'],
  ['moja achho','মজা আছো'], ['moja achhen','মজা আছেন'],
  ['shustho achi','সুস্থ আছি'], ['shustho achis','সুস্থ আছিস'],
  ['shustho achho','সুস্থ আছো'], ['shustho achhen','সুস্থ আছেন'],
  ['bimar achi','বিমার আছি'], ['bimar achis','বিমার আছিস'],
  ['bimar achho','বিমার আছো'], ['bimar achhen','বিমার আছেন'],

  // More question phrases (20)
  ['kothay achis','কোথায় আছিস'], ['kothay achish','কোথায় আছিশ'],
  ['kothay achho','কোথায় আছো'], ['kothay achhen','কোথায় আছেন'],
  ['kothay geli','কোথায় গেলি'], ['kothay gele','কোথায় গেলে'],
  ['kothay gelen','কোথায় গেলেন'], ['kothay jabi','কোথায় যাবি'],
  ['kothay jabe','কোথায় যাবে'], ['kothay jaben','কোথায় যাবেন'],
  ['kokhon asbi','কখন আসবি'], ['kokhon asbe','কখন আসবে'],
  ['kokhon asben','কখন আসবেন'], ['kokhon jabi','কখন যাবি'],
  ['kokhon jabe','কখন যাবে'], ['kokhon jaben','কখন যাবেন'],
  ['kivabe jabi','কিভাবে যাবি'], ['kivabe jabe','কিভাবে যাবে'],
  ['kivabe jaben','কিভাবে যাবেন'], ['kivabe korbi','কিভাবে করবি'],

  // More verb + object phrases (20)
  ['kaj kori','কাজ করি'], ['kaj koro','কাজ করো'],
  ['kaj kore','কাজ করে'], ['kaj koren','কাজ করেন'],
  ['kaj korchi','কাজ করছি'], ['kaj korcho','কাজ করছো'],
  ['kaj korche','কাজ করছে'], ['kaj korchen','কাজ করছেন'],
  ['kaj korbo','কাজ করবো'], ['kaj korbe','কাজ করবে'],
  ['kaj korben','কাজ করবেন'], ['kaj korechi','কাজ করেছি'],
  ['kaj koreche','কাজ করেছে'], ['kaj korechilo','কাজ করেছিলো'],
  ['kaj shesh','কাজ শেষ'], ['kaj shuru','কাজ শুরু'],
  ['kaj baki','কাজ বাকি'], ['kaj hoyni','কাজ হয়নি'],
  ['kaj hoyeche','কাজ হয়েছে'], ['kaj hobe','কাজ হবে'],

  // More daily activities (20)
  ['ghumabo','ঘুমাবো'], ['ghumabe','ঘুমাবে'], ['ghumaben','ঘুমাবেন'],
  ['ghumachchi','ঘুমাচ্ছি'], ['ghumachcho','ঘুমাচ্ছো'], ['ghumachche','ঘুমাচ্ছে'],
  ['ghumiye porbo','ঘুমিয়ে পরবো'], ['ghumiye pore','ঘুমিয়ে পরে'],
  ['snan korbo','স্নান করবো'], ['snan kore','স্নান করে'],
  ['snan korchi','স্নান করছি'], ['snan korechi','স্নান করেছি'],
  ['kapor porbo','কাপড় পরবো'], ['kapor pore','কাপড় পরে'],
  ['kapor porbo na','কাপড় পরবো না'], ['kapor pore na','কাপড় পরে না'],
  ['ber hobo','বের হবো'], ['ber hobe','বের হবে'],
  ['ber hoichi','বের হইছি'], ['ber hoiyechi','বের হয়েছি'],

  // More expressions with "lage" (15)
  ['valo lage na','ভালো লাগে না'], ['moja lage na','মজা লাগে না'],
  ['kharap lage na','খারাপ লাগে না'], ['kosto lage na','কষ্ট লাগে না'],
  ['dukh lage na','দুঃখ লাগে না'], ['anondo lage na','আনন্দ লাগে না'],
  ['shanti lage na','শান্তি লাগে না'], ['bhoy lage na','ভয় লাগে না'],
  ['shahosh lage na','সাহস লাগে না'], ['lobh lage na','লোভ লাগে না'],
  ['hingsha lage na','হিংসা লাগে না'], ['bhalobasha lage na','ভালোবাসা লাগে না'],
  ['kichui lage na','কিছুই লাগে না'], ['ar kichu lage na','আর কিছু লাগে না'],
  ['shob kichu lage','সব কিছু লাগে'],

  // More negations (15)
  ['ami jani na','আমি জানি না'], ['tumi jano na','তুমি জানো না'],
  ['apni janen na','আপনি জানেন না'], ['she jane na','সে জানে না'],
  ['ami pari na','আমি পারি না'], ['tumi paro na','তুমি পারো না'],
  ['apni paren na','আপনি পারেন না'], ['she pare na','সে পারে না'],
  ['ami chai na','আমি চাই না'], ['tumi chao na','তুমি চাও না'],
  ['apni chan na','আপনি চান না'], ['she chay na','সে চায় না'],
  ['ami jai na','আমি যাই না'], ['tumi jao na','তুমি যাও না'],
  ['apni jan na','আপনি যান না'],

  // More with "hoy" (15)
  ['hoy na','হয় না'], ['hoyni','হয়নি'], ['hobe na','হবে না'],
  ['hoyeche na','হয়েছে না'], ['hoyechilo na','হয়েছিলো না'],
  ['hobe na ar','হবে না আর'], ['hoy na ar','হয় না আর'],
  ['hoyto hobe','হয়তো হবে'], ['hoyto hoyni','হয়তো হয়নি'],
  ['hoyto hoyeche','হয়তো হয়েছে'], ['hoyto hoyna','হয়তো হয়না'],
  ['ki hoyeche bol','কি হয়েছে বল'], ['ki hoyeche bolo','কি হয়েছে বলো'],
  ['ki hoyeche bolun','কি হয়েছে বলুন'], ['ki hoyeche bolben','কি হয়েছে বলবেন'],
]);

// ─── Phonetic fallback map (for unknown words) ───
const PHONETIC_MAP = {
  'a':'আ', 'b':'ব', 'c':'ক', 'd':'দ', 'e':'এ', 'f':'ফ',
  'g':'গ', 'h':'হ', 'i':'ই', 'j':'জ', 'k':'ক', 'l':'ল',
  'm':'ম', 'n':'ন', 'o':'ও', 'p':'প', 'q':'ক', 'r':'র',
  's':'স', 't':'ত', 'u':'উ', 'v':'ভ', 'w':'ও', 'x':'এক্স',
  'y':'য়', 'z':'জ',
  'ch':'চ', 'kh':'খ', 'gh':'ঘ', 'ng':'ং', 'sh':'শ',
  'th':'থ', 'dh':'ধ', 'ph':'ফ', 'bh':'ভ', 'jh':'ঝ',
  'ny':'ঞ', 'rr':'ড়', 'rh':'ঢ়',
};

// ─── Smart conversion engine ───
function smartConvert(text) {
  if (!text || !text.trim()) return '';

  const lines = text.split('\n');
  const result = lines.map(line => convertLine(line)).join('\n');
  return result;
}

function convertLine(line) {
  // Split by spaces but preserve punctuation
  const tokens = line.match(/[a-zA-Z0-9]+|[^a-zA-Z0-9\s]+|\s+/g) || [];

  return tokens.map(token => {
    // If it's whitespace or non-alphanumeric, pass through
    if (!token.match(/[a-zA-Z0-9]/)) return token;

    const lower = token.toLowerCase();

    // 1. Exact match in dictionary
    if (WORD_MAP.has(lower)) {
      return WORD_MAP.get(lower);
    }

    // 2. Try with common suffixes removed
    const stripped = stripSuffix(lower);
    if (stripped !== lower && WORD_MAP.has(stripped)) {
      return WORD_MAP.get(stripped);
    }

    // 3. Try phonetic fallback
    return phoneticConvert(token);
  }).join('');
}

function stripSuffix(word) {
  // Common Banglish suffixes
  const suffixes = ['er', 'or', 'ar', 'te', 'e', 'o', 'a', 'i'];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

function phoneticConvert(word) {
  // Simple phonetic fallback for unknown words
  let result = '';
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    // Try 2-char match first
    const two = lower.slice(i, i + 2);
    if (PHONETIC_MAP[two]) {
      result += PHONETIC_MAP[two];
      i += 2;
      continue;
    }
    // Then 1-char
    const one = lower[i];
    if (PHONETIC_MAP[one]) {
      result += PHONETIC_MAP[one];
    } else {
      result += one; // Pass through unknown chars
    }
    i++;
  }

  return result || word;
}

// ─── Get conversion stats ───
function getStats(input, output) {
  const inWords = input.trim().split(/\s+/).filter(w => w).length;
  const outWords = output.trim().split(/\s+/).filter(w => w).length;
  const banglishWords = input.trim().split(/\s+/).filter(w => /^[a-zA-Z]+$/.test(w)).length;
  const convertedWords = output.trim().split(/\s+/).filter(w => /[\u0980-\u09FF]/.test(w)).length;

  return {
    inputWords: inWords,
    outputWords: outWords,
    banglishWords,
    convertedWords,
    confidence: banglishWords > 0 ? Math.round((convertedWords / banglishWords) * 100) : 0
  };
}

// ─── Sample texts ───
const SAMPLES = [
  'ami valo achi. tumi kemon acho?',
  'ajke onek gorom. brishti hobe na.',
  'dhaka te jabo. train e jabo.',
  'baba ma ke bhalobasi.',
  'cricket dekhbo. bangladesh team joy hobe.',
  'facebook e post dibo. like diben.',
  'shubho shokal! ki khobor?',
  'office e jabo. meeting e achi.',
  'ranna korbo. biryani banabo.',
  'shorir kharap. daktar er kache jabo.',
];

// ─── Export ───
export { smartConvert, getStats, SAMPLES, WORD_MAP };