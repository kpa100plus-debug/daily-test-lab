const supportedLocales = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'id', 'th', 'vi', 'hi', 'ar', 'ru'];

const localeNames = {
  ko: '한국어', en: 'English', ja: '日本語', 'zh-CN': '简体中文', 'zh-TW': '繁體中文',
  es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', id: 'Bahasa Indonesia',
  th: 'ไทย', vi: 'Tiếng Việt', hi: 'हिन्दी', ar: 'العربية', ru: 'Русский'
};

const en = {
  languageLabel: 'Language', records: 'My records', home: 'Home', tests: 'Tests', balance: 'Balance', games: 'Games',
  about: 'About', privacy: 'Privacy', terms: 'Terms', ads: 'Ads', contact: 'Contact', reading: 'Guides',
  heroEyebrow: 'A light challenge for today', heroTitle: 'What should<br><span>we try today?</span>',
  heroCopy: 'From personality tests to 10-second games.<br>Start easily and keep today’s record.',
  recommendation: 'See today’s pick', free: 'Free · No installation', todayPick: 'Today’s pick', changesDaily: 'Updated daily',
  trending: 'Popular now', viewAll: 'View all', dailyQuiz: 'Daily quiz', todayMe: 'Today’s me',
  todayVisitors: 'Today’s visitors', publicTests: 'Published tests', balanceQuestions: 'Balance questions', miniGames: 'Mini games',
  statsHeading: 'DAILY TEST LAB at a glance', statsNote: 'Visitor numbers are anonymous estimates; content totals are updated from published data.',
  start: 'Start now', share: 'Share', testList: 'Test list', balanceList: 'Balance list', gameList: 'Game list'
};

