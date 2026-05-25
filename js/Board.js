

export class Board {

    #cards;

    #cartesRetournes = new Set();

    #matched = new Set();

    #totalCartes;

    #locked = false;

    constructor(cards) {
        this.#cards = cards;
        this.#totalCartes = cards.length /2;
    }

    peutEtreRetournee(index) {

        if(this.locked) return false;
        if(this.#matched.has(index)) return false;
        if(this.#cartesRetournes.has(index)) return false;
        return true;
    }

    tourner(index) {
        if(!this.peutEtreRetournee(index)) {
            return {etat: "ignore"};
        }

        this.#cartesRetournes.add(index);

        if(this.#cartesRetournes.length === 2) {

        }

    }
}