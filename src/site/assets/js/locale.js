export const supportedLocales = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de', 'pt', 'id', 'th', 'vi', 'hi', 'ar', 'ru'];

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

export const getMessage = (locale, key) => messages[locale]?.[key] ?? en[key] ?? key;

const phraseDictionaryCache = new Map([['ko', Promise.resolve({})]]);
const originalTextValues = new WeakMap();
const originalAttributeValues = new WeakMap();
const browserDocument = typeof document === 'undefined' ? null : document;
const originalDocumentTitle = browserDocument?.title || '';
const originalDocumentDescription = browserDocument?.querySelector('meta[name="description"]')?.content || '';
let localeRequestId = 0;

const criticalPhraseOverrides = {
  en: {
    '내 반응속도는 상위 몇 %?': 'What percentile is my reaction speed?',
    '화면이 바뀌는 순간 얼마나 빠르게 누를 수 있을까요?': 'How quickly can you tap when the screen changes?',
    '기록 도전': 'Challenge the record',
    '방문 기록은 이 브라우저에, 미니게임 최고 기록은 Firebase에 저장됩니다. Google 로그인하면 다른 기기에서도 이어볼 수 있어요.': 'Visit history is stored in this browser, while your best mini-game scores are stored in Firebase. Sign in with Google to continue on other devices.',
    '내 결과를 계속 모아보세요': 'Keep all your results',
    'Google 로그인으로 미니게임 최고 기록을 어느 기기에서나 이어보세요.': 'Sign in with Google to continue your best mini-game scores on any device.',
    '내 기록 열기': 'Open my records', '연속 방문': 'Visit streak', '플레이': 'Plays', '누적 방문일': 'Total visit days', '오늘의 1문제': "Today's question",
    '나를 알아보는 2분': 'Discover yourself in 2 minutes', '둘 중 하나만 고르기': 'Pick one of two', '짧고 강한 기록 도전': 'Quick, intense record challenges', '하루 한 문제': 'One question a day', '방문과 플레이 기록': 'Visits and play history',
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Which part of the brain plays an important role in forming memories?',
    'A. 소뇌': 'A. Cerebellum', 'B. 해마': 'B. Hippocampus', 'C. 연수': 'C. Medulla oblongata',
    '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.': 'Correct! The hippocampus plays an important role in forming new memories and learning.',
    '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.': 'Not quite. The answer is B. Hippocampus, which plays an important role in forming new memories.'
  },
  ja: {
    '내 반응속도는 상위 몇 %?': '私の反応速度は上位何％？',
    '화면이 바뀌는 순간 얼마나 빠르게 누를 수 있을까요?': '画面が変わった瞬間、どれくらい速く押せるでしょうか？',
    '기록 도전': '記録に挑戦',
    '방문 기록은 이 브라우저에, 미니게임 최고 기록은 Firebase에 저장됩니다. Google 로그인하면 다른 기기에서도 이어볼 수 있어요.': '訪問履歴はこのブラウザに、ミニゲームの最高記録はFirebaseに保存されます。Googleでログインすると他の端末でも続けられます。',
    '내 결과를 계속 모아보세요': '結果をまとめて残しましょう',
    'Google 로그인으로 미니게임 최고 기록을 어느 기기에서나 이어보세요.': 'Googleでログインすると、どの端末でもミニゲームの最高記録を引き継げます。',
    '내 기록 열기': '自分の記録を開く', '연속 방문': '連続訪問', '플레이': 'プレイ', '누적 방문일': '累計訪問日数', '오늘의 1문제': '今日の1問',
    '나를 알아보는 2분': '自分を知る2分', '둘 중 하나만 고르기': '2つから1つを選ぶ', '짧고 강한 기록 도전': '短時間の記録チャレンジ', '하루 한 문제': '1日1問', '방문과 플레이 기록': '訪問・プレイ記録',
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': '記憶の形成に重要な役割を果たす脳の部位は？',
    'A. 소뇌': 'A. 小脳', 'B. 해마': 'B. 海馬', 'C. 연수': 'C. 延髄',
    '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.': '正解です！海馬は新しい記憶の形成と学習に重要な役割を果たします。',
    '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.': '惜しい！正解はBの海馬です。新しい記憶の形成に重要な役割を果たします。'
  },
  'zh-CN': {
    '내 반응속도는 상위 몇 %?': '我的反应速度排在前百分之几？',
    '화면이 바뀌는 순간 얼마나 빠르게 누를 수 있을까요?': '画面变化时，你能多快点击？',
    '기록 도전': '挑战纪录',
    '방문 기록은 이 브라우저에, 미니게임 최고 기록은 Firebase에 저장됩니다. Google 로그인하면 다른 기기에서도 이어볼 수 있어요.': '访问记录保存在此浏览器中，小游戏最高纪录保存在Firebase中。登录Google后可在其他设备上继续。',
    '내 결과를 계속 모아보세요': '继续收集我的结果',
    'Google 로그인으로 미니게임 최고 기록을 어느 기기에서나 이어보세요.': '登录Google后，可在任何设备上继续查看小游戏最高纪录。',
    '내 기록 열기': '打开我的记录', '연속 방문': '连续访问', '플레이': '游玩次数', '누적 방문일': '累计访问天数', '오늘의 1문제': '今日一题',
    '나를 알아보는 2분': '2分钟了解自己', '둘 중 하나만 고르기': '二选一', '짧고 강한 기록 도전': '短时高强度纪录挑战', '하루 한 문제': '每日一题', '방문과 플레이 기록': '访问和游玩记录',
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': '在记忆形成中起重要作用的大脑部位是？',
    'A. 소뇌': 'A. 小脑', 'B. 해마': 'B. 海马', 'C. 연수': 'C. 延髓',
    '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.': '答对了！海马在形成新记忆和学习中起着重要作用。',
    '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.': '很遗憾，正确答案是B. 海马。它在形成新记忆中起着重要作用。'
  },
  'zh-TW': {
    '내 반응속도는 상위 몇 %?': '我的反應速度排在前百分之幾？',
    '화면이 바뀌는 순간 얼마나 빠르게 누를 수 있을까요?': '畫面變化時，你能多快點擊？',
    '기록 도전': '挑戰紀錄',
    '방문 기록은 이 브라우저에, 미니게임 최고 기록은 Firebase에 저장됩니다. Google 로그인하면 다른 기기에서도 이어볼 수 있어요.': '造訪紀錄儲存在此瀏覽器中，小遊戲最高紀錄儲存在Firebase中。登入Google後可在其他裝置上繼續。',
    '내 결과를 계속 모아보세요': '繼續收集我的結果',
    'Google 로그인으로 미니게임 최고 기록을 어느 기기에서나 이어보세요.': '登入Google後，可在任何裝置上繼續查看小遊戲最高紀錄。',
    '내 기록 열기': '開啟我的紀錄', '연속 방문': '連續造訪', '플레이': '遊玩次數', '누적 방문일': '累計造訪天數', '오늘의 1문제': '今日一題',
    '나를 알아보는 2분': '2分鐘瞭解自己', '둘 중 하나만 고르기': '二選一', '짧고 강한 기록 도전': '短時高強度紀錄挑戰', '하루 한 문제': '每日一題', '방문과 플레이 기록': '造訪和遊玩紀錄',
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': '在記憶形成中扮演重要角色的大腦部位是？',
    'A. 소뇌': 'A. 小腦', 'B. 해마': 'B. 海馬', 'C. 연수': 'C. 延髓',
    '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.': '答對了！海馬在形成新記憶和學習中扮演重要角色。',
    '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.': '很可惜，正確答案是B. 海馬。它在形成新記憶中扮演重要角色。'
  },
  es: {
    '내 반응속도는 상위 몇 %?': '¿En qué percentil está mi velocidad de reacción?',
    '화면이 바뀌는 순간 얼마나 빠르게 누를 수 있을까요?': '¿Qué tan rápido puedes pulsar cuando cambia la pantalla?',
    '기록 도전': 'Desafiar el récord',
    '방문 기록은 이 브라우저에, 미니게임 최고 기록은 Firebase에 저장됩니다. Google 로그인하면 다른 기기에서도 이어볼 수 있어요.': 'El historial de visitas se guarda en este navegador y los mejores resultados de los minijuegos en Firebase. Inicia sesión con Google para continuar en otros dispositivos.',
    '내 결과를 계속 모아보세요': 'Guarda todos tus resultados',
    'Google 로그인으로 미니게임 최고 기록을 어느 기기에서나 이어보세요.': 'Inicia sesión con Google para continuar tus mejores resultados en cualquier dispositivo.',
    '내 기록 열기': 'Abrir mis registros', '연속 방문': 'Racha de visitas', '플레이': 'Partidas', '누적 방문일': 'Días de visita acumulados', '오늘의 1문제': 'Pregunta del día',
    '나를 알아보는 2분': 'Descúbrete en 2 minutos', '둘 중 하나만 고르기': 'Elige una de dos', '짧고 강한 기록 도전': 'Retos rápidos e intensos', '하루 한 문제': 'Una pregunta al día', '방문과 플레이 기록': 'Historial de visitas y partidas',
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': '¿Qué parte del cerebro desempeña un papel importante en la formación de recuerdos?',
    'A. 소뇌': 'A. Cerebelo', 'B. 해마': 'B. Hipocampo', 'C. 연수': 'C. Bulbo raquídeo',
    '정답이에요! 해마는 새로운 기억의 형성과 학습에 중요한 역할을 해요.': '¡Correcto! El hipocampo desempeña un papel importante en la formación de nuevos recuerdos y el aprendizaje.',
    '아쉬워요. 정답은 B. 해마예요. 새로운 기억을 만드는 데 중요한 역할을 합니다.': 'Casi. La respuesta es B. Hipocampo, que desempeña un papel importante en la formación de nuevos recuerdos.'
  },
  fr: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Quelle partie du cerveau joue un rôle important dans la formation des souvenirs ?',
    'A. 소뇌': 'A. Cervelet', 'B. 해마': 'B. Hippocampe', 'C. 연수': 'C. Bulbe rachidien'
  },
  de: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Welcher Teil des Gehirns spielt eine wichtige Rolle bei der Bildung von Erinnerungen?',
    'A. 소뇌': 'A. Kleinhirn', 'B. 해마': 'B. Hippocampus', 'C. 연수': 'C. Verlängertes Mark'
  },
  pt: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Qual parte do cérebro desempenha um papel importante na formação de memórias?',
    'A. 소뇌': 'A. Cerebelo', 'B. 해마': 'B. Hipocampo', 'C. 연수': 'C. Bulbo raquidiano'
  },
  id: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Bagian otak mana yang berperan penting dalam pembentukan ingatan?',
    'A. 소뇌': 'A. Otak kecil', 'B. 해마': 'B. Hipokampus', 'C. 연수': 'C. Medula oblongata'
  },
  th: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'สมองส่วนใดมีบทบาทสำคัญในการสร้างความทรงจำ?',
    'A. 소뇌': 'A. สมองน้อย', 'B. 해마': 'B. ฮิปโปแคมปัส', 'C. 연수': 'C. เมดัลลาออบลองกาตา'
  },
  vi: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Phần nào của não đóng vai trò quan trọng trong việc hình thành ký ức?',
    'A. 소뇌': 'A. Tiểu não', 'B. 해마': 'B. Hồi hải mã', 'C. 연수': 'C. Hành não'
  },
  hi: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'स्मृतियों के निर्माण में मस्तिष्क का कौन-सा भाग महत्वपूर्ण भूमिका निभाता है?',
    'A. 소뇌': 'A. अनुमस्तिष्क', 'B. 해마': 'B. हिप्पोकैम्पस', 'C. 연수': 'C. मेडुला ऑब्लोंगाटा'
  },
  ar: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'أي جزء من الدماغ يؤدي دورًا مهمًا في تكوين الذكريات؟',
    'A. 소뇌': 'A. المخيخ', 'B. 해마': 'B. الحُصين', 'C. 연수': 'C. النخاع المستطيل'
  },
  ru: {
    '기억을 만드는 데 중요한 역할을 하는 뇌 부위는?': 'Какая часть мозга играет важную роль в формировании воспоминаний?',
    'A. 소뇌': 'A. Мозжечок', 'B. 해마': 'B. Гиппокамп', 'C. 연수': 'C. Продолговатый мозг'
  }
};

