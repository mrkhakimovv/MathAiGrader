#!/bin/bash
cat << 'INNER_EOF' > /tmp/patch_kurslar.tsx
      <section id="kurslar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-surface dark:bg-inverse-surface">
        {/* Hero & Progress Section */}
        <header className="mb-section-gap">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            <div className="lg:col-span-2">
              <span className="text-primary font-label-md uppercase tracking-wider mb-2 block">Shaxsiy Panel</span>
              <h1 className="font-headline-lg text-headline-lg mb-4 text-on-surface dark:text-inverse-on-surface">Matematika bilim darajang</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant max-w-2xl">
                Matematikaning turli yo'nalishlari bo'yicha test natijalaringizni kuzatib boring va o'z bilimingizni muntazam oshirib boring.
              </p>
            </div>
            
            {/* Progress Glass Card */}
            <div className="glass-effect p-8 rounded-xl shadow-sm border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <span className="font-label-md text-on-surface-variant dark:text-surface-variant">Umumiy progress</span>
                <span className="text-primary font-bold">68%</span>
              </div>
              <div className="h-2 w-full bg-secondary-container dark:bg-secondary-container/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '68%' }}></div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-primary">24</span>
                  <span className="text-label-sm text-on-surface-variant dark:text-surface-variant">Yechilgan testlar</span>
                </div>
                <div className="w-px h-10 bg-outline-variant/50 self-center"></div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-tertiary">12</span>
                  <span className="text-label-sm text-on-surface-variant dark:text-surface-variant">Sertifikatlar</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid Categories - Focus on Math Branches */}
        <section className="mb-section-gap">
          <h2 className="font-headline-md text-headline-md mb-8 text-on-surface dark:text-inverse-on-surface">Matematika bo'limlari bo'yicha saralash</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Algebra - Large Card */}
            <button className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-primary-container text-on-primary-container p-8 flex flex-col justify-between items-start transition-all hover:shadow-2xl active:scale-[0.98]">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
              <span className="material-symbols-outlined text-4xl mb-4 text-on-primary-container">calculate</span>
              <div className="text-left relative z-10">
                <h3 className="font-headline-md text-headline-md mb-2">Algebra</h3>
                <p className="font-body-md text-body-md opacity-80">Tenglamalar, tengsizliklar va logarifmlar olami.</p>
                <div className="mt-6 flex items-center gap-2 font-label-md">
                  <span>12 ta test mavjud</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </button>
            
            {/* Geometriya */}
            <button className="md:col-span-2 group relative overflow-hidden rounded-xl bg-tertiary-container text-on-tertiary-container p-6 flex flex-col justify-between items-start transition-all hover:shadow-xl active:scale-[0.98]">
              <span className="material-symbols-outlined text-3xl">category</span>
              <div className="text-left">
                <h3 className="font-label-md text-headline-md mb-1">Geometriya</h3>
                <p className="text-label-sm opacity-80">Planimetriya va Stereometriya</p>
              </div>
            </button>
            
            {/* Matematik Analiz */}
            <button className="md:col-span-2 group relative overflow-hidden rounded-xl glass-effect border border-outline-variant/30 p-6 flex flex-col justify-between items-start transition-all hover:shadow-xl active:scale-[0.98]">
              <span className="material-symbols-outlined text-3xl text-primary">insights</span>
              <div className="text-left">
                <h3 className="font-label-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-1">Matematik Analiz</h3>
                <p className="text-label-sm text-on-surface-variant dark:text-surface-variant">Limitlar, Hosilalar va Integrallar</p>
              </div>
            </button>
            
            {/* Trigonometriya */}
            <button className="md:col-span-1 group relative overflow-hidden rounded-xl bg-secondary-container text-on-secondary-container p-6 flex flex-col justify-between items-start transition-all hover:shadow-xl active:scale-[0.98]">
              <span className="material-symbols-outlined text-3xl">change_history</span>
              <h3 className="font-label-md text-label-md mt-4 text-left">Trigonometriya</h3>
            </button>
            
            {/* Ehtimollar nazariyasi */}
            <button className="md:col-span-1 group relative overflow-hidden rounded-xl glass-effect border border-outline-variant/30 p-6 flex flex-col justify-between items-start transition-all hover:shadow-xl active:scale-[0.98]">
              <span className="material-symbols-outlined text-3xl text-primary">casino</span>
              <h3 className="font-label-md text-label-md mt-4 text-on-surface dark:text-inverse-on-surface text-left">Ehtimollar nazariyasi</h3>
            </button>
            
            {/* Kombinatorika */}
            <button className="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-highest p-6 flex flex-col justify-between items-start transition-all hover:shadow-xl active:scale-[0.98]">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">dashboard_customize</span>
              <h3 className="font-label-md text-label-md mt-4 text-on-surface dark:text-inverse-on-surface text-left">Kombinatorika</h3>
            </button>
          </div>
        </section>

        {/* Featured Math Tests Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">Mashhur matematika testlari</h2>
            <a className="text-primary font-label-md flex items-center gap-2 hover:underline" href="#">
              Barchasini ko'rish
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Test Card 1 */}
            <div className="glass-effect rounded-xl overflow-hidden group hover:shadow-xl transition-all border border-outline-variant/30 flex flex-col">
              <div className="relative h-48 w-full overflow-hidden bg-primary/5">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Abstract blue glowing mathematical equations of logarithms and calculus on dark tech background" src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600" />
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm">Murakkab</div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h4 className="font-headline-md text-body-lg mb-2 text-on-surface dark:text-inverse-on-surface text-left">Logarifmik tenglamalar</h4>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md mb-6 line-clamp-2 text-left">Logarifmik ifodalarni soddalashtirish va murakkab tenglamalar majmuasi.</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-6 text-on-surface-variant dark:text-surface-variant text-label-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">timer</span>
                      <span>60 daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">quiz</span>
                      <span>30 savol</span>
                    </div>
                  </div>
                  <button className="w-full bg-surface-container-low dark:bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md py-3 rounded-lg transition-all flex items-center justify-center gap-2 group/btn">
                    Testni boshlash
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Card 2 */}
            <div className="glass-effect rounded-xl overflow-hidden group hover:shadow-xl transition-all border border-outline-variant/30 flex flex-col">
              <div className="relative h-48 w-full overflow-hidden bg-tertiary/5">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Geometric 3D shapes and vectors representation in a clean modern blue workspace" src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600" />
                <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-label-sm">O'rta</div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h4 className="font-headline-md text-body-lg mb-2 text-on-surface dark:text-inverse-on-surface text-left">Vektorlar va ularning xossalari</h4>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md mb-6 line-clamp-2 text-left">Tekislikda va fazoda vektorlar, skalyar ko'paytma va proyeksiyalar.</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-6 text-on-surface-variant dark:text-surface-variant text-label-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">timer</span>
                      <span>45 daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">quiz</span>
                      <span>25 savol</span>
                    </div>
                  </div>
                  <button className="w-full bg-surface-container-low dark:bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md py-3 rounded-lg transition-all flex items-center justify-center gap-2 group/btn">
                    Testni boshlash
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Card 3 */}
            <div className="glass-effect rounded-xl overflow-hidden group hover:shadow-xl transition-all border border-outline-variant/30 flex flex-col">
              <div className="relative h-48 w-full overflow-hidden bg-secondary/5">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="High tech neon lines representing integration and mathematical analysis curves" src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600" />
                <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-sm">Murakkab</div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h4 className="font-headline-md text-body-lg mb-2 text-on-surface dark:text-inverse-on-surface text-left">Integrallarni hisoblash</h4>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md mb-6 line-clamp-2 text-left">Aniq va aniqmas integrallar, Nyuton-Leybnits formulasi qo'llanilishi.</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-6 text-on-surface-variant dark:text-surface-variant text-label-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">timer</span>
                      <span>50 daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">quiz</span>
                      <span>20 savol</span>
                    </div>
                  </div>
                  <button className="w-full bg-surface-container-low dark:bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary font-label-md py-3 rounded-lg transition-all flex items-center justify-center gap-2 group/btn">
                    Testni boshlash
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Activity Graph */}
        <section className="mt-section-gap">
          <div className="glass-effect rounded-2xl p-8 border border-outline-variant/20 shadow-lg relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Haftalik faollik</h2>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-6">Siz o'tgan haftaga qaraganda 15% ko'proq matematika testlarini yechdingiz. Shunday davom eting!</p>
                <div className="flex items-end gap-2 h-48">
                  <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: '40%' }}></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: '60%' }}></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: '35%' }}></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: '85%' }}></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary cursor-pointer" style={{ height: '55%' }}></div>
                  <div className="flex-1 bg-primary rounded-t-lg" style={{ height: '95%' }}></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg" style={{ height: '20%' }}></div>
                </div>
                <div className="flex justify-between mt-4 text-label-sm text-on-surface-variant dark:text-surface-variant font-medium">
                  <span>Du</span><span>Se</span><span>Ch</span><span>Pa</span><span>Ju</span><span>Sha</span><span>Ya</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-surface-container-highest flex items-center gap-4 border border-outline-variant/10">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined">emoji_events</span>
                  </div>
                  <div>
                    <h5 className="font-label-md text-on-surface dark:text-inverse-on-surface">Eng yaxshi natija</h5>
                    <p className="text-label-sm text-on-surface-variant dark:text-surface-variant">Algebra - 100/100</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-surface-container-highest flex items-center gap-4 border border-outline-variant/10">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined">avg_time</span>
                  </div>
                  <div>
                    <h5 className="font-label-md text-on-surface dark:text-inverse-on-surface">O'rtacha vaqt</h5>
                    <p className="text-label-sm text-on-surface-variant dark:text-surface-variant">24 daqiqa/test</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Background Decorative Gradient */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
          </div>
        </section>
      </section>
INNER_EOF
