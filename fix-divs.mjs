import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

let newContent = content.replace(
  '              </div>\n            </div>\n            </motion.div>\n\n            {/* Course 2 */}',
  '              </div>\n            </motion.div>\n\n            {/* Course 2 */}'
);

newContent = newContent.replace(
  '              </div>\n            </div>\n            </motion.div>\n\n            {/* Course 3 */}',
  '              </div>\n            </motion.div>\n\n            {/* Course 3 */}'
);

newContent = newContent.replace(
  '              </div>\n            </motion.div>\n          </div>\n        </motion.section>\n        </section>',
  '              </div>\n            </motion.div>\n          </div>\n        </motion.section>\n      </section>'
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Fixed extra divs");
