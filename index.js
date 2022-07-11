const
    fs = require('fs'),
    {promisify} = require('util'),
    execFile = promisify(require('child_process').execFile);

function naturalCompare(a, b) {
    return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

async function build() {
    let
        output = [],
        leadPattern = /^(set-\d+)\.jpg$/;

    for (let groupFn of fs.readdirSync('images').filter(filename => filename.match(leadPattern)).sort(naturalCompare)) {
        let
            sectionName = groupFn.match(leadPattern)[1];

        output.push(`
            <div class="gallery-container container pb-5">
            <div class="gallery">
        `);

        let
            fnPattern = new RegExp(sectionName + "-\\d+\\.jpg"),
            promises = [],

            filenames = fs.readdirSync('images').filter(filename => filename === groupFn || filename.match(fnPattern)).sort((a, b) => a === groupFn ? -1 : (b === groupFn ? 1 : a.localeCompare(b)));

        for (let filename of filenames) {
            const
                path = 'images/' + filename,
                url = path;

            promises.push(execFile('identify', [path]).then(result => {
                const
                    dimensions = result.stdout
                        .match(/ (\d+)x(\d+) /)
                        .slice(1)
                        .map(s => parseInt(s, 10));

                return `
                    <figure ${filename === groupFn ? 'class="original" style="grid-row: span ' + Math.ceil((filenames.length - 1) / 2) +'"' : ''}>
                        <a href="${url}" data-pswp-width="${dimensions[0]}" data-pswp-height="${dimensions[1]}">
                            <img src="${url}" alt="" loading="lazy" width="${dimensions[0]}" height="${dimensions[1]}">
                        </a>
                    </figure>
                `;
            }));
        }

        output.push(...await Promise.all(promises));

        output.push(`
                </div>
            </div>
        `);
    }

    return output;
}

build().then(
    output => {
        console.log(output.join("\n"));
    },
    err => {
        console.error(err);
        process.exitCode = 1;
    }
);