const messages = {
  ko: {
    languageLabel: '언어', records: '내 기록', home: '홈', tests: '테스트', balance: '밸런스', games: '게임',
    about: '소개', privacy: '개인정보처리방침', terms: '이용약관', ads: '광고 안내', contact: '문의', reading: '읽을거리',
    heroEyebrow: '오늘도 가볍게 한 판', heroTitle: '오늘 뭐<br><span>해볼까?</span>',
    heroCopy: '심리테스트부터 10초 게임까지.<br>부담 없이 시작하고 오늘의 기록을 남겨보세요.',
    recommendation: '오늘 추천 보기', free: '무료 · 설치 없음', todayPick: '오늘의 추천', changesDaily: '매일 변경',
    trending: '지금 인기 있어요', viewAll: '전체 보기', dailyQuiz: '오늘의 퀴즈', todayMe: '오늘의 나',
    todayVisitors: '오늘 방문', publicTests: '공개 테스트', balanceQuestions: '밸런스 질문', miniGames: '미니게임',
    statsHeading: '숫자로 보는 DAILY TEST LAB', statsNote: '방문 수는 익명 추정치이며 콘텐츠 수는 공개 데이터를 기준으로 자동 갱신됩니다.',
    start: '지금 시작', share: '공유', testList: '테스트 목록', balanceList: '밸런스 목록', gameList: '게임 목록'
  },
  en,
  ja: {
    languageLabel: '言語', records: 'マイ記録', home: 'ホーム', tests: 'テスト', balance: '二択', games: 'ゲーム',
    about: '紹介', privacy: 'プライバシー', terms: '利用規約', ads: '広告案内', contact: 'お問い合わせ', reading: 'ガイド',
    heroEyebrow: '今日も気軽にチャレンジ', heroTitle: '今日は何を<br><span>やってみる？</span>', heroCopy: '性格テストから10秒ゲームまで。<br>気軽に始めて今日の記録を残しましょう。',
    recommendation: '今日のおすすめ', free: '無料・インストール不要', todayPick: '今日のおすすめ', changesDaily: '毎日更新', trending: 'いま人気', viewAll: 'すべて見る', dailyQuiz: '今日のクイズ', todayMe: '今日の私',
    todayVisitors: '今日の訪問', publicTests: '公開テスト', balanceQuestions: '二択質問', miniGames: 'ミニゲーム', statsHeading: '数字で見る DAILY TEST LAB', statsNote: '訪問数は匿名の推定値、コンテンツ数は公開データから自動更新されます。',
    start: '今すぐ開始', share: '共有', testList: 'テスト一覧', balanceList: '二択一覧', gameList: 'ゲーム一覧'
  },
  'zh-CN': {
    languageLabel: '语言', records: '我的记录', home: '首页', tests: '测试', balance: '二选一', games: '游戏',
    about: '介绍', privacy: '隐私政策', terms: '使用条款', ads: '广告说明', contact: '联系', reading: '指南',
    heroEyebrow: '今天也轻松玩一局', heroTitle: '今天想<br><span>玩什么？</span>', heroCopy: '从性格测试到10秒小游戏。<br>轻松开始，留下今天的记录。',
    recommendation: '查看今日推荐', free: '免费 · 无需安装', todayPick: '今日推荐', changesDaily: '每日更新', trending: '当前热门', viewAll: '查看全部', dailyQuiz: '每日问答', todayMe: '今日的我',
    todayVisitors: '今日访问', publicTests: '公开测试', balanceQuestions: '二选一问题', miniGames: '小游戏', statsHeading: '用数字看 DAILY TEST LAB', statsNote: '访问量为匿名估算，内容数量根据公开数据自动更新。',
    start: '立即开始', share: '分享', testList: '测试列表', balanceList: '二选一列表', gameList: '游戏列表'
  },
  'zh-TW': {
    languageLabel: '語言', records: '我的紀錄', home: '首頁', tests: '測驗', balance: '二選一', games: '遊戲',
    about: '介紹', privacy: '隱私權政策', terms: '使用條款', ads: '廣告說明', contact: '聯絡', reading: '指南',
    heroEyebrow: '今天也輕鬆玩一局', heroTitle: '今天想<br><span>玩什麼？</span>', heroCopy: '從性格測驗到10秒小遊戲。<br>輕鬆開始，留下今天的紀錄。',
    recommendation: '查看今日推薦', free: '免費 · 無需安裝', todayPick: '今日推薦', changesDaily: '每日更新', trending: '目前熱門', viewAll: '查看全部', dailyQuiz: '每日問答', todayMe: '今日的我',
    todayVisitors: '今日造訪', publicTests: '公開測驗', balanceQuestions: '二選一問題', miniGames: '小遊戲', statsHeading: '用數字看 DAILY TEST LAB', statsNote: '造訪數為匿名估算，內容數量依公開資料自動更新。',
    start: '立即開始', share: '分享', testList: '測驗列表', balanceList: '二選一列表', gameList: '遊戲列表'
  },
  es: {
    languageLabel: 'Idioma', records: 'Mis registros', home: 'Inicio', tests: 'Tests', balance: 'Dilemas', games: 'Juegos',
    about: 'Acerca de', privacy: 'Privacidad', terms: 'Términos', ads: 'Publicidad', contact: 'Contacto', reading: 'Guías',
    heroEyebrow: 'Un reto ligero para hoy', heroTitle: '¿Qué probamos<br><span>hoy?</span>', heroCopy: 'De tests de personalidad a juegos de 10 segundos.<br>Empieza fácilmente y guarda tu registro.',
    recommendation: 'Ver recomendación', free: 'Gratis · Sin instalación', todayPick: 'Recomendación de hoy', changesDaily: 'Cambia a diario', trending: 'Popular ahora', viewAll: 'Ver todo', dailyQuiz: 'Pregunta diaria', todayMe: 'Mi día',
    todayVisitors: 'Visitas de hoy', publicTests: 'Tests publicados', balanceQuestions: 'Dilemas', miniGames: 'Minijuegos', statsHeading: 'DAILY TEST LAB en cifras', statsNote: 'Las visitas son estimaciones anónimas; los totales se actualizan con datos publicados.',
    start: 'Empezar', share: 'Compartir', testList: 'Lista de tests', balanceList: 'Lista de dilemas', gameList: 'Lista de juegos'
  },
  fr: {
    languageLabel: 'Langue', records: 'Mes résultats', home: 'Accueil', tests: 'Tests', balance: 'Dilemmes', games: 'Jeux',
    about: 'À propos', privacy: 'Confidentialité', terms: 'Conditions', ads: 'Publicité', contact: 'Contact', reading: 'Guides',
    heroEyebrow: 'Un défi léger pour aujourd’hui', heroTitle: 'Que faire<br><span>aujourd’hui ?</span>', heroCopy: 'Des tests de personnalité aux jeux de 10 secondes.<br>Commencez facilement et gardez votre résultat.',
    recommendation: 'Voir la sélection', free: 'Gratuit · Sans installation', todayPick: 'Sélection du jour', changesDaily: 'Mis à jour chaque jour', trending: 'Populaire maintenant', viewAll: 'Tout voir', dailyQuiz: 'Quiz du jour', todayMe: 'Mon jour',
    todayVisitors: 'Visites du jour', publicTests: 'Tests publiés', balanceQuestions: 'Dilemmes', miniGames: 'Mini-jeux', statsHeading: 'DAILY TEST LAB en chiffres', statsNote: 'Les visites sont des estimations anonymes ; les totaux viennent des données publiées.',
    start: 'Commencer', share: 'Partager', testList: 'Liste des tests', balanceList: 'Liste des dilemmes', gameList: 'Liste des jeux'
  },
  de: {
    languageLabel: 'Sprache', records: 'Meine Ergebnisse', home: 'Start', tests: 'Tests', balance: 'Entscheidungen', games: 'Spiele',
    about: 'Über uns', privacy: 'Datenschutz', terms: 'Nutzungsbedingungen', ads: 'Werbung', contact: 'Kontakt', reading: 'Ratgeber',
    heroEyebrow: 'Eine leichte Runde für heute', heroTitle: 'Was probieren<br><span>wir heute?</span>', heroCopy: 'Von Persönlichkeitstests bis zu 10-Sekunden-Spielen.<br>Einfach starten und den heutigen Stand speichern.',
    recommendation: 'Heutige Empfehlung', free: 'Kostenlos · Keine Installation', todayPick: 'Tipp des Tages', changesDaily: 'Täglich neu', trending: 'Jetzt beliebt', viewAll: 'Alle ansehen', dailyQuiz: 'Tagesquiz', todayMe: 'Mein Tag',
    todayVisitors: 'Besuche heute', publicTests: 'Veröffentlichte Tests', balanceQuestions: 'Entscheidungsfragen', miniGames: 'Minispiele', statsHeading: 'DAILY TEST LAB in Zahlen', statsNote: 'Besuche sind anonyme Schätzwerte; Inhaltszahlen stammen aus veröffentlichten Daten.',
    start: 'Jetzt starten', share: 'Teilen', testList: 'Testliste', balanceList: 'Entscheidungsliste', gameList: 'Spieleliste'
  },
  pt: {
    languageLabel: 'Idioma', records: 'Meus registros', home: 'Início', tests: 'Testes', balance: 'Escolhas', games: 'Jogos',
    about: 'Sobre', privacy: 'Privacidade', terms: 'Termos', ads: 'Publicidade', contact: 'Contato', reading: 'Guias',
    heroEyebrow: 'Um desafio leve para hoje', heroTitle: 'O que vamos<br><span>tentar hoje?</span>', heroCopy: 'De testes de personalidade a jogos de 10 segundos.<br>Comece com facilidade e guarde seu registro.',
    recommendation: 'Ver recomendação', free: 'Grátis · Sem instalação', todayPick: 'Destaque de hoje', changesDaily: 'Atualizado diariamente', trending: 'Popular agora', viewAll: 'Ver tudo', dailyQuiz: 'Quiz diário', todayMe: 'Meu dia',
    todayVisitors: 'Visitas hoje', publicTests: 'Testes publicados', balanceQuestions: 'Perguntas de escolha', miniGames: 'Minijogos', statsHeading: 'DAILY TEST LAB em números', statsNote: 'As visitas são estimativas anônimas; os totais vêm dos dados publicados.',
    start: 'Começar', share: 'Compartilhar', testList: 'Lista de testes', balanceList: 'Lista de escolhas', gameList: 'Lista de jogos'
  },
  id: {
    languageLabel: 'Bahasa', records: 'Catatan saya', home: 'Beranda', tests: 'Tes', balance: 'Pilihan', games: 'Gim',
    about: 'Tentang', privacy: 'Privasi', terms: 'Ketentuan', ads: 'Iklan', contact: 'Kontak', reading: 'Panduan',
    heroEyebrow: 'Tantangan ringan hari ini', heroTitle: 'Mau mencoba<br><span>apa hari ini?</span>', heroCopy: 'Dari tes kepribadian hingga gim 10 detik.<br>Mulai dengan mudah dan simpan catatan hari ini.',
    recommendation: 'Lihat pilihan hari ini', free: 'Gratis · Tanpa instalasi', todayPick: 'Pilihan hari ini', changesDaily: 'Diperbarui setiap hari', trending: 'Sedang populer', viewAll: 'Lihat semua', dailyQuiz: 'Kuis harian', todayMe: 'Hari saya',
    todayVisitors: 'Kunjungan hari ini', publicTests: 'Tes terbit', balanceQuestions: 'Pertanyaan pilihan', miniGames: 'Gim mini', statsHeading: 'DAILY TEST LAB dalam angka', statsNote: 'Kunjungan adalah perkiraan anonim; jumlah konten diperbarui dari data publik.',
    start: 'Mulai', share: 'Bagikan', testList: 'Daftar tes', balanceList: 'Daftar pilihan', gameList: 'Daftar gim'
  },
  th: {
    languageLabel: 'ภาษา', records: 'บันทึกของฉัน', home: 'หน้าแรก', tests: 'แบบทดสอบ', balance: 'ตัวเลือก', games: 'เกม',
    about: 'เกี่ยวกับ', privacy: 'ความเป็นส่วนตัว', terms: 'ข้อกำหนด', ads: 'โฆษณา', contact: 'ติดต่อ', reading: 'บทความ',
    heroEyebrow: 'ลองเล่นเบา ๆ วันนี้', heroTitle: 'วันนี้จะลอง<br><span>อะไรดี?</span>', heroCopy: 'ตั้งแต่แบบทดสอบบุคลิกถึงเกม 10 วินาที<br>เริ่มง่าย ๆ และเก็บบันทึกวันนี้ไว้',
    recommendation: 'ดูคำแนะนำวันนี้', free: 'ฟรี · ไม่ต้องติดตั้ง', todayPick: 'แนะนำวันนี้', changesDaily: 'อัปเดตทุกวัน', trending: 'กำลังนิยม', viewAll: 'ดูทั้งหมด', dailyQuiz: 'คำถามประจำวัน', todayMe: 'วันนี้ของฉัน',
    todayVisitors: 'ผู้เข้าชมวันนี้', publicTests: 'แบบทดสอบที่เผยแพร่', balanceQuestions: 'คำถามตัวเลือก', miniGames: 'มินิเกม', statsHeading: 'DAILY TEST LAB ในตัวเลข', statsNote: 'จำนวนผู้เข้าชมเป็นค่าประมาณแบบไม่ระบุตัวตน และจำนวนเนื้อหาอัปเดตจากข้อมูลที่เผยแพร่',
    start: 'เริ่มเลย', share: 'แชร์', testList: 'รายการแบบทดสอบ', balanceList: 'รายการตัวเลือก', gameList: 'รายการเกม'
  },
  vi: {
    languageLabel: 'Ngôn ngữ', records: 'Kết quả của tôi', home: 'Trang chủ', tests: 'Trắc nghiệm', balance: 'Lựa chọn', games: 'Trò chơi',
    about: 'Giới thiệu', privacy: 'Quyền riêng tư', terms: 'Điều khoản', ads: 'Quảng cáo', contact: 'Liên hệ', reading: 'Bài viết',
    heroEyebrow: 'Một thử thách nhẹ hôm nay', heroTitle: 'Hôm nay thử<br><span>gì nhỉ?</span>', heroCopy: 'Từ trắc nghiệm tính cách đến trò chơi 10 giây.<br>Bắt đầu dễ dàng và lưu kết quả hôm nay.',
    recommendation: 'Xem gợi ý hôm nay', free: 'Miễn phí · Không cần cài đặt', todayPick: 'Gợi ý hôm nay', changesDaily: 'Cập nhật mỗi ngày', trending: 'Đang phổ biến', viewAll: 'Xem tất cả', dailyQuiz: 'Câu hỏi hằng ngày', todayMe: 'Hôm nay của tôi',
    todayVisitors: 'Lượt thăm hôm nay', publicTests: 'Trắc nghiệm công khai', balanceQuestions: 'Câu hỏi lựa chọn', miniGames: 'Trò chơi nhỏ', statsHeading: 'DAILY TEST LAB qua những con số', statsNote: 'Lượt thăm là ước tính ẩn danh; tổng nội dung cập nhật từ dữ liệu công khai.',
    start: 'Bắt đầu', share: 'Chia sẻ', testList: 'Danh sách trắc nghiệm', balanceList: 'Danh sách lựa chọn', gameList: 'Danh sách trò chơi'
  },
  hi: {
    languageLabel: 'भाषा', records: 'मेरे रिकॉर्ड', home: 'होम', tests: 'टेस्ट', balance: 'विकल्प', games: 'गेम',
    about: 'परिचय', privacy: 'गोपनीयता', terms: 'शर्तें', ads: 'विज्ञापन', contact: 'संपर्क', reading: 'गाइड',
    heroEyebrow: 'आज का हल्का सा चैलेंज', heroTitle: 'आज क्या<br><span>आज़माएँ?</span>', heroCopy: 'पर्सनैलिटी टेस्ट से 10-सेकंड गेम तक।<br>आसानी से शुरू करें और आज का रिकॉर्ड रखें।',
    recommendation: 'आज की पसंद देखें', free: 'मुफ़्त · इंस्टॉल नहीं', todayPick: 'आज की पसंद', changesDaily: 'रोज़ अपडेट', trending: 'अभी लोकप्रिय', viewAll: 'सभी देखें', dailyQuiz: 'आज का क्विज़', todayMe: 'आज का मैं',
    todayVisitors: 'आज के विज़िटर', publicTests: 'प्रकाशित टेस्ट', balanceQuestions: 'विकल्प प्रश्न', miniGames: 'मिनी गेम', statsHeading: 'DAILY TEST LAB के आँकड़े', statsNote: 'विज़िटर संख्या गुमनाम अनुमान है; कंटेंट संख्या प्रकाशित डेटा से अपडेट होती है।',
    start: 'शुरू करें', share: 'शेयर', testList: 'टेस्ट सूची', balanceList: 'विकल्प सूची', gameList: 'गेम सूची'
  },
  ar: {
    languageLabel: 'اللغة', records: 'سجلاتي', home: 'الرئيسية', tests: 'اختبارات', balance: 'اختيارات', games: 'ألعاب',
    about: 'حول', privacy: 'الخصوصية', terms: 'الشروط', ads: 'الإعلانات', contact: 'اتصل بنا', reading: 'أدلة',
    heroEyebrow: 'تحدٍ خفيف لليوم', heroTitle: 'ماذا نجرب<br><span>اليوم؟</span>', heroCopy: 'من اختبارات الشخصية إلى ألعاب العشر ثوانٍ.<br>ابدأ بسهولة واحتفظ بسجل اليوم.',
    recommendation: 'شاهد اختيار اليوم', free: 'مجاني · بلا تثبيت', todayPick: 'اختيار اليوم', changesDaily: 'يتجدد يوميًا', trending: 'الأكثر رواجًا', viewAll: 'عرض الكل', dailyQuiz: 'سؤال اليوم', todayMe: 'يومي',
    todayVisitors: 'زوار اليوم', publicTests: 'اختبارات منشورة', balanceQuestions: 'أسئلة الاختيار', miniGames: 'ألعاب صغيرة', statsHeading: 'DAILY TEST LAB بالأرقام', statsNote: 'أعداد الزيارات تقديرات مجهولة الهوية، وأعداد المحتوى تُحدّث من البيانات المنشورة.',
    start: 'ابدأ الآن', share: 'مشاركة', testList: 'قائمة الاختبارات', balanceList: 'قائمة الاختيارات', gameList: 'قائمة الألعاب'
  },
  ru: {
    languageLabel: 'Язык', records: 'Мои результаты', home: 'Главная', tests: 'Тесты', balance: 'Выбор', games: 'Игры',
    about: 'О сайте', privacy: 'Конфиденциальность', terms: 'Условия', ads: 'Реклама', contact: 'Контакты', reading: 'Материалы',
    heroEyebrow: 'Лёгкое испытание на сегодня', heroTitle: 'Что попробуем<br><span>сегодня?</span>', heroCopy: 'От тестов личности до 10-секундных игр.<br>Начните легко и сохраните результат дня.',
    recommendation: 'Выбор дня', free: 'Бесплатно · Без установки', todayPick: 'Сегодня рекомендуем', changesDaily: 'Обновляется ежедневно', trending: 'Сейчас популярно', viewAll: 'Смотреть все', dailyQuiz: 'Вопрос дня', todayMe: 'Мой день',
    todayVisitors: 'Посетители сегодня', publicTests: 'Опубликованные тесты', balanceQuestions: 'Вопросы выбора', miniGames: 'Мини-игры', statsHeading: 'DAILY TEST LAB в цифрах', statsNote: 'Посещения — анонимная оценка; количество контента обновляется по опубликованным данным.',
    start: 'Начать', share: 'Поделиться', testList: 'Список тестов', balanceList: 'Список выборов', gameList: 'Список игр'
  }
};

