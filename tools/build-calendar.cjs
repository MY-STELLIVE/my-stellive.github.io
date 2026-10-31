// Run after editing data/calendar.json. No packages or network required.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),M=require(path.join(root,'calendar-model.js'));
const c=JSON.parse(fs.readFileSync(path.join(root,'data/calendar.json'),'utf8'));
M.validateCatalog(c);
fs.writeFileSync(path.join(root,'calendar-data.js'),"'use strict';\nconst STELLINK_CATALOG="+JSON.stringify(c)+';\n');
console.log('Validated and bundled '+c.items.length+' calendar records ('+c.updated+').');
