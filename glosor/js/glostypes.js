class Glos {
  constructor(words, translations, clues, translationClues) {
    this._validateArray(words, "words");
    this._validateArray(translations, "translations");
    this._validateArray(clues, "clues");
    this._validateArray(translationClues, "translationClues");

    this._words = words;
    this._translations = translations;
    this._clues = clues;
    this._translationClues = translationClues;
  }

  get words() {
    return this._words;
  }

  set words(value) {
    this._validateArray(value, "words");
    this._words = value;
  }

  get translations() {
    return this._translations;
  }

  set translations(value) {
    this._validateArray(value, "translations");
    this._translations = value;
  }

  get clues() {
    return this._clues;
  }

  set clues(value) {
    this._validateArray(value, "clues");
    this._clues = value;
  }

  get translationClues() {
    return this._translationClues;
  }

  set translationClues(value) {
    this._validateArray(value, "translationClues");
    this._translationClues = value;
  }

  _validateArray(array, paramName) {
    if (!Array.isArray(array)) {
      throw new Error(`Invalid arguments. '${paramName}' must be an array.`);
    }

    const forbiddenCharacters = ["<"]; // Add more forbidden characters if needed

    for (const item of array) {
      if (typeof item !== "string") {
        throw new Error(`Invalid arguments. '${paramName}' must be an array of strings.`);
      }

      if (!item.trim()) {
        throw new Error(`Invalid arguments. '${paramName}' must not contain empty strings.`);
      }

      for (const char of forbiddenCharacters) {
        if (item.includes(char)) {
          throw new Error(`Invalid arguments. '${paramName}' must not contain forbidden characters.`);
        }
      }
    }
  }
}

class PracticeList {
  constructor(name, gloses, wordsDomain = "🇸🇪", translationDomain = "🇬🇧") {
    if (typeof name !== "string") {
      throw new Error("Invalid argument. 'name' must be a string.");
    }

    if (typeof wordsDomain !== "string") {
      throw new Error("Invalid argument. 'wordsDomain' must be a string.");
    }

    if (typeof translationDomain !== "string") {
      throw new Error("Invalid argument. 'translationDomain' must be a string.");
    }

    if (!Array.isArray(gloses) || !gloses.every(glos => glos instanceof Glos)) {
      throw new Error("Invalid argument. 'gloses' must be an array of Glos objects.");
    }

    this.name = name;
    this.gloses = gloses;
    this.wordsDomain = wordsDomain;
    this.translationDomain = translationDomain;
  }
}


class GlosCard {
  constructor(question, answers, clues, questionDomain, answerDomain, knowledgeScore = 50) {
    if (typeof question !== 'string' || !question.trim()) {
      throw new Error("Invalid argument. 'question' must be a non-empty string.");
    }

    if (!Array.isArray(answers) || answers.some(answer => typeof answer !== 'string' || !answer.trim())) {
      throw new Error("Invalid argument. 'answers' must be a non-empty array of strings.");
    }

    if (!Array.isArray(clues) || clues.some(clue => typeof clue !== 'string' || !clue.trim())) {
      throw new Error("Invalid argument. 'clues' must be a non-empty array of strings.");
    }

    if (typeof questionDomain !== 'string' || !questionDomain.trim()) {
      throw new Error("Invalid argument. 'questionDomain' must be a non-empty string.");
    }

    if (typeof answerDomain !== 'string' || !answerDomain.trim()) {
      throw new Error("Invalid argument. 'answerDomain' must be a non-empty string.");
    }

    this.question = question;
    this.answers = answers;
    this.clues = clues;
    this.questionDomain = questionDomain;
    this.answerDomain = answerDomain;
    this.recentGuesses = [];
    this.knowledgeScore = knowledgeScore;
  }
}

class Rehearsal {
  constructor(glosCards) {
    if (!Array.isArray(glosCards) || glosCards.some(card => !(card instanceof GlosCard))) {
      throw new Error("Invalid argument. 'glosCards' must be a non-empty array of GlosCard instances.");
    }

    this.glosCards = glosCards;
  }
}