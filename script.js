let countries = [];
let currentStage = 0;
let score = 0;
let timer;
let timeLeft = 15;
let userName = '';
const playerScores = JSON.parse(localStorage.getItem('playerScores')) || {};
const nameInputSection = document.getElementById('nameInputSection');
const userNameInput = document.getElementById('userNameInput');
const startGameButton = document.getElementById('startGame');
const quizSection = document.getElementById('quizSection');
const containerQuiz = document.getElementById('containerQuiz');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const timerElement = document.getElementById('timer');
const playAgainButton = document.getElementById('playAgain');
const viewPlayersButton = document.getElementById('viewPlayers');
const startVaqt = document.getElementById('vaqt');
const startOta = document.getElementById('ota');
const questionCounterElement = document.getElementById('questionCounter');

startGameButton.addEventListener('click', () => {
    userName = userNameInput.value;
    if (userName) {
        nameInputSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                countries = response.data;
                startGame();
            })
            .catch(error => console.error('nimadur xatolik ketib qolibdi', error));
    } else {
        alert('Iltimos, ismingizni kiriting!');
    }
});

function startGame() {
    score = 0;
    currentStage = 0;
    timeLeft = 15;
    scoreElement.innerText = score;
    loadQuiz();
    startVaqt.style.display = "block";
    startOta.style.display = "none";
}

function loadQuiz() {
    if (currentStage >= 1===0) {
        endGame();
        return;
    }

    clearInterval(timer);
    timeLeft = 15;
    updateTimer();

    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            showCorrectOption();
            setTimeout(() => nextStage(), 2000);
        }
    }, 1000);

    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const correctAnswer = randomCountry.capital ? randomCountry.capital[0] : 'Unknown';
    const options = [correctAnswer];
    while (options.length < 4) {
        const anotherCountry = countries[Math.floor(Math.random() * countries.length)];
        if (anotherCountry.capital && !options.includes(anotherCountry.capital[0])) {
            options.push(anotherCountry.capital[0]);
        }
    }

    options.sort(() => Math.random() - 0.5);
    containerQuiz.innerHTML = `
        <div class="container-quizapi">
            <h1>${randomCountry.name.common}</h1>
            <img src="${randomCountry.flags.png}" alt="Flag of ${randomCountry.name.common}" />
            <div class="answer-child">
            ${options.map(option => `
                <button class="option" onclick="checkAnswer('${correctAnswer}', '${option}', this)">${option}</button>
            `).join('')}
            </div>
        </div>
    `;

    questionCounterElement.innerText = `Savol: ${currentStage + 1}/10`;
}

function checkAnswer(correctAnswer, selectedAnswer, button) {
    clearInterval(timer);
    const buttons = document.querySelectorAll('.option');
    buttons.forEach(btn => {
        if (btn.innerText === correctAnswer) {
            btn.classList.add('correct');
        }
    });
    if (selectedAnswer === correctAnswer) {
        score += 10;
        scoreElement.innerText = score;
    } else {
        button.classList.add('incorrect');
    }
    setTimeout(() => nextStage(), 2000);
}

function showCorrectOption() {
    const buttons = document.querySelectorAll('.option');
    const correctAnswer = countries.find(country => country.name.common === document.querySelector('.container-quizapi h1').innerText).capital[0];
    buttons.forEach(btn => {
        if (btn.innerText === correctAnswer) {
            btn.classList.add('correct');
        }
    });
}

function nextStage() {
    currentStage++;
    if (currentStage < 10) {
        loadQuiz();
    } else {
        endGame();
    }
}

function endGame() {
    clearInterval(timer);
    containerQuiz.innerHTML = '';
    messageElement.innerText = `O'yin tugadi!\n Sizning yakuniy ballingiz ${score}. ${getResultMessage(score)}`;
    updateBestScore();
    showGameButtons();
    startVaqt.style.display = "none";
    startOta.style.display = "block";
}

function updateBestScore() {
    if (!playerScores[userName] || score > playerScores[userName]) {
        playerScores[userName] = score;
    }
    localStorage.setItem('playerScores', JSON.stringify(playerScores));
}

function getResultMessage(score) {
    if (score === 100) {
        return "\nSiz dahosiz!";
    } else if (score >= 70) {
        return "\nSiz yaxshiroq qila olasiz!";
    } else {
        return "\nKeyingi safar ko'proq harakat qiling!";
    }
}

function showGameButtons() {
    playAgainButton.classList.remove('hidden');
    viewPlayersButton.classList.remove('hidden');
    playAgainButton.addEventListener('click', () => {
        playAgainButton.classList.add('hidden');
        viewPlayersButton.classList.add('hidden');
        messageElement.innerText = '';
        startGame();
    });
    viewPlayersButton.addEventListener('click', () => {
        alert(`O'yinchilar va eng yaxshi ball:\n${Object.entries(playerScores).map(([name, score]) => `${name}: ${score}`).join('\n')}`);
    });
}

function updateTimer() {
    timerElement.innerText = `Vaqt qoldi: ${timeLeft}`;
}
