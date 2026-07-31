const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const target = `          {/* Bento Contact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
             {/* Contact Info Column (Bento Left) */}
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
               
          </div>`;

const replacement = `          {/* Bento Contact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">location_on</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Manzil</p>
                    <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 108-uy</p>
                  </div>
              </div>

              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">call</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Telefon</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors block" href="tel:+998711234567">+998 71 123-45-67</a>
                  </div>
              </div>

              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">send</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Telegram</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors block" href="https://t.me/almath_uz">@almath_uz</a>
                  </div>
              </div>
          </div>`;

if(code.includes(target)) {
    fs.writeFileSync('src/components/WelcomeScreen.tsx', code.replace(target, replacement));
    console.log("Replaced exactly!");
} else {
    // maybe try to replace by splitting lines
    const lines = code.split('\n');
    lines.splice(623, 36, ...replacement.split('\n'));
    fs.writeFileSync('src/components/WelcomeScreen.tsx', lines.join('\n'));
    console.log("Replaced by lines array");
}
