const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const targetHero = `            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={onLoginClick} className="px-10 py-4 rounded-full bg-[#0c193e] text-white font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 group">
                Tizimga kirish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="px-10 py-4 rounded-full bg-white dark:bg-inverse-surface border border-outline-variant/30 text-on-surface dark:text-inverse-on-surface font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all shadow-sm active:scale-95 group">
                Bepul ro'yxatdan o'tish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
          
          {/* Hero Image Container */}
          <div className="relative group mt-12 lg:mt-0">
            <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative glass-effect rounded-[40px] overflow-hidden shadow-2xl p-4 border border-white/50">
              <img src="/hero.png" alt="ALMATH Hero" className="w-full h-auto rounded-[32px] transform group-hover:scale-[1.02] transition-transform duration-700" />
              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-12 left-12 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-bounce delay-700"></div>
            </div>
          </div>
        </section>
        
        {/* Stats Bar */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-12 mb-section-gap">
          <div className="glass-effect rounded-[32px] p-8 md:p-12 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-white/40">`;

const replaceHero = `            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={onLoginClick} className="px-10 py-4 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl active:scale-95 group">
                Tizimga kirish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="px-10 py-4 rounded-full bg-surface dark:bg-inverse-surface border border-outline-variant/30 text-on-surface dark:text-inverse-on-surface font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all shadow-sm active:scale-95 group">
                Bepul ro'yxatdan o'tish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
          
          {/* Hero Image Container */}
          <div className="relative group mt-12 lg:mt-0">
            <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative glass-effect rounded-[40px] overflow-hidden shadow-2xl p-4 border border-outline-variant/30">
              <img src="/hero.png" alt="ALMATH Hero" className="w-full h-auto rounded-[32px] transform group-hover:scale-[1.02] transition-transform duration-700" />
              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-12 left-12 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-bounce delay-700"></div>
            </div>
          </div>
        </section>
        
        {/* Stats Bar */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter py-12 mb-section-gap">
          <div className="glass-effect rounded-[32px] p-8 md:p-12 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-outline-variant/30">`;

code = code.replace(targetHero, replaceHero);
if(code.indexOf(replaceHero) === -1) {
  console.log("Could not replace Hero");
} else {
  console.log("Replaced Hero");
}

fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