const dynamicUnitLabels = {
  en: { tests: ' tests', questions: ' questions', attempts: ' attempts', times: ' times', stages: ' levels', seconds: ' sec', participants: ' participants', votes: ' votes', question: 'Question', selected: 'my choice', challenge: 'Challenge →', start: 'Start →' },
  ja: { tests: '件のテスト', questions: '問', attempts: '回挑戦', times: '回', stages: '段階', seconds: '秒', participants: '人参加', votes: '票', question: '質問', selected: '自分の選択', challenge: '挑戦 →', start: '開始 →' },
  'zh-CN': { tests: '个测试', questions: '题', attempts: '次挑战', times: '次', stages: '关', seconds: '秒', participants: '人参与', votes: '票', question: '问题', selected: '我的选择', challenge: '挑战 →', start: '开始 →' },
  'zh-TW': { tests: '個測驗', questions: '題', attempts: '次挑戰', times: '次', stages: '關', seconds: '秒', participants: '人參與', votes: '票', question: '問題', selected: '我的選擇', challenge: '挑戰 →', start: '開始 →' },
  es: { tests: ' pruebas', questions: ' preguntas', attempts: ' intentos', times: ' veces', stages: ' niveles', seconds: ' s', participants: ' participantes', votes: ' votos', question: 'Pregunta', selected: 'mi elección', challenge: 'Desafiar →', start: 'Empezar →' },
  fr: { tests: ' tests', questions: ' questions', attempts: ' tentatives', times: ' fois', stages: ' niveaux', seconds: ' s', participants: ' participants', votes: ' votes', question: 'Question', selected: 'mon choix', challenge: 'Relever le défi →', start: 'Commencer →' },
  de: { tests: ' Tests', questions: ' Fragen', attempts: ' Versuche', times: '-mal', stages: ' Stufen', seconds: ' Sek.', participants: ' Teilnehmende', votes: ' Stimmen', question: 'Frage', selected: 'meine Wahl', challenge: 'Ausprobieren →', start: 'Starten →' },
  pt: { tests: ' testes', questions: ' perguntas', attempts: ' tentativas', times: ' vezes', stages: ' níveis', seconds: ' s', participants: ' participantes', votes: ' votos', question: 'Pergunta', selected: 'minha escolha', challenge: 'Desafiar →', start: 'Começar →' },
  id: { tests: ' tes', questions: ' pertanyaan', attempts: ' percobaan', times: ' kali', stages: ' level', seconds: ' dtk', participants: ' peserta', votes: ' suara', question: 'Pertanyaan', selected: 'pilihan saya', challenge: 'Tantang →', start: 'Mulai →' },
  th: { tests: ' แบบทดสอบ', questions: ' ข้อ', attempts: ' ครั้ง', times: ' ครั้ง', stages: ' ด่าน', seconds: ' วินาที', participants: ' คน', votes: ' โหวต', question: 'คำถาม', selected: 'ตัวเลือกของฉัน', challenge: 'ท้าทาย →', start: 'เริ่ม →' },
  vi: { tests: ' bài kiểm tra', questions: ' câu hỏi', attempts: ' lần thử', times: ' lần', stages: ' cấp', seconds: ' giây', participants: ' người tham gia', votes: ' phiếu', question: 'Câu hỏi', selected: 'lựa chọn của tôi', challenge: 'Thử thách →', start: 'Bắt đầu →' },
  hi: { tests: ' टेस्ट', questions: ' प्रश्न', attempts: ' प्रयास', times: ' बार', stages: ' स्तर', seconds: ' सेकंड', participants: ' प्रतिभागी', votes: ' वोट', question: 'प्रश्न', selected: 'मेरी पसंद', challenge: 'चुनौती →', start: 'शुरू करें →' },
  ar: { tests: ' اختبارات', questions: ' أسئلة', attempts: ' محاولات', times: ' مرات', stages: ' مستويات', seconds: ' ث', participants: ' مشاركين', votes: ' أصوات', question: 'السؤال', selected: 'اختياري', challenge: 'تحدَّ →', start: 'ابدأ →' },
  ru: { tests: ' тестов', questions: ' вопросов', attempts: ' попыток', times: ' раз', stages: ' уровней', seconds: ' сек.', participants: ' участников', votes: ' голосов', question: 'Вопрос', selected: 'мой выбор', challenge: 'Испытать →', start: 'Начать →' }
};

