class GlosCard {
    constructor(question, answers, clues, questionDomain, answerDomain, knowledgeScore = 50, glosIndex) {
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
        this.glosIndex = glosIndex;
    }
}

class Rehearsal {
    constructor(glosCards, avoidRepeatFrequency, maxRecentResponses) {
        if (!Array.isArray(glosCards) || glosCards.some(card => !(card instanceof GlosCard))) {
            throw new Error("Invalid argument. 'glosCards' must be a non-empty array of GlosCard instances.");
        }

        this.glosCards = glosCards;
        this.recentGlosIndices = [];
        this.lastGlosCardIndex = null;
        this.avoidRepeatFrequency = avoidRepeatFrequency;
        this.maxRecentResponses = maxRecentResponses;
        this.currentQuestionUsedClue = null;
        this.currentQuestionWasCorrect = false;
        this.currentGlosCard = null;
        this.currentGlosCardIndex = null;

    }

    submitAnswer(answer) {
        let isCorrect = this.isAnswerCorrect(currentRehearsal.currentGlosCard, answer);
        this.currentQuestionWasCorrect = isCorrect;
        this.currentGuess = answer;
        return isCorrect;
    }

    isAnswerCorrect(glosCard, answer) {
        const trimmedAnswer = answer.trim().toLowerCase();
        return glosCard.answers.some(glosAnswer => glosAnswer.trim().toLowerCase() === trimmedAnswer);
    }

    getClue() {
        this.currentQuestionUsedClue = true;
        const remainingClues = this.remainingClues;
        if (remainingClues.length > 0) {
            const clue = remainingClues.shift();
            return clue;
        } else {
            return "No more clues";
        }
    }

    finishAnswer() {

        this.recentGlosIndices.push(this.currentGlosCard.glosIndex);
        this.recentGlosIndices = this.recentGlosIndices.slice(-(this.avoidRepeatFrequency-1));
        console.log("Recent Glos Indices:", JSON.stringify(this.recentGlosIndices)); // Print statement

        this.lastGlosCardIndex = this.currentGlosCardIndex;

        console.log("Last glos card index:", this.lastGlosCardIndex);

        this.currentGlosCard.recentGuesses.push(this.currentGuess); // Append the new element
        if (this.currentGlosCard.recentGuesses.length > this.maxRecentResponses) {
            let cap = this.maxRecentResponses;
            this.currentGlosCard.recentGuesses = this.currentGlosCard.recentGuesses.slice(-cap); // Keep the last 3 elements
        }
        this.currentGlosCard.knowledgeScore = this.calculateKnowledgeScore(this.currentGlosCard)

        this.currentGuess = null;
    }

    getNextGlosCard() {
        if (this.currentQuestionWasCorrect == null) {
            throw new Error(`Next question was called before question was answered`);
        }

        if (this.currentGuess != null) {
            this.finishAnswer();
        }

        if (this.isRehearsalFinished()) {
            return null;
        }
        let currentGlosCardWithIndex = this.getNextGlosCardAux();
        this.currentGlosCard = currentGlosCardWithIndex.card;
        this.currentGlosCardIndex = currentGlosCardWithIndex.index;

        this.currentQuestionUsedClue = false;
        this.remainingClues = this.currentGlosCard.clues;

        this.currentQuestionWasCorrect = null;
        return this.currentGlosCard;
    }

    getNextGlosCardAux() {

        //console.log(`finding new card: recentGlosIndices:${JSON.stringify(this.recentGlosIndices)}`)
        const eligibleCards = this.glosCards
            .map((card, index) => ({ card, index }))
            .filter(({ card, index }) => {
                return card.knowledgeScore < 100 && !this.recentGlosIndices.includes(card.glosIndex);
            });

        if (eligibleCards.length > 0) {
            eligibleCards.sort((a, b) => a.card.knowledgeScore - b.card.knowledgeScore);
            return eligibleCards[0];
        } else {
            console.log(`No eligable cards! only avoiding glosCardIndex:${this.lastGlosCardIndex}`)
            const remainingCards = this.glosCards
                .filter((card, index) => index !== this.lastGlosCardIndex)
                .map((card, index) => ({ card, index }));
            remainingCards.sort((a, b) => a.card.knowledgeScore - b.card.knowledgeScore);
            return remainingCards[0];
        }
    }

    calculateKnowledgeScore(glosCard) {
        let correctCount = 0;
        for (const guess of glosCard.recentGuesses) {
            if (this.isAnswerCorrect(glosCard, guess)) {
                correctCount++;
            }
        }
        const correctPct = (correctCount / this.maxRecentResponses) * 100;
        return correctPct;
    }

    isRehearsalFinished() {
        return this.glosCards.every((glosCard) => glosCard.knowledgeScore >= 100);
    }
}