const visitorPeriodMessages = {
  ko: { todayVisitors: '오늘 방문자', weekVisitors: '이번 주 방문자', monthVisitors: '이번 달 방문자', todayWindow: '오늘 기준', weekWindow: '최근 7일 기준', monthWindow: '최근 30일 기준', visitorStats: '방문 현황', contentStats: '콘텐츠 현황', statsNote: '방문자 수는 익명 추정치이며, 주·월 표시는 최근 7일·30일 기준입니다.' },
  en: { todayVisitors: "Today's visitors", weekVisitors: "This week's visitors", monthVisitors: "This month's visitors", todayWindow: 'Today', weekWindow: 'Last 7 days', monthWindow: 'Last 30 days', visitorStats: 'Visitor activity', contentStats: 'Content totals', statsNote: 'Visitor counts are anonymous estimates; weekly and monthly figures cover the last 7 and 30 days.' },
  ja: { todayVisitors: '今日の訪問者', weekVisitors: '今週の訪問者', monthVisitors: '今月の訪問者', todayWindow: '今日', weekWindow: '直近7日間', monthWindow: '直近30日間', visitorStats: '訪問状況', contentStats: 'コンテンツ数', statsNote: '訪問者数は匿名の推定値で、週・月は直近7日・30日を表示します。' },
  'zh-CN': { todayVisitors: '今日访客', weekVisitors: '本周访客', monthVisitors: '本月访客', todayWindow: '今日', weekWindow: '最近7天', monthWindow: '最近30天', visitorStats: '访问情况', contentStats: '内容数量', statsNote: '访客数为匿名估算；周、月数据分别按最近7天和30天统计。' },
  'zh-TW': { todayVisitors: '今日訪客', weekVisitors: '本週訪客', monthVisitors: '本月訪客', todayWindow: '今日', weekWindow: '最近7天', monthWindow: '最近30天', visitorStats: '造訪情況', contentStats: '內容數量', statsNote: '訪客數為匿名估算；週、月資料分別以最近7天和30天計算。' },
  es: { todayVisitors: 'Visitantes de hoy', weekVisitors: 'Visitantes de la semana', monthVisitors: 'Visitantes del mes', todayWindow: 'Hoy', weekWindow: 'Últimos 7 días', monthWindow: 'Últimos 30 días', visitorStats: 'Visitas', contentStats: 'Contenido', statsNote: 'Las cifras son estimaciones anónimas; semana y mes cubren los últimos 7 y 30 días.' },
  fr: { todayVisitors: "Visiteurs aujourd'hui", weekVisitors: 'Visiteurs de la semaine', monthVisitors: 'Visiteurs du mois', todayWindow: "Aujourd'hui", weekWindow: '7 derniers jours', monthWindow: '30 derniers jours', visitorStats: 'Visites', contentStats: 'Contenus', statsNote: 'Les chiffres sont des estimations anonymes ; semaine et mois couvrent les 7 et 30 derniers jours.' },
  de: { todayVisitors: 'Besucher heute', weekVisitors: 'Besucher diese Woche', monthVisitors: 'Besucher diesen Monat', todayWindow: 'Heute', weekWindow: 'Letzte 7 Tage', monthWindow: 'Letzte 30 Tage', visitorStats: 'Besuche', contentStats: 'Inhalte', statsNote: 'Besucherzahlen sind anonyme Schätzwerte; Woche und Monat umfassen die letzten 7 bzw. 30 Tage.' },
  pt: { todayVisitors: 'Visitantes de hoje', weekVisitors: 'Visitantes da semana', monthVisitors: 'Visitantes do mês', todayWindow: 'Hoje', weekWindow: 'Últimos 7 dias', monthWindow: 'Últimos 30 dias', visitorStats: 'Visitas', contentStats: 'Conteúdo', statsNote: 'Os números são estimativas anônimas; semana e mês cobrem os últimos 7 e 30 dias.' },
  id: { todayVisitors: 'Pengunjung hari ini', weekVisitors: 'Pengunjung minggu ini', monthVisitors: 'Pengunjung bulan ini', todayWindow: 'Hari ini', weekWindow: '7 hari terakhir', monthWindow: '30 hari terakhir', visitorStats: 'Kunjungan', contentStats: 'Konten', statsNote: 'Jumlah pengunjung adalah perkiraan anonim; minggu dan bulan mencakup 7 dan 30 hari terakhir.' },
  th: { todayVisitors: 'ผู้เข้าชมวันนี้', weekVisitors: 'ผู้เข้าชมสัปดาห์นี้', monthVisitors: 'ผู้เข้าชมเดือนนี้', todayWindow: 'วันนี้', weekWindow: '7 วันล่าสุด', monthWindow: '30 วันล่าสุด', visitorStats: 'การเข้าชม', contentStats: 'จำนวนคอนเทนต์', statsNote: 'จำนวนผู้เข้าชมเป็นค่าประมาณแบบไม่ระบุตัวตน โดยสัปดาห์และเดือนใช้ช่วง 7 และ 30 วันล่าสุด' },
  vi: { todayVisitors: 'Khách hôm nay', weekVisitors: 'Khách tuần này', monthVisitors: 'Khách tháng này', todayWindow: 'Hôm nay', weekWindow: '7 ngày gần nhất', monthWindow: '30 ngày gần nhất', visitorStats: 'Lượt truy cập', contentStats: 'Nội dung', statsNote: 'Số khách là ước tính ẩn danh; tuần và tháng tính theo 7 và 30 ngày gần nhất.' },
  hi: { todayVisitors: 'आज के विज़िटर', weekVisitors: 'इस सप्ताह के विज़िटर', monthVisitors: 'इस महीने के विज़िटर', todayWindow: 'आज', weekWindow: 'पिछले 7 दिन', monthWindow: 'पिछले 30 दिन', visitorStats: 'विज़िटर गतिविधि', contentStats: 'कंटेंट संख्या', statsNote: 'विज़िटर संख्या गुमनाम अनुमान है; सप्ताह और महीना पिछले 7 और 30 दिनों पर आधारित हैं।' },
  ar: { todayVisitors: 'زوار اليوم', weekVisitors: 'زوار هذا الأسبوع', monthVisitors: 'زوار هذا الشهر', todayWindow: 'اليوم', weekWindow: 'آخر 7 أيام', monthWindow: 'آخر 30 يومًا', visitorStats: 'حركة الزيارات', contentStats: 'عدد المحتويات', statsNote: 'أعداد الزوار تقديرات مجهولة الهوية، والأسبوع والشهر يغطيان آخر 7 و30 يومًا.' },
  ru: { todayVisitors: 'Посетители сегодня', weekVisitors: 'Посетители за неделю', monthVisitors: 'Посетители за месяц', todayWindow: 'Сегодня', weekWindow: 'Последние 7 дней', monthWindow: 'Последние 30 дней', visitorStats: 'Посещения', contentStats: 'Контент', statsNote: 'Число посетителей — анонимная оценка; неделя и месяц охватывают последние 7 и 30 дней.' }
};

