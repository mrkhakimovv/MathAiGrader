import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// The string to find is:
//               </div>
//             </div>
//             </motion.div>
// Which should become:
//               </div>
//             </motion.div>

const fixedContent = content
  .split('              </div>\n            </div>\n            </motion.div>')
  .join('              </div>\n            </motion.div>');

// For the last one:
const finalFix = fixedContent
  .split('              </div>\n            </div>\n          </div>\n        </motion.section>')
  .join('              </div>\n            </motion.div>\n          </div>\n        </motion.section>');

fs.writeFileSync('src/components/WelcomeScreen.tsx', finalFix);
console.log("Fixed");