const dynamicSharedLabels = {
  en: { myResult: 'My result', recordsSuffix: '’s records', sameAccount: 'Continue on other devices with the same account.' },
  ja: { myResult: '自分の結果', recordsSuffix: 'の記録', sameAccount: '他の端末でも同じアカウントで続けられます。' },
  'zh-CN': { myResult: '我的结果', recordsSuffix: '的记录', sameAccount: '可在其他设备上使用同一账号继续。' },
  'zh-TW': { myResult: '我的結果', recordsSuffix: '的紀錄', sameAccount: '可在其他裝置上使用同一帳號繼續。' },
  es: { myResult: 'Mi resultado', recordsSuffix: ': registros', sameAccount: 'Continúa en otros dispositivos con la misma cuenta.' },
  fr: { myResult: 'Mon résultat', recordsSuffix: ' : résultats', sameAccount: 'Continuez sur vos autres appareils avec le même compte.' },
  de: { myResult: 'Mein Ergebnis', recordsSuffix: ' – Rekorde', sameAccount: 'Mit demselben Konto auf anderen Geräten fortfahren.' },
  pt: { myResult: 'Meu resultado', recordsSuffix: ': recordes', sameAccount: 'Continue em outros dispositivos com a mesma conta.' },
  id: { myResult: 'Hasil saya', recordsSuffix: ' – catatan', sameAccount: 'Lanjutkan di perangkat lain dengan akun yang sama.' },
  th: { myResult: 'ผลลัพธ์ของฉัน', recordsSuffix: ' – สถิติ', sameAccount: 'เล่นต่อบนอุปกรณ์อื่นด้วยบัญชีเดียวกัน' },
  vi: { myResult: 'Kết quả của tôi', recordsSuffix: ' – thành tích', sameAccount: 'Tiếp tục trên thiết bị khác bằng cùng một tài khoản.' },
  hi: { myResult: 'मेरा परिणाम', recordsSuffix: ' के रिकॉर्ड', sameAccount: 'इसी खाते से दूसरे डिवाइस पर जारी रखें।' },
  ar: { myResult: 'نتيجتي', recordsSuffix: ' – السجلات', sameAccount: 'تابع على الأجهزة الأخرى بالحساب نفسه.' },
  ru: { myResult: 'Мой результат', recordsSuffix: ' — рекорды', sameAccount: 'Продолжайте на других устройствах с той же учётной записью.' }
};

