class ImportViewController {
    constructor() {
        this.persistenceManager = new PersistenceManager();
        this.importInput = document.getElementById("importInput");
        this.importedListTag = document.getElementById("importedList");
        this.importGlosesForm = document.getElementById("importGlosesForm");
        this.importGlosesForm.addEventListener("submit", this.importGlosListForm.bind(this));

        const urlParams = new URLSearchParams(window.location.search);
        const importParam = urlParams.get('i');
        if (importParam) {
            this.importInput.value = importParam;
            this.importGlosList();
        }
    }

    importGlosListForm(event) {
        event.preventDefault();
        this.importGlosList();
    }

    importGlosList() {
        let importText = this.importInput.value.trim();
        let importedList;

        const importMethods = [
            Exporter.importJson,
            Exporter.urldecompress,
            Exporter.fullurldecompress
        ];

        for (const importMethod of importMethods) {
            try {
                importedList = importMethod(importText);
                break; // Exit the loop if import succeeds
            } catch (error) {
                console.info(`Failed to import using ${importMethod.name}`);
            }
        }

        if (!importedList) {
            console.error("Failed to import the glos list.");
            return;
        }

        console.log(JSON.stringify(importedList));
        this.importedList = importedList;
        this.renderImportedList();
    }


    renderImportedList() {
        // Clear the existing content in the importedList container
        this.importedListTag.innerHTML = "";

        // Create a section element for name and words domain
        const section = document.createElement("div");
        this.importedListTag.appendChild(section);

        // Display name
        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name: ";
        nameLabel.htmlFor = "importName";
        const nameValue = document.createElement("input");
        nameValue.value = this.importedList.name;
        nameValue.id = "importName";

        const errorMessage = document.createElement("label");
        errorMessage.textContent = "";
        errorMessage.htmlFor = "importName";
        errorMessage.id = "errorMessage";
        errorMessage.classList.add("error");


        const importButton = document.createElement("button");
        importButton.textContent = "Importera";
        importButton.addEventListener("click", this.confirmImport);

        const header = document.createElement("h2");
        header.textContent = "Imported list";
        //section.appendChild(header);
        section.appendChild(nameLabel);
        section.appendChild(nameValue);
        section.appendChild(errorMessage);


        // Display words domain
        const wordsDomainLabel = document.createElement("label");
        wordsDomainLabel.textContent = "Words Domain: ";
        const wordsDomainValue = document.createElement("span");
        wordsDomainValue.textContent = this.importedList.wordsDomain;
        const translationDomainValue = document.createElement("span");
        translationDomainValue.textContent = this.importedList.translationDomain;
        section.appendChild(document.createElement("br"));
        section.appendChild(wordsDomainLabel);
        section.appendChild(wordsDomainValue);
        section.appendChild(translationDomainValue);
        section.appendChild(importButton);

        // Create table element
        const table = document.createElement("table");
        this.importedListTag.appendChild(table);

        // Create table header
        const tableHeader = document.createElement("thead");
        table.appendChild(tableHeader);

        const headerRow = document.createElement("tr");
        tableHeader.appendChild(headerRow);

        const headerWords = document.createElement("th");
        headerWords.textContent = "Ord " + this.importedList.wordsDomain;
        headerRow.appendChild(headerWords);

        const headerTranslations = document.createElement("th");
        headerTranslations.textContent = "Översättningar " + this.importedList.translationDomain;
        headerRow.appendChild(headerTranslations);

        const headerClues = document.createElement("th");
        headerClues.textContent = "Ledtrådar";
        headerRow.appendChild(headerClues);

        const headerTranslationClues = document.createElement("th");
        headerTranslationClues.textContent = "Översättningsledtrådar";
        headerRow.appendChild(headerTranslationClues);

        // Create table body
        const tableBody = document.createElement("tbody");
        table.appendChild(tableBody);

        // Populate table rows with glos information
        this.importedList.gloses.forEach((glos, index) => {
            const row = document.createElement("tr");

            const wordsCell = document.createElement("td");
            wordsCell.textContent = glos.words.join(", ");
            row.appendChild(wordsCell);

            const translationsCell = document.createElement("td");
            translationsCell.textContent = glos.translations.join(", ");
            row.appendChild(translationsCell);

            const cluesCell = document.createElement("td");
            cluesCell.textContent = glos.clues.join(", ");
            row.appendChild(cluesCell);

            const translationCluesCell = document.createElement("td");
            translationCluesCell.textContent = glos.translationClues.join(", ");
            row.appendChild(translationCluesCell);

            tableBody.appendChild(row);
        });

        this.importGlosesForm.remove();
        console.log("imported list is ");
        console.log(this.importedList);
    }

    confirmImport = () => {
        const importNameInput = document.getElementById("importName");
        const importName = importNameInput.value.trim();

        // Check if there's already a list with the same name
        const practiceListNames = this.persistenceManager.getPracticeLists();
        const errorMessage = document.getElementById("errorMessage");
        if (practiceListNames.includes(importName)) {
            errorMessage.textContent = "Det finns redan en lista med det namnet";
            importNameInput.classList.add("error");
            return; // Stop further execution
        }
        importNameInput.classList.remove("error");
        errorMessage.textContent = "";

        this.importedList.name = importName;
        // Continue with the import process
        console.log(importName);
        console.log(this.importedList);

        this.persistenceManager.savePracticeList(this.importedList);
        window.location.href = `editlist.html?localList=${importName}`;
    }


}

const controller = new ImportViewController();