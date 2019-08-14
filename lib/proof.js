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

    static async initialize(html, css, withScript = false) {
        if (withScript) {
            return Proof.initializeWithScript(html, css);
        }

        const HTML = new HTMLLoader(html);
        if (css) {
            await HTML.addExternalCSS(css);
        }

        await HTML.load();

        return new Proof(HTML);
    }

    static async initializeWithScript(html, css) {
        const HTML = new HTMLLoader(html);

        if (css) {
            await HTML.addExternalCSS(css);
        }

        await HTML.load(true);

        const jsPath = await Proof.loadScript(HTML.serialize());

        if (jsPath) { // We have a JS file
            const jsProof = await JSProof.default(jsPath);

            return new Proof(HTML, jsProof);
        }

        return new Proof(HTML);
    }

    hasJS() {
        return !!this.js
    }

    static async loadScript(html) {
        const script = Proof.getScript(html);

        if (script && script.trim()) {
            const file = await tmp.file();

            await writeFile(file.path, script.trim());

            return file.path;
        }
    }
    static getScript(html) {
        const ch = cheerio.load(html);
        return ch.root().find('script').html();
    }
}

module.exports = Proof;