function translateDynamicPhrase(value, locale) {
  const labels = dynamicUnitLabels[locale];
  const shared = dynamicSharedLabels[locale];
  if (!labels || typeof value !== 'string') return value;
  return value
    .replace(/([\d,.]+)\s*개 테스트/g, `$1${labels.tests}`)
    .replace(/([\d,.]+)\s*개 질문/g, `$1${labels.questions}`)
    .replace(/([\d,.]+)\s*문항/g, `$1${labels.questions}`)
    .replace(/([\d,.]+)\s*회 도전/g, `$1${labels.attempts}`)
    .replace(/([\d,.]+)\s*회/g, `$1${labels.times}`)
    .replace(/([\d,.]+)\s*단계/g, `$1${labels.stages}`)
    .replace(/([\d,.]+)\s*초/g, `$1${labels.seconds}`)
    .replace(/([\d,.]+)\s*명 참여/g, `$1${labels.participants}`)
    .replace(/([\d,.]+)\s*표/g, `$1${labels.votes}`)
    .replace(/질문\s+([\d,.]+\s*\/\s*[\d,.]+)/g, `${labels.question} $1`)
    .replaceAll('나의 선택', labels.selected)
    .replaceAll('도전 →', labels.challenge)
    .replaceAll('시작 →', labels.start)
    .replaceAll('내 결과', shared.myResult)
    .replaceAll('님의 기록', shared.recordsSuffix)
    .replaceAll('다른 기기에서도 같은 계정으로 이어볼 수 있어요.', shared.sameAccount);
}

