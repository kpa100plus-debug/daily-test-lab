import { shareOrCopy } from './share-service.js';

const cards = [
  { name: '태양', icon: '☀️', theme: '확신', message: '숨기지 말고 당신의 장점을 드러내세요. 밝은 태도가 사람과 기회를 끌어당깁니다.', money: '가치가 분명한 선택에 집중하세요.', love: '솔직한 표현이 관계를 따뜻하게 합니다.' },
  { name: '별', icon: '⭐', theme: '회복', message: '조급함을 내려놓으면 다시 희망이 보입니다. 작은 진전도 충분히 의미 있는 하루입니다.', money: '장기적인 계획을 다시 점검하기 좋습니다.', love: '기대보다 진심을 보여주는 것이 중요해요.' },
  { name: '마법사', icon: '✨', theme: '시작', message: '이미 필요한 도구는 당신 안에 있습니다. 완벽을 기다리지 말고 첫 단계를 시작하세요.', money: '새 아이디어를 작은 규모로 시험해 보세요.', love: '먼저 말을 건네면 흐름이 바뀝니다.' },
  { name: '힘', icon: '🦁', theme: '용기', message: '강하게 밀어붙이기보다 부드럽게 꾸준히 가는 힘이 필요한 날입니다.', money: '충동을 참는 것이 오늘의 이익입니다.', love: '상대의 마음을 이기려 하지 말고 이해해 보세요.' },
  { name: '운명의 수레바퀴', icon: '🎡', theme: '변화', message: '예상 밖의 변화가 새로운 문을 열 수 있습니다. 흐름을 거스르기보다 활용하세요.', money: '우연한 정보도 사실을 확인하면 기회가 됩니다.', love: '새로운 만남이나 관계의 전환점이 찾아옵니다.' },
  { name: '은둔자', icon: '🏮', theme: '통찰', message: '바깥의 답보다 내 마음의 기준을 확인하세요. 잠깐의 혼자만의 시간이 답을 선명하게 합니다.', money: '지출과 계획을 차분히 검토하세요.', love: '감정을 정리한 뒤 대화하면 오해가 줄어요.' }
];
const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const storageKey = `daily-tarot:${dateKey}`;
const grid = document.querySelector('#tarot-grid');
const result = document.querySelector('#tarot-result');

for (let index = 0; index < 3; index += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tarot-card-back';
  button.setAttribute('aria-label', `${index + 1}번째 타로 카드 선택`);
  button.innerHTML = `<span>✦</span><strong>${index + 1}</strong><small>마음이 끌리는 카드</small>`;
  button.addEventListener('click', () => drawCard(index));
  grid.append(button);
}

function selectedCard(index) {
  const seed = [...`${dateKey}-${index}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return cards[seed % cards.length];
}

function drawCard(index) {
  const saved = Number(localStorage.getItem(storageKey));
  const choice = Number.isInteger(saved) ? saved : index;
  localStorage.setItem(storageKey, String(choice));
  const card = selectedCard(choice);
  result.hidden = false;
  result.innerHTML = `<p class="reading-date">${dateKey} · 오늘의 한 장</p><div class="tarot-reveal"><span>${card.icon}</span><p>${card.theme}</p><h2>${card.name}</h2></div><p class="tarot-message">${card.message}</p><div class="reading-sections"><article><span>💰 돈·일</span><p>${card.money}</p></article><article><span>💗 사랑·관계</span><p>${card.love}</p></article></div><button class="result-share-button" type="button" id="tarot-share">카드 공유하기</button><p class="reading-disclaimer">타로는 재미와 자기성찰을 위한 참고 콘텐츠입니다. 내일 새로운 카드를 만나보세요.</p>`;
  grid.querySelectorAll('button').forEach((button, cardIndex) => { button.disabled = true; button.classList.toggle('selected', cardIndex === choice); });
  document.querySelector('#tarot-share').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    const response = await shareOrCopy({ title: '오늘의 타로', text: `오늘의 카드는 ${card.name} — ${card.message}`, url: location.href });
    button.disabled = false;
    if (response.method === 'copied') button.textContent = '공유 링크 복사 완료';
    else if (response.method === 'shared') button.textContent = '공유 완료';
    else if (response.method !== 'cancelled') button.textContent = '복사 창을 확인하세요';
    setTimeout(() => { button.textContent = '카드 공유하기'; }, 2200);
  });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const savedChoice = Number(localStorage.getItem(storageKey));
if (Number.isInteger(savedChoice)) drawCard(savedChoice);

