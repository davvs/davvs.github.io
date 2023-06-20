const urlParams = new URLSearchParams(window.location.search);
const localList = urlParams.get("localList");

// Load practice list from persistence manager
const persistenceManager = new PersistenceManager();
const currentPracticeList = persistenceManager.getPracticeListByName(localList);

const quizForm = document.getElementById("quizForm");

currentRehearsal = null;
let debugging = false;

// Function to create a checkbox element
function createCheckbox(id, name, value, checked = true) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = name;
    checkbox.value = value;
    checkbox.checked = checked
    return checkbox;
}

// Function to create a label element
function createLabel(forId, text) {
    const label = document.createElement("label");
    label.htmlFor = forId;
    label.textContent = text;
    return label;
}

// Function to populate the gloses list
function populateGlosesList() {
    const glosesList = document.getElementById("gloses");

    // Clear the list
    glosesList.innerHTML = "";

    if (currentPracticeList && currentPracticeList.gloses.length > 0) {
        // Print the name of the list
        const listName = document.createElement("div");
        listName.textContent = `Glosor i ${currentPracticeList.name}`;
        glosesList.appendChild(listName);

        // Populate the list with gloses
        currentPracticeList.gloses.forEach((glos, index) => {
            const listItem = document.createElement("li");

            // Checkbox for the whole line
            const checkboxId = `lineCheckbox${index}`;
            const lineCheckbox = createCheckbox(checkboxId, "lineCheckbox", index, true);
            listItem.appendChild(lineCheckbox);

            // Index of the glos in square brackets
            const indexLabel = createLabel(checkboxId, `[${index}] `);
            listItem.appendChild(indexLabel);

            // Words from the glos, comma-separated
            const wordsLabel = createLabel(checkboxId, `${currentPracticeList.wordsDomain} ${glos.words.join(", ")}`);
            listItem.appendChild(wordsLabel);

            // Translations of the glos, comma-separated
            const translationsLabel = createLabel(checkboxId, `${currentPracticeList.translationDomain} ${glos.translations.join(", ")}`);
            listItem.appendChild(translationsLabel);

            // Add the list item to the gloses list
            glosesList.appendChild(listItem);
        });
    }

    // Update translation domain in the checkbox label
    const translationsLabel = document.getElementById("translationsLabel");
    translationsLabel.textContent = `Frågor från ${currentPracticeList.wordsDomain} ➡ ${currentPracticeList.translationDomain}`;

    // Update translation domain in the reversed checkbox label
    const reversedTranslationsLabel = document.getElementById("reversedTranslationsLabel");
    reversedTranslationsLabel.textContent = `Omvända frågor från ${currentPracticeList.translationDomain} ➡ ${currentPracticeList.wordsDomain}`;
}

// Function to handle form submission and start the rehearsal
function startRehearsal(event) {
    event.preventDefault();

    // Get the values from the form
    const avoidRepeatFrequency = document.getElementById("avoidRepeatFrequency").value;
    const maxRecentResponses = document.getElementById("maxRecentResponses").value;
    const initialGlosScore = 50;
    const translationsCheckbox = document.getElementById("translationsCheckbox").checked;
    const reversedTranslationsCheckbox = document.getElementById("reversedTranslationsCheckbox").checked;

    // Print the form values to the console
    console.log("Avoid Repeat Frequency:", avoidRepeatFrequency);
    console.log("Max Recent Responses:", maxRecentResponses);
    console.log("Translations Checkbox:", translationsCheckbox);
    console.log("Reversed Translations Checkbox:", reversedTranslationsCheckbox);
    if (!translationsCheckbox && !reversedTranslationsCheckbox) {
        alert("Antingen fråga, omvänd fråga eller båda måste vara ibockade!");
        return;
    }

    // Get the selected lines checkboxes
    const selectedLines = [];
    const lineCheckboxes = document.querySelectorAll('input[name="lineCheckbox"]:checked');

    glosCards = [];
    lineCheckboxes.forEach((checkbox) => {
        const glosIndex = parseInt(checkbox.value);
        const glos = currentPracticeList.gloses[glosIndex];
        selectedLines.push(glos);

        if (translationsCheckbox) {
            // Use standard translation
            for (const word of glos.words) {
                const glosCard = new GlosCard(word, glos.translations, glos.translationClues,
                    currentPracticeList.wordsDomain, currentPracticeList.translationDomain,
                    initialGlosScore, glosIndex);
                glosCards.push(glosCard);
            }
        }
        if (reversedTranslationsCheckbox) {
            // Use reversed translation
            for (const translation of glos.translations) {
                const glosCard = new GlosCard(translation, glos.words, glos.clues,
                    currentPracticeList.translationDomain, currentPracticeList.wordsDomain,
                    initialGlosScore, glosIndex);
                glosCards.push(glosCard);
            }
        }
    });

    if (glosCards.length <= 0) {
        alert("Inga glosor ibockade!");
        return;
    }

    currentRehearsal = new Rehearsal(glosCards, avoidRepeatFrequency, maxRecentResponses);

    startForm.remove()
    prepareNextGlosCard()

}
function rehearsalFinished() {
    quizForm.innerHTML = "";

    const finishedDiv = document.createElement("div");
    finishedDiv.textContent = "Allt klart! Nu kan du alla ord verkar det som!";
    quizForm.appendChild(finishedDiv);
}

