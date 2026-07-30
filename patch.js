const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const targetTestlar = `      <section id="testlar" className="relative py-24 bg-[#f8f9fc] dark:bg-slate-950 z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0a1128] dark:text-white mb-4">Test turlari</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Milliy Sertifikat */}
            <div className="bg-[#fffbf5] dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-[24px] p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffece0] dark:bg-orange-900/50 text-orange-500 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Milliy Sertifikat</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari.
              </p>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold">
                0 ta test
              </div>
            </div>

            {/* Attestatsiya */}
            <div className="bg-[#faf5ff] dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-[24px] p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3e8ff] dark:bg-purple-900/50 text-purple-600 mb-6">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Attestatsiya</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari.
              </p>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-bold">
                2 ta test
              </div>
            </div>

            {/* SAT */}
            <div className="bg-[#f0f9ff] dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-[24px] p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f2fe] dark:bg-sky-900/50 text-sky-500 mb-6">
                <Book className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">SAT</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar asosida.
              </p>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 text-xs font-bold">
                0 ta test
              </div>
            </div>

            {/* DTM */}
            <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[24px] p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dcfce7] dark:bg-emerald-900/50 text-emerald-500 mb-6">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">DTM</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va fan testlari.
              </p>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                1 ta test
              </div>
            </div>
          </div>
        </div>
      </section>`;

const replaceTestlar = `      <section id="testlar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-background dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-background dark:text-inverse-on-surface mb-4">Test turlari</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant max-w-3xl mx-auto">Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Milliy Sertifikat */}
          <div className="bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6">
              <Award className="h-8 w-8" />
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
              <GraduationCap className="h-8 w-8" />
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
              <Book className="h-8 w-8" />
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
              <Calculator className="h-8 w-8" />
            </div>
            <h3 className="font-headline-md text-[24px] text-on-surface dark:text-inverse-on-surface mb-3">DTM</h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8">
              Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va fan testlari.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
              1 ta test
            </div>
          </div>
        </div>
      </section>`;

code = code.replace(targetTestlar, replaceTestlar);
if(code.indexOf(replaceTestlar) === -1) {
  console.log("Could not replace testlar");
} else {
  console.log("Replaced testlar");
}

fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
