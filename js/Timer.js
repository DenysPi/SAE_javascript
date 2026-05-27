
export class Timer {

    #seconds = 0;
    #intervalId = null;

    #onTick;
    #onEnd;

    #paused = false;

    constructor(onTick, onEnd) {
        this.#onTick = onTick;
        this.#onEnd = onEnd;
    }


    start(duration){
        this.#seconds = duration;
        this.#paused = false;
        this.#onTick(this.#seconds);

        this.#intervalId = setInterval(() => {
            if (this.#paused) return; 

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
    pause(){
        this.#paused = true;
    }
    resume(){
        this.#paused = false;
    }
    diminuer(secondes){
        this.#seconds = Math.max(0, this.#seconds - secondes);
        this.#onTick(this.#seconds);
        if (this.#seconds <= 0) {
            this.stop();
            this.#onEnd();
        }
    }
}