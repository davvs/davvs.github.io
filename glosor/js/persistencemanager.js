class PersistenceManager {
  constructor() {
    // No need for a storage key
  }

  savePracticeList(practiceList) {
    const key = `PracticeList-${practiceList.name}`;
    const serializedList = JSON.stringify(practiceList);
    localStorage.setItem(key, serializedList);
  }

  getPracticeListByName(name) {
    const key = `PracticeList-${name}`;
    const serializedList = localStorage.getItem(key);
    if (serializedList) {
      const parsedList = JSON.parse(serializedList);
      const gloses = parsedList.gloses.map((glosData) => new Glos(glosData.words, glosData.translations));
      return new PracticeList(parsedList.name, gloses);
    }
    return null;
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

