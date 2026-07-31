import fs from 'fs';

let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const targetStr = `              {isContactFormSubmitted && (
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
            </div>
          </div>
        </div>
      </section>`;

const replacementStr = `              {isContactFormSubmitted && (
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
        </div>
      </section>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log("Fixed divs");
