class PracticeListController {
  constructor() {
    this.persistenceManager = new PersistenceManager();
    this.practiceList = [];
    this.glosListContainer = document.getElementById("glosList");
    this.locatorMapListContainer = document.getElementById("locatorMapList");

    this.addGlosForm = document.getElementById("addGlosForm");
    this.addLocatorMap = document.getElementById("addLocatorMapForm");
    this.wordsInput = document.getElementById("wordsInput");
    this.translationsInput = document.getElementById("translationsInput");
    this.cluesInput = document.getElementById("cluesInput");
    this.translationCluesInput = document.getElementById("translationCluesInput");
    this.domainForm = document.getElementById("domainForm");
    this.wordDomainInput = document.getElementById("wordDomain");
    this.translationDomainInput = document.getElementById("translationDomain");
    this.rehearsalButton = document.getElementById("rehearsalButton");
    this.importInput = document.getElementById("importInput");
    this.importGlosesForm = document.getElementById("importGlosesForm");

    this.rehearsalButton.addEventListener("click", this.handleRehearsalButtonClick.bind(this));
    this.addGlosForm.addEventListener("submit", this.handleAddGlos.bind(this));
    this.addLocatorMap.addEventListener("submit", this.handleAddLocatorMap.bind(this));
    this.glosListContainer.addEventListener("click", this.handleRemoveButtonClick.bind(this));
    this.locatorMapListContainer.addEventListener("click", this.handleRemoveLocatorMapButtonClick.bind(this));
    this.domainForm.addEventListener("submit", this.handleDomainFormSubmit.bind(this));
    this.importGlosesForm.addEventListener("submit", this.importGlosesFormSubmit.bind(this));

    this.loadPracticeList();
    this.renderGlosList();
    this.renderLocatorMaps();
    this.renderDomainInputs();
  }

  handleRehearsalButtonClick() {
    if (this.practiceList) {
      const rehearsalUrl = `rehearsal.html?localList=${encodeURIComponent(this.practiceList.name)}`;
      window.location.href = rehearsalUrl;
    }
  }

  loadPracticeList() {
    const urlParams = new URLSearchParams(window.location.search);
    const practiceListName = urlParams.get("localList");
    if (practiceListName) {
      this.practiceList = this.persistenceManager.getPracticeListByName(practiceListName);
      if (!this.practiceList) {
        // Create a new PracticeList if it doesn't exist in local storage
        this.practiceList = new PracticeList(practiceListName, [], []);
        this.savePracticeList();
      }
    }
  }

  savePracticeList() {
    if (this.practiceList) {
      this.persistenceManager.savePracticeList(this.practiceList);
    }
  }

  renderGlosList() {
    if (this.practiceList && this.practiceList.gloses.length > 0) {
      this.glosListContainer.innerHTML = "";
      this.practiceList.gloses.forEach((glos, index) => {
        const glosItem = document.createElement("div");
        glosItem.classList.add("glos-item");
        glosItem.innerHTML = `
          <div class="glos-words">${this.practiceList.wordsDomain} ${glos.words.join(", ")}</div>
          <div class="glos-translations">${this.practiceList.translationDomain} ${glos.translations.join(", ")}</div>
          <div class="glos-clues">${this.practiceList.wordsDomain}🔎 ${glos.clues.join(", ")}</div>
          <div class="glos-translation-clues">${this.practiceList.translationDomain}🔎 ${glos.translationClues.join(", ")}</div>
          <button class="remove-button" data-index="${index}">Remove</button>
        `;
        this.glosListContainer.appendChild(glosItem);
      });
      document.querySelector("h1").textContent = `Gloslista ${this.practiceList.name}`;
    } else {
      this.glosListContainer.innerHTML = "<p>No gloses found.</p>";
      document.querySelector("h1").textContent = "Gloslista";
    }
  }

