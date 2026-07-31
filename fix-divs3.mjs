import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// replace </div>\n            </motion.div> with just </motion.div>
const fixedContent = content.replace(/<\/div>\s*<\/motion\.div>/g, '</motion.div>');

// replace </motion.div>\n          </div>\n        </motion.section>\n      </section> 
// wait, the error shows:
// 373|              </motion.div>
// 374|            </div>
// 375|          </motion.section>
// 376|        </section>

// so let's also fix the last one
let finalContent = fixedContent.replace(/<\/motion\.div>\s*<\/div>\s*<\/motion\.section>\s*<\/section>/g, '</motion.div>\n          </div>\n        </motion.section>');

fs.writeFileSync('src/components/WelcomeScreen.tsx', finalContent);
console.log("Fixed with regex");
