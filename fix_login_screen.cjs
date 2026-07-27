const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(false);"
);

code = code.replace(
  "const handleSubmit = async (e: React.FormEvent) => {",
  "const handleSubmit = async (e: React.FormEvent) => {\n    setIsLoading(true);"
);

code = code.replace(
  "        setError('Invalid username or password');\n      }\n    }",
  "        setError('Invalid username or password');\n      }\n    }\n    setIsLoading(false);"
);

code = code.replace(
  "Sign In\n          </button>",
  "{isLoading ? 'Signing In...' : 'Sign In'}\n          </button>"
);
code = code.replace(
  "disabled={isLoading}",
  ""
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