  renderLocatorMaps() {
    const locatorMapListContainer = document.getElementById("locatorMapList");

    if (this.practiceList && this.practiceList.locatorMaps.length > 0) {
      locatorMapListContainer.innerHTML = "";
      this.practiceList.locatorMaps.forEach((locatorMap, index) => {
        const locatorMapItem = document.createElement("div");
        locatorMapItem.classList.add("locator-map-item");
        locatorMapItem.innerHTML = `
        <div class="locator-map-name">${locatorMap.name}</div>
        <div class="locator-map-image-url">${locatorMap.imageUrl}</div>
        <div class="locator-map-regions">
          <ul>
            ${locatorMap.regions.map(region => `<li>${region.names.join(", ")}</li>`).join("")}
          </ul>
        </div>
        <div class="locator-map-actions">
          <button class="edit-button" data-index="${index}">Edit</button>
          <button class="remove-button" data-index="${index}">Remove</button>
        </div>
      `;
        locatorMapListContainer.appendChild(locatorMapItem);
      });
    } else {
      locatorMapListContainer.innerHTML = "<p>No locator maps found.</p>";
    }
  }

  handleAddLocatorMap(event) {
    event.preventDefault();

    const nameInput = document.getElementById("locatorMapNameInput");
    const name = nameInput.value;

    const newLocatorMap = new LocatorMap(name, "", []);
    this.practiceList.locatorMaps.push(newLocatorMap);

    // Clear the input field
    nameInput.value = "";

    // Render the updated locator maps
    this.savePracticeList();
    this.renderLocatorMaps();
  }

  handleAddGlos(event) {
    event.preventDefault();
    const words = this.wordsInput.value.trim().split(",").map(word => word.trim());
    const translations = this.translationsInput.value.trim().split(",").map(translation => translation.trim());
    const trimmedClues = this.cluesInput.value.trim();
    var clues;
    if (trimmedClues.length > 0) {
      clues = trimmedClues.split(",").map(clue => clue.trim());
    } else {
      clues = [];
    }
    const trimmedTranslationClues = this.translationCluesInput.value.trim();
    var translationClues;
    if (trimmedTranslationClues.length > 0) {
      translationClues = trimmedTranslationClues.split(",").map(clue => clue.trim());
    } else {
      translationClues = [];

    }
    if (words.length > 0 && translations.length > 0) {
      const glos = new Glos(words, translations, clues, translationClues);
      this.practiceList.gloses.push(glos);
      this.savePracticeList();
      this.renderGlosList();
      this.clearInputs();
      this.wordsInput.focus();
    }
  }

  handleRemoveLocatorMapButtonClick(event)  {
    if (event.target.classList.contains("remove-button")) {
      const index = event.target.getAttribute("data-index");
      if (index !== null) {
        this.practiceList.locatorMaps.splice(index, 1);
        this.savePracticeList();
        this.renderLocatorMaps();
      }
    }
    else if (event.target.classList.contains("edit-button")) {
      const index = event.target.getAttribute("data-index");
      if (index !== null) {
        const locatorMapId = index;
        const url = `editlocatormap.html?localList=${encodeURIComponent(this.practiceList.name)}&locatorMapId=${locatorMapId}`;
        window.location.href = url;
      }
    }

  }

  handleRemoveButtonClick(event) {
    if (event.target.classList.contains("remove-button")) {
      const index = event.target.getAttribute("data-index");
      if (index !== null) {
        this.practiceList.gloses.splice(index, 1);
        this.savePracticeList();
        this.renderGlosList();
      }
    }
  }

  importGlosesFormSubmit(event) {
    event.preventDefault();
    let importText = this.importInput.value.trim();
    console.log(importText);
    console.log("TODO actually import it\n" + importText);
  }

  handleDomainFormSubmit(event) {
    event.preventDefault();
    this.practiceList.wordsDomain = this.wordDomainInput.value.trim();
    this.practiceList.translationDomain = this.translationDomainInput.value.trim();
    this.savePracticeList();
    this.renderDomainInputs();
    this.renderGlosList()
  }

  renderDomainInputs() {
    this.wordDomainInput.value = this.practiceList.wordsDomain;
    this.translationDomainInput.value = this.practiceList.translationDomain;
  }

  clearInputs() {
    this.wordsInput.value = "";
    this.translationsInput.value = "";
    this.cluesInput.value = "";
    this.translationCluesInput.value = "";
  }
}

// Initialize the controller
const controller = new PracticeListController();

