const fs = require('fs');
const path = require('path');
const polsPath: string = path.resolve(__dirname, 'content-info/pols.json');
const provsPath: string = path.resolve(__dirname, 'content-info/provs.json');
const pols = JSON.parse(fs.readFileSync(polsPath)).pols;
const provs = JSON.parse(fs.readFileSync(provsPath));

const ROMAN: string[] = ["MMM", "MM", "M", "CM", "DCCC", "DCC", "DC", "D", "CD",
    "CCC", "CC", "C", "XC", "LXXX", "LXX", "LX", "L", "XL", "XXX", "XX", "XI",
    "X", "IX", "VIII", "VII", "VI", "V", "IV", "III", "II", "I"];
const ARABIC: number[] = [3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300,
    200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export interface Pol {
  name: string;
  id: number;
  url: string;
  party: number;
  baseSupport: number;
  support: number;
}

export interface Prov {
  name: string;
  seats: number;
  candidates: number[];
}

export class Generator {
  #made: number;
  #resets: number;
  provs: Prov[];
  
  constructor(nation: string) {
    this.#made = 0;
    this.#resets = 0;
    this.provs = this.shuffle(provs[nation]);
    this.provs.forEach((prov) => {
      prov.candidates = [];
    });
    this.deal();
  }

  newPol(party): Pol {
    if (this.unused.length === 0) {
      this.deal();
    }
    const newPol = this.unused.pop();
    newPol.id = this.#made;
    this.#made++;
    newPol.party = party;
    newPol.url = newPol.name.replace(' ', '-').toLowerCase();
    newPol.url = newPol.url.replace(/[,\.]/, '');
    if (this.#resets > 1) {
      newPol.name = newPol.name + " " + toRomanNumerals(this.#resets);
    }
    newPol.baseSupport = 5;
    newPol.support = newPol.baseSupport;
    return newPol;
  }

  deal(): void {
    this.unused = this.shuffle(pols.slice());
    this.#resets++;

    // Clone each pol so object comparisons don't match them
    for (let i = 0; i < this.unused.length; i++) {
      this.unused[i] = {
        name: this.unused[i].name
      };
    }
  }

  shuffle<T>(arr: T[]): T[] {
    let shuffled: T[] = arr.slice(0, arr.length);
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j: number = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

function toRomanNumerals(num: number): string {
  let result: string = "";
  for (let i = 0; i < ARABIC.length; i++) {
      if (Math.floor(num / ARABIC[i]) > 0){
          result += ROMAN[i];
          num -= ARABIC[i];
      }
  }
  return result;
}
