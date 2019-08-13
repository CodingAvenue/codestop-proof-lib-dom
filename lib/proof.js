const cheerio = require('cheerio');
const tmp = require('tmp-promise');
const fs = require('fs')
const { promisify } = require('util');

const JSProof = require('codestop-js-proof');
const HTMLLoader = require('codestop-css-proof');

const writeFile = promisify(fs.writeFile);

class Proof {
    constructor(html, js) {
        this.html = html;
        this.js = js;
    }

    static async initialize(html, css) {
        try {
            const HTML = new HTMLLoader(html);
            if (css) {
                await HTML.addExternalCSS(css);
            }

            await HTML.load();

            return new Proof(HTML);
        } catch(e) {
            throw e;
        }
    }

    hasJS() {
        return !!this.js
    }

    async loadScript() {
        const script = this.getScript();

        // Evaluate the JS file so it will not load the JS Proof file if it can't evaluate it.
        try {
            eval(script);
        } catch(e) {
            // Rethrow the error message only to hide our library from the user.
            throw e.message;
        }

        if (script && script.trim()) {
            const file = await tmp.file();

            await writeFile(file.path, script.trim());

            this.js = await JSProof.default(file.path);
        }
    }
    getScript() {
        const ch = cheerio.load(this.html.serialize());
        return ch.root().find('script').html();
    }
}

module.exports = Proof;
