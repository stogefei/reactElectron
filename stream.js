const fs = require('fs')
const zlib = require('zlib')

const src = fs.createReadStream('./qiniu.js')
// src.pipe(process.stdout)

const writeDe = fs.createWriteStream('./qiniu.copy')

src.pipe(zlib.createGzip()).pipe(writeDe)