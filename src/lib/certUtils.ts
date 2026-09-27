import { CertQuestion, CertSpecialBrowserInfo, Group, Student } from '../types';

export function getStudentGroupIds(student: Student, groupDetails: Group[]): string[] {
  if (!student || !groupDetails) return [];
  return groupDetails
    .filter(g => {
      const matchTeacher = !g.teacherUsername || !student.teacherUsername || g.teacherUsername === student.teacherUsername;
      const matchGroup = student.group === g.name || (student.groups && student.groups.includes(g.name));
      return matchTeacher && matchGroup;
    })
    .map(g => g.id);
}

export function createDefaultCertQuestions(): CertQuestion[] {
  const questions: CertQuestion[] = [];

  // 1–32-savollar: 4 variantli (A, B, C, D)
  for (let i = 1; i <= 32; i++) {
    questions.push({
      id: `q${i}`,
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: -1,
      isOpenEnded: false
    });
  }

  // 33–35-savollar: 6 variantli (A–F)
  for (let i = 33; i <= 35; i++) {
    questions.push({
      id: `q${i}`,
      text: '',
      options: ['', '', '', '', '', ''],
      correctOptionIndex: -1,
      isOpenEnded: false
    });
  }

  // 36–45-savollar: ochiq javobli (a va b qism)
  for (let i = 36; i <= 45; i++) {
    questions.push({
      id: `q${i}`,
      text: '',
      options: [],
      correctOptionIndex: -1,
      isOpenEnded: true,
      subAnswers: [
        { label: 'a', correctAnswerText: '' },
        { label: 'b', correctAnswerText: '' }
      ]
    });
  }

  return questions;
}

export function getBrowserInfo(): CertSpecialBrowserInfo {
  if (typeof window === 'undefined') {
    return {
      browser: 'Noma\'lum',
      os: 'Noma\'lum',
      deviceType: 'Noma\'lum',
      userAgent: '',
      language: 'uz',
      screen: '',
      viewport: '',
      referrer: ''
    };
  }

  const ua = navigator.userAgent;
  let browser = 'Boshqa';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Boshqa';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const deviceType = isMobile ? 'Mobil' : 'Kompyuter';

  return {
    browser,
    os,
    deviceType,
    userAgent: ua,
    language: navigator.language || 'uz',
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    referrer: document.referrer || 'To\'g\'ridan-to\'g\'ri'
  };
}
