import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalogueSchema } from '../src/data/catalogueSchema';
const text=readFileSync('assets/data/scholarships.2026-27.json','utf8');const c=catalogueSchema.parse(JSON.parse(text));writeFileSync(`catalogue/scholarships.v${c.dataVersion}.json`,text);writeFileSync('catalogue/manifest.json',JSON.stringify({schemaVersion:c.schemaVersion,dataVersion:c.dataVersion,url:`https://raw.githubusercontent.com/ChethankumarGS/sarathi/main/catalogue/scholarships.v${c.dataVersion}.json`,sha256:createHash('sha256').update(text).digest('hex')},null,2)+'\n');
