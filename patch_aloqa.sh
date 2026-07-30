#!/bin/bash
cat << 'INNER_EOF' > /tmp/patch_aloqa.tsx
      <section id="aloqa" className="pt-24 pb-section-gap bg-background dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="px-gutter max-w-container-max mx-auto">
          {/* Header Section */}
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="font-display-xl text-display-xl text-on-background dark:text-inverse-on-surface mb-4 md:leading-tight">Biz bilan bog'laning</h2>
            <p className="font-body-lg text-body-lg text-secondary dark:text-secondary-fixed max-w-2xl mx-auto">
                Savollaringiz bormi? Bizning jamoamiz sizga yordam berishga va platformamiz bo'yicha har qanday ma'lumotni taqdim etishga tayyor.
            </p>
          </div>
          
          {/* Bento Contact Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
             {/* Contact Info Column (Bento Left) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Contact Card */}
              <div className="glass-effect p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">Aloqa ma'lumotlari</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">location_on</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Manzil</p>
                    <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 108-uy</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">call</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Telefon</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="tel:+998711234567">+998 71 123-45-67</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">mail</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Email</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="mailto:info@almath.uz">info@almath.uz</a>
                  </div>
                </div>
              </div>
              
              {/* Social Media Card */}
              <div className="glass-effect p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-6">Ijtimoiy tarmoqlarimiz</h3>
                <div className="flex gap-4">
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">alternate_email</span>
                  </a>
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">send</span>
                  </a>
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">public</span>
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="glass-effect p-8 rounded-xl shadow-sm border border-outline-variant/30 flex-grow">
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-4">Ish vaqti</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Dushanba - Juma</span>
                    <span className="text-on-surface dark:text-inverse-on-surface font-semibold">09:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Shanba</span>
                    <span className="text-on-surface dark:text-inverse-on-surface font-semibold">10:00 - 15:00</span>
                  </li>
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Yakshanba</span>
                    <span className="text-error font-semibold">Yopiq</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Contact Form (Bento Center-Right) */}
            <div className="lg:col-span-8 glass-effect p-8 md:p-12 rounded-xl shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface mb-8 relative z-10">Bizga xabar qoldiring</h3>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                setIsContactFormSubmitted(true);
              }}>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="name">Ismingiz</label>
                  <input className="w-full bg-white/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant dark:text-white" id="name" placeholder="Ismingizni kiriting" required type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="email">Email manzilingiz</label>
                  <input className="w-full bg-white/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant dark:text-white" id="email" placeholder="example@mail.com" required type="email" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="subject">Mavzu</label>
                  <input className="w-full bg-white/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant dark:text-white" id="subject" placeholder="Qanday masala bo'yicha bog'lanyapsiz?" required type="text" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="message">Xabar matni</label>
                  <textarea className="w-full bg-white/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant dark:text-white" id="message" placeholder="Xabaringizni bu yerga yozing..." required rows={5}></textarea>
                </div>
                <div className="md:col-span-2 mt-4">
                  <button className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] transition-all duration-200" type="submit" disabled={isContactFormSubmitted}>
                    Xabarni yuborish
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {isContactFormSubmitted && (
                <div className="absolute inset-0 bg-surface/95 dark:bg-inverse-surface/95 backdrop-blur flex flex-col items-center justify-center text-center p-8 z-20 animate-fade-in">
                  <div className="w-20 h-20 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface mb-2">Rahmat!</h4>
                  <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.</p>
                  <button className="mt-8 text-primary dark:text-primary-fixed-dim font-label-md hover:underline" onClick={() => setIsContactFormSubmitted(false)}>Yangi xabar yuborish</button>
                </div>
              )}
            </div>
          </div>
          
          {/* Map Section */}
          <div className="mt-section-gap">
            <div className="glass-effect rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 h-[450px] relative group">
              {/* Location Label Overlay */}
              <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-xl shadow-md border border-outline-variant/20 max-w-xs">
                <p className="font-label-md text-primary dark:text-primary-fixed-dim mb-1">Bizning ofisimiz</p>
                <p className="font-body-md text-on-surface dark:text-inverse-on-surface text-sm">Almath bosh ofisi zamonaviy markazda joylashgan.</p>
              </div>
              
              {/* Map Placeholder Image */}
              <div className="w-full h-full bg-surface-container-highest dark:bg-surface-container relative">
                <img className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700 opacity-80" alt="Map" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" />
                {/* Atmospheric Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 dark:from-inverse-surface/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
INNER_EOF
