import fs from 'fs';
let content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

const heroImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTaB5C7dfqkHLNCBKt5Zajd6iFqKjOqR9tuwbpqzd4FpvALpnSC2AKJGkACWAeYpwuBVmN0e_dwFMlIuTph4fw9vaPrHu6HMtH66QWR46G3T20666_hSOA5Qfe7iHdBipFj27jL1-T_pYkTF1bTlIo9hxO1BSGlRM_ETT06ZqIAaQ6Ad1TzIscxFvhrj9ghp-H7lrxC5A3GUZ074FRu-NaG875amCH5K9uJaKTzA1hO8mfgisnj3_8';
const team1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBrLsUeyTzhqhPzdUGBFB3DfiUe2kIV-D5zRIKIH08uEp6CDaE86dJywgdkUh-g652UH1D427E8rHSistdcupfgX-8-tiZsYlPQY8lMMKbozvTn6Hxiz34RyDAkL8v1cCUAUUYBGpw7jWR7kSKUY6R-bppzvPptaTYIh18aWM_C57_sT3IYKFcD4rGZBZQf2U7X0FiN27JP9fHZKXM37QLcGW8E4pWfGv2HdQTFnkUUUGUMV18sQt_';
const team2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhPpDJjfCWMwtx7NuyaK7KripkK-8bgy1sQWsqZsij2t1SPYw5_-LtEuLnyKVH7DG11cWzcth1DYXQERJc3zsotbIjCADs5kYe5slfX9U8tNwmThBCH76I-Ia58UM1ZaQgckEL6kWYBUU5yY0Nc3dp2dYgqxxmN7wO_DaBDbp-qpbTj3Ihym0GAn9Ff5S2xIbJbpg6b7dIIo1T_NR282CfONfFXW8KFiYkWLCJnthQ-64CNaxZA3q7';
const team3 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA44RHNV6_OPf-FmbVjW3M3YmSo3Jc8SqS3COUw9x44TxtaQMNFYE7Hx326KjqJg8ASfN0fXsw-Nq9UE9TeVtsHDJ3paEQp0auB_qcHXVdwykMcBR2wOZwUaBvBT9ww0Snf36Cj6ZSTpDqxAF8MQA1cWP1CguxlJjR84JTts6fOLN9uxnnka_j6JqU8yS40qEH9zzP8xUnHoPP1uBhHYG1n9RaV0tBpArQYrFZuX_AMT92VVvsCcPgr';
const team4 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaMjpMXQWcBT0v2PWAPPRNTswMxjtptVkAgE-pECYj7255NvMHRN8MvwYZIPJS4NqP-LYIbrjAhVEUKhE7GNeK64cXSDRF1OI0ug364eh_aD917gbOaP1qZyGLfRSfbPM40ezAM3dQIohkghGcw0odCDpT6Sw55c6wQn_MJQSuOF06I-zTV9MM8SkwOqs3BfLwZbxXz60QW86R1AAxHy0bGeK0IyMfOycB7vSalIcnfB_y1tr6qGM9';
const mapImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMSvc9TxVqctJn0c7saXAKw-LQ8KQGt6azf-1VMFNr2CA1pmv2ovI6kvHxjSML5pPSIilhjGk4VGW1kB4VXtzQ1VAyXPELtbBsTVKtSmDkFI5742VijzkJXbXmfSli7yopa312BrWD9yqsiuTBZJq71JfPK3gEpDNiDqLSBH8au1LtcyJYaPQ6tBEWGkNKlkV2fn3ZNrmG6uLqABpV76A3Uvw5VRivWppA1eWQKuwQikDO6kLUSz9t';

content = content.replace('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000', heroImg);
content = content.replace('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600', team1);
content = content.replace('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', team2);
content = content.replace('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600', team3);
content = content.replace('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600', team4);
content = content.replace('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000', mapImg);

fs.writeFileSync('src/components/WelcomeScreen.tsx', content);
console.log('Updated images');
