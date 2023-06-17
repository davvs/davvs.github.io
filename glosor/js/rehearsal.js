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
        const guessLowerCase = guess.trim().toLowerCase();

        const isCorrect = isAnswerTranslation
            ? glos.translations.some(translation => translation.trim().toLowerCase() === guessLowerCase)
            : glos.words.some(word => word.trim().toLowerCase() === guessLowerCase);

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

    debugPrint(debugDataDiv) {
        let debugContent = "<table>";
        debugContent += "<tr><th>Glos Index</th><th>Glos</th><th>Translations</th><th>Knowledge Score</th><th>Translation Knowledge Score</th><th>Recent Guesses</th><th>Recent Translation Guesses</th></tr>";

        this.knowledgeStates.forEach((state, index) => {
            const glos = this.practiceList.gloses[index];

            debugContent += `<tr>`;
            debugContent += `<td>${index}</td>`;
            debugContent += `<td>${glos.words.join(", ")}</td>`;
            debugContent += `<td>${glos.translations.join(", ")}</td>`;
            debugContent += `<td>${state.knowledge.score}</td>`;
            debugContent += `<td>${state.translationKnowledge.score}</td>`;

            debugContent += "<td>";
            state.knowledge.recentResponses.forEach((response, i) => {
                const colorClass = response.correct ? "correct" : "incorrect";
                debugContent += `<span class="${colorClass}">${response.guess}</span>`;
                if (i !== state.knowledge.recentResponses.length - 1) {
                    debugContent += ", ";
                }
            });
            debugContent += "</td>";

            debugContent += "<td>";
            state.translationKnowledge.recentResponses.forEach((response, i) => {
                const colorClass = response.correct ? "correct" : "incorrect";
                debugContent += `<span class="${colorClass}">${response.guess}</span>`;
                if (i !== state.translationKnowledge.recentResponses.length - 1) {
                    debugContent += ", ";
                }
            });
            debugContent += "</td>";

            debugContent += `</tr>`;
        });

        debugContent += "</table>";
        debugDataDiv.innerHTML = debugContent;
    }



}