for (const locale of supportedLocales) {
  Object.assign(messages[locale], visitorPeriodMessages[locale]);
}

const countryLocales = {
  KR: 'ko', JP: 'ja', CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-TW', MO: 'zh-TW',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', UY: 'es', PY: 'es', BO: 'es', CR: 'es', PA: 'es', DO: 'es', GT: 'es', HN: 'es', SV: 'es', NI: 'es', CU: 'es',
  FR: 'fr', BE: 'fr', MC: 'fr', DE: 'de', AT: 'de', CH: 'de', PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  ID: 'id', TH: 'th', VN: 'vi', IN: 'hi', RU: 'ru', BY: 'ru', KZ: 'ru',
  SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', EG: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar'
};

const normalizeLocale = (value = '') => {
  const locale = value.replace('_', '-');
  if (/^zh-(tw|hk|mo|hant)/i.test(locale)) return 'zh-TW';
  if (/^zh/i.test(locale)) return 'zh-CN';
  const short = locale.split('-')[0].toLowerCase();
  return supportedLocales.includes(short) ? short : 'en';
};

const getMessage = (locale, key) => messages[locale]?.[key] ?? en[key] ?? key;

function applyTranslations(locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.locale = locale;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = getMessage(locale, element.dataset.i18n);
    if (value && element.textContent !== value) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = getMessage(locale, element.dataset.i18nHtml);
    if (value && element.innerHTML !== value) element.innerHTML = value;
  });

  const exactText = {
    '내 기록': 'records', '홈': 'home', '테스트': 'tests', '심리테스트': 'tests', '밸런스': 'balance', '밸런스 게임': 'balance', '게임': 'games',
    '소개': 'about', '개인정보처리방침': 'privacy', '이용약관': 'terms', '광고 안내': 'ads', '문의': 'contact', '읽을거리': 'reading',
    '전체 보기': 'viewAll', '지금 시작': 'start', '테스트 시작하기': 'start', '공유': 'share', '테스트 목록': 'testList', '밸런스 목록': 'balanceList', '게임 목록': 'gameList',
    '오늘의 추천': 'todayPick', '매일 변경': 'changesDaily', '지금 인기 있어요': 'trending', '오늘의 퀴즈': 'dailyQuiz', '오늘의 나': 'todayMe'
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const trimmed = node.nodeValue.trim();
    const key = exactText[trimmed];
    if (!key) continue;
    const translated = getMessage(locale, key);
    if (translated !== trimmed) node.nodeValue = node.nodeValue.replace(trimmed, translated);
  }

  const selector = document.querySelector('#site-language-selector');
  if (selector) {
    selector.value = locale;
    selector.setAttribute('aria-label', getMessage(locale, 'languageLabel'));
    selector.title = getMessage(locale, 'languageLabel');
  }
  document.dispatchEvent(new CustomEvent('daily-test-lab:locale', { detail: { locale } }));
}

