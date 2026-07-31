import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const teamRegex = /\s*\{\/\* Jamoamiz \*\/\}\s*<div className="py-section-gap bg-surface-container-low dark:bg-surface-container-highest relative overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;

// First let's find exact bounds manually to be safe
const startIdx = content.indexOf('{/* Jamoamiz */}');
const endIdx = content.indexOf('<section id="aloqa"');

if (startIdx !== -1 && endIdx !== -1) {
  const newTeamSection = `
        {/* Jamoamiz */}
        <div className="py-section-gap bg-surface-container-low dark:bg-surface-container-highest relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning jamoamiz</h2>
              <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">Muvaffaqiyatimiz ortida turgan tajribali ustozlar va texnologiya ixlosmandlari bilan tanishing.</p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto">
              {/* Team Member 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-outline-variant/30 hover:border-primary/50"
              >
                <div className="h-80 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Panji Soatov" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBrLsUeyTzhqhPzdUGBFB3DfiUe2kIV-D5zRIKIH08uEp6CDaE86dJywgdkUh-g652UH1D427E8rHSistdcupfgX-8-tiZsYlPQY8lMMKbozvTn6Hxiz34RyDAkL8v1cCUAUUYBGpw7jWR7kSKUY6R-bppzvPptaTYIh18aWM_C57_sT3IYKFcD4rGZBZQf2U7X0FiN27JP9fHZKXM37QLcGW8E4pWfGv2HdQTFnkUUUGUMV18sQt_"/>
                </div>
                <div className="p-8 relative">
                  <div className="absolute -top-6 right-8 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                    <span className="material-symbols-outlined">star</span>
                  </div>
                  <h4 className="font-headline-lg text-2xl mb-2 text-on-background dark:text-inverse-on-surface group-hover:text-primary transition-colors">Panji Soatov</h4>
                  <p className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md mb-6 uppercase tracking-wider">Asoschi va CEO</p>
                  <p className="text-on-surface-variant font-body-md mb-6">Ta'lim sohasida 10 yillik tajribaga ega. Almath platformasining g'oya muallifi va boshqaruvchisi.</p>
                  <div className="flex gap-4">
                    <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-300" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-300" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </motion.div>

              {/* Team Member 2 */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-outline-variant/30 hover:border-secondary/50"
              >
                <div className="h-80 overflow-hidden relative">
                  <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Quvonchbek Hakimov" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaMjpMXQWcBT0v2PWAPPRNTswMxjtptVkAgE-pECYj7255NvMHRN8MvwYZIPJS4NqP-LYIbrjAhVEUKhE7GNeK64cXSDRF1OI0ug364eh_aD917gbOaP1qZyGLfRSfbPM40ezAM3dQIohkghGcw0odCDpT6Sw55c6wQn_MJQSuOF06I-zTV9MM8SkwOqs3BfLwZbxXz60QW86R1AAxHy0bGeK0IyMfOycB7vSalIcnfB_y1tr6qGM9"/>
                </div>
                <div className="p-8 relative">
                  <div className="absolute -top-6 right-8 w-12 h-12 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                    <span className="material-symbols-outlined">code</span>
                  </div>
                  <h4 className="font-headline-lg text-2xl mb-2 text-on-background dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Quvonchbek Hakimov</h4>
                  <p className="text-secondary dark:text-secondary-fixed-dim font-label-md text-label-md mb-6 uppercase tracking-wider">Texnik rahbar (CTO)</p>
                  <p className="text-on-surface-variant font-body-md mb-6">Sun'iy intellekt va zamonaviy web texnologiyalar bo'yicha mutaxassis. Tizim arxitekturasi muallifi.</p>
                  <div className="flex gap-4">
                    <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary transition-all duration-300" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary transition-all duration-300" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      `;
  
  content = content.substring(0, startIdx) + newTeamSection + content.substring(endIdx);
  fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
  console.log("Team section replaced");
} else {
  console.log("Could not find bounds");
}
