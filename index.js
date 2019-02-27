const Proof = require('./lib/proof');

const html = '/home/tenshilyle/index.html';

Proof.initialize(html)
    .then((proof) => {
        console.log(proof);
        console.log(proof.hasJS())
    })
    .catch(e => console.log(e));
