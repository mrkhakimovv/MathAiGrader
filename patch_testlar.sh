#!/bin/bash
cat << 'INNER_EOF' > /tmp/patch_testlar.tsx
      <section id="testlar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-background dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-background dark:text-inverse-on-surface mb-4">Test turlari</h2>
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
        </div>
      </section>
INNER_EOF
