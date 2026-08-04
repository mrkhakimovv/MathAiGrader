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
  "Smiling cat with heart-eyes"
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
