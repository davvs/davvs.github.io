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

class Coordinate {
  constructor(x, y) {
    this.validateFloat(x);
    this.validateFloat(y);
    this._x = x;
    this._y = y;
  }

  validate() {
    this.validateFloat(this._x);
    this.validateFloat(this._y);
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this.validateFloat(value);
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this.validateFloat(value);
    this._y = value;
  }

  validateFloat(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 1) {
      throw new Error('Invalid coordinate value. Only float values between 0 and 1 (inclusive) are allowed.');
    }
  }
}

class Region {
  constructor(names, coordinates, color) {
    this.validateNames(names);
    this.validateCoordinates(coordinates);
    this.validateColor(color);
    this._names = names;
    this._coordinates = coordinates;
    this._color = color;
  }

  get names() {
    return this._names;
  }

  set names(value) {
    this.validateNames(value);
    this._names = value;
  }

  get coordinates() {
    return this._coordinates;
  }

  set coordinates(value) {
    this.validateCoordinates(value);
    this._coordinates = value;
  }

  get color() {
    return this._color;
  }

  set color(value) {
    this.validateColor(value);
    this._color = value;
  }

  validateNames(names) {
    if (!Array.isArray(names) || names.some(name => typeof name !== 'string')) {
      throw new Error('Invalid names. Must be an array of strings.');
    }
  }

  validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.some(coordinate => {
      if (!(coordinate instanceof Coordinate)) {
        return true;
      }
      try {
        coordinate.validate();
      } catch (error) {
        return true;
      }
      return false;
    })) {
      throw new Error('Invalid coordinates. Must be an array of Coordinate instances.');
    }
  }

  validateColor(color) {
    const hexRegex = /^#([0-9a-f]{1,2}){1,3}$/i;
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;

    if (typeof color !== 'string' || color.trim() === '') {
      throw new Error('Invalid color. Must be a non-empty string.');
    }

    if (!(hexRegex.test(color) || rgbRegex.test(color))) {
      throw new Error('Invalid color format. Must be in the format of 1-digit hex color, 2-digit hex color, or rgb decimal format.');
    }
  }
}

class LocatorMap {
  constructor(name, imageUrl, regions = []) {
    this.validateName(name);
    this.validateImageURL(imageUrl);
    this.validateRegions(regions);

    this.name = name;
    this.imageUrl = imageUrl;
    this.regions = regions;
  }

  validateName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error("Invalid name. Must be a non-empty string.");
    }
  }

  validateImageURL(imageUrl) {
    if (typeof imageUrl !== 'string') {
      throw new Error("Invalid image URL.");
    }
  }

  validateRegions(regions) {
    if (!Array.isArray(regions) || regions.some(region => {
      if (!(region instanceof Region)) {
        return true;
      }
      try {
        region.validate();
      } catch (error) {
        return true;
      }
      return false;
    })) {
      throw new Error("Invalid regions. Must be an array of valid Region objects.");
    }
  }
}

class PracticeList {
  constructor(name, gloses = [], locatorMaps = [], wordsDomain = "🇸🇪", translationDomain = "🇬🇧") {
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

    if (!Array.isArray(locatorMaps) || !locatorMaps.every(locatorMap => locatorMap instanceof LocatorMap)) {
      throw new Error("Invalid argument. 'regions' must be an array of Region objects.");
    }

    this.name = name;
    this.gloses = gloses;
    this.locatorMaps = locatorMaps;
    this.wordsDomain = wordsDomain;
    this.translationDomain = translationDomain;
  }
}