const normalizePhrase = (value = '') => value.replace(/\s+/g, ' ').trim();

export const getCurrentLocale = () => normalizeLocale(
  browserDocument?.documentElement.dataset.locale || browserDocument?.documentElement.lang || 'ko'
);

async function loadPhraseDictionary(locale) {
  if (locale === 'ko') return {};
  if (!phraseDictionaryCache.has(locale)) {
    const dictionaryUrl = new URL(`../../data/locales/${locale}.json?v=20260827-2`, import.meta.url);
    phraseDictionaryCache.set(locale, fetch(dictionaryUrl, { cache: 'force-cache' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`locale ${locale} ${response.status}`);
        const payload = await response.json();
        return payload.translations || {};
      })
      .catch((error) => {
        console.warn('전체 번역 파일을 불러오지 못했습니다:', error.message);
        phraseDictionaryCache.delete(locale);
        return {};
      }));
  }
  return phraseDictionaryCache.get(locale);
}

export function translatePhraseWithDictionary(value, locale, dictionary = {}) {
  if (locale === 'ko' || typeof value !== 'string') return value;
  const key = normalizePhrase(value);
  if (!key) return value;
  const translated = criticalPhraseOverrides[locale]?.[key] || dictionary[key];
  if (!translated || translated === key) return translateDynamicPhrase(value, locale);
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

export async function translateText(value, locale = getCurrentLocale()) {
  const dictionary = await loadPhraseDictionary(locale);
  return translatePhraseWithDictionary(value, locale, dictionary);
}

export async function localizeContentData(value, locale = getCurrentLocale()) {
  const dictionary = await loadPhraseDictionary(locale);
  const localize = (entry, fieldName = '') => {
    if (fieldName === 'sourceCategory') return entry;
    if (typeof entry === 'string') return translatePhraseWithDictionary(entry, locale, dictionary);
    if (Array.isArray(entry)) return entry.map((item) => localize(item));
    if (entry && typeof entry === 'object') {
      return Object.fromEntries(
        Object.entries(entry).map(([key, item]) => [key, localize(item, key)])
      );
    }
    return entry;
  };
  return localize(value);
}

function shouldSkipTextNode(node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(
    '#site-language-selector, script, style, noscript, code, pre, [data-i18n], [data-i18n-html]'
  ));
}