function prepareNextGlosCard() {
    quizForm.innerHTML = "";
    let nextCard = currentRehearsal.getNextGlosCard();
    if (nextCard == null) {
        rehearsalFinished();
        return;
    }
    console.log("Glos index:" + nextCard.glosIndex);
    console.log("Card index:" + currentRehearsal.currentGlosCardIndex);


    const answerForm = document.createElement("form");

    const questionDiv = document.createElement("div");
    questionDiv.textContent = nextCard.question;
    answerForm.appendChild(questionDiv);

    const answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.placeholder = "Skriv svaret här";
    answerForm.appendChild(answerInput);

    const answerButton = document.createElement("button");
    answerButton.setAttribute("id", "answerButton");
    answerButton.textContent = "Answer";
    answerButton.addEventListener("click", answerQuestionButton);
    answerForm.appendChild(answerButton);

    const clueButton = document.createElement("button");
    clueButton.setAttribute("id", "clueButton");
    clueButton.textContent = "Get Clue";
    clueButton.addEventListener("click", getClue);
    answerForm.appendChild(clueButton);


    const resultDiv = document.createElement("div");
    resultDiv.setAttribute("id", "resultDiv");
    answerForm.appendChild(resultDiv);

    const nextQuestionButton = document.createElement("button");
    nextQuestionButton.textContent = "Nästa fråga";
    nextQuestionButton.setAttribute("id", "nextQuestionButton");
    nextQuestionButton.addEventListener("click", nextQuestion);
    nextQuestionButton.style.display = "none"; // Hide the button initially
    answerForm.appendChild(nextQuestionButton);


    const clueList = document.createElement("ul");
    clueList.setAttribute("id", "clueList");
    answerForm.appendChild(clueList);


    const overruleAsCorrectButton = document.createElement("button");
    overruleAsCorrectButton.textContent = "Overrule as Correct (Ctrl+a)";
    overruleAsCorrectButton.addEventListener("click", overruleAsCorrect);
    answerForm.appendChild(overruleAsCorrectButton);

    const overruleAsIncorrectButton = document.createElement("button");
    overruleAsIncorrectButton.textContent = "Overrule as Incorrect (Ctrl+e)";
    overruleAsIncorrectButton.addEventListener("click", overruleAsIncorrect);
    answerForm.appendChild(overruleAsIncorrectButton);


    // if (debugging) {
    //     const debugText = document.createElement("div");
    //     debugText.textContent = "glosCardIndex:" + currentRehearsal.currentGlosCardIndex + ": " +
    //         JSON.stringify(currentRehearsal.currentGlosCard);
    //     quizForm.appendChild(debugText);
    // }

    quizForm.appendChild(answerForm);
    answerInput.focus();

// Attach the event listener to the document
    document.addEventListener("keydown", keydownListener);

    if (debugging) {
        printDebugData();
    }
}


function keydownListener(event) {
    if (event.ctrlKey && (event.key === "r" || event.key === "a")) {
        overruleAsCorrect(event);
    }

    if (event.ctrlKey && (event.key === "f" || event.key === "e")) {
        overruleAsIncorrect(event);
    }

    if (event.ctrlKey && (event.key === "c")) {
        getClue(event);
    }
}

document.addEventListener("keydown", keydownListener);

