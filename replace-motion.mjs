import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

// Replace the closing tag for motion.section
const replacedSection = content.replace(
  '          </div>\n        </section>\n      </section>\n      <section id="testlar" className="pt-24',
  '          </div>\n        </motion.section>\n      </section>\n      <section id="testlar" className="pt-24'
);

// We can replace the cards with motion.div manually by parsing Course 1, Course 2, Course 3
const finalContent = replacedSection
  .replace(
    '{/* Course 1 */}\n            <div className="group flex flex-col',
    '{/* Course 1 */}\n            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="group flex flex-col'
  )
  .replace(
    '{/* Course 2 */}\n            <div className="group flex flex-col',
    '</motion.div>\n\n            {/* Course 2 */}\n            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="group flex flex-col'
  )
  .replace(
    '{/* Course 3 */}\n            <div className="group flex flex-col',
    '</motion.div>\n\n            {/* Course 3 */}\n            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="group flex flex-col'
  )
  .replace(
    '                  </button>\n                </div>\n              </div>\n            </div>\n          </div>\n        </motion.section>',
    '                  </button>\n                </div>\n              </div>\n            </motion.div>\n          </div>\n        </motion.section>'
  );

fs.writeFileSync('src/components/WelcomeScreen.tsx', finalContent);
console.log("Done");
