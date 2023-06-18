const urlParams = new URLSearchParams(window.location.search);
const localList = urlParams.get("localList");

// Load practice list from persistence manager
const persistenceManager = new PersistenceManager();
const currentPracticeList = persistenceManager.getPracticeListByName(localList);

// Function to create a checkbox element
function createCheckbox(id, name, value) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = name;
    checkbox.value = value;
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
            const lineCheckbox = createCheckbox(checkboxId, "lineCheckbox", index);
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
    translationsLabel.textContent = `Fråga från ${currentPracticeList.wordsDomain} ➡ ${currentPracticeList.translationDomain}`;

    // Update translation domain in the reversed checkbox label
    const reversedTranslationsLabel = document.getElementById("reversedTranslationsLabel");
    reversedTranslationsLabel.textContent = `Fråga från ${currentPracticeList.translationDomain} ➡ ${currentPracticeList.wordsDomain}`;
}

// Function to handle form submission and start the rehearsal
function startRehearsal(event) {
    event.preventDefault();

    // Get the values from the form
    const avoidRepeatFrequency = document.getElementById("avoidRepeatFrequency").value;
    const maxRecentResponses = document.getElementById("maxRecentResponses").value;
    const translationsCheckbox = document.getElementById("translationsCheckbox").checked;
    const reversedTranslationsCheckbox = document.getElementById("reversedTranslationsCheckbox").checked;

    // Print the form values to the console
    console.log("Avoid Repeat Frequency:", avoidRepeatFrequency);
    console.log("Max Recent Responses:", maxRecentResponses);
    console.log("Translations Checkbox:", translationsCheckbox);
    console.log("Reversed Translations Checkbox:", reversedTranslationsCheckbox);

    // Get the selected lines checkboxes
    const selectedLines = [];
    const lineCheckboxes = document.querySelectorAll('input[name="lineCheckbox"]:checked');
    lineCheckboxes.forEach((checkbox) => {
        const glosIndex = parseInt(checkbox.value);
        const glos = currentPracticeList.gloses[glosIndex];
        selectedLines.push(glos);
    });

    // Start the rehearsal with the selected lines
    console.log("Selected Lines:", selectedLines);
}

// Add event listener to the form submit button
const startForm = document.getElementById("startForm");
startForm.addEventListener("submit", startRehearsal);

// Populate the gloses list
populateGlosesList();

