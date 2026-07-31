import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const targetStr = `      <section id="testlar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-background dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="text-center mb-16">
          <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-background dark:text-inverse-on-surface mb-4">Test turlari</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant max-w-3xl mx-auto">Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Milliy Sertifikat */}
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface dark:text-inverse-on-surface mb-3">Milliy Sertifikat</h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8">
              Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
              0 ta test
            </div>
          </div>

          {/* Attestatsiya */}
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary dark:text-tertiary-fixed-dim mb-6">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface dark:text-inverse-on-surface mb-3">Attestatsiya</h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8">
              O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-container/20 text-tertiary dark:text-tertiary-fixed-dim font-label-sm text-label-sm">
              2 ta test
            </div>
          </div>

          {/* SAT */}
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary dark:text-secondary-fixed-dim mb-6">
              <span className="material-symbols-outlined text-3xl">menu_book</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface dark:text-inverse-on-surface mb-3">SAT</h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8">
              SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar asosida.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container/20 text-secondary dark:text-secondary-fixed-dim font-label-sm text-label-sm">
              0 ta test
            </div>
          </div>

          {/* DTM */}
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6">
              <span className="material-symbols-outlined text-3xl">calculate</span>
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface dark:text-inverse-on-surface mb-3">DTM</h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8">
              Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va fan testlari.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
              1 ta test
            </div>
          </div>
        </div>`;

const newTestSection = `      {/* Animated Tests Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        id="testlar" 
        className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-background dark:bg-inverse-surface border-t border-outline-variant/20"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-3xl">
            <span className="text-primary font-label-md uppercase tracking-wider mb-2 block">Imtihonlarga tayyorgarlik</span>
            <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-background dark:text-inverse-on-surface mb-4">
              Test turlari
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
              Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus, xalqaro va davlat standartlariga mos testlar mavjud.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Milliy Sertifikat */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-primary transition-colors">Milliy Sertifikat</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari va moslashtirilgan o'quv materiallari.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
                  0 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Attestatsiya */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-tertiary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-tertiary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary dark:text-tertiary-fixed-dim mb-6 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-tertiary transition-colors">Attestatsiya</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari. Bilimni baholash standarti.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-container/20 text-tertiary dark:text-tertiary-fixed-dim font-label-sm text-label-sm">
                  2 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-tertiary hover:text-on-tertiary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* SAT */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-secondary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-secondary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary dark:text-secondary-fixed-dim mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">public</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-secondary transition-colors">SAT</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar va talablar asosida.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container/20 text-secondary dark:text-secondary-fixed-dim font-label-sm text-label-sm">
                  0 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-secondary hover:text-on-secondary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* DTM */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">calculate</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-primary transition-colors">DTM</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va maxsus fan testlari.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
                  1 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>`;

const newContent = content.replace(targetStr, newTestSection);
fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Updated tests section");
