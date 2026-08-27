import { shareOrCopy } from './share-service.js';

const zodiacs = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const icons = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'];
const messages = [
  ['작은 선택이 좋은 흐름을 만듭니다.', '미뤄둔 일을 하나 끝내면 마음까지 가벼워져요.', '서두르지 않을수록 정확한 답이 보입니다.'],
  ['주변의 제안 속에 실속 있는 기회가 있습니다.', '익숙한 방법을 조금 바꾸면 결과가 달라져요.', '오늘은 시작보다 정리가 더 큰 힘을 냅니다.'],
  ['솔직한 한마디가 관계의 온도를 높입니다.', '기대하지 않았던 연락이 반가운 변화를 줍니다.', '나를 먼저 돌보면 좋은 인연도 자연스럽게 따라옵니다.']
];
const colors = ['보라', '파랑', '초록', '주황', '분홍', '금색'];
const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const hash = (text) => [...text].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

const grid = document.querySelector('#zodiac-grid');
const result = document.querySelector('#fortune-result');

zodiacs.forEach((name, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span>${icons[index]}</span><strong>${name}띠</strong>`;
  button.addEventListener('click', () => showFortune(name, index));
  grid.append(button);
});

function showFortune(name, index) {
  const seed = hash(`${dateKey}-${name}`);
  const overall = messages[0][seed % messages[0].length];
  const money = messages[1][(seed >>> 3) % messages[1].length];
  const love = messages[2][(seed >>> 5) % messages[2].length];
  const score = 68 + (seed % 29);
  const luckyNumber = 1 + (seed % 45);
  const luckyColor = colors[(seed >>> 2) % colors.length];
  result.hidden = false;
  result.innerHTML = `<p class="reading-date">${dateKey} · ${icons[index]} ${name}띠</p><h2>오늘의 운세 점수 <strong>${score}점</strong></h2><div class="reading-sections"><article><span>🌤️ 전체운</span><p>${overall}</p></article><article><span>💰 재물·일운</span><p>${money}</p></article><article><span>💗 연애·관계운</span><p>${love}</p></article></div><div class="lucky-row"><span>행운 숫자 <b>${luckyNumber}</b></span><span>행운 색 <b>${luckyColor}</b></span></div><button class="result-share-button" type="button" id="fortune-share">결과 공유하기</button><p class="reading-disclaimer">운세는 재미와 하루의 긍정적인 참고를 위한 콘텐츠입니다.</p>`;
  document.querySelector('#fortune-share').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    const response = await shareOrCopy({ title: `${name}띠 오늘의 운세`, text: `${name}띠 오늘의 운세는 ${score}점! ${overall}`, url: location.href });
    button.disabled = false;
    if (response.method === 'copied') button.textContent = '공유 링크 복사 완료';
    else if (response.method === 'shared') button.textContent = '공유 완료';
    else if (response.method !== 'cancelled') button.textContent = '복사 창을 확인하세요';
    setTimeout(() => { button.textContent = '결과 공유하기'; }, 2200);
  });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

