class Rehearsal {
    constructor(practiceList, maxRecentResponses = 10, avoidRepeatFrequency = 2) {
        if (!(practiceList instanceof PracticeList)) {
            throw new Error("Invalid argument. 'practiceList' must be an instance of PracticeList.");
        }

        if (typeof maxRecentResponses !== "number" || maxRecentResponses < 1) {
            throw new Error("Invalid argument. 'maxRecentResponses' must be a positive number.");
        }

        if (typeof avoidRepeatFrequency !== "number" || avoidRepeatFrequency < 1) {
            throw new Error("Invalid argument. 'avoidRepeatFrequency' must be a positive number.");
        }

        this.practiceList = practiceList;
        this.knowledgeStates = new Map();
        this.maxRecentResponses = maxRecentResponses;
        this.avoidRepeatFrequency = avoidRepeatFrequency;
        this.initialScore = 30;
        this.recentIndices = [];

        this.practiceList.gloses.forEach((glos, index) => {
            this.knowledgeStates.set(index, {
                knowledge: this.initializeKnowledgeState(this.initialScore),
                translationKnowledge: this.initializeKnowledgeState(this.initialScore),
            });
        });
    }

    initializeKnowledgeState(initialScore) {
        return {
            recentResponses: [],
            score: initialScore,
        };
    }

    submitAnswer(glosIndex, isAnswerTranslation, guess) {
        if (typeof glosIndex !== "number" || glosIndex < 0 || glosIndex >= this.practiceList.gloses.length) {
            throw new Error("Invalid argument. 'glosIndex' must be a valid index within the range of PracticeList gloses.");
        }

        if (typeof isAnswerTranslation !== "boolean") {
            throw new Error("Invalid argument. 'isAnswerTranslation' must be a boolean value.");
        }

        if (typeof guess !== "string") {
            throw new Error("Invalid argument. 'guess' must be a string.");
        }

        const glos = this.practiceList.gloses[glosIndex];
        const isCorrect = isAnswerTranslation ? glos.translations.includes(guess) : glos.words.includes(guess);

        return {
            isCorrect,
            score: this.getScore(glosIndex, isAnswerTranslation),
        };
    }

    acceptResult(glosIndex, isAnswerTranslation, guess, isCorrect) {
        if (typeof glosIndex !== "number" || glosIndex < 0 || glosIndex >= this.practiceList.gloses.length) {
            throw new Error("Invalid argument. 'glosIndex' must be a valid index within the range of PracticeList gloses.");
        }

        const glos = this.practiceList.gloses[glosIndex];
        const knowledgeState = isAnswerTranslation
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

        knowledgeState.score = this.getScore(glosIndex, isAnswerTranslation);

        this.updateRecentIndices(glosIndex);
    }

    getScore(glosIndex, isAnswerTranslation) {
        if (typeof glosIndex !== "number" || glosIndex < 0 || glosIndex >= this.practiceList.gloses.length) {
            throw new Error("Invalid argument. 'glosIndex' must be a valid index within the range of PracticeList gloses.");
        }

        const knowledgeState = isAnswerTranslation
            ? this.knowledgeStates.get(glosIndex).translationKnowledge
            : this.knowledgeStates.get(glosIndex).knowledge;

        if (knowledgeState.recentResponses.length === 0) {
            return 0;
        }

        const correctCount = knowledgeState.recentResponses.filter((response) => response.correct).length;
        const percentage = (correctCount / this.maxRecentResponses) * 100;
        return Math.round(percentage);
    }

    getLowestScoreIndex(avoidRecentList = []) {
        let lowestScoreIndex = null;
        let lowestScore = 100;

        this.knowledgeStates.forEach((state, index) => {
            if (!avoidRecentList.includes(index)) {
                const knowledgeScore = Math.min(state.knowledge.score, state.translationKnowledge.score);
                if (knowledgeScore < lowestScore) {
                    lowestScore = knowledgeScore;
                    lowestScoreIndex = index;
                }
            }
        });

        return lowestScoreIndex;
    }

    updateRecentIndices(index) {
        this.recentIndices.push(index);

        if (this.recentIndices.length > this.avoidRepeatFrequency) {
            this.recentIndices.shift();
        }
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
            console.log("Recent translation Guesses:");
            state.knowledge.recentResponses.forEach((response, i) => {
                console.log(`Guess ${i + 1}: ${response.guess} - ${response.correct ? "Correct" : "Incorrect"}`);
            });
            console.log("Recent reversed Guesses:");
            state.translationKnowledge.recentResponses.forEach((response, i) => {
                console.log(`Guess on reverse ${i + 1}: ${response.guess} - ${response.correct ? "Correct" : "Incorrect"}`);
            });
            console.log("-------------------");
        });
    }

}