function installLanguageSelector() {
  const header = document.querySelector('.site-header');
  if (!header || document.querySelector('#site-language-selector')) return;
  const wrap = document.createElement('label');
  wrap.className = 'language-control';
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.textContent = '🌐';
  const selector = document.createElement('select');
  selector.id = 'site-language-selector';
  for (const locale of supportedLocales) {
    const option = document.createElement('option');
    option.value = locale;
    option.textContent = localeNames[locale];
    selector.append(option);
  }
  selector.addEventListener('change', () => {
    localStorage.setItem('daily-test-lab.locale-choice.v1', selector.value);
    applyTranslations(selector.value);
  });
  wrap.append(visual, selector);
  const action = header.querySelector('.header-action');
  action ? action.before(wrap) : header.append(wrap);
}

async function detectCountryLocale() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch('https://countries.dev/ip', {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const data = await response.json();
    return countryLocales[String(data.countryCode || data.country?.alpha2Code || '').toUpperCase()] || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

installLanguageSelector();
const manualLocale = localStorage.getItem('daily-test-lab.locale-choice.v1');
const browserLocale = normalizeLocale(navigator.languages?.[0] || navigator.language || 'en');
applyTranslations(manualLocale && supportedLocales.includes(manualLocale) ? manualLocale : browserLocale);

if (!manualLocale) {
  detectCountryLocale().then((countryLocale) => {
    if (countryLocale) applyTranslations(countryLocale);
  });
}

let translationTimer;
new MutationObserver(() => {
  clearTimeout(translationTimer);
  translationTimer = setTimeout(() => applyTranslations(document.documentElement.dataset.locale || browserLocale), 80);
}).observe(document.body, { childList: true, subtree: true });

