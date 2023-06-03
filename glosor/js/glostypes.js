class Glos {
  constructor(words, translations) {
    if (!Array.isArray(words) || !Array.isArray(translations)) {
      throw new Error("Invalid arguments. 'words' and 'translations' must be arrays.");
    }

    if (!words.every(word => typeof word === "string") || !translations.every(translation => typeof translation === "string")) {
      throw new Error("Invalid arguments. 'words' and 'translations' must be arrays of strings.");
    }

    this.words = words;
    this.translations = translations;
  }
}

class PracticeList {
  constructor(name, gloses) {
    if (typeof name !== "string") {
      throw new Error("Invalid argument. 'name' must be a string.");
    }

    if (!Array.isArray(gloses) || !gloses.every(glos => glos instanceof Glos)) {
      throw new Error("Invalid argument. 'gloses' must be an array of Glos objects.");
    }

    this.name = name;
    this.gloses = gloses;
  }
}