function applyDictionaryToDocument(locale, dictionary) {
  if (document.body.classList.contains('admin-page')) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (shouldSkipTextNode(node)) continue;
    if (!originalTextValues.has(node)) originalTextValues.set(node, node.nodeValue);
    const original = originalTextValues.get(node);
    const translated = translatePhraseWithDictionary(original, locale, dictionary);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
  document.querySelectorAll(attributes.map((name) => `[${name}]`).join(',')).forEach((element) => {
    if (element.closest('#site-language-selector')) return;
    if (!originalAttributeValues.has(element)) originalAttributeValues.set(element, new Map());
    const originals = originalAttributeValues.get(element);
    for (const name of attributes) {
      const current = element.getAttribute(name);
      if (current === null) continue;
      if (!originals.has(name)) originals.set(name, current);
      const translated = translatePhraseWithDictionary(originals.get(name), locale, dictionary);
      if (current !== translated) element.setAttribute(name, translated);
    }
  });

  const localizedTitle = translatePhraseWithDictionary(originalDocumentTitle, locale, dictionary);
  document.title = localizedTitle;
  const description = document.querySelector('meta[name="description"]');
  const localizedDescription = translatePhraseWithDictionary(
    originalDocumentDescription,
    locale,
    dictionary
  );
  if (description && originalDocumentDescription) {
    description.content = localizedDescription;
  }
  document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => {
    meta.content = localizedTitle;
  });
  document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach((meta) => {
    meta.content = localizedDescription;
  });
  const openGraphLocale = document.querySelector('meta[property="og:locale"]');
  if (openGraphLocale) openGraphLocale.content = locale.replace('-', '_');
}

