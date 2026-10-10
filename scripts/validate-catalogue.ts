import { readFileSync } from 'node:fs';
import { catalogueSchema } from '../src/data/catalogueSchema';
const c=catalogueSchema.parse(JSON.parse(readFileSync(process.argv[2]||'assets/data/scholarships.2026-27.json','utf8')));console.log(`Valid catalogue v${c.dataVersion}: ${c.scholarships.length} records`);
