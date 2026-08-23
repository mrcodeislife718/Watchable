import { ingestPackageFile } from '../src/ingest.js';
const file=process.argv[2]; if(!file){console.error('Usage: node scripts/ingest-package.js path/to/package.json');process.exit(2)}
console.log(ingestPackageFile(file));
