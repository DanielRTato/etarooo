const totalCards = 12; // 6 pares
const availableCards = [
  'assets/img/Bola+Soporte.png',
  'assets/img/caldero.png',
  'assets/img/escoba.png',
  'assets/img/FrascoPetaloH.png',
  'assets/img/PocionExp.png',
  'assets/img/sombrero.png'
];

let cards = [];
let selectedCards = [];
let currentMove = 0;
let currentAttempts = 0;
let turn = 1; // 1 = Jugador 1, 2 = Jugador 2
let score1 = 0;
let score2 = 0;

const cardTemplate = `
  <div class="card">
    <div class="back"></div>
    <div class="face"></div>
  </div>
`;

function updateStats() {
  document.querySelector('#stats').innerHTML = `${currentAttempts} intentos`;
  document.querySelector('#turn').innerText = `Turno: Jugador ${turn}`;
  document.querySelector('#score1').innerText = score1;
  document.querySelector('#score2').innerText = score2;
}

function activate(e) {
  if (currentMove < 2) {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('active')) return;

    if (!selectedCards.includes(card)) {
      card.classList.add('active');
      selectedCards.push(card);

      if (++currentMove === 2) {
        currentAttempts++;
        updateStats();

        const val1 = selectedCards[0].querySelector('.face').innerHTML;
        const val2 = selectedCards[1].querySelector('.face').innerHTML;

        if (val1 === val2) {
          // Match
          if (turn === 1) score1++;
          else score2++;
          selectedCards = [];
          currentMove = 0;
          updateStats();
        } else {
          // Si no hay match, aplicar temblor
          selectedCards[0].classList.add('shake');
          selectedCards[1].classList.add('shake');

          setTimeout(() => {
            selectedCards[0].classList.remove('active', 'shake');
            selectedCards[1].classList.remove('active', 'shake');
            selectedCards = [];
            currentMove = 0;
            turn = turn === 1 ? 2 : 1;
            updateStats();
          }, 700); // Tiempo de temblor (debe coincidir con la duración de la animación)
        }
      }
    }
  }
}

function getFaceValue(index) {
  return `<img src="${availableCards[index]}" alt="imagen">`;
}

function generateCardValues() {
  const values = [];
  for (let i = 0; i < availableCards.length; i++) {
    values.push(i);
    values.push(i);
  }

  // Shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  return values;
}

function initGame() {
  selectedCards = [];
  currentMove = 0;
  currentAttempts = 0;
  turn = 1;
  score1 = 0;
  score2 = 0;
  updateStats();

  const gameContainer = document.querySelector('#game');
  gameContainer.innerHTML = '';
  cards = [];

  const shuffledValues = generateCardValues();

  for (let i = 0; i < totalCards; i++) {
    const div = document.createElement('div');
    div.innerHTML = cardTemplate;
    const valueIndex = shuffledValues[i];
    div.querySelector('.face').innerHTML = getFaceValue(valueIndex);
    div.querySelector('.card').addEventListener('click', activate);
    cards.push(div);
    gameContainer.appendChild(div);
  }
}

document.querySelector('#reset-btn').addEventListener('click', initGame);
window.onload = initGame;
