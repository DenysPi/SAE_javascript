

export class QuizService {

    static #pool = [];
    static #loadPromise = null;

    static async preloadQuestions(amount=10){
        if (this.#loadPromise) {
            return this.#loadPromise;
        }

        this.#loadPromise = fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`)
            .then(response => response.json())
            .then(data => {
                if (data.response_code !== 0 || !Array.isArray(data.results)) {
                    throw new Error('Failed to load questions');
                }
                this.#pool = data.results.map(q => this.formatQuestion(q));
            })
            .catch(error => {
                console.error("Error loading questions:", error);
                this.#pool = [];
            })
            .finally(() => {
                this.#loadPromise = null;
            });

        return this.#loadPromise;
    }


    static async getQuestion() {
        if (this.#pool.length <= 2 && !this.#loadPromise) {
            await this.preloadQuestions(5);

        }
        return this.#pool.pop() || null;

    }

    static formatQuestion(questionData) {
        const correctAnswer = QuizService.decode(questionData.correct_answer);
        const incorrectAnswers = questionData.incorrect_answers.map(ans => this.decode(ans));

        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);

        return {
            question: QuizService.decode(questionData.question),
            choices: allAnswers,
            correctIndex: allAnswers.indexOf(correctAnswer)
        };
    }

    static decode(str) {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }
}