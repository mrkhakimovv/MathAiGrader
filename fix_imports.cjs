const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherViews.tsx', 'utf8');

code = code.replace(
  "import { Users, UserPlus, FilePlus, Library, Trash2, X, Copy, Check, ExternalLink } from 'lucide-react';",
  "import { Users, UserPlus, FilePlus, Library, Trash2, X, Copy, Check, ExternalLink, Search, Calendar, CheckCircle, XCircle } from 'lucide-react';\nimport { GradingResult } from '../types';"
);

fs.writeFileSync('src/components/TeacherViews.tsx', code);
