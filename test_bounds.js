import fs from 'fs';
const data = fs.readFileSync('src/App.tsx', 'utf8');
console.log("App.tsx exists and is readable.");
