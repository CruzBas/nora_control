const { execFile } = require('child_process');
const path = require('path');

const xmlBase64 = Buffer.from('<xml></xml>').toString('base64');
const scriptPath = path.join(process.cwd(), 'sign-xml.js');
const nodePath = '/opt/homebrew/bin/node';

execFile(nodePath, [scriptPath, xmlBase64, 'bad_p12', 'bad_pin'], {
    maxBuffer: 10 * 1024 * 1024,
}, (error, stdout, stderr) => {
    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);
});
