import React, { useState } from 'react';

// At the top of WelcomeScreen:
const faqData = [
  {
    category: "Kurslar haqida",
    color: "bg-primary",
    items: [
      { q: "Kurslarni qanday boshlash mumkin?", a: "Kursni boshlash uchun avval ro'yxatdan o'ting, so'ngra \"Kurslar\" bo'limidan o'zingizga ma'qul bo'lgan kursni tanlab, \"Sotib olish\" tugmasini bosing. To'lov tasdiqlangach, kurs materiallari avtomatik ravishda shaxsiy kabinetingizda paydo bo'ladi." },
      { q: "Sertifikat beriladimi?", a: "Ha, kursni to'liq tamomlagan va yakuniy imtihonlarni muvaffaqiyatli topshirgan barcha talabalarga Almath platformasining rasmiy elektron sertifikati taqdim etiladi." }
    ]
  },
  {
    category: "To'lov tizimi",
    color: "bg-tertiary-container",
    items: [
      { q: "Qanday to'lov usullari mavjud?", a: "Biz Click, Payme, Uzum va Visa/Mastercard kabi barcha ommabop to'lov tizimlarini qabul qilamiz. Shuningdek, xalqaro foydalanuvchilar uchun Stripe va PayPal tizimlari ham mavjud." },
      { q: "To'lovdan keyin qaytarib berish kafolati bormi?", a: "Ha, agar kurs sizga ma'qul kelmasa, birinchi 3 kun ichida to'lovni 100% qaytarib olishingiz mumkin. Bunda hech qanday ortiqcha savollar berilmaydi." }
    ]
  },
  {
    category: "Texnik yordam",
    color: "bg-secondary",
    items: [
      { q: "Videolar yuklanmay qolsa nima qilish kerak?", a: "Birinchi navbatda internet tezligingizni tekshiring. Muammo davom etsa, brauzer keshini tozalang yoki boshqa brauzer orqali kirib ko'ring. Agar bu ham yordam bermasa, texnik guruhimizga yozing." }
    ]
  }
];

function FaqAccordionItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={`glass-effect rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/20' : ''}`}>
      <button className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors group focus:outline-none" onClick={onClick}>
        <span className="font-body-lg text-body-lg font-semibold text-on-surface-variant dark:text-surface-variant group-hover:text-primary transition-colors">{question}</span>
        <span className={`material-symbols-outlined transition-transform duration-300 text-outline ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">{answer}</p>
      </div>
    </div>
  );
}

// Inside WelcomeScreen
  const [searchFaq, setSearchFaq] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

