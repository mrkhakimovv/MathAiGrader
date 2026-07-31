import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const targetStr = `        {/* Bizning missiyamiz */}
        <div className="bg-surface-container-low dark:bg-surface-container-highest py-section-gap">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="text-center mb-16">
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning missiyamiz</h2>
              <div className="h-1.5 w-24 bg-primary dark:bg-primary-fixed-dim mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">lightbulb</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Innovatsiya</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Eng so'nggi texnologiyalar va pedagogik metodikalarni birlashtirib, o'quvchilarga dunyo miqyosidagi bilim berish.</p>
              </div>
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">verified</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Sifat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Har bir kurs va test materiallari ekspertlar tomonidan sinchkovlik bilan tekshirilib, yuqori sifat standartlariga muvofiqlashtiriladi.</p>
              </div>
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">groups</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Hamjamiyat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Matematika ixlosmandlarini birlashtiruvchi, bir-birini qo'llab-quvvatlovchi global o'quv muhitini yaratish.</p>
              </div>
            </div>
          </div>
        </div>`;

const newMissionSection = `        {/* Bizning missiyamiz - Animated */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-surface-container-low dark:bg-surface-container-highest py-section-gap relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning missiyamiz</h2>
              <div className="h-1.5 w-24 bg-primary dark:bg-primary-fixed-dim mx-auto rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileInView={{ x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full w-full bg-tertiary dark:bg-tertiary-fixed-dim"
                ></motion.div>
              </div>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Innovatsiya */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-primary-container/30 dark:bg-primary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-4xl">lightbulb</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-primary transition-colors">Innovatsiya</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Eng so'nggi texnologiyalar va ilg'or pedagogik metodikalarni birlashtirib, o'quvchilarga dunyo miqyosidagi zamonaviy bilim berish.
                </p>
              </motion.div>

              {/* Sifat */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-tertiary/40 hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-tertiary-container/30 dark:bg-tertiary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-tertiary/20">
                  <span className="material-symbols-outlined text-tertiary dark:text-tertiary-fixed-dim text-4xl">verified</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-tertiary transition-colors">Sifat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Har bir o'quv kursi va test materiallari ekspertlar tomonidan sinchkovlik bilan tekshirilib, yuqori ta'lim standartlariga qat'iy muvofiqlashtiriladi.
                </p>
              </motion.div>

              {/* Hamjamiyat */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-secondary-container/30 dark:bg-secondary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-secondary/20">
                  <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim text-4xl">groups</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Hamjamiyat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Matematika ixlosmandlari va mutaxassislarni birlashtiruvchi, bir-birini qo'llab-quvvatlovchi va rivojlantiruvchi global o'quv muhitini yaratish.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>`;

const newContent = content.replace(targetStr, newMissionSection);
fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Updated mission section");
