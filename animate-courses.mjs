import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

let newContent = content.replace(
  '<section className="mb-section-gap">\n          <div className="flex flex-col md:flex-row',
  `<motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-section-gap"
        >
          <div className="flex flex-col md:flex-row`
);

newContent = newContent.replace(
  '          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">\n            {/* Course 1 */}',
  `          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course 1 */}`
);

// We should also replace the closing section tag for this section.
// Actually, I can just replace all 3 course cards with motion.divs to stagger them.

// First let's just make the cards motion.divs
newContent = newContent.replace(
  /{ \/\* Course 1 \*\/ }[\s\S]*?{ \/\* Course 2 \*\/ }/g,
  (match) => {
    return match.replace(
      '<div className="group flex flex-col',
      `<motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group flex flex-col`
    ).replace(
      /<\/div>\n$/,
      '</motion.div>\n'
    );
  }
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Updated with motion");
