import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AVATAR_SEEDS = [
  "Dog face", "Cat face", "Fox", "Bear", "Panda", "Koala", 
  "Lion", "Tiger face", "Frog", "Pig face", "Monkey face", 
  "Hamster", "Rabbit face", "Cow face", "Mouse face",
  "Horse face", "Dragon face", "Wolf", "Boar", "Raccoon",
  "Badger", "Polar bear", "Front-facing baby chick", 
  "Hear-no-evil monkey", "See-no-evil monkey", "Speak-no-evil monkey",
  "Cat with tears of joy", "Cat with wry smile", "Grinning cat with smiling eyes",
  "Smiling cat with heart-eyes", "Deer", "Camel", "Llama",
  "Giraffe", "Elephant", "Rhinoceros", "Hippopotamus", "Sloth",
  "Otter", "Beaver"
];

const LEGACY_MAPPING: Record<string, string> = {
  "Dog": "Dog face",
  "Cat": "Cat face",
  "Tiger": "Tiger face",
  "Pig": "Pig face",
  "Monkey": "Monkey face",
  "Rabbit": "Rabbit face",
  "Cow": "Cow face"
};

export function getAvatarUrl(seed?: string, fallbackSeed?: string) {
  if (!seed) {
    seed = fallbackSeed || 'Dog face';
  }
  
  const actualSeed = LEGACY_MAPPING[seed] || seed;

  if (AVATAR_SEEDS.includes(actualSeed)) {
    const folderName = encodeURIComponent(actualSeed);
    const fileName = actualSeed.toLowerCase().replace(/ /g, '_');
    return `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets/${folderName}/3D/${fileName}_3d.png`;
  }
  
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${actualSeed}`;
}

export function formatDateUZ(date: Date | string | number | null | undefined, includeTime: boolean = false) {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const months = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun", 
    "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr"
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  let result = `${day}-${month} ${year}`;
  
  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    result += `, ${hours}:${minutes}`;
  }
  
  return result;
}

/**
 * O'zbekiston telefon raqamini +998 XX XXX XX XX formatiga keltiradi
 */
export function formatUzbekPhone(value: string): string {
  if (!value) return '';

  // Faqat raqamlarni ajratib olish
  let digits = value.replace(/\D/g, '');

  // Agar 998 bilan boshlangan bo'lsa, uni olib tashlaymiz
  if (digits.startsWith('998')) {
    digits = digits.slice(3);
  }

  // Maksimal 9 ta raqam (operator kodi va raqam)
  digits = digits.slice(0, 9);

  let formatted = '+998';
  if (digits.length > 0) {
    formatted += ' ' + digits.substring(0, 2);
  }
  if (digits.length > 2) {
    formatted += ' ' + digits.substring(2, 5);
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.substring(5, 7);
  }
  if (digits.length > 7) {
    formatted += ' ' + digits.substring(7, 9);
  }

  return formatted;
}