// Later, to remove the event listener
// document.removeEventListener("keydown", keydownListener);

function showNextQuestionButton() {
    const nextQuestionButton = document.getElementById("nextQuestionButton")
    nextQuestionButton.style.display = "block";
    nextQuestionButton.focus();
}

function nextQuestion(event) {
    event.preventDefault();

    //TODO update the knowledge of the currentGlosCard

    prepareNextGlosCard()
}

function answerQuestionButton(event) {
    event.preventDefault();
    const answerInput = document.querySelector("input[type='text']");
    const answer = answerInput.value;
    answerQuestion(answer);
}

function answerQuestion(answer) {

    isCorrect = currentRehearsal.submitAnswer(answer);
    currentRehearsal.currentQuestionWasCorrect = isCorrect

    const usedClue = currentRehearsal.currentQuestionUsedClue;

    let comment = "";
    if (usedClue) {
        comment = "Du använde ledtrådar, så frågan kommer att komma igen.";
    }

    const resultDiv = document.getElementById("resultDiv")
    resultDiv.innerHTML = `Du svarade <span id="answer">${answer}</span> vilket är <span style="color: ${isCorrect ? 'green' : 'red'};">${isCorrect ? 'rätt' : 'fel'}</span> ${comment}`;

    const clueButton = document.getElementById("clueButton")
    const answerButton = document.getElementById("answerButton")

    if (clueButton !== null) {
        clueButton.remove();
        answerButton.remove();
    }
    //answerInput.remove();

    showNextQuestionButton();

}

function getClue(event) {
    event.preventDefault();
    const clueList = document.getElementById("clueList")
    const clueItem = document.createElement("li");

    clue = currentRehearsal.getClue();

    clueItem.textContent = clue;
    clueList.prepend(clueItem);
}

function overruleAsCorrect(event) {
    event.preventDefault();
    currentRehearsal.currentQuestionUsedClue = false;
    answerQuestion(currentRehearsal.currentGlosCard.answers[0]);
}

function overruleAsIncorrect(event) {
    event.preventDefault();
    answerQuestion("??????");
}


// Function to start debugging
function startDebug(event) {
    event.preventDefault();
    debugging = true;
    printDebugData();

    debugButton.style.display = "none";
}

// Function to print debug data
function printDebugData() {
    const debugDataTag = document.getElementById("debugData");
    debugDataTag.innerHTML = "";

    // Create the table element
    const table = document.createElement("table");

    // Create the table headers
    const headers = ["Word", "Translations", "Clues", "Word Domain", "Translation Domain", "Score", "GlosIndex", "Recent guesses"];
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add rows for each glos card
    currentRehearsal.glosCards.forEach((glosCard) => {
        const row = document.createElement("tr");

        // Add cells with glos card data
        const wordCell = document.createElement("td");
        wordCell.textContent = glosCard.question;
        row.appendChild(wordCell);

        const answersCell = document.createElement("td");
        answersCell.textContent = glosCard.answers.join(", ");
        row.appendChild(answersCell);

        const cluesCell = document.createElement("td");
        cluesCell.textContent = glosCard.clues.join(", ");
        row.appendChild(cluesCell);

        const questionDomainCell = document.createElement("td");
        questionDomainCell.textContent = glosCard.questionDomain;
        row.appendChild(questionDomainCell);

        const answerDomainCell = document.createElement("td");
        answerDomainCell.textContent = glosCard.answerDomain;
        row.appendChild(answerDomainCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = glosCard.knowledgeScore;
        row.appendChild(scoreCell);

        const glosIndexCell = document.createElement("td");
        glosIndexCell.textContent = glosCard.glosIndex;
        row.appendChild(glosIndexCell);

        const recentGuessesCell = document.createElement("td");
        recentGuessesCell.textContent = glosCard.recentGuesses.join(",");
        row.appendChild(recentGuessesCell);

        // Add the row to the table
        table.appendChild(row);
    });

    // Add the table to the debug data tag
    debugDataTag.appendChild(table);
}

// Add event listener to the form submit button
const startForm = document.getElementById("startForm");
startForm.addEventListener("submit", startRehearsal);

// Add event listener to the debug button
const debugButton = document.getElementById("debugButton");
debugButton.addEventListener("click", startDebug);

// Populate the gloses list
populateGlosesList();

