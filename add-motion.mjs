import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const target = "import React, { useState, useEffect, useRef } from 'react';";
const replacement = "import React, { useState, useEffect, useRef } from 'react';\nimport { motion } from 'motion/react';";

const newContent = content.replace(target, replacement);
fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Added motion import");
