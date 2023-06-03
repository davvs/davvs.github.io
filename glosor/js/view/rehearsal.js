let persistenceManager = new PersistenceManager();

const urlParams = new URLSearchParams(window.location.search);
const localList = urlParams.get("localList");
const rehearsalList = persistenceManager.getPracticeListByName(localList);
const currentRehearsal = new Rehearsal(rehearsalList, 2);

const startButton = document.getElementById("startButton");
const quizForm = document.getElementById("quizForm");
const messageDiv = document.getElementById("message");
const debugButton = document.getElementById("debugButton");


startButton.addEventListener("click", () => {
    nextQuestion();
    startButton.remove();
    messageDiv.innerHTML="";
});
debugButton.addEventListener("click", () => {
    currentRehearsal.debugPrint();
});

function nextQuestion() {
    const lowestScoreIndex = currentRehearsal.getLowestScoreIndex();
    const knowledgeState = currentRehearsal.knowledgeStates.get(lowestScoreIndex);

    const glos = rehearsalList.gloses[lowestScoreIndex];
    const isTranslation = knowledgeState.translationKnowledge.score < knowledgeState.knowledge.score;
    const promptText = isTranslation ? "Översätt " + glos.words.join(", ") : "Översätt " + glos.translations.join(", ");
    const inputPlaceholder = isTranslation ? "Enter translation" : "Enter words";

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
    submitButton.textContent = "Submit";
    quizForm.appendChild(submitButton);
}

quizForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const inputField = quizForm.querySelector("input");
    const guess = inputField.value.trim();

    const lowestScoreIndex = currentRehearsal.getLowestScoreIndex();
    const knowledgeState = currentRehearsal.knowledgeStates.get(lowestScoreIndex);
    const isTranslation = knowledgeState.translationKnowledge.score < knowledgeState.knowledge.score;
    const isCorrect = currentRehearsal.submitAnswer(lowestScoreIndex, isTranslation, guess);
    handleResult(lowestScoreIndex, isTranslation, guess, isCorrect);
});

function handleResult(index, isTranslation, guess, isCorrect) {
    let glos = currentRehearsal.practiceList.gloses[index];
    const resultMessage = (isCorrect ? "<span class='correct'>Correct!</span>" : `Incorrect! You guessed <b class="incorrect">${guess}</b>`) + "<p>\n" + glos.words.join(",") + " <i> översätts till </i>   " + glos.translations.join(",") + "</p>";
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.addEventListener("click", () => {
        messageDiv.innerHTML = ""
        if (currentRehearsal.getLowestScoreIndex() === null) {
            showCompletionMessage();
        } else {
            nextQuestion();
        }
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
    messageDiv.textContent = "Congratulations! You have completed the rehearsal.";
}

