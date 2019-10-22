import Data from '../core/data';

export default class RandomData extends Data
{
    constructor(params) {
        super(params);

        this.length = params.length || 16;

        if (this.length <= 0) {
            this.length = 16;
        }

        this.collector = hashCollector;
    }
}




function hashCollector(callback) {
    if (typeof callback !== 'function') this.triggerEvent('error');

    let result = '';
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f',
                    'g', 'h', ' i', 'j', 'k', 'l',
                    'm', 'n', 'o', 'p', 'q', 'r',
                    's',  't', 'u', 'v', 'w', 'x',
                    'y', 'z',
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 0; i < this.length; i++) {
        result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    this.triggerEvent('dataReady', result);
}