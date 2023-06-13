class PersistenceManager {
  constructor() {
    // No need for a storage key
  }

  getPracticeListByName(name) {
    const practiceLists = this.getPracticeLists();
    const practiceListData = practiceLists.find(list => list.name === name);
    if (practiceListData) {
      const { name, gloses, wordsDomain, translationDomain } = practiceListData;
      const parsedGloses = gloses.map(glosData => {
        const { _words, _translations, _clues, _translationClues } = glosData;
        return new Glos(_words, _translations, _clues, _translationClues);
      });
      return new PracticeList(name, parsedGloses, wordsDomain, translationDomain);
    }
    return null;
  }

  getPracticeLists() {
    const practiceListsJSON = localStorage.getItem("practiceLists");
    if (practiceListsJSON) {
      return JSON.parse(practiceListsJSON);
    }
    return [];
  }

  savePracticeList(practiceList) {
    const practiceLists = this.getPracticeLists();
    const existingIndex = practiceLists.findIndex(list => list.name === practiceList.name);
    if (existingIndex !== -1) {
      practiceLists[existingIndex] = practiceList;
    } else {
      practiceLists.push(practiceList);
    }
    localStorage.setItem("practiceLists", JSON.stringify(practiceLists));
  }


  updatePracticeList(name, updatedPracticeList) {
    const key = `PracticeList-${name}`;
    const serializedList = JSON.stringify(updatedPracticeList);
    localStorage.setItem(key, serializedList);
  }

  deletePracticeList(name) {
    const key = `PracticeList-${name}`;
    localStorage.removeItem(key);
  }
}

