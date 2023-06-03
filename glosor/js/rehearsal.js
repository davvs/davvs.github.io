class Rehearsal {
    constructor(practiceList, maxRecentResponses = 10) {
        if (!(practiceList instanceof PracticeList)) {
            throw new Error("Invalid argument. 'practiceList' must be an instance of PracticeList.");
        }

        if (typeof maxRecentResponses !== "number" || maxRecentResponses < 1) {
            throw new Error("Invalid argument. 'maxRecentResponses' must be a positive number.");
        }

        this.practiceList = practiceList;
        this.knowledgeStates = new Map();
        this.maxRecentResponses = maxRecentResponses;

        this.practiceList.gloses.forEach((glos, index) => {
            this.knowledgeStates.set(index, {
                knowledge: this.initializeKnowledgeState(),
                translationKnowledge: this.initializeKnowledgeState(),
            });
        });
    }

    initializeKnowledgeState() {
        return {
            recentResponses: [],
            score: 50,
        };
    }

    submitAnswer(glosIndex, isTranslation, guess) {
        if (typeof glosIndex !== "number" || glosIndex < 0 || glosIndex >= this.practiceList.gloses.length) {
            throw new Error("Invalid argument. 'glosIndex' must be a valid index within the range of PracticeList gloses.");
        }

        if (typeof isTranslation !== "boolean") {
            throw new Error("Invalid argument. 'isTranslation' must be a boolean value.");
        }

        if (typeof guess !== "string") {
            throw new Error("Invalid argument. 'guess' must be a string.");
        }

        const glos = this.practiceList.gloses[glosIndex];
        const isCorrect = isTranslation
            ? glos.translations.includes(guess)
            : glos.words.includes(guess);

        const knowledgeState = isTranslation
            ? this.knowledgeStates.get(glosIndex).translationKnowledge
            : this.knowledgeStates.get(glosIndex).knowledge;

        const recentResponse = {
            guess,
            correct: isCorrect,
        };

        knowledgeState.recentResponses.push(recentResponse);

        if (knowledgeState.recentResponses.length > this.maxRecentResponses) {
            knowledgeState.recentResponses.shift();
        }

        knowledgeState.score = this.getScore(glosIndex, isTranslation);
        return isCorrect;
    }

    getScore(glosIndex, isTranslation) {
        if (typeof glosIndex !== "number" || glosIndex < 0 || glosIndex >= this.practiceList.gloses.length) {
            throw new Error("Invalid argument. 'glosIndex' must be a valid index within the range of PracticeList gloses.");
        }

        const knowledgeState = isTranslation
            ? this.knowledgeStates.get(glosIndex).translationKnowledge
            : this.knowledgeStates.get(glosIndex).knowledge;

        if (knowledgeState.recentResponses.length === 0) {
            return 0;
        }

        const correctCount = knowledgeState.recentResponses.filter((response) => response.correct).length;
        const percentage = (correctCount / this.maxRecentResponses) * 100;
        return Math.round(percentage);
    }

    getLowestScoreIndex() {
        let lowestScoreIndex = null;
        let lowestScore = 100;

        this.knowledgeStates.forEach((state, index) => {
            const knowledgeScore = Math.min(state.knowledge.score, state.translationKnowledge.score);
            if (knowledgeScore < lowestScore) {
                lowestScore = knowledgeScore;
                lowestScoreIndex = index;
            }
        });

        return lowestScoreIndex;
    }

    debugPrint() {
        console.log("Rehearsal Data:");

        this.knowledgeStates.forEach((state, index) => {
            const glos = this.practiceList.gloses[index];

            console.log(`Glos Index: ${index}`);
            console.log(`Glos: ${glos.words.join(", ")}`);
            console.log(`Translations: ${glos.translations.join(", ")}`);
            console.log(`Knowledge Score: ${state.knowledge.score}`);
            console.log(`TranslationKnowledge Score: ${state.translationKnowledge.score}`);
            console.log("-------------------");
        });
    }
}