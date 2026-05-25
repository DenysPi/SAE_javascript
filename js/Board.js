

export class Board {

    #cards;

    #cartesRetournes = new Set();

    #matched = new Set();

    #totalpairs;
    #totalMatched = 0;


    #locked = false;

    constructor(cards) {
        this.#cards = cards;
        this.#totalpairs = cards.length / 2;
    }

    peutEtreRetournee(index) {

        if(this.#locked) return false;
        if(this.#matched.has(index)) return false;
        if(this.#cartesRetournes.has(index)) return false;
        return true;
    }

    tourner(index) {
        if(!this.peutEtreRetournee(index)) {
            return {etat: "ignore"};
        }

        this.#cartesRetournes.add(index);

        if (this.#cartesRetournes.size < 2) {
            return {etat: 'flip'};
        }

        const [a, b] = [...this.#cartesRetournes];

        if (this.#cards[a].id === this.#cards[b].id) {
            this.#matched.add(a);
            this.#matched.add(b);
            this.#cartesRetournes.clear();
            this.#totalMatched++;
            return {etat: 'match', indices: [a, b]};
        }

        this.#locked = true;

        return {etat: 'mismatch', indices: [a, b]};
    }

    retornerMisMatch() {
        const indices = [...this.#cartesRetournes];
        this.#cartesRetournes.clear();
        this.#locked = false;
        return indices;
    }

    isCompete() {
        return this.#totalMatched === this.#totalpairs;
    }

    pairsRemaining(){
        return this.#totalpairs - this.#totalMatched;
    }

}