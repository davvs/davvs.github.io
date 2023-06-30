class PersistenceManager {
  constructor() {
    // No need for a storage key
  }

  getListKey(name) {
    return `PracticeList-${name}`;
  }

  getPracticeListByName(name) {
    const key = this.getListKey(name);
    const practiceListJSON = localStorage.getItem(key);
    if (practiceListJSON) {
      const practiceListData = JSON.parse(practiceListJSON);
      const { name, gloses, wordsDomain, translationDomain } = practiceListData;
      const parsedGloses = gloses.map(glosData => {
        const { _words, _translations, _clues, _translationClues } = glosData;
        return new Glos(_words, _translations, _clues, _translationClues);
      });
      return new PracticeList(name, parsedGloses, wordsDomain, translationDomain);
    }

    const practiceList = new PracticeList(practiceListName, []);
    this.savePracticeList(practiceList);
    return practiceList;
  }

  getPracticeLists() {
    const practiceListNamesJSON = localStorage.getItem("LocalPracticeListNames");
    if (practiceListNamesJSON) {
      const practiceListNames = JSON.parse(practiceListNamesJSON);
      return practiceListNames.map(name => this.getPracticeListByName(name));
    }
    return [];
  }

  savePracticeList(practiceList) {
    const key = this.getListKey(practiceList.name);
    const serializedList = JSON.stringify(practiceList);
    localStorage.setItem(key, serializedList);

    const practiceListNamesJSON = localStorage.getItem("LocalPracticeListNames");
    if (practiceListNamesJSON) {
      const practiceListNames = JSON.parse(practiceListNamesJSON);
      if (!practiceListNames.includes(practiceList.name)) {
        practiceListNames.push(practiceList.name);
      }
      localStorage.setItem("LocalPracticeListNames", JSON.stringify(practiceListNames));
    } else {
      localStorage.setItem("LocalPracticeListNames", JSON.stringify([practiceList.name]));
    }
  }

  updatePracticeList(name, updatedPracticeList) {
    const key = this.getListKey(name);
    const serializedList = JSON.stringify(updatedPracticeList);
    localStorage.setItem(key, serializedList);
  }

  deletePracticeList(name) {
    const key = this.getListKey(name);
    localStorage.removeItem(key);

    const practiceListNamesJSON = localStorage.getItem("LocalPracticeListNames");
    if (practiceListNamesJSON) {
      const practiceListNames = JSON.parse(practiceListNamesJSON);
      const updatedPracticeListNames = practiceListNames.filter(practiceListName => practiceListName !== name);
      localStorage.setItem("LocalPracticeListNames", JSON.stringify(updatedPracticeListNames));
    }
  }
}
