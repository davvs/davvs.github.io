let persistenceManager = new PersistenceManager();

const urlParams = new URLSearchParams(window.location.search);
const localList = urlParams.get("localList");
const rehearsalList = persistenceManager.getPracticeListByName(localList);
let currentRehearsal;

const startForm = document.getElementById("startForm");
const quizForm = document.getElementById("quizForm");
const messageDiv = document.getElementById("message");
const debugButton = document.getElementById("debugButton");

const debugDataDiv = document.getElementById("debugData");

let lowestScoreIndex;
let isAnswerTranslation;
let guess;
let isCorrect;

startForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const maxRecentResponsesInput = document.getElementById("maxRecentResponses");
    const maxRecentResponses = parseInt(maxRecentResponsesInput.value, 10);
    const avoidRepeatFrequencyInput = document.getElementById("avoidRepeatFrequency");
    const avoidRepeatFrequency = parseInt(avoidRepeatFrequencyInput.value, 10);
    currentRehearsal = new Rehearsal(rehearsalList, maxRecentResponses, avoidRepeatFrequency);
    nextQuestion();
    startForm.remove();
    messageDiv.innerHTML = "";
});

debugButton.addEventListener("click", () => {
    updateDebugData();
});

function updateDebugData() {
    debugDataDiv.innerHTML = "";
    currentRehearsal.debugPrint(debugDataDiv);
}

function nextQuestion() {
    const avoidRecentList = currentRehearsal.recentIndices.slice(-currentRehearsal.avoidRepeatFrequency);
    lowestScoreIndex = currentRehearsal.getLowestScoreIndex(avoidRecentList);
    const knowledgeState = currentRehearsal.knowledgeStates.get(lowestScoreIndex);

    const glos = rehearsalList.gloses[lowestScoreIndex];
    isAnswerTranslation = knowledgeState.translationKnowledge.score < knowledgeState.knowledge.score;
    const questionDomain = isAnswerTranslation ? currentRehearsal.practiceList.wordsDomain : currentRehearsal.practiceList.translationDomain;
    const answerDomain = isAnswerTranslation ? currentRehearsal.practiceList.translationDomain : currentRehearsal.practiceList.wordsDomain;
    const promptText = "Översätt " + questionDomain + (isAnswerTranslation ? glos.words.join(", ") : glos.translations.join(", "));
    const inputPlaceholder =  answerDomain + (isAnswerTranslation ? "Skriv översättning " : "Skriv ordet");

    quizForm.innerHTML = "";

    const promptElement = document.createElement("p");
    promptElement.textContent = promptText;
    quizForm.appendChild(promptElement);

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.placeholder = inputPlaceholder;
    quizForm.appendChild(inputField);
    inputField.focus();

    const submitButton = document.createElement("button");
    submitButton.textContent = "Svara";
    quizForm.appendChild(submitButton);

    submitButton.addEventListener("click", () => {
        guess = inputField.value.trim();

        const knowledgeState = currentRehearsal.knowledgeStates.get(lowestScoreIndex);
        const result = currentRehearsal.submitAnswer(lowestScoreIndex, isAnswerTranslation, guess);
        isCorrect = result.isCorrect;
        handleResult(lowestScoreIndex, isAnswerTranslation, guess, isCorrect);
    });


    const showClueButton = document.createElement("button");
    showClueButton.textContent = "Visa ledtråd";
    showClueButton.type = "button";
    quizForm.appendChild(showClueButton);

    let clueCounter = 0;
    let revealedAnswer = "";

    showClueButton.addEventListener("click", () => {
        const glos = rehearsalList.gloses[lowestScoreIndex];
        const clues = isAnswerTranslation ? glos.translationClues : glos.clues;

        if (clueCounter < clues.length) {
            const randomClue = clues[clueCounter];
            const clueElement = document.createElement("p");
            clueElement.textContent = randomClue;
            quizForm.appendChild(clueElement);
            clueCounter++;
        } else {
            if (revealedAnswer === "") {
                const answer = isAnswerTranslation ? glos.translations[0] : glos.words[0];
                revealedAnswer = answer.charAt(0);
            } else {
                const answer = isAnswerTranslation ? glos.translations[0] : glos.words[0];
                const nextLetter = answer.charAt(revealedAnswer.length);
                revealedAnswer += nextLetter;
            }

            const answerElement = document.createElement("p");
            answerElement.textContent = revealedAnswer;
            quizForm.appendChild(answerElement);

            // Check if the word is fully revealed
            if (revealedAnswer.length === (isAnswerTranslation ? glos.translations[0].length : glos.words[0].length)) {
                showClueButton.remove(); // Remove the clue button
            }
        }
    });

}

function handleResult(index, isAnswerTranslation, guess, isCorrect) {
    let glos = currentRehearsal.practiceList.gloses[index];
    const resultMessage =
        (isCorrect
            ? "<span class='correct'>Rätt!</span>"
            : `Fel! Du gissade <b class="incorrect">${guess}</b>`) +
        "<p>\n" +
        currentRehearsal.practiceList.wordsDomain + " " + glos.words.join(",") +
        " <i> översätts till </i>   " +
        currentRehearsal.practiceList.translationDomain + " " + glos.translations.join(",") +
        "</p>";
    const nextButton = document.createElement("button");
    nextButton.textContent = "Nästa (Och acceptera svaret)";
    nextButton.addEventListener("click", () => {
        currentRehearsal.acceptResult(lowestScoreIndex, isAnswerTranslation, guess, isCorrect);
        currentRehearsal.updateRecentIndices(lowestScoreIndex);
        messageDiv.innerHTML = "";
        if (currentRehearsal.getLowestScoreIndex(currentRehearsal.recentIndices.slice(-currentRehearsal.avoidRepeatFrequency)) === null) {
            showCompletionMessage();
        } else {
            nextQuestion();
        }
        updateDebugData();
    });

    quizForm.innerHTML = "";
    const resultElement = document.createElement("p");
    resultElement.innerHTML = resultMessage;
    messageDiv.appendChild(resultElement);
    messageDiv.appendChild(nextButton);

    nextButton.focus();
}

function showCompletionMessage() {
    messageDiv.innerHTML = "";
    messageDiv.textContent = "🎉Grattis! 🎉 Du har klarat förhöret! 🚀";
}

