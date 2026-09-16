import { useEffect, useRef, useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycby5QvN6TfF4qCdve9pKrAkan_69NKkbLiToEBAXAbEmBPrYo96NGS3f53-cU1jWlKld0Q/exec';

function PaperPlaneLogo() {
  return (
    <span className="paper-plane-logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M6.8 29.2 55.4 7.8c2.9-1.3 5.7 1.5 4.4 4.4L38.4 60.8c-1.4 3.1-5.9 2.5-6.4-.8l-2.6-17.3 15.8-20-20 15.8L7.9 35.9c-3.3-.5-4.2-5.3-1.1-6.7Z" />
      </svg>
    </span>
  );
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function ModernUiIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false,
    className: 'modern-ui-icon',
  };
  const paths = {
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3.5v3M16 3.5v3M3.5 9h17"/></>,
    assignment: <><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 3.5h6v3H9zM8.5 11.5l1.7 1.7 3.3-3.5M8.5 17h7"/></>,
    challenge: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="m12 12 7-7M16 5h3v3"/></>,
    attendance: <><circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.2 2.4 2.4 5.3-5.5"/></>,
    program: <><path d="M4 6.5 12 3l8 3.5-8 3.5Z"/><path d="M7 8.5v5.2c2.8 2.2 7.2 2.2 10 0V8.5M20 6.5v6"/></>,
    journal: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"/><path d="M8 4v16M11 9h5M11 13h5"/></>,
    score: <><path d="M4 19V9M10 19V5M16 19v-7M3 19.5h18"/><path d="m4 6 5-3 5 3 6-4"/></>,
    report: <><path d="M6 3.5h9l3 3v14H6Z"/><path d="M14.5 3.5V7H18M9 11h6M9 15h6"/></>,
    quest: <><path d="M12 3.5 14.5 9l6 .6-4.5 4 1.3 5.9L12 16.4l-5.3 3.1L8 13.6l-4.5-4L9.5 9Z"/></>,
  };
  return <svg {...common}>{paths[name] || paths.assignment}</svg>;
}

function getDirectPhotoUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  const driveMatch = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  return driveMatch
    ? `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w240`
    : url;
}

function toDirectDriveImage(value) {
  return getDirectPhotoUrl(value);
}

function getInitials(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'ST';
}


function StudentPhoto({ photoLink, fullName, className = '' }) {
  const photoUrl = getDirectPhotoUrl(photoLink);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  return (
    <span className={`student-photo ${className}`.trim()} aria-hidden="true">
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getInitials(fullName)}</span>
      )}
    </span>
  );
}


function StudentPersistentHeader({
  language,
  overview,
  studentFullName,
  activePage,
  onNavigate,
  accountOpen,
  onToggleAccount,
  onCloseAccount,
  onAccountSelect,
  onLogout,
}) {
  const isID = language === 'ID';
  const items = [
    { page: 'landing', icon: 'home', label: 'Home' },
    { page: 'full-report', icon: 'academic', label: isID ? 'Akademik' : 'Academic' },
    { page: 'checkin', icon: 'checkin', label: 'Check-in' },
    { page: 'badges', icon: 'badges', label: isID ? 'My Badges' : 'My Badges' },
  ];

  return (
    <header className="student-app-header">
      <div className="student-app-header-inner student-app-header-compact student-app-header-v10">
        <button
          className="student-dashboard-brand student-brand-button"
          type="button"
          onClick={() => onNavigate('landing')}
          aria-label={isID ? 'Kembali ke Home' : 'Back to Home'}
          title="Mr One Course"
        >
          <PaperPlaneLogo />
          <div className="student-brand-copy">
            <strong>Mr One Course</strong>
            <span>{isID ? 'Academic Suite Siswa' : 'Student Academic Suite'}</span>
          </div>
        </button>

        <nav
          className="student-header-navigation student-header-navigation-compact student-header-navigation-labeled"
          aria-label={isID ? 'Navigasi utama siswa' : 'Student main navigation'}
        >
          {items.map((item) => (
            <button
              key={item.page}
              className={`${activePage === item.page ? 'active' : ''} ${item.page === 'checkin' ? 'student-checkin-nav-main' : ''}`.trim()}
              type="button"
              onClick={() => {
                onCloseAccount();
                onNavigate(item.page);
              }}
              aria-current={activePage === item.page ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <span className={item.icon === 'checkin' ? 'student-header-nav-icon checkin' : 'student-header-nav-icon'}>
                <StudentNavIcon name={item.icon} />
              </span>
              <span className="student-header-nav-label">{item.label}</span>
            </button>
          ))}

          <div className="student-account-anchor student-account-header-slot student-profile-nav-slot">
            <button
              className={`student-header-profile-nav ${activePage === 'profile' || accountOpen ? 'active' : ''}`}
              type="button"
              onClick={onToggleAccount}
              aria-expanded={accountOpen}
              aria-label={isID ? 'Buka menu Profil' : 'Open Profile menu'}
              title={isID ? 'Profil' : 'Profile'}
            >
              <StudentPhoto
                photoLink={overview?.profile?.photoLink}
                fullName={studentFullName}
                className="student-account-photo"
              />
              <span className="student-header-nav-label">{isID ? 'Profil' : 'Profile'}</span>
            </button>

            {accountOpen && (
              <div className="student-account-popover" role="menu">
                <div className="student-account-popover-profile">
                  <StudentPhoto
                    photoLink={overview?.profile?.photoLink}
                    fullName={studentFullName}
                    className="student-account-popover-photo"
                  />
                  <div>
                    <strong>{studentFullName}</strong>
                    <span>{overview?.profile?.studentId || 'Student ID'}</span>
                  </div>
                </div>

                <button type="button" role="menuitem" onClick={() => onAccountSelect('profile')}>
                  <span>👤</span>
                  <div>
                    <strong>{isID ? 'Profil Saya' : 'My Profile'}</strong>
                    <small>{isID ? 'Data dan identitas siswa' : 'Student identity and details'}</small>
                  </div>
                </button>

                <button type="button" role="menuitem" onClick={() => onAccountSelect('payment')}>
                  <span>💳</span>
                  <div>
                    <strong>Tuition</strong>
                    <small>{isID ? 'Pembayaran dan riwayat les' : 'Payment and tuition history'}</small>
                  </div>
                </button>

                <button
                  className="student-account-signout"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseAccount();
                    onLogout();
                  }}
                >
                  <span className="signout-icon-wrap"><ModernSignOutIcon /></span>
                  <div>
                    <strong>{isID ? 'Keluar' : 'Sign Out'}</strong>
                    <small>{isID ? 'Keluar dari akun siswa' : 'Sign out of the student account'}</small>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {accountOpen && (
        <button
          className="student-account-backdrop"
          type="button"
          onClick={onCloseAccount}
          aria-label={isID ? 'Tutup menu akun' : 'Close account menu'}
        />
      )}
    </header>
  );
}

function formatStudentClassDate(value, isID) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(isID ? 'id-ID' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(date);
}

function CheckInQrIcon({ success = false }) {
  return (
    <svg className="checkin-qr-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="27" />
      <path d="M18 18h10v10H18zM36 18h10v10H36zM18 36h10v10H18z" />
      <path d="M37 36h4v4h-4zM43 36h4v10h-4zM35 43h6v4h-6zM31 31h5v5h-5z" />
      {success && <path className="checkin-qr-check" d="m25 33 5 5 10-12" />}
    </svg>
  );
}

const EXP_RANKS = [
  { min: 0, name: 'Newcomer' },
  { min: 500, name: 'Bronze Starter' },
  { min: 1000, name: 'Silver Explorer' },
  { min: 2000, name: 'Gold Achiever' },
  { min: 3500, name: 'Platinum Learner' },
  { min: 5500, name: 'Diamond Champion' },
  { min: 8000, name: 'English Hero' },
  { min: 11000, name: 'MOC Champion' },
  { min: 15000, name: 'MOC Legend' },
];

function getExpRank(totalExp) {
  const exp = Math.max(0, Number(totalExp || 0));
  let index = 0;
  EXP_RANKS.forEach((rank, rankIndex) => {
    if (exp >= rank.min) index = rankIndex;
  });
  const current = EXP_RANKS[index];
  const next = EXP_RANKS[index + 1] || null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(100, ((exp - current.min) / span) * 100) : 100;
  return { current, next, progress, remaining: next ? Math.max(0, next.min - exp) : 0 };
}

function ModernSignOutIcon() {
  return (
    <svg
      className="modern-signout-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 4H6.8A2.8 2.8 0 0 0 4 6.8v10.4A2.8 2.8 0 0 0 6.8 20H10" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function BadgeGlyph({ name }) {
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    className: 'badge-glyph',
  };

  const paths = {
    learner: <><path d="M24 5 40 11v12c0 10.6-6.6 16.5-16 20-9.4-3.5-16-9.4-16-20V11Z"/><path d="m16 24 5 5 11-12"/></>,
    perfect: <><circle cx="24" cy="24" r="17"/><path d="m15.5 24 5.5 5.5L33 17"/><path d="M24 7v5M24 36v5M7 24h5M36 24h5"/></>,
    task: <><rect x="10" y="8" width="28" height="33" rx="6"/><path d="M17 8h14v7H17zM17 24l4 4 9-10M17 34h14"/></>,
    challenge: <><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="9"/><path d="m24 24 14-14M32 10h6v6"/></>,
    learning: <><path d="M9 10h20a6 6 0 0 1 6 6v25H15a6 6 0 0 1-6-6Z"/><path d="M15 10v31M20 20h10M20 27h10"/></>,
    quiz: <><path d="M13 7h22v34H13z"/><path d="M19 15h10M19 23h10M19 31h7"/><circle cx="34" cy="33" r="6"/><path d="m31.5 33 2 2 3.5-4"/></>,
    project: <><path d="m24 6 4.2 10 10.8.8-8.2 7 2.6 10.7L24 29l-9.4 5.5 2.6-10.7-8.2-7 10.8-.8Z"/><path d="M17 40h14"/></>,
    allround: <><path d="M11 15 17 8l7 7 7-7 6 7-3 24H14Z"/><path d="M16 23h16M18 31h12"/></>,
    mic: <><rect x="18" y="6" width="12" height="23" rx="6"/><path d="M12 23a12 12 0 0 0 24 0M24 35v7M17 42h14"/></>,
  };
  return <svg {...common}>{paths[name] || paths.learner}</svg>;
}

function buildStudentBadges(overview, isID) {
  const monthly = overview?.experience?.monthly || {};
  const breakdown = overview?.experience?.breakdown || {};
  const attendance = overview?.monthly?.attendance || {};
  const assignments = Array.isArray(overview?.assignments) ? overview.assignments : [];
  const challenges = Array.isArray(overview?.challenges) ? overview.challenges : [];
  const learningActivities = Array.isArray(overview?.learningActivities) ? overview.learningActivities : [];

  const completedAssignmentsFromRows = assignments.filter((item) => Boolean(item.submission)).length;
  const completedChallengesFromRows = challenges.filter((item) => Boolean(item.result)).length;
  const assignmentsCompleted = Number(monthly.assignmentsCompleted ?? completedAssignmentsFromRows);
  const assignmentsTarget = Math.max(Number(monthly.assignmentsTarget || 0), assignments.length);
  const challengesCompleted = Number(monthly.challengesCompleted ?? completedChallengesFromRows);
  const challengesTarget = Math.max(Number(monthly.challengesTarget || 0), challenges.length);
  const attendancePresent = Number(attendance.present || 0);
  const learningTarget = learningActivities.filter((item) => item.title).length;
  const learningRead = learningActivities.filter((item) => item.readCompleted).length;

  const allAssignmentsDone = assignmentsTarget > 0 && assignmentsCompleted >= assignmentsTarget;
  const allChallengesDone = challengesTarget > 0 && challengesCompleted >= challengesTarget;
  const allLearningRead = learningTarget > 0 && learningRead >= learningTarget;

  return [
    {
      type: 'attendance', icon: 'learner',
      name: isID ? 'Pembelajar Setia' : 'Loyal Learner',
      requirement: isID ? 'Hadir minimal 4 pertemuan bulan ini' : 'Attend at least 4 meetings this month',
      current: Math.min(attendancePresent, 4), target: 4, expReward: 50,
      unlocked: attendancePresent >= 4, targetPage: 'attendance-record'
    },
    {
      type: 'attendance', icon: 'perfect',
      name: isID ? 'Kehadiran Sempurna' : 'Perfect Attendance',
      requirement: isID ? 'Hadir 8 dari 8 pertemuan' : 'Attend all 8 meetings',
      current: Math.min(attendancePresent, 8), target: 8, expReward: 150,
      unlocked: attendancePresent >= 8, targetPage: 'attendance-record'
    },
    {
      type: 'learning', icon: 'learning',
      name: isID ? 'Learning Explorer' : 'Learning Explorer',
      requirement: isID ? 'Baca seluruh ringkasan pembelajaran bulan ini' : 'Read every learning summary this month',
      current: learningRead, target: Math.max(learningTarget, 1), expReward: 25 * Math.max(learningTarget, 1),
      unlocked: allLearningRead, targetPage: 'journal'
    },
    {
      type: 'assignment', icon: 'task',
      name: isID ? 'Task Master' : 'Task Master',
      requirement: isID ? 'Selesaikan semua tugas bulan ini' : 'Complete all assignments this month',
      current: assignmentsCompleted, target: Math.max(assignmentsTarget, 1), expReward: 100,
      unlocked: allAssignmentsDone, targetPage: 'missions'
    },
    {
      type: 'challenge', icon: 'challenge',
      name: isID ? 'Program Champion' : 'Program Champion',
      requirement: isID ? 'Selesaikan semua tantangan sesuai program' : 'Complete every program challenge',
      current: challengesCompleted, target: Math.max(challengesTarget, 1), expReward: 150,
      unlocked: allChallengesDone, targetPage: 'missions'
    },
    {
      type: 'quiz', icon: 'quiz',
      name: isID ? 'Quiz Master' : 'Quiz Master',
      requirement: isID ? 'Raih EXP dari quiz atau tes' : 'Earn EXP from a quiz or test',
      current: Number(breakdown.quizTest || 0) > 0 ? 1 : 0, target: 1, expReward: 150,
      unlocked: Number(breakdown.quizTest || 0) > 0, targetPage: 'score'
    },
    {
      type: 'project', icon: 'project',
      name: isID ? 'Project Star' : 'Project Star',
      requirement: isID ? 'Selesaikan project program' : 'Complete a program project',
      current: Number(breakdown.project || 0) > 0 ? 1 : 0, target: 1, expReward: 200,
      unlocked: Number(breakdown.project || 0) > 0, targetPage: 'score'
    },
    {
      type: 'allround', icon: 'allround',
      name: isID ? 'MOC All-Rounder' : 'MOC All-Rounder',
      requirement: isID ? 'Tuntas tugas, tantangan, pembelajaran, dan hadir sempurna' : 'Complete assignments, challenges, learning, and perfect attendance',
      current: Number(allAssignmentsDone) + Number(allChallengesDone) + Number(allLearningRead) + Number(attendancePresent >= 8),
      target: 4, expReward: 250,
      unlocked: allAssignmentsDone && allChallengesDone && allLearningRead && attendancePresent >= 8,
      targetPage: 'badges'
    },
  ];
}
function getProgramReportConfig(program, overview, monthlyReport, isID) {
  const key = String(program || '').toLowerCase();
  const skillScores = monthlyReport?.skills || overview?.skillScores || {};
  const academicSummary = overview?.academicSummary || {};
  const assignments = academicSummary?.assignments || {};
  const challenges = Array.isArray(overview?.challenges) ? overview.challenges : [];
  const completedChallenges = challenges.filter((item) => item.result).length;
  const attendance = overview?.monthly?.attendance || {};
  const rawLevel = String(
    academicSummary?.levelAndScore?.cefrLevel ||
    overview?.program?.level ||
    ''
  ).trim();

  const safeScore = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  };

  if (key.includes('speaking')) {
    return {
      family: 'speaking',
      title: isID ? 'Laporan Perkembangan Speaking' : 'Speaking Progress Report',
      frameworkLabel: 'CEFR',
      level: rawLevel || (isID ? 'Menunggu asesmen' : 'Assessment pending'),
      focus: isID ? 'Komunikasi lisan dan pemahaman percakapan' : 'Oral communication and conversational comprehension',
      metrics: [
        { label: isID ? 'Speaking Performance' : 'Speaking Performance', value: safeScore(skillScores.speaking), suffix: '/100' },
        { label: isID ? 'Listening Support' : 'Listening Support', value: safeScore(skillScores.listening), suffix: '/100' },
        { label: isID ? 'Challenge Speaking' : 'Speaking Challenges', value: completedChallenges, suffix: `/${Math.max(challenges.length, 1)}` },
        { label: isID ? 'Kehadiran' : 'Attendance', value: attendance.percentage == null ? null : Number(attendance.percentage), suffix: '%' },
      ],
    };
  }

  if (key.includes('grammar')) {
    const learningActivities = Array.isArray(overview?.learningActivities) ? overview.learningActivities : [];
    const textCorpus = learningActivities
      .map((item) => `${item.title || ''} ${item.summary || ''} ${item.achievement || ''} ${item.activities || ''}`)
      .join(' ')
      .toLowerCase();

    let stageKey = 'partsOfSpeech';
    let stageLabel = 'Parts of Speech';
    let stageFocus = isID
      ? 'Memahami jenis kata, fungsi kata, dan penggunaannya sebagai fondasi pembentukan kalimat.'
      : 'Understanding word classes, their functions, and their use as the foundation of sentence building.';

    if (
      /\b(simple present|present continuous|present perfect|past simple|simple past|past continuous|past perfect|future|past future|16 tenses|tense)\b/.test(textCorpus)
    ) {
      stageKey = 'tenses';
      stageLabel = '16 Tenses';
      stageFocus = isID
        ? 'Memahami pola waktu, bentuk verb, dan penggunaan 16 tenses dalam konteks yang tepat.'
        : 'Understanding time reference, verb forms, and the contextual use of the 16 tenses.';
    }

    if (
      textCorpus.includes('grammar essential') ||
      textCorpus.includes('essential grammar') ||
      /\b(passive voice|conditional|reported speech|direct speech|indirect speech|gerund|infinitive|modal|degree of comparison|relative clause|subject.?verb agreement|question tag)\b/.test(textCorpus)
    ) {
      stageKey = 'grammarEssential';
      stageLabel = 'Grammar Essential';
      stageFocus = isID
        ? 'Menerapkan struktur grammar penting untuk membangun kalimat yang lebih akurat dan kompleks.'
        : 'Applying essential grammar structures to build more accurate and complex sentences.';
    }

    const stageMetrics = {
      partsOfSpeech: [
        { label: isID ? 'Pengenalan Jenis Kata' : 'Word Class Recognition', value: safeScore(skillScores.quizTest), suffix: '/100' },
        { label: isID ? 'Fungsi Kata' : 'Word Function', value: safeScore(skillScores.reading), suffix: '/100' },
        { label: isID ? 'Penerapan dalam Kalimat' : 'Sentence Application', value: safeScore(skillScores.writing), suffix: '/100' },
        { label: isID ? 'Ketepatan Grammar' : 'Grammar Accuracy', value: safeScore(skillScores.quizTest), suffix: '/100' },
      ],
      tenses: [
        { label: isID ? 'Pengenalan Pola Tense' : 'Tense Pattern Recognition', value: safeScore(skillScores.quizTest), suffix: '/100' },
        { label: isID ? 'Ketepatan Verb' : 'Verb Form Accuracy', value: safeScore(skillScores.writing), suffix: '/100' },
        { label: isID ? 'Pemilihan Tense' : 'Tense Selection', value: safeScore(skillScores.reading), suffix: '/100' },
        { label: isID ? 'Penerapan dalam Kalimat' : 'Sentence Application', value: safeScore(skillScores.writing), suffix: '/100' },
      ],
      grammarEssential: [
        { label: isID ? 'Struktur Kalimat' : 'Sentence Structure', value: safeScore(skillScores.writing), suffix: '/100' },
        { label: isID ? 'Ketepatan Grammar' : 'Grammar Accuracy', value: safeScore(skillScores.quizTest), suffix: '/100' },
        { label: isID ? 'Grammar dalam Konteks' : 'Grammar in Context', value: safeScore(skillScores.reading), suffix: '/100' },
        { label: isID ? 'Penerapan Tertulis' : 'Written Application', value: safeScore(skillScores.writing), suffix: '/100' },
      ],
    };

    return {
      family: 'grammar',
      title: isID ? 'Laporan Perkembangan Grammar' : 'Grammar Progress Report',
      frameworkLabel: isID ? 'Tahap Program' : 'Program Stage',
      level: stageLabel,
      focus: stageFocus,
      stageKey,
      stageLabel,
      metrics: stageMetrics[stageKey],
    };
  }

  if (key.includes('primary') || key.includes('kids')) {
    const primaryLevel = rawLevel || (isID ? 'Beginner' : 'Beginner');
    return {
      family: 'primary',
      title: isID ? 'Laporan Perkembangan Primary' : 'Primary Progress Report',
      frameworkLabel: isID ? 'Tahap Belajar' : 'Learning Stage',
      level: primaryLevel,
      focus: isID ? 'Fondasi bahasa Inggris: listening, speaking, reading, dan writing' : 'English foundations: listening, speaking, reading, and writing',
      metrics: [
        { label: 'Speaking', value: safeScore(skillScores.speaking), suffix: '/100' },
        { label: 'Listening', value: safeScore(skillScores.listening), suffix: '/100' },
        { label: 'Reading', value: safeScore(skillScores.reading), suffix: '/100' },
        { label: 'Writing', value: safeScore(skillScores.writing), suffix: '/100' },
      ],
    };
  }

  return {
    family: 'general',
    title: isID ? 'Laporan Perkembangan Akademik' : 'Academic Progress Report',
    frameworkLabel: 'CEFR',
    level: rawLevel || (isID ? 'Menunggu asesmen' : 'Assessment pending'),
    focus: isID ? 'Perkembangan kemampuan bahasa Inggris sesuai program' : 'English progress aligned with the active program',
    metrics: [
      { label: 'Speaking', value: safeScore(skillScores.speaking), suffix: '/100' },
      { label: 'Writing', value: safeScore(skillScores.writing), suffix: '/100' },
      { label: 'Reading', value: safeScore(skillScores.reading), suffix: '/100' },
      { label: 'Listening', value: safeScore(skillScores.listening), suffix: '/100' },
    ],
  };
}

function getProgramChallenge(program, isID) {
  const key = String(program || '').toLowerCase();
  if (key.includes('grammar')) return { name: isID ? 'Tantangan Grammar' : 'Grammar Challenge', prompt: isID ? 'Pilih dan susun struktur kalimat yang benar.' : 'Choose and arrange the correct sentence structure.', icon: '✎', action: isID ? 'Mulai latihan grammar' : 'Start grammar practice' };
  if (key.includes('speaking')) return { name: isID ? 'Tantangan Speaking' : 'Speaking Challenge', prompt: isID ? 'Ucapkan atau jawab prompt dengan jelas.' : 'Speak or answer the prompt clearly.', icon: '🎙', action: isID ? 'Ketuk mikrofon untuk berbicara' : 'Tap the microphone to speak' };
  if (key.includes('toefl')) return { name: 'TOEFL Challenge', prompt: isID ? 'Selesaikan soal structure, reading, atau listening.' : 'Complete a structure, reading, or listening question.', icon: '▤', action: isID ? 'Mulai latihan TOEFL' : 'Start TOEFL practice' };
  if (key.includes('primary') || key.includes('kids')) return { name: isID ? 'Tantangan Primary' : 'Primary Challenge', prompt: isID ? 'Selesaikan vocabulary, phonics, atau simple sentence.' : 'Complete a vocabulary, phonics, or simple-sentence task.', icon: '★', action: isID ? 'Mulai tantangan seru' : 'Start the fun challenge' };
  return { name: isID ? 'Tantangan Bahasa Inggris' : 'English Challenge', prompt: isID ? 'Selesaikan tantangan sesuai program Anda.' : 'Complete a challenge for your program.', icon: 'ABC', action: isID ? 'Mulai tantangan' : 'Start challenge' };
}

async function callApi(payload) {
  let response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error('Server Mr One Course tidak dapat dihubungi. Silakan coba kembali.');
  }

  const rawText = await response.text();
  let result;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch (error) {
    throw new Error('Respons server tidak dapat dibaca. Silakan coba kembali atau hubungi Admin Mr One Course.');
  }

  if (!response.ok || !result || typeof result !== 'object') {
    throw new Error('Server Mr One Course sedang tidak tersedia. Silakan coba kembali.');
  }

  if (!result.success) {
    throw new Error(
      result.message || 'Permintaan tidak berhasil.'
    );
  }

  return result;
}


function useEdgeSwipeBack(onBack, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    let tracking = false;
    let startX = 0;
    let startY = 0;

    function handleTouchStart(event) {
      const touch = event.touches?.[0];
      if (!touch) return;

      const target = event.target;
      const interactive = target?.closest?.('input, textarea, select, [contenteditable="true"]');
      if (interactive) return;

      // Mulai dari sisi kiri layar agar tidak mengganggu scroll/slider biasa.
      tracking = touch.clientX <= 42;
      startX = touch.clientX;
      startY = touch.clientY;
    }

    function handleTouchEnd(event) {
      if (!tracking) return;
      tracking = false;

      const touch = event.changedTouches?.[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      const isHorizontalBackSwipe =
        deltaX >= 72 &&
        Math.abs(deltaY) <= 70 &&
        deltaX > Math.abs(deltaY) * 1.25;

      if (isHorizontalBackSwipe) onBack();
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onBack]);
}

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordHelp, setShowForgotPasswordHelp] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('moc_language') || 'ID');
  const [theme, setTheme] = useState(() => localStorage.getItem('moc_theme') || 'dark');
  const [rememberMe, setRememberMe] = useState(true);
  const [studentAccessMode, setStudentAccessMode] = useState('');
  const [studentAccessLoading, setStudentAccessLoading] = useState(false);
  const [activationForm, setActivationForm] = useState({ studentId: '', fullName: '', dob: '', phone: '', username: '', password: '', confirmPassword: '' });
  const [registrationForm, setRegistrationForm] = useState({
    fullName: '', dob: '', school: '', grade: '', address: '', waStudent: '', waParent: '',
    program: '', classId: '', className: '', schedule: '', remainingQuota: '',
    bookPackage: false, idCard: false, idCardPhoto: null,
    transferBank: 'BCA', paymentProof: null
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [attendanceFollowUps, setAttendanceFollowUps] = useState([]);
  const [adminAttentionLists, setAdminAttentionLists] = useState({ absentMoreThanFour: [], unpaidAfterDaySeven: [], paymentWatchActive: false });
  const [ceoMonitoring, setCeoMonitoring] = useState(null);
  const [adminActivities, setAdminActivities] = useState([]);
  const [studentOverview, setStudentOverview] = useState(null);
  const [studentOverviewLoading, setStudentOverviewLoading] = useState(false);
  const [tutorOverview, setTutorOverview] = useState(null);
  const [tutorOverviewLoading, setTutorOverviewLoading] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPagination, setStudentPagination] = useState({
    page: 1,
    totalData: 0,
    totalPages: 1,
  });
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [paymentConfirmations, setPaymentConfirmations] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [paymentConfirmationsLoading, setPaymentConfirmationsLoading] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] =
    useState(false);
  const [message, setMessage] = useState('');
  const directCheckInRequest = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('checkin');

  function chooseLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    localStorage.setItem('moc_language', nextLanguage);
  }

  function chooseTheme(nextTheme) {
    setTheme(nextTheme);
    localStorage.setItem('moc_theme', nextTheme);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedToken =
      localStorage.getItem('moc_session_token') ||
      sessionStorage.getItem('moc_session_token');

    const savedUser =
      localStorage.getItem('moc_user') ||
      sessionStorage.getItem('moc_user');

    if (!savedToken || !savedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      setToken(savedToken);
      setUser(parsedUser);
      if (String(parsedUser.role).toLowerCase() === 'siswa') {
        loadStudentOverview(savedToken);
      } else if (String(parsedUser.role).toLowerCase() === 'tutor') {
        loadTutorOverview(savedToken);
      } else {
        loadDashboard(savedToken);
      }
    } catch {
      localStorage.removeItem('moc_session_token');
      localStorage.removeItem('moc_user');
      sessionStorage.removeItem('moc_session_token');
      sessionStorage.removeItem('moc_user');
    }
  }, []);

  async function loadDashboard(activeToken) {
    setDashboardLoading(true);
    setMessage('');

    try {
      const result = await callApi({
        action: 'getDashboard',
        token: activeToken,
      });

      setMetrics(result.metrics || {});
      setRecentPayments(result.recentPayments || []);
      setAttendanceFollowUps(result.attendanceFollowUps || []);
      setAdminAttentionLists(result.attentionLists || { absentMoreThanFour: [], unpaidAfterDaySeven: [], paymentWatchActive: false });
      setCeoMonitoring(result.ceoMonitoring || null);
      setAdminActivities(result.adminActivities || []);
    } catch (error) {
      setMessage(error.message);

      if (
        String(error.message)
          .toLowerCase()
          .includes('session')
      ) {
        handleLocalLogout();
      }
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    if (!user || !token) return undefined;
    const role = String(user.role || '').toLowerCase();
    if (role === 'siswa' || role === 'tutor') return undefined;

    function refreshDashboardOnFocus() {
      if (document.visibilityState === 'visible' && activePage === 'home') {
        loadDashboard(token);
      }
    }

    window.addEventListener('focus', refreshDashboardOnFocus);
    document.addEventListener('visibilitychange', refreshDashboardOnFocus);

    return () => {
      window.removeEventListener('focus', refreshDashboardOnFocus);
      document.removeEventListener('visibilitychange', refreshDashboardOnFocus);
    };
  }, [user, token, activePage]);

  async function loadStudentOverview(activeToken) {
    setStudentOverviewLoading(true);
    setMessage('');
    try {
      const result = await callApi({
        action: 'getStudentOverview',
        token: activeToken,
      });
      setStudentOverview(result);
    } catch (error) {
      const errorText = String(error.message || '');
      setMessage(errorText || (language === 'ID' ? 'Ringkasan akademik gagal dimuat.' : 'Academic overview could not be loaded.'));
      if (/session|sign in kembali|direset oleh manajemen/i.test(errorText)) {
        handleLocalLogout();
      }
    } finally {
      setStudentOverviewLoading(false);
    }
  }

  async function loadTutorOverview(activeToken) {
    setTutorOverviewLoading(true);
    setMessage('');
    try {
      const result = await callApi({ action: 'getTutorDashboard', token: activeToken });
      setTutorOverview(result);
    } catch (error) {
      setMessage(error.message || (language === 'ID' ? 'Dashboard tutor gagal dimuat.' : 'Tutor dashboard could not be loaded.'));
    } finally {
      setTutorOverviewLoading(false);
    }
  }

  function openManagementResetChat() {
    const managementWa = '628979933111';
    const accountId = username.trim() || (language === 'ID' ? '[Student ID / Username]' : '[Student ID / Username]');
    const text = language === 'ID'
      ? `Hallo Miss Vita, saya ingin mengajukan reset password akun belajar Mr One Course. Student ID/Username: ${accountId}. Mohon bantuannya. Terima kasih.`
      : `Hallo Miss Vita, I would like to request a password reset for my Mr One Course learning account. Student ID/Username: ${accountId}. Please assist me. Thank you.`;
    window.open(`https://wa.me/${managementWa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');

    if (!username.trim() || !password) {
      setMessage(language === 'ID' ? 'Username dan password wajib diisi.' : 'Username and password are required.');
      return;
    }

    if (API_URL.includes('TEMPELKAN_KEMBALI')) {
      setMessage(language === 'ID' ? 'Web App URL belum dimasukkan.' : 'The Web App URL has not been configured.');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await callApi({
        action: 'login',
        username: username.trim(),
        password,
      });

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      localStorage.removeItem('moc_session_token');
      localStorage.removeItem('moc_user');
      sessionStorage.removeItem('moc_session_token');
      sessionStorage.removeItem('moc_user');

      storage.setItem('moc_session_token', result.token);
      storage.setItem('moc_user', JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);
      setPassword('');

      if (String(result.user.role).toLowerCase() === 'siswa') {
        await loadStudentOverview(result.token);
      } else if (String(result.user.role).toLowerCase() === 'tutor') {
        await loadTutorOverview(result.token);
      } else {
        await loadDashboard(result.token);
      }
    } catch (error) {
      setMessage(
        error.message ||
          (language === 'ID' ? 'Tidak dapat terhubung ke server.' : 'Unable to connect to the server.')
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleDirectCheckInLogin(event) {
    event.preventDefault();
    setMessage('');

    if (!username.trim() || !password) {
      setMessage(language === 'ID' ? 'Student ID dan password wajib diisi.' : 'Student ID and password are required.');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await callApi({
        action: 'login',
        username: username.trim(),
        password,
      });

      if (String(result?.user?.role || '').toLowerCase() !== 'siswa') {
        throw new Error(language === 'ID' ? 'Check-in QR hanya dapat digunakan oleh akun siswa.' : 'QR check-in is only available for student accounts.');
      }

      localStorage.removeItem('moc_session_token');
      localStorage.removeItem('moc_user');
      sessionStorage.removeItem('moc_session_token');
      sessionStorage.removeItem('moc_user');

      localStorage.setItem('moc_session_token', result.token);
      localStorage.setItem('moc_user', JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);
      setPassword('');
      await loadStudentOverview(result.token);
    } catch (error) {
      setMessage(
        error.message ||
          (language === 'ID' ? 'Verifikasi siswa gagal. Silakan coba kembali.' : 'Student verification failed. Please try again.')
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleStudentAccess(event, mode) {
    event.preventDefault();
    setMessage('');
    const form = mode === 'activate' ? activationForm : registrationForm;
    if (mode === 'activate' && String(form.password || '').length < 8) {
      setMessage(language === 'ID' ? 'Password minimal 8 karakter.' : 'Password must be at least 8 characters.');
      return;
    }
    if (mode === 'activate' && form.password !== form.confirmPassword) {
      setMessage(language === 'ID' ? 'Konfirmasi password tidak sama.' : 'Password confirmation does not match.');
      return;
    }
    setStudentAccessLoading(true);
    try {
      const key = mode === 'activate' ? 'activation' : 'registration';
      const result = await callApi({ action: mode === 'activate' ? 'activateStudentAccount' : 'registerStudent', [key]: form });
      setMessage(result.message);
      if (mode === 'activate') {
        setStudentAccessMode('');
        setUsername(String(form.studentId || '').trim().toUpperCase());
      } else {
        setRegistrationSuccess({
          registrationId: result.registrationId || '',
          message: result.message || ''
        });
      }
    } catch (error) {
      setMessage(error.message || (language === 'ID' ? 'Permintaan tidak berhasil.' : 'Request failed.'));
    } finally {
      setStudentAccessLoading(false);
    }
  }

  async function loadRegistrations() {
    setRegistrationsLoading(true);
    setMessage('');
    try {
      const result = await callApi({ action: 'getStudentRegistrations', token });
      setRegistrations(result.registrations || []);
    } catch (error) {
      setMessage(error.message || 'Pendaftaran gagal dimuat.');
    } finally {
      setRegistrationsLoading(false);
    }
  }

  async function processRegistration(action, payload) {
    setRegistrationsLoading(true);
    setMessage('');
    try {
      const request = action === 'approveStudentRegistration'
        ? { action, token, approval: payload }
        : { action, token, rejection: payload };
      const result = await callApi(request);
      setMessage(result.message);
      await loadRegistrations();
      await loadDashboard(token);
    } catch (error) {
      setMessage(error.message || 'Pendaftaran gagal diproses.');
      setRegistrationsLoading(false);
    }
  }

  async function loadPaymentConfirmations() {
    setPaymentConfirmationsLoading(true); setMessage('');
    try { const result = await callApi({ action: 'getPaymentConfirmations', token }); setPaymentConfirmations(result.confirmations || []); setPaymentRecords(result.payments || []); }
    catch (error) { setMessage(error.message || 'Konfirmasi pembayaran gagal dimuat.'); }
    finally { setPaymentConfirmationsLoading(false); }
  }

  async function reviewPaymentConfirmation(review) {
    setPaymentConfirmationsLoading(true); setMessage('');
    try { const result = await callApi({ action: 'reviewPaymentConfirmation', token, review }); setMessage(result.message); await loadPaymentConfirmations(); await loadDashboard(token); }
    catch (error) { setMessage(error.message || 'Pembayaran gagal diproses.'); setPaymentConfirmationsLoading(false); }
  }

  async function addHistoricalPayment(payment) {
    setPaymentConfirmationsLoading(true); setMessage('');
    try { const result = await callApi({ action: 'addHistoricalPayment', token, payment }); setMessage(result.message); await loadPaymentConfirmations(); await loadDashboard(token); return true; }
    catch (error) { setMessage(error.message || 'Pembayaran lama gagal dicatat.'); setPaymentConfirmationsLoading(false); return false; }
  }

  async function updatePaymentFulfillment(fulfillment) {
    setPaymentConfirmationsLoading(true); setMessage('');
    try { const result = await callApi({ action: 'updatePaymentFulfillment', token, fulfillment }); setMessage(result.message); await loadPaymentConfirmations(); return true; }
    catch (error) { setMessage(error.message || 'Status penyerahan gagal diperbarui.'); setPaymentConfirmationsLoading(false); return false; }
  }

  async function loadStudents(search = '', page = 1) {
    setStudentsLoading(true);
    setMessage('');

    try {
      const result = await callApi({
        action: 'getStudents',
        token,
        search: search.trim(),
        page,
        limit: 20,
      });

      setStudents(result.students || []);
      setStudentPagination(
        result.pagination || {
          page: 1,
          totalData: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      setMessage(error.message || 'Data siswa gagal dimuat.');
    } finally {
      setStudentsLoading(false);
    }
  }

  function handleNavigate(page) {
    setActivePage(page);
    setMessage('');

    if (page === 'home') loadDashboard(token);
    if (page === 'students') {
      loadStudents(studentSearch, 1);
    }
    if (page === 'registrations') loadRegistrations();
    if (page === 'payment-confirmations') loadPaymentConfirmations();
  }

  function handleLocalLogout() {
    localStorage.removeItem('moc_session_token');
    localStorage.removeItem('moc_user');
    sessionStorage.removeItem('moc_session_token');
    sessionStorage.removeItem('moc_user');

    setToken('');
    setUser(null);
    setMetrics(null);
    setRecentPayments([]);
    setAttendanceFollowUps([]);
    setAdminAttentionLists({ absentMoreThanFour: [], unpaidAfterDaySeven: [], paymentWatchActive: false });
    setCeoMonitoring(null);
    setStudentOverview(null);
    setTutorOverview(null);
    setActivePage('home');
    setStudents([]);
    setStudentSearch('');
    setUsername('');
    setPassword('');
  }

  async function handleLogout() {
    try {
      if (token) {
        await callApi({
          action: 'logout',
          token,
        });
      }
    } catch {
      // Session lokal tetap dibersihkan.
    } finally {
      handleLocalLogout();
    }
  }

  if (user) {
    if (String(user.role).toLowerCase() === 'siswa') {
      return (
        <StudentMainMenu
          user={user}
          token={token}
          overview={studentOverview}
          overviewLoading={studentOverviewLoading}
          overviewMessage={message}
          onRefreshOverview={() => loadStudentOverview(token)}
          onLogout={handleLogout}
          language={language}
          theme={theme}
          onThemeChange={chooseTheme}
        />
      );
    }

    if (String(user.role).toLowerCase() === 'tutor') {
      return (
        <TutorDashboard
          user={user}
          token={token}
          overview={tutorOverview}
          loading={tutorOverviewLoading}
          message={message}
          onRefresh={() => loadTutorOverview(token)}
          onLogout={handleLogout}
          language={language}
          theme={theme}
          onThemeChange={chooseTheme}
        />
      );
    }

    return (
      <Dashboard
        user={user}
        metrics={metrics}
        dashboardLoading={dashboardLoading}
        recentPayments={recentPayments}
        attendanceFollowUps={attendanceFollowUps}
        attentionLists={adminAttentionLists}
        ceoMonitoring={ceoMonitoring}
        adminActivities={adminActivities}
        message={message}
        onRefresh={() => loadDashboard(token)}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigate={handleNavigate}
        students={students}
        studentsLoading={studentsLoading}
        studentSearch={studentSearch}
        onStudentSearchChange={setStudentSearch}
        onStudentSearch={() => loadStudents(studentSearch, 1)}
        studentPagination={studentPagination}
        onStudentPageChange={(page) =>
          loadStudents(studentSearch, page)
        }
        registrations={registrations}
        registrationsLoading={registrationsLoading}
        onApproveRegistration={(approval) => processRegistration('approveStudentRegistration', approval)}
        onRejectRegistration={(rejection) => processRegistration('rejectStudentRegistration', rejection)}
        onRefreshRegistrations={loadRegistrations}
        paymentConfirmations={paymentConfirmations}
        paymentRecords={paymentRecords}
        paymentConfirmationsLoading={paymentConfirmationsLoading}
        onReviewPayment={reviewPaymentConfirmation}
        onAddHistoricalPayment={addHistoricalPayment}
        onUpdateFulfillment={updatePaymentFulfillment}
        token={token}
        theme={theme}
        onThemeChange={chooseTheme}
      />
    );
  }

  if (directCheckInRequest) {
    return (
      <DirectCheckInAccess
        language={language}
        username={username}
        onUsernameChange={setUsername}
        password={password}
        onPasswordChange={setPassword}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((value) => !value)}
        loading={loginLoading}
        message={message}
        onSubmit={handleDirectCheckInLogin}
      />
    );
  }

  return (
    <main className="login-page reference-login-page">
      <section className="login-container reference-login-container">
        <div className="login-top-controls">
          <div className="language-switch" aria-label="Pilihan bahasa">
            <button
              type="button"
              className={language === 'EN' ? 'active' : ''}
              onClick={() => chooseLanguage('EN')}
            >
              EN
            </button>
            <button
              type="button"
              className={language === 'ID' ? 'active' : ''}
              onClick={() => chooseLanguage('ID')}
            >
              ID
            </button>
          </div>
          <div className="login-theme-icons" aria-label="Pilihan tema">
            <button type="button" aria-label="Tema gelap" title="Tema gelap" className={theme === 'dark' ? 'active' : ''} onClick={() => chooseTheme('dark')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 15.2A8.4 8.4 0 0 1 8.8 3.7a8.6 8.6 0 1 0 11.5 11.5Z"/></svg>
            </button>
            <button type="button" aria-label="Tema terang" title="Tema terang" className={theme === 'light' ? 'active' : ''} onClick={() => chooseTheme('light')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </button>
          </div>
        </div>

        <div className="login-brand">
          <div className="login-logo-frame" aria-label="Mr One Course">
            <PaperPlaneLogo />
          </div>
          <h1 className="login-brand-name">Mr One Course</h1>
          <p>ACADEMIC SUITE</p>
          <small className="login-brand-tagline">{language === 'ID' ? 'Belajar, berkembang, dan pantau progres dalam satu tempat.' : 'Learn, grow, and track progress in one place.'}</small>
        </div>

        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-card-heading">
            <h2>{language === 'ID' ? 'Selamat Datang Kembali' : 'Welcome Back'}</h2>
            <p>
              {language === 'ID'
                ? 'Masuk untuk melanjutkan ke dashboard Anda'
                : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          <label className="form-field">
            <span>{language === 'ID' ? 'Username / ID Pengguna' : 'Username / User ID'}</span>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder={language === 'ID' ? 'Masukkan username Anda' : 'Enter your username'}
              autoComplete="username"
            />
          </label>

          <label className="form-field">
            <span>Password</span>

            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder={language === 'ID' ? 'Masukkan password' : 'Enter your password'}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? language === 'ID' ? 'Sembunyikan' : 'Hide'
                  : language === 'ID' ? 'Lihat' : 'Show'}
              </button>
            </div>
          </label>

          <div className="login-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>{language === 'ID' ? 'Ingat Saya' : 'Remember Me'}</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setMessage('');
                setShowForgotPasswordHelp((value) => !value);
              }}
            >
              {language === 'ID' ? 'Lupa Password?' : 'Forgot Password?'}
            </button>
          </div>

          {showForgotPasswordHelp && (
            <div className="forgot-password-management-card">
              <div>
                <small>{language === 'ID' ? 'RESET PASSWORD' : 'PASSWORD RESET'}</small>
                <strong>{language === 'ID' ? 'Hubungi Manajemen — Miss Vita' : 'Contact Management — Miss Vita'}</strong>
                <p>
                  {language === 'ID'
                    ? 'Permintaan reset password ditangani langsung oleh Manajemen. Masukkan Student ID/username di kolom atas agar pesan WhatsApp terisi lebih jelas.'
                    : 'Password reset requests are handled directly by Management. Enter your Student ID/username above so the WhatsApp message is clearer.'}
                </p>
              </div>
              <button type="button" onClick={openManagementResetChat}>
                💬 {language === 'ID' ? 'Chat Manajemen' : 'Chat Management'}
              </button>
              <span>Miss Vita • 08979933111</span>
            </div>
          )}

          {message && (
            <div className="error-message">
              {message}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading
              ? language === 'ID' ? 'Sedang menghubungkan...' : 'Signing in...'
              : language === 'ID' ? 'Masuk' : 'Sign In'}
          </button>
          <p className="security-note">
            🔒 {language === 'ID'
              ? 'Akun Anda dilindungi oleh sistem keamanan Mr One Course.'
              : 'Your account is protected by Mr One Course security.'}
          </p>
        </form>
        <div className="student-access-links student-access-links-v10 student-access-primary-actions">
          <button type="button" className="student-access-register-button" onClick={() => { setMessage(''); setStudentAccessMode('register'); }}>
            {language === 'ID' ? 'DAFTAR SEKARANG' : 'REGISTER NOW'}
          </button>
          <div className="student-account-managed-note">
            <strong>{language === 'ID' ? 'Akun siswa diaktifkan oleh Manajemen' : 'Student accounts are activated by Management'}</strong>
            <span>{language === 'ID' ? 'Siswa yang sudah menerima Student ID dan password awal dapat langsung Sign In.' : 'Students who have received a Student ID and initial password can sign in directly.'}</span>
          </div>
        </div>
        {studentAccessMode && <StudentAccessModal mode={studentAccessMode} language={language} activationForm={activationForm} setActivationForm={setActivationForm} registrationForm={registrationForm} setRegistrationForm={setRegistrationForm} registrationSuccess={registrationSuccess} loading={studentAccessLoading} message={message} onClose={() => { setStudentAccessMode(''); setRegistrationSuccess(null); setMessage(''); }} onSubmit={handleStudentAccess} />}

        <footer className="moc-copyright-footer">
          <span>© 2026 Mr One Course Academic Suite</span>
          <small>Designed &amp; Developed by Novita Rohmawati, S.Pd., Gr.</small>
        </footer>
      </section>
    </main>
  );
}

function DirectCheckInAccess({ language, username, onUsernameChange, password, onPasswordChange, showPassword, onTogglePassword, loading, message, onSubmit }) {
  const isID = language === 'ID';

  return (
    <main className="student-checkin-page direct-checkin-access-page">
      <header>
        <button
          type="button"
          onClick={() => { window.location.href = window.location.origin + window.location.pathname; }}
          aria-label={isID ? 'Kembali ke halaman utama' : 'Back to main page'}
        >
          ←
        </button>
        <div>
          <span>MR ONE COURSE</span>
          <h1>{isID ? 'Check-in Kehadiran' : 'Attendance Check-in'}</h1>
        </div>
      </header>

      <section className="checkin-card ready direct-checkin-access-card">
        <div className="checkin-icon"><CheckInQrIcon /></div>
        <span className="checkin-label">QR + GPS</span>
        <h2>{isID ? 'Verifikasi Siswa' : 'Student Verification'}</h2>
        <p>
          {isID
            ? 'Masukkan Student ID dan password. Setelah berhasil, halaman akan langsung menjalankan Check-in dan meminta izin lokasi.'
            : 'Enter your Student ID and password. After verification, Check-in will start automatically and request location access.'}
        </p>

        <form className="direct-checkin-access-form" onSubmit={onSubmit}>
          <label>
            <span>Student ID</span>
            <input
              type="text"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="MOC..."
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <div className="direct-checkin-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={isID ? 'Masukkan password' : 'Enter password'}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={onTogglePassword}>
                {showPassword ? (isID ? 'Sembunyikan' : 'Hide') : (isID ? 'Lihat' : 'Show')}
              </button>
            </div>
          </label>

          {message && <div className="direct-checkin-access-error">{message}</div>}

          <button className="checkin-primary" type="submit" disabled={loading}>
            {loading
              ? (isID ? 'Memverifikasi...' : 'Verifying...')
              : (isID ? 'LANJUT KE CHECK-IN' : 'CONTINUE TO CHECK-IN')}
          </button>
        </form>

        <small className="direct-checkin-access-note">
          {isID ? 'Jika akun masih tersimpan di perangkat ini, scan QR berikutnya akan langsung membuka Check-in.' : 'If your account remains saved on this device, the next QR scan will open Check-in directly.'}
        </small>
      </section>
    </main>
  );
}

function StudentAccessModal({ mode, language, activationForm, setActivationForm, registrationForm, setRegistrationForm, registrationSuccess, loading, message, onClose, onSubmit }) {
  const isID = language === 'ID';
  const isActivation = mode === 'activate';
  const form = isActivation ? activationForm : registrationForm;
  const [registrationStep, setRegistrationStep] = useState(1);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const update = (field, value) => {
    if (isActivation) {
      if (field === 'studentId') {
        const normalizedId = String(value || '').toUpperCase().replace(/\s+/g, '');
        setActivationForm({ ...form, studentId: normalizedId, username: normalizedId });
        return;
      }
      setActivationForm({ ...form, [field]: value });
      return;
    }
    setRegistrationForm({ ...form, [field]: value });
  };

  useEffect(() => {
    if (isActivation || !form.program) {
      setScheduleOptions([]);
      setScheduleError('');
      return;
    }
    let cancelled = false;
    setScheduleLoading(true);
    setScheduleError('');
    callApi({ action: 'getRegistrationSchedules', program: form.program })
      .then((result) => {
        if (!cancelled) {
          setScheduleOptions(result.schedules || []);
          setScheduleError('');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setScheduleOptions([]);
          setScheduleError(error.message || 'Jadwal gagal dimuat dari Master Jadwal.');
        }
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false);
      });
    return () => { cancelled = true; };
  }, [isActivation, form.program]);

  function selectProgram(value) {
    setScheduleError('');
    setRegistrationForm({
      ...form,
      program: value,
      classId: '',
      className: '',
      schedule: '',
      remainingQuota: '',
      bookPackage: false
    });
    setRegistrationStep(2);
  }

  function selectSchedule(classId) {
    const selected = scheduleOptions.find((item) => item.classId === classId);
    if (!selected) {
      setRegistrationForm({
        ...form,
        classId: '',
        className: '',
        schedule: '',
        remainingQuota: ''
      });
      return;
    }

    setRegistrationForm({
      ...form,
      classId: selected.classId,
      className: selected.className || '',
      schedule: selected.label,
      remainingQuota: selected.remaining ?? ''
    });
  }

  function goToProgramStep() {
    if (!form.fullName || !form.school || !form.grade || !form.waParent) {
      window.alert(isID ? 'Lengkapi Nama Lengkap, Sekolah, Kelas, dan WA Orang Tua terlebih dahulu.' : 'Complete Full Name, School, Grade, and Parent WhatsApp first.');
      return;
    }
    setRegistrationStep(2);
  }

  function goToPaymentStep() {
    if (!form.program || !form.classId || !form.schedule) {
      window.alert(isID ? 'Pilih program dan jadwal terlebih dahulu.' : 'Choose a program and schedule first.');
      return;
    }
    setRegistrationStep(3);
  }

  function encodeRegistrationFile(file, field) {
    if (!file) {
      update(field, null);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      window.alert(isID ? 'Ukuran file maksimal 4 MB.' : 'Maximum file size is 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update(field, {
      fileName: file.name,
      mimeType: file.type,
      base64: String(reader.result || '')
    });
    reader.readAsDataURL(file);
  }

  async function copyAccount(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(isID ? 'Nomor rekening disalin.' : 'Account number copied.');
      setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      window.prompt(isID ? 'Salin nomor rekening:' : 'Copy account number:', value);
    }
  }

  const showBook = /^(primary|grammar)$/i.test(String(form.program || '').trim());
  const tuitionAmount = 150000;
  const bookAmount = form.bookPackage && showBook ? 150000 : 0;
  const idCardAmount = form.idCard ? 20000 : 0;
  const totalAmount = tuitionAmount + bookAmount + idCardAmount;

  if (!isActivation && registrationSuccess) {
    return (
      <div className="student-access-overlay" role="dialog" aria-modal="true">
        <section className="student-access-modal registration-success-modal">
          <header>
            <div><span>{isID ? 'PENDAFTARAN TERKIRIM' : 'REGISTRATION SENT'}</span><h2>{isID ? 'Menunggu Verifikasi Admin' : 'Waiting for Admin Verification'}</h2></div>
            <button type="button" onClick={onClose} aria-label="Close">×</button>
          </header>
          <div className="registration-success-content">
            <div className="registration-success-icon">✓</div>
            <h3>{isID ? 'Data dan bukti pembayaran sudah diterima.' : 'Your data and payment proof have been received.'}</h3>
            <p>{registrationSuccess.message}</p>
            {registrationSuccess.registrationId && <div className="registration-success-id"><span>Registration ID</span><strong>{registrationSuccess.registrationId}</strong></div>}
            <div className="registration-success-next">
              <strong>{isID ? 'Tahap berikutnya' : 'Next step'}</strong>
              <p>{isID ? 'Admin akan memeriksa data, pembayaran, pilihan kelas, dan foto ID Card. Setelah disetujui, Manajemen akan menyiapkan akun dan mengirim Student ID beserta password awal.' : 'Admin will review your data, payment, class selection, and ID Card photo. Once approved, Management will prepare your account and send your Student ID with an initial password.'}</p>
            </div>
            <div className="registration-confirmation-contact">
              <strong>{isID ? 'Konfirmasi Form Pendaftaran' : 'Confirm Registration Form'}</strong>
              <p>{isID ? 'Setelah form terkirim, konfirmasikan ke tim Mr One Course agar pendaftaran dapat segera ditindaklanjuti.' : 'After submitting the form, confirm it with the Mr One Course team so the registration can be followed up.'}</p>

              <div className="registration-contact-options">
                <button type="button" className="registration-contact-disabled" disabled>
                  <span>Admin 1 — Miss Sita</span>
                  <small>+62 895-0486-2626 • {isID ? 'Saat ini tidak tersedia' : 'Currently unavailable'}</small>
                </button>

                <a
                  className="registration-contact-active"
                  href={`https://wa.me/628979933111?text=${encodeURIComponent(
                    `Halo Teacher Vita, saya ${form.fullName || 'pendaftar'} sudah mengirim form pendaftaran Mr One Course.${registrationSuccess.registrationId ? `\nRegistration ID: ${registrationSuccess.registrationId}` : ''} Mohon konfirmasi penerimaannya. Terima kasih.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{isID ? 'Konfirmasi ke Manajemen' : 'Confirm with Management'}</span>
                  <small>Teacher Vita • 08979933111</small>
                </a>
              </div>

              <small className="registration-contact-note">
                {isID ? 'Sementara, konfirmasi pendaftaran diarahkan ke Manajemen karena Admin 1 sedang tidak tersedia.' : 'For now, registration confirmation is directed to Management because Admin 1 is unavailable.'}
              </small>
            </div>

            <button type="button" className="student-access-submit" onClick={onClose}>{isID ? 'Selesai' : 'Done'}</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="student-access-overlay" role="dialog" aria-modal="true">
      <section className={`student-access-modal ${!isActivation ? 'registration-checkout-modal' : ''}`}>
        <header>
          <div>
            <span>{isActivation ? (isID ? 'SISWA TERDAFTAR' : 'REGISTERED STUDENT') : (isID ? 'PENDAFTARAN' : 'REGISTRATION')}</span>
            <h2>{isActivation ? (isID ? 'Aktivasi Akun Belajar Siswa' : 'Activate Student Account') : (isID ? 'Daftar Siswa Baru' : 'New Student Registration')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        {!isActivation && (
          <div className="registration-stepper registration-stepper-three">
            <span className={registrationStep === 1 ? 'active' : registrationStep > 1 ? 'done' : ''}><b>1</b>{isID ? 'Data Siswa' : 'Student Data'}</span>
            <i />
            <span className={registrationStep === 2 ? 'active' : registrationStep > 2 ? 'done' : ''}><b>2</b>{isID ? 'Program & Jadwal' : 'Program & Schedule'}</span>
            <i />
            <span className={registrationStep === 3 ? 'active' : ''}><b>3</b>{isID ? 'Pembayaran' : 'Payment'}</span>
          </div>
        )}

        <form onSubmit={(event) => onSubmit(event, mode)}>
          {isActivation ? (
            <>
              <label><span>Student ID</span><input value={form.studentId} onChange={(event) => update('studentId', event.target.value)} placeholder="Contoh: MOC002" autoCapitalize="characters" required /></label>
              <label><span>{isID ? 'Nama lengkap sesuai Data Siswa' : 'Full name in student records'}</span><input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} autoComplete="name" required /></label>
              <label><span>{isID ? 'Nomor WA aktif siswa/orang tua' : 'Active student/parent WhatsApp number'}</span><input inputMode="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder={isID ? 'Opsional — untuk melengkapi data kontak siswa lama' : 'Optional — used to complete existing student contact data'} /></label>
              <label><span>Username</span><input value={form.studentId} readOnly title={isID ? 'Username otomatis sama dengan Student ID.' : 'Username automatically matches Student ID.'} required /><small className="activation-field-note">{isID ? 'Username dikunci otomatis berdasarkan Student ID.' : 'Username is automatically locked to the Student ID.'}</small></label>
              <div className="student-access-grid">
                <label><span>Password</span><input type="password" minLength="8" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete="new-password" required /></label>
                <label><span>{isID ? 'Konfirmasi password' : 'Confirm password'}</span><input type="password" minLength="8" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} autoComplete="new-password" required /></label>
              </div>
            </>
          ) : registrationStep === 1 ? (
            <>
              <div className="student-access-grid">
                <label><span>{isID ? 'Nama lengkap' : 'Full name'}</span><input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} required /></label>
                <label><span>{isID ? 'Tanggal lahir' : 'Date of birth'}</span><input type="date" value={form.dob} onChange={(event) => update('dob', event.target.value)} /></label>
                <label><span>{isID ? 'Sekolah' : 'School'}</span><input value={form.school} onChange={(event) => update('school', event.target.value)} required /></label>
                <label><span>{isID ? 'Kelas' : 'Grade'}</span><input value={form.grade} onChange={(event) => update('grade', event.target.value)} required /></label>
                <label><span>{isID ? 'WA Siswa' : 'Student WhatsApp'}</span><input inputMode="tel" value={form.waStudent} onChange={(event) => update('waStudent', event.target.value)} /></label>
                <label><span>{isID ? 'WA Orang Tua' : 'Parent WhatsApp'}</span><input inputMode="tel" value={form.waParent} onChange={(event) => update('waParent', event.target.value)} required /></label>
              </div>

              <label><span>{isID ? 'Alamat' : 'Address'}</span><textarea rows="2" value={form.address} onChange={(event) => update('address', event.target.value)} /></label>

              <div className="registration-account-note">
                <strong>{isID ? 'Data siswa terlebih dahulu' : 'Student data first'}</strong>
                <p>{isID ? 'Setelah data siswa lengkap, lanjutkan untuk memilih program dan jadwal kelas.' : 'After completing student data, continue to choose the program and class schedule.'}</p>
              </div>

              <button type="button" className="student-access-submit" onClick={goToProgramStep}>
                {isID ? 'KIRIM DATA' : 'SUBMIT DATA'}
              </button>
            </>
          ) : registrationStep === 2 ? (
            <>
              <div className="registration-order-summary registration-data-summary">
                <div><span>{isID ? 'Nama' : 'Name'}</span><strong>{form.fullName}</strong></div>
                <div><span>{isID ? 'Sekolah / Kelas' : 'School / Grade'}</span><strong>{form.school} • {form.grade}</strong></div>
                <button type="button" onClick={() => setRegistrationStep(1)}>{isID ? 'Ubah Data' : 'Edit Data'}</button>
              </div>

              <div className="student-access-grid registration-program-grid">
                <label>
                  <span>{isID ? 'Pilih Program' : 'Choose Program'}</span>
                  <select value={form.program} onChange={(event) => selectProgram(event.target.value)} required>
                    <option value="">—</option>
                    <option>Primary</option>
                    <option>Grammar</option>
                    <option>Speaking</option>
                  </select>
                </label>

                <label>
                  <span>{isID ? 'Pilih Jadwal' : 'Choose Schedule'}</span>
                  <select value={form.classId} onChange={(event) => selectSchedule(event.target.value)} disabled={!form.program || scheduleLoading} required>
                    <option value="">
                      {scheduleLoading
                        ? (isID ? 'Memuat jadwal dari Master Jadwal...' : 'Loading schedules from Master Jadwal...')
                        : form.program
                          ? (isID ? 'Pilih jadwal yang tersedia' : 'Choose an available schedule')
                          : (isID ? 'Pilih program terlebih dahulu' : 'Choose a program first')}
                    </option>
                    {scheduleOptions.map((item) => (
                      <option key={item.classId} value={item.classId}>
                        {item.label}{Number.isFinite(Number(item.remaining)) ? ` • Sisa ${item.remaining} slot` : ''}
                      </option>
                    ))}
                  </select>
                  {scheduleError && (
                    <small className="registration-schedule-note registration-schedule-error">
                      {isID ? `Gagal memuat jadwal: ${scheduleError}` : `Unable to load schedules: ${scheduleError}`}
                    </small>
                  )}
                  {form.program && !scheduleLoading && !scheduleError && scheduleOptions.length === 0 && (
                    <small className="registration-schedule-note">
                      {isID ? 'Belum ada jadwal aktif untuk program ini di Master Jadwal.' : 'No active schedule is available for this program in Master Jadwal.'}
                    </small>
                  )}
                </label>
              </div>

              {form.classId && (
                <div className="registration-selected-class">
                  <div>
                    <span>{isID ? 'Kelas Terpilih' : 'Selected Class'}</span>
                    <strong>{form.className || form.classId}</strong>
                  </div>
                  <div>
                    <span>Class ID</span>
                    <strong>{form.classId}</strong>
                  </div>
                  <div>
                    <span>{isID ? 'Sisa Kuota' : 'Remaining Slots'}</span>
                    <strong>{form.remainingQuota === '' ? '—' : `${form.remainingQuota} slot`}</strong>
                  </div>
                </div>
              )}

              <div className="registration-account-note">
                <strong>{isID ? 'Periksa pilihan kelas sebelum melanjutkan' : 'Review your class selection before continuing'}</strong>
                <p>{isID ? 'Pastikan program dan jadwal yang dipilih sudah sesuai. Class ID akan ditentukan otomatis berdasarkan jadwal yang dipilih.' : 'Make sure the selected program and schedule are correct. The Class ID is assigned automatically from the selected schedule.'}</p>
              </div>

              <div className="registration-navigation-actions">
                <button type="button" className="registration-back-button" onClick={() => setRegistrationStep(1)}>
                  {isID ? '← KEMBALI KE DATA SISWA' : '← BACK TO STUDENT DATA'}
                </button>
                <button type="button" className="student-access-submit" disabled={!form.program || !form.classId || !form.schedule || scheduleLoading} onClick={goToPaymentStep}>
                  {isID ? 'SIMPAN PROGRAM & LANJUT PEMBAYARAN' : 'SAVE PROGRAM & CONTINUE TO PAYMENT'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="registration-order-summary">
                <div><span>{isID ? 'Program' : 'Program'}</span><strong>{form.program}</strong></div>
                <div><span>{isID ? 'Jadwal' : 'Schedule'}</span><strong>{form.schedule}</strong></div>
                <button type="button" onClick={() => setRegistrationStep(2)}>{isID ? 'Ubah' : 'Change'}</button>
              </div>

              <div className="registration-checkout-section">
                <div className="registration-checkout-heading"><span>01</span><div><strong>{isID ? 'Pembayaran Les Pertama' : 'First Tuition Payment'}</strong><small>{isID ? 'Wajib untuk pendaftaran baru' : 'Required for new registration'}</small></div></div>
                <label className="registration-product-line mandatory">
                  <input type="checkbox" checked readOnly />
                  <div><strong>{isID ? 'Les Bulanan' : 'Monthly Tuition'}</strong><small>8 meetings • 60 minutes</small></div>
                  <b>{formatRupiah(tuitionAmount)}</b>
                </label>

                {showBook && (
                  <label className="registration-product-line">
                    <input type="checkbox" checked={!!form.bookPackage} onChange={(event) => update('bookPackage', event.target.checked)} />
                    <div><strong>{isID ? 'Paket Buku Program' : 'Program Book Package'}</strong><small>{isID ? `Tersedia untuk program ${form.program}` : `Available for ${form.program}`}</small></div>
                    <b>{formatRupiah(150000)}</b>
                  </label>
                )}

                <label className={`registration-product-line id-card-option ${form.idCard ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!form.idCard}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setRegistrationForm({
                        ...form,
                        idCard: checked,
                        idCardPhoto: checked ? form.idCardPhoto : null
                      });
                    }}
                  />
                  <div>
                    <strong>ID Card Siswa</strong>
                    <small>{isID ? 'Klik untuk membuat ID Card dan upload foto.' : 'Select to create an ID Card and upload a photo.'}</small>
                  </div>
                  <b>{formatRupiah(20000)}</b>
                </label>

                {form.idCard && (
                  <label className="registration-file-upload">
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => encodeRegistrationFile(event.target.files?.[0], 'idCardPhoto')} required />
                    <span>📷</span>
                    <strong>{form.idCardPhoto?.fileName || (isID ? 'Upload foto untuk ID Card' : 'Upload ID Card photo')}</strong>
                    <small>{isID ? 'Foto ini juga akan digunakan sebagai foto profil di aplikasi. JPG/PNG/WEBP • Maks. 4 MB' : 'This photo will also be used as your profile photo in the app. JPG/PNG/WEBP • Max. 4 MB'}</small>
                  </label>
                )}
              </div>

              <div className="registration-checkout-section">
                <div className="registration-checkout-heading"><span>02</span><div><strong>{isID ? 'Transfer Pembayaran' : 'Payment Transfer'}</strong><small>{isID ? 'Pilih salah satu rekening berikut' : 'Choose one of the accounts below'}</small></div></div>

                <div className="registration-bank-list">
                  <button type="button" className={form.transferBank === 'BCA' ? 'selected' : ''} onClick={() => update('transferBank', 'BCA')}>
                    <div><span>BCA</span><strong>1912628901</strong><small>Muhammad Mirwan Salmani</small></div>
                    <em onClick={(event) => { event.stopPropagation(); copyAccount('1912628901'); }}>{isID ? 'Salin' : 'Copy'}</em>
                  </button>
                  <button type="button" className={form.transferBank === 'SeaBank' ? 'selected' : ''} onClick={() => update('transferBank', 'SeaBank')}>
                    <div><span>SeaBank</span><strong>901182598278</strong><small>Muhammad Mirwan Salmani, S.Pd.</small></div>
                    <em onClick={(event) => { event.stopPropagation(); copyAccount('901182598278'); }}>{isID ? 'Salin' : 'Copy'}</em>
                  </button>
                  <button type="button" className={form.transferBank === 'BPD Kaltimtara' ? 'selected' : ''} onClick={() => update('transferBank', 'BPD Kaltimtara')}>
                    <div><span>BPD Kaltimtara</span><strong>1022075914</strong><small>Muhammad Mirwan Salmani</small></div>
                    <em onClick={(event) => { event.stopPropagation(); copyAccount('1022075914'); }}>{isID ? 'Salin' : 'Copy'}</em>
                  </button>
                  <button type="button" className={form.transferBank === 'GoPay / DANA' ? 'selected' : ''} onClick={() => update('transferBank', 'GoPay / DANA')}>
                    <div><span>GoPay / DANA</span><strong>085249684865</strong><small>Muhammad Mirwan Salmani</small></div>
                    <em onClick={(event) => { event.stopPropagation(); copyAccount('085249684865'); }}>{isID ? 'Salin' : 'Copy'}</em>
                  </button>
                </div>
                {copyMessage && <div className="registration-copy-message">{copyMessage}</div>}

                <div className="registration-total">
                  <span>{isID ? 'Total pembayaran' : 'Total payment'}</span>
                  <strong>{formatRupiah(totalAmount)}</strong>
                </div>

                <label className="registration-file-upload payment-proof">
                  <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => encodeRegistrationFile(event.target.files?.[0], 'paymentProof')} required />
                  <span>↑</span>
                  <strong>{form.paymentProof?.fileName || (isID ? 'Upload bukti transfer' : 'Upload transfer proof')}</strong>
                  <small>JPG, PNG, WEBP, PDF • Maks. 4 MB</small>
                </label>
              </div>

              <div className="registration-checkout-note">
                <strong>{isID ? 'Setelah dikirim' : 'After submission'}</strong>
                <p>{isID ? 'Admin akan memverifikasi data dan pembayaran. Setelah disetujui, Manajemen akan menyiapkan akun dan mengirim Student ID beserta password awal.' : 'Admin will verify your data and payment. Once approved, Management will prepare your account and send your Student ID with an initial password.'}</p>
              </div>
            </>
          )}

          {message && <div className="error-message">{message}</div>}

          {(isActivation || registrationStep === 3) && (
            isActivation ? (
              <button className="student-access-submit" type="submit" disabled={loading}>
                {loading ? (isID ? 'Memproses...' : 'Processing...') : (isID ? 'Aktifkan Akun' : 'Activate Account')}
              </button>
            ) : (
              <div className="registration-navigation-actions registration-payment-actions">
                <button type="button" className="registration-back-button" onClick={() => setRegistrationStep(2)}>
                  {isID ? '← KEMBALI KE PROGRAM & JADWAL' : '← BACK TO PROGRAM & SCHEDULE'}
                </button>
                <button className="student-access-submit" type="submit" disabled={loading || !form.paymentProof || (form.idCard && !form.idCardPhoto)}>
                  {loading ? (isID ? 'Memproses...' : 'Processing...') : (isID ? 'KIRIM PENDAFTARAN & BUKTI PEMBAYARAN' : 'SUBMIT REGISTRATION & PAYMENT PROOF')}
                </button>
              </div>
            )
          )}

        </form>
      </section>
    </div>
  );
}

const WEATHER_CODES = {
  0: ['Cerah', '☀️'],
  1: ['Cerah berawan', '🌤️'],
  2: ['Berawan', '⛅'],
  3: ['Mendung', '☁️'],
  45: ['Berkabut', '🌫️'],
  48: ['Berkabut', '🌫️'],
  51: ['Gerimis ringan', '🌦️'],
  53: ['Gerimis', '🌦️'],
  55: ['Gerimis lebat', '🌧️'],
  61: ['Hujan ringan', '🌧️'],
  63: ['Hujan', '🌧️'],
  65: ['Hujan lebat', '⛈️'],
  80: ['Hujan lokal', '🌦️'],
  81: ['Hujan sedang', '🌧️'],
  82: ['Hujan lebat', '⛈️'],
  95: ['Badai petir', '⛈️'],
};
const WEATHER_CODES_EN = {
  0:['Clear','☀️'],1:['Mostly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Cloudy','☁️'],45:['Foggy','🌫️'],48:['Foggy','🌫️'],
  51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],61:['Light rain','🌧️'],63:['Rain','🌧️'],65:['Heavy rain','⛈️'],
  80:['Rain showers','🌦️'],81:['Moderate rain','🌧️'],82:['Heavy rain','⛈️'],95:['Thunderstorm','⛈️'],
};

function ThemeSwitch({ theme, onChange }) {
  return (
    <div className="theme-switch icon-only-theme-switch" aria-label="Pilihan tema">
      <button type="button" aria-label="Tema gelap" title="Tema gelap" className={theme === 'dark' ? 'active' : ''} onClick={() => onChange('dark')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 15.2A8.4 8.4 0 0 1 8.8 3.7a8.6 8.6 0 1 0 11.5 11.5Z"/></svg>
      </button>
      <button type="button" aria-label="Tema terang" title="Tema terang" className={theme === 'light' ? 'active' : ''} onClick={() => onChange('light')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      </button>
    </div>
  );
}

function createEmptyAssignmentQuestion() {
  return { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: '', options: ['', '', '', ''], correctOption: 0, points: 10 };
}

function AssignmentQuestionBuilder({ questions, onChange, isID }) {
  const rows = Array.isArray(questions) ? questions : [];
  const updateQuestion = (index, update) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item));
  return <section className="assignment-question-builder"><div className="question-builder-heading"><div><span>{isID ? 'SOAL PILIHAN GANDA' : 'MULTIPLE-CHOICE QUESTIONS'}</span><strong>{rows.length} {isID ? 'soal' : 'questions'} • {rows.reduce((sum, item) => sum + Number(item.points || 0), 0)} {isID ? 'poin' : 'points'}</strong></div><button type="button" onClick={() => onChange([...rows, createEmptyAssignmentQuestion()])}>＋ {isID ? 'Tambah Soal' : 'Add Question'}</button></div>{rows.map((question, questionIndex) => <article key={question.id || questionIndex}><header><b>{isID ? 'Soal' : 'Question'} {questionIndex + 1}</b><label><span>{isID ? 'Bobot' : 'Weight'}</span><input type="number" min="1" max="100" value={question.points} onChange={(event) => updateQuestion(questionIndex, { points: Number(event.target.value) })} /></label><button type="button" aria-label={isID ? 'Hapus soal' : 'Delete question'} onClick={() => onChange(rows.filter((_, index) => index !== questionIndex))}>×</button></header><textarea rows="2" value={question.text} onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })} placeholder={isID ? 'Tulis pertanyaan...' : 'Write the question...'} /> <div className="question-option-grid">{question.options.map((option, optionIndex) => <label className={Number(question.correctOption) === optionIndex ? 'correct-option' : ''} key={optionIndex}><input type="radio" name={`key-${question.id || questionIndex}`} checked={Number(question.correctOption) === optionIndex} onChange={() => updateQuestion(questionIndex, { correctOption: optionIndex })} /><span>{String.fromCharCode(65 + optionIndex)}</span><input value={option} onChange={(event) => updateQuestion(questionIndex, { options: question.options.map((value, index) => index === optionIndex ? event.target.value : value) })} placeholder={`${isID ? 'Pilihan' : 'Option'} ${String.fromCharCode(65 + optionIndex)}`} /></label>)}</div><small>{isID ? 'Pilih lingkaran pada jawaban yang benar.' : 'Select the radio button for the correct answer.'}</small></article>)}</section>;
}

function TutorDashboard({ user, token, overview, loading, message, onRefresh, onLogout, language, theme, onThemeChange }) {
  const isID = language === 'ID';
  const classes = overview?.classes || [];
  const todayClasses = overview?.todayClasses || [];
  const [page, setPage] = useState('home');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [attendanceSavedModal, setAttendanceSavedModal] = useState(null);
  const [journal, setJournal] = useState({ date: new Date().toISOString().slice(0, 10), meetingNumber: 1, title: '', activities: '', notes: '' });
  const [learningPlan, setLearningPlan] = useState({
    month: new Date().toISOString().slice(0, 7), meetingNumber: 1, plannedDate: '', title: '', objective: '',
    targetCompetency: '', activities: '', status: 'Direncanakan',
    assignment: { enabled: false, title: '', instructions: '', assignedDate: '', dueDate: '', expReward: 100, gradingMode: 'automatic', answerKey: '', questions: [] },
    challenge: { enabled: false, title: '', instructions: '', responseType: 'text', dueDate: '', expReward: 100, gradingMode: 'review', answerKey: '' }
  });
  const [journalStudents, setJournalStudents] = useState({});
  const [studentNote, setStudentNote] = useState({ studentId: '', date: new Date().toISOString().slice(0, 10), participation: '', strengths: '', improvements: '', comment: '', achievement: '', expAwarded: 0 });
  const [assignment, setAssignment] = useState({ title: '', instructions: '', assignedDate: new Date().toISOString().slice(0, 10), dueDate: '', expReward: 100, gradingMode: 'automatic', answerKey: '', questions: [createEmptyAssignmentQuestion()] });
  const [assessment, setAssessment] = useState({ studentId: '', date: new Date().toISOString().slice(0, 10), type: 'Monthly Assessment', speaking: '', writing: '', reading: '', listening: '', quizTest: '', comment: '' });
  const [challenge, setChallenge] = useState({ title: '', instructions: '', responseType: 'text', dueDate: '', expReward: 150, gradingMode: 'automatic', answerKey: '' });
  const [reviewItem, setReviewItem] = useState(null);
  const [review, setReview] = useState({ score: '', feedback: '', expAwarded: 0 });
  const [attendanceControl, setAttendanceControl] = useState({ date: new Date().toISOString().slice(0, 10), meetingNumber: 1, statuses: {} });
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

  function goTutorBack() {
    if (page === 'report') {
      setPage('student');
      return;
    }
    if (page === 'student') {
      setPage('class');
      return;
    }
    if (page === 'class' || page === 'attendance') {
      setPage('classes');
      return;
    }
    if (['assignments', 'assessment', 'notes', 'challenges', 'review'].includes(page)) {
      setPage('academic');
      return;
    }
    if (page !== 'home') setPage('home');
  }

  useEdgeSwipeBack(goTutorBack, page !== 'home');

  useEffect(() => {
    if (!selectedClassId && classes[0]?.classId) setSelectedClassId(classes[0].classId);
  }, [classes, selectedClassId]);

  const selectedClass = classes.find((item) => item.classId === selectedClassId) || classes[0] || null;

  useEffect(() => {
    if (!selectedClass?.students?.length) {
      setJournalStudents({});
      return;
    }
    setJournalStudents(Object.fromEntries(selectedClass.students.map((student) => [
      student.studentId,
      { selected: true, achievement: 'Berkembang', comment: '' }
    ])));
  }, [selectedClassId, overview]);

  function composeJournalComment(student, achievement) {
    const topic = journal.title.trim() || (isID ? 'materi pada pertemuan ini' : 'today’s lesson');
    const activity = journal.activities.trim();
    const idTemplates = {
      'Sangat Baik': `${student.fullName} mampu memahami dan menerapkan materi ${topic} secara mandiri, aktif, dan konsisten.`,
      'Baik': `${student.fullName} mampu memahami dan menerapkan materi ${topic} dengan baik serta hanya memerlukan sedikit arahan.`,
      'Berkembang': `${student.fullName} mulai memahami materi ${topic} dan perlu melanjutkan latihan agar lebih percaya diri dan konsisten.`,
      'Perlu Dukungan': `${student.fullName} memerlukan pendampingan dan latihan tambahan untuk memahami serta menerapkan materi ${topic}.`
    };
    const enTemplates = {
      'Sangat Baik': `${student.fullName} understood and applied ${topic} independently, actively, and consistently.`,
      'Baik': `${student.fullName} understood and applied ${topic} well with only limited guidance.`,
      'Berkembang': `${student.fullName} is developing an understanding of ${topic} and needs continued practice to become more confident and consistent.`,
      'Perlu Dukungan': `${student.fullName} needs further guidance and additional practice to understand and apply ${topic}.`
    };
    const base = (isID ? idTemplates : enTemplates)[achievement] || (isID ? idTemplates.Berkembang : enTemplates.Berkembang);
    return activity ? `${base} ${isID ? 'Kegiatan pembelajaran meliputi' : 'Learning activities included'} ${activity.replace(/[.!?]+$/, '')}.` : base;
  }

  function generateAllJournalComments() {
    if (!selectedClass) return;
    setJournalStudents((current) => Object.fromEntries(selectedClass.students.map((student) => {
      const entry = current[student.studentId] || { selected: true, achievement: 'Berkembang' };
      return [student.studentId, { ...entry, comment: composeJournalComment(student, entry.achievement) }];
    })));
  }
  const selectedStudent = selectedClass?.students?.find((item) => item.studentId === selectedStudentId) || null;
  const selectedStudentAttendance = (selectedClass?.attendanceRecords || []).filter((item) => item.studentId === selectedStudentId);
  const selectedStudentSubmissions = (selectedClass?.submissions || []).filter((item) => item.studentId === selectedStudentId);
  const selectedStudentChallengeResults = (selectedClass?.challengeResults || []).filter((item) => item.studentId === selectedStudentId);
  const selectedStudentAssessments = (selectedClass?.assessments || []).filter((item) => item.studentId === selectedStudentId);
  const selectedStudentNotes = (selectedClass?.studentNotes || []).filter((item) => item.studentId === selectedStudentId);
  const pendingReviews = classes.reduce((total, item) => total + (item.submissions || []).filter((entry) => entry.status !== 'Reviewed').length + (item.challengeResults || []).filter((entry) => entry.status !== 'Reviewed').length, 0);
  const reportAttendance = selectedStudentAttendance.filter((item) => String(item.date || '').startsWith(reportMonth));
  const reportAssessments = selectedStudentAssessments.filter((item) => String(item.date || '').startsWith(reportMonth));
  const reportNotes = selectedStudentNotes.filter((item) => String(item.date || '').startsWith(reportMonth));
  const reportJournals = (selectedClass?.journals || []).filter((item) => String(item.date || '').startsWith(reportMonth));
  const reportAssignments = selectedStudentSubmissions.filter((item) => String(item.submittedAt || '').startsWith(reportMonth));
  const reportChallenges = selectedStudentChallengeResults.filter((item) => String(item.submittedAt || '').startsWith(reportMonth));
  const reportScoreValues = reportAssessments.map((item) => Number(item.average)).filter((value) => Number.isFinite(value) && value > 0);
  const reportAverage = reportScoreValues.length ? Math.round(reportScoreValues.reduce((sum, value) => sum + value, 0) / reportScoreValues.length * 10) / 10 : null;
  const reportSkillScores = ['speaking', 'writing', 'reading', 'listening'].reduce((result, skill) => {
    const values = reportAssessments.map((item) => Number(item[skill])).filter((value) => Number.isFinite(value) && value > 0);
    result[skill] = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null;
    return result;
  }, {});
  const reportPresent = reportAttendance.filter((item) => item.status === 'Present').length;
  const reportAbsent = Math.max(0, reportAttendance.length - reportPresent);
  const reportAttendancePercentage = reportAttendance.length ? Math.round(reportPresent / reportAttendance.length * 100) : null;

  async function saveJournal(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const studentEntries = (selectedClass?.students || []).map((student) => {
        const entry = journalStudents[student.studentId] || {};
        return {
          studentId: student.studentId,
          selected: entry.selected !== false,
          achievement: entry.achievement || 'Berkembang',
          comment: entry.comment || composeJournalComment(student, entry.achievement || 'Berkembang')
        };
      }).filter((entry) => entry.selected);
      const result = await callApi({ action: 'saveTutorJournal', token, journal: { ...journal, classId: selectedClassId, studentEntries } });
      setNotice(result.message || (isID ? 'Learning Journal berhasil disimpan.' : 'Learning Journal saved successfully.'));
      setJournal((current) => ({ ...current, title: '', activities: '', notes: '' }));
      setJournalStudents(Object.fromEntries((selectedClass?.students || []).map((student) => [student.studentId, { selected: true, achievement: 'Berkembang', comment: '' }])));
      await onRefresh();
    } catch (error) {
      setNotice(error.message || (isID ? 'Jurnal gagal disimpan.' : 'Journal could not be saved.'));
    } finally {
      setSaving(false);
    }
  }

  async function saveLearningPlan(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const result = await callApi({ action: 'saveTutorLearningPlan', token, learningPlan: { ...learningPlan, classId: selectedClassId } });
      setNotice(result.message || (isID ? 'Rencana pembelajaran berhasil disimpan.' : 'Learning plan saved.'));
      setLearningPlan((current) => ({
        ...current,
        meetingNumber: Math.min(8, Number(current.meetingNumber) + 1), plannedDate: '', title: '', objective: '', targetCompetency: '', activities: '',
        assignment: { ...current.assignment, enabled: false, title: '', instructions: '', assignedDate: '', dueDate: '', answerKey: '', questions: [] },
        challenge: { ...current.challenge, enabled: false, title: '', instructions: '', dueDate: '', answerKey: '' }
      }));
      await onRefresh();
    } catch (error) {
      setNotice(error.message || (isID ? 'Rencana pembelajaran gagal disimpan.' : 'Learning plan could not be saved.'));
    } finally {
      setSaving(false);
    }
  }

  function usePlanForJournal(plan) {
    setJournal({
      date: plan.plannedDate || new Date().toISOString().slice(0, 10),
      meetingNumber: plan.meetingNumber,
      title: plan.title,
      activities: plan.activities,
      notes: ''
    });
    setNotice(isID ? `Rencana pertemuan ${plan.meetingNumber} sudah dimasukkan ke Jurnal Mengajar.` : `Meeting ${plan.meetingNumber} plan was copied to the Teaching Journal.`);
  }

  async function saveStudentNote(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const result = await callApi({ action: 'saveTutorStudentNote', token, note: { ...studentNote, classId: selectedClassId } });
      setNotice(result.message || (isID ? 'Catatan siswa berhasil disimpan.' : 'Student note saved successfully.'));
      setStudentNote((current) => ({ ...current, participation: '', strengths: '', improvements: '', comment: '', achievement: '', expAwarded: 0 }));
      await onRefresh();
    } catch (error) {
      setNotice(error.message || (isID ? 'Catatan siswa gagal disimpan.' : 'Student note could not be saved.'));
    } finally {
      setSaving(false);
    }
  }

  async function createAssignment(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const result = await callApi({ action: 'createTutorAssignment', token, assignment: { ...assignment, classId: selectedClassId } });
      setNotice(result.message || (isID ? 'Assignment berhasil dibuat.' : 'Assignment created successfully.'));
      setAssignment((current) => ({ ...current, title: '', instructions: '', dueDate: '', answerKey: '', questions: [createEmptyAssignmentQuestion()] })); await onRefresh();
    } catch (error) { setNotice(error.message || (isID ? 'Assignment gagal dibuat.' : 'Assignment could not be created.')); }
    finally { setSaving(false); }
  }

  async function saveAssessment(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const result = await callApi({ action: 'saveTutorAssessment', token, assessment: { ...assessment, classId: selectedClassId } });
      setNotice(`${result.message || (isID ? 'Penilaian berhasil disimpan.' : 'Assessment saved.')} ${isID ? 'Rata-rata' : 'Average'}: ${result.average} • Grade ${result.finalGrade}`);
      setAssessment((current) => ({ ...current, speaking: '', writing: '', reading: '', listening: '', quizTest: '', comment: '' })); await onRefresh();
    } catch (error) { setNotice(error.message || (isID ? 'Penilaian gagal disimpan.' : 'Assessment could not be saved.')); }
    finally { setSaving(false); }
  }

  async function createChallenge(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    try { const result = await callApi({ action: 'createTutorChallenge', token, challenge: { ...challenge, classId: selectedClassId } }); setNotice(result.message); setChallenge((current) => ({ ...current, title: '', instructions: '', dueDate: '', answerKey: '' })); await onRefresh(); }
    catch (error) { setNotice(error.message || (isID ? 'Challenge gagal dibuat.' : 'Challenge could not be created.')); } finally { setSaving(false); }
  }

  async function submitReview(event) {
    event.preventDefault(); setSaving(true); setNotice('');
    try {
      const payload = reviewItem.kind === 'assignment' ? { action: 'reviewTutorAssignment', token, review: { ...review, submissionId: reviewItem.submissionId } } : { action: 'reviewTutorChallenge', token, review: { ...review, resultId: reviewItem.resultId } };
      const result = await callApi(payload); setNotice(result.message); setReviewItem(null); setReview({ score: '', feedback: '', expAwarded: 0 }); await onRefresh(); setPage(reviewItem.kind === 'assignment' ? 'assignments' : 'challenges');
    } catch (error) { setNotice(error.message || (isID ? 'Penilaian gagal disimpan.' : 'Review could not be saved.')); } finally { setSaving(false); }
  }

  function openAttendanceControl(classItem = selectedClass) {
    if (!classItem) return;
    const date = attendanceControl.date || new Date().toISOString().slice(0, 10);
    const statuses = {};
    (classItem.attendanceRecords || []).filter((record) => record.date === date).forEach((record) => { statuses[record.studentId] = record.status === 'Present' ? 'Present' : 'Absent'; });
    setSelectedClassId(classItem.classId);
    setAttendanceControl((current) => ({ ...current, date, statuses }));
    setPage('attendance');
  }

  function loadAttendanceDate(date) {
    const statuses = {};
    (selectedClass?.attendanceRecords || []).filter((record) => record.date === date).forEach((record) => { statuses[record.studentId] = record.status === 'Present' ? 'Present' : 'Absent'; });
    setAttendanceControl((current) => ({ ...current, date, statuses }));
  }

  async function saveClassAttendance(event) {
    event.preventDefault();
    const records = (selectedClass?.students || []).map((student) => ({ studentId: student.studentId, status: attendanceControl.statuses[student.studentId] || '' }));
    if (records.some((record) => !record.status)) { setNotice(isID ? 'Tetapkan Hadir atau Tidak Hadir untuk seluruh siswa.' : 'Set Present or Absent for every student.'); return; }
    setSaving(true); setNotice('');
    try {
      const result = await callApi({ action: 'saveTutorClassAttendance', token, attendance: { classId: selectedClassId, date: attendanceControl.date, meetingNumber: attendanceControl.meetingNumber, records } });
      setAttendanceSavedModal({
        title: isID ? 'Kehadiran Berhasil Disimpan' : 'Attendance Saved',
        message: result.message || (isID ? 'Data kehadiran kelas telah tersimpan dengan baik.' : 'Class attendance has been saved successfully.'),
        alertCount: Number(result.followUpAlertsCreated || 0),
      });
      await onRefresh();
    } catch (error) { setNotice(error.message || (isID ? 'Kehadiran gagal disimpan.' : 'Attendance could not be saved.')); }
    finally { setSaving(false); }
  }

  function classCard(item) {
    return (
      <button className="tutor-class-card" type="button" key={item.classId} onClick={() => { setSelectedClassId(item.classId); setPage('class'); }}>
        <span className="tutor-class-icon">▤</span>
        <div><small>{item.program || (isID ? 'PROGRAM' : 'PROGRAM')}</small><strong>{item.className}</strong><p>{item.schedules.map((schedule) => `${schedule.day} ${schedule.start}–${schedule.end}`).join(' • ') || '—'}</p></div>
        <b>{item.students.length} {isID ? 'siswa' : 'students'} →</b>
      </button>
    );
  }

  return (
    <main className="tutor-dashboard">
      {attendanceSavedModal && (
        <div className="attendance-success-overlay" role="dialog" aria-modal="true">
          <section className="attendance-success-modal">
            <div className="attendance-success-icon">
              <ModernUiIcon name="attendance" />
            </div>
            <small>ATTENDANCE CONTROL</small>
            <h2>{attendanceSavedModal.title}</h2>
            <p>{attendanceSavedModal.message}</p>
            {attendanceSavedModal.alertCount > 0 && (
              <div className="attendance-success-care-note">
                <strong>{attendanceSavedModal.alertCount} laporan Student Care dibuat.</strong>
                <span>
                  {isID
                    ? 'Siswa yang telah mencapai ambang 3 kali tidak hadir dilaporkan kepada Admin, Tutor, dan CEO. Koordinasi selanjutnya dilakukan oleh Admin.'
                    : 'Students reaching the three-absence threshold have been reported to Admin, Tutor, and CEO. Admin will coordinate the follow-up.'}
                </span>
              </div>
            )}
            <button type="button" onClick={() => setAttendanceSavedModal(null)}>
              {isID ? 'Oke' : 'OK'}
            </button>
          </section>
        </div>
      )}
      <header className="tutor-dashboard-header">
        <div className="brand-small"><PaperPlaneLogo /><div><strong>Mr One Course</strong><span>Tutor Dashboard</span></div></div>
        <div className="dashboard-header-actions"><button className="tutor-refresh" type="button" onClick={onRefresh}>↻</button></div>
      </header>

      {loading && <div className="tutor-loading">{isID ? 'Memuat dashboard tutor...' : 'Loading tutor dashboard...'}</div>}
      {(message || notice) && <div className="tutor-notice">{notice || message}</div>}
      {page === 'home' && pendingReviews > 0 && <button className="tutor-pending-review" type="button" onClick={() => setPage('academic')}><span>!</span><div><strong>{pendingReviews} {isID ? 'pekerjaan menunggu pemeriksaan' : 'submissions awaiting review'}</strong><small>{isID ? 'Buka Akademik untuk memeriksa jawaban siswa' : 'Open Academics to review student work'}</small></div><b>→</b></button>}

      {page === 'home' && (
        <AttendanceFollowUpPanel
          alerts={overview?.attendanceFollowUps || []}
          role="Tutor"
          onRefresh={onRefresh}
          compact
        />
      )}

      {page === 'assignments' && <section className="tutor-section grading-settings"><div className="tutor-section-heading"><div><span>AUTO GRADING</span><h2>{isID ? 'Pengaturan Nilai Langsung' : 'Instant Grading Settings'}</h2></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Cara Penilaian Assignment' : 'Assignment Grading Method'}</span><select value={assignment.gradingMode} onChange={(event) => setAssignment({ ...assignment, gradingMode: event.target.value })}><option value="automatic">{isID ? 'Otomatis — nilai langsung keluar' : 'Automatic — instant result'}</option><option value="review">{isID ? 'Diperiksa Tutor — tugas terbuka/proyek' : 'Tutor Review — open task/project'}</option></select></label>{assignment.gradingMode === 'automatic' && <div className="grading-mode-note">{isID ? 'Kunci jawaban dan bobot ditentukan pada setiap soal pilihan ganda.' : 'Set the answer key and weight inside each multiple-choice question.'}</div>}<small className="grading-help">{isID ? 'Nilai dihitung dari jumlah jawaban benar. EXP diberikan sebanding dengan nilai.' : 'The score is based on correct answers. EXP is awarded proportionally.'}</small></div></section>}

      {page === 'challenges' && <section className="tutor-section grading-settings"><div className="tutor-section-heading"><div><span>AUTO GRADING</span><h2>{isID ? 'Pengaturan Nilai Langsung' : 'Instant Grading Settings'}</h2></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Cara Penilaian Challenge' : 'Challenge Grading Method'}</span><select value={challenge.gradingMode} onChange={(event) => setChallenge({ ...challenge, gradingMode: event.target.value })}><option value="automatic">{isID ? 'Otomatis — teks / speaking' : 'Automatic — text / speaking'}</option><option value="review">{isID ? 'Diperiksa Tutor — audio/video/proyek' : 'Tutor Review — audio/video/project'}</option></select></label>{challenge.gradingMode === 'automatic' && challenge.responseType !== 'speech' && <label><span>{isID ? 'Kunci Jawaban' : 'Answer Key'}</span><textarea rows="4" value={challenge.answerKey} onChange={(event) => setChallenge({ ...challenge, answerKey: event.target.value })} placeholder={isID ? 'Satu jawaban per baris. Alternatif dipisahkan tanda |' : 'One answer per line. Separate alternatives with |'} required /></label>}<small className="grading-help">{isID ? 'Teks dan speaking dapat dinilai otomatis. Gunakan pemeriksaan tutor untuk tautan audio/video atau proyek.' : 'Text and speaking can be graded automatically. Use tutor review for audio/video links or projects.'}</small></div></section>}

      {page === 'home' && (
        <>
          <section className="tutor-welcome"><span>● SYSTEM CONNECTED</span><h1>{isID ? 'Selamat datang,' : 'Welcome,'}<strong>{overview?.tutor?.name || user.fullName || 'Tutor'}</strong></h1><p>{isID ? 'Berikut kelas dan agenda mengajar Anda hari ini.' : 'Here are your classes and teaching agenda for today.'}</p></section>
          <section className="tutor-stat-grid"><article><span>▤</span><strong>{todayClasses.length}</strong><small>{isID ? 'Kelas Hari Ini' : 'Classes Today'}</small></article><article><span>⌂</span><strong>{classes.length}</strong><small>{isID ? 'Kelas Saya' : 'My Classes'}</small></article><article><span>♙</span><strong>{classes.reduce((sum, item) => sum + item.students.length, 0)}</strong><small>{isID ? 'Total Siswa' : 'Total Students'}</small></article></section>
          <section className="tutor-section"><div className="tutor-section-heading"><div><span>{isID ? 'AGENDA' : 'AGENDA'}</span><h2>{isID ? 'Kelas Hari Ini' : "Today's Classes"}</h2></div><button type="button" onClick={() => setPage('classes')}>{isID ? 'Lihat Semua' : 'View All'}</button></div>{todayClasses.length ? <div className="tutor-class-list">{todayClasses.map(classCard)}</div> : <div className="tutor-empty">{isID ? 'Tidak ada kelas yang dijadwalkan hari ini.' : 'No classes are scheduled today.'}</div>}</section>
        </>
      )}

      {page === 'classes' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>{isID ? 'KELAS' : 'CLASSES'}</span><h2>{isID ? 'Semua Kelas Saya' : 'All My Classes'}</h2></div></div>{classes.length ? <div className="tutor-class-list">{classes.map(classCard)}</div> : <div className="tutor-empty">{isID ? 'Belum ada kelas yang terhubung dengan akun tutor.' : 'No classes are linked to this tutor account.'}</div>}</section>}

      {page === 'class' && selectedClass && (
        <section className="tutor-section tutor-page-section"><button className="tutor-back" type="button" onClick={() => setPage('classes')}>← {isID ? 'Semua Kelas' : 'All Classes'}</button><div className="tutor-class-title"><span>{selectedClass.program || 'PROGRAM'}</span><h2>{selectedClass.className}</h2><p>{selectedClass.schedules.map((schedule) => `${schedule.day} ${schedule.start}–${schedule.end}`).join(' • ')}</p></div><button className="open-attendance-control" type="button" onClick={() => openAttendanceControl(selectedClass)}><span>✓</span><div><strong>{isID ? 'Attendance Control' : 'Attendance Control'}</strong><small>{isID ? 'Periksa check-in dan lengkapi kehadiran kelas' : 'Review check-ins and complete class attendance'}</small></div><b>→</b></button><div className="tutor-student-list">{selectedClass.students.map((student, index) => <button type="button" key={student.studentId} onClick={() => { setSelectedStudentId(student.studentId); setStudentNote({ ...studentNote, studentId: student.studentId }); setPage('student'); }}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{student.fullName}</strong><small>{student.studentId} • {student.grade || '—'}</small></div><b>→</b></button>)}</div></section>
      )}

      {page === 'attendance' && selectedClass && <section className="tutor-section tutor-page-section tutor-attendance-control"><button className="tutor-back" type="button" onClick={() => setPage('class')}>← {isID ? 'Kembali ke Kelas' : 'Back to Class'}</button><div className="tutor-section-heading"><div><span>ATTENDANCE CONTROL</span><h2>{selectedClass.className}</h2></div></div><form onSubmit={saveClassAttendance}><div className="tutor-form-grid tutor-attendance-settings"><label><span>{isID ? 'Tanggal Pertemuan' : 'Meeting Date'}</span><input type="date" value={attendanceControl.date} onChange={(event) => loadAttendanceDate(event.target.value)} required /></label><label><span>{isID ? 'Pertemuan Ke' : 'Meeting Number'}</span><select value={attendanceControl.meetingNumber} onChange={(event) => setAttendanceControl({ ...attendanceControl, meetingNumber: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><div className="attendance-bulk-actions"><button type="button" onClick={() => setAttendanceControl({ ...attendanceControl, statuses: Object.fromEntries(selectedClass.students.map((student) => [student.studentId, 'Present'])) })}>{isID ? 'Semua Hadir' : 'All Present'}</button><button type="button" onClick={() => setAttendanceControl({ ...attendanceControl, statuses: Object.fromEntries(selectedClass.students.map((student) => [student.studentId, 'Absent'])) })}>{isID ? 'Semua Tidak Hadir' : 'All Absent'}</button></div><div className="tutor-attendance-roster">{selectedClass.students.map((student, index) => { const status = attendanceControl.statuses[student.studentId] || ''; return <article key={student.studentId}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{student.fullName}</strong><small>{student.studentId}</small></div><div className="attendance-status-buttons"><button className={status === 'Present' ? 'selected present' : ''} type="button" onClick={() => setAttendanceControl({ ...attendanceControl, statuses: { ...attendanceControl.statuses, [student.studentId]: 'Present' } })}>{isID ? 'Hadir' : 'Present'}</button><button className={status === 'Absent' ? 'selected absent' : ''} type="button" onClick={() => setAttendanceControl({ ...attendanceControl, statuses: { ...attendanceControl.statuses, [student.studentId]: 'Absent' } })}>{isID ? 'Tidak Hadir' : 'Absent'}</button></div></article>; })}</div><div className="attendance-save-bar"><div><strong>{Object.keys(attendanceControl.statuses).length}/{selectedClass.students.length}</strong><small>{isID ? 'status telah ditetapkan' : 'statuses selected'}</small></div><button type="submit" disabled={saving}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Kehadiran' : 'Save Attendance')}</button></div></form></section>}

      {page === 'student' && selectedStudent && <button className="tutor-report-launch" type="button" onClick={() => setPage('report')}><span>▤</span><div><strong>{isID ? 'Laporan Bulanan Siswa' : 'Monthly Student Report'}</strong><small>{isID ? 'Periksa laporan dan cetak sebagai PDF' : 'Review the report and print it as PDF'}</small></div><b>→</b></button>}

      {page === 'student' && selectedStudent && <section className="tutor-section tutor-page-section tutor-student-progress"><button className="tutor-back" type="button" onClick={() => setPage('class')}>← {isID ? 'Daftar Siswa' : 'Student List'}</button><div className="tutor-student-profile"><div className="tutor-student-avatar">{selectedStudent.photoLink ? <img src={toDirectDriveImage(selectedStudent.photoLink)} alt={selectedStudent.fullName} /> : getInitials(selectedStudent.fullName)}</div><div><small>{selectedClass.program}</small><h2>{selectedStudent.fullName}</h2><p>{selectedStudent.studentId} • {selectedStudent.grade || '—'}</p></div><button type="button" onClick={() => setPage('notes')}>{isID ? 'Tambah Catatan' : 'Add Note'}</button></div><div className="tutor-progress-summary"><article><span>{isID ? 'Kehadiran' : 'Attendance'}</span><strong>{selectedStudentAttendance.filter((item) => item.status === 'Present').length}/{selectedStudentAttendance.length || 0}</strong><small>{selectedStudentAttendance.length ? `${Math.round(selectedStudentAttendance.filter((item) => item.status === 'Present').length / selectedStudentAttendance.length * 100)}%` : (isID ? 'Belum ada data' : 'No data')}</small></article><article><span>Assignment</span><strong>{selectedStudentSubmissions.filter((item) => item.status === 'Reviewed').length}</strong><small>{isID ? 'sudah dinilai' : 'reviewed'}</small></article><article><span>Challenge</span><strong>{selectedStudentChallengeResults.filter((item) => item.status === 'Reviewed').length}</strong><small>{isID ? 'selesai' : 'completed'}</small></article><article><span>{isID ? 'Nilai' : 'Score'}</span><strong>{selectedStudentAssessments[0]?.average || '—'}</strong><small>{selectedStudentAssessments[0]?.finalGrade ? `Grade ${selectedStudentAssessments[0].finalGrade}` : (isID ? 'Belum dinilai' : 'Not assessed')}</small></article></div><div className="tutor-progress-grid"><div className="tutor-progress-panel"><h3>{isID ? 'Riwayat Kehadiran' : 'Attendance History'}</h3>{selectedStudentAttendance.length ? selectedStudentAttendance.slice(0, 8).map((item) => <article key={item.attendanceId || `${item.date}-${item.meetingNumber}`}><div><strong>{item.date}</strong><small>{isID ? `Pertemuan ${item.meetingNumber || '—'}` : `Meeting ${item.meetingNumber || '—'}`}</small></div><b className={item.status === 'Present' ? 'status-present' : 'status-absent'}>{item.status === 'Present' ? (isID ? 'HADIR' : 'PRESENT') : (isID ? 'TIDAK HADIR' : 'ABSENT')}</b></article>) : <p>{isID ? 'Belum ada data kehadiran.' : 'No attendance data yet.'}</p>}</div><div className="tutor-progress-panel"><h3>{isID ? 'Aktivitas Akademik' : 'Academic Activity'}</h3>{[...selectedStudentSubmissions, ...selectedStudentChallengeResults].length ? [...selectedStudentSubmissions, ...selectedStudentChallengeResults].slice(0, 8).map((item) => <article key={item.submissionId || item.resultId}><div><strong>{item.submissionId ? 'Assignment' : 'Challenge'}</strong><small>{item.status}</small></div><b>{item.status === 'Reviewed' ? `${item.score}/100` : (isID ? 'MENUNGGU' : 'PENDING')}</b></article>) : <p>{isID ? 'Belum ada pengumpulan.' : 'No submissions yet.'}</p>}</div></div>{selectedStudentNotes[0] && <div className="tutor-latest-note"><span>{isID ? 'CATATAN PERKEMBANGAN TERBARU' : 'LATEST PROGRESS NOTE'}</span><p>{selectedStudentNotes[0].comment}</p><small>{selectedStudentNotes[0].date} • {selectedStudentNotes[0].participation}</small></div>}</section>}

      {page === 'report' && selectedStudent && (
        <section className="tutor-report-page">
          <div className="tutor-report-toolbar"><button type="button" onClick={() => setPage('student')}>← {isID ? 'Kembali' : 'Back'}</button><label><span>{isID ? 'Periode' : 'Period'}</span><input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} /></label><button className="print-report-button" type="button" onClick={() => window.print()}>▣ {isID ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</button></div>
          <article className="tutor-printable-report detailed-monthly-report">
            <header><img className="report-brand-logo-transparent" src="/logo-mr-one-course.jpeg" alt="Mr One Course" /><div><span>MR ONE COURSE • ACADEMIC SUITE</span><h1>{isID ? 'Laporan Perkembangan Akademik Bulanan' : 'Monthly Academic Progress Report'}</h1><p>{isID ? 'PERIODE LAPORAN' : 'REPORT PERIOD'}: {new Date(`${reportMonth}-01T12:00:00`).toLocaleDateString(isID ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</p></div></header>
            <section className="report-student-identity"><div><small>{isID ? 'NAMA SISWA' : 'STUDENT NAME'}</small><strong>{selectedStudent.fullName}</strong><span>{selectedStudent.studentId}</span></div><div><small>{isID ? 'PROGRAM / KELAS' : 'PROGRAM / CLASS'}</small><strong>{selectedClass.program || '—'}</strong><span>{selectedClass.className}</span></div><div><small>{isID ? 'TINGKAT SEKOLAH' : 'SCHOOL GRADE'}</small><strong>{selectedStudent.grade || '—'}</strong><span>Tutor: {overview?.tutor?.name || '—'}</span></div></section>
            <section className="report-analytics-grid"><article className="report-skill-panel"><h2>{isID ? 'Analisis Keterampilan' : 'Skill Analytics'}</h2><SkillRadar scores={reportSkillScores} isID={isID} /></article><article className="report-overview-panel"><div><span>{isID ? 'KEHADIRAN' : 'ATTENDANCE'}</span><strong>{reportAttendancePercentage == null ? '—' : `${reportAttendancePercentage}%`}</strong><small>{isID ? `Hadir ${reportPresent} • Tidak Hadir ${reportAbsent}` : `Present ${reportPresent} • Absent ${reportAbsent}`}</small></div><div><span>{isID ? 'RATA-RATA NILAI' : 'AVERAGE SCORE'}</span><strong>{reportAverage ?? '—'}</strong><small>{reportAssessments[0]?.finalGrade ? `Final Grade ${reportAssessments[0].finalGrade}` : (isID ? 'Menunggu penilaian' : 'Awaiting assessment')}</small></div></article></section>
            <section className="report-comment"><h2>{isID ? 'Komentar Perkembangan Tutor' : 'Tutor Progress Comment'}</h2><p>{reportNotes[0]?.comment || (isID ? 'Komentar perkembangan belum ditambahkan untuk periode ini.' : 'No progress comment has been added for this period.')}</p>{reportNotes[0] && <small>{reportNotes[0].date} • {reportNotes[0].participation}</small>}</section>
            <section className="report-block"><h2>{isID ? 'Nilai Penilaian Bulanan' : 'Monthly Assessment Grades'}</h2>{reportAssessments.length ? <div className="report-wide-table"><table><thead><tr><th>{isID ? 'Tanggal' : 'Date'}</th><th>{isID ? 'Jenis' : 'Type'}</th><th>Speaking</th><th>Writing</th><th>Reading</th><th>Listening</th><th>Quiz/Test</th><th>{isID ? 'Rata-rata' : 'Average'}</th><th>Grade</th></tr></thead><tbody>{reportAssessments.map((item) => <tr key={item.assessmentId}><td>{item.date}</td><td>{item.type}</td><td>{item.speaking || '—'}</td><td>{item.writing || '—'}</td><td>{item.reading || '—'}</td><td>{item.listening || '—'}</td><td>{item.quizTest || '—'}</td><td><strong>{item.average || '—'}</strong></td><td><strong>{item.finalGrade || '—'}</strong></td></tr>)}</tbody></table></div> : <p className="report-empty">{isID ? 'Belum ada penilaian pada periode ini.' : 'No assessments for this period.'}</p>}</section>
            <section className="report-block"><h2>{isID ? 'Detail Pertemuan, Kehadiran, dan Capaian' : 'Session, Attendance, and Progress Detail'}</h2>{reportJournals.length ? <div className="report-wide-table"><table><thead><tr><th>No.</th><th>{isID ? 'Tanggal' : 'Date'}</th><th>{isID ? 'Materi / Topik' : 'Material / Topic'}</th><th>{isID ? 'Kehadiran' : 'Attendance'}</th><th>{isID ? 'Capaian' : 'Achievement'}</th><th>{isID ? 'Catatan Individual' : 'Individual Note'}</th></tr></thead><tbody>{reportJournals.map((entry) => { const attendance = reportAttendance.find((item) => item.date === entry.date); const note = reportNotes.find((item) => item.date === entry.date); return <tr key={entry.journalId || `${entry.date}-${entry.meetingNumber}`}><td>{entry.meetingNumber}</td><td>{entry.date}</td><td><strong>{entry.title}</strong><small className="report-cell-note">{entry.activities}</small></td><td>{attendance?.status === 'Present' ? (isID ? 'Hadir' : 'Present') : (isID ? 'Tidak Hadir' : 'Absent')}</td><td>{note?.achievement || note?.participation || '—'}</td><td>{note?.comment || '—'}</td></tr>; })}</tbody></table></div> : <p className="report-empty">{isID ? 'Learning Journal periode ini belum tersedia.' : 'No Learning Journal entries for this period.'}</p>}</section>
            <section className="report-metric-grid"><article><span>Assignment</span><strong>{reportAssignments.filter((item) => item.status === 'Reviewed').length}</strong><small>{isID ? `${reportAssignments.length} dikumpulkan bulan ini` : `${reportAssignments.length} submitted this month`}</small></article><article><span>Challenge</span><strong>{reportChallenges.filter((item) => item.status === 'Reviewed').length}</strong><small>{isID ? `${reportChallenges.length} dikerjakan bulan ini` : `${reportChallenges.length} completed this month`}</small></article><article><span>{isID ? 'Pertemuan' : 'Sessions'}</span><strong>{reportJournals.length}/8</strong><small>{isID ? 'jurnal telah diisi' : 'journals completed'}</small></article><article><span>{isID ? 'Status Laporan' : 'Report Status'}</span><strong>{reportJournals.length ? (isID ? 'Tersedia' : 'Available') : '—'}</strong><small>{isID ? 'siap dicetak PDF' : 'ready for PDF'}</small></article></section>
            <footer><div><strong>Mr One Course</strong><span>{isID ? 'Dokumen akademik resmi yang dibuat melalui Mr One Course Academic Suite.' : 'Official academic document generated through Mr One Course Academic Suite.'}</span></div><div><span>Tutor</span><strong>{overview?.tutor?.name || '—'}</strong></div></footer>
          </article>
        </section>
      )}

      {page === 'academic' && (
        <>
        <div className="tutor-academic-master">
          <div className="tutor-academic-master-heading">
            <span>ACADEMIC</span>
            <h1>{isID ? 'Kelola Akademik' : 'Manage Academic'}</h1>
            <p>{isID ? 'Kelola rencana dan capaian setiap pertemuan dalam satu alur. Pilih pertemuan, isi materi dan target, lalu hubungkan tugas, tantangan, assessment, serta catatan siswa bila diperlukan.' : 'Manage meeting plans and achievement in one workflow. Select the meeting, complete the material and target, then connect assignments, challenges, assessment, and student notes when needed.'}</p>
          </div>
        <section className="tutor-section tutor-page-section linked-learning-package"><div className="tutor-section-heading"><div><span>{isID ? 'CAPAIAN & AKTIVITAS' : 'ACHIEVEMENT & ACTIVITIES'}</span><h2>{isID ? 'Capaian Pertemuan' : 'Meeting Achievement'}</h2><p>{isID ? 'Target capaian, tugas, dan tantangan mengikuti pertemuan yang sedang dikelola.' : 'Achievement targets, assignments, and challenges follow the meeting being managed.'}</p></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Target Capaian Siswa' : 'Student Achievement Target'}</span><textarea rows="3" value={learningPlan.targetCompetency} onChange={(event) => setLearningPlan({ ...learningPlan, targetCompetency: event.target.value })} placeholder={isID ? 'Contoh: Siswa mampu membuat minimal lima kalimat Simple Present dengan pola yang tepat.' : 'Example: Students can write at least five accurate Simple Present sentences.'} /></label><div className="linked-package-toggle"><label><input type="checkbox" checked={learningPlan.assignment.enabled} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, enabled: event.target.checked } })} /><span><strong>Assignment</strong><small>{isID ? 'Bukti pencapaian target pembelajaran' : 'Evidence of learning-target achievement'}</small></span></label>{learningPlan.assignment.enabled && <div className="linked-package-fields"><input value={learningPlan.assignment.title} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, title: event.target.value } })} placeholder={isID ? 'Judul assignment' : 'Assignment title'} /><textarea rows="3" value={learningPlan.assignment.instructions} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, instructions: event.target.value } })} placeholder={isID ? 'Instruksi pengerjaan...' : 'Assignment instructions...'} /><div className="tutor-form-grid"><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={learningPlan.assignment.dueDate} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, dueDate: event.target.value } })} /></label><label><span>EXP</span><input type="number" min="0" max="200" value={learningPlan.assignment.expReward} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, expReward: Number(event.target.value) } })} /></label></div><label><span>{isID ? 'Cara Penilaian' : 'Grading Method'}</span><select value={learningPlan.assignment.gradingMode} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, gradingMode: event.target.value } })}><option value="review">{isID ? 'Diperiksa Tutor' : 'Tutor Review'}</option><option value="automatic">{isID ? 'Otomatis' : 'Automatic'}</option></select></label>{learningPlan.assignment.gradingMode === 'automatic' && <textarea rows="3" value={learningPlan.assignment.answerKey} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, answerKey: event.target.value } })} placeholder={isID ? 'Kunci jawaban, satu jawaban per baris' : 'Answer key, one answer per line'} />}</div>}</div><div className="linked-package-toggle challenge-link"><label><input type="checkbox" checked={learningPlan.challenge.enabled} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, enabled: event.target.checked } })} /><span><strong>Challenge</strong><small>{isID ? 'Pengayaan sesuai program dan sumber EXP' : 'Program-based enrichment and EXP source'}</small></span></label>{learningPlan.challenge.enabled && <div className="linked-package-fields"><select value="" onChange={(event) => { const template = (overview?.challengeTemplates?.[selectedClassId] || [])[Number(event.target.value)]; if (template) setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, ...template, enabled: true, gradingMode: template.gradingMode || (['text','speech'].includes(template.responseType) ? 'automatic' : 'review') } }); }}><option value="">{isID ? 'Pilih template sesuai program' : 'Select a program template'}</option>{(overview?.challengeTemplates?.[selectedClassId] || []).map((item, index) => <option value={index} key={item.title}>{item.title}</option>)}</select><input value={learningPlan.challenge.title} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, title: event.target.value } })} placeholder={isID ? 'Judul challenge' : 'Challenge title'} /><textarea rows="3" value={learningPlan.challenge.instructions} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, instructions: event.target.value } })} placeholder={isID ? 'Instruksi challenge...' : 'Challenge instructions...'} /><div className="tutor-form-grid"><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={learningPlan.challenge.dueDate} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, dueDate: event.target.value } })} /></label><label><span>EXP</span><input type="number" min="0" max="250" value={learningPlan.challenge.expReward} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, expReward: Number(event.target.value) } })} /></label></div><label><span>{isID ? 'Cara Penilaian' : 'Grading Method'}</span><select value={learningPlan.challenge.gradingMode} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, gradingMode: event.target.value } })}><option value="review">{isID ? 'Diperiksa Tutor' : 'Tutor Review'}</option><option value="automatic" disabled={!['text','speech'].includes(learningPlan.challenge.responseType)}>{isID ? 'Otomatis — teks / speaking' : 'Automatic — text / speaking'}</option></select></label>{learningPlan.challenge.responseType === 'speech' && <textarea rows="2" value={learningPlan.challenge.answerKey} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, answerKey: event.target.value } })} placeholder={isID ? 'Target kata / frasa speaking' : 'Speaking target word / phrase'} />}{learningPlan.challenge.gradingMode === 'automatic' && learningPlan.challenge.responseType !== 'speech' && <textarea rows="3" value={learningPlan.challenge.answerKey} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, answerKey: event.target.value } })} placeholder={isID ? 'Kunci jawaban, satu jawaban per baris' : 'Answer key, one answer per line'} />}</div>}</div></div></section>{page === 'academic' && learningPlan.assignment.enabled && <section className="tutor-section tutor-page-section"><AssignmentQuestionBuilder questions={learningPlan.assignment.questions || []} onChange={(questions) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, questions, answerKey: questions.map((item) => item.options[Number(item.correctOption)] || '').join('\\n') } })} isID={isID} /></section>}
        <section className="tutor-section tutor-page-section learning-plan-section"><div className="tutor-section-heading"><div><span>{isID ? 'PERTEMUAN' : 'MEETING'}</span><h2>{isID ? 'Rencana & Capaian Pertemuan' : 'Meeting Plan & Achievement'}</h2><p>{isID ? 'Gunakan pertemuan 1–8 sebagai satu rangkaian pembelajaran, bukan menu terpisah.' : 'Use meetings 1–8 as one learning sequence, not as a separate menu.'}</p></div></div><form className="tutor-journal-form" onSubmit={saveLearningPlan}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Bulan Pembelajaran' : 'Learning Month'}</span><input type="month" value={learningPlan.month} onChange={(event) => setLearningPlan({ ...learningPlan, month: event.target.value })} required /></label><label><span>{isID ? 'Pertemuan Ke' : 'Meeting Number'}</span><select value={learningPlan.meetingNumber} onChange={(event) => setLearningPlan({ ...learningPlan, meetingNumber: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><label><span>{isID ? 'Rencana Tanggal (opsional)' : 'Planned Date (optional)'}</span><input type="date" value={learningPlan.plannedDate} onChange={(event) => setLearningPlan({ ...learningPlan, plannedDate: event.target.value })} /></label><label><span>{isID ? 'Materi / Topik' : 'Material / Topic'}</span><input value={learningPlan.title} onChange={(event) => setLearningPlan({ ...learningPlan, title: event.target.value })} placeholder={isID ? 'Contoh: Simple Present Tense' : 'Example: Simple Present Tense'} required /></label><label><span>{isID ? 'Tujuan Pembelajaran' : 'Learning Objective'}</span><textarea rows="3" value={learningPlan.objective} onChange={(event) => setLearningPlan({ ...learningPlan, objective: event.target.value })} placeholder={isID ? 'Contoh: Siswa mampu membuat kalimat kebiasaan sehari-hari.' : 'Example: Students can write sentences about daily routines.'} required /></label><label><span>{isID ? 'Rencana Aktivitas' : 'Planned Activities'}</span><textarea rows="4" value={learningPlan.activities} onChange={(event) => setLearningPlan({ ...learningPlan, activities: event.target.value })} placeholder={isID ? 'Pembukaan, latihan terbimbing, praktik, dan refleksi...' : 'Warm-up, guided practice, production, and reflection...'} required /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Rencana Pertemuan' : 'Save Meeting Plan')}</button></form><div className="eight-meeting-plan-grid">{Array.from({ length: 8 }, (_, index) => { const number = index + 1; const plan = (selectedClass?.learningPlans || []).find((item) => item.month === learningPlan.month && item.meetingNumber === number); return <article className={plan ? 'planned' : ''} key={number}><span>{String(number).padStart(2, '0')}</span><div><small>{plan ? (isID ? 'SUDAH DIRENCANAKAN' : 'PLANNED') : (isID ? 'BELUM DIISI' : 'NOT PLANNED')}</small><strong>{plan?.title || (isID ? `Pertemuan ${number}` : `Meeting ${number}`)}</strong>{plan?.objective && <p>{plan.objective}</p>}</div>{plan && <button type="button" onClick={() => usePlanForJournal(plan)}>{isID ? 'Gunakan untuk Jurnal →' : 'Use for Journal →'}</button>}</article>; })}</div></section>
        </div>
        </>)}
{page === 'journal' && (        <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>Learning Journal</h2><p>{isID ? 'Isi jurnal kelas dan capaian seluruh siswa dalam satu kali simpan.' : 'Complete the class journal and every student’s progress in one save.'}</p></div></div><form className="tutor-journal-form" onSubmit={saveJournal}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal' : 'Date'}</span><input type="date" value={journal.date} onChange={(event) => setJournal({ ...journal, date: event.target.value })} required /></label><label><span>{isID ? 'Pertemuan Ke' : 'Meeting Number'}</span><select value={journal.meetingNumber} onChange={(event) => setJournal({ ...journal, meetingNumber: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><label><span>{isID ? 'Materi / Topik' : 'Material / Topic'}</span><input value={journal.title} onChange={(event) => setJournal({ ...journal, title: event.target.value })} placeholder={isID ? 'Contoh: Simple Present Tense' : 'Example: Simple Present Tense'} required /></label><label><span>{isID ? 'Aktivitas Pembelajaran' : 'Learning Activities'}</span><textarea rows="5" value={journal.activities} onChange={(event) => setJournal({ ...journal, activities: event.target.value })} placeholder={isID ? 'Contoh: Mengidentifikasi pola, latihan berpasangan, dan membuat lima kalimat.' : 'Example: Identifying patterns, pair practice, and writing five sentences.'} required /></label><label><span>{isID ? 'Catatan Kelas / Tindak Lanjut' : 'Class Notes / Follow-up'}</span><textarea rows="3" value={journal.notes} onChange={(event) => setJournal({ ...journal, notes: event.target.value })} placeholder={isID ? 'Catatan umum kelas atau rencana pertemuan berikutnya...' : 'General class notes or next-meeting plan...'} /></label><div className="journal-roster-heading"><div><span>{isID ? 'CAPAIAN INDIVIDUAL' : 'INDIVIDUAL PROGRESS'}</span><h3>{isID ? 'Daftar Siswa' : 'Student List'}</h3><small>{isID ? 'Semua siswa otomatis dipilih. Hapus centang siswa yang tidak mengikuti pertemuan.' : 'All students are selected automatically. Uncheck students who did not attend.'}</small></div><div className="journal-roster-actions"><button type="button" onClick={() => setJournalStudents(Object.fromEntries((selectedClass?.students || []).map((student) => [student.studentId, { ...(journalStudents[student.studentId] || {}), selected: true, achievement: journalStudents[student.studentId]?.achievement || 'Berkembang' }])))}>{isID ? 'Pilih Semua' : 'Select All'}</button><button type="button" onClick={generateAllJournalComments} disabled={!journal.title.trim()}>{isID ? '✦ Susun Kalimat Otomatis' : '✦ Generate Comments'}</button></div></div><div className="journal-student-roster">{(selectedClass?.students || []).map((student, index) => { const entry = journalStudents[student.studentId] || { selected: true, achievement: 'Berkembang', comment: '' }; return <article className={entry.selected === false ? 'not-selected' : ''} key={student.studentId}><label className="journal-student-check"><input type="checkbox" checked={entry.selected !== false} onChange={(event) => setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, selected: event.target.checked } })} /><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{student.fullName}</strong><small>{student.studentId}</small></div></label>{entry.selected !== false && <><label className="journal-achievement"><span>{isID ? 'Kemampuan Hari Ini' : 'Today’s Achievement'}</span><select value={entry.achievement} onChange={(event) => { const achievement = event.target.value; setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, achievement, comment: composeJournalComment(student, achievement) } }); }}><option value="Sangat Baik">{isID ? 'Sangat Baik — Mandiri' : 'Excellent — Independent'}</option><option value="Baik">{isID ? 'Baik — Sedikit Arahan' : 'Good — Limited Guidance'}</option><option value="Berkembang">{isID ? 'Berkembang — Perlu Latihan' : 'Developing — Needs Practice'}</option><option value="Perlu Dukungan">{isID ? 'Perlu Dukungan — Pendampingan' : 'Needs Support — Guidance'}</option></select></label><label className="journal-generated-comment"><span>{isID ? 'Catatan Otomatis (boleh diedit)' : 'Generated Comment (editable)'}</span><textarea rows="3" value={entry.comment} onChange={(event) => setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, comment: event.target.value } })} placeholder={isID ? 'Klik “Susun Kalimat Otomatis” atau pilih kemampuan siswa.' : 'Generate a comment or select the student achievement.'} /></label></>}</article>; })}</div><div className="journal-save-summary"><span>{Object.values(journalStudents).filter((entry) => entry.selected !== false).length} {isID ? 'siswa dipilih' : 'students selected'}</span><button type="submit" disabled={saving || !selectedClassId || !journal.title.trim() || !journal.activities.trim()}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Jurnal & Capaian Siswa' : 'Save Journal & Student Progress')}</button></div></form>{selectedClass?.journals?.length > 0 && <div className="tutor-journal-history"><h3>{isID ? 'Jurnal Terbaru' : 'Recent Journals'}</h3>{selectedClass.journals.map((entry) => <article key={entry.journalId || `${entry.date}-${entry.meetingNumber}`}><span>{String(entry.meetingNumber).padStart(2, '0')}</span><div><strong>{entry.title}</strong><small>{entry.date} • {entry.activities}</small></div></article>)}</div>}</section>)}

      {page === 'notes' && (
        <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>INDIVIDUAL</span><h2>{isID ? 'Catatan Siswa' : 'Student Notes'}</h2></div></div><form className="tutor-journal-form" onSubmit={saveStudentNote}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => { setSelectedClassId(event.target.value); setStudentNote({ ...studentNote, studentId: '' }); }} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Pilih Siswa' : 'Select Student'}</span><select value={studentNote.studentId} onChange={(event) => setStudentNote({ ...studentNote, studentId: event.target.value })} required><option value="">—</option>{(selectedClass?.students || []).map((student) => <option key={student.studentId} value={student.studentId}>{student.fullName} — {student.studentId}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal' : 'Date'}</span><input type="date" value={studentNote.date} onChange={(event) => setStudentNote({ ...studentNote, date: event.target.value })} required /></label><label><span>{isID ? 'Partisipasi' : 'Participation'}</span><select value={studentNote.participation} onChange={(event) => setStudentNote({ ...studentNote, participation: event.target.value })}><option value="">—</option><option value="Sangat Aktif">{isID ? 'Sangat Aktif' : 'Highly Active'}</option><option value="Aktif">{isID ? 'Aktif' : 'Active'}</option><option value="Cukup">{isID ? 'Cukup' : 'Developing'}</option><option value="Perlu Dukungan">{isID ? 'Perlu Dukungan' : 'Needs Support'}</option></select></label></div><label><span>{isID ? 'Kekuatan Siswa' : 'Student Strengths'}</span><textarea rows="3" value={studentNote.strengths} onChange={(event) => setStudentNote({ ...studentNote, strengths: event.target.value })} /></label><label><span>{isID ? 'Perlu Ditingkatkan' : 'Areas for Improvement'}</span><textarea rows="3" value={studentNote.improvements} onChange={(event) => setStudentNote({ ...studentNote, improvements: event.target.value })} /></label><label><span>{isID ? 'Komentar Tutor untuk Laporan' : 'Tutor Comment for Report'}</span><textarea rows="4" value={studentNote.comment} onChange={(event) => setStudentNote({ ...studentNote, comment: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>Achievement</span><input value={studentNote.achievement} onChange={(event) => setStudentNote({ ...studentNote, achievement: event.target.value })} placeholder={isID ? 'Opsional' : 'Optional'} /></label><label><span>{isID ? 'Bonus EXP (0–250)' : 'EXP Bonus (0–250)'}</span><input type="number" min="0" max="250" value={studentNote.expAwarded} onChange={(event) => setStudentNote({ ...studentNote, expAwarded: Number(event.target.value) })} /></label></div><button type="submit" disabled={saving || !selectedClassId || !studentNote.studentId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Catatan Individual' : 'Save Individual Note')}</button></form></section>
      )}

      {page === 'academic' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>{isID ? 'Kelola Akademik' : 'Manage Academics'}</h2></div></div><div className="tutor-academic-menu"><button type="button" onClick={() => setPage('assignments')}><span>☑</span><div><strong>{isID ? 'Tugas' : 'Assignments'}</strong><small>{isID ? 'Buat, periksa, dan beri feedback tugas siswa' : 'Create, review, and give student assignment feedback'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('challenges')}><span>🎯</span><div><strong>{isID ? 'Tantangan' : 'Challenges'}</strong><small>{isID ? 'Buat tantangan sesuai program dan validasi progres/EXP' : 'Create program challenges and validate progress/EXP'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('assessment')}><span>★</span><div><strong>Assessment</strong><small>{isID ? 'Catat hasil penilaian sebagai bagian progres akademik siswa' : 'Record assessment results as part of student academic progress'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('notes')}><span>♙</span><div><strong>{isID ? 'Catatan Siswa' : 'Student Notes'}</strong><small>{isID ? 'Catat perkembangan individual yang melengkapi capaian dan assessment' : 'Record individual progress that complements achievement and assessment'}</small></div><b>→</b></button></div></section>}

      {page === 'assignments' && assignment.gradingMode === 'automatic' && <section className="tutor-section tutor-page-section"><AssignmentQuestionBuilder questions={assignment.questions || []} onChange={(questions) => setAssignment({ ...assignment, questions, answerKey: questions.map((item) => item.options[Number(item.correctOption)] || '').join('\\n') })} isID={isID} /></section>}
      {page === 'assignments' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>Assignments</h2></div></div><form className="tutor-journal-form" onSubmit={createAssignment}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Judul Tugas' : 'Assignment Title'}</span><input value={assignment.title} onChange={(event) => setAssignment({ ...assignment, title: event.target.value })} required /></label><label><span>{isID ? 'Instruksi' : 'Instructions'}</span><textarea rows="4" value={assignment.instructions} onChange={(event) => setAssignment({ ...assignment, instructions: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal Diberikan' : 'Assigned Date'}</span><input type="date" value={assignment.assignedDate} onChange={(event) => setAssignment({ ...assignment, assignedDate: event.target.value })} required /></label><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={assignment.dueDate} onChange={(event) => setAssignment({ ...assignment, dueDate: event.target.value })} required /></label></div><label><span>{isID ? 'Hadiah EXP (0–200)' : 'EXP Reward (0–200)'}</span><input type="number" min="0" max="200" value={assignment.expReward} onChange={(event) => setAssignment({ ...assignment, expReward: Number(event.target.value) })} /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Buat Assignment' : 'Create Assignment / Challenge')}</button></form>{selectedClass?.assignments?.length > 0 && <div className="tutor-journal-history"><h3>{isID ? 'Tugas Kelas Ini' : 'Class Assignments'}</h3>{selectedClass.assignments.map((item) => <article key={item.assignmentId}><span>☑</span><div><strong>{item.title}</strong><small>{isID ? 'Tenggat' : 'Due'}: {item.dueDate} • +{item.expReward} EXP</small></div></article>)}</div>}{selectedClass?.submissions?.length > 0 && <div className="tutor-review-list"><h3>{isID ? 'Pengumpulan Siswa' : 'Student Submissions'}</h3>{selectedClass.submissions.map((item) => <button type="button" key={item.submissionId} onClick={() => { setReviewItem({ ...item, kind: 'assignment' }); setReview({ score: item.score || '', feedback: item.feedback || '', expAwarded: item.expAwarded || 0 }); setPage('review'); }}><div><strong>{item.studentName}</strong><small>{item.status} • {item.response}</small></div><b>{item.status === 'Reviewed' ? `${item.score}/100` : (isID ? 'PERIKSA →' : 'REVIEW →')}</b></button>)}</div>}</section>}

      {page === 'challenges' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>GAMIFICATION</span><h2>Challenges</h2></div></div><form className="tutor-journal-form" onSubmit={createChallenge}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Template sesuai program' : 'Program Template'}</span><select value="" onChange={(event) => { const template = (overview?.challengeTemplates?.[selectedClassId] || [])[Number(event.target.value)]; if (template) setChallenge({ ...challenge, ...template, gradingMode: template.gradingMode || (['text','speech'].includes(template.responseType) ? 'automatic' : 'review') }); }}><option value="">{isID ? 'Pilih template atau isi manual' : 'Choose a template or enter manually'}</option>{(overview?.challengeTemplates?.[selectedClassId] || []).map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}</select></label><label><span>{isID ? 'Judul Challenge' : 'Challenge Title'}</span><input value={challenge.title} onChange={(event) => setChallenge({ ...challenge, title: event.target.value })} required /></label><label><span>{isID ? 'Instruksi' : 'Instructions'}</span><textarea rows="4" value={challenge.instructions} onChange={(event) => setChallenge({ ...challenge, instructions: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>{isID ? 'Jenis Jawaban' : 'Response Type'}</span><select value={challenge.responseType} onChange={(event) => setChallenge({ ...challenge, responseType: event.target.value })}><option value="text">Text</option><option value="speech">{isID ? 'Speech — Mikrofon' : 'Speech — Microphone'}</option><option value="link">Link Audio/Video/File</option></select></label><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={challenge.dueDate} onChange={(event) => setChallenge({ ...challenge, dueDate: event.target.value })} required /></label></div>{challenge.responseType === 'speech' && <label><span>{isID ? 'Target kata / frasa speaking' : 'Speaking target word / phrase'}</span><input value={challenge.answerKey} onChange={(event) => setChallenge({ ...challenge, answerKey: event.target.value })} placeholder={isID ? 'Contoh: I would like a glass of water.' : 'Example: I would like a glass of water.'} required /></label>}<label><span>{isID ? 'Hadiah EXP (0–250)' : 'EXP Reward (0–250)'}</span><input type="number" min="0" max="250" value={challenge.expReward} onChange={(event) => setChallenge({ ...challenge, expReward: Number(event.target.value) })} /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Buat Challenge' : 'Create Challenge')}</button></form>{selectedClass?.challengeResults?.length > 0 && <div className="tutor-review-list"><h3>{isID ? 'Hasil Challenge Siswa' : 'Student Challenge Results'}</h3>{selectedClass.challengeResults.map((item) => <button type="button" key={item.resultId} onClick={() => { setReviewItem({ ...item, kind: 'challenge' }); setReview({ score: item.score || '', feedback: item.feedback || '', expAwarded: item.expAwarded || 0 }); setPage('review'); }}><div><strong>{item.studentName}</strong><small>{item.status} • {item.response}</small></div><b>{item.status === 'Reviewed' ? `${item.score}/100` : (isID ? 'PERIKSA →' : 'REVIEW →')}</b></button>)}</div>}</section>}

      {page === 'review' && reviewItem && <section className="tutor-section tutor-page-section"><button className="tutor-back" type="button" onClick={() => setPage(reviewItem.kind === 'assignment' ? 'assignments' : 'challenges')}>← {isID ? 'Kembali' : 'Back'}</button><div className="tutor-class-title"><span>{reviewItem.kind.toUpperCase()}</span><h2>{reviewItem.studentName}</h2><p>{reviewItem.response}</p></div><form className="tutor-journal-form tutor-review-form" onSubmit={submitReview}><label><span>{isID ? 'Nilai (0–100)' : 'Score (0–100)'}</span><input type="number" min="0" max="100" value={review.score} onChange={(event) => setReview({ ...review, score: event.target.value })} required /></label><label><span>Feedback</span><textarea rows="4" value={review.feedback} onChange={(event) => setReview({ ...review, feedback: event.target.value })} required /></label><label><span>{isID ? 'EXP Disetujui' : 'Approved EXP'}</span><input type="number" min="0" max={reviewItem.kind === 'assignment' ? 200 : 250} value={review.expAwarded} onChange={(event) => setReview({ ...review, expAwarded: Number(event.target.value) })} /></label><button type="submit" disabled={saving}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Nilai & EXP' : 'Save Score & EXP')}</button></form></section>}

      {page === 'assessment' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>Assessment</h2></div></div><form className="tutor-journal-form" onSubmit={saveAssessment}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => { setSelectedClassId(event.target.value); setAssessment({ ...assessment, studentId: '' }); }} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Pilih Siswa' : 'Select Student'}</span><select value={assessment.studentId} onChange={(event) => setAssessment({ ...assessment, studentId: event.target.value })} required><option value="">—</option>{(selectedClass?.students || []).map((student) => <option key={student.studentId} value={student.studentId}>{student.fullName}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal' : 'Date'}</span><input type="date" value={assessment.date} onChange={(event) => setAssessment({ ...assessment, date: event.target.value })} required /></label><label><span>{isID ? 'Jenis Penilaian' : 'Assessment Type'}</span><select value={assessment.type} onChange={(event) => setAssessment({ ...assessment, type: event.target.value })}><option>Monthly Assessment</option><option>Quiz</option><option>Test</option><option>Project</option><option>Placement Test</option></select></label></div><div className="tutor-score-grid">{['speaking','writing','reading','listening','quizTest'].map((skill) => <label key={skill}><span>{skill === 'quizTest' ? 'Quiz / Test' : skill.charAt(0).toUpperCase() + skill.slice(1)}</span><input type="number" min="0" max="100" value={assessment[skill]} onChange={(event) => setAssessment({ ...assessment, [skill]: event.target.value })} placeholder="0–100" /></label>)}</div><label><span>{isID ? 'Komentar Penilaian' : 'Assessment Comment'}</span><textarea rows="3" value={assessment.comment} onChange={(event) => setAssessment({ ...assessment, comment: event.target.value })} /></label><button type="submit" disabled={saving || !selectedClassId || !assessment.studentId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Penilaian' : 'Save Assessment')}</button></form></section>}

      <nav className="tutor-bottom-navigation tutor-five-navigation"><button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><span>⌂</span>{isID ? 'Beranda' : 'Home'}</button><button className={['classes','class','student','attendance','report'].includes(page) ? 'active' : ''} onClick={() => setPage('classes')}><span>▤</span>{isID ? 'Kelas' : 'Classes'}</button><button className={page === 'journal' ? 'active' : ''} onClick={() => setPage('journal')}><span>✎</span>Journal</button><button className={['academic','assignments','assessment','notes','challenges','review'].includes(page) ? 'active' : ''} onClick={() => setPage('academic')}><span>★</span>{isID ? 'Akademik' : 'Academic'}</button><button onClick={onLogout}><span>↪</span>{isID ? 'Keluar' : 'Sign Out'}</button></nav>
    </main>
  );
}

function StudentMainMenu({ user, token, overview, overviewLoading, overviewMessage, onRefreshOverview, onLogout, language, theme, onThemeChange }) {
  const isID = language === 'ID';
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const checkInParams = new URLSearchParams(window.location.search);
  const directCheckIn = checkInParams.has('checkin');
  const directAutoCheckIn = directCheckIn && checkInParams.get('auto') !== '0';
  const [detailPage, setDetailPage] = useState(() => directCheckIn ? 'checkin' : 'landing');
  const [pageHistory, setPageHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadWeather() {
    setWeatherLoading(true);

    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-1.2675&longitude=116.8289&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FMakassar'
      );
      const result = await response.json();

      if (!response.ok || !result.current) {
        throw new Error('Cuaca tidak tersedia.');
      }

      setWeather(result.current);
    } catch {
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    loadWeather();
    return () => window.clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 11
      ? (isID ? 'Selamat Pagi' : 'Good Morning')
      : hour < 15
        ? (isID ? 'Selamat Siang' : 'Good Afternoon')
        : hour < 19
          ? (isID ? 'Selamat Sore' : 'Good Evening')
          : (isID ? 'Selamat Malam' : 'Good Night');
  const studentFullName = String(
    overview?.profile?.fullName || user.fullName || 'Student'
  ).trim();
  const weatherInfo = (isID ? WEATHER_CODES : WEATHER_CODES_EN)[weather?.weather_code] || [
    isID ? 'Cuaca berubah' : 'Changing weather',
    '🌤️',
  ];
  const monthlyAttendance = overview?.monthly?.attendance;
  const experience = overview?.experience || {};
  const totalExp = Number(experience.totalExp || 0);
  const rankInfo = getExpRank(totalExp);
  const currentRank = rankInfo.current.name;
  const expProgress = rankInfo.progress;
  function openStudentPage(page) {
    setMenuOpen(false);
    setPageHistory((history) => [...history, detailPage]);
    setDetailPage(page);
  }

  function openDetailPage(page) {
    if (page === detailPage) return;
    setPageHistory((history) => [...history, detailPage]);
    setDetailPage(page);
  }

  function goBack() {
    const previousPage = pageHistory.length ? pageHistory[pageHistory.length - 1] : 'landing';
    setPageHistory((history) => history.slice(0, -1));
    setDetailPage(previousPage);
  }

  function openRootPage(page) {
    setMenuOpen(false);
    setPageHistory([]);
    setDetailPage(page);
  }

  useEdgeSwipeBack(goBack, detailPage !== 'landing');

  const headerActivePage = detailPage === 'landing'
    ? 'landing'
    : detailPage === 'checkin'
      ? 'checkin'
      : detailPage === 'badges'
        ? 'badges'
      : detailPage === 'payment'
        ? 'payment'
        : (detailPage === 'menu' || detailPage === 'profile')
          ? 'profile'
          : 'full-report';

  function renderStudentShell(content) {
    return (
      <main className="student-app-shell">
        <StudentPersistentHeader
          language={language}
          overview={overview}
          studentFullName={studentFullName}
          activePage={headerActivePage}
          onNavigate={openRootPage}
          accountOpen={menuOpen}
          onToggleAccount={() => setMenuOpen((value) => !value)}
          onCloseAccount={() => setMenuOpen(false)}
          onAccountSelect={openStudentPage}
          onLogout={onLogout}
        />
        <div className="student-shell-content">
          {content}
        </div>
      </main>
    );
  }

  if (detailPage === 'menu') {
    return renderStudentShell(
      <StudentFullMenu
        embedded
        language={language}
        overview={overview}
        onBack={() => openRootPage('landing')}
        onSelect={openDetailPage}
        onLogout={onLogout}
      />
    );
  }

  if (detailPage === 'checkin') {
    return renderStudentShell(
      <StudentAttendanceCheckIn
        embedded
        language={language}
        token={token}
        overview={overview}
        onDone={onRefreshOverview}
        onBack={() => openRootPage('landing')}
        autoStart={directAutoCheckIn}
      />
    );
  }

  if (detailPage !== 'landing') {
    return renderStudentShell(
      <StudentDetailPage
        embedded
        language={language}
        page={detailPage}
        token={token}
        overview={overview}
        onRefreshOverview={onRefreshOverview}
        onBack={goBack}
        onSelect={openDetailPage}
        onLogout={onLogout}
      />
    );
  }

  return renderStudentShell(
    <section className="student-main-menu student-main-menu-embedded">

      <section className="student-hero-card">
        <div className="student-sun-icon">☀️</div>
        <p className="student-greeting">
          {greeting},
          <span>{studentFullName}</span>
        </p>
        <p className="student-motivation">
          {isID ? 'Mulai harimu dengan semangat dan raih tujuanmu.' : 'Start your day with enthusiasm and achieve your goals.'}
        </p>

        <div className="student-date-row">
          <span>📅</span>
          {new Intl.DateTimeFormat(isID ? 'id-ID' : 'en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'Asia/Makassar',
          }).format(now)}
        </div>

        <div className="student-time-row">
          <span>◷</span>
          {new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Makassar',
          }).format(now)}
        </div>

        <section className="student-weather-card">
          {weatherLoading ? (
            <div className="weather-unavailable">{isID ? 'Memuat cuaca Balikpapan...' : 'Loading Balikpapan weather...'}</div>
          ) : weather ? (
            <>
              <div className="weather-main">
                <span className="weather-icon">{weatherInfo[1]}</span>
                <div>
                  <strong>{Math.round(weather.temperature_2m)}°C</strong>
                  <span>{weatherInfo[0]}</span>
                </div>
                <p>Balikpapan</p>
              </div>
              <div className="weather-details">
                <div><span>🌡️ FEELS</span><strong>{Math.round(weather.apparent_temperature)}°C</strong></div>
                <div><span>💧 HUMID</span><strong>{weather.relative_humidity_2m}%</strong></div>
                <div><span>💨 WIND</span><strong>{Math.round(weather.wind_speed_10m)} km/h</strong></div>
              </div>
            </>
          ) : (
            <div className="weather-unavailable">{isID ? 'Data cuaca belum tersedia.' : 'Weather data is not available.'}</div>
          )}
        </section>

        {(() => {
          const tuition = overview?.monthly?.payment || {};
          const tuitionStatus = String(tuition.status || '').trim();
          const paid = /^(lunas|paid)$/i.test(tuitionStatus);
          const pending = /menunggu verifikasi/i.test(tuitionStatus);
          const holiday = /^libur$/i.test(tuitionStatus);
          const onLeave = /^cuti$/i.test(tuitionStatus);

          if (paid || holiday || onLeave) return null;

          return (
            <button type="button" className={`student-home-tuition-alert ${pending ? 'pending' : 'active'}`} onClick={() => openStudentPage('payment')}>
              <span>{pending ? '◷' : '!'}</span>
              <div>
                <small>{pending ? (isID ? 'PEMBAYARAN DIPERIKSA' : 'PAYMENT IN REVIEW') : (isID ? 'TAGIHAN LES AKTIF' : 'ACTIVE TUITION BILL')}</small>
                <strong>{pending ? (isID ? 'Menunggu verifikasi Admin' : 'Waiting for Admin verification') : `${formatRupiah(150000)} • ${isID ? 'Batas tanggal 7' : 'Due on the 7th'}`}</strong>
              </div>
              <b>→</b>
            </button>
          );
        })()}

        <section className="student-status-area">
          <article className="student-rank-card">
            <span className="rank-brand">MR ONE COURSE</span>
            <div className="rank-emblem"><span>✓</span><small>RANK</small></div>
            <p>{studentFullName} • {isID ? 'STATUS SAAT INI' : 'CURRENT STATUS'}</p>
            <h2>{currentRank}</h2>
            <div className="exp-progress"><span style={{ width: `${expProgress}%` }} /></div>
            <div className="exp-meta">
              <strong>⚡ {totalExp} Total EXP</strong>
              <span>{rankInfo.next ? `${isID ? 'Rank berikutnya' : 'Next rank'}: ${rankInfo.next.name} • ${rankInfo.remaining} EXP` : (isID ? 'Rank tertinggi tercapai' : 'Highest rank achieved')}</span>
            </div>
          </article>
        </section>
      </section>

    </section>
  );
}

function StudentNavIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
  };

  if (name === 'home') {
    return (
      <svg className="student-nav-icon" {...common}>
        <path d="M3.5 10.5 12 3.4l8.5 7.1v9.1a1 1 0 0 1-1 1h-5.1v-6.2H9.6v6.2H4.5a1 1 0 0 1-1-1Z" />
      </svg>
    );
  }

  if (name === 'academic') {
    return (
      <svg className="student-nav-icon" {...common}>
        <path d="M4.2 5.2A2.2 2.2 0 0 1 6.4 3h5.1v16.8H6.4a2.2 2.2 0 0 0-2.2 2.2Z" />
        <path d="M19.8 5.2A2.2 2.2 0 0 0 17.6 3h-5.1v16.8h5.1a2.2 2.2 0 0 1 2.2 2.2Z" />
      </svg>
    );
  }

  if (name === 'checkin') {
    return (
      <svg className="student-nav-icon student-nav-checkin-icon" {...common}>
        <circle cx="12" cy="12" r="9.1" />
        <path d="M7.2 7.2h3.6v3.6H7.2zM13.2 7.2h3.6v3.6h-3.6zM7.2 13.2h3.6v3.6H7.2z" />
        <path d="M13.2 13.2h1.7v1.7h-1.7zM15.7 13.2h1.2v3.6h-1.2zM13.2 15.7h1.7v1.1h-1.7z" />
      </svg>
    );
  }

  if (name === 'tuition') {
    return (
      <svg className="student-nav-icon" {...common}>
        <rect x="3.2" y="5.3" width="17.6" height="13.4" rx="2.2" />
        <path d="M3.7 9.4h16.6M7 14.2h3.8" />
      </svg>
    );
  }

  if (name === 'badges') {
    return (
      <svg className="student-nav-icon" {...common}>
        <circle cx="12" cy="9" r="5.4" />
        <path d="m8.5 13.2-1 7.3 4.5-2.6 4.5 2.6-1-7.3" />
        <path d="m12 5.8 1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3Z" />
      </svg>
    );
  }

  return (
    <svg className="student-nav-icon" {...common}>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function StudentBottomNavigation({ activePage, onNavigate, language }) {
  const isID = language === 'ID';
  const [expanded, setExpanded] = useState(false);
  const items = [
    { page: 'landing', icon: 'home', label: isID ? 'Beranda' : 'Home' },
    { page: 'full-report', icon: 'academic', label: isID ? 'Akademik' : 'Academic' },
    { page: 'checkin', icon: 'checkin', label: 'Check-in' },
    { page: 'menu', icon: 'menu', label: 'Menu' },
  ];

  useEffect(() => {
    if (!expanded) return undefined;
    const timer = window.setTimeout(() => setExpanded(false), 4500);
    return () => window.clearTimeout(timer);
  }, [expanded]);

  function navigate(page) {
    onNavigate(page);
    setExpanded(false);
  }

  return (
    <div className={`student-floating-nav-shell ${expanded ? 'expanded' : 'collapsed'}`}>
      <nav
        className="student-bottom-navigation"
        aria-label={isID ? 'Navigasi siswa mengambang' : 'Floating student navigation'}
        aria-hidden={!expanded}
      >
        {items.map((item) => (
          <button
            key={item.page}
            className={`${activePage === item.page ? 'active' : ''} ${item.page === 'checkin' ? 'student-checkin-nav-main' : ''}`.trim()}
            type="button"
            onClick={() => navigate(item.page)}
            aria-label={item.label}
            title={item.label}
            tabIndex={expanded ? 0 : -1}
          >
            <StudentNavIcon name={item.icon} />
            <span className="student-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        className="student-floating-nav-toggle"
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded
          ? (isID ? 'Sembunyikan navigasi' : 'Hide navigation')
          : (isID ? 'Tampilkan navigasi' : 'Show navigation')}
        title={expanded
          ? (isID ? 'Sembunyikan navigasi' : 'Hide navigation')
          : (isID ? 'Tampilkan navigasi' : 'Show navigation')}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={expanded ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'} />
        </svg>
      </button>
    </div>
  );
}

function StudentAttendanceCheckIn({ token, overview, onDone, onBack, autoStart = true, embedded = false, language }) {
  const isID = language === 'ID';
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState(autoStart
    ? (isID ? 'Memulai check-in otomatis. Izinkan akses lokasi bila diminta.' : 'Starting automatic check-in. Allow location access if prompted.')
    : (isID ? 'Izinkan akses lokasi untuk mencatat kehadiran Anda.' : 'Allow location access to record your attendance.'));
  const [result, setResult] = useState(null);

  function startCheckIn() {
    if (!navigator.geolocation) {
      setStatus('error');
      setMessage(isID ? 'Perangkat ini tidak mendukung layanan lokasi.' : 'This device does not support location services.');
      return;
    }

    setStatus('locating');
    setMessage(isID ? 'Memeriksa lokasi dan jadwal kelas Anda...' : 'Checking your location and class schedule...');
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        setStatus('submitting');
        const response = await callApi({
          action: 'submitStudentAttendance', token,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setResult(response);
        setStatus('success');
        setMessage(response?.alreadyRecorded
          ? (isID ? 'Kehadiran Anda sudah tercatat untuk pertemuan ini.' : 'Your attendance is already recorded for this meeting.')
          : (isID ? 'Kehadiran berhasil dicatat.' : 'Attendance recorded successfully.'));
        try {
          if (onDone) await onDone();
        } catch {
          // Refresh ringkasan tidak boleh mengubah check-in yang sudah berhasil menjadi gagal.
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || (isID ? 'Kehadiran tidak dapat dicatat.' : 'Attendance could not be recorded.'));
      }
    }, (error) => {
      setStatus('error');
      if (error.code === 1) setMessage(isID ? 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser.' : 'Location permission was denied. Please allow location access in your browser settings.');
      else if (error.code === 2) setMessage(isID ? 'Lokasi tidak tersedia. Aktifkan GPS lalu coba lagi.' : 'Your location is unavailable. Turn on GPS and try again.');
      else setMessage(isID ? 'Pemeriksaan lokasi terlalu lama. Dekati ruang kelas lalu coba lagi.' : 'Location check timed out. Move closer to the classroom and try again.');
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  useEffect(() => {
    if (autoStart) startCheckIn();
  }, []);

  const checkInContent = (
    <>
      <section className={`checkin-card ${status}`}>
        <div className="checkin-icon">
          {status === 'error' ? '!' : <CheckInQrIcon success={status === 'success'} />}
        </div>
        <span className="checkin-label">{isID ? 'VERIFIKASI QR + GPS' : 'QR + GPS VERIFICATION'}</span>
        <h2>{status === 'success' ? (result?.alreadyRecorded ? (isID ? 'Sudah Tercatat' : 'Already Recorded') : (isID ? 'Anda Hadir!' : 'You Are Present!')) : status === 'error' ? (isID ? 'Check-in Gagal' : 'Check-in Failed') : status === 'ready' ? (isID ? 'Check-in Kehadiran' : 'Check In Attendance') : (isID ? 'Memverifikasi Kehadiran' : 'Verifying Attendance')}</h2>
        <p>{message}</p>
        <div className="checkin-info">
          <div><span>{isID ? 'Siswa' : 'Student'}</span><strong>{overview?.profile?.fullName || '—'}</strong></div>
          <div><span>{isID ? 'Kelas' : 'Class'}</span><strong>{result?.className || overview?.program?.className || '—'}</strong></div>
          {result?.checkInTime && <div><span>Check-in</span><strong>{result.checkInTime}</strong></div>}
          {result?.distanceMeters != null && <div><span>{isID ? 'Jarak' : 'Distance'}</span><strong>{result.distanceMeters} m {isID ? 'dari kelas' : 'from class'}</strong></div>}
        </div>
        {(status === 'ready' || status === 'error') && <button className="checkin-primary" type="button" onClick={startCheckIn}>{status === 'error' ? (isID ? 'Coba Lagi' : 'Try Again') : (isID ? 'CHECK-IN SEKARANG' : 'CHECK IN NOW')}</button>}
        {status === 'success' && onBack && <button className="checkin-primary" type="button" onClick={onBack}>{isID ? 'Kembali ke Beranda Siswa' : 'Back to Student Home'}</button>}
        {(status === 'locating' || status === 'submitting') && <div className="checkin-spinner" aria-label="Loading" />}
      </section>
      <p className="checkin-privacy">{isID ? 'Lokasi hanya direkam saat Anda melakukan check-in.' : 'Your location is recorded only when you check in.'}</p>
    </>
  );

  if (embedded) return <div className="attendance-checkin-section">{checkInContent}</div>;

  return (
    <main className="student-checkin-page">
      <header><button type="button" onClick={onBack}>←</button><div><span>MR ONE COURSE</span><h1>{isID ? 'Check-in Kehadiran' : 'Attendance Check-in'}</h1></div></header>
      {checkInContent}
    </main>
  );
}

function StudentFullMenu({ overview, onBack, onSelect, onLogout, language, embedded = false }) {
  const isID = language === 'ID';

  const Root = embedded ? 'section' : 'main';

  return (
    <Root className={`student-full-menu ${embedded ? 'student-full-menu-embedded' : ''}`.trim()}>
      {!embedded && (
        <header className="full-menu-header">
          <button type="button" onClick={onBack}>☰</button>
          <div><h1>{isID ? 'MENU UTAMA' : 'MAIN MENU'}</h1></div>
          <span className="full-cloud-status">☁ {isID ? 'Tersimpan' : 'Saved to Cloud'}</span>
          <button type="button" onClick={() => window.location.reload()}>↻</button>
        </header>
      )}

      <section className="scroll-report-cards">
        <button type="button" onClick={() => onSelect('profile')}><div><span>{isID ? 'Profil Saya' : 'My Profile'}</span><strong className="report-text-value">{overview?.profile?.fullName || '—'}</strong><small>{overview?.profile?.studentId || 'Student ID'}</small></div><i className="purple">👤</i></button>
        <button type="button" onClick={() => onSelect('payment')}><div><span>Tuition</span><strong className="report-text-value">{isID ? 'Bayar Les' : 'Pay Tuition'}</strong><small>{isID ? 'Pembayaran dan konfirmasi les' : 'Tuition payment and confirmation'}</small></div><i className="teal">💳</i></button>
      </section>

      <button className="full-menu-logout" type="button" onClick={onLogout}><ModernSignOutIcon /><span>{isID ? 'Keluar dari Akun' : 'Sign Out'}</span></button>
      {!embedded && (
        <StudentBottomNavigation
          language={language}
          activePage="menu"
          onNavigate={(page) => page === 'landing' ? onBack() : onSelect(page)}
        />
      )}
    </Root>
  );
}

function SkillRadar({ scores, isID }) {
  const keys = ['speaking', 'writing', 'reading', 'listening'];
  const values = keys.map((key) => {
    const value = Number(scores?.[key]);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  });
  const hasData = values.some((value) => value !== null);
  const safe = values.map((value) => value ?? 0);
  const points = [
    [100, 100 - safe[0] * .72],
    [100 + safe[1] * .72, 100],
    [100, 100 + safe[2] * .72],
    [100 - safe[3] * .72, 100],
  ].map((point) => point.join(',')).join(' ');

  return (
    <div className="skill-radar-wrap">
      <svg className="skill-radar" viewBox="0 0 200 200" role="img" aria-label={isID ? 'Grafik kemampuan Bahasa Inggris' : 'English skill chart'}>
        <polygon points="100,28 172,100 100,172 28,100" className="radar-grid outer" />
        <polygon points="100,52 148,100 100,148 52,100" className="radar-grid" />
        <polygon points="100,76 124,100 100,124 76,100" className="radar-grid" />
        <line x1="100" y1="28" x2="100" y2="172" className="radar-axis" />
        <line x1="28" y1="100" x2="172" y2="100" className="radar-axis" />
        {hasData && <polygon points={points} className="radar-value" />}
        <text x="100" y="13" textAnchor="middle">Speaking {values[0] ?? '—'}</text>
        <text x="178" y="97" textAnchor="start">Writing</text><text x="178" y="110" textAnchor="start">{values[1] ?? '—'}</text>
        <text x="100" y="192" textAnchor="middle">Reading {values[2] ?? '—'}</text>
        <text x="22" y="97" textAnchor="end">Listening</text><text x="22" y="110" textAnchor="end">{values[3] ?? '—'}</text>
      </svg>
      {!hasData && <p>{isID ? 'Analisis keterampilan menunggu hasil penilaian.' : 'Skill analytics are awaiting assessment results.'}</p>}
    </div>
  );
}

function StudentAssignmentQuestions({ assignment, answers, onChange, isID }) {
  const rows = Array.isArray(assignment.questions) ? assignment.questions : [];
  return <div className="student-question-list">{rows.map((question, questionIndex) => <fieldset key={question.id || questionIndex}><legend><span>{questionIndex + 1}</span><strong>{question.text}</strong><b>{question.points || 0} {isID ? 'poin' : 'pts'}</b></legend>{question.options.map((option, optionIndex) => <label className={Number(answers?.[question.id]) === optionIndex ? 'selected' : ''} key={optionIndex}><input type="radio" name={`${assignment.assignmentId}-${question.id}`} checked={Number(answers?.[question.id]) === optionIndex} onChange={() => onChange({ ...(answers || {}), [question.id]: optionIndex })} /><span>{String.fromCharCode(65 + optionIndex)}</span><p>{option}</p></label>)}</fieldset>)}</div>;
}


function SpeakingChallengeRecorder({ item, isID, value, onChange, disabled }) {
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [localScore, setLocalScore] = useState(null);
  const target = String(item.speechTarget || item.instructions || '').trim();

  function normalizeSpeech(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function calculateMatch(transcript) {
    const targetWords = normalizeSpeech(target).split(' ').filter(Boolean);
    const spokenWords = normalizeSpeech(transcript).split(' ').filter(Boolean);
    if (!targetWords.length || !spokenWords.length) return 0;
    const matched = targetWords.filter((word) => spokenWords.includes(word)).length;
    const precision = matched / spokenWords.length;
    const recall = matched / targetWords.length;
    return Math.round((precision + recall) / 2 * 100);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback(isID
        ? 'Browser ini belum mendukung pengenalan suara. Gunakan Chrome/Edge terbaru dan izinkan mikrofon.'
        : 'This browser does not support speech recognition. Use the latest Chrome/Edge and allow microphone access.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setFeedback(isID ? 'Mendengarkan... ucapkan target dengan jelas.' : 'Listening... say the target clearly.');
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      const score = calculateMatch(transcript);
      onChange(transcript);
      setLocalScore(score);
      setFeedback(
        score >= 90
          ? (isID ? 'Sangat baik! Pengucapan terdeteksi sangat dekat dengan target.' : 'Excellent! Your detected speech is very close to the target.')
          : score >= 75
            ? (isID ? 'Bagus. Ulangi sekali lagi untuk meningkatkan ketepatan kata.' : 'Good. Try once more to improve word accuracy.')
            : score >= 55
              ? (isID ? 'Cukup baik. Perhatikan kata yang belum terbaca dengan jelas.' : 'Fair. Focus on words that were not detected clearly.')
              : (isID ? 'Coba lagi lebih pelan dan jelas, lalu dekatkan mikrofon.' : 'Try again more slowly and clearly, with the microphone closer.')
      );
    };

    recognition.onerror = (event) => {
      setFeedback(
        event.error === 'not-allowed'
          ? (isID ? 'Izin mikrofon belum diberikan.' : 'Microphone permission has not been granted.')
          : (isID ? 'Suara belum terbaca. Silakan coba lagi.' : 'Speech was not detected. Please try again.')
      );
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className="speaking-recorder">
      <div className="speaking-target-card">
        <span><BadgeGlyph name="mic" /></span>
        <div>
          <small>{isID ? 'IKUTI & UCAPKAN' : 'LISTEN & REPEAT'}</small>
          <strong>{target || (isID ? 'Target kata, frasa, atau sentence dari tutor' : 'Target word, phrase, or sentence from tutor')}</strong>
        </div>
      </div>
      <button className={`microphone-record-button ${listening ? 'recording' : ''}`} type="button" onClick={startListening} disabled={disabled || listening}>
        <BadgeGlyph name="mic" />
        <span>{listening ? (isID ? 'Sedang Mendengarkan...' : 'Listening...') : (isID ? 'Tekan & Ucapkan' : 'Tap & Speak')}</span>
      </button>
      {value && (
        <div className="speech-transcript">
          <small>{isID ? 'TERDETEKSI' : 'DETECTED'}</small>
          <strong>“{value}”</strong>
          {localScore != null && <b>{localScore}/100</b>}
        </div>
      )}
      {feedback && <p className="speech-feedback">{feedback}</p>}
    </div>
  );
}

function LearningReadReward({ token, entry, isID, onCompleted, onReward, disabled }) {
  const [state, setState] = useState(entry.readCompleted ? 'done' : 'idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setState(entry.readCompleted ? 'done' : 'idle');
  }, [entry.readCompleted]);

  async function completeReading() {
    if (disabled || state !== 'idle' || !entry.title) return;
    setState('loading');
    try {
      const result = await callApi({
        action: 'completeLearningActivityRead',
        token,
        meetingNumber: entry.meetingNumber,
      });
      setState('done');
      setMessage(result.alreadyCompleted
        ? (isID ? 'Sudah tercatat sebelumnya.' : 'Already recorded.')
        : `+${result.expAwarded || 25} EXP`);
      if (!result.alreadyCompleted && onReward) onReward(result);
      await onCompleted();
    } catch (error) {
      setState('idle');
      setMessage(error.message || (isID ? 'Belum berhasil mencatat bacaan.' : 'Could not record reading completion.'));
    }
  }

  return (
    <div className={`learning-read-reward ${state === 'done' ? 'done' : ''}`}>
      <div>
        <small>{isID ? 'MISI MEMBACA' : 'READING MISSION'}</small>
        <strong>{state === 'done'
          ? (isID ? 'Ringkasan sudah dibaca' : 'Summary completed')
          : (isID ? 'Sudah membaca sampai akhir?' : 'Finished reading this summary?')}</strong>
        <span>{state === 'done'
          ? (message || `+${entry.readExp || 25} EXP`)
          : (isID ? 'Tandai selesai untuk mendapatkan 25 EXP.' : 'Mark as complete to earn 25 EXP.')}</span>
      </div>
      <button type="button" disabled={disabled || state !== 'idle'} onClick={completeReading}>
        {state === 'loading' ? '...' : state === 'done' ? '✓' : `+${entry.readExp || 25} EXP`}
      </button>
    </div>
  );
}


function GamificationRewardToast({ reward, onClose, isID }) {
  useEffect(() => {
    if (!reward) return undefined;
    const timer = window.setTimeout(onClose, reward.rankUp ? 5200 : reward.badgeUnlocked ? 4400 : 3200);
    return () => window.clearTimeout(timer);
  }, [reward, onClose]);

  if (!reward) return null;

  return (
    <div className={`gamification-reward-toast ${reward.rankUp ? 'rank-up' : reward.badgeUnlocked ? 'badge-unlock' : ''}`}>
      <div className="gamification-reward-icon">
        <BadgeGlyph name={reward.rankUp ? 'allround' : reward.badgeUnlocked ? 'perfect' : 'learner'} />
      </div>
      <div>
        <small>
          {reward.rankUp
            ? (isID ? 'RANK NAIK' : 'RANK UP')
            : reward.badgeUnlocked
              ? (isID ? 'BADGE TERBUKA' : 'BADGE UNLOCKED')
              : (isID ? 'EXP DIDAPAT' : 'EXP EARNED')}
        </small>
        <strong>
          {reward.rankName || reward.badgeName || reward.message || (isID ? 'Aktivitas selesai' : 'Activity completed')}
        </strong>
        {Number(reward.expAwarded || 0) > 0 && <span>⚡ +{Number(reward.expAwarded || 0)} EXP</span>}
      </div>
      <button type="button" aria-label={isID ? 'Tutup' : 'Close'} onClick={onClose}>×</button>
    </div>
  );
}


const GRAMMAR_CURRICULUM = [
  {
    key: 'partsOfSpeech',
    title: 'Parts of Speech',
    subtitleID: 'Fondasi jenis dan fungsi kata',
    subtitleEN: 'Foundation of word classes and functions',
    topics: [
      'Noun: common, proper, concrete, abstract, collective, countable & uncountable',
      'Pronoun: subject, object, possessive, reflexive, demonstrative',
      'Verb: action, linking, auxiliary & modal',
      'Adjective: description, order & comparison',
      'Adverb: manner, frequency, time & place',
      'Preposition: place, time & movement',
      'Conjunction: coordinating & subordinating',
      'Interjection, articles & basic determiners',
    ],
  },
  {
    key: 'tenses',
    title: '16 Tenses',
    subtitleID: 'Pola waktu dan perubahan bentuk verb',
    subtitleEN: 'Time patterns and verb-form changes',
    topics: [
      'Simple Present • Present Continuous • Present Perfect • Present Perfect Continuous',
      'Simple Past • Past Continuous • Past Perfect • Past Perfect Continuous',
      'Simple Future • Future Continuous • Future Perfect • Future Perfect Continuous',
      'Past Future • Past Future Continuous • Past Future Perfect • Past Future Perfect Continuous',
      'Time signals, affirmative, negative & interrogative forms',
      'Choosing the correct tense from context',
    ],
  },
  {
    key: 'grammarEssential',
    title: 'Grammar Essential',
    subtitleID: 'Struktur penting untuk grammar tingkat lanjut',
    subtitleEN: 'Essential structures for stronger grammar',
    topics: [
      'Subject–Verb Agreement & sentence patterns',
      'Auxiliary verbs, modals & question forms',
      'Gerund & To-Infinitive',
      'Degree of Comparison',
      'Passive Voice',
      'Conditional Sentences',
      'Direct & Indirect / Reported Speech',
      'Relative Clauses, quantifiers & selected grammar review',
    ],
  },
];

function AcademicRadarChart({ metrics = [], isID = true }) {
  const usable = (metrics || []).slice(0, 4).map((metric) => {
    const raw = Number(metric?.value);
    const denominatorMatch = String(metric?.suffix || '').match(/^\/(\d+)$/);
    let normalized = Number.isFinite(raw) ? raw : 0;
    if (denominatorMatch) normalized = denominatorMatch[1] ? (normalized / Number(denominatorMatch[1])) * 100 : normalized;
    normalized = Math.max(0, Math.min(100, normalized));
    return { ...metric, normalized };
  });

  while (usable.length < 4) {
    usable.push({ label: '—', value: null, normalized: 0 });
  }

  const center = 120;
  const radius = 76;
  const angles = [-90, 0, 90, 180];

  const point = (angle, value = 100) => {
    const rad = (angle * Math.PI) / 180;
    const r = radius * (value / 100);
    return [center + Math.cos(rad) * r, center + Math.sin(rad) * r];
  };

  const gridLevels = [25, 50, 75, 100];
  const valuePoints = usable.map((metric, index) => point(angles[index], metric.normalized));
  const polygon = valuePoints.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="academic-radar">
      <svg viewBox="0 0 240 240" role="img" aria-label={isID ? 'Grafik perkembangan akademik' : 'Academic progress chart'}>
        {gridLevels.map((level) => (
          <polygon
            key={level}
            className="academic-radar-grid"
            points={angles.map((angle) => point(angle, level).join(',')).join(' ')}
          />
        ))}
        {angles.map((angle, index) => {
          const [x, y] = point(angle, 100);
          return <line className="academic-radar-axis" x1={center} y1={center} x2={x} y2={y} key={`axis-${index}`} />;
        })}
        <polygon className="academic-radar-value" points={polygon} />
        {valuePoints.map(([x, y], index) => <circle className="academic-radar-dot" cx={x} cy={y} r="4" key={`dot-${index}`} />)}
      </svg>
      <div className="academic-radar-label top"><span>{usable[0].label}</span><strong>{usable[0].value ?? '—'}</strong></div>
      <div className="academic-radar-label right"><span>{usable[1].label}</span><strong>{usable[1].value ?? '—'}</strong></div>
      <div className="academic-radar-label bottom"><span>{usable[2].label}</span><strong>{usable[2].value ?? '—'}</strong></div>
      <div className="academic-radar-label left"><span>{usable[3].label}</span><strong>{usable[3].value ?? '—'}</strong></div>
    </div>
  );
}


function QrisPaymentDisplay({ isID }) {
  const [qrisAvailable, setQrisAvailable] = useState(true);

  return (
    <div className="qris-payment-box qris-payment-box-v64">
      {qrisAvailable ? (
        <img
          src="/qris-mr-one-course.jpeg"
          alt="QRIS Mr One Course"
          onError={() => setQrisAvailable(false)}
        />
      ) : (
        <div className="qris-missing-safe">
          <strong>QRIS MR ONE COURSE</strong>
          <span>{isID ? 'Barcode QRIS belum tersedia pada file aplikasi.' : 'The QRIS barcode is not yet available in the app files.'}</span>
        </div>
      )}
      <div>
        <strong>QRIS Mr One Course</strong>
        <p>
          {isID
            ? 'Pindai barcode QRIS menggunakan aplikasi bank atau e-wallet, lalu masukkan nominal sesuai tagihan.'
            : 'Scan the QRIS barcode using your banking or e-wallet app, then enter the invoice amount.'}
        </p>
      </div>
    </div>
  );
}

function StudentDetailPage({ page, token, overview, onRefreshOverview, onBack, onSelect, onLogout, language, embedded = false }) {
  const isID = language === 'ID';
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  async function changeStudentPassword(event) {
    event.preventDefault();
    setPasswordMessage('');

    if (!passwordForm.currentPassword || String(passwordForm.newPassword || '').length < 8) {
      setPasswordMessage(isID ? 'Isi password saat ini dan password baru minimal 8 karakter.' : 'Enter your current password and a new password of at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage(isID ? 'Konfirmasi password baru tidak sama.' : 'New password confirmation does not match.');
      return;
    }

    setPasswordChanging(true);
    try {
      const result = await callApi({
        action: 'changeOwnPassword',
        token,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(result.message || (isID ? 'Password berhasil diganti.' : 'Password changed successfully.'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage(error.message || (isID ? 'Password tidak dapat diganti.' : 'Password could not be changed.'));
    } finally {
      setPasswordChanging(false);
    }
  }
  const programChallenge = getProgramChallenge(overview?.program?.program, isID);
  const titles = {
    schedule: isID ? 'Jadwal Kelas' : 'Class Schedule', attendance: isID ? 'Check-in Kehadiran' : 'Attendance Check-in', 'attendance-record': isID ? 'Riwayat Kehadiran Saya' : 'My Attendance Record', payment: 'Tuition',
    profile: isID ? 'Profil Siswa' : 'Student Profile', program: isID ? 'Program Saya' : 'My Program', assignments: isID ? 'Tugas' : 'Assignments',
    missions: isID ? 'Tugas & Tantangan' : 'Assignments & Challenges',
    score: isID ? 'Level & Skor Akademik' : 'Academic Level & Score', journal: isID ? 'Aktivitas Pembelajaran' : 'Learning Activities', challenge: programChallenge.name, badges: isID ? 'Badge Saya' : 'My Badges', 'full-report': isID ? 'Ringkasan Akademik' : 'Academic Overview', 'monthly-report': isID ? 'Laporan Akademik Bulanan' : 'Monthly Academic Report',
  };
  const attendance = overview?.monthly?.attendance;
  const academicSummary = overview?.academicSummary || {};
  const experience = overview?.experience || {};
  const totalExp = Number(experience.totalExp || 0);
  const rankInfo = getExpRank(totalExp);
  const expBreakdown = experience.breakdown || {};
  const rawLevelValue = String(academicSummary?.levelAndScore?.cefrLevel || overview?.program?.level || '').trim();
  const rawCefrLevel = /^(belum ditentukan|belum tersedia|not determined|not available)$/i.test(rawLevelValue) ? '' : rawLevelValue;
  const cefrLevel = rawCefrLevel || (isID ? 'Menunggu asesmen' : 'Assessment pending');
  const cefrCardValue = rawCefrLevel ? `CEFR ${rawCefrLevel}` : cefrLevel;
  const attendanceQuestTarget = 8;
  const attendanceQuestProgress = Math.min(attendanceQuestTarget, Number(attendance?.present || 0));
  const attendanceQuestDone = attendanceQuestProgress >= attendanceQuestTarget;
  const learningActivities = Array.isArray(overview?.learningActivities) && overview.learningActivities.some((entry) => entry.title)
    ? overview.learningActivities
    : (Array.isArray(overview?.learningJournal) ? overview.learningJournal : []);
  const studentAssignments = Array.isArray(overview?.assignments) ? overview.assignments : [];
  const assignmentSummary = academicSummary?.assignments || {};
  const overviewAttendance = academicSummary?.attendance || attendance;
  const overviewNextClass = academicSummary?.nextClass || overview?.nextClass;
  const academicAverage = academicSummary?.levelAndScore?.academicAverage;
  const studentChallenges = Array.isArray(overview?.challenges) ? overview.challenges : [];
  const studentBadges = buildStudentBadges(overview, isID);
  const monthlyExperience = experience.monthly || {};
  const monthlyReport = overview?.monthlyReport || {};
  const skillScores = monthlyReport.skills || overview?.skillScores || {};
  const programReport = getProgramReportConfig(overview?.program?.program, overview, monthlyReport, isID);
  const assessmentRows = Array.isArray(monthlyReport.assessments) ? monthlyReport.assessments : [];
  const reportSessions = Array.isArray(monthlyReport.sessions) && monthlyReport.sessions.length
    ? monthlyReport.sessions
    : (overview?.recentAttendance || []).slice(0, 8).map((item, index) => ({ number: index + 1, date: item.date, topic: item.topic || item.sessionGroup || '—', status: item.status }));
  const attendanceRows = overview?.recentAttendance || [];
  const attendanceDates = attendanceRows
    .map((item) => new Date(`${item.date}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()));
  const now = new Date();
  const availableYears = [...new Set(attendanceDates.map((date) => date.getFullYear()))]
    .sort((a, b) => b - a);
  const initialYear = availableYears.includes(now.getFullYear())
    ? now.getFullYear()
    : (availableYears[0] || now.getFullYear());
  const [attendanceMonth, setAttendanceMonth] = useState(now.getMonth());
  const [attendanceYear, setAttendanceYear] = useState(initialYear);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  const [assignmentResponses, setAssignmentResponses] = useState({});
  const [challengeResponses, setChallengeResponses] = useState({});
  const [studentSubmitting, setStudentSubmitting] = useState('');
  const [studentSubmitMessage, setStudentSubmitMessage] = useState('');
  const [gamificationReward, setGamificationReward] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: '', cashRecipient: 'Mr One', paymentDate: new Date().toISOString().slice(0, 10), proof: null });
  const monthNames = isID
    ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const filteredAttendance = attendanceRows
    .filter((item) => {
      const date = new Date(`${item.date}T00:00:00`);
      return !Number.isNaN(date.getTime()) &&
        date.getMonth() === Number(attendanceMonth) &&
        date.getFullYear() === Number(attendanceYear);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentPayment = overview?.monthly?.payment || {};
  const isCurrentTuitionPaid = /^(lunas|paid)$/i.test(String(currentPayment.status || '').trim());
  const isPaymentPending = /menunggu verifikasi/i.test(String(currentPayment.status || ''));
  const paidPaymentHistory = Array.isArray(overview?.paymentCenter?.history)
    ? overview.paymentCenter.history
    : (overview?.overall?.paymentHistory || []).filter((item) => /^(lunas|paid)$/i.test(String(item.status || '').trim()));
  const tuitionAmount = Number(currentPayment.amount || 150000);
  const paymentItems = Array.isArray(overview?.paymentCenter?.items) && overview.paymentCenter.items.length ? overview.paymentCenter.items : [
    { category: 'Tuition', label: isID ? 'Les Bulanan' : 'Monthly Tuition', icon: '💳', amount: 150000, period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, status: currentPayment.status || 'Belum Lunas' },
    { category: 'Book Package', label: isID ? 'Paket 4 Buku Pendamping' : '4-Book Package', icon: '📚', amount: 150000, period: isID ? 'Sekali Bayar' : 'One-time', status: 'Belum Dibeli' },
    { category: 'ID Card', label: 'ID Card Siswa', icon: '🪪', amount: 20000, period: isID ? 'Sekali Bayar' : 'One-time', status: 'Belum Dibeli' },
  ];
  const invoiceNumber = `MOC-${overview?.profile?.studentId || 'STUDENT'}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isGrammarProgram = String(overview?.program?.program || '').toLowerCase().includes('grammar');

  function paymentPeriodLabel(period) {
    const match = String(period || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return String(period || '—');
    const monthIndex = Number(match[2]) - 1;
    return `${monthNames[monthIndex] || match[2]} ${match[1]}`;
  }

  function showGamificationReward(result, fallbackMessage = '') {
    const reward = result?.gamification || (
      Number(result?.expAwarded || 0) > 0
        ? { expAwarded: Number(result.expAwarded || 0), message: fallbackMessage || result.message || '' }
        : null
    );
    if (reward && (Number(reward.expAwarded || 0) > 0 || reward.badgeUnlocked || reward.rankUp)) {
      setGamificationReward(reward);
    }
  }

  function choosePaymentProof(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setPaymentMessage(isID ? 'Ukuran bukti maksimal 4 MB.' : 'Maximum file size is 4 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setPaymentForm((value) => ({ ...value, proof: { fileName: file.name, mimeType: file.type, base64: String(reader.result || '') } }));
    reader.onerror = () => setPaymentMessage(isID ? 'File tidak dapat dibaca.' : 'The file could not be read.');
    reader.readAsDataURL(file);
  }

  async function submitPaymentProof(event) {
    event.preventDefault();
    setPaymentMessage('');
    const isCashPayment = paymentForm.paymentMethod === 'Tunai';
    if (!paymentForm.paymentMethod || !paymentForm.paymentDate || (isCashPayment && !paymentForm.cashRecipient) || (!isCashPayment && !paymentForm.proof)) {
      setPaymentMessage(isID
        ? (isCashPayment ? 'Pilih penerima pembayaran tunai dan tanggal pembayaran.' : 'Pilih metode, tanggal, dan bukti pembayaran.')
        : (isCashPayment ? 'Choose the cash recipient and payment date.' : 'Choose a method, date, and payment proof.'));
      return;
    }
    setPaymentSubmitting(true);
    try {
      const method = isCashPayment ? `Tunai - ${paymentForm.cashRecipient}` : paymentForm.paymentMethod;
      const item = selectedPaymentItem || paymentItems[0];
      const itemInvoice = `MOC-${overview?.profile?.studentId || 'STUDENT'}-${item.category.replace(/\s+/g, '-').toUpperCase()}-${now.getTime()}`;
      const result = await callApi({
        action: 'submitPaymentConfirmation',
        token,
        payment: {
          paymentMethod: method,
          paymentDate: paymentForm.paymentDate,
          proof: isCashPayment ? null : paymentForm.proof,
          senderName: overview?.profile?.fullName || '',
          invoiceNumber: itemInvoice,
          paymentCategory: item.category,
          itemLabel: item.label,
          period: item.category === 'Tuition' ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` : 'ONE-TIME',
          amount: Number(item.amount || 0),
        },
      });
      setPaymentMessage(result.message);
      setShowPaymentForm(false);
      setSelectedPaymentItem(null);
      await onRefreshOverview();
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setPaymentSubmitting(false);
    }
  }

  function attendanceStatusMeta(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'hadir' || normalized === 'present') return { label: isID ? 'Hadir' : 'Present', className: 'present' };
    return { label: isID ? 'Tidak Hadir' : 'Absent', className: 'absent' };
  }

  async function sendAssignment(assignment) {
    const assignmentId = typeof assignment === 'string' ? assignment : assignment.assignmentId;
    const hasQuestions = Array.isArray(assignment?.questions) && assignment.questions.length > 0;
    const storedResponse = assignmentResponses[assignmentId];
    if (hasQuestions && assignment.questions.some((question) => !Object.prototype.hasOwnProperty.call(storedResponse || {}, question.id))) { setStudentSubmitMessage(isID ? 'Jawab seluruh soal sebelum mengumpulkan assignment.' : 'Answer every question before submitting the assignment.'); return; }
    const response = hasQuestions ? JSON.stringify(storedResponse || {}) : String(storedResponse || '').trim(); if (!response) return;
    setStudentSubmitting(assignmentId); setStudentSubmitMessage('');
    try { const result = await callApi({ action: 'submitStudentAssignment', token, submission: { assignmentId, response } }); setStudentSubmitMessage(result.message); showGamificationReward(result, isID ? 'Tugas selesai' : 'Assignment completed'); await onRefreshOverview(); }
    catch (error) { setStudentSubmitMessage(error.message); } finally { setStudentSubmitting(''); }
  }

  async function sendChallenge(challengeId) {
    const response = String(challengeResponses[challengeId] || '').trim(); if (!response) return;
    setStudentSubmitting(challengeId); setStudentSubmitMessage('');
    try { const result = await callApi({ action: 'submitStudentChallenge', token, submission: { challengeId, response } }); setStudentSubmitMessage(result.message); showGamificationReward(result, isID ? 'Challenge selesai' : 'Challenge completed'); await onRefreshOverview(); }
    catch (error) { setStudentSubmitMessage(error.message); } finally { setStudentSubmitting(''); }
  }

  const Root = embedded ? 'section' : 'main';

  return (
    <Root className={`student-detail-page ${embedded ? 'student-detail-embedded' : ''}`.trim()}>
      <GamificationRewardToast reward={gamificationReward} onClose={() => setGamificationReward(null)} isID={isID} />
      {!embedded && <header><button type="button" onClick={onBack}>←</button><h1>{titles[page] || (isID ? 'Menu Siswa' : 'Student Menu')}</h1></header>}
      {embedded && (
        <div className="student-page-context-heading">
          {!['full-report', 'badges', 'payment', 'profile'].includes(page) && <button type="button" onClick={onBack} aria-label={isID ? 'Kembali' : 'Back'}>←</button>}
          <div><span>{isID ? 'AREA SISWA' : 'STUDENT AREA'}</span><h1>{titles[page] || (isID ? 'Menu Siswa' : 'Student Menu')}</h1></div>
        </div>
      )}

      {page === 'full-report' && (
        <>
          <section className="academic-overview-hero academic-overview-detail">
            <h2>{isID ? 'Ringkasan Akademik Anda' : 'Your Academic Overview'}</h2>
            <p>{isID ? 'Apa yang perlu saya lakukan hari ini?' : 'What should I do today?'}</p>

            <div className="overview-four-grid">
              <div><span><ModernUiIcon name="calendar" />{isID ? 'KELAS BERIKUTNYA' : 'NEXT CLASS'}</span><strong>{overviewNextClass?.className || (isID ? 'Belum dijadwalkan' : 'Not scheduled')}</strong>{overviewNextClass && <small>{formatStudentClassDate(overviewNextClass.date, isID) || overviewNextClass.day} • {overviewNextClass.start}{overviewNextClass.end ? `–${overviewNextClass.end}` : ''}{overviewNextClass.tutor ? ` • ${overviewNextClass.tutor}` : ''}</small>}</div>
              <div><span><ModernUiIcon name="assignment" />{isID ? 'TUGAS' : 'ASSIGNMENTS'}</span><strong>{Number(assignmentSummary.pending ?? studentAssignments.length)}</strong><small>{isID ? `${Number(assignmentSummary.completed || 0)} selesai` : `${Number(assignmentSummary.completed || 0)} completed`}</small></div>
              <div><span><ModernUiIcon name="attendance" />{isID ? 'KEHADIRAN' : 'ATTENDANCE'}</span><strong>{overviewAttendance?.percentage == null ? (isID ? 'Belum ada data' : 'No data yet') : `${overviewAttendance.percentage}%`}</strong><small>{overviewAttendance?.total ? `${overviewAttendance.present}/${overviewAttendance.total} ${isID ? 'pertemuan' : 'meetings'}` : (isID ? 'Menunggu absensi pertama' : 'Waiting for first attendance')}</small></div>
              <div><span><ModernUiIcon name="score" />{isID ? 'LEVEL & SKOR' : 'LEVEL & SCORE'}</span><strong>{cefrCardValue}</strong><small>{academicAverage != null ? `${isID ? 'Nilai akademik' : 'Academic score'} ${academicAverage} • ` : ''}${totalExp} EXP</small></div>
            </div>

            <div className="overview-actions">
              <button type="button" onClick={() => onSelect('schedule')}><ModernUiIcon name="calendar" /> {isID ? 'Lihat Kelas' : 'View Class'}</button>
              <button type="button" onClick={() => onSelect('missions')}><ModernUiIcon name="assignment" /> {isID ? 'Tugas & Tantangan' : 'Assignments & Challenges'}</button>
            </div>
          </section>

          <section className="scroll-report-cards academic-summary-cards academic-priority-order">
            <button type="button" onClick={() => onSelect('attendance-record')}>
              <div><span>{isID ? 'Kehadiran' : 'Attendance'}</span><strong>{attendance?.percentage == null ? '—' : `${attendance.percentage}%`}</strong><small>{attendance?.total ? (isID ? `${attendance.present} dari ${attendance.total} pertemuan bulan ini` : `${attendance.present} of ${attendance.total} meetings this month`) : (isID ? 'Belum ada data kehadiran bulan ini' : 'No attendance data this month')}</small></div>
              <i className="green"><ModernUiIcon name="attendance" /></i>
            </button>
            <button type="button" onClick={() => onSelect('journal')}>
              <div><span>{isID ? 'Pembelajaran' : 'Learning'}</span><strong>{learningActivities.filter((entry) => entry.title).length}/8</strong><small>{isID ? 'Ringkasan materi setiap pertemuan + EXP membaca' : 'Meeting summaries + reading EXP'}</small></div>
              <i className="teal"><ModernUiIcon name="journal" /></i>
            </button>
            <button type="button" onClick={() => onSelect('score')}>
              <div><span>{isID ? 'Level & Skor' : 'Level & Score'}</span><strong className="report-text-value">{cefrCardValue}</strong><small>{academicAverage != null ? `${isID ? 'Rata-rata akademik' : 'Academic average'} ${academicAverage} • ` : ''}{Number(assignmentSummary.completed || 0)} {isID ? 'tugas selesai' : 'assignments completed'} • {totalExp} EXP</small></div>
              <i className="blue"><ModernUiIcon name="score" /></i>
            </button>
            <button type="button" onClick={() => onSelect('missions')}>
              <div>
                <span>{isID ? 'Tugas & Tantangan' : 'Assignments & Challenges'}</span>
                <strong className="report-text-value">{Number(assignmentSummary.pending ?? studentAssignments.filter((item) => !item.submission).length) + studentChallenges.filter((item) => !item.result).length} {isID ? 'aktivitas aktif' : 'active activities'}</strong>
                <small>{isID ? 'Satu tempat untuk mengerjakan tugas dan tantangan yang menambah EXP serta progres badge.' : 'One place to complete assignments and challenges that add EXP and badge progress.'}</small>
              </div>
              <i className="purple"><ModernUiIcon name="challenge" /></i>
            </button>
            <button type="button" onClick={() => onSelect('monthly-report')}>
              <div><span>{isID ? 'Laporan Bulanan' : 'Monthly Report'}</span><strong className="report-text-value">{isID ? 'Kemajuan Akademik' : 'Academic Progress'}</strong><small>{isID ? 'Keterampilan, nilai, komentar tutor, dan log pertemuan' : 'Skills, scores, tutor comments, and meeting log'}</small></div>
              <i className="blue"><ModernUiIcon name="report" /></i>
            </button>
          </section>
        </>
      )}

      {page === 'badges' && (
        <section className="student-badge-hub">
          <section className="badge-hub-hero">
            <span><BadgeGlyph name="allround" /></span>
            <div>
              <small>MY BADGES</small>
              <h2>{isID ? 'Selesaikan Misi dan Buka Badge' : 'Complete Missions and Unlock Badges'}</h2>
              <p>{isID ? 'Progres badge diperbarui otomatis setelah tugas, tantangan, kehadiran, atau misi pembelajaran selesai.' : 'Badge progress updates automatically after assignments, challenges, attendance, or learning missions are completed.'}</p>
            </div>
          </section>

          <section className="badges-section badge-hub-list unified-badge-missions">
            <div className="badges-title">
              <span><BadgeGlyph name="perfect" /></span>
              <div>
                <h2>{isID ? 'Koleksi Badge' : 'Badge Collection'}</h2>
                <p>{isID ? 'Setiap badge adalah misi. Selesaikan target, kumpulkan EXP, lalu buka badge.' : 'Every badge is a mission. Complete the target, earn EXP, and unlock the badge.'}</p>
              </div>
            </div>
            <div className="badges-grid">
              {studentBadges.map((badge) => (
                <button
                  type="button"
                  onClick={() => badge.targetPage && badge.targetPage !== 'badges' && onSelect(badge.targetPage)}
                  className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
                  key={badge.name}
                >
                  <span className="badge-icon"><BadgeGlyph name={badge.icon} /></span>
                  <strong>{badge.name}</strong>
                  <small>{badge.requirement}</small>
                  <div className="badge-exp-reward">⚡ +{badge.expReward || 0} EXP</div>
                  <div className="badge-progress"><span style={{ width: `${Math.min(100, (Number(badge.current || 0) / Math.max(1, Number(badge.target || 1))) * 100)}%` }} /></div>
                  <em>{`${Math.min(Number(badge.current || 0), Number(badge.target || 1))}/${Math.max(1, Number(badge.target || 1))}`}</em>
                  <b>{badge.unlocked ? (isID ? 'TERBUKA' : 'UNLOCKED') : (isID ? 'LANJUTKAN MISI →' : 'CONTINUE MISSION →')}</b>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {page === 'schedule' && (
        <section className="detail-panel">
          <span className="detail-label">{overview?.program?.program || 'PROGRAM'}</span>
          <h2>{overview?.program?.className || (isID ? 'Jadwal belum tersedia' : 'Schedule is not available')}</h2>
          <p>{isID ? 'Tutor' : 'Tutor'}: {overview?.program?.tutor || '—'}</p>
          {overviewNextClass && (
            <div className="next-class-date-callout">
              <span>{isID ? 'PERTEMUAN BERIKUTNYA' : 'NEXT MEETING'}</span>
              <strong>{formatStudentClassDate(overviewNextClass.date, isID)}</strong>
              <small>{overviewNextClass.day} • {overviewNextClass.start}{overviewNextClass.end ? `–${overviewNextClass.end}` : ''} WITA</small>
            </div>
          )}
          {(overview?.program?.weeklySchedule || []).map((item, index) => (
            <div className="detail-row" key={`${item.day}-${index}`}><strong>{item.day}</strong><span>{item.start}–{item.end} WITA</span></div>
          ))}
          {overview?.program?.groupLink && <a className="detail-action" href={overview.program.groupLink} target="_blank" rel="noreferrer">{isID ? 'Buka Grup Kelas' : 'Open Class Group'}</a>}
        </section>
      )}

      {page === 'attendance-record' && (
        <section className="attendance-record-page">
          <section className="attendance-month-summary">
            <div className="attendance-summary-title">
              <span>{isID ? 'BULAN INI' : 'THIS MONTH'}</span>
              <strong>{attendance?.percentage == null ? '—' : `${attendance.percentage}%`}</strong>
            </div>
            <div className="attendance-summary-grid">
              <div><strong>{attendance?.present ?? 0}</strong><span>{isID ? 'Hadir' : 'Present'}</span></div>
              <div><strong>{attendance?.absent ?? 0}</strong><span>{isID ? 'Tidak Hadir' : 'Absent'}</span></div>
            </div>
          </section>

          <div className="attendance-record-heading">
            <h2>{isID ? 'Riwayat Kehadiran Saya' : 'My Attendance Record'}</h2>
            <p>{isID ? 'Lihat riwayat kehadiran Anda.' : 'View your attendance history.'}</p>
          </div>

          <div className="attendance-record-card">
            <div className="attendance-filter-bar">
              <label>
                <span className="sr-only">Month</span>
                <select value={attendanceMonth} onChange={(event) => setAttendanceMonth(Number(event.target.value))}>
                  {monthNames.map((month, index) => <option value={index} key={month}>{month}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Year</span>
                <select value={attendanceYear} onChange={(event) => setAttendanceYear(Number(event.target.value))}>
                  {(availableYears.length ? availableYears : [now.getFullYear()]).map((year) => <option value={year} key={year}>{year}</option>)}
                </select>
              </label>
            </div>

            <div className="attendance-table-head">
              <span>NO.</span><span>{isID ? 'TANGGAL' : 'DATE'}</span><span>{isID ? 'KELAS/PERTEMUAN' : 'SESSION GROUP'}</span><span>STATUS</span>
            </div>

            <div className="attendance-table-body">
              {filteredAttendance.length ? filteredAttendance.map((item, index) => {
                const statusMeta = attendanceStatusMeta(item.status);
                const sessionText = item.meetingNumber
                  ? `${item.className || overview?.program?.className || (isID ? 'Kelas' : 'Class')} • ${isID ? 'Pertemuan' : 'Session'} ${item.meetingNumber}`
                  : `${item.className || overview?.program?.className || (isID ? 'Kelas' : 'Class')} ${isID ? 'Pertemuan' : 'Session'}`;
                return (
                  <div className="attendance-table-row" key={`${item.date}-${index}`}>
                    <span className="attendance-number">{String(index + 1).padStart(2, '0')}</span>
                    <strong className="attendance-date">{item.date}</strong>
                    <span className="attendance-session">{sessionText}</span>
                    <span className={`attendance-status ${statusMeta.className}`}>{statusMeta.label}</span>
                  </div>
                );
              }) : (
                <div className="attendance-empty">{isID ? 'Tidak ada riwayat kehadiran untuk' : 'No attendance record for'} {monthNames[attendanceMonth]} {attendanceYear}.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {page === 'payment' && (
        <section className="tuition-page payment-center-page">
          {!selectedPaymentItem && !selectedReceipt && <><div className="payment-store-hero"><img src="/logo-mr-one-course.jpeg" alt="Mr One Course" /><div><span>MR ONE STORE</span><h2>{isID ? 'Belajar, Lengkap, dan Terhubung' : 'Learn, Equipped, and Connected'}</h2><p>{isID ? 'Bayar les dan dapatkan kebutuhan belajar resmi Mr One Course.' : 'Pay tuition and get official Mr One Course learning essentials.'}</p></div></div><div className="payment-center-heading"><span>{isID ? 'PRODUK & TAGIHAN' : 'PRODUCTS & BILLS'}</span><h2>{isID ? 'Pilihan untuk Siswa' : 'Student Essentials'}</h2><p>{isID ? 'Setiap produk memiliki status pembayaran dan kuitansi tersendiri.' : 'Every product has its own payment status and receipt.'}</p></div><div className="payment-product-grid payment-store-grid">{paymentItems.map((item) => { const paid = /^(lunas|paid)$/i.test(String(item.status || '')); const pending = /menunggu verifikasi/i.test(String(item.status || '')); const onLeave = item.category === 'Tuition' && /^cuti$/i.test(String(item.status || '')); const purchase = item.category !== 'Tuition'; return <article className={`payment-product-card payment-store-card ${paid ? 'paid' : pending ? 'pending' : onLeave ? 'on-leave' : 'unpaid'}`} key={item.category}><div className={`payment-store-image ${item.category === 'Book Package' ? 'book' : item.category === 'ID Card' ? 'id-card' : 'tuition'}`}>{item.category === 'Book Package' ? <div className="product-text-cover"><span>📚</span><b>{isID ? 'PAKET 4 BUKU' : '4-BOOK PACKAGE'}</b><small>{isID ? 'Full Color • Materi + Workbook' : 'Full Color • Coursebooks + Workbooks'}</small></div> : item.category === 'ID Card' ? <div className="product-text-cover"><span>🪪</span><b>{isID ? 'ID CARD SISWA' : 'STUDENT ID CARD'}</b><small>Mr One Course • Official</small></div> : <div><img src="/logo-mr-one-course.jpeg" alt="" /><b>{isID ? 'LES BULANAN' : 'MONTHLY TUITION'}</b><small>8 Meetings • 60 Minutes</small></div>}<i>{paid && purchase
  ? (
      /sudah diterima/i.test(String(item.fulfillmentStatus || ''))
        ? (isID ? 'SUDAH DITERIMA' : 'RECEIVED')
        : /siap diambil/i.test(String(item.fulfillmentStatus || ''))
          ? (isID ? 'SIAP DIAMBIL' : 'READY TO PICK UP')
          : (isID ? 'SEDANG DISIAPKAN' : 'PREPARING')
    )
  : paid
    ? (isID ? 'LUNAS' : 'PAID')
    : onLeave
      ? (isID ? 'CUTI' : 'ON LEAVE')
      : pending
        ? (isID ? 'DIPERIKSA' : 'IN REVIEW')
        : purchase
        ? (isID ? 'TERSEDIA' : 'AVAILABLE')
        : (isID ? 'TAGIHAN AKTIF' : 'ACTIVE BILL')}</i></div><header><span>{item.icon}</span><div><small>{item.category === 'Tuition' ? (isID ? 'BULANAN' : 'MONTHLY') : (isID ? 'PRODUK RESMI' : 'OFFICIAL PRODUCT')}</small><h3>{item.label}</h3></div></header><strong className="product-payment-amount">{onLeave ? (isID ? 'Tidak Ditagihkan' : 'No Charge') : formatRupiah(item.amount)}</strong><p>{onLeave ? (item.note || (isID ? 'Cuti bulan ini • Tidak ada tagihan les' : 'On leave this month • No tuition charge')) : item.category === 'Tuition' ? `${overview?.currentMonth || ''} ${now.getFullYear()} • ${isID ? 'Batas tanggal 7' : 'Due on the 7th'}` : item.category === 'Book Package' ? (isID ? '4 buku full color • Sekali bayar' : '4 full-color books • One-time') : (isID ? 'Kartu identitas resmi siswa • Sekali bayar' : 'Official student identity card • One-time')}</p>{paid && item.paymentDate && <div className="paid-payment-meta"><span>{isID ? 'Dibayar' : 'Paid'}: {String(item.paymentDate)}</span><span>{item.paymentMethod || (isID ? 'Terverifikasi Admin' : 'Admin verified')}</span></div>}{paid && item.fulfillmentStatus && <div className="fulfillment-status">📦 {item.fulfillmentStatus}</div>}{pending && <div className="payment-card-notice">◷ {isID ? 'Konfirmasi diterima. Menunggu Admin.' : 'Confirmation received. Waiting for Admin.'}</div>}{onLeave && <div className="payment-card-notice leave">✓ {isID ? 'Status cuti tercatat. Tidak ada pembayaran untuk bulan ini.' : 'Leave recorded. No payment is due this month.'}</div>}<footer>{paid ? (
  <button type="button" onClick={() => setSelectedReceipt(item)}>
    {purchase
      ? (
          /sudah diterima/i.test(String(item.fulfillmentStatus || ''))
            ? (isID ? 'Lihat Kuitansi' : 'View Receipt')
            : /siap diambil/i.test(String(item.fulfillmentStatus || ''))
              ? (isID ? 'Siap Diambil' : 'Ready to Pick Up')
              : (isID ? 'Menunggu Produk' : 'Waiting for Product')
        )
      : (isID ? 'Lihat Kuitansi' : 'View Receipt')}
  </button>
) : onLeave ? <span>{isID ? 'Tidak ditagihkan bulan ini' : 'No tuition due this month'}</span> : pending ? <span>{isID ? 'Tidak perlu mengirim ulang' : 'No need to resubmit'}</span> : <button type="button" onClick={() => { setSelectedPaymentItem(item); setShowPaymentForm(true); setPaymentMessage(''); }}>{purchase ? (isID ? 'Beli Sekarang' : 'Buy Now') : (isID ? 'Bayar Sekarang' : 'Pay Now')}</button>}</footer></article>; })}</div></>}
          {selectedPaymentItem && !selectedReceipt && (
            <>
              <button className="receipt-back-button" type="button" onClick={() => { setSelectedPaymentItem(null); setShowPaymentForm(false); setPaymentMessage(''); }}>← {isID ? 'Kembali ke Pembayaran' : 'Back to Payments'}</button>
              <article className="tuition-document tuition-invoice payment-document-reference" id="tuition-print-document">
                <header>
                  <div>
                    <span>{isID ? 'INVOICE PEMBAYARAN' : 'PAYMENT INVOICE'}</span>
                    <strong>{invoiceNumber}</strong>
                  </div>
                  <div className="tuition-document-brand"><img src="/logo-mr-one-course.jpeg" alt="Mr One Course" /><span><b>Mr One Course</b><small>Academic Suite</small></span></div>
                </header>

                <section className="tuition-amount">
                  <span>
                    {selectedPaymentItem.category === 'Tuition'
                      ? `${isID ? 'BIAYA LES' : 'TUITION FEE'} ${paymentPeriodLabel(selectedPaymentItem.period).toUpperCase()}`
                      : String(selectedPaymentItem.label || (isID ? 'PEMBAYARAN' : 'PAYMENT')).toUpperCase()}
                  </span>
                  <strong>{formatRupiah(selectedPaymentItem.amount)}</strong>
                  <small>{selectedPaymentItem.category === 'Tuition' ? (isID ? 'Batas pembayaran: tanggal 7' : 'Payment due: the 7th') : (isID ? 'Pembayaran satu kali' : 'One-time payment')}</small>
                </section>

                <section className="tuition-student-info">
                  <span>{isID ? 'INFORMASI SISWA' : 'STUDENT INFO'}</span>
                  <strong>{overview?.profile?.fullName || '—'}</strong>
                  <p>{overview?.profile?.studentId || '—'} • {overview?.program?.program || '—'} • {overview?.program?.className || '—'}</p>
                </section>

                <section className="tuition-transaction">
                  <div><span>{isID ? 'Periode' : 'Period'}</span><strong>{paymentPeriodLabel(selectedPaymentItem.period)}</strong></div>
                  <div><span>{isID ? 'Jumlah Tagihan' : 'Amount Due'}</span><strong>{formatRupiah(selectedPaymentItem.amount)}</strong></div>
                  <div><span>Status</span><strong className="unpaid">{selectedPaymentItem.category === 'Tuition' ? (isID ? 'BELUM LUNAS' : 'UNPAID') : (isID ? 'BELUM DIBELI' : 'NOT PURCHASED')}</strong></div>
                </section>

                <p className="payment-document-note">
                  {isID
                    ? 'Silakan selesaikan pembayaran melalui metode yang tersedia pada Academic Suite. Simpan invoice ini sebagai referensi pembayaran.'
                    : 'Please complete payment using an available method in Academic Suite. Keep this invoice as your payment reference.'}
                </p>

                <footer>
                  <strong>Mr One Course</strong>
                  <span>{isID ? 'Invoice resmi pembayaran Mr One Course Academic Suite.' : 'Official payment invoice from Mr One Course Academic Suite.'}</span>
                </footer>
              </article>
              <div className="tuition-actions">
                <button className="tuition-pay-button" type="button" onClick={() => setShowPaymentForm((value) => !value)}>💳 {isID ? 'Pilih & Konfirmasi Pembayaran' : 'Choose & Confirm Payment'}</button>
                <button type="button" onClick={() => window.print()}>⤓ {isID ? 'Cetak / Simpan Invoice' : 'Print / Save Invoice'}</button>
              </div>
              {paymentMessage && <div className="payment-form-message">{paymentMessage}</div>}
              {showPaymentForm && <form className="payment-confirmation-form" onSubmit={submitPaymentProof}>
                <div className="selected-payment-summary"><span>{selectedPaymentItem.icon}</span><div><small>{isID ? 'PEMBAYARAN UNTUK' : 'PAYMENT FOR'}</small><strong>{selectedPaymentItem.label}</strong></div><b>{formatRupiah(selectedPaymentItem.amount)}</b></div>
                <div className="payment-form-heading"><span>1</span><div><h2>{isID ? 'Pilih Metode Pembayaran' : 'Choose Payment Method'}</h2><p>{isID ? `Total pembayaran: ${formatRupiah(selectedPaymentItem.amount)}` : `Payment total: ${formatRupiah(selectedPaymentItem.amount)}`}</p></div></div>
                <div className="payment-method-grid">
                  {[
                    ['GoPay / DANA', '085249684865', 'Muhammad Mirwan Salmani'],
                    ['BPD Kaltimtara', '1022075914', 'Muhammad Mirwan Salmani'],
                    ['BCA', '1912628901', 'Muhammad Mirwan Salmani'],
                    ['SeaBank', '901182598278', 'Muhammad Mirwan Salmani, S.Pd.'],
                    ['QRIS Mr One Course', 'Scan QRIS yang tersedia', 'MR ONE COURSE'],
                    ['Tunai', isID ? 'Bayar langsung' : 'Pay in person', isID ? 'Pilih penerima di bawah' : 'Choose the recipient below'],
                  ].map(([name, number, owner]) => <label className={paymentForm.paymentMethod === name ? 'selected' : ''} key={name}><input type="radio" name="payment-method" value={name} checked={paymentForm.paymentMethod === name} onChange={(event) => setPaymentForm({ ...paymentForm, paymentMethod: event.target.value, proof: event.target.value === 'Tunai' ? null : paymentForm.proof })} /><span><b>{name}</b><strong>{number}</strong><small>{name === 'Tunai' ? owner : `a.n. ${owner}`}</small></span>{number.match(/^\d+$/) && <button type="button" onClick={() => navigator.clipboard?.writeText(number)}>{isID ? 'Salin' : 'Copy'}</button>}</label>)}
                </div>
                {paymentForm.paymentMethod === 'QRIS Mr One Course' && <QrisPaymentDisplay isID={isID} />}
                {paymentForm.paymentMethod === 'Tunai' && <div className="cash-recipient-box"><span>{isID ? 'PEMBAYARAN TUNAI DITERIMA OLEH' : 'CASH PAYMENT RECEIVED BY'}</span><div>{['Mr One', 'Miss Vita'].map((recipient) => <label className={paymentForm.cashRecipient === recipient ? 'selected' : ''} key={recipient}><input type="radio" name="cash-recipient" value={recipient} checked={paymentForm.cashRecipient === recipient} onChange={(event) => setPaymentForm({ ...paymentForm, cashRecipient: event.target.value })} /><strong>{recipient}</strong></label>)}</div></div>}
                <div className="payment-form-heading"><span>2</span><div><h2>{paymentForm.paymentMethod === 'Tunai' ? (isID ? 'Konfirmasi Pembayaran Tunai' : 'Confirm Cash Payment') : (isID ? 'Kirim Bukti Pembayaran' : 'Submit Payment Proof')}</h2><p>{isID ? 'Admin akan memeriksa data berikut.' : 'Admin will review these details.'}</p></div></div>
                <div className="payment-input-grid payment-date-only"><label><span>{isID ? 'Tanggal pembayaran' : 'Payment date'}</span><input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })} required /></label></div>
                {paymentForm.paymentMethod !== 'Tunai' && <label className="payment-proof-upload"><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={choosePaymentProof} /><span>↑</span><strong>{paymentForm.proof?.fileName || (isID ? 'Pilih foto atau PDF bukti pembayaran' : 'Choose payment proof image or PDF')}</strong><small>JPG, PNG, WEBP, PDF • Maks. 4 MB</small></label>}
                <button className="submit-payment-proof" type="submit" disabled={paymentSubmitting}>{paymentSubmitting ? (isID ? 'Mengirim...' : 'Submitting...') : (isID ? 'Kirim' : 'Send')}</button>
              </form>}
            </>
          )}



          {selectedReceipt && (
            <>
              <button className="receipt-back-button" type="button" onClick={() => setSelectedReceipt(null)}>← {isID ? 'Kembali ke Riwayat' : 'Back to History'}</button>
              <article className="tuition-document tuition-receipt payment-document-reference" id="tuition-print-document">
                <header>
                  <div>
                    <span>{isID ? 'KWITANSI PEMBAYARAN' : 'PAYMENT RECEIPT'}</span>
                    <strong>{selectedReceipt.paymentId || selectedReceipt.invoiceNumber || invoiceNumber}</strong>
                  </div>
                  <div className="tuition-document-brand"><img src="/logo-mr-one-course.jpeg" alt="Mr One Course" /><span><b>Mr One Course</b><small>Academic Suite</small></span></div>
                </header>

                <section className="tuition-amount">
                  <span>
                    {String(selectedReceipt.category || '').toLowerCase() === 'tuition' || /les|tuition/i.test(String(selectedReceipt.label || ''))
                      ? `${isID ? 'BIAYA LES' : 'TUITION FEE'} ${paymentPeriodLabel(selectedReceipt.period).toUpperCase()}`
                      : String(selectedReceipt.label || (isID ? 'PEMBAYARAN' : 'PAYMENT')).toUpperCase()}
                  </span>
                  <strong>{formatRupiah(selectedReceipt.amount)}</strong>
                </section>

                <section className="tuition-student-info">
                  <span>{isID ? 'INFORMASI SISWA' : 'STUDENT INFO'}</span>
                  <strong>{overview?.profile?.fullName || '—'}</strong>
                  <p>{overview?.profile?.studentId || '—'} • {overview?.program?.program || '—'} • {overview?.program?.className || '—'}</p>
                </section>

                <section className="tuition-transaction receipt-transaction-details">
                  <div><span>{isID ? 'Tanggal & Waktu' : 'Date & Time'}</span><strong>{selectedReceipt.paymentDate || selectedReceipt.verifiedAt || '—'}</strong></div>
                  <div><span>{isID ? 'Metode' : 'Method'}</span><strong>{selectedReceipt.paymentMethod || (isID ? 'Diverifikasi Manajemen' : 'Management verified')}</strong></div>
                  <div><span>{isID ? 'No. Kwitansi' : 'Receipt No.'}</span><strong>{selectedReceipt.paymentId || selectedReceipt.invoiceNumber || invoiceNumber}</strong></div>
                  {selectedReceipt.fulfillmentStatus && <div><span>{isID ? 'Status Penyerahan' : 'Fulfillment'}</span><strong>{selectedReceipt.fulfillmentStatus}</strong></div>}
                  <div><span>Status</span><strong className="paid">{isID ? 'LUNAS' : 'PAID'}</strong></div>
                </section>

                <p className="receipt-thanks">
                  {isID ? 'Terima kasih atas pembayaran Anda.' : 'Thank you for your payment.'}
                </p>
                <p className="receipt-signature">— Mr One Course Management</p>

                <footer>
                  <strong>Mr One Course Academic Suite</strong>
                  <span>{isID ? 'Dokumen ini merupakan bukti pembayaran resmi.' : 'This document serves as an official payment receipt.'}</span>
                </footer>
              </article>
              <button className="receipt-print-button" type="button" onClick={() => window.print()}>⤓ {isID ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</button>
            </>
          )}
        </section>
      )}

      {page === 'profile' && (
        <section className="detail-panel student-profile-panel">
          <div className="student-profile-identity">
            <StudentPhoto photoLink={overview?.profile?.photoLink} fullName={overview?.profile?.fullName || 'Student'} className="student-profile-large-photo" />
            <div><span>{isID ? 'PROFIL SISWA' : 'STUDENT PROFILE'}</span><h2>{overview?.profile?.fullName || '—'}</h2><p>{overview?.profile?.studentId || '—'} • {overview?.program?.program || '—'}</p></div>
          </div>
          <div className="detail-row"><span>Student ID</span><strong>{overview?.profile?.studentId || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Sekolah' : 'School'}</span><strong>{overview?.profile?.school || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Kelas' : 'Grade'}</span><strong>{overview?.profile?.grade || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Level Saat Ini' : 'Current Level'}</span><strong>{overview?.program?.level || '—'}</strong></div>

          <div className="profile-subsection-title"><span><BadgeGlyph name="allround" /></span><h3>{isID ? 'Progress Gamifikasi' : 'Gamification Progress'}</h3></div>
          <section className="profile-gamification-card">
            <div className="profile-gamification-summary">
              <div><small>{isID ? 'EXP BULAN INI' : 'THIS MONTH EXP'}</small><strong>{Number(overview?.gamification?.monthlyExp || 0).toLocaleString('id-ID')} EXP</strong></div>
              <div><small>{isID ? 'RANKING KELAS' : 'CLASS RANK'}</small><strong>{overview?.gamification?.classRank ? `#${overview.gamification.classRank}` : '—'}</strong></div>
              <div><small>{isID ? 'TOTAL SISWA' : 'CLASS SIZE'}</small><strong>{overview?.gamification?.classSize || '—'}</strong></div>
            </div>
            <p className="profile-gamification-note">{isID ? 'EXP menunjukkan aktivitas dan konsistensi belajar, bukan nilai akademik.' : 'EXP reflects learning activity and consistency, not academic grades.'}</p>
            <div className="profile-exp-breakdown">
              {Object.entries(overview?.gamification?.breakdown || {}).filter(([, value]) => Number(value || 0) > 0).map(([key, value]) => (
                <div key={key}>
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (text) => text.toUpperCase())}</span>
                  <strong>{Number(value || 0)} EXP</strong>
                  <i><b style={{ width: `${Math.min(100, Number(value || 0) / Math.max(1, Number(overview?.gamification?.monthlyExp || 1)) * 100)}%` }} /></i>
                </div>
              ))}
            </div>
            {Array.isArray(overview?.gamification?.leaderboard) && overview.gamification.leaderboard.length > 0 && (
              <div className="profile-leaderboard">
                <header><span>{isID ? 'TOP EXP KELAS — BULAN INI' : 'CLASS TOP EXP — THIS MONTH'}</span><small>{overview?.gamification?.month || ''}</small></header>
                {overview.gamification.leaderboard.slice(0, 5).map((entry) => (
                  <div className={entry.studentId === overview?.profile?.studentId ? 'me' : ''} key={entry.studentId}>
                    <b>#{entry.rank}</b><span>{entry.displayName}</span><strong>{entry.monthlyExp} EXP</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="profile-subsection-title"><span>🎓</span><h3>{isID ? 'Program Saya' : 'My Program'}</h3></div>
          <div className="detail-row"><span>Program</span><strong>{overview?.program?.program || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Kelas' : 'Class'}</span><strong>{overview?.program?.className || '—'}</strong></div>
          <div className="detail-row"><span>Tutor</span><strong>{overview?.program?.tutor || '—'}</strong></div>

          <div className="profile-subsection-title"><span>💳</span><h3>{isID ? 'Riwayat Pembayaran' : 'Payment History'}</h3></div>
          <div className="profile-monthly-payment-progress">
            {(overview?.paymentYearProgress || []).map((item) => (
              <div className={`profile-monthly-payment-row ${item.status === 'Lunas' ? 'paid' : item.status === 'Cuti' ? 'leave' : item.status === 'Libur' ? 'holiday' : item.status === 'Belum Berjalan' ? 'future' : 'unpaid'}`} key={item.period}>
                <span>{item.month}</span>
                <strong>
                  {item.status === 'Lunas'
                    ? (isID ? 'LUNAS' : 'PAID')
                    : item.status === 'Cuti'
                      ? (isID ? 'CUTI' : 'ON LEAVE')
                      : item.status === 'Libur'
                        ? (isID ? 'LIBUR' : 'HOLIDAY')
                        : item.status === 'Belum Berjalan'
                          ? '—'
                          : (isID ? 'BELUM LUNAS' : 'UNPAID')}
                </strong>
              </div>
            ))}
          </div>
          {selectedReceipt && page === 'profile' && (
            <div className="profile-payment-receipt">
              <header>
                <div><small>{isID ? 'BUKTI PEMBAYARAN' : 'PAYMENT RECEIPT'}</small><strong>{selectedReceipt.label || (isID ? 'Pembayaran' : 'Payment')}</strong></div>
                <button type="button" onClick={() => setSelectedReceipt(null)}>×</button>
              </header>
              <div><span>{isID ? 'Periode' : 'Period'}</span><strong>{selectedReceipt.period || (isID ? 'Sekali bayar' : 'One-time')}</strong></div>
              <div><span>{isID ? 'Nominal' : 'Amount'}</span><strong>{formatRupiah(Number(selectedReceipt.amount || 0))}</strong></div>
              <div><span>{isID ? 'Metode' : 'Method'}</span><strong>{selectedReceipt.paymentMethod || '—'}</strong></div>
              <div><span>Status</span><strong className="paid">{isID ? 'LUNAS' : 'PAID'}</strong></div>
            </div>
          )}

          <div className="profile-subsection-title"><span>🔐</span><h3>{isID ? 'Keamanan Akun' : 'Account Security'}</h3></div>
          <form className="student-change-password-card" onSubmit={changeStudentPassword}>
            <div>
              <strong>{isID ? 'Ganti Password (Opsional)' : 'Change Password (Optional)'}</strong>
              <p>{isID ? 'Password awal tetap boleh digunakan. Ganti hanya jika Anda menginginkan password pribadi.' : 'You may keep using the initial password. Change it only if you want a personal password.'}</p>
            </div>
            <label><span>{isID ? 'Password saat ini' : 'Current password'}</span><input type="password" autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
            <div className="student-change-password-grid">
              <label><span>{isID ? 'Password baru' : 'New password'}</span><input type="password" minLength="8" autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
              <label><span>{isID ? 'Konfirmasi password baru' : 'Confirm new password'}</span><input type="password" minLength="8" autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label>
            </div>
            {passwordMessage && <div className="student-password-message">{passwordMessage}</div>}
            <button type="submit" disabled={passwordChanging}>{passwordChanging ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Ganti Password' : 'Change Password')}</button>
          </form>

          <button className="student-logout-detail" type="button" onClick={onLogout}><ModernSignOutIcon /><span>{isID ? 'Keluar dari Akun' : 'Sign Out'}</span></button>
        </section>
      )}

      {page === 'program' && (
        <section className="detail-panel"><span className="detail-label">{isID ? 'PROGRAM SAYA' : 'MY PROGRAM'}</span><h2>{overview?.program?.program || '—'}</h2>
          <div className="detail-row"><span>{isID ? 'Kelas' : 'Class'}</span><strong>{overview?.program?.className || '—'}</strong></div>
          <div className="detail-row"><span>Tutor</span><strong>{overview?.program?.tutor || '—'}</strong></div>
          <div className="detail-row"><span>Level</span><strong>{overview?.program?.level || (isID ? 'Belum ditentukan' : 'Not determined')}</strong></div>

          {isGrammarProgram && (
            <section className="grammar-curriculum">
              <div className="grammar-curriculum-heading">
                <span>GRAMMAR ROADMAP</span>
                <h3>{isID ? 'Materi Program Grammar' : 'Grammar Program Curriculum'}</h3>
                <p>{isID ? 'Materi disusun bertahap dari fondasi kata, pola tense, sampai grammar penting untuk penggunaan bahasa Inggris yang lebih akurat.' : 'The curriculum moves from word foundations to tense patterns and essential grammar for more accurate English use.'}</p>
              </div>
              <div className="grammar-curriculum-list">
                {GRAMMAR_CURRICULUM.map((module, index) => (
                  <article key={module.key}>
                    <div className="grammar-module-number">{String(index + 1).padStart(2, '0')}</div>
                    <div>
                      <h4>{module.title}</h4>
                      <p>{isID ? module.subtitleID : module.subtitleEN}</p>
                      <ul>{module.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      )}

      {page === 'missions' && (
        <section className="student-missions-intro">
          <span>⚡</span>
          <div>
            <small>{isID ? 'AKTIVITAS SISWA' : 'STUDENT ACTIVITIES'}</small>
            <h2>{isID ? 'Tugas & Tantangan' : 'Assignments & Challenges'}</h2>
            <p>{isID ? 'Kerjakan semua aktivitas dari tutor di sini. Hasilnya otomatis masuk ke EXP dan progres My Badges.' : 'Complete tutor activities here. Results automatically contribute to EXP and My Badges progress.'}</p>
          </div>
        </section>
      )}

      {(page === 'assignments' || page === 'missions') && (
        <section className="student-assignments-page"><div className="assignment-page-heading"><span>☑</span><div><h2>{isID ? 'Tugas Saya' : 'My Assignments'}</h2><p>{isID ? 'Tugas aktif dari tutor sesuai kelas Anda' : 'Active assignments from your class tutor'}</p></div></div>{studentSubmitMessage && <div className="student-submit-message">{studentSubmitMessage}</div>}{studentAssignments.length ? <div className="student-assignment-list">{studentAssignments.map((item) => <article key={item.assignmentId}><div className="assignment-title-row"><div><small>{overview?.program?.className || 'CLASS'}</small><h3>{item.title}</h3></div><b>+{item.expReward || 0} EXP</b></div><p>{item.instructions}</p><div className="assignment-meta"><span>{isID ? 'Diberikan' : 'Assigned'}: {item.assignedDate || '—'}</span><strong>{isID ? 'Tenggat' : 'Due'}: {item.dueDate || '—'}</strong></div>{item.submission ? <div className={`submission-result ${String(item.submission.status).toLowerCase()}`}><strong>{item.submission.status === 'Reviewed' ? (isID ? 'Sudah Dinilai' : 'Reviewed') : (isID ? 'Sudah Dikumpulkan' : 'Submitted')}</strong>{item.submission.status === 'Reviewed' && <p>{item.submission.score}/100 • +{item.submission.expAwarded} EXP<br />{item.submission.feedback}</p>}</div> : <div className="student-response-box">{Array.isArray(item.questions) && item.questions.length ? <StudentAssignmentQuestions assignment={item} answers={assignmentResponses[item.assignmentId] || {}} onChange={(answers) => setAssignmentResponses({ ...assignmentResponses, [item.assignmentId]: answers })} isID={isID} /> : <textarea rows="3" value={assignmentResponses[item.assignmentId] || ''} onChange={(event) => setAssignmentResponses({ ...assignmentResponses, [item.assignmentId]: event.target.value })} placeholder={isID ? 'Tulis jawaban atau tempel tautan file...' : 'Write your answer or paste a file link...'} />}<button type="button" disabled={studentSubmitting === item.assignmentId} onClick={() => sendAssignment(item)}>{studentSubmitting === item.assignmentId ? (isID ? 'Mengirim...' : 'Sending...') : (isID ? 'Kumpulkan Tugas' : 'Submit Assignment')}</button></div>}</article>)}</div> : <section className="detail-panel empty-feature"><span>☑</span><h2>{isID ? 'Belum ada tugas aktif' : 'No active assignments'}</h2><p>{isID ? 'Tugas baru dari tutor akan muncul di sini.' : 'New assignments from your tutor will appear here.'}</p></section>}</section>
      )}

      {page === 'journal' && (
        <section className="learning-journal-section learning-feed-simple">
          <div className="journal-heading">
            <span>▤</span>
            <div>
              <h2>{isID ? 'Pembelajaran' : 'Learning'}</h2>
              <p>{isID ? 'Materi dan aktivitas setiap pertemuan dalam satu tampilan sederhana.' : 'Materials and activities from each meeting in one simple view.'}</p>
            </div>
          </div>

          {learningActivities.length ? (
            <div className="learning-feed-list">
              {learningActivities.map((entry, index) => (
                <article className="learning-feed-card" key={entry.id || `${entry.date}-${index}`}>
                  <div className="learning-feed-head">
                    <span className="learning-feed-number">{String(entry.meetingNumber || index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{entry.title || entry.material || (isID ? `Pertemuan ${index + 1}` : `Meeting ${index + 1}`)}</h3>
                      <p><b>Tutor:</b> {entry.tutor || overview?.program?.tutor || '—'}</p>
                    </div>
                    <time>{entry.date || '—'}</time>
                  </div>

                  <div className="learning-feed-body">
                    <p><strong>{isID ? 'Aktivitas:' : 'Activities:'}</strong> {entry.activities || entry.activity || entry.notes || '—'}</p>
                    {entry.targetCompetency && <small><b>{isID ? 'Target:' : 'Target:'}</b> {entry.targetCompetency}</small>}
                    {entry.achievement && <small><b>{isID ? 'Capaian:' : 'Achievement:'}</b> {entry.achievement}</small>}
                  </div>

                  {(entry.assignment || entry.challenge) && (
                    <div className="learning-feed-actions">
                      {entry.assignment && <button type="button" onClick={() => onSelect('missions')}>☑ {isID ? 'Buka Tugas' : 'Open Assignment'}</button>}
                      {entry.challenge && <button type="button" onClick={() => onSelect('missions')}>🎯 {isID ? 'Buka Tantangan' : 'Open Challenge'}</button>}
                    </div>
                  )}

                  {entry.title && (
                    <div className="learning-feed-read">
                      <LearningReadReward
                        token={token}
                        entry={entry}
                        isID={isID}
                        onCompleted={onRefreshOverview}
                        onReward={(result) => showGamificationReward(result, isID ? 'Ringkasan pembelajaran selesai' : 'Learning summary completed')}
                        disabled={studentSubmitting === `read-${entry.meetingNumber}`}
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <section className="detail-panel empty-feature">
              <span>▤</span>
              <h2>{isID ? 'Pembelajaran belum tersedia' : 'Learning is not available yet'}</h2>
              <p>{isID ? 'Materi akan muncul setelah tutor mengisi pertemuan.' : 'Materials will appear after the tutor records a meeting.'}</p>
            </section>
          )}
        </section>
      )}

      {page === 'monthly-report' && (
        <>
        <div className="monthly-report-toolbar">
          <div><strong>{isID ? 'Laporan Akademik Bulanan' : 'Monthly Academic Report'}</strong><span>{isID ? 'Dapat dicetak atau disimpan sebagai PDF' : 'Print or save this report as a PDF'}</span></div>
          <button type="button" onClick={() => window.print()}>⤓ {isID ? 'Cetak / Simpan PDF' : 'Print / Save PDF'}</button>
        </div>
        <section className="monthly-report-page" id="monthly-academic-report">
          <div className="monthly-report-brand-logo standalone">
            <img src="/logo-mr-one-course.jpeg" alt="Mr One Course" />
          </div>
          <header className="monthly-report-cover">
            <img className="report-logo report-brand-logo-transparent" src="/logo-mr-one-course.jpeg" alt="Mr One Course" />
            <div><h2>{programReport.title.toUpperCase()}</h2><p>MR ONE COURSE • {isID ? 'PERIODE LAPORAN' : 'REPORT PERIOD'}: {overview?.currentMonth || '—'}</p></div>
          </header>

          <article className="monthly-report-card report-profile-card">
            <span className="report-section-label">{isID ? 'PROFIL SISWA' : 'STUDENT PROFILE'}</span>
            <h3>{overview?.profile?.fullName || '—'}</h3>
            <p>{overview?.profile?.studentId || '—'}</p>
            <div>
              <span><small>{isID ? 'PROGRAM' : 'PROGRAM'}</small><strong>{overview?.program?.program || '—'}</strong></span>
              <span><small>{isID ? 'KELAS' : 'CLASS'}</small><strong>{overview?.program?.className || '—'}</strong></span>
              <span><small>{programReport.frameworkLabel}</small><strong>{programReport.level}</strong></span>
              <span><small>{isID ? 'FOKUS' : 'FOCUS'}</small><strong>{programReport.focus}</strong></span>
            </div>
          </article>

          {programReport.family === 'grammar' && (
            <article className="monthly-report-card grammar-stage-card">
              <span className="report-section-label">{isID ? 'TAHAP PEMBELAJARAN GRAMMAR' : 'GRAMMAR LEARNING STAGE'}</span>
              <div className="grammar-stage-track">
                {[
                  { key: 'partsOfSpeech', label: 'Parts of Speech' },
                  { key: 'tenses', label: '16 Tenses' },
                  { key: 'grammarEssential', label: 'Grammar Essential' },
                ].map((stage, index) => {
                  const order = ['partsOfSpeech', 'tenses', 'grammarEssential'];
                  const currentIndex = order.indexOf(programReport.stageKey);
                  const stageIndex = order.indexOf(stage.key);
                  return (
                    <div className={stage.key === programReport.stageKey ? 'current' : stageIndex < currentIndex ? 'completed' : ''} key={stage.key}>
                      <span>{stageIndex < currentIndex ? '✓' : index + 1}</span>
                      <strong>{stage.label}</strong>
                    </div>
                  );
                })}
              </div>
              <p>{programReport.focus}</p>
            </article>
          )}

          <article className="monthly-report-card program-progress-card">
            <div className="program-progress-heading">
              <div>
                <span className="report-section-label">{isID ? 'PROGRES SESUAI PROGRAM' : 'PROGRAM-ALIGNED PROGRESS'}</span>
                <h3>{programReport.title}</h3>
                <p>{programReport.focus}</p>
              </div>
              <span className="program-framework-pill">{programReport.frameworkLabel} • {programReport.level}</span>
            </div>
            <div className="program-report-metrics">
              {programReport.metrics.map((metric) => (
                <div key={metric.label}>
                  <small>{metric.label}</small>
                  <strong>{metric.value == null ? '—' : `${metric.value}${metric.suffix || ''}`}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="monthly-report-card report-skill-chart-card">
            <span className="report-section-label">{isID ? 'GRAFIK PERKEMBANGAN' : 'PROGRESS CHART'}</span>
            <AcademicRadarChart metrics={programReport.metrics} isID={isID} />
          </article>

          <div className="report-score-grid">
            <article className="monthly-report-card report-attendance-card"><div><span className="report-section-label">{isID ? 'KEHADIRAN' : 'ATTENDANCE'}</span><strong>{attendance?.percentage == null ? '—' : `${attendance.percentage}%`}</strong></div><p><span>{isID ? 'Hadir' : 'Present'} <b>{attendance?.present ?? '—'}</b></span><span>{isID ? 'Tidak Hadir' : 'Absent'} <b>{attendance?.absent ?? (attendance?.total != null ? Math.max(0, Number(attendance.total) - Number(attendance.present || 0)) : '—')}</b></span></p></article>
            <article className="monthly-report-card report-grade-card"><div><span>{isID ? 'RATA-RATA NILAI' : 'AVERAGE SCORE'}</span><strong>{monthlyReport.averageScore ?? '—'}</strong></div><div><span>{isID ? 'NILAI AKHIR' : 'FINAL GRADE'}</span><strong>{monthlyReport.finalGrade || '—'}</strong></div></article>
          </div>

          <article className="report-comments"><span className="report-section-label">{isID ? 'KOMENTAR TUTOR' : 'TUTOR COMMENTS'}</span><blockquote>{monthlyReport.tutorComments || (isID ? 'Komentar perkembangan akan muncul setelah tutor menyelesaikan laporan bulan ini.' : 'Progress comments will appear after the tutor completes this month’s report.')}</blockquote></article>

          <article className="report-table-section">
            <span className="report-section-label">{isID ? 'HASIL PENILAIAN SESUAI PROGRAM' : 'PROGRAM-ALIGNED ASSESSMENT RESULTS'}</span>
            {assessmentRows.length ? (
              <div className="report-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{isID ? 'Penilaian' : 'Assessment'}</th>
                      {programReport.family === 'speaking' && <><th>Speaking</th><th>Listening</th><th>{isID ? 'Rata-rata' : 'Average'}</th></>}
                      {programReport.family === 'grammar' && <><th>{isID ? 'Ketepatan Grammar' : 'Grammar Accuracy'}</th><th>{isID ? 'Penerapan Tertulis' : 'Written Application'}</th><th>{isID ? 'Pemahaman Konteks' : 'Context Understanding'}</th></>}
                      {programReport.family === 'primary' && <><th>Speaking</th><th>Listening</th><th>Reading</th><th>Writing</th></>}
                      {programReport.family === 'general' && <><th>Speaking</th><th>Writing</th><th>Reading</th><th>Listening</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentRows.map((row, index) => (
                      <tr key={row.id || index}>
                        <td>{row.name || row.period || `#${index + 1}`}</td>
                        {programReport.family === 'speaking' && <><td>{row.speaking ?? '—'}</td><td>{row.listening ?? '—'}</td><td>{row.average ?? '—'}</td></>}
                        {programReport.family === 'grammar' && <><td>{row.quizTest ?? row.quiz ?? '—'}</td><td>{row.writing ?? '—'}</td><td>{row.reading ?? '—'}</td></>}
                        {programReport.family === 'primary' && <><td>{row.speaking ?? '—'}</td><td>{row.listening ?? '—'}</td><td>{row.reading ?? '—'}</td><td>{row.writing ?? '—'}</td></>}
                        {programReport.family === 'general' && <><td>{row.speaking ?? '—'}</td><td>{row.writing ?? '—'}</td><td>{row.reading ?? '—'}</td><td>{row.listening ?? '—'}</td></>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="report-empty">{isID ? 'Nilai penilaian bulan ini belum tersedia.' : 'This month’s assessment scores are not available yet.'}</p>}
          </article>

          <article className="report-table-section"><span className="report-section-label">{isID ? 'TARGET, BUKTI BELAJAR & CAPAIAN PER PERTEMUAN' : 'TARGET, LEARNING EVIDENCE & PROGRESS BY SESSION'}</span>{reportSessions.length ? <div className="report-table-scroll"><table className="student-detailed-session-table"><thead><tr><th>No.</th><th>{isID ? 'Tanggal' : 'Date'}</th><th>{isID ? 'Materi & Target' : 'Topic & Target'}</th><th>{isID ? 'Kehadiran' : 'Attendance'}</th><th>Assignment</th><th>Challenge</th><th>{isID ? 'Capaian & Catatan' : 'Achievement & Note'}</th></tr></thead><tbody>{reportSessions.map((row, index) => <tr key={row.id || `${row.date}-${index}`}><td>{row.number || index + 1}</td><td>{row.date || '—'}</td><td><strong>{row.topic || row.material || '—'}</strong>{row.targetCompetency && <small className="report-cell-note"><b>{isID ? 'Target:' : 'Target:'}</b> {row.targetCompetency}</small>}{row.activities && <small className="report-cell-note">{row.activities}</small>}</td><td>{attendanceStatusMeta(row.status).label}</td><td>{row.assignment ? <><strong>{row.assignment.score !== '' && row.assignment.score != null ? `${row.assignment.score}/100` : row.assignment.status}</strong><small className="report-cell-note">{row.assignment.title}</small></> : '—'}</td><td>{row.challenge ? <><strong>{row.challenge.score !== '' && row.challenge.score != null ? `${row.challenge.score}/100` : row.challenge.status}</strong><small className="report-cell-note">{row.challenge.title}</small></> : '—'}</td><td><strong>{row.achievement || '—'}</strong>{row.comment && <small className="report-cell-note">{row.comment}</small>}</td></tr>)}</tbody></table></div> : <p className="report-empty">{isID ? 'Log pertemuan bulan ini belum tersedia.' : 'This month’s meeting log is not available yet.'}</p>}</article>

          <article className="report-table-section"><span className="report-section-label">{isID ? 'HASIL ASSIGNMENT & CHALLENGE' : 'ASSIGNMENT & CHALLENGE RESULTS'}</span>{[...(monthlyReport.assignments || []).map((item) => ({ ...item, category: 'Assignment' })), ...(monthlyReport.challenges || []).map((item) => ({ ...item, category: 'Challenge' }))].length ? <div className="report-table-scroll"><table><thead><tr><th>{isID ? 'Pertemuan' : 'Meeting'}</th><th>{isID ? 'Kategori' : 'Category'}</th><th>{isID ? 'Kegiatan & Target' : 'Activity & Target'}</th><th>Status</th><th>{isID ? 'Nilai' : 'Score'}</th><th>Feedback</th></tr></thead><tbody>{[...(monthlyReport.assignments || []).map((item) => ({ ...item, category: 'Assignment' })), ...(monthlyReport.challenges || []).map((item) => ({ ...item, category: 'Challenge' }))].map((item, index) => <tr key={`${item.category}-${index}`}><td>{item.meetingNumber || '—'}</td><td>{item.category}</td><td><strong>{item.title || '—'}</strong>{item.targetCompetency && <small className="report-cell-note"><b>Target:</b> {item.targetCompetency}</small>}</td><td>{item.status || '—'}</td><td>{item.score ?? '—'}</td><td>{item.feedback || '—'}</td></tr>)}</tbody></table></div> : <p className="report-empty">{isID ? 'Belum ada hasil assignment atau challenge pada periode ini.' : 'No assignment or challenge results for this period.'}</p>}</article>

          <footer className="student-report-footer"><div><strong>Mr One Course</strong><span>{isID ? 'Laporan akademik resmi dari Mr One Course Academic Suite.' : 'Official academic report from Mr One Course Academic Suite.'}</span></div><div><span>Tutor</span><strong>{overview?.program?.tutor || '—'}</strong></div></footer>
        </section>
        </>
      )}

      {page === 'score' && (
        <section className="detail-panel academic-score-panel">
          <span className="detail-label">{isID ? 'HASIL AKADEMIK & GAMIFIKASI' : 'ACADEMIC & GAMIFICATION RESULT'}</span>
          <div className="score-highlight-grid">
            <article><small>{isID ? 'LEVEL BAHASA INGGRIS' : 'ENGLISH LEVEL'}</small><strong>{cefrLevel}</strong><span>{rawCefrLevel ? (isID ? 'Berdasarkan hasil tes CEFR' : 'Based on CEFR assessment') : (isID ? 'Selesaikan penilaian untuk melihat level Anda' : 'Complete an assessment to see your level')}</span></article>
            <article><small>{isID ? 'ACADEMIC SCORE' : 'ACADEMIC SCORE'}</small><strong>{totalExp}</strong><span>Total EXP</span></article>
          </div>
          <div className="detail-row"><span>{isID ? 'Current Status' : 'Current Status'}</span><strong>{rankInfo.current.name}</strong></div>
          <div className="detail-row"><span>{isID ? 'Rank Berikutnya' : 'Next Rank'}</span><strong>{rankInfo.next?.name || (isID ? 'Rank tertinggi' : 'Highest rank')}</strong></div>
          <div className="detail-row"><span>{isID ? 'EXP yang Dibutuhkan' : 'EXP Needed'}</span><strong>{rankInfo.remaining} EXP</strong></div>
          <div className="exp-source-grid academic-exp-breakdown">
            <div><span>{isID ? 'Kehadiran' : 'Attendance'}</span><strong>{expBreakdown.attendance || 0}</strong></div>
            <div><span>{isID ? 'Tugas' : 'Assignment'}</span><strong>{expBreakdown.assignment || 0}</strong></div>
            <div><span>Challenge</span><strong>{expBreakdown.challenge || 0}</strong></div>
            <div><span>Quiz/Test</span><strong>{expBreakdown.quizTest || 0}</strong></div>
            <div><span>{isID ? 'Partisipasi' : 'Participation'}</span><strong>{expBreakdown.participation || 0}</strong></div>
            <div><span>Project</span><strong>{expBreakdown.project || 0}</strong></div>
            <div><span>Achievement</span><strong>{expBreakdown.achievement || 0}</strong></div>
          </div>
        </section>
      )}

      {(page === 'challenge' || page === 'missions') && (
        <>
          <section className="detail-panel challenge-panel">
            <span className="detail-label">{programChallenge.name.toUpperCase()}</span>
            <h2>{isID ? 'Tantangan sesuai program Anda' : 'Your program challenge'}</h2>
            <p>{programChallenge.prompt}</p>
            <div className="challenge-target"><small>{isID ? 'PROGRAM AKTIF' : 'ACTIVE PROGRAM'}</small><strong>{overview?.program?.program || 'English'}</strong></div>
          </section>
          {studentChallenges.length > 0 ? (
            <section className="active-challenges-section">
              <div className="monthly-quests-title"><span><ModernUiIcon name="challenge" /></span><h2>{isID ? 'Challenge Aktif' : 'Active Challenges'}</h2></div>
              {studentSubmitMessage && <div className="student-submit-message">{studentSubmitMessage}</div>}
              <div className="student-challenge-list">
                {studentChallenges.map((item) => (
                  <article key={item.challengeId}>
                    <div className="assignment-title-row">
                      <div><small>{programChallenge.name}</small><h3>{item.title}</h3></div>
                      <b>+{item.expReward} EXP</b>
                    </div>
                    <p>{item.instructions}</p>
                    <div className="assignment-meta">
                      <span>{item.responseType === 'speech' ? (isID ? 'Jawaban: mikrofon & pengenalan suara' : 'Response: microphone & speech recognition') : item.responseType === 'link' ? (isID ? 'Jawaban: tautan audio/video/file' : 'Response: audio/video/file link') : (isID ? 'Jawaban teks' : 'Text response')}</span>
                      <strong>{isID ? 'Tenggat' : 'Due'}: {item.dueDate}</strong>
                    </div>
                    {item.result ? (
                      <div className={`submission-result ${String(item.result.status).toLowerCase()}`}>
                        <strong>{item.result.status === 'Reviewed' ? (isID ? 'Sudah Dinilai' : 'Reviewed') : (isID ? 'Sudah Dikirim' : 'Submitted')}</strong>
                        {item.result.status === 'Reviewed' && <p>{item.result.score}/100 • +{item.result.expAwarded} EXP<br />{item.result.feedback}</p>}
                      </div>
                    ) : (
                      <div className="student-response-box">
                        {item.responseType === 'speech' ? (
                          <SpeakingChallengeRecorder
                            item={item}
                            isID={isID}
                            value={challengeResponses[item.challengeId] || ''}
                            onChange={(value) => setChallengeResponses({ ...challengeResponses, [item.challengeId]: value })}
                            disabled={studentSubmitting === item.challengeId}
                          />
                        ) : (
                          <textarea
                            rows="3"
                            value={challengeResponses[item.challengeId] || ''}
                            onChange={(event) => setChallengeResponses({ ...challengeResponses, [item.challengeId]: event.target.value })}
                            placeholder={item.responseType === 'link' ? (isID ? 'Tempel tautan audio, video, atau file...' : 'Paste an audio, video, or file link...') : (isID ? 'Tulis jawaban Anda...' : 'Write your response...')}
                          />
                        )}
                        <button type="button" disabled={studentSubmitting === item.challengeId || !String(challengeResponses[item.challengeId] || '').trim()} onClick={() => sendChallenge(item.challengeId)}>
                          {studentSubmitting === item.challengeId ? (isID ? 'Mengirim...' : 'Sending...') : (isID ? 'Kirim Challenge' : 'Submit Challenge')}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="detail-panel empty-feature challenge-ready-empty">
              <span>{programChallenge.icon}</span>
              <h2>{isID ? 'Fitur challenge siap digunakan' : 'Challenge feature is ready'}</h2>
              <p>{isID
                ? `Challenge ${overview?.program?.program || 'English'} dari tutor akan muncul di sini.`
                : `${overview?.program?.program || 'English'} challenges from your tutor will appear here.`}</p>
            </section>
          )}



        </>
      )}

      {!embedded && (
        <StudentBottomNavigation
          language={language}
          activePage={page}
          onNavigate={(target) => target === 'landing' ? onBack() : onSelect(target)}
        />
      )}
    </Root>
  );
}


function AttendanceFollowUpPanel({ alerts = [], role, token, onRefresh, compact = false }) {
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState('');
  const [feedback, setFeedback] = useState('');
  const normalizedRole = String(role || '').toLowerCase();
  const canReview = normalizedRole === 'admin';
  const activeAlerts = Array.isArray(alerts) ? alerts : [];

  function getDraft(alert) {
    return drafts[alert.alertId] || {
      status: alert.status === 'Perlu Pemantauan' ? 'Perlu Pemantauan' : 'Sudah Dikonfirmasi',
      outcome: alert.adminOutcome || '',
      followUp: alert.adminFollowUp || '',
    };
  }

  function updateDraft(alert, field, value) {
    setDrafts({
      ...drafts,
      [alert.alertId]: {
        ...getDraft(alert),
        [field]: value,
      },
    });
  }

  async function submitReview(event, alert) {
    event.preventDefault();
    const draft = getDraft(alert);

    if (!String(draft.outcome || '').trim() || !String(draft.followUp || '').trim()) {
      setFeedback('Mohon lengkapi hasil komunikasi dan tindak lanjut terlebih dahulu.');
      return;
    }

    setSavingId(alert.alertId);
    setFeedback('');

    try {
      const result = await callApi({
        action: 'reviewAttendanceFollowUp',
        token,
        followUp: {
          alertId: alert.alertId,
          status: draft.status,
          outcome: draft.outcome,
          followUp: draft.followUp,
        },
      });

      setFeedback(result.message || 'Tindak lanjut berhasil disimpan.');
      if (onRefresh) await onRefresh();
    } catch (error) {
      setFeedback(error.message || 'Tindak lanjut belum berhasil disimpan.');
    } finally {
      setSavingId('');
    }
  }

  if (!activeAlerts.length) return null;

  return (
    <section className={`attendance-followup-panel ${compact ? 'compact' : ''}`}>
      <div className="attendance-followup-heading">
        <div>
          <span>STUDENT CARE</span>
          <h2>{canReview ? 'Perlu Tindak Lanjut Kehadiran' : 'Laporan Kehadiran Siswa'}</h2>
          <p>
            {canReview
              ? 'Siswa berikut telah tercatat tidak hadir minimal 3 kali. Mohon lakukan komunikasi secara baik dan catat hasilnya di sini.'
              : 'Informasi ini disampaikan untuk pemantauan. Koordinasi dengan siswa/orang tua dilakukan oleh Admin.'}
          </p>
        </div>
        <strong>{activeAlerts.length}</strong>
      </div>

      {feedback && <div className="attendance-followup-feedback">{feedback}</div>}

      <div className="attendance-followup-list">
        {activeAlerts.map((alert) => {
          const draft = getDraft(alert);
          const resolved = String(alert.status || '').toLowerCase() === 'sudah dikonfirmasi';

          return (
            <article className={resolved ? 'resolved' : ''} key={alert.alertId}>
              <header>
                <div>
                  <small>{alert.className || alert.classId}</small>
                  <h3>{alert.studentName}</h3>
                  <p>{alert.studentId} • {alert.tutor || 'Tutor'}</p>
                </div>
                <span>{alert.absenceCount}× {alert.absenceCount === 1 ? 'tidak hadir' : 'tidak hadir'}</span>
              </header>

              <div className="attendance-followup-summary">
                <div>
                  <small>STATUS</small>
                  <strong>{alert.status || 'Menunggu Tindak Lanjut'}</strong>
                </div>
                <div>
                  <small>TERCATAT</small>
                  <strong>{alert.triggeredAt ? formatDateTime(alert.triggeredAt) : '—'}</strong>
                </div>
              </div>

              {canReview ? (
                <form onSubmit={(event) => submitReview(event, alert)}>
                  <label>
                    <span>Hasil komunikasi / kendala yang disampaikan</span>
                    <textarea
                      rows="3"
                      value={draft.outcome}
                      onChange={(event) => updateDraft(alert, 'outcome', event.target.value)}
                      placeholder="Contoh: Orang tua menyampaikan siswa sedang kurang sehat dan sudah diminta beristirahat."
                      required
                    />
                  </label>

                  <label>
                    <span>Tindak lanjut Admin</span>
                    <textarea
                      rows="3"
                      value={draft.followUp}
                      onChange={(event) => updateDraft(alert, 'followUp', event.target.value)}
                      placeholder="Contoh: Sudah menghubungi orang tua dengan baik dan akan memantau kehadiran pada pertemuan berikutnya."
                      required
                    />
                  </label>

                  <label>
                    <span>Status pemantauan</span>
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft(alert, 'status', event.target.value)}
                    >
                      <option>Sudah Dikonfirmasi</option>
                      <option>Perlu Pemantauan</option>
                      <option>Belum Terhubung</option>
                    </select>
                  </label>

                  <button type="submit" disabled={savingId === alert.alertId}>
                    {savingId === alert.alertId ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}
                  </button>
                </form>
              ) : (
                <div className="attendance-followup-readonly">
                  {alert.adminOutcome && (
                    <div>
                      <small>HASIL KOMUNIKASI ADMIN</small>
                      <p>{alert.adminOutcome}</p>
                    </div>
                  )}
                  {alert.adminFollowUp && (
                    <div>
                      <small>TINDAK LANJUT</small>
                      <p>{alert.adminFollowUp}</p>
                    </div>
                  )}
                  {!alert.adminOutcome && !alert.adminFollowUp && (
                    <p>Admin belum mencatat hasil koordinasi. Laporan ini hanya untuk pemantauan internal.</p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Dashboard({
  user,
  metrics,
  recentPayments,
  attendanceFollowUps,
  attentionLists,
  ceoMonitoring,
  adminActivities,
  message,
  onRefresh,
  onLogout,
  dashboardLoading,
  activePage,
  onNavigate,
  students,
  studentsLoading,
  studentSearch,
  onStudentSearchChange,
  onStudentSearch,
  studentPagination,
  onStudentPageChange,
  registrations,
  registrationsLoading,
  onApproveRegistration,
  onRejectRegistration,
  onRefreshRegistrations,
  theme,
  onThemeChange,
  paymentConfirmations,
  paymentRecords,
  paymentConfirmationsLoading,
  onReviewPayment,
  onAddHistoricalPayment,
  onUpdateFulfillment,
  token,
}) {

  useEdgeSwipeBack(
    () => onNavigate('home'),
    activePage !== 'home' && activePage !== 'students'
  );

  const cards =
    user.role === 'CEO'
      ? [
          {
            label: 'Siswa Aktif',
            value: metrics?.activeStudents || 0,
            icon: '👥',
            page: 'students',
          },
          {
            label: 'Kelas Aktif',
            value: metrics?.activeClasses || 0,
            icon: '🏫',
            page: 'ceo-classes',
          },
          {
            label: 'Pendapatan',
            value: formatRupiah(metrics?.totalRevenue || 0),
            icon: '💳',
            page: 'ceo-revenue',
            note: '3 bulan terakhir',
          },
          {
            label: 'Kehadiran',
            value: `${metrics?.attendanceRate || 0}%`,
            icon: '✓',
            page: 'ceo-attendance',
            note: 'bulan berjalan',
          },
        ]
      : [
          { label: 'Pendaftaran Menunggu', value: metrics?.pendingRegistrations || 0, icon: '▤', page: 'registrations' },
          { label: 'Pembayaran Menunggu', value: metrics?.pendingPayments || 0, icon: '💳', page: 'payment-confirmations' },
        ];

  return (
    <main className={`app-dashboard ${user.role === 'Admin' ? 'admin-dashboard' : ''}`}>
      <header className="app-header">
        <div className="brand-small">
          <PaperPlaneLogo />

          <div>
            <strong>Mr One Course</strong>
            <span>{user.role} Dashboard</span>
          </div>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="logout-button"
            onClick={onLogout}
          >
            Keluar
          </button>
        </div>
      </header>

      {activePage === 'home' ? (
      <>
      <section className="dashboard-welcome">
        <div>
          <span className="system-connected">
            ● SYSTEM CONNECTED
          </span>

          <h1>
            Selamat datang,
            <span>{user.fullName}</span>
          </h1>

          <p>
            {user.role === 'Admin' ? 'Yang perlu ditindaklanjuti hari ini.' : 'Berikut ringkasan terbaru Mr One Course.'}
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={onRefresh}
        >
          ↻ Perbarui
        </button>
      </section>

      {message && (
        <div className="error-message">
          {message}
        </div>
      )}

      {dashboardLoading ? (
        <div className="dashboard-loading">
          Memuat dashboard...
        </div>
      ) : (
        <>
          <section className="metric-grid">
            {cards.map((card) => {
              const CardTag = card.page ? 'button' : 'article';
              return (
                <CardTag type={card.page ? 'button' : undefined} className={`metric-card ${card.page ? 'metric-card-action' : ''}`} key={card.label} onClick={card.page ? () => onNavigate(card.page) : undefined}>
                  <span className="metric-icon">{card.icon}</span>
                  <small>{card.label}</small>
                  <strong>{card.value}</strong>
                  {card.note && <span className="metric-card-note">{card.note}</span>}
                  {card.page && <em>→</em>}
                </CardTag>
              );
            })}
          </section>

          {user.role === 'Admin' && (Number(metrics?.pendingRegistrations || 0) + Number(metrics?.pendingPayments || 0) + Number(attentionLists?.absentMoreThanFour?.length || 0) === 0) && (
            <section className="admin-today-clear">
              <span>✓</span>
              <div><strong>Tidak ada tindakan mendesak hari ini</strong><small>Pendaftaran, pembayaran, dan Attendance Watch tidak memiliki antrean tindak lanjut.</small></div>
            </section>
          )}

          {user.role === 'Admin' && (
            <section className="admin-attendance-watch admin-home-attendance-todo">
              <div className="section-heading">
                <div><span className="eyebrow">TO DO LIST • ATTENDANCE WATCH</span><h2>Perlu Konfirmasi Kehadiran</h2><p>Tindak lanjut siswa dengan ketidakhadiran lebih dari 4 kali bulan ini.</p></div>
                <span className="data-count">{attentionLists?.absentMoreThanFour?.length || 0} siswa</span>
              </div>
              {(attentionLists?.absentMoreThanFour || []).length ? (
                <div className="admin-attendance-watch-list">
                  {attentionLists.absentMoreThanFour.slice(0, 5).map((item) => (
                    <article key={`home-attendance-watch-${item.studentId}`}>
                      <div><strong>{item.fullName}</strong><small>{item.studentId} • {item.className || item.classId || '—'} • Tidak hadir {item.absentCount}x</small></div>
                      <button type="button" onClick={() => onNavigate('students')}>Tindak Lanjuti</button>
                    </article>
                  ))}
                  {attentionLists.absentMoreThanFour.length > 5 && (
                    <div className="admin-home-todo-more">+{attentionLists.absentMoreThanFour.length - 5} siswa lainnya tersedia di Attendance Watch.</div>
                  )}
                </div>
              ) : (
                <div className="admin-watch-empty">Tidak ada Attendance Watch yang perlu ditindaklanjuti saat ini.</div>
              )}
            </section>
          )}

          {user.role === 'CEO' && (
            <AttendanceFollowUpPanel
              alerts={attendanceFollowUps}
              role={user.role}
              token={token}
              onRefresh={onRefresh}
            />
          )}

          {user.role === 'CEO' && <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  FINANCIAL ACTIVITY
                </span>
                <h2>Pembayaran Terbaru</h2>
              </div>

              <span className="data-count">
                {recentPayments.length} transaksi
              </span>
            </div>

            {recentPayments.length === 0 ? (
              <div className="empty-state">
                Belum ada pembayaran terbaru.
              </div>
            ) : (
              <div className="payment-list">
                {recentPayments.map(
                  (payment, index) => (
                    <div
                      className="payment-item"
                      key={
                        payment.paymentId ||
                        `${payment.studentId}-${index}`
                      }
                    >
                      <div className="payment-avatar">
                        {String(
                          payment.studentName || 'S'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="payment-information">
                        <strong>
                          {payment.studentName ||
                            'Nama siswa'}
                        </strong>

                        <span>
                          {payment.studentId || '-'} •{' '}
                          {payment.paymentCategory ||
                            'Course Fee'}
                        </span>

                        <small>
                          {formatDateTime(
                            payment.paymentDate
                          )}
                        </small>
                      </div>

                      <div className="payment-amount">
                        <strong>
                          {formatRupiah(payment.amount)}
                        </strong>

                        <span>
                          {payment.status || '-'}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>}
        </>
      )}
      </>
      ) : activePage === 'ceo-classes' && user.role === 'CEO' ? (
        <section className="ceo-detail-page">
          <div className="page-heading"><div><span className="eyebrow">CEO • CLASSES</span><h1>Kelas Aktif</h1><p>{ceoMonitoring?.activeClasses?.length || 0} Class ID aktif</p></div></div>
          <div className="ceo-active-class-list">
            {(ceoMonitoring?.activeClasses || []).map((item) => <article key={item.classId}>
              <div><strong>{item.className || item.classId}</strong><small>{item.classId} • {item.program || '—'} • {item.tutor || '—'}</small></div>
              <span>{item.schedule || '—'}</span>
            </article>)}
          </div>
          <section className="ceo-class-business-monitor">
            <article className="ceo-monitor-panel">
              <header><div><span className="eyebrow">TUITION TREND</span><h3>Pembayaran Les</h3></div><small>3 bulan terakhir</small></header>
              <div className="ceo-tuition-trend">{(ceoMonitoring?.tuitionMonthly || []).map((item) => <div key={item.period} className="ceo-tuition-month"><div className="ceo-tuition-month-head"><strong>{item.label}</strong><span>{item.percentage}%</span></div><div className="ceo-tuition-progress"><i style={{ width: `${Math.min(100, Math.max(0, item.percentage || 0))}%` }} /></div><div className="ceo-tuition-meta"><span>{item.paidStudents}/{item.totalStudents} siswa</span><strong>{formatRupiah(item.revenue)}</strong></div></div>)}</div>
            </article>
            <article className="ceo-monitor-panel"><header><div><span className="eyebrow">BOOK SALES</span><h3>Penjualan Buku</h3></div><strong>{ceoMonitoring?.bookSummary?.purchased || 0}</strong></header><p>{ceoMonitoring?.bookSummary?.received || 0} sudah diterima • {ceoMonitoring?.bookSummary?.pendingDelivery || 0} masih diproses</p></article>
            <article className="ceo-monitor-panel"><header><div><span className="eyebrow">ID CARD SALES</span><h3>Penjualan ID Card</h3></div><strong>{ceoMonitoring?.idCardSummary?.purchased || 0}</strong></header><p>Pembelian ID Card terverifikasi.</p></article>
          </section>
        </section>
      ) : activePage === 'ceo-revenue' && user.role === 'CEO' ? (
        <section className="ceo-detail-page">
          <div className="page-heading"><div><span className="eyebrow">CEO • REVENUE</span><h1>Rincian Pendapatan</h1><p>Total 3 bulan terakhir: {formatRupiah(ceoMonitoring?.revenueLast3Months || 0)}</p></div></div>
          <div className="ceo-revenue-method-grid">
            {(ceoMonitoring?.revenueByMethod || []).map((item) => <article key={item.method}><span>{item.method}</span><strong>{formatRupiah(item.amount)}</strong><small>{item.transactions} transaksi</small></article>)}
          </div>
          <button type="button" className="ceo-detail-link-button" onClick={() => onNavigate('payment-confirmations')}>Buka Payment Center →</button>
        </section>
      ) : activePage === 'ceo-attendance' && user.role === 'CEO' ? (
        <section className="ceo-detail-page">
          <div className="page-heading"><div><span className="eyebrow">CEO • ATTENDANCE</span><h1>Kehadiran Siswa</h1><p>Persentase kehadiran pada sesi les yang tercatat di bulan berjalan.</p></div></div>
          <div className="ceo-attendance-detail">
            <strong>{ceoMonitoring?.attendanceCurrentMonth?.percentage || 0}%</strong>
            <div><span>{ceoMonitoring?.attendanceCurrentMonth?.present || 0} hadir</span><span>dari {ceoMonitoring?.attendanceCurrentMonth?.totalRecords || 0} catatan kehadiran</span></div>
          </div>
        </section>
      ) : activePage === 'students' ? (
        <StudentsPage
          students={students}
          loading={studentsLoading}
          search={studentSearch}
          onSearchChange={onStudentSearchChange}
          onSearch={onStudentSearch}
          pagination={studentPagination}
          onPageChange={onStudentPageChange}
          message={message}
          token={token}
          attentionLists={attentionLists}
          userRole={user.role}
          onBack={() => onNavigate('home')}
        />
      ) : activePage === 'registrations' ? (
        <StudentRegistrationsPage registrations={registrations} loading={registrationsLoading} message={message} onApprove={onApproveRegistration} onReject={onRejectRegistration} token={token} onRefresh={onRefreshRegistrations} />
      ) : activePage === 'payment-confirmations' ? (
        <PaymentConfirmationsPage confirmations={paymentConfirmations} payments={paymentRecords} loading={paymentConfirmationsLoading} message={message} onReview={onReviewPayment} onAddHistorical={onAddHistoricalPayment} onUpdateFulfillment={onUpdateFulfillment} token={token} attentionLists={attentionLists} />
      ) : activePage === 'menu' ? (
        <section className="admin-menu-page">
          <div className="page-heading"><div><span className="eyebrow">OPERATIONS</span><h1>Menu</h1><p>Akses cepat operasional dan aktivitas Admin.</p></div></div>
          <div className="admin-menu-links">
            <button type="button" onClick={() => onNavigate('students')}><span>👥</span><div><strong>Data Siswa</strong><small>Profil, attendance watch, dan administrasi siswa</small></div><b>→</b></button>
            <button type="button" onClick={() => onNavigate('registrations')}><span>▤</span><div><strong>Pendaftaran</strong><small>Verifikasi dan aktivasi pendaftar baru</small></div><b>→</b></button>
            <button type="button" onClick={() => onNavigate('payment-confirmations')}><span>💳</span><div><strong>Pembayaran</strong><small>Verifikasi, tuition watch, dan rincian transaksi</small></div><b>→</b></button>
            {user.role === 'CEO' && <button type="button" onClick={() => onNavigate('ceo-classes')}><span>🏫</span><div><strong>Monitoring Kelas</strong><small>Kelas aktif, tuition trend, buku, dan ID Card</small></div><b>→</b></button>}
          </div>
          <section className="admin-activity-panel">
            <div className="section-heading"><div><span className="eyebrow">ADMIN ACTIVITY</span><h2>Aktivitas Admin Terbaru</h2></div><span className="data-count">{(adminActivities || []).length} aktivitas</span></div>
            {(adminActivities || []).length ? <div className="admin-activity-list">{adminActivities.map((item,index) => <article key={`${item.type}-${item.date}-${index}`}><span>{item.type === 'payment' ? '💳' : '▤'}</span><div><strong>{item.action}</strong><small>{item.detail}</small></div><time>{item.date}</time></article>)}</div> : <div className="empty-state">Belum ada aktivitas Admin yang tercatat.</div>}
          </section>
        </section>
      ) : (
        <section className="coming-soon">
          <span className="eyebrow">COMING SOON</span>
          <h2>Fitur sedang disiapkan</h2>
          <p>Menu ini akan kita kerjakan pada tahap berikutnya.</p>
        </section>
      )}

      <nav className="mobile-navigation">
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => onNavigate('home')}
        >
          <span>⌂</span>
          Beranda
        </button>

        <button
          className={activePage === 'students' ? 'active' : ''}
          onClick={() => onNavigate('students')}
        >
          <span>👥</span>
          Siswa
        </button>

        {user.role === 'Admin' && <button className={activePage === 'registrations' ? 'active' : ''} onClick={() => onNavigate('registrations')}><span>▤</span>Pendaftaran</button>}
        <button className={activePage === 'payment-confirmations' ? 'active' : ''} onClick={() => onNavigate('payment-confirmations')}>
          <span>💳</span>Pembayaran
        </button>

        <button
          className={activePage === 'menu' ? 'active' : ''}
          onClick={() => onNavigate('menu')}
        >
          <span>☰</span>
          Menu
        </button>
      </nav>
    </main>
  );
}

function PaymentConfirmationsPage({ confirmations, payments, loading, message, onReview, onAddHistorical, onUpdateFulfillment, token, attentionLists }) {
  const [proof, setProof] = useState(null); const [proofLoading, setProofLoading] = useState(''); const [notes, setNotes] = useState({}); const [showHistorical, setShowHistorical] = useState(false);
  const [historicalSubmitting, setHistoricalSubmitting] = useState(false);
  const historicalFormRef = useRef(null);
  const emptyHistoricalPayment = () => ({ studentId: '', studentName: '', paymentCategory: 'Book Package', amount: 150000, paymentDate: new Date().toISOString().slice(0,10), paymentMethod: 'Tunai', period: '', fulfillmentStatus: 'Sedang Disiapkan', note: '', proof: null });
  const [historical, setHistorical] = useState(emptyHistoricalPayment);
  const pending = (confirmations || []).filter((item) => /menunggu verifikasi/i.test(item.status));

  // Tuition Watch V81:
  // tampilannya tidak hanya bergantung pada snapshot dashboard.
  // Daftar tagihan direkonsiliasi lagi dengan data pembayaran yang sedang tampil
  // di Payment Center, sehingga setelah Admin/siswa mencatat pembayaran periode aktif,
  // nama siswa langsung hilang dari Tuition Watch.
  const tuitionPeriod = String(attentionLists?.period || '').trim();
  const baseTuitionTargets = attentionLists?.tuitionReminderTargets || [];
  const baseOutstandingTargets = attentionLists?.tuitionOutstandingTargets || [];

  function normalizeTuitionStudentId(value) {
    return String(value || '').trim().toUpperCase();
  }

  function normalizeTuitionCategory(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized || normalized === 'tuition' || normalized.includes('les') || normalized.includes('course')) {
      return 'Tuition';
    }
    return normalized;
  }

  function tuitionPaymentPeriod(item) {
    const direct = String(item?.period || '').trim();
    if (/^\d{4}-\d{2}$/.test(direct)) return direct;

    const rawDate = String(item?.paymentDate || '').trim();
    const match = rawDate.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : '';
  }

  function tuitionTargetKey(studentId, period) {
    return `${normalizeTuitionStudentId(studentId)}|${String(period || '').trim()}`;
  }

  const paidOrSubmittedTuitionKeys = new Set();

  (payments || []).forEach((item) => {
    const id = normalizeTuitionStudentId(item.studentId);
    const status = String(item.status || '').trim().toLowerCase();
    const category = normalizeTuitionCategory(item.paymentCategory || item.category);
    const period = tuitionPaymentPeriod(item);

    if (id && category === 'Tuition' && period && /^(lunas|paid|verified)$/.test(status)) {
      paidOrSubmittedTuitionKeys.add(tuitionTargetKey(id, period));
    }
  });

  (confirmations || []).forEach((item) => {
    const id = normalizeTuitionStudentId(item.studentId);
    const status = String(item.status || '').trim().toLowerCase();
    const category = normalizeTuitionCategory(item.paymentCategory);
    const period = tuitionPaymentPeriod(item);

    if (
      id &&
      category === 'Tuition' &&
      period &&
      /^(menunggu verifikasi|pending|menunggu|lunas|paid|verified)$/.test(status)
    ) {
      paidOrSubmittedTuitionKeys.add(tuitionTargetKey(id, period));
    }
  });

  const combinedTuitionTargets = [...baseOutstandingTargets, ...baseTuitionTargets];
  const seenTuitionTargetKeys = new Set();
  const tuitionTargets = combinedTuitionTargets.filter((item) => {
    const key = tuitionTargetKey(item.studentId, item.period || tuitionPeriod);
    if (!normalizeTuitionStudentId(item.studentId) || !String(item.period || tuitionPeriod || '').trim()) return false;
    if (seenTuitionTargetKeys.has(key) || paidOrSubmittedTuitionKeys.has(key)) return false;
    seenTuitionTargetKeys.add(key);
    return true;
  });

  function normalizePaymentWa(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    return digits;
  }

  function formatBillingPeriod(period) {
    const match = String(period || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return period || 'bulan ini';
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${months[Number(match[2]) - 1]} ${match[1]}`;
  }

  // V85 — status administrasi pembayaran mengikuti kebijakan Mr One Course:
  // 1–7 masa pembayaran, 8–10 terlambat, 11–15 perlu tindak lanjut,
  // 16–akhir bulan overdue, dan periode bulan sebelumnya outstanding.
  function getLocalBillingPeriod(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function getTuitionWatchStatus(period) {
    const now = new Date();
    const localPeriod = getLocalBillingPeriod(now);
    const activePeriod = /^\d{4}-\d{2}$/.test(tuitionPeriod) ? tuitionPeriod : localPeriod;
    const targetPeriod = /^\d{4}-\d{2}$/.test(String(period || '')) ? String(period) : activePeriod;

    if (targetPeriod < activePeriod) {
      return { key: 'outstanding', label: 'Outstanding Balance', shortLabel: 'Outstanding', priority: 5, description: 'Tagihan dari periode sebelumnya masih belum tercatat lunas.' };
    }

    if (targetPeriod > activePeriod) {
      return { key: 'window', label: 'Masa Pembayaran', shortLabel: '1–7', priority: 1, description: 'Periode pembayaran reguler tanggal 1–7 setiap bulan.' };
    }

    const day = now.getDate();
    if (day <= 7) return { key: 'window', label: 'Masa Pembayaran', shortLabel: '1–7', priority: 1, description: 'Periode pembayaran reguler masih berlangsung sampai tanggal 7.' };
    if (day <= 10) return { key: 'late', label: 'Terlambat', shortLabel: '8–10', priority: 2, description: 'Masa pembayaran reguler telah lewat; kirim pengingat ringan.' };
    if (day <= 15) return { key: 'follow-up', label: 'Perlu Tindak Lanjut', shortLabel: '11–15', priority: 3, description: 'Admin disarankan melakukan follow-up langsung kepada siswa/orang tua.' };
    return { key: 'overdue', label: 'Overdue', shortLabel: '16–akhir', priority: 4, description: 'Pembayaran periode berjalan belum tercatat setelah tanggal 15.' };
  }

  function tuitionReminderText(item) {
    const status = getTuitionWatchStatus(item.period);
    const name = item.fullName || 'Siswa';
    const periodLabel = formatBillingPeriod(item.period);
    const amountLabel = 'Rp150.000';

    if (status.key === 'window') {
      return [
        'Halo 👋',
        '',
        `Kami dari *Mr One Course* ingin mengingatkan pembayaran les untuk *${name}*.`,
        '',
        `*Periode:* ${periodLabel}`,
        `*Nominal:* ${amountLabel}`,
        '*Waktu pembayaran:* tanggal 1–7 setiap bulan',
        '',
        'Jika pembayaran sudah dilakukan, pesan ini dapat diabaikan. Bila ada yang ingin dikonfirmasi, silakan hubungi Admin.',
        '',
        '_Terima kasih atas perhatian dan kerja samanya._ 🙏'
      ].join('\r\n');
    }
    if (status.key === 'late') {
      return [
        'Halo 👋',
        '',
        `Kami dari *Mr One Course* ingin menginformasikan bahwa pembayaran les untuk *${name}* periode *${periodLabel}* belum tercatat di sistem kami.`,
        '',
        `*Nominal:* ${amountLabel}`,
        '',
        'Mohon bantuannya untuk mengecek kembali pembayaran periode ini. Jika pembayaran sudah dilakukan, silakan kirimkan bukti pembayaran kepada Admin.',
        '',
        'Jika ada kendala atau hal yang ingin dikonfirmasi, silakan menghubungi Admin. Kami dengan senang hati akan membantu.',
        '',
        '_Terima kasih atas perhatian dan kerja samanya._ 🙏'
      ].join('\r\n');
    }
    if (status.key === 'follow-up') {
      return [
        'Halo 👋',
        '',
        `Izin mengingatkan kembali pembayaran les untuk *${name}* periode *${periodLabel}*. Sampai saat ini pembayarannya belum tercatat di sistem kami.`,
        '',
        `*Nominal:* ${amountLabel}`,
        '',
        'Mohon bantuannya untuk mengecek pembayaran tersebut. Jika sudah melakukan pembayaran, silakan kirimkan bukti pembayaran kepada Admin.',
        '',
        'Apabila ada kendala atau membutuhkan waktu, silakan kabari Admin agar dapat kami catat dengan baik.',
        '',
        '_Terima kasih banyak atas perhatian dan kerja samanya._ 🙏'
      ].join('\r\n');
    }
    if (status.key === 'outstanding') {
      return [
        'Halo 👋',
        '',
        `Kami dari *Mr One Course* ingin menyampaikan bahwa pembayaran les untuk *${name}* periode *${periodLabel}* masih belum tercatat di sistem kami.`,
        '',
        `*Nominal:* ${amountLabel}`,
        '',
        'Mohon bantuannya untuk mengecek kembali. Jika pembayaran sudah dilakukan, silakan kirimkan bukti pembayaran kepada Admin agar dapat kami perbarui.',
        '',
        'Jika ada kendala terkait pembayaran, silakan menghubungi Admin. Kami siap membantu dan menyesuaikan pencatatan administrasinya.',
        '',
        '_Terima kasih atas perhatian dan kerja samanya._ 🙏'
      ].join('\r\n');
    }
    return [
      'Halo 👋',
      '',
      `Kami dari *Mr One Course* ingin mengingatkan dengan baik bahwa pembayaran les untuk *${name}* periode *${periodLabel}* masih belum tercatat di sistem kami.`,
      '',
      `*Nominal:* ${amountLabel}`,
      '',
      'Mohon bantuannya untuk mengecek pembayaran tersebut. Jika sudah melakukan pembayaran, silakan kirimkan bukti pembayaran kepada Admin.',
      '',
      'Apabila ada kendala atau hal yang ingin dikonfirmasi, silakan menghubungi Admin. Kami akan dengan senang hati membantu.',
      '',
      '_Terima kasih atas perhatian dan kerja samanya._ 🙏'
    ].join('\r\n');
  }

  function sendTuitionReminder(item) {
    const number = normalizePaymentWa(item.waStudent || item.waParent);
    if (!number) {
      window.alert('Nomor WhatsApp siswa/orang tua belum tersedia.');
      return;
    }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(tuitionReminderText(item))}`, '_blank', 'noopener,noreferrer');
  }

  const tuitionTargetsWithStatus = tuitionTargets
    .map((item) => ({ ...item, tuitionStatus: getTuitionWatchStatus(item.period) }))
    .sort((a, b) => (b.tuitionStatus?.priority || 0) - (a.tuitionStatus?.priority || 0) || String(a.fullName || '').localeCompare(String(b.fullName || ''), 'id'));

  const tuitionStatusCounts = tuitionTargetsWithStatus.reduce((counts, item) => {
    const key = item.tuitionStatus?.key || 'window';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const currentTuitionStatus = getTuitionWatchStatus(tuitionPeriod);

  function sendAllTuitionReminders() {
    const targets = tuitionTargetsWithStatus.filter((item) => normalizePaymentWa(item.waStudent || item.waParent));
    if (!targets.length) {
      window.alert('Tidak ada tagihan aktif dengan nomor WhatsApp yang tersedia.');
      return;
    }

    targets.forEach((item, index) => {
      const number = normalizePaymentWa(item.waStudent || item.waParent);
      const text = tuitionReminderText(item);
      setTimeout(() => {
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      }, index * 180);
    });
  }
  async function viewProof(item) { setProofLoading(item.confirmationId); try { const result = await callApi({ action: 'getPaymentProof', token, confirmationId: item.confirmationId }); setProof({ ...result, confirmationId: item.confirmationId }); } catch (error) { window.alert(error.message); } finally { setProofLoading(''); } }

  function toggleHistoricalForm() {
    setShowHistorical((value) => {
      const next = !value;
      if (next) {
        window.setTimeout(() => historicalFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
      return next;
    });
  }

  function openTuitionPaymentForm(item) {
    setHistorical({
      ...emptyHistoricalPayment(),
      studentId: String(item.studentId || '').trim().toUpperCase(),
      studentName: String(item.fullName || '').trim(),
      paymentCategory: 'Tuition',
      amount: 150000,
      paymentMethod: 'BCA',
      period: String(item.period || tuitionPeriod || '').trim(),
      fulfillmentStatus: '',
      note: 'Pembayaran periode berjalan dicatat melalui Tuition Watch.'
    });
    setShowHistorical(true);
    window.setTimeout(() => historicalFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }

  function chooseHistoricalProof(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      window.alert('Bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF.');
      event.target.value = '';
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      window.alert('Ukuran bukti pembayaran maksimal 4 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHistorical((value) => ({ ...value, proof: { fileName: file.name, mimeType: file.type, base64: String(reader.result || '') } }));
    reader.onerror = () => window.alert('File bukti pembayaran tidak dapat dibaca.');
    reader.readAsDataURL(file);
  }

  async function submitHistorical(event) {
    event.preventDefault();

    const studentId = String(historical.studentId || '').trim();
    if (!studentId) {
      window.alert('Isi Student ID terlebih dahulu.');
      return;
    }
    if (!historical.paymentDate) {
      window.alert('Pilih tanggal pembayaran.');
      return;
    }
    if (historical.paymentCategory === 'Tuition' && !historical.period) {
      window.alert('Pilih periode les.');
      return;
    }
    if (!historical.proof) {
      window.alert('Upload bukti pembayaran terlebih dahulu.');
      return;
    }

    setHistoricalSubmitting(true);
    try {
      const success = await onAddHistorical({ ...historical, studentId: studentId.toUpperCase() });
      if (success) {
        setShowHistorical(false);
        setHistorical(emptyHistoricalPayment());
      }
    } finally {
      setHistoricalSubmitting(false);
    }
  }

  function chooseCategory(category) { setHistorical({ ...historical, paymentCategory: category, amount: category === 'ID Card' ? 20000 : 150000, fulfillmentStatus: category === 'Tuition' ? '' : 'Sedang Disiapkan' }); }
  return <section className="payment-admin-page payment-admin-page-v77">
    <div className="section-heading payment-center-heading-v77">
      <div><span className="eyebrow">PAYMENT CENTER</span><h2>Kelola Pembayaran</h2></div>
      {!showHistorical && <button className="add-historical-button" type="button" onClick={toggleHistoricalForm}>＋ Tambah Pembayaran Lama</button>}
    </div>
    {showHistorical && <form ref={historicalFormRef} className="historical-payment-form historical-payment-form-v77 historical-payment-form-top-v77" onSubmit={submitHistorical}>
      <header>
        <div><small>TRANSAKSI SEBELUM PORTAL</small><h3>Tambah Pembayaran Lama</h3></div>
        <button type="button" onClick={() => setShowHistorical(false)}>×</button>
      </header>
      <div className="historical-payment-grid">
        <label><span>Student ID</span><input value={historical.studentId} onChange={(event) => setHistorical({ ...historical, studentId: event.target.value.toUpperCase() })} placeholder="MOC001" required /></label>
        {historical.studentName && <label><span>Nama Siswa</span><input value={historical.studentName} readOnly /></label>}
        <label><span>Jenis Pembayaran</span><select value={historical.paymentCategory} onChange={(event) => chooseCategory(event.target.value)}><option value="Book Package">Paket 4 Buku</option><option value="ID Card">ID Card</option><option value="Tuition">Les Bulanan</option></select></label>
        <label><span>Nominal</span><input type="number" value={historical.amount} onChange={(event) => setHistorical({ ...historical, amount: Number(event.target.value) })} required /></label>
        <label><span>Tanggal Pembayaran</span><input type="date" value={historical.paymentDate} onChange={(event) => setHistorical({ ...historical, paymentDate: event.target.value })} required /></label>
        <label><span>Metode</span><select value={historical.paymentMethod} onChange={(event) => setHistorical({ ...historical, paymentMethod: event.target.value })}><option>Tunai</option><option>QRIS</option><option>BCA</option><option>BPD Kaltimtara</option><option>SeaBank</option><option>GoPay / DANA</option></select></label>
        {historical.paymentCategory === 'Tuition' && <label><span>Periode Les</span><input type="month" value={historical.period} onChange={(event) => setHistorical({ ...historical, period: event.target.value })} required /></label>}
        {historical.paymentCategory !== 'Tuition' && <label><span>Status Penyerahan</span><select value={historical.fulfillmentStatus} onChange={(event) => setHistorical({ ...historical, fulfillmentStatus: event.target.value })}><option>Sedang Disiapkan</option><option>Siap Diambil</option><option>Sudah Diterima Siswa</option></select></label>}
        <label className="wide historical-proof-upload"><span>Bukti Pembayaran</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={chooseHistoricalProof} required /><small>{historical.proof?.fileName || 'Upload JPG, PNG, WEBP, atau PDF • Maks. 4 MB'}</small></label>
        <label className="wide"><span>Catatan</span><input value={historical.note} onChange={(event) => setHistorical({ ...historical, note: event.target.value })} placeholder="Opsional" /></label>
      </div>
      <button className="save-historical-payment" type="submit" disabled={historicalSubmitting}>{historicalSubmitting ? 'Menyimpan...' : 'Simpan sebagai Lunas'}</button>
    </form>}
    {message && <div className="error-message">{message}</div>}
    <section className="admin-tuition-watch admin-tuition-watch-v85">
      <div className="admin-tuition-watch-heading">
        <div>
          <span className="eyebrow">TUITION WATCH</span>
          <h3>Tagihan Les Aktif</h3>
          <p>Deadline pembayaran rutin tanggal 1–7 setiap bulan. Status dan pesan pengingat menyesuaikan tanggal secara otomatis.</p>
        </div>
        <button type="button" className="bulk-wa-button" onClick={sendAllTuitionReminders} disabled={!tuitionTargetsWithStatus.some((item) => normalizePaymentWa(item.waStudent || item.waParent))}>💬 Kirim Pengingat WA</button>
      </div>

      <div className="tuition-policy-strip" aria-label="Tahapan pembayaran les bulanan">
        {[
          { key: 'window', date: '1–7', label: 'Masa Pembayaran' },
          { key: 'late', date: '8–10', label: 'Terlambat' },
          { key: 'follow-up', date: '11–15', label: 'Tindak Lanjut' },
          { key: 'overdue', date: '16–akhir', label: 'Overdue' },
          { key: 'outstanding', date: 'Bulan berikut', label: 'Outstanding' }
        ].map((stage) => (
          <div key={stage.key} className={`tuition-policy-stage ${currentTuitionStatus.key === stage.key ? 'active' : ''} tuition-status-${stage.key}`}>
            <small>{stage.date}</small>
            <strong>{stage.label}</strong>
          </div>
        ))}
      </div>

      <div className={`tuition-current-status tuition-status-${currentTuitionStatus.key}`}>
        <div>
          <span>STATUS HARI INI</span>
          <strong>{currentTuitionStatus.label}</strong>
        </div>
        <p>{currentTuitionStatus.description}</p>
      </div>

      <div className="admin-tuition-watch-summary">
        <strong>{tuitionTargetsWithStatus.length}</strong>
        <span>siswa dengan tagihan aktif • {attentionLists?.period || 'periode berjalan'}</span>
      </div>

      {tuitionTargetsWithStatus.length > 0 && (
        <div className="tuition-status-summary">
          {tuitionStatusCounts.window > 0 && <span className="tuition-status-window">1–7: <b>{tuitionStatusCounts.window}</b></span>}
          {tuitionStatusCounts.late > 0 && <span className="tuition-status-late">Terlambat: <b>{tuitionStatusCounts.late}</b></span>}
          {tuitionStatusCounts['follow-up'] > 0 && <span className="tuition-status-follow-up">Tindak lanjut: <b>{tuitionStatusCounts['follow-up']}</b></span>}
          {tuitionStatusCounts.overdue > 0 && <span className="tuition-status-overdue">Overdue: <b>{tuitionStatusCounts.overdue}</b></span>}
          {tuitionStatusCounts.outstanding > 0 && <span className="tuition-status-outstanding">Outstanding: <b>{tuitionStatusCounts.outstanding}</b></span>}
        </div>
      )}

      {tuitionTargetsWithStatus.length > 0 ? (
        <div className="admin-tuition-watch-list">
          {tuitionTargetsWithStatus.map((item) => {
            const status = item.tuitionStatus || getTuitionWatchStatus(item.period);
            const hasWa = Boolean(normalizePaymentWa(item.waStudent || item.waParent));
            return (
              <div
                className={`tuition-watch-row-v85 tuition-status-${status.key}`}
                key={`tuition-watch-${item.studentId}-${item.period || tuitionPeriod}`}
                role="button"
                tabIndex="0"
                onClick={() => openTuitionPaymentForm(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openTuitionPaymentForm(item);
                  }
                }}
                aria-label={`Catat pembayaran ${item.fullName}`}
              >
                <div className="tuition-watch-student-v85">
                  <div className="tuition-watch-name-line-v85">
                    <span>{item.fullName}</span>
                    <em className={`tuition-status-badge tuition-status-${status.key}`}>{status.label}</em>
                  </div>
                  <small>{item.studentId} • {item.program || '—'}</small>
                </div>
                <strong>{formatBillingPeriod(item.period)}</strong>
                <button
                  type="button"
                  className="tuition-watch-wa-v85 tuition-watch-wa-v86"
                  disabled={!hasWa}
                  onClick={(event) => {
                    event.stopPropagation();
                    sendTuitionReminder(item);
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                  aria-label={`Kirim pengingat WhatsApp untuk ${item.fullName}`}
                  title={hasWa ? `Kirim pengingat WhatsApp ke ${item.fullName}` : 'Nomor WhatsApp siswa/orang tua belum tersedia'}
                >
                  {hasWa ? '💬 Kirim WA' : 'WA belum tersedia'}
                </button>
                <b>Tambah Pembayaran →</b>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state tuition-watch-empty">Tidak ada tagihan les aktif untuk periode ini.</div>
      )}
    </section>
    <div className="payment-admin-tabs-heading"><h3>Perlu Verifikasi</h3><span>{pending.length} menunggu</span></div>{loading ? <div className="dashboard-loading">Memuat pembayaran...</div> : pending.length === 0 ? <div className="empty-state">Tidak ada pembayaran yang menunggu verifikasi.</div> : <div className="payment-confirmation-list">{pending.map((item) => { const cash = /^Tunai\s*-/i.test(String(item.paymentMethod || '')); return <article key={item.confirmationId}><header><div><small>{item.invoiceNumber}</small><h3>{item.studentName}</h3><p>{item.studentId} • {item.itemLabel || item.paymentCategory} • {item.period}</p></div><span>MENUNGGU</span></header><div className="payment-review-details"><div><span>Nominal</span><strong>{formatRupiah(item.amount)}</strong></div><div><span>Metode</span><strong>{item.paymentMethod}</strong></div><div><span>Tanggal Bayar</span><strong>{item.paymentDate}</strong></div></div>{!cash && <button className="view-payment-proof" type="button" onClick={() => viewProof(item)} disabled={proofLoading === item.confirmationId}>{proofLoading === item.confirmationId ? 'Membuka...' : 'Lihat Bukti Pembayaran'}</button>}{cash && <div className="cash-admin-note">Pembayaran tunai — konfirmasi langsung kepada penerima yang tertera.</div>}{proof?.confirmationId === item.confirmationId && <div className="payment-proof-preview">{proof.mimeType === 'application/pdf' ? <iframe title="Bukti pembayaran PDF" src={`data:${proof.mimeType};base64,${proof.base64}`} /> : <img src={`data:${proof.mimeType};base64,${proof.base64}`} alt="Bukti pembayaran" />}<button type="button" onClick={() => setProof(null)}>Tutup Bukti</button></div>}<label className="payment-admin-note"><span>Catatan Admin (wajib jika ditolak)</span><input value={notes[item.confirmationId] || ''} onChange={(event) => setNotes({ ...notes, [item.confirmationId]: event.target.value })} placeholder="Contoh: nominal belum sesuai" /></label><footer><button className="reject" type="button" disabled={!notes[item.confirmationId]} onClick={() => onReview({ confirmationId: item.confirmationId, decision: 'reject', note: notes[item.confirmationId] })}>Tolak</button><button className="approve" type="button" onClick={() => onReview({ confirmationId: item.confirmationId, decision: 'verify', note: notes[item.confirmationId] || 'Pembayaran telah diverifikasi.' })}>Verifikasi & Tandai Lunas</button></footer></article>; })}</div>}</section>;
}

function StudentRegistrationsPage({ registrations, loading, message, onApprove, onReject, token, onRefresh }) {
  const [drafts, setDrafts] = useState({});
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState('');
  const [waLoading, setWaLoading] = useState('');

  const pending = (registrations || []).filter((item) => String(item.status).toLowerCase() === 'menunggu verifikasi');
  const approved = (registrations || []).filter((item) => String(item.status).toLowerCase() === 'disetujui');
  const rejected = (registrations || []).filter((item) => String(item.status).toLowerCase() === 'ditolak');

  const draftFor = (item) => drafts[item.registrationId] || {
    registrationId: item.registrationId,
    studentId: '',
    program: item.requestedProgram || '',
    classId: item.requestedClassId || '',
    schedule: item.requestedSchedule || '',
    note: ''
  };

  const update = (item, field, value) => setDrafts({
    ...drafts,
    [item.registrationId]: { ...draftFor(item), [field]: value }
  });

  async function viewRegistrationFile(item, fileType) {
    const key = `${item.registrationId}-${fileType}`;
    setPreviewLoading(key);
    try {
      const result = await callApi({ action: 'getRegistrationFile', token, registrationId: item.registrationId, fileType });
      setPreview({ ...result, registrationId: item.registrationId, fileType });
    } catch (error) {
      window.alert(error.message || 'File tidak dapat dibuka.');
    } finally {
      setPreviewLoading('');
    }
  }

  function normalizeWa(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      // Form lama/baru kadang menyimpan nomor Indonesia tanpa awalan 0.
      // Contoh: 895419666966 -> 62895419666966.
      digits = '62' + digits;
    }
    return digits;
  }

  function openRegistrationWhatsApp(numberValue, messageValue) {
    const number = normalizeWa(numberValue);

    // V95: pertahankan line break WA secara eksplisit sebagai CRLF.
    // Juga tetap kompatibel jika backend lama mengirim \\n sebagai teks literal.
    const normalizedMessage = String(messageValue || '')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\r\n|\r|\n/g, '\n')
      .trim();

    const message = normalizedMessage.replace(/\n/g, '\r\n');

    if (!number) {
      throw new Error('Nomor WhatsApp pendaftar belum tersedia.');
    }

    // Indonesia: 62 + nomor seluler. Tolak data yang jelas tidak valid
    // agar browser tidak menerima URL WhatsApp yang malformed.
    if (!/^62\d{8,13}$/.test(number)) {
      throw new Error('Format nomor WhatsApp tidak valid. Periksa kembali nomor pada form pendaftaran.');
    }

    // wa.me mempertahankan line break pada pesan prefilled lebih konsisten.
    const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    try {
      const opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        window.location.href = waUrl;
      }
    } catch (error) {
      window.location.href = waUrl;
    }
  }

  async function sendRegistrationWhatsApp(item, type = 'approved') {
    const key = `${item.registrationId}-${type}`;
    setWaLoading(key);
    try {
      const result = await callApi({ action: 'getRegistrationWhatsAppPayload', token, registrationId: item.registrationId });

      // Tujuan WA harus sama dengan nomor yang tampil pada kartu/form pendaftaran.
      // Backend hanya menyediakan isi pesan; nomor tujuan tidak boleh mengganti data form.
      const number = normalizeWa(item.waStudent || item.waParent);
      openRegistrationWhatsApp(number, result.combinedMessage);
    } catch (error) {
      window.alert(error.message || 'Pesan WhatsApp tidak dapat dibuat.');
    } finally {
      setWaLoading('');
    }
  }


  async function sendStudentAppGuide(item) {
    if (item.appGuideSentAt) {
      window.alert('Panduan aplikasi sudah pernah dibuka untuk dikirim ke siswa ini.');
      return;
    }
    const key = `${item.registrationId}-app-guide`;
    setWaLoading(key);
    try {
      const result = await callApi({ action:'getStudentAppGuideWhatsApp', token, registrationId:item.registrationId });

      // Gunakan nomor yang terlihat pada form pendaftaran agar tidak pernah tersasar
      // ke nomor lama dari sumber data lain.
      const number = normalizeWa(item.waStudent || item.waParent);
      openRegistrationWhatsApp(number, result.combinedMessage);

      await callApi({ action:'markStudentAppGuideSent', token, registrationId:item.registrationId });
      if (onRefresh) await onRefresh();
    } catch (error) {
      window.alert(error.message || 'Panduan aplikasi tidak dapat dibuat.');
    } finally {
      setWaLoading('');
    }
  }

  function rejectRegistration(item, draft) {
    const reason = String(draft.note || '').trim();
    if (!reason) {
      window.alert('Tuliskan alasan penolakan pada Catatan Admin terlebih dahulu.');
      return;
    }
    onReject({ registrationId: item.registrationId, note: reason });
  }

  return <section className="registration-admin-page">
    <div className="section-heading"><div><span className="eyebrow">STUDENT ACCESS</span><h2>Pendaftaran Siswa Baru</h2></div><span className="data-count">{pending.length} menunggu</span></div>
    {message && <div className="error-message">{message}</div>}

    {loading ? <div className="dashboard-loading">Memuat pendaftaran...</div> : <>
      {pending.length === 0 ? <div className="empty-state">Tidak ada pendaftaran yang menunggu verifikasi.</div> :
        <div className="registration-admin-list">{pending.map((item) => {
          const draft = draftFor(item);
          return <article key={item.registrationId}>
            <header><div><small>{item.registrationId}</small><h3>{item.fullName}</h3><p>{item.school} • {item.grade}</p></div><span>MENUNGGU</span></header>
            <div className="registration-submitted-data">
              <div><span>Nama Lengkap</span><strong>{item.fullName || '—'}</strong></div>
              <div><span>Tanggal Lahir</span><strong>{item.dob || '—'}</strong></div>
              <div><span>Sekolah</span><strong>{item.school || '—'}</strong></div>
              <div><span>Kelas Sekolah</span><strong>{item.grade || '—'}</strong></div>
              <div className="wide"><span>Alamat</span><strong>{item.address || '—'}</strong></div>
              <div><span>WA Siswa</span><strong>{item.waStudent || '—'}</strong></div>
              <div><span>WA Orang Tua</span><strong>{item.waParent || '—'}</strong></div>
              <div><span>Program</span><strong>{item.requestedProgram || '—'}</strong></div>
              <div><span>Class ID Pilihan</span><strong>{item.requestedClassId || '—'}</strong></div>
              <div className="wide"><span>Jadwal Pilihan</span><strong>{item.requestedSchedule || '—'}</strong></div>
              <div><span>Les Pertama</span><strong>{formatRupiah(item.firstTuitionAmount || 0)}</strong></div>
              <div><span>Paket Buku</span><strong>{item.bookPackage || 'Tidak'}{item.bookAmount ? ` • ${formatRupiah(item.bookAmount)}` : ''}</strong></div>
              <div><span>ID Card</span><strong>{item.idCard || 'Tidak'}{item.idCardAmount ? ` • ${formatRupiah(item.idCardAmount)}` : ''}</strong></div>
              <div><span>Rekening Tujuan</span><strong>{item.transferBank || '—'}</strong></div>
              <div><span>Total Transfer</span><strong>{formatRupiah(item.totalAmount || 0)}</strong></div>
              <div><span>Status Pembayaran</span><strong>{item.paymentStatus || '—'}</strong></div>
              <div><span>Waktu Daftar</span><strong>{item.registeredAt || '—'}</strong></div>
              <div><span>Akun Login</span><strong>Belum dibuat</strong></div>
            </div>

            <div className="registration-file-actions">
              <button type="button" className="primary-proof-action" onClick={() => viewRegistrationFile(item, 'payment')} disabled={previewLoading === `${item.registrationId}-payment`}>{previewLoading === `${item.registrationId}-payment` ? 'Membuka Bukti Transfer...' : 'Lihat Bukti Transfer'}</button>
              {item.idCard === 'Ya' && <button type="button" onClick={() => viewRegistrationFile(item, 'photo')} disabled={previewLoading === `${item.registrationId}-photo`}>{previewLoading === `${item.registrationId}-photo` ? 'Membuka...' : 'Lihat Foto ID Card'}</button>}
            </div>

            {preview?.registrationId === item.registrationId && <div className="registration-file-preview">
              {preview.mimeType === 'application/pdf' ? <iframe title="Registration file" src={`data:${preview.mimeType};base64,${preview.base64}`} /> : <img src={`data:${preview.mimeType};base64,${preview.base64}`} alt="" />}
              <button type="button" onClick={() => setPreview(null)}>Tutup</button>
            </div>}

            <div className="registration-approval-grid">
              <label><span>Student ID</span><input value={draft.studentId} onChange={(event) => update(item, 'studentId', event.target.value.toUpperCase())} placeholder="Otomatis saat disetujui" /><small className="admin-field-help">Kosongkan untuk membuat Student ID otomatis.</small></label>
              <label><span>Program</span><input value={draft.program} onChange={(event) => update(item, 'program', event.target.value)} /></label>
              <label><span>Class ID</span><input value={draft.classId} onChange={(event) => update(item, 'classId', event.target.value)} placeholder="GRAMMAR-A" /></label>
              <label><span>Jadwal</span><input value={draft.schedule} onChange={(event) => update(item, 'schedule', event.target.value)} placeholder="Rabu & Jumat 19.00–20.00" /></label>
            </div>
            <label className="registration-note"><span>Catatan Admin</span><input value={draft.note} onChange={(event) => update(item, 'note', event.target.value)} /></label>
            <footer><button type="button" className="reject" onClick={() => rejectRegistration(item, draft)}>Tolak</button><button type="button" className="approve" disabled={!draft.program || !draft.classId || !draft.schedule} onClick={() => onApprove(draft)}>Verifikasi & Setujui Pendaftaran</button></footer>
          </article>;
        })}</div>}

      {approved.length > 0 && <div className="registration-approved-section">
        <div className="registration-approved-heading"><div><span className="eyebrow">SUDAH DIVERIFIKASI</span><h3>Kirim Hasil Verifikasi</h3></div><small>Status pendaftaran + pembayaran + data siswa</small></div>
        <div className="registration-admin-list">{approved.map((item) => <article key={`approved-${item.registrationId}`} className="registration-approved-card">
          <header><div><small>{item.registrationId}</small><h3>{item.fullName}</h3><p>{item.requestedProgram || '—'} • {item.requestedSchedule || '—'}</p></div><span className="approved-status">DISETUJUI</span></header>
          <div className="registration-contact"><span>Student ID: <b>{item.studentId || '—'}</b></span><span>WA: <b>{item.waStudent || item.waParent || '—'}</b></span></div>
          <div className="registration-wa-actions registration-wa-actions-approved">
            <button type="button" onClick={() => sendRegistrationWhatsApp(item, 'approved')} disabled={waLoading === `${item.registrationId}-approved`}>
              {waLoading === `${item.registrationId}-approved` ? 'Membuka...' : '💬 Kirim Hasil Verifikasi'}
            </button>
            <button type="button" className={item.appGuideSentAt ? 'sent' : ''} onClick={() => sendStudentAppGuide(item)} disabled={Boolean(item.appGuideSentAt) || waLoading === `${item.registrationId}-app-guide`}>
              {item.appGuideSentAt ? '✓ Panduan Aplikasi Sudah Dikirim' : waLoading === `${item.registrationId}-app-guide` ? 'Membuka Panduan...' : '📱 Kirim Panduan Aplikasi via WA'}
            </button>
          </div>
        </article>)}</div>
      </div>}

      {rejected.length > 0 && <div className="registration-rejected-section">
        <div className="registration-approved-heading"><div><span className="eyebrow">DITOLAK</span><h3>Informasikan Hasil Verifikasi</h3></div><small>Alasan penolakan + tindak lanjut</small></div>
        <div className="registration-admin-list">{rejected.map((item) => <article key={`rejected-${item.registrationId}`} className="registration-rejected-card">
          <header><div><small>{item.registrationId}</small><h3>{item.fullName}</h3><p>{item.requestedProgram || '—'} • {item.requestedSchedule || '—'}</p></div><span className="rejected-status">DITOLAK</span></header>
          <div className="registration-rejection-reason"><span>Alasan</span><strong>{item.adminNote || '—'}</strong></div>
          <div className="registration-contact"><span>WA: <b>{item.waStudent || item.waParent || '—'}</b></span></div>
          <div className="registration-wa-actions single">
            <button type="button" onClick={() => sendRegistrationWhatsApp(item, 'rejected')} disabled={waLoading === `${item.registrationId}-rejected`}>
              {waLoading === `${item.registrationId}-rejected` ? 'Membuka...' : '💬 Kirim Alasan Penolakan via WA'}
            </button>
          </div>
        </article>)}</div>
      </div>}
    </>}
  </section>;
}

function StudentsPage({ students, loading, search, onSearchChange, onSearch, pagination, onPageChange, message, token, attentionLists, userRole, onBack }) {
  const normalizedUserRole = String(userRole || '').trim().toLowerCase();
  const isCEOStudentManager = normalizedUserRole === 'ceo';
  const isAdminStudentManager = normalizedUserRole === 'admin';
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailMessage, setDetailMessage] = useState('');
  const [activationGuideLoading, setActivationGuideLoading] = useState(false);
  const [studentAccountLoading, setStudentAccountLoading] = useState(false);
  const [studentAccountMessage, setStudentAccountMessage] = useState('');
  const [bulkAccountPassword, setBulkAccountPassword] = useState('');
  const [bulkAccountLoading, setBulkAccountLoading] = useState(false);
  const [bulkAccountMessage, setBulkAccountMessage] = useState('');
  const [studentLeaveForm, setStudentLeaveForm] = useState(() => {
    const date = new Date();
    return { period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, note: '' };
  });
  const [studentLeaveLoading, setStudentLeaveLoading] = useState(false);
  const [studentLeaveMessage, setStudentLeaveMessage] = useState('');
  const [studentStopNote, setStudentStopNote] = useState('');
  const [studentStopLoading, setStudentStopLoading] = useState(false);
  const [studentStopMessage, setStudentStopMessage] = useState('');
  const [studentArchiveLoading, setStudentArchiveLoading] = useState(false);
  const [studentArchiveMessage, setStudentArchiveMessage] = useState('');
  const [alumniOpen, setAlumniOpen] = useState(false);
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [alumniStudents, setAlumniStudents] = useState([]);
  const [alumniMessage, setAlumniMessage] = useState('');

  function closeStudentDetail() {
    setSelectedStudentId('');
    setDetail(null);
    setDetailMessage('');
    setStudentAccountMessage('');
    setStudentLeaveMessage('');
    setStudentStopMessage('');
    setStudentArchiveMessage('');
  }

  useEdgeSwipeBack(
    () => {
      if (selectedStudentId) {
        closeStudentDetail();
      } else if (onBack) {
        onBack();
      }
    },
    true
  );

  function normalizeAdminWa(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.slice(1);
    return digits;
  }

  function sendAttendanceWhatsApp(item) {
    const number = normalizeAdminWa(item.waStudent || item.waParent);
    if (!number) return;
    const text = `Hallo ${item.fullName || 'Siswa'}, kami mencatat ketidakhadiran bulan ini sebanyak ${item.absentCount || 0} kali. Mohon konfirmasi jika ada kendala terkait jadwal les. Terima kasih.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function sendLegacyStudentActivationGuide() {
    const student = detail?.student || {};
    const status = String(student.status || 'Aktif').trim().toLowerCase();
    const accountStatus = String(student.accountStatus || '').trim().toLowerCase();

    if (status !== '' && status !== 'aktif' && status !== 'active') {
      window.alert('Siswa berstatus Non Aktif sehingga panduan aktivasi tidak dapat dikirim.');
      return;
    }

    if (accountStatus === 'aktif' || accountStatus === 'active') {
      window.alert('Akun siswa ini sudah aktif. Tidak perlu mengirim panduan aktivasi lagi.');
      return;
    }

    if (student.activationGuideSentAt) {
      window.alert('Panduan aktivasi akun sudah pernah dikirim kepada siswa ini.');
      return;
    }

    setActivationGuideLoading(true);
    try {
      const result = await callApi({
        action: 'getLegacyStudentActivationGuideWhatsApp',
        token,
        studentId: student.studentId
      });

      const number = normalizeAdminWa(result.waStudent || result.waParent);
      if (!number) throw new Error('Nomor WhatsApp siswa maupun orang tua belum tersedia.');

      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(result.combinedMessage)}`,
        '_blank',
        'noopener,noreferrer'
      );

      await callApi({
        action: 'markLegacyStudentActivationGuideSent',
        token,
        studentId: student.studentId
      });

      await openStudentDetail(student.studentId);
    } catch (error) {
      window.alert(error.message || 'Panduan aktivasi akun tidak dapat dibuat.');
    } finally {
      setActivationGuideLoading(false);
    }
  }

  async function saveStudentAccount() {
    const student = detail?.student || {};
    const defaultPassword = 'Siswa123';
    const confirmed = window.confirm(`Reset password ${student.fullName || student.studentId} ke ${defaultPassword}? Session siswa lama akan dibatalkan.`);
    if (!confirmed) return;

    setStudentAccountLoading(true);
    setStudentAccountMessage('');
    try {
      await callApi({
        action: 'adminResetStudentPassword',
        token,
        studentId: student.studentId,
      });
      setStudentAccountMessage(`Password ${student.studentId || 'siswa'} berhasil direset ke ${defaultPassword}.`);
      await openStudentDetail(student.studentId);
    } catch (error) {
      setStudentAccountMessage(error.message || 'Password siswa gagal direset.');
    } finally {
      setStudentAccountLoading(false);
    }
  }

  function changeStudentLeavePeriod(period) {
    const existing = (detail?.leaveHistory || []).find((item) => item.period === period);
    setStudentLeaveForm({ period, note: existing?.note || '' });
    setStudentLeaveMessage('');
  }

  async function saveStudentLeave() {
    const student = detail?.student || {};
    const period = String(studentLeaveForm.period || '').trim();
    if (!period) {
      setStudentLeaveMessage('Pilih bulan cuti terlebih dahulu.');
      return;
    }

    const nowDate = new Date();
    const currentPeriod = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
    const confirmed = window.confirm(
      period === currentPeriod
        ? `Tandai ${student.fullName || student.studentId} CUTI untuk ${period}? Bulan ini tidak akan ditagihkan dan status siswa menjadi Non Aktif.`
        : `Simpan riwayat CUTI ${student.fullName || student.studentId} untuk ${period}? Bulan tersebut tidak akan dihitung sebagai tunggakan dan status siswa saat ini tetap.`
    );
    if (!confirmed) return;

    setStudentLeaveLoading(true);
    setStudentLeaveMessage('');
    try {
      const result = await callApi({
        action: 'adminSetStudentLeave',
        token,
        studentId: student.studentId,
        leave: { period, note: String(studentLeaveForm.note || '').trim() },
      });
      setStudentLeaveMessage(result.message || 'Status cuti berhasil disimpan.');
      await openStudentDetail(student.studentId, period);
    } catch (error) {
      setStudentLeaveMessage(error.message || 'Status cuti gagal disimpan.');
    } finally {
      setStudentLeaveLoading(false);
    }
  }

  async function reactivateStudent() {
    const student = detail?.student || {};
    const confirmed = window.confirm(
      `Aktifkan kembali ${student.fullName || student.studentId}? Penanda CUTI pada bulan sebelumnya tetap tersimpan dan tidak akan menjadi tunggakan.`
    );
    if (!confirmed) return;

    setStudentLeaveLoading(true);
    setStudentLeaveMessage('');
    try {
      const result = await callApi({
        action: 'adminReactivateStudent',
        token,
        studentId: student.studentId,
      });
      setStudentLeaveMessage(result.message || 'Siswa berhasil diaktifkan kembali.');
      await openStudentDetail(student.studentId, studentLeaveForm.period);
    } catch (error) {
      setStudentLeaveMessage(error.message || 'Siswa gagal diaktifkan kembali.');
    } finally {
      setStudentLeaveLoading(false);
    }
  }

  async function stopStudent() {
    const student = detail?.student || {};
    const studentName = student.fullName || student.studentId || 'siswa ini';
    const confirmed = window.confirm(
      `Konfirmasi ${studentName} berhenti les? Status akan menjadi Berhenti Les, akun siswa dinonaktifkan, dan siswa tidak akan masuk tagihan berikutnya. Data akademik dan pembayaran lama tetap tersimpan.`
    );
    if (!confirmed) return;

    setStudentStopLoading(true);
    setStudentStopMessage('');
    try {
      const result = await callApi({
        action: 'adminStopStudent',
        token,
        studentId: student.studentId,
        note: String(studentStopNote || '').trim(),
      });
      setStudentStopMessage(result.message || 'Status siswa berhasil diubah menjadi Berhenti Les.');
      await openStudentDetail(student.studentId, studentLeaveForm.period);
    } catch (error) {
      setStudentStopMessage(error.message || 'Status berhenti les gagal disimpan.');
    } finally {
      setStudentStopLoading(false);
    }
  }

  async function reactivateStoppedStudent() {
    const student = detail?.student || {};
    const confirmed = window.confirm(
      `Aktifkan kembali ${student.fullName || student.studentId}? Status siswa dan akun akan kembali Aktif. Riwayat data sebelumnya tetap tersimpan.`
    );
    if (!confirmed) return;

    setStudentStopLoading(true);
    setStudentStopMessage('');
    try {
      const result = await callApi({
        action: 'adminReactivateStudent',
        token,
        studentId: student.studentId,
      });
      setStudentStopMessage(result.message || 'Siswa berhasil diaktifkan kembali.');
      await openStudentDetail(student.studentId, studentLeaveForm.period);
    } catch (error) {
      setStudentStopMessage(error.message || 'Siswa gagal diaktifkan kembali.');
    } finally {
      setStudentStopLoading(false);
    }
  }

  async function archiveStoppedStudent() {
    const student = detail?.student || {};
    const studentName = student.fullName || student.studentId || 'siswa ini';
    const confirmed = window.confirm(
      `Pindahkan ${studentName} ke Daftar Alumni? Data siswa akan dipindahkan dari Siswa Aktif, riwayat pembayaran dipindahkan ke Data Pembayaran Alumni, dan slot Student ID ${student.studentId || ''} akan dikosongkan untuk siswa baru. Tindakan ini tidak dapat dibatalkan dari halaman ini.`
    );
    if (!confirmed) return;

    setStudentArchiveLoading(true);
    setStudentArchiveMessage('');
    try {
      const result = await callApi({
        action: 'adminArchiveStudentToAlumni',
        token,
        studentId: student.studentId,
      });
      setStudentArchiveMessage(result.message || 'Siswa berhasil dipindahkan ke Daftar Alumni.');
      setSelectedStudentId('');
      setDetail(null);
      if (onSearch) await onSearch();
      if (alumniOpen) await loadAlumniStudents();
      window.alert(result.message || 'Siswa berhasil dipindahkan ke Daftar Alumni Mr One Course.');
    } catch (error) {
      setStudentArchiveMessage(error.message || 'Siswa gagal dipindahkan ke Daftar Alumni.');
    } finally {
      setStudentArchiveLoading(false);
    }
  }

  async function loadAlumniStudents() {
    setAlumniLoading(true);
    setAlumniMessage('');
    try {
      const result = await callApi({ action: 'getAlumniStudents', token });
      setAlumniStudents(result.alumni || []);
    } catch (error) {
      setAlumniMessage(error.message || 'Daftar alumni gagal dimuat.');
    } finally {
      setAlumniLoading(false);
    }
  }

  async function toggleAlumniList() {
    const nextOpen = !alumniOpen;
    setAlumniOpen(nextOpen);
    if (nextOpen) await loadAlumniStudents();
  }

  async function resetAllStudentAccounts() {
    const password = String(bulkAccountPassword || '');
    if (password.length < 8) {
      setBulkAccountMessage('Password awal minimal 8 karakter.');
      return;
    }

    const confirmed = window.confirm('Reset/aktifkan SEMUA akun siswa aktif dengan password awal ini? Semua session siswa lama akan dibatalkan. Akun CEO, Admin, dan Tutor tidak akan diubah.');
    if (!confirmed) return;

    setBulkAccountLoading(true);
    setBulkAccountMessage('');
    try {
      const result = await callApi({
        action: 'adminResetAllStudentAccounts',
        token,
        password,
      });
      setBulkAccountMessage(result.message || 'Semua akun siswa aktif berhasil disiapkan.');
      setBulkAccountPassword('');
      if (onSearch) await onSearch();
    } catch (error) {
      setBulkAccountMessage(error.message || 'Reset massal akun siswa gagal.');
    } finally {
      setBulkAccountLoading(false);
    }
  }

  function submitSearch(event) { event.preventDefault(); onSearch(); }

  async function openStudentDetail(studentId, preferredLeavePeriod = '') {
    setSelectedStudentId(studentId); setDetail(null); setDetailMessage(''); setDetailLoading(true);
    try {
      const result = await callApi({ action: 'getAdminStudentDetail', token, studentId });
      setDetail(result);
      const date = new Date();
      const defaultPeriod = preferredLeavePeriod || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existingLeave = (result.leaveHistory || []).find((item) => item.period === defaultPeriod);
      setStudentLeaveForm({ period: defaultPeriod, note: existingLeave?.note || '' });
      setStudentStopNote(result.stopInfo?.note || '');
    }
    catch (error) { setDetailMessage(error.message || 'Detail siswa gagal dimuat.'); }
    finally { setDetailLoading(false); }
  }

  if (selectedStudentId) {
    return <section className="students-page admin-student-detail-page">
      <button type="button" className="admin-student-detail-back" onClick={closeStudentDetail}>← Kembali ke Data Siswa</button>
      {detailLoading ? <div className="dashboard-loading">Memuat laporan siswa...</div> : detailMessage ? <div className="error-message">{detailMessage}</div> : detail ? <>
        <div className="admin-student-detail-hero">
          <div className="student-avatar large">{String(detail.student?.fullName || 'S').charAt(0).toUpperCase()}</div>
          <div><span className="eyebrow">STUDENT PROFILE</span><h1>{detail.student?.fullName || 'Siswa'}</h1><p>{detail.student?.studentId || '—'} • {detail.student?.program || '—'} • {detail.student?.className || detail.student?.classId || '—'}</p></div>
          <span className={`student-status ${String(detail.student?.status).toLowerCase() === 'aktif' ? 'active' : ''}`}>{detail.student?.status || 'Aktif'}</span>
        </div>
        <section className="admin-student-detail-grid">
          <article><span className="eyebrow">PROFIL</span><h3>Data Siswa</h3><div className="admin-detail-keyvalues">
            <div><span>Sekolah</span><strong>{detail.student?.school || '—'}</strong></div><div><span>Kelas</span><strong>{detail.student?.grade || '—'}</strong></div><div><span>Jadwal</span><strong>{detail.student?.schedule || '—'}</strong></div><div><span>WA Siswa</span><strong>{detail.student?.waStudent || '—'}</strong></div><div><span>WA Orang Tua</span><strong>{detail.student?.waParent || '—'}</strong></div><div><span>Status Akun</span><strong>{detail.student?.accountStatus || '—'}</strong></div>
          </div>
          <div className="admin-student-account-control">
            <div>
              <strong>Reset Password Siswa</strong>
              <small>Username tetap Student ID. Jika direset, password kembali ke <b>Siswa123</b>. Siswa tetap boleh mengganti password sendiri dari Profil.</small>
            </div>
            {(() => {
              const studentStatus = String(detail.student?.status || 'Aktif').trim().toLowerCase();
              const activeStudent = studentStatus === '' || studentStatus === 'aktif' || studentStatus === 'active';
              if (!activeStudent) return <button type="button" disabled>Siswa Non Aktif</button>;
              return <>
                {studentAccountMessage && <div className="admin-student-account-message">{studentAccountMessage}</div>}
                <button type="button" onClick={saveStudentAccount} disabled={studentAccountLoading}>
                  {studentAccountLoading ? 'Mereset...' : 'Reset Password ke Siswa123'}
                </button>
              </>;
            })()}
          </div>
          <div className="admin-student-leave-control">
            <div className="admin-student-leave-heading">
              <div>
                <strong>Cuti Siswa</strong>
                <small>Tandai bulan yang tidak mengikuti les. Bulan CUTI tidak masuk tagihan atau tunggakan.</small>
              </div>
              <span className={String(detail.student?.status || '').trim().toLowerCase() === 'aktif' ? 'leave-status active' : 'leave-status inactive'}>{detail.student?.status || 'Aktif'}</span>
            </div>
            <div className="admin-student-leave-grid">
              <label><span>Bulan Cuti</span><input type="month" min={`${new Date().getFullYear()}-01`} max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`} value={studentLeaveForm.period} onChange={(event) => changeStudentLeavePeriod(event.target.value)} /></label>
              <label><span>Keterangan Cuti (opsional)</span><input value={studentLeaveForm.note} maxLength={180} onChange={(event) => setStudentLeaveForm({ ...studentLeaveForm, note: event.target.value })} placeholder="Contoh: izin keluarga / istirahat sementara" /></label>
            </div>
            <div className="admin-student-leave-actions">
              <button type="button" className="mark-leave" onClick={saveStudentLeave} disabled={studentLeaveLoading || !studentLeaveForm.period || /^(berhenti les|berhenti|stopped)$/i.test(String(detail.student?.status || '').trim())}>{studentLeaveLoading ? 'Menyimpan...' : ((detail.leaveHistory || []).some((item) => item.period === studentLeaveForm.period) ? 'Perbarui Keterangan Cuti' : 'Tandai Cuti')}</button>
              {(() => {
                const status = String(detail.student?.status || '').trim().toLowerCase();
                const isInactive = status === 'non aktif' || status === 'nonaktif' || status === 'inactive';
                return isInactive ? <button type="button" className="reactivate-student" onClick={reactivateStudent} disabled={studentLeaveLoading}>{studentLeaveLoading ? 'Memproses...' : 'Aktifkan Kembali'}</button> : null;
              })()}
            </div>
            {studentLeaveMessage && <div className="admin-student-leave-message">{studentLeaveMessage}</div>}
            {(detail.leaveHistory || []).length > 0 && <div className="admin-student-leave-history">
              <span>Riwayat Cuti</span>
              <div>{detail.leaveHistory.map((item) => <button type="button" key={item.period} onClick={() => changeStudentLeavePeriod(item.period)}><b>{item.period}</b><small>{item.note || 'Tanpa keterangan'}</small></button>)}</div>
            </div>}
            <small className="admin-student-leave-note">Saat siswa kembali les, klik <b>Aktifkan Kembali</b>. Penanda CUTI pada bulan sebelumnya tetap tersimpan.</small>
          </div>
          <div className="admin-student-stop-control">
            {(() => {
              const status = String(detail.student?.status || '').trim().toLowerCase();
              const stopped = status === 'berhenti les' || status === 'berhenti' || status === 'stopped';
              return <>
                <div className="admin-student-stop-heading">
                  <div>
                    <strong>Berhenti Les</strong>
                    <small>Gunakan jika siswa benar-benar berhenti, bukan hanya cuti sementara. Data lama tidak dihapus.</small>
                  </div>
                  <span className={stopped ? 'stop-status stopped' : 'stop-status normal'}>{stopped ? 'BERHENTI LES' : 'AKTIF / CUTI'}</span>
                </div>
                {stopped ? <>
                  <div className="admin-student-stop-summary">
                    <span>Dikonfirmasi</span><strong>{detail.stopInfo?.date || '—'}</strong>
                    <span>Keterangan</span><strong>{detail.stopInfo?.note || 'Tanpa keterangan'}</strong>
                  </div>
                  <button type="button" className="reactivate-stopped-student" onClick={reactivateStoppedStudent} disabled={studentStopLoading || studentArchiveLoading}>{studentStopLoading ? 'Memproses...' : 'Aktifkan Kembali'}</button>
                  <button type="button" className="confirm-stop-student" onClick={archiveStoppedStudent} disabled={studentArchiveLoading || studentStopLoading}>{studentArchiveLoading ? 'Memindahkan ke Alumni...' : 'Pindahkan ke Alumni & Kosongkan Slot ID'}</button>
                  {studentArchiveMessage && <div className="admin-student-stop-message">{studentArchiveMessage}</div>}
                </> : <>
                  <label><span>Keterangan (opsional)</span><input value={studentStopNote} maxLength={180} onChange={(event) => setStudentStopNote(event.target.value)} placeholder="Contoh: pindah kota / tidak melanjutkan program" /></label>
                  <button type="button" className="confirm-stop-student" onClick={stopStudent} disabled={studentStopLoading}>{studentStopLoading ? 'Memproses...' : 'Konfirmasi Berhenti Les'}</button>
                </>}
                {studentStopMessage && <div className="admin-student-stop-message">{studentStopMessage}</div>}
                <small className="admin-student-stop-note">Langkah 1: konfirmasi Berhenti Les. Langkah 2: jika data sudah final, gunakan <b>Pindahkan ke Alumni & Kosongkan Slot ID</b>. Data siswa dan pembayaran dipindahkan ke arsip Alumni sebelum slot Student ID tersedia untuk siswa baru.</small>
              </>;
            })()}
          </div></article>
          <article><span className="eyebrow">MONTHLY REPORT</span><h3>Laporan Bulanan</h3><div className="admin-summary-stats">
            <div><strong>{detail.monthlyReport?.attendancePercentage ?? 0}%</strong><span>Kehadiran</span></div><div><strong>{detail.monthlyReport?.averageScore ?? '—'}</strong><span>Rata-rata Nilai</span></div><div><strong>{detail.monthlyReport?.completedAssignments ?? 0}</strong><span>Tugas Selesai</span></div>
          </div><p>{detail.monthlyReport?.tutorComment || 'Belum ada komentar tutor untuk periode ini.'}</p></article>
          <article className="wide"><span className="eyebrow">LEARNING ACTIVITY</span><h3>Aktivitas Pembelajaran</h3>
            {(detail.learningActivities || []).length ? <div className="admin-timeline">{detail.learningActivities.map((item,index) => <div key={`${item.date}-${index}`}><b>{item.meetingNumber || index + 1}</b><div><strong>{item.title || 'Pembelajaran'}</strong><span>{item.date || '—'}{item.objective ? ` • ${item.objective}` : ''}</span><small>{item.activities || item.notes || ''}</small></div></div>)}</div> : <p>Belum ada aktivitas pembelajaran yang tercatat.</p>}
          </article>
          <article><span className="eyebrow">CLASS ADMINISTRATION</span><h3>Administrasi Kelas</h3><div className="admin-detail-keyvalues">
            <div><span>Kehadiran Bulan Ini</span><strong>{detail.administration?.present ?? 0} hadir / {detail.administration?.absent ?? 0} tidak hadir</strong></div><div><span>Status Les Bulan Ini</span><strong>{detail.administration?.tuitionStatus || '—'}</strong></div><div><span>Pembayaran Terakhir</span><strong>{detail.administration?.lastPayment || '—'}</strong></div><div><span>Class ID</span><strong>{detail.student?.classId || '—'}</strong></div>
          </div></article>
          <article><span className="eyebrow">REWARDS</span><h3>Reward & Gamifikasi</h3><div className="admin-summary-stats">
            <div><strong>{detail.rewards?.lifetimeExp ?? 0}</strong><span>Total EXP</span></div><div><strong>{detail.rewards?.rank || 'Newcomer'}</strong><span>Rank</span></div><div><strong>{detail.rewards?.unlockedBadges ?? 0}</strong><span>Badge</span></div>
          </div>{(detail.rewards?.badges || []).length ? <div className="admin-badge-mini-list">{detail.rewards.badges.map((badge) => <span key={badge.name}>{badge.name}</span>)}</div> : <p>Belum ada badge yang terbuka.</p>}</article>
        </section>
      </> : null}
    </section>;
  }

  return <section className="students-page">
    {isCEOStudentManager && <section className="admin-student-account-bulk-card">
      <div className="section-heading">
        <div><span className="eyebrow">CEO • STUDENT ACCOUNT CONTROL</span><h2>Aktivasi / Reset Semua Akun Siswa</h2><p>Kontrol massal akun siswa dipusatkan di CEO. Hanya siswa berstatus aktif yang diproses; data pembayaran, absensi, EXP, badge, dan akademik tidak diubah.</p></div>
      </div>
      <div className="admin-student-account-bulk-form">
        <label><span>Password awal yang sama untuk semua siswa</span><input type="password" minLength="8" value={bulkAccountPassword} onChange={(event) => setBulkAccountPassword(event.target.value)} placeholder="Minimal 8 karakter" /></label>
        <button type="button" onClick={resetAllStudentAccounts} disabled={bulkAccountLoading || String(bulkAccountPassword).length < 8}>{bulkAccountLoading ? 'Memproses semua akun...' : 'Aktifkan / Reset Semua Siswa Aktif'}</button>
      </div>
      {bulkAccountMessage && <div className="admin-student-account-message bulk">{bulkAccountMessage}</div>}
      <small className="admin-student-account-warning">Tindakan ini membatalkan session siswa lama sehingga mereka harus Sign In kembali menggunakan Student ID dan password awal baru.</small>
    </section>}

    {isAdminStudentManager && <section className="admin-attendance-watch">
      <div className="section-heading">
        <div><span className="eyebrow">ATTENDANCE WATCH</span><h2>Perlu Konfirmasi Kehadiran</h2></div>
        <span className="data-count">{attentionLists?.absentMoreThanFour?.length || 0} siswa</span>
      </div>
      {(attentionLists?.absentMoreThanFour || []).length ? (
        <div className="admin-attendance-watch-list">
          {attentionLists.absentMoreThanFour.map((item) => {
            const hasWa = Boolean(String(item.waStudent || item.waParent || '').replace(/\D/g, ''));
            return <article key={`attendance-watch-${item.studentId}`}>
              <div><strong>{item.fullName}</strong><small>{item.studentId} • {item.className || item.classId || '—'} • Tidak hadir {item.absentCount}x</small></div>
              <button type="button" disabled={!hasWa} onClick={() => sendAttendanceWhatsApp(item)}>{hasWa ? 'Konfirmasi WA' : 'WA belum tersedia'}</button>
            </article>;
          })}
        </div>
      ) : <div className="admin-watch-empty">Tidak ada siswa dengan ketidakhadiran lebih dari 4 kali bulan ini.</div>}
    </section>}

    <section className="admin-student-account-bulk-card">
      <div className="section-heading">
        <div><span className="eyebrow">ALUMNI</span><h2>Daftar Alumni Mr One Course</h2><p>Siswa yang sudah berhenti dan telah diarsipkan tidak lagi tampil di Siswa Aktif. Slot Student ID-nya dapat dipakai untuk pendaftar baru.</p></div>
        <button type="button" onClick={toggleAlumniList}>{alumniOpen ? 'Tutup Daftar Alumni' : 'Lihat Daftar Alumni'}</button>
      </div>
      {alumniOpen && <>
        {alumniMessage && <div className="error-message">{alumniMessage}</div>}
        {alumniLoading ? <div className="dashboard-loading">Memuat daftar alumni...</div> : alumniStudents.length === 0 ? <div className="empty-state">Belum ada siswa yang dipindahkan ke alumni.</div> : <div className="student-list">
          {alumniStudents.map((student, index) => <div className="student-card" key={`${student.alumniId || student.studentId}-${index}`}>
            <div className="student-avatar">{String(student.fullName || 'A').charAt(0).toUpperCase()}</div>
            <div className="student-info"><div className="student-name-row"><strong>{student.fullName || 'Alumni'}</strong><span className="student-status">ALUMNI</span></div><span>{student.studentId || '—'}</span><p>{student.program || 'Program tidak tercatat'} • {student.className || student.classId || 'Kelas tidak tercatat'}</p><small>Diarsipkan {student.archivedAt || '—'}{student.stopNote ? ` • ${student.stopNote}` : ''}</small></div>
          </div>)}
        </div>}
      </>}
    </section>

    <div className="page-heading"><div><span className="eyebrow">STUDENT DIRECTORY</span><h1>Data Siswa</h1><p>{pagination.totalData || 0} siswa ditemukan</p></div></div>
    <form className="student-search" onSubmit={submitSearch}><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cari nama, ID, sekolah, atau kelas" /><button type="submit">Cari</button></form>
    {message && <div className="error-message">{message}</div>}
    {loading ? <div className="dashboard-loading">Memuat data siswa...</div> : students.length === 0 ? <div className="empty-state">Data siswa tidak ditemukan.</div> : <div className="student-list">
      {students.map((student) => <button type="button" className="student-card student-card-action" key={student.studentId} onClick={() => openStudentDetail(student.studentId)}>
        <div className="student-avatar">{String(student.fullName || 'S').charAt(0).toUpperCase()}</div>
        <div className="student-info"><div className="student-name-row"><strong>{student.fullName || 'Tanpa nama'}</strong><span className={`student-status ${String(student.status).toLowerCase() === 'aktif' ? 'active' : ''}`}>{student.status || 'Aktif'}</span></div><span>{student.studentId || '-'}</span><p>{student.program || 'Program belum diisi'} • {student.className || student.classId || 'Kelas belum diisi'}</p><small>{student.school || 'Sekolah belum diisi'}{student.grade ? ` • ${student.grade}` : ''}</small></div>
        <b className="student-card-open">→</b>
      </button>)}
    </div>}
    {!loading && pagination.totalPages > 1 && <div className="pagination"><button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>← Sebelumnya</button><span>Halaman {pagination.page} dari {pagination.totalPages}</span><button disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>Berikutnya →</button></div>}
  </section>;
}

export default App;
