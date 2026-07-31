import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const updatedContent = content.replace(
  '          </motion.div>\n        </div>\n      </section>',
  '          </motion.div>\n        </div>\n      </motion.section>'
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', updatedContent);
console.log("Fixed tag");
