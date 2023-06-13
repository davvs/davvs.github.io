// Controller
class PracticeListController {
  constructor() {
    this.persistenceManager = new PersistenceManager();
    this.practiceList = [];
    this.glosListContainer = document.getElementById("glosList");
    this.addGlosForm = document.getElementById("addGlosForm");
    this.wordsInput = document.getElementById("wordsInput");
    this.translationsInput = document.getElementById("translationsInput");
    this.cluesInput = document.getElementById("cluesInput");
    this.translationCluesInput = document.getElementById("translationCluesInput");

    this.addGlosForm.addEventListener("submit", this.handleAddGlos.bind(this));
    this.glosListContainer.addEventListener("click", this.handleRemoveButtonClick.bind(this));

    this.loadPracticeList();
    this.renderGlosList();
  }

  loadPracticeList() {
    const urlParams = new URLSearchParams(window.location.search);
    const practiceListName = urlParams.get("localList");
    if (practiceListName) {
      this.practiceList = this.persistenceManager.getPracticeListByName(practiceListName);
      if (!this.practiceList) {
        // Create a new PracticeList if it doesn't exist in local storage
        this.practiceList = new PracticeList(practiceListName, []);
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
          <div class="glos-words">${glos.words.join(", ")}</div>
          <div class="glos-translations">${glos.translations.join(", ")}</div>
          <div class="glos-clues">${glos.clues.join(", ")}</div>
          <div class="glos-translation-clues">${glos.translationClues.join(", ")}</div>
          <button class="remove-button" data-index="${index}">Remove</button>
        `;
        this.glosListContainer.appendChild(glosItem);
      });
    } else {
      this.glosListContainer.innerHTML = "<p>No gloses found.</p>";
    }
  }

  handleAddGlos(event) {
    event.preventDefault();
    const words = this.wordsInput.value.trim().split(",").map(word => word.trim());
    const translations = this.translationsInput.value.trim().split(",").map(translation => translation.trim());
    const clues = this.cluesInput.value.trim().split(",").map(clue => clue.trim());
    const translationClues = this.translationCluesInput.value.trim().split(",").map(clue => clue.trim());
    if (words.length > 0 && translations.length > 0) {
      const glos = new Glos(words, translations, clues, translationClues);
      this.practiceList.gloses.push(glos);
      this.savePracticeList();
      this.renderGlosList();
      this.clearInputs();
      this.wordsInput.focus();
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

  clearInputs() {
    this.wordsInput.value = "";
    this.translationsInput.value = "";
    this.cluesInput.value = "";
    this.translationCluesInput.value = "";
  }
}

// Initialize the controller
const controller = new PracticeListController();