function applyBaseTranslations(locale) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = getMessage(locale, element.dataset.i18n);
    if (value && element.textContent !== value) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const value = getMessage(locale, element.dataset.i18nHtml);
    if (value && element.innerHTML !== value) element.innerHTML = value;
  });

  const selector = document.querySelector('#site-language-selector');
  if (selector) {
    selector.value = locale;
    selector.setAttribute('aria-label', getMessage(locale, 'languageLabel'));
    selector.title = getMessage(locale, 'languageLabel');
  }
}

export async function applyTranslations(locale) {
  if (!browserDocument) return;
  const normalizedLocale = normalizeLocale(locale);
  const requestId = ++localeRequestId;
  document.documentElement.lang = normalizedLocale;
  document.documentElement.dir = normalizedLocale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.locale = normalizedLocale;
  document.documentElement.dataset.localeStatus = 'loading';
  applyBaseTranslations(normalizedLocale);
  document.dispatchEvent(new CustomEvent('daily-test-lab:locale', {
    detail: { locale: normalizedLocale }
  }));

  const dictionary = await loadPhraseDictionary(normalizedLocale);
  if (requestId !== localeRequestId || getCurrentLocale() !== normalizedLocale) return;
  applyDictionaryToDocument(normalizedLocale, dictionary);
  document.documentElement.dataset.localeStatus = 'ready';
  document.dispatchEvent(new CustomEvent('daily-test-lab:locale-ready', {
    detail: { locale: normalizedLocale }
  }));
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

const isAdminPage = browserDocument?.body.classList.contains('admin-page');
const manualLocale = browserDocument ? localStorage.getItem('daily-test-lab.locale-choice.v1') : null;
const browserLocale = normalizeLocale(
  typeof navigator === 'undefined' ? 'ko' : navigator.languages?.[0] || navigator.language || 'en'
);

if (browserDocument && !isAdminPage) {
  installLanguageSelector();
  applyTranslations(manualLocale && supportedLocales.includes(manualLocale) ? manualLocale : browserLocale);

  if (!manualLocale) {
    detectCountryLocale().then((countryLocale) => {
      if (countryLocale) applyTranslations(countryLocale);
    });
  }

  let translationTimer;
  new MutationObserver(() => {
    clearTimeout(translationTimer);
    translationTimer = setTimeout(async () => {
      const locale = getCurrentLocale();
      const dictionary = await loadPhraseDictionary(locale);
      applyDictionaryToDocument(locale, dictionary);
    }, 80);
  }).observe(document.body, { childList: true, subtree: true });
}

