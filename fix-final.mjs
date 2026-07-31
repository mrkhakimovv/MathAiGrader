import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const navLinksStart = content.indexOf('      {/* Sections for Navigation Links */}');
const testlarStart = content.indexOf('      <section id="testlar" className="pt-24');

if (navLinksStart !== -1 && testlarStart !== -1) {
  const top = content.substring(0, navLinksStart);
  const bottom = content.substring(testlarStart);

  const correctCoursesSection = `      {/* Sections for Navigation Links */}
      <section id="kurslar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-surface dark:bg-inverse-surface">
        
        {/* Animated Courses Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-section-gap"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-label-md uppercase tracking-wider mb-2 block">Mukammal ta'lim</span>
              <h2 className="font-headline-md md:text-headline-lg text-headline-md md:text-headline-lg text-on-surface dark:text-inverse-on-surface mb-4">
                Matematika Kurslari
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
                Boshlang'ich darajadan to oliy matematikagacha bo'lgan to'liq, tizimli va interaktiv video darsliklar to'plami.
              </p>
            </div>
            <a className="text-primary font-label-md flex items-center gap-2 hover:bg-primary/10 px-6 py-3 rounded-full transition-colors whitespace-nowrap" href="#">
              Barcha kurslar
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Asosiy matematika" 
                  src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Boshlang'ich</span>
                  <span className="bg-surface/90 text-on-surface px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md backdrop-blur-sm">Ommabop</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 42 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 18 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.9</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-primary transition-colors">Matematika Asoslari</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Arifmetika, kasrlar, foizlar va sodda tenglamalar. Matematikani noldan o'rganishni istaganlar uchun eng yaxshi tanlov.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Ali+Valiyev&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Ali Valiyev</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">Oliy toifali o'qituvchi</div>
                    </div>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-primary-container/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Course 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-tertiary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-tertiary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Algebra va Analiz" 
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">O'rta daraja</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 64 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 32 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.8</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-tertiary transition-colors">Algebra va Analiz</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Funksiyalar, hosila, integral va ularning tatbiqlari. OTM ga tayyorlanuvchilar uchun maxsus intensiv kurs.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Malika+Azizova&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Malika Azizova</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">PhD, Professor</div>
                    </div>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Course 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-secondary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Oliy Matematika" 
                  src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Murakkab</span>
                  <span className="bg-error text-on-error px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Yangi</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 85 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 45 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 5.0</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Oliy Matematika</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Chiziqli algebra, analitik geometriya va differensial tenglamalar. Talabalar va mutaxassislar uchun chuqurlashtirilgan dastur.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Rustam+Umarov&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Rustam Umarov</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">Xalqaro ekspert</div>
                    </div>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </section>
`;

  fs.writeFileSync('src/components/WelcomeScreen.tsx', top + correctCoursesSection + bottom);
  console.log("Successfully replaced with perfect structure");
} else {
  console.log("Indices not found");
}
