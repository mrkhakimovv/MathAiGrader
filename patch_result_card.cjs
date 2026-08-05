const fs = require('fs');

let content = fs.readFileSync('src/components/ResultCard.tsx', 'utf-8');

// The section starts at:
//       <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
//         <div className="flex justify-end gap-2">
// ...
//         </div>
//         <div id="pdf-content" className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 bg-white dark:bg-slate-900">

const startTag = '<div className="flex justify-end gap-2">';
const endTag = '<div id="pdf-content"';

const startIndex = content.indexOf(startTag);
if (startIndex === -1) throw new Error("Start tag not found");

// Find the corresponding closing div of startTag. Since there are many divs inside, we could just search for `<div id="pdf-content"`
const endIndex = content.indexOf(endTag, startIndex);
if (endIndex === -1) throw new Error("End tag not found");

const toRemove = content.substring(startIndex, endIndex);
content = content.replace(toRemove, '');

// Save changes
fs.writeFileSync('src/components/ResultCard.tsx', content);
