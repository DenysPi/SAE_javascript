
export class Timer {

    #seconds = 0;
    #intervalId = null;

    #onTick;
    #onEnd;

    constructor(onTick, onEnd) {
        this.#onTick = onTick;
        this.#onEnd = onEnd;
    }


    start(duration){
        this.#seconds = duration;

        this.#onTick(this.#seconds);

        this.#intervalId = setInterval(() => {
            this.#seconds--;
            this.#onTick(this.#seconds);
            if(this.#seconds <= 0) {
                this.#onEnd();

            }
        }, 1000);

    }

    stop() {
        if(this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }   
    }
}