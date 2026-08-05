const fs = require('fs');
let content = fs.readFileSync('src/components/ResultCard.tsx', 'utf-8');

// Remove states
content = content.replace(/const \[isRawMode, setIsRawMode\] = useState\(false\);\n/, '');
content = content.replace(/const \[isDownloading, setIsDownloading\] = useState\(false\);\n  \n/, '');
content = content.replace(/import \{ CheckCircle2, XCircle, AlertCircle, RefreshCcw, Code, AlignLeft \} from "lucide-react";/, 'import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";');

// Clean up feedback section
const rawModeFeedbackRegex = /\{isRawMode \? \([\s\S]*?\) : \([\s\S]*?<div className="markdown-body">([\s\S]*?)<\/div>\n\s*\)[\s\S]*?\}/;
content = content.replace(rawModeFeedbackRegex, '<div className="markdown-body">$1</div>');

const rawModeErrorRegex = /\{isRawMode \? \([\s\S]*?\) : \([\s\S]*?<div className="markdown-body inline-block align-top">([\s\S]*?)<\/div>\n\s*\)[\s\S]*?\}/g;
content = content.replace(rawModeErrorRegex, '<div className="markdown-body inline-block align-top">$1</div>');

const rawModeTransRegex = /\{isRawMode \? \([\s\S]*?\) : \([\s\S]*?<div className="markdown-body">([\s\S]*?)<\/div>\n\s*\)[\s\S]*?\}/g;
content = content.replace(rawModeTransRegex, '<div className="markdown-body">$1</div>');

fs.writeFileSync('src/components/ResultCard.tsx', content);
