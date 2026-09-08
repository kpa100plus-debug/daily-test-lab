// Ordered templates: next number, select, memory tile, completion,
// wrong choice, sequence preview, sequence result, sequence input.
export const dynamicGameMessages = {
  en: ['Next number: $1', 'Select $1', 'Memory tile $1', '$1 / $2 complete', 'Find $1 first. Incorrect choices: $2', 'Watch $1 tiles light up in order.', 'You tried a sequence of $1 tiles.', '$1 / $2 entered'],
  ja: ['次の数字: $1', '$1を選択', '記憶タイル$1', '$1 / $2 完了', 'まず$1を探してください。選択ミス: $2回', '$1枚のタイルが順番に光ります。', '$1枚の順番に挑戦しました。', '$1 / $2 入力済み'],
  'zh-CN': ['下一个数字：$1', '选择$1', '记忆方块$1', '已完成 $1 / $2', '请先找$1。选错次数：$2', '$1个方块将依次亮起。', '你挑战了$1个方块的顺序。', '已输入 $1 / $2'],
  'zh-TW': ['下一個數字：$1', '選擇$1', '記憶方塊$1', '已完成 $1 / $2', '請先找$1。選錯次數：$2', '$1個方塊將依序亮起。', '你挑戰了$1個方塊的順序。', '已輸入 $1 / $2'],
  es: ['Siguiente número: $1', 'Seleccionar $1', 'Casilla de memoria $1', '$1 / $2 completados', 'Busca primero el $1. Errores: $2', 'Se iluminarán $1 casillas en orden.', 'Has intentado una secuencia de $1 casillas.', '$1 / $2 introducidos'],
  fr: ['Nombre suivant : $1', 'Choisir $1', 'Case mémoire $1', '$1 / $2 terminés', 'Trouvez d’abord $1. Erreurs : $2', '$1 cases vont s’allumer dans l’ordre.', 'Vous avez essayé une séquence de $1 cases.', '$1 / $2 saisis'],
  de: ['Nächste Zahl: $1', '$1 auswählen', 'Gedächtnisfeld $1', '$1 / $2 abgeschlossen', 'Finde zuerst $1. Fehler: $2', '$1 Felder leuchten nacheinander auf.', 'Du hast eine Folge mit $1 Feldern versucht.', '$1 / $2 eingegeben'],
  pt: ['Próximo número: $1', 'Selecionar $1', 'Bloco de memória $1', '$1 / $2 concluídos', 'Encontre primeiro $1. Erros: $2', '$1 blocos vão acender em ordem.', 'Você tentou uma sequência de $1 blocos.', '$1 / $2 inseridos'],
  id: ['Angka berikutnya: $1', 'Pilih $1', 'Kotak memori $1', '$1 / $2 selesai', 'Cari $1 dahulu. Kesalahan: $2', '$1 kotak akan menyala berurutan.', 'Anda mencoba urutan $1 kotak.', '$1 / $2 dimasukkan'],
  th: ['ตัวเลขถัดไป: $1', 'เลือก $1', 'ช่องความจำ $1', 'เสร็จแล้ว $1 / $2', 'หา $1 ก่อน เลือกผิด: $2 ครั้ง', 'ช่อง $1 ช่องจะสว่างตามลำดับ', 'คุณลองจำลำดับ $1 ช่องแล้ว', 'ป้อนแล้ว $1 / $2'],
  vi: ['Số tiếp theo: $1', 'Chọn $1', 'Ô ghi nhớ $1', 'Hoàn thành $1 / $2', 'Tìm $1 trước. Số lần chọn sai: $2', '$1 ô sẽ sáng theo thứ tự.', 'Bạn đã thử một chuỗi gồm $1 ô.', 'Đã nhập $1 / $2'],
  hi: ['अगली संख्या: $1', '$1 चुनें', 'स्मृति टाइल $1', '$1 / $2 पूरे', 'पहले $1 खोजें। गलत चयन: $2', '$1 टाइलें क्रम से चमकेंगी।', 'आपने $1 टाइलों के क्रम का प्रयास किया।', '$1 / $2 दर्ज'],
  ar: ['الرقم التالي: $1', 'اختر $1', 'مربع الذاكرة $1', 'اكتمل $1 / $2', 'ابحث عن $1 أولاً. الاختيارات الخاطئة: $2', 'ستضيء $1 مربعات بالترتيب.', 'حاولت تذكّر تسلسل من $1 مربعات.', 'تم إدخال $1 / $2'],
  ru: ['Следующее число: $1', 'Выбрать $1', 'Ячейка памяти $1', 'Завершено $1 / $2', 'Сначала найдите $1. Ошибок: $2', '$1 ячеек загорятся по очереди.', 'Вы попробовали последовательность из $1 ячеек.', 'Введено $1 / $2']
};

const patterns = [
  /^다음 숫자: (\d+)$/, /^(\d+) 선택$/, /^(\d+)번 기억 타일$/,
  /^(\d+) \/ (\d+) 완료$/, /^(\d+)부터 찾아보세요\. 틀린 선택 (\d+)회$/,
  /^(\d+)개의 순서가 빛납니다\.$/, /^이번에는 (\d+)개의 순서에 도전했어요\.$/,
  /^(\d+) \/ (\d+) 입력$/
];
export function translateGameLabel(value, locale) {
  const templates = dynamicGameMessages[locale];
  if (!templates || typeof value !== 'string') return value;
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(value)) return value.replace(patterns[i], templates[i]);
  }
  return value;
}
