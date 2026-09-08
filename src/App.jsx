import { useEffect, useState } from 'react';

const API_URL =
'https://script.google.com/macros/s/AKfycbzhR99zk3pSqjxF8rxmG19xHjs9ctbSya1WRQLTrqLmCERppy2muP8UEUIz40zbPm2NBg/exec';

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
    { page: 'checkin', icon: 'checkin', label: 'Check-in' },
    { page: 'full-report', icon: 'academic', label: isID ? 'Akademik' : 'Academic' },
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
              className={activePage === item.page ? 'active' : ''}
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
                  <span>↪</span>
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

function buildStudentBadges(overview, isID) {
  const monthly = overview?.experience?.monthly || {};
  const assignments = Array.isArray(overview?.assignments) ? overview.assignments : [];
  const challenges = Array.isArray(overview?.challenges) ? overview.challenges : [];
  const completedAssignmentsFromRows = assignments.filter((item) => Boolean(item.submission)).length;
  const completedChallengesFromRows = challenges.filter((item) => Boolean(item.result)).length;
  const assignmentsCompleted = Number(monthly.assignmentsCompleted ?? completedAssignmentsFromRows);
  const assignmentsTarget = Number(monthly.assignmentsTarget || assignments.length);
  const challengesCompleted = Number(monthly.challengesCompleted ?? completedChallengesFromRows);
  const challengesTarget = Number(monthly.challengesTarget || challenges.length);
  const allAssignmentsDone = assignmentsTarget > 0 && assignmentsCompleted >= assignmentsTarget;
  const allChallengesDone = challengesTarget > 0 && challengesCompleted >= challengesTarget;

  return [
    { type: 'assignment', icon: '☑', name: isID ? 'Tugas Pertama' : 'First Assignment', requirement: isID ? 'Selesaikan 1 tugas' : 'Complete 1 assignment', current: assignmentsCompleted, target: 1, unlocked: assignmentsCompleted >= 1 },
    { type: 'assignment', icon: '▤', name: isID ? 'Pejuang Tugas' : 'Assignment Streak', requirement: isID ? 'Selesaikan 3 tugas' : 'Complete 3 assignments', current: assignmentsCompleted, target: 3, unlocked: assignmentsCompleted >= 3 },
    { type: 'assignment', icon: '★', name: isID ? 'Master Tugas' : 'Assignment Master', requirement: isID ? 'Selesaikan semua tugas bulan ini' : 'Complete all assignments this month', current: assignmentsCompleted, target: assignmentsTarget, unlocked: allAssignmentsDone },
    { type: 'challenge', icon: '🎯', name: isID ? 'Tantangan Pertama' : 'First Challenge', requirement: isID ? 'Selesaikan 1 challenge' : 'Complete 1 challenge', current: challengesCompleted, target: 1, unlocked: challengesCompleted >= 1 },
    { type: 'challenge', icon: '⚡', name: isID ? 'Penakluk Tantangan' : 'Challenge Conqueror', requirement: isID ? 'Selesaikan 3 challenge' : 'Complete 3 challenges', current: challengesCompleted, target: 3, unlocked: challengesCompleted >= 3 },
    { type: 'challenge', icon: '🏆', name: 'Program Champion', requirement: isID ? 'Selesaikan semua challenge bulan ini' : 'Complete all challenges this month', current: challengesCompleted, target: challengesTarget, unlocked: allChallengesDone },
    { type: assignmentsCompleted < 1 ? 'assignment' : 'challenge', icon: '✦', name: 'Double Achiever', requirement: isID ? 'Selesaikan tugas dan challenge' : 'Complete an assignment and a challenge', current: Math.min(assignmentsCompleted, 1) + Math.min(challengesCompleted, 1), target: 2, unlocked: assignmentsCompleted >= 1 && challengesCompleted >= 1 },
    { type: allAssignmentsDone ? 'challenge' : 'assignment', icon: '👑', name: isID ? 'Bintang Bulanan' : 'Monthly Star', requirement: isID ? 'Tuntaskan semua tugas dan challenge' : 'Finish all assignments and challenges', current: Number(allAssignmentsDone) + Number(allChallengesDone), target: 2, unlocked: allAssignmentsDone && allChallengesDone },
  ];
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
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Permintaan tidak berhasil.'
    );
  }

  return result;
}

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('moc_language') || 'ID');
  const [theme, setTheme] = useState(() => localStorage.getItem('moc_theme') || 'dark');
  const [rememberMe, setRememberMe] = useState(true);
  const [studentAccessMode, setStudentAccessMode] = useState('');
  const [studentAccessLoading, setStudentAccessLoading] = useState(false);
  const [activationForm, setActivationForm] = useState({ studentId: '', fullName: '', dob: '', phone: '', username: '', password: '', confirmPassword: '' });
  const [registrationForm, setRegistrationForm] = useState({ fullName: '', dob: '', school: '', grade: '', address: '', waStudent: '', waParent: '', program: '', schedule: '', username: '', password: '', confirmPassword: '' });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
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
      setMessage(error.message || (language === 'ID' ? 'Ringkasan akademik gagal dimuat.' : 'Academic overview could not be loaded.'));
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

  async function handleStudentAccess(event, mode) {
    event.preventDefault();
    setMessage('');
    const form = mode === 'activate' ? activationForm : registrationForm;
    if (form.password !== form.confirmPassword) {
      setMessage(language === 'ID' ? 'Konfirmasi password tidak sama.' : 'Password confirmation does not match.');
      return;
    }
    setStudentAccessLoading(true);
    try {
      const key = mode === 'activate' ? 'activation' : 'registration';
      const result = await callApi({ action: mode === 'activate' ? 'activateStudentAccount' : 'registerStudent', [key]: form });
      setMessage(result.message);
      setStudentAccessMode('');
      if (mode === 'activate') setUsername(String(form.studentId || '').trim().toUpperCase());
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
        : { action, token, registrationId: payload };
      const result = await callApi(request);
      setMessage(result.message);
      await loadRegistrations();
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
        onRejectRegistration={(registrationId) => processRegistration('rejectStudentRegistration', registrationId)}
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
          <ThemeSwitch theme={theme} onChange={chooseTheme} />
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
              onClick={() => setMessage(
                language === 'ID'
                  ? 'Silakan hubungi Admin Mr One Course untuk mereset password.'
                  : 'Please contact Mr One Course Admin to reset your password.'
              )}
            >
              {language === 'ID' ? 'Lupa Password?' : 'Forgot Password?'}
            </button>
          </div>

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
        <div className="student-access-links student-access-links-v10">
          <p>
            <span>{language === 'ID' ? 'Belum punya akun?' : "Don't have an account?"}</span>
            <button type="button" onClick={() => { setMessage(''); setStudentAccessMode('register'); }}>
              {language === 'ID' ? 'Daftar di sini.' : 'Register here.'}
            </button>
          </p>
          <p className="student-activation-link">
            <span>{language === 'ID' ? 'Sudah terdaftar tetapi akun belum aktif?' : 'Already registered but not activated?'}</span>
            <button type="button" onClick={() => { setMessage(''); setStudentAccessMode('activate'); }}>
              {language === 'ID' ? 'Aktivasi akun' : 'Activate account'}
            </button>
          </p>
        </div>
        {studentAccessMode && <StudentAccessModal mode={studentAccessMode} language={language} activationForm={activationForm} setActivationForm={setActivationForm} registrationForm={registrationForm} setRegistrationForm={setRegistrationForm} loading={studentAccessLoading} message={message} onClose={() => { setStudentAccessMode(''); setMessage(''); }} onSubmit={handleStudentAccess} />}
      </section>
    </main>
  );
}

function StudentAccessModal({ mode, language, activationForm, setActivationForm, registrationForm, setRegistrationForm, loading, message, onClose, onSubmit }) {
  const isID = language === 'ID';
  const isActivation = mode === 'activate';
  const form = isActivation ? activationForm : registrationForm;

  const update = (field, value) => {
    if (isActivation) {
      if (field === 'studentId') {
        const normalizedId = String(value || '').toUpperCase().replace(/\s+/g, '');
        setActivationForm({
          ...form,
          studentId: normalizedId,
          username: normalizedId,
        });
        return;
      }
      setActivationForm({ ...form, [field]: value });
      return;
    }

    setRegistrationForm({ ...form, [field]: value });
  };

  return (
    <div className="student-access-overlay" role="dialog" aria-modal="true">
      <section className="student-access-modal">
        <header>
          <div>
            <span>
              {isActivation
                ? (isID ? 'SISWA TERDAFTAR' : 'REGISTERED STUDENT')
                : (isID ? 'PENDAFTARAN' : 'REGISTRATION')}
            </span>
            <h2>
              {isActivation
                ? (isID ? 'Aktivasi Akun Siswa' : 'Activate Student Account')
                : (isID ? 'Daftar Siswa Baru' : 'New Student Registration')}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={(event) => onSubmit(event, mode)}>
          {isActivation ? (
            <>
              <label>
                <span>Student ID</span>
                <input
                  value={form.studentId}
                  onChange={(event) => update('studentId', event.target.value)}
                  placeholder="Contoh: MOC002"
                  autoCapitalize="characters"
                  required
                />
              </label>

              <label>
                <span>{isID ? 'Nama lengkap sesuai Data Siswa' : 'Full name in student records'}</span>
                <input
                  value={form.fullName}
                  onChange={(event) => update('fullName', event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                <span>{isID ? 'Tanggal lahir' : 'Date of birth'}</span>
                <input
                  type="date"
                  value={form.dob || ''}
                  onChange={(event) => update('dob', event.target.value)}
                />
                <small className="activation-field-note">
                  {isID
                    ? 'Opsional — tidak menentukan keberhasilan aktivasi. Data ini hanya untuk melengkapi profil siswa.'
                    : 'Optional — it does not affect activation. This is only used to complete the student profile.'}
                </small>
              </label>

              <label>
                <span>{isID ? 'Nomor WA aktif siswa/orang tua' : 'Active student/parent WhatsApp number'}</span>
                <input
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder={isID ? 'Boleh nomor lama atau nomor baru' : 'Existing or new number is allowed'}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <div className="student-access-grid">
                <label>
                  <span>{isID ? 'Nama lengkap' : 'Full name'}</span>
                  <input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} required />
                </label>
                <label>
                  <span>{isID ? 'Tanggal lahir' : 'Date of birth'}</span>
                  <input type="date" value={form.dob} onChange={(event) => update('dob', event.target.value)} />
                </label>
                <label>
                  <span>{isID ? 'Sekolah' : 'School'}</span>
                  <input value={form.school} onChange={(event) => update('school', event.target.value)} required />
                </label>
                <label>
                  <span>{isID ? 'Kelas sekolah' : 'School grade'}</span>
                  <input value={form.grade} onChange={(event) => update('grade', event.target.value)} required />
                </label>
                <label>
                  <span>WA Student</span>
                  <input inputMode="tel" value={form.waStudent} onChange={(event) => update('waStudent', event.target.value)} />
                </label>
                <label>
                  <span>WA Parent</span>
                  <input inputMode="tel" value={form.waParent} onChange={(event) => update('waParent', event.target.value)} required />
                </label>
              </div>

              <label>
                <span>{isID ? 'Alamat' : 'Address'}</span>
                <textarea rows="2" value={form.address} onChange={(event) => update('address', event.target.value)} />
              </label>

              <div className="student-access-grid">
                <label>
                  <span>{isID ? 'Program yang diminati' : 'Preferred program'}</span>
                  <select value={form.program} onChange={(event) => update('program', event.target.value)} required>
                    <option value="">—</option>
                    <option>Primary</option>
                    <option>Grammar</option>
                    <option>Speaking</option>
                    <option>TOEFL</option>
                  </select>
                </label>
                <label>
                  <span>{isID ? 'Pilihan jadwal' : 'Preferred schedule'}</span>
                  <input
                    value={form.schedule}
                    onChange={(event) => update('schedule', event.target.value)}
                    placeholder={isID ? 'Contoh: Rabu & Jumat malam' : 'Example: Wednesday & Friday evening'}
                  />
                </label>
              </div>
            </>
          )}

          <label>
            <span>Username</span>
            <input
              value={isActivation ? form.studentId : form.username}
              onChange={(event) => update('username', event.target.value)}
              readOnly={isActivation}
              title={isActivation
                ? (isID ? 'Username otomatis sama dengan Student ID.' : 'Username automatically matches Student ID.')
                : undefined}
              required
            />
            {isActivation && (
              <small className="activation-field-note">
                {isID ? 'Username otomatis menggunakan Student ID.' : 'Username automatically uses the Student ID.'}
              </small>
            )}
          </label>

          <div className="student-access-grid">
            <label>
              <span>Password</span>
              <input
                type="password"
                minLength="8"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              <span>{isID ? 'Konfirmasi password' : 'Confirm password'}</span>
              <input
                type="password"
                minLength="8"
                value={form.confirmPassword}
                onChange={(event) => update('confirmPassword', event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          {message && <div className="error-message">{message}</div>}

          <button className="student-access-submit" type="submit" disabled={loading}>
            {loading
              ? (isID ? 'Memproses...' : 'Processing...')
              : (isActivation
                  ? (isID ? 'Aktifkan Akun' : 'Activate Account')
                  : (isID ? 'Kirim Pendaftaran' : 'Submit Registration'))}
          </button>

          {isActivation ? (
            <small className="activation-help-text">
              {isID
                ? 'Student ID dan nama akan dicocokkan dengan Data Siswa. Tanggal lahir bersifat opsional dan hanya untuk melengkapi data. Nomor WA boleh berbeda dan akan disimpan sebagai nomor kontak akun.'
                : 'Student ID and name will be matched with student records. Date of birth is optional and is collected only to complete the student profile. The WhatsApp number may be different and will be saved as the account contact number.'}
            </small>
          ) : (
            <small>
              {isID
                ? 'Akun dapat digunakan setelah Admin memverifikasi kelas dan program.'
                : 'The account can be used after Admin verifies the class and program.'}
            </small>
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
    <div className="theme-switch" aria-label="Pilihan tema">
      <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => onChange('dark')}>DARK</button>
      <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => onChange('light')}>LIGHT</button>
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
      setNotice(result.message || (isID ? 'Kehadiran kelas berhasil disimpan.' : 'Class attendance saved.'));
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
      <header className="tutor-dashboard-header">
        <div className="brand-small"><PaperPlaneLogo /><div><strong>Mr One Course</strong><span>Tutor Dashboard</span></div></div>
        <div className="dashboard-header-actions"><button className="tutor-refresh" type="button" onClick={onRefresh}>↻</button></div>
      </header>

      {loading && <div className="tutor-loading">{isID ? 'Memuat dashboard tutor...' : 'Loading tutor dashboard...'}</div>}
      {(message || notice) && <div className="tutor-notice">{notice || message}</div>}
      {page === 'home' && pendingReviews > 0 && <button className="tutor-pending-review" type="button" onClick={() => setPage('academic')}><span>!</span><div><strong>{pendingReviews} {isID ? 'pekerjaan menunggu pemeriksaan' : 'submissions awaiting review'}</strong><small>{isID ? 'Buka Akademik untuk memeriksa jawaban siswa' : 'Open Academics to review student work'}</small></div><b>→</b></button>}

      {page === 'assignments' && <section className="tutor-section grading-settings"><div className="tutor-section-heading"><div><span>AUTO GRADING</span><h2>{isID ? 'Pengaturan Nilai Langsung' : 'Instant Grading Settings'}</h2></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Cara Penilaian Assignment' : 'Assignment Grading Method'}</span><select value={assignment.gradingMode} onChange={(event) => setAssignment({ ...assignment, gradingMode: event.target.value })}><option value="automatic">{isID ? 'Otomatis — nilai langsung keluar' : 'Automatic — instant result'}</option><option value="review">{isID ? 'Diperiksa Tutor — tugas terbuka/proyek' : 'Tutor Review — open task/project'}</option></select></label>{assignment.gradingMode === 'automatic' && <div className="grading-mode-note">{isID ? 'Kunci jawaban dan bobot ditentukan pada setiap soal pilihan ganda.' : 'Set the answer key and weight inside each multiple-choice question.'}</div>}<small className="grading-help">{isID ? 'Nilai dihitung dari jumlah jawaban benar. EXP diberikan sebanding dengan nilai.' : 'The score is based on correct answers. EXP is awarded proportionally.'}</small></div></section>}

      {page === 'challenges' && <section className="tutor-section grading-settings"><div className="tutor-section-heading"><div><span>AUTO GRADING</span><h2>{isID ? 'Pengaturan Nilai Langsung' : 'Instant Grading Settings'}</h2></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Cara Penilaian Challenge' : 'Challenge Grading Method'}</span><select value={challenge.gradingMode} onChange={(event) => setChallenge({ ...challenge, gradingMode: event.target.value })}><option value="automatic">{isID ? 'Otomatis — jawaban teks' : 'Automatic — text response'}</option><option value="review">{isID ? 'Diperiksa Tutor — audio/video/proyek' : 'Tutor Review — audio/video/project'}</option></select></label>{challenge.gradingMode === 'automatic' && <label><span>{isID ? 'Kunci Jawaban' : 'Answer Key'}</span><textarea rows="4" value={challenge.answerKey} onChange={(event) => setChallenge({ ...challenge, answerKey: event.target.value })} placeholder={isID ? 'Satu jawaban per baris. Alternatif dipisahkan tanda |' : 'One answer per line. Separate alternatives with |'} required /></label>}<small className="grading-help">{isID ? 'Gunakan pemeriksaan tutor untuk speaking, rekaman, video, atau proyek.' : 'Use tutor review for speaking, recordings, videos, or projects.'}</small></div></section>}

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
            <header><img className="report-brand-logo-transparent" src="/mr-one-course-logo-transparent.png" alt="Mr One Course" /><div><span>MR ONE COURSE • ACADEMIC SUITE</span><h1>{isID ? 'Laporan Perkembangan Akademik Bulanan' : 'Monthly Academic Progress Report'}</h1><p>{isID ? 'PERIODE LAPORAN' : 'REPORT PERIOD'}: {new Date(`${reportMonth}-01T12:00:00`).toLocaleDateString(isID ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}</p></div></header>
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
        <section className="tutor-section tutor-page-section linked-learning-package"><div className="tutor-section-heading"><div><span>{isID ? 'TARGET • EVALUASI • GAMIFIKASI' : 'TARGET • ASSESSMENT • GAMIFICATION'}</span><h2>{isID ? 'Paket Capaian Pertemuan' : 'Meeting Achievement Package'}</h2><p>{isID ? 'Hubungkan target pembelajaran dengan assignment dan challenge pengayaan.' : 'Connect the learning target with an assignment and enrichment challenge.'}</p></div></div><div className="tutor-journal-form"><label><span>{isID ? 'Target Capaian Siswa' : 'Student Achievement Target'}</span><textarea rows="3" value={learningPlan.targetCompetency} onChange={(event) => setLearningPlan({ ...learningPlan, targetCompetency: event.target.value })} placeholder={isID ? 'Contoh: Siswa mampu membuat minimal lima kalimat Simple Present dengan pola yang tepat.' : 'Example: Students can write at least five accurate Simple Present sentences.'} /></label><div className="linked-package-toggle"><label><input type="checkbox" checked={learningPlan.assignment.enabled} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, enabled: event.target.checked } })} /><span><strong>Assignment</strong><small>{isID ? 'Bukti pencapaian target pembelajaran' : 'Evidence of learning-target achievement'}</small></span></label>{learningPlan.assignment.enabled && <div className="linked-package-fields"><input value={learningPlan.assignment.title} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, title: event.target.value } })} placeholder={isID ? 'Judul assignment' : 'Assignment title'} /><textarea rows="3" value={learningPlan.assignment.instructions} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, instructions: event.target.value } })} placeholder={isID ? 'Instruksi pengerjaan...' : 'Assignment instructions...'} /><div className="tutor-form-grid"><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={learningPlan.assignment.dueDate} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, dueDate: event.target.value } })} /></label><label><span>EXP</span><input type="number" min="0" max="200" value={learningPlan.assignment.expReward} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, expReward: Number(event.target.value) } })} /></label></div><label><span>{isID ? 'Cara Penilaian' : 'Grading Method'}</span><select value={learningPlan.assignment.gradingMode} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, gradingMode: event.target.value } })}><option value="review">{isID ? 'Diperiksa Tutor' : 'Tutor Review'}</option><option value="automatic">{isID ? 'Otomatis' : 'Automatic'}</option></select></label>{learningPlan.assignment.gradingMode === 'automatic' && <textarea rows="3" value={learningPlan.assignment.answerKey} onChange={(event) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, answerKey: event.target.value } })} placeholder={isID ? 'Kunci jawaban, satu jawaban per baris' : 'Answer key, one answer per line'} />}</div>}</div><div className="linked-package-toggle challenge-link"><label><input type="checkbox" checked={learningPlan.challenge.enabled} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, enabled: event.target.checked } })} /><span><strong>Challenge</strong><small>{isID ? 'Pengayaan sesuai program dan sumber EXP' : 'Program-based enrichment and EXP source'}</small></span></label>{learningPlan.challenge.enabled && <div className="linked-package-fields"><select value="" onChange={(event) => { const template = (overview?.challengeTemplates?.[selectedClassId] || [])[Number(event.target.value)]; if (template) setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, ...template, enabled: true, gradingMode: template.responseType === 'text' ? 'automatic' : 'review' } }); }}><option value="">{isID ? 'Pilih template sesuai program' : 'Select a program template'}</option>{(overview?.challengeTemplates?.[selectedClassId] || []).map((item, index) => <option value={index} key={item.title}>{item.title}</option>)}</select><input value={learningPlan.challenge.title} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, title: event.target.value } })} placeholder={isID ? 'Judul challenge' : 'Challenge title'} /><textarea rows="3" value={learningPlan.challenge.instructions} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, instructions: event.target.value } })} placeholder={isID ? 'Instruksi challenge...' : 'Challenge instructions...'} /><div className="tutor-form-grid"><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={learningPlan.challenge.dueDate} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, dueDate: event.target.value } })} /></label><label><span>EXP</span><input type="number" min="0" max="250" value={learningPlan.challenge.expReward} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, expReward: Number(event.target.value) } })} /></label></div><label><span>{isID ? 'Cara Penilaian' : 'Grading Method'}</span><select value={learningPlan.challenge.gradingMode} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, gradingMode: event.target.value } })}><option value="review">{isID ? 'Diperiksa Tutor' : 'Tutor Review'}</option><option value="automatic" disabled={learningPlan.challenge.responseType !== 'text'}>{isID ? 'Otomatis untuk jawaban teks' : 'Automatic for text response'}</option></select></label>{learningPlan.challenge.gradingMode === 'automatic' && <textarea rows="3" value={learningPlan.challenge.answerKey} onChange={(event) => setLearningPlan({ ...learningPlan, challenge: { ...learningPlan.challenge, answerKey: event.target.value } })} placeholder={isID ? 'Kunci jawaban, satu jawaban per baris' : 'Answer key, one answer per line'} />}</div>}</div></div></section>{page === 'academic' && learningPlan.assignment.enabled && <section className="tutor-section tutor-page-section"><AssignmentQuestionBuilder questions={learningPlan.assignment.questions || []} onChange={(questions) => setLearningPlan({ ...learningPlan, assignment: { ...learningPlan.assignment, questions, answerKey: questions.map((item) => item.options[Number(item.correctOption)] || '').join('\\n') } })} isID={isID} /></section>}
        <section className="tutor-section tutor-page-section learning-plan-section"><div className="tutor-section-heading"><div><span>{isID ? 'RENCANA BULANAN' : 'MONTHLY PLAN'}</span><h2>{isID ? 'Pembelajaran 8 Pertemuan' : 'Eight-Meeting Learning Plan'}</h2><p>{isID ? 'Susun materi, tujuan, dan aktivitas sebelum kelas berlangsung.' : 'Plan the material, objectives, and activities before each class.'}</p></div></div><form className="tutor-journal-form" onSubmit={saveLearningPlan}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Bulan Pembelajaran' : 'Learning Month'}</span><input type="month" value={learningPlan.month} onChange={(event) => setLearningPlan({ ...learningPlan, month: event.target.value })} required /></label><label><span>{isID ? 'Pertemuan Ke' : 'Meeting Number'}</span><select value={learningPlan.meetingNumber} onChange={(event) => setLearningPlan({ ...learningPlan, meetingNumber: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><label><span>{isID ? 'Rencana Tanggal (opsional)' : 'Planned Date (optional)'}</span><input type="date" value={learningPlan.plannedDate} onChange={(event) => setLearningPlan({ ...learningPlan, plannedDate: event.target.value })} /></label><label><span>{isID ? 'Materi / Topik' : 'Material / Topic'}</span><input value={learningPlan.title} onChange={(event) => setLearningPlan({ ...learningPlan, title: event.target.value })} placeholder={isID ? 'Contoh: Simple Present Tense' : 'Example: Simple Present Tense'} required /></label><label><span>{isID ? 'Tujuan Pembelajaran' : 'Learning Objective'}</span><textarea rows="3" value={learningPlan.objective} onChange={(event) => setLearningPlan({ ...learningPlan, objective: event.target.value })} placeholder={isID ? 'Contoh: Siswa mampu membuat kalimat kebiasaan sehari-hari.' : 'Example: Students can write sentences about daily routines.'} required /></label><label><span>{isID ? 'Rencana Aktivitas' : 'Planned Activities'}</span><textarea rows="4" value={learningPlan.activities} onChange={(event) => setLearningPlan({ ...learningPlan, activities: event.target.value })} placeholder={isID ? 'Pembukaan, latihan terbimbing, praktik, dan refleksi...' : 'Warm-up, guided practice, production, and reflection...'} required /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Rencana Pertemuan' : 'Save Meeting Plan')}</button></form><div className="eight-meeting-plan-grid">{Array.from({ length: 8 }, (_, index) => { const number = index + 1; const plan = (selectedClass?.learningPlans || []).find((item) => item.month === learningPlan.month && item.meetingNumber === number); return <article className={plan ? 'planned' : ''} key={number}><span>{String(number).padStart(2, '0')}</span><div><small>{plan ? (isID ? 'SUDAH DIRENCANAKAN' : 'PLANNED') : (isID ? 'BELUM DIISI' : 'NOT PLANNED')}</small><strong>{plan?.title || (isID ? `Pertemuan ${number}` : `Meeting ${number}`)}</strong>{plan?.objective && <p>{plan.objective}</p>}</div>{plan && <button type="button" onClick={() => usePlanForJournal(plan)}>{isID ? 'Gunakan untuk Jurnal →' : 'Use for Journal →'}</button>}</article>; })}</div></section></>)}
{page === 'journal' && (        <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>Learning Journal</h2><p>{isID ? 'Isi jurnal kelas dan capaian seluruh siswa dalam satu kali simpan.' : 'Complete the class journal and every student’s progress in one save.'}</p></div></div><form className="tutor-journal-form" onSubmit={saveJournal}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal' : 'Date'}</span><input type="date" value={journal.date} onChange={(event) => setJournal({ ...journal, date: event.target.value })} required /></label><label><span>{isID ? 'Pertemuan Ke' : 'Meeting Number'}</span><select value={journal.meetingNumber} onChange={(event) => setJournal({ ...journal, meetingNumber: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label></div><label><span>{isID ? 'Materi / Topik' : 'Material / Topic'}</span><input value={journal.title} onChange={(event) => setJournal({ ...journal, title: event.target.value })} placeholder={isID ? 'Contoh: Simple Present Tense' : 'Example: Simple Present Tense'} required /></label><label><span>{isID ? 'Aktivitas Pembelajaran' : 'Learning Activities'}</span><textarea rows="5" value={journal.activities} onChange={(event) => setJournal({ ...journal, activities: event.target.value })} placeholder={isID ? 'Contoh: Mengidentifikasi pola, latihan berpasangan, dan membuat lima kalimat.' : 'Example: Identifying patterns, pair practice, and writing five sentences.'} required /></label><label><span>{isID ? 'Catatan Kelas / Tindak Lanjut' : 'Class Notes / Follow-up'}</span><textarea rows="3" value={journal.notes} onChange={(event) => setJournal({ ...journal, notes: event.target.value })} placeholder={isID ? 'Catatan umum kelas atau rencana pertemuan berikutnya...' : 'General class notes or next-meeting plan...'} /></label><div className="journal-roster-heading"><div><span>{isID ? 'CAPAIAN INDIVIDUAL' : 'INDIVIDUAL PROGRESS'}</span><h3>{isID ? 'Daftar Siswa' : 'Student List'}</h3><small>{isID ? 'Semua siswa otomatis dipilih. Hapus centang siswa yang tidak mengikuti pertemuan.' : 'All students are selected automatically. Uncheck students who did not attend.'}</small></div><div className="journal-roster-actions"><button type="button" onClick={() => setJournalStudents(Object.fromEntries((selectedClass?.students || []).map((student) => [student.studentId, { ...(journalStudents[student.studentId] || {}), selected: true, achievement: journalStudents[student.studentId]?.achievement || 'Berkembang' }])))}>{isID ? 'Pilih Semua' : 'Select All'}</button><button type="button" onClick={generateAllJournalComments} disabled={!journal.title.trim()}>{isID ? '✦ Susun Kalimat Otomatis' : '✦ Generate Comments'}</button></div></div><div className="journal-student-roster">{(selectedClass?.students || []).map((student, index) => { const entry = journalStudents[student.studentId] || { selected: true, achievement: 'Berkembang', comment: '' }; return <article className={entry.selected === false ? 'not-selected' : ''} key={student.studentId}><label className="journal-student-check"><input type="checkbox" checked={entry.selected !== false} onChange={(event) => setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, selected: event.target.checked } })} /><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{student.fullName}</strong><small>{student.studentId}</small></div></label>{entry.selected !== false && <><label className="journal-achievement"><span>{isID ? 'Kemampuan Hari Ini' : 'Today’s Achievement'}</span><select value={entry.achievement} onChange={(event) => { const achievement = event.target.value; setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, achievement, comment: composeJournalComment(student, achievement) } }); }}><option value="Sangat Baik">{isID ? 'Sangat Baik — Mandiri' : 'Excellent — Independent'}</option><option value="Baik">{isID ? 'Baik — Sedikit Arahan' : 'Good — Limited Guidance'}</option><option value="Berkembang">{isID ? 'Berkembang — Perlu Latihan' : 'Developing — Needs Practice'}</option><option value="Perlu Dukungan">{isID ? 'Perlu Dukungan — Pendampingan' : 'Needs Support — Guidance'}</option></select></label><label className="journal-generated-comment"><span>{isID ? 'Catatan Otomatis (boleh diedit)' : 'Generated Comment (editable)'}</span><textarea rows="3" value={entry.comment} onChange={(event) => setJournalStudents({ ...journalStudents, [student.studentId]: { ...entry, comment: event.target.value } })} placeholder={isID ? 'Klik “Susun Kalimat Otomatis” atau pilih kemampuan siswa.' : 'Generate a comment or select the student achievement.'} /></label></>}</article>; })}</div><div className="journal-save-summary"><span>{Object.values(journalStudents).filter((entry) => entry.selected !== false).length} {isID ? 'siswa dipilih' : 'students selected'}</span><button type="submit" disabled={saving || !selectedClassId || !journal.title.trim() || !journal.activities.trim()}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Jurnal & Capaian Siswa' : 'Save Journal & Student Progress')}</button></div></form>{selectedClass?.journals?.length > 0 && <div className="tutor-journal-history"><h3>{isID ? 'Jurnal Terbaru' : 'Recent Journals'}</h3>{selectedClass.journals.map((entry) => <article key={entry.journalId || `${entry.date}-${entry.meetingNumber}`}><span>{String(entry.meetingNumber).padStart(2, '0')}</span><div><strong>{entry.title}</strong><small>{entry.date} • {entry.activities}</small></div></article>)}</div>}</section>)}

      {page === 'notes' && (
        <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>INDIVIDUAL</span><h2>{isID ? 'Catatan Siswa' : 'Student Notes'}</h2></div></div><form className="tutor-journal-form" onSubmit={saveStudentNote}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => { setSelectedClassId(event.target.value); setStudentNote({ ...studentNote, studentId: '' }); }} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Pilih Siswa' : 'Select Student'}</span><select value={studentNote.studentId} onChange={(event) => setStudentNote({ ...studentNote, studentId: event.target.value })} required><option value="">—</option>{(selectedClass?.students || []).map((student) => <option key={student.studentId} value={student.studentId}>{student.fullName} — {student.studentId}</option>)}</select></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal' : 'Date'}</span><input type="date" value={studentNote.date} onChange={(event) => setStudentNote({ ...studentNote, date: event.target.value })} required /></label><label><span>{isID ? 'Partisipasi' : 'Participation'}</span><select value={studentNote.participation} onChange={(event) => setStudentNote({ ...studentNote, participation: event.target.value })}><option value="">—</option><option value="Sangat Aktif">{isID ? 'Sangat Aktif' : 'Highly Active'}</option><option value="Aktif">{isID ? 'Aktif' : 'Active'}</option><option value="Cukup">{isID ? 'Cukup' : 'Developing'}</option><option value="Perlu Dukungan">{isID ? 'Perlu Dukungan' : 'Needs Support'}</option></select></label></div><label><span>{isID ? 'Kekuatan Siswa' : 'Student Strengths'}</span><textarea rows="3" value={studentNote.strengths} onChange={(event) => setStudentNote({ ...studentNote, strengths: event.target.value })} /></label><label><span>{isID ? 'Perlu Ditingkatkan' : 'Areas for Improvement'}</span><textarea rows="3" value={studentNote.improvements} onChange={(event) => setStudentNote({ ...studentNote, improvements: event.target.value })} /></label><label><span>{isID ? 'Komentar Tutor untuk Laporan' : 'Tutor Comment for Report'}</span><textarea rows="4" value={studentNote.comment} onChange={(event) => setStudentNote({ ...studentNote, comment: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>Achievement</span><input value={studentNote.achievement} onChange={(event) => setStudentNote({ ...studentNote, achievement: event.target.value })} placeholder={isID ? 'Opsional' : 'Optional'} /></label><label><span>{isID ? 'Bonus EXP (0–250)' : 'EXP Bonus (0–250)'}</span><input type="number" min="0" max="250" value={studentNote.expAwarded} onChange={(event) => setStudentNote({ ...studentNote, expAwarded: Number(event.target.value) })} /></label></div><button type="submit" disabled={saving || !selectedClassId || !studentNote.studentId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Simpan Catatan Individual' : 'Save Individual Note')}</button></form></section>
      )}

      {page === 'academic' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>{isID ? 'Kelola Akademik' : 'Manage Academics'}</h2></div></div><div className="tutor-academic-menu"><button type="button" onClick={() => setPage('assignments')}><span>☑</span><div><strong>Assignments</strong><small>{isID ? 'Buat, periksa, dan beri feedback tugas' : 'Create, review, and give task feedback'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('challenges')}><span>🎯</span><div><strong>Challenges</strong><small>{isID ? 'Challenge sesuai program dan validasi EXP' : 'Program challenges and EXP validation'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('assessment')}><span>★</span><div><strong>Assessment</strong><small>{isID ? 'Nilai keterampilan dan quiz/tes siswa' : 'Score student skills and quizzes/tests'}</small></div><b>→</b></button><button type="button" onClick={() => setPage('notes')}><span>♙</span><div><strong>{isID ? 'Catatan Siswa' : 'Student Notes'}</strong><small>{isID ? 'Komentar perkembangan individual' : 'Individual progress comments'}</small></div><b>→</b></button></div></section>}

      {page === 'assignments' && assignment.gradingMode === 'automatic' && <section className="tutor-section tutor-page-section"><AssignmentQuestionBuilder questions={assignment.questions || []} onChange={(questions) => setAssignment({ ...assignment, questions, answerKey: questions.map((item) => item.options[Number(item.correctOption)] || '').join('\\n') })} isID={isID} /></section>}
      {page === 'assignments' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>ACADEMIC</span><h2>Assignments</h2></div></div><form className="tutor-journal-form" onSubmit={createAssignment}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Judul Tugas' : 'Assignment Title'}</span><input value={assignment.title} onChange={(event) => setAssignment({ ...assignment, title: event.target.value })} required /></label><label><span>{isID ? 'Instruksi' : 'Instructions'}</span><textarea rows="4" value={assignment.instructions} onChange={(event) => setAssignment({ ...assignment, instructions: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>{isID ? 'Tanggal Diberikan' : 'Assigned Date'}</span><input type="date" value={assignment.assignedDate} onChange={(event) => setAssignment({ ...assignment, assignedDate: event.target.value })} required /></label><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={assignment.dueDate} onChange={(event) => setAssignment({ ...assignment, dueDate: event.target.value })} required /></label></div><label><span>{isID ? 'Hadiah EXP (0–200)' : 'EXP Reward (0–200)'}</span><input type="number" min="0" max="200" value={assignment.expReward} onChange={(event) => setAssignment({ ...assignment, expReward: Number(event.target.value) })} /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Buat Assignment' : 'Create Assignment')}</button></form>{selectedClass?.assignments?.length > 0 && <div className="tutor-journal-history"><h3>{isID ? 'Tugas Kelas Ini' : 'Class Assignments'}</h3>{selectedClass.assignments.map((item) => <article key={item.assignmentId}><span>☑</span><div><strong>{item.title}</strong><small>{isID ? 'Tenggat' : 'Due'}: {item.dueDate} • +{item.expReward} EXP</small></div></article>)}</div>}{selectedClass?.submissions?.length > 0 && <div className="tutor-review-list"><h3>{isID ? 'Pengumpulan Siswa' : 'Student Submissions'}</h3>{selectedClass.submissions.map((item) => <button type="button" key={item.submissionId} onClick={() => { setReviewItem({ ...item, kind: 'assignment' }); setReview({ score: item.score || '', feedback: item.feedback || '', expAwarded: item.expAwarded || 0 }); setPage('review'); }}><div><strong>{item.studentName}</strong><small>{item.status} • {item.response}</small></div><b>{item.status === 'Reviewed' ? `${item.score}/100` : (isID ? 'PERIKSA →' : 'REVIEW →')}</b></button>)}</div>}</section>}

      {page === 'challenges' && <section className="tutor-section tutor-page-section"><div className="tutor-section-heading"><div><span>GAMIFICATION</span><h2>Challenges</h2></div></div><form className="tutor-journal-form" onSubmit={createChallenge}><label><span>{isID ? 'Pilih Kelas' : 'Select Class'}</span><select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} required><option value="">—</option>{classes.map((item) => <option key={item.classId} value={item.classId}>{item.className}</option>)}</select></label><label><span>{isID ? 'Template sesuai program' : 'Program Template'}</span><select value="" onChange={(event) => { const template = (overview?.challengeTemplates?.[selectedClassId] || [])[Number(event.target.value)]; if (template) setChallenge({ ...challenge, ...template }); }}><option value="">{isID ? 'Pilih template atau isi manual' : 'Choose a template or enter manually'}</option>{(overview?.challengeTemplates?.[selectedClassId] || []).map((item, index) => <option key={item.title} value={index}>{item.title}</option>)}</select></label><label><span>{isID ? 'Judul Challenge' : 'Challenge Title'}</span><input value={challenge.title} onChange={(event) => setChallenge({ ...challenge, title: event.target.value })} required /></label><label><span>{isID ? 'Instruksi' : 'Instructions'}</span><textarea rows="4" value={challenge.instructions} onChange={(event) => setChallenge({ ...challenge, instructions: event.target.value })} required /></label><div className="tutor-form-grid"><label><span>{isID ? 'Jenis Jawaban' : 'Response Type'}</span><select value={challenge.responseType} onChange={(event) => setChallenge({ ...challenge, responseType: event.target.value })}><option value="text">Text</option><option value="link">Link Audio/Video/File</option></select></label><label><span>{isID ? 'Tenggat' : 'Due Date'}</span><input type="date" value={challenge.dueDate} onChange={(event) => setChallenge({ ...challenge, dueDate: event.target.value })} required /></label></div><label><span>{isID ? 'Hadiah EXP (0–250)' : 'EXP Reward (0–250)'}</span><input type="number" min="0" max="250" value={challenge.expReward} onChange={(event) => setChallenge({ ...challenge, expReward: Number(event.target.value) })} /></label><button type="submit" disabled={saving || !selectedClassId}>{saving ? (isID ? 'Menyimpan...' : 'Saving...') : (isID ? 'Buat Challenge' : 'Create Challenge')}</button></form>{selectedClass?.challengeResults?.length > 0 && <div className="tutor-review-list"><h3>{isID ? 'Hasil Challenge Siswa' : 'Student Challenge Results'}</h3>{selectedClass.challengeResults.map((item) => <button type="button" key={item.resultId} onClick={() => { setReviewItem({ ...item, kind: 'challenge' }); setReview({ score: item.score || '', feedback: item.feedback || '', expAwarded: item.expAwarded || 0 }); setPage('review'); }}><div><strong>{item.studentName}</strong><small>{item.status} • {item.response}</small></div><b>{item.status === 'Reviewed' ? `${item.score}/100` : (isID ? 'PERIKSA →' : 'REVIEW →')}</b></button>)}</div>}</section>}

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
  const [detailPage, setDetailPage] = useState(() => new URLSearchParams(window.location.search).has('checkin') ? 'checkin' : 'landing');
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
  const homeBadges = buildStudentBadges(overview, isID);


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

  const headerActivePage = detailPage === 'landing'
    ? 'landing'
    : detailPage === 'checkin'
      ? 'checkin'
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

      <section className="badges-section home-badges-section">
        <button className="badges-title badge-hub-link" type="button" onClick={() => openStudentPage('badges')}><span>🏅</span><div><h2>{isID ? 'Badge Saya' : 'My Badges'}</h2><p>{isID ? 'Klik untuk membuka tugas dan tantangan' : 'Tap to open assignments and challenges'}</p></div><b>→</b></button>
        <div className="badges-grid">
          {homeBadges.map((badge) => (
            <button type="button" onClick={() => openStudentPage('badges')} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`} key={badge.name}>
              <span className="badge-icon">{badge.icon}</span>
              <strong>{badge.name}</strong>
              <small>{badge.requirement}</small>
              <div className="badge-progress"><span style={{ width: `${Math.min(100, (Number(badge.current || 0) / Math.max(1, Number(badge.target || 1))) * 100)}%` }} /></div>
              <em>{Number(badge.target || 0) > 0 ? `${Math.min(Number(badge.current || 0), Number(badge.target))}/${badge.target}` : (isID ? 'Belum ada target' : 'No target yet')}</em>
              <b>{badge.unlocked ? (isID ? 'TERBUKA' : 'UNLOCKED') : (isID ? 'TERKUNCI' : 'LOCKED')}</b>
            </button>
          ))}
        </div>
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
            className={activePage === item.page ? 'active' : ''}
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
  const [message, setMessage] = useState(isID ? 'Izinkan akses lokasi untuk mencatat kehadiran Anda.' : 'Allow location access to record your attendance.');
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
        setMessage(isID ? 'Kehadiran berhasil dicatat.' : 'Attendance recorded successfully.');
        await onDone();
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

      <button className="full-menu-logout" type="button" onClick={onLogout}>{isID ? 'Keluar dari Akun' : 'Sign Out'}</button>
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

function StudentDetailPage({ page, token, overview, onRefreshOverview, onBack, onSelect, onLogout, language, embedded = false }) {
  const isID = language === 'ID';
  const programChallenge = getProgramChallenge(overview?.program?.program, isID);
  const titles = {
    schedule: isID ? 'Jadwal Kelas' : 'Class Schedule', attendance: isID ? 'Check-in Kehadiran' : 'Attendance Check-in', 'attendance-record': isID ? 'Riwayat Kehadiran Saya' : 'My Attendance Record', payment: 'Tuition',
    profile: isID ? 'Profil Siswa' : 'Student Profile', program: isID ? 'Program Saya' : 'My Program', assignments: isID ? 'Tugas' : 'Assignments',
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
  const paidPaymentHistory = (overview?.overall?.paymentHistory || []).filter((item) => /^(lunas|paid)$/i.test(String(item.status || '').trim()));
  const tuitionAmount = Number(currentPayment.amount || 150000);
  const paymentItems = Array.isArray(overview?.paymentCenter?.items) && overview.paymentCenter.items.length ? overview.paymentCenter.items : [
    { category: 'Tuition', label: isID ? 'Les Bulanan' : 'Monthly Tuition', icon: '💳', amount: 150000, period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, status: currentPayment.status || 'Belum Lunas' },
    { category: 'Book Package', label: isID ? 'Paket 4 Buku Pendamping' : '4-Book Package', icon: '📚', amount: 150000, period: isID ? 'Sekali Bayar' : 'One-time', status: 'Belum Dibeli' },
    { category: 'ID Card', label: 'ID Card Siswa', icon: '🪪', amount: 20000, period: isID ? 'Sekali Bayar' : 'One-time', status: 'Belum Dibeli' },
  ];
  const invoiceNumber = `MOC-${overview?.profile?.studentId || 'STUDENT'}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
    try { const result = await callApi({ action: 'submitStudentAssignment', token, submission: { assignmentId, response } }); setStudentSubmitMessage(result.message); await onRefreshOverview(); }
    catch (error) { setStudentSubmitMessage(error.message); } finally { setStudentSubmitting(''); }
  }

  async function sendChallenge(challengeId) {
    const response = String(challengeResponses[challengeId] || '').trim(); if (!response) return;
    setStudentSubmitting(challengeId); setStudentSubmitMessage('');
    try { const result = await callApi({ action: 'submitStudentChallenge', token, submission: { challengeId, response } }); setStudentSubmitMessage(result.message); await onRefreshOverview(); }
    catch (error) { setStudentSubmitMessage(error.message); } finally { setStudentSubmitting(''); }
  }

  const Root = embedded ? 'section' : 'main';

  return (
    <Root className={`student-detail-page ${embedded ? 'student-detail-embedded' : ''}`.trim()}>
      {!embedded && <header><button type="button" onClick={onBack}>←</button><h1>{titles[page] || (isID ? 'Menu Siswa' : 'Student Menu')}</h1></header>}
      {embedded && (
        <div className="student-page-context-heading">
          <button type="button" onClick={onBack} aria-label={isID ? 'Kembali' : 'Back'}>←</button>
          <div><span>{isID ? 'AREA SISWA' : 'STUDENT AREA'}</span><h1>{titles[page] || (isID ? 'Menu Siswa' : 'Student Menu')}</h1></div>
        </div>
      )}

      {page === 'full-report' && (
        <>
          <section className="academic-overview-hero academic-overview-detail">
            <h2>{isID ? 'Ringkasan Akademik Anda' : 'Your Academic Overview'}</h2>
            <p>{isID ? 'Apa yang perlu saya lakukan hari ini?' : 'What should I do today?'}</p>

            <div className="overview-four-grid">
              <div><span>◷ {isID ? 'KELAS BERIKUTNYA' : 'NEXT CLASS'}</span><strong>{overviewNextClass?.className || (isID ? 'Belum dijadwalkan' : 'Not scheduled')}</strong>{overviewNextClass && <small>{formatStudentClassDate(overviewNextClass.date, isID) || overviewNextClass.day} • {overviewNextClass.start}{overviewNextClass.end ? `–${overviewNextClass.end}` : ''}{overviewNextClass.tutor ? ` • ${overviewNextClass.tutor}` : ''}</small>}</div>
              <div><span>☑ {isID ? 'TUGAS' : 'ASSIGNMENTS'}</span><strong>{Number(assignmentSummary.pending ?? studentAssignments.length)}</strong><small>{isID ? `${Number(assignmentSummary.completed || 0)} selesai` : `${Number(assignmentSummary.completed || 0)} completed`}</small></div>
              <div><span>♙ {isID ? 'KEHADIRAN' : 'ATTENDANCE'}</span><strong>{overviewAttendance?.percentage == null ? (isID ? 'Belum ada data' : 'No data yet') : `${overviewAttendance.percentage}%`}</strong><small>{overviewAttendance?.total ? `${overviewAttendance.present}/${overviewAttendance.total} ${isID ? 'pertemuan' : 'meetings'}` : (isID ? 'Menunggu absensi pertama' : 'Waiting for first attendance')}</small></div>
              <div><span>★ {isID ? 'LEVEL & SKOR' : 'LEVEL & SCORE'}</span><strong>{cefrCardValue}</strong><small>{academicAverage != null ? `${isID ? 'Nilai akademik' : 'Academic score'} ${academicAverage} • ` : ''}${totalExp} EXP</small></div>
            </div>

            <div className="overview-actions">
              <button type="button" onClick={() => onSelect('schedule')}>📅 {isID ? 'Lihat Kelas' : 'View Class'}</button>
              <button type="button" onClick={() => onSelect('assignments')}>▧ {isID ? 'Lihat Tugas' : 'View Assignments'}</button>
            </div>
          </section>

          <section className="scroll-report-cards academic-summary-cards">
            <button type="button" onClick={() => onSelect('program')}><div><span>Program</span><strong className="report-text-value">{overview?.program?.program || '—'}</strong><small>{overview?.program?.className || (isID ? 'Informasi kelas' : 'Class information')}</small></div><i className="yellow">🎓</i></button>
            <button type="button" onClick={() => onSelect('attendance-record')}><div><span>{isID ? 'Kehadiran' : 'Attendance'}</span><strong>{attendance?.percentage == null ? '—' : `${attendance.percentage}%`}</strong><small>{attendance?.total ? (isID ? `${attendance.present} dari ${attendance.total} pertemuan bulan ini` : `${attendance.present} of ${attendance.total} sessions attended this month`) : (isID ? 'Belum ada data kehadiran bulan ini' : 'No attendance data this month')}</small></div><i className="green">♙</i></button>
            <button type="button" onClick={() => onSelect('assignments')}><div><span>{isID ? 'Tugas' : 'Assignments'}</span><strong>{studentAssignments.length || '—'}</strong><small>{studentAssignments.length ? (isID ? `${studentAssignments.length} tugas aktif` : `${studentAssignments.length} active assignments`) : (isID ? 'Belum ada tugas aktif' : 'No active assignments')}</small></div><i className="red">☑</i></button>
            <button type="button" onClick={() => onSelect('journal')}><div><span>{isID ? 'Aktivitas Pembelajaran' : 'Learning Activities'}</span><strong>{learningActivities.filter((entry) => entry.title).length}/8</strong><small>{isID ? 'Rencana dan realisasi pembelajaran bulan ini' : 'This month’s learning plan and completion'}</small></div><i className="teal">▤</i></button>
            <button type="button" onClick={() => onSelect('challenge')}><div><span>{isID ? 'Tantangan' : 'Challenge'}</span><strong className="report-text-value">{programChallenge.name}</strong><small>{isID ? 'Hasil challenge sesuai program' : 'Results for your program challenge'}</small></div><i className="purple">🎙</i></button>
            <button type="button" onClick={() => onSelect('score')}><div><span>{isID ? 'Level & Skor Akademik' : 'Academic Level & Score'}</span><strong className="report-text-value">{cefrCardValue}</strong><small>{rawCefrLevel ? (isID ? 'Berdasarkan hasil tes CEFR' : 'Based on CEFR assessment') : (isID ? 'Hasil level akan muncul setelah penilaian' : 'Your level will appear after assessment')} • {rankInfo.current.name} • {totalExp} EXP</small></div><i className="blue">★</i></button>
            <button type="button" onClick={() => onSelect('monthly-report')}><div><span>{isID ? 'Laporan Bulanan' : 'Monthly Report'}</span><strong className="report-text-value">{isID ? 'Kemajuan Akademik' : 'Academic Progress'}</strong><small>{isID ? 'Profil, keterampilan, nilai, komentar tutor, dan log pertemuan' : 'Profile, skills, scores, tutor comments, and meeting log'}</small></div><i className="blue">▤</i></button>
            <button type="button" onClick={() => onSelect('challenge')}><div><span>{isID ? 'Misi Bulanan' : 'Monthly Quests'}</span><strong>{attendanceQuestProgress}/{attendanceQuestTarget}</strong><small>{attendanceQuestDone ? (isID ? 'Perfect Attendance selesai' : 'Perfect Attendance completed') : (isID ? 'Target 8 pertemuan bulan ini' : 'Target: 8 meetings this month')}</small></div><i className="teal">◎</i></button>
          </section>
        </>
      )}

      {page === 'badges' && (
        <section className="student-badge-hub">
          <section className="badge-hub-hero">
            <span>🏅</span>
            <div>
              <small>MY BADGES</small>
              <h2>{isID ? 'Selesaikan Misi dan Buka Badge' : 'Complete Missions and Unlock Badges'}</h2>
              <p>{isID ? 'Kerjakan tugas dan tantangan dari halaman ini. Progres badge akan diperbarui otomatis setelah jawaban dikumpulkan.' : 'Complete assignments and challenges here. Badge progress updates automatically after submission.'}</p>
            </div>
          </section>

          <div className="badge-action-grid">
            <button type="button" onClick={() => onSelect('assignments')}>
              <span>☑</span>
              <div><small>ASSIGNMENT</small><strong>{isID ? 'Kerjakan Tugas' : 'Do Assignments'}</strong><p>{studentAssignments.filter((item) => !item.submission).length} {isID ? 'tugas belum selesai' : 'assignments remaining'}</p></div>
              <b>→</b>
            </button>
            <button type="button" onClick={() => onSelect('challenge')}>
              <span>🎯</span>
              <div><small>CHALLENGE</small><strong>{isID ? 'Kerjakan Tantangan' : 'Do Challenges'}</strong><p>{studentChallenges.filter((item) => !item.result).length} {isID ? 'tantangan belum selesai' : 'challenges remaining'}</p></div>
              <b>→</b>
            </button>
          </div>

          <section className="badges-section badge-hub-list">
            <div className="badges-title"><span>🏆</span><div><h2>{isID ? 'Koleksi Badge' : 'Badge Collection'}</h2><p>{isID ? 'Klik badge untuk menuju aktivitas yang harus diselesaikan' : 'Tap a badge to open the activity needed to unlock it'}</p></div></div>
            <div className="badges-grid">
              {studentBadges.map((badge) => (
                <button type="button" onClick={() => onSelect(badge.type === 'challenge' ? 'challenge' : 'assignments')} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`} key={badge.name}>
                  <span className="badge-icon">{badge.icon}</span>
                  <strong>{badge.name}</strong>
                  <small>{badge.requirement}</small>
                  <div className="badge-progress"><span style={{ width: `${Math.min(100, (Number(badge.current || 0) / Math.max(1, Number(badge.target || 1))) * 100)}%` }} /></div>
                  <em>{Number(badge.target || 0) > 0 ? `${Math.min(Number(badge.current || 0), Number(badge.target))}/${badge.target}` : (isID ? 'Belum ada target' : 'No target yet')}</em>
                  <b>{badge.unlocked ? (isID ? 'TERBUKA' : 'UNLOCKED') : (badge.type === 'challenge' ? (isID ? 'BUKA TANTANGAN →' : 'OPEN CHALLENGE →') : (isID ? 'BUKA TUGAS →' : 'OPEN ASSIGNMENT →'))}</b>
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
          {!selectedPaymentItem && !selectedReceipt && <><div className="payment-store-hero"><img src="/logo-mr-one-course.jpeg" alt="Mr One Course" /><div><span>MR ONE STORE</span><h2>{isID ? 'Belajar, Lengkap, dan Terhubung' : 'Learn, Equipped, and Connected'}</h2><p>{isID ? 'Bayar les dan dapatkan kebutuhan belajar resmi Mr One Course.' : 'Pay tuition and get official Mr One Course learning essentials.'}</p></div></div><div className="payment-center-heading"><span>{isID ? 'PRODUK & TAGIHAN' : 'PRODUCTS & BILLS'}</span><h2>{isID ? 'Pilihan untuk Siswa' : 'Student Essentials'}</h2><p>{isID ? 'Setiap produk memiliki status pembayaran dan kuitansi tersendiri.' : 'Every product has its own payment status and receipt.'}</p></div><div className="payment-product-grid payment-store-grid">{paymentItems.map((item) => { const paid = /^(lunas|paid)$/i.test(String(item.status || '')); const pending = /menunggu verifikasi/i.test(String(item.status || '')); const purchase = item.category !== 'Tuition'; return <article className={`payment-product-card payment-store-card ${paid ? 'paid' : pending ? 'pending' : 'unpaid'}`} key={item.category}><div className={`payment-store-image ${item.category === 'Book Package' ? 'book' : item.category === 'ID Card' ? 'id-card' : 'tuition'}`}>{item.category === 'Book Package' ? <div className="product-text-cover"><span>📚</span><b>{isID ? 'PAKET 4 BUKU' : '4-BOOK PACKAGE'}</b><small>{isID ? 'Full Color • Materi + Workbook' : 'Full Color • Coursebooks + Workbooks'}</small></div> : item.category === 'ID Card' ? <div className="product-text-cover"><span>🪪</span><b>{isID ? 'ID CARD SISWA' : 'STUDENT ID CARD'}</b><small>Mr One Course • Official</small></div> : <div><img src="/logo-mr-one-course.jpeg" alt="" /><b>{isID ? 'LES BULANAN' : 'MONTHLY TUITION'}</b><small>8 Meetings • 60 Minutes</small></div>}<i>{paid ? (isID ? 'LUNAS' : 'PAID') : pending ? (isID ? 'DIPERIKSA' : 'IN REVIEW') : purchase ? (isID ? 'TERSEDIA' : 'AVAILABLE') : (isID ? 'TAGIHAN AKTIF' : 'ACTIVE BILL')}</i></div><header><span>{item.icon}</span><div><small>{item.category === 'Tuition' ? (isID ? 'BULANAN' : 'MONTHLY') : (isID ? 'PRODUK RESMI' : 'OFFICIAL PRODUCT')}</small><h3>{item.label}</h3></div></header><strong className="product-payment-amount">{formatRupiah(item.amount)}</strong><p>{item.category === 'Tuition' ? `${overview?.currentMonth || ''} ${now.getFullYear()} • ${isID ? 'Batas tanggal 7' : 'Due on the 7th'}` : item.category === 'Book Package' ? (isID ? '4 buku full color • Sekali bayar' : '4 full-color books • One-time') : (isID ? 'Kartu identitas resmi siswa • Sekali bayar' : 'Official student identity card • One-time')}</p>{paid && item.paymentDate && <div className="paid-payment-meta"><span>{isID ? 'Dibayar' : 'Paid'}: {String(item.paymentDate)}</span><span>{item.paymentMethod || (isID ? 'Terverifikasi Admin' : 'Admin verified')}</span></div>}{paid && item.fulfillmentStatus && <div className="fulfillment-status">📦 {item.fulfillmentStatus}</div>}{pending && <div className="payment-card-notice">◷ {isID ? 'Konfirmasi diterima. Menunggu Admin.' : 'Confirmation received. Waiting for Admin.'}</div>}<footer>{paid ? <button type="button" onClick={() => setSelectedReceipt(item)}>{isID ? 'Lihat Kuitansi' : 'View Receipt'}</button> : pending ? <span>{isID ? 'Tidak perlu mengirim ulang' : 'No need to resubmit'}</span> : <button type="button" onClick={() => { setSelectedPaymentItem(item); setShowPaymentForm(true); setPaymentMessage(''); }}>{purchase ? (isID ? 'Beli Sekarang' : 'Buy Now') : (isID ? 'Bayar Sekarang' : 'Pay Now')}</button>}</footer></article>; })}</div></>}
          {selectedPaymentItem && !selectedReceipt && (
            <>
              <button className="receipt-back-button" type="button" onClick={() => { setSelectedPaymentItem(null); setShowPaymentForm(false); setPaymentMessage(''); }}>← {isID ? 'Kembali ke Pembayaran' : 'Back to Payments'}</button>
              <article className="tuition-document tuition-invoice" id="tuition-print-document">
                <header><div><span>{selectedPaymentItem.category === 'Tuition' ? (isID ? 'TAGIHAN' : 'INVOICE') : (isID ? 'PEMBELIAN' : 'PURCHASE')}</span><strong>{invoiceNumber}</strong></div><div><b>Mr One Course</b><small>Academic Suite</small></div></header>
                <section className="tuition-amount"><span>{String(selectedPaymentItem.label).toUpperCase()}</span><strong>{formatRupiah(selectedPaymentItem.amount)}</strong><small>{selectedPaymentItem.category === 'Tuition' ? (isID ? 'Batas pembayaran: tanggal 7' : 'Payment due: the 7th') : (isID ? 'Pembayaran satu kali' : 'One-time payment')}</small></section>
                <section className="tuition-student-info"><span>{isID ? 'INFORMASI SISWA' : 'STUDENT INFORMATION'}</span><strong>{overview?.profile?.fullName || '—'}</strong><p>{overview?.profile?.studentId || '—'} • {overview?.program?.program || '—'} • {overview?.program?.className || '—'}</p></section>
                <section className="tuition-transaction"><div><span>{isID ? 'Periode' : 'Period'}</span><strong>{selectedPaymentItem.period || '—'}</strong></div><div><span>{isID ? 'Jumlah' : 'Amount'}</span><strong>{formatRupiah(selectedPaymentItem.amount)}</strong></div><div><span>Status</span><strong className="unpaid">{selectedPaymentItem.category === 'Tuition' ? (isID ? 'BELUM LUNAS' : 'UNPAID') : (isID ? 'BELUM DIBELI' : 'NOT PURCHASED')}</strong></div></section>
                <footer><strong>Mr One Course</strong><span>{isID ? 'Dokumen pembayaran resmi' : 'Official payment document'}</span></footer>
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
                {paymentForm.paymentMethod === 'QRIS Mr One Course' && <div className="qris-payment-box"><img src="/qris-mr-one-course.jpeg" alt="QRIS Mr One Course" /><p>{isID ? 'Buka aplikasi pembayaran, pindai QRIS, lalu masukkan nominal tagihan.' : 'Open your payment app, scan QRIS, then enter the invoice amount.'}</p></div>}
                {paymentForm.paymentMethod === 'Tunai' && <div className="cash-recipient-box"><span>{isID ? 'PEMBAYARAN TUNAI DITERIMA OLEH' : 'CASH PAYMENT RECEIVED BY'}</span><div>{['Mr One', 'Miss Vita'].map((recipient) => <label className={paymentForm.cashRecipient === recipient ? 'selected' : ''} key={recipient}><input type="radio" name="cash-recipient" value={recipient} checked={paymentForm.cashRecipient === recipient} onChange={(event) => setPaymentForm({ ...paymentForm, cashRecipient: event.target.value })} /><strong>{recipient}</strong></label>)}</div></div>}
                <div className="payment-form-heading"><span>2</span><div><h2>{paymentForm.paymentMethod === 'Tunai' ? (isID ? 'Konfirmasi Pembayaran Tunai' : 'Confirm Cash Payment') : (isID ? 'Kirim Bukti Pembayaran' : 'Submit Payment Proof')}</h2><p>{isID ? 'Admin akan memeriksa data berikut.' : 'Admin will review these details.'}</p></div></div>
                <div className="payment-input-grid payment-date-only"><label><span>{isID ? 'Tanggal pembayaran' : 'Payment date'}</span><input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })} required /></label></div>
                {paymentForm.paymentMethod !== 'Tunai' && <label className="payment-proof-upload"><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={choosePaymentProof} /><span>↑</span><strong>{paymentForm.proof?.fileName || (isID ? 'Pilih foto atau PDF bukti pembayaran' : 'Choose payment proof image or PDF')}</strong><small>JPG, PNG, WEBP, PDF • Maks. 4 MB</small></label>}
                <button className="submit-payment-proof" type="submit" disabled={paymentSubmitting}>{paymentSubmitting ? (isID ? 'Mengirim...' : 'Submitting...') : (paymentForm.paymentMethod === 'Tunai' ? (isID ? 'Kirim Konfirmasi Tunai' : 'Submit Cash Confirmation') : (isID ? 'Kirim untuk Diverifikasi' : 'Submit for Verification'))}</button>
              </form>}
            </>
          )}

          {false && isCurrentTuitionPaid && !selectedReceipt && (
            <div className="payment-history-section">
              <div className="payment-history-heading"><span>✓</span><div><h2>{isID ? 'Riwayat Pembayaran' : 'Payment History'}</h2><p>{isID ? 'Pembayaran bulan ini sudah tercatat lunas.' : 'This month’s payment has been recorded as paid.'}</p></div></div>
              <div className="student-payment-history">
                {paidPaymentHistory.length ? paidPaymentHistory.map((item, index) => (
                  <button type="button" key={`${item.month}-${index}`} onClick={() => setSelectedReceipt(item)}><span><b>{item.month}</b><small>{item.detail || (isID ? 'Pembayaran terverifikasi' : 'Verified payment')}</small></span><strong>{item.amount ? formatRupiah(item.amount) : formatRupiah(tuitionAmount)}</strong><i>{isID ? 'LUNAS' : 'PAID'} →</i></button>
                )) : <div className="payment-link-notice">{isID ? 'Riwayat pembayaran belum tersedia.' : 'Payment history is not available yet.'}</div>}
              </div>
            </div>
          )}

          {selectedReceipt && (
            <>
              <button className="receipt-back-button" type="button" onClick={() => setSelectedReceipt(null)}>← {isID ? 'Kembali ke Riwayat' : 'Back to History'}</button>
              <article className="tuition-document tuition-receipt" id="tuition-print-document">
                <header><div><span>{isID ? 'BUKTI PEMBAYARAN' : 'PAYMENT RECEIPT'}</span><strong>{selectedReceipt.paymentId || selectedReceipt.invoiceNumber || invoiceNumber}</strong></div><div><b>Mr One Course</b><small>Academic Suite</small></div></header>
                <section className="tuition-amount"><span>{String(selectedReceipt.label || 'PEMBAYARAN').toUpperCase()}</span><strong>{formatRupiah(selectedReceipt.amount)}</strong></section>
                <section className="tuition-student-info"><span>{isID ? 'INFORMASI SISWA' : 'STUDENT INFORMATION'}</span><strong>{overview?.profile?.fullName || '—'}</strong><p>{overview?.profile?.studentId || '—'} • {overview?.program?.program || '—'} • {overview?.program?.className || '—'}</p></section>
                <section className="tuition-transaction"><div><span>{isID ? 'Periode' : 'Period'}</span><strong>{selectedReceipt.period || '—'}</strong></div><div><span>{isID ? 'Metode' : 'Method'}</span><strong>{selectedReceipt.paymentMethod || (isID ? 'Diverifikasi Admin' : 'Admin verified')}</strong></div>{selectedReceipt.fulfillmentStatus && <div><span>{isID ? 'Status Penyerahan' : 'Fulfillment'}</span><strong>{selectedReceipt.fulfillmentStatus}</strong></div>}<div><span>Status</span><strong className="paid">{isID ? 'LUNAS' : 'PAID'}</strong></div></section>
                <p className="receipt-thanks">{isID ? 'Terima kasih atas pembayaran Anda.' : 'Thank you for your payment.'}</p>
                <footer><strong>Mr One Course</strong><span>{isID ? 'Dokumen ini merupakan bukti pembayaran resmi.' : 'This document serves as an official payment receipt.'}</span></footer>
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

          <div className="profile-subsection-title"><span>🎓</span><h3>{isID ? 'Program Saya' : 'My Program'}</h3></div>
          <div className="detail-row"><span>Program</span><strong>{overview?.program?.program || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Kelas' : 'Class'}</span><strong>{overview?.program?.className || '—'}</strong></div>
          <div className="detail-row"><span>Tutor</span><strong>{overview?.program?.tutor || '—'}</strong></div>

          <div className="profile-subsection-title"><span>💳</span><h3>{isID ? 'Riwayat Pembayaran' : 'Payment History'}</h3></div>
          <div className="detail-row"><span>{isID ? 'Status Bulan Ini' : 'This Month Status'}</span><strong className={overview?.monthly?.payment?.status === 'Lunas' ? 'paid' : 'unpaid'}>{overview?.monthly?.payment?.status || '—'}</strong></div>
          <div className="detail-row"><span>{isID ? 'Catatan' : 'Details'}</span><strong>{overview?.monthly?.payment?.detail || '—'}</strong></div>
          {(overview?.overall?.paymentHistory || []).map((item) => (
            <div className="detail-row" key={item.month}><span>{item.month}</span><strong className={item.status === 'Lunas' ? 'paid' : 'unpaid'}>{item.status}</strong></div>
          ))}
          <button className="student-logout-detail" type="button" onClick={onLogout}>{isID ? 'Keluar dari Akun' : 'Sign Out'}</button>
        </section>
      )}

      {page === 'program' && (
        <section className="detail-panel"><span className="detail-label">{isID ? 'PROGRAM SAYA' : 'MY PROGRAM'}</span><h2>{overview?.program?.program || '—'}</h2>
          <div className="detail-row"><span>{isID ? 'Kelas' : 'Class'}</span><strong>{overview?.program?.className || '—'}</strong></div>
          <div className="detail-row"><span>Tutor</span><strong>{overview?.program?.tutor || '—'}</strong></div>
          <div className="detail-row"><span>Level</span><strong>{overview?.program?.level || (isID ? 'Belum ditentukan' : 'Not determined')}</strong></div>
        </section>
      )}

      {page === 'assignments' && (
        <section className="student-assignments-page"><div className="assignment-page-heading"><span>☑</span><div><h2>{isID ? 'Tugas Saya' : 'My Assignments'}</h2><p>{isID ? 'Tugas aktif dari tutor sesuai kelas Anda' : 'Active assignments from your class tutor'}</p></div></div>{studentSubmitMessage && <div className="student-submit-message">{studentSubmitMessage}</div>}{studentAssignments.length ? <div className="student-assignment-list">{studentAssignments.map((item) => <article key={item.assignmentId}><div className="assignment-title-row"><div><small>{overview?.program?.className || 'CLASS'}</small><h3>{item.title}</h3></div><b>+{item.expReward || 0} EXP</b></div><p>{item.instructions}</p><div className="assignment-meta"><span>{isID ? 'Diberikan' : 'Assigned'}: {item.assignedDate || '—'}</span><strong>{isID ? 'Tenggat' : 'Due'}: {item.dueDate || '—'}</strong></div>{item.submission ? <div className={`submission-result ${String(item.submission.status).toLowerCase()}`}><strong>{item.submission.status === 'Reviewed' ? (isID ? 'Sudah Dinilai' : 'Reviewed') : (isID ? 'Sudah Dikumpulkan' : 'Submitted')}</strong>{item.submission.status === 'Reviewed' && <p>{item.submission.score}/100 • +{item.submission.expAwarded} EXP<br />{item.submission.feedback}</p>}</div> : <div className="student-response-box">{Array.isArray(item.questions) && item.questions.length ? <StudentAssignmentQuestions assignment={item} answers={assignmentResponses[item.assignmentId] || {}} onChange={(answers) => setAssignmentResponses({ ...assignmentResponses, [item.assignmentId]: answers })} isID={isID} /> : <textarea rows="3" value={assignmentResponses[item.assignmentId] || ''} onChange={(event) => setAssignmentResponses({ ...assignmentResponses, [item.assignmentId]: event.target.value })} placeholder={isID ? 'Tulis jawaban atau tempel tautan file...' : 'Write your answer or paste a file link...'} />}<button type="button" disabled={studentSubmitting === item.assignmentId} onClick={() => sendAssignment(item)}>{studentSubmitting === item.assignmentId ? (isID ? 'Mengirim...' : 'Sending...') : (isID ? 'Kumpulkan Tugas' : 'Submit Assignment')}</button></div>}</article>)}</div> : <section className="detail-panel empty-feature"><span>☑</span><h2>{isID ? 'Belum ada tugas aktif' : 'No active assignments'}</h2><p>{isID ? 'Tugas baru dari tutor akan muncul di sini.' : 'New assignments from your tutor will appear here.'}</p></section>}</section>
      )}

      {page === 'journal' && (
        <section className="learning-journal-section">
          <div className="journal-heading"><span>▤</span><div><h2>{isID ? 'Aktivitas Pembelajaran Bulanan' : 'Monthly Learning Activities'}</h2><p>{isID ? 'Rencana dan hasil pembelajaran untuk 8 pertemuan bulan ini' : 'Learning plans and outcomes for this month’s eight meetings'}</p></div></div>
          {learningActivities.length ? learningActivities.map((entry, index) => (
            <article className={`journal-entry-card ${String(entry.status || '').toLowerCase().replace(/\s+/g, '-')}`} key={entry.id || `${entry.date}-${index}`}>
              <span className="journal-number">{String(entry.meetingNumber || index + 1).padStart(2, '0')}</span>
              <div className="journal-entry-content">
                <div className="journal-entry-title"><h3>{entry.title || entry.material || (isID ? `Pertemuan ${index + 1} — Belum direncanakan` : `Meeting ${index + 1} — Not planned`)}</h3><time>{entry.date || '—'}</time></div>
                <p className="journal-tutor">Tutor: {entry.tutor || overview?.program?.tutor || '—'}</p>
                <span className="learning-activity-status">{entry.status || (isID ? 'Terlaksana' : 'Completed')}</span>
                {entry.objective && <p className="journal-objective"><strong>{isID ? 'Tujuan:' : 'Objective:'}</strong> {entry.objective}</p>}
                {entry.targetCompetency && <div className="learning-target-card"><span>{isID ? 'TARGET CAPAIAN' : 'ACHIEVEMENT TARGET'}</span><p>{entry.targetCompetency}</p></div>}
                <p className="journal-activity"><strong>{isID ? 'Aktivitas:' : 'Activities:'}</strong> {entry.activities || entry.activity || entry.notes || '—'}</p>
                {(entry.assignment || entry.challenge) && <div className="learning-evidence-grid">{entry.assignment && <button type="button" onClick={() => onSelect('assignments')}><span>Assignment</span><strong>{entry.assignment.title}</strong><small>{entry.assignment.status}{entry.assignment.score !== '' && entry.assignment.score != null ? ` • ${entry.assignment.score}/100` : ''} • +{entry.assignment.expReward || 0} EXP</small></button>}{entry.challenge && <button type="button" onClick={() => onSelect('challenge')}><span>{isID ? 'Pengayaan' : 'Enrichment'}</span><strong>{entry.challenge.title}</strong><small>{entry.challenge.status}{entry.challenge.score !== '' && entry.challenge.score != null ? ` • ${entry.challenge.score}/100` : ''} • +{entry.challenge.expReward || 0} EXP</small></button>}</div>}
                {entry.achievement && <div className="journal-personal-progress"><span>{isID ? 'CAPAIAN SAYA' : 'MY ACHIEVEMENT'}</span><strong>{entry.achievement}</strong>{entry.individualComment && <p>{entry.individualComment}</p>}</div>}
              </div>
            </article>
          )) : (
            <section className="detail-panel empty-feature"><span>▤</span><h2>{isID ? 'Rencana pembelajaran belum tersedia' : 'Learning plan not available yet'}</h2><p>{isID ? 'Pertemuan 1–8 akan muncul setelah tutor menyusun rencana pembelajaran bulanan.' : 'Meetings 1–8 will appear after the tutor prepares the monthly learning plan.'}</p></section>
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
          <header className="monthly-report-cover">
            <img className="report-logo report-brand-logo-transparent" src="/mr-one-course-logo-transparent.png" alt="Mr One Course" />
            <div><h2>{isID ? 'LAPORAN KEMAJUAN AKADEMIK BULANAN' : 'MONTHLY ACADEMIC PROGRESS REPORT'}</h2><p>MR ONE COURSE • {isID ? 'PERIODE LAPORAN' : 'REPORT PERIOD'}: {overview?.currentMonth || '—'}</p></div>
          </header>

          <article className="monthly-report-card report-profile-card">
            <span className="report-section-label">{isID ? 'PROFIL SISWA' : 'STUDENT PROFILE'}</span>
            <h3>{overview?.profile?.fullName || '—'}</h3>
            <p>{overview?.profile?.studentId || '—'}</p>
            <div><span><small>{isID ? 'PROGRAM' : 'PROGRAM'}</small><strong>{overview?.program?.program || '—'}</strong></span><span><small>{isID ? 'KELAS' : 'CLASS'}</small><strong>{overview?.program?.className || '—'}</strong></span></div>
          </article>

          <article className="monthly-report-card"><span className="report-section-label">{isID ? 'ANALISIS KETERAMPILAN' : 'SKILL ANALYTICS'}</span><SkillRadar scores={skillScores} isID={isID} /></article>

          <div className="report-score-grid">
            <article className="monthly-report-card report-attendance-card"><div><span className="report-section-label">{isID ? 'KEHADIRAN' : 'ATTENDANCE'}</span><strong>{attendance?.percentage == null ? '—' : `${attendance.percentage}%`}</strong></div><p><span>{isID ? 'Hadir' : 'Present'} <b>{attendance?.present ?? '—'}</b></span><span>{isID ? 'Tidak Hadir' : 'Absent'} <b>{attendance?.absent ?? (attendance?.total != null ? Math.max(0, Number(attendance.total) - Number(attendance.present || 0)) : '—')}</b></span></p></article>
            <article className="monthly-report-card report-grade-card"><div><span>{isID ? 'RATA-RATA NILAI' : 'AVERAGE SCORE'}</span><strong>{monthlyReport.averageScore ?? '—'}</strong></div><div><span>{isID ? 'NILAI AKHIR' : 'FINAL GRADE'}</span><strong>{monthlyReport.finalGrade || '—'}</strong></div></article>
          </div>

          <article className="report-comments"><span className="report-section-label">{isID ? 'KOMENTAR TUTOR' : 'TUTOR COMMENTS'}</span><blockquote>{monthlyReport.tutorComments || (isID ? 'Komentar perkembangan akan muncul setelah tutor menyelesaikan laporan bulan ini.' : 'Progress comments will appear after the tutor completes this month’s report.')}</blockquote></article>

          <article className="report-table-section"><span className="report-section-label">{isID ? 'NILAI PENILAIAN BULANAN' : 'MONTHLY ASSESSMENT GRADES'}</span>{assessmentRows.length ? <div className="report-table-scroll"><table><thead><tr><th>{isID ? 'Penilaian' : 'Assessment'}</th><th>Speaking</th><th>Writing</th><th>Reading</th><th>Listening</th></tr></thead><tbody>{assessmentRows.map((row, index) => <tr key={row.id || index}><td>{row.name || row.period || `#${index + 1}`}</td><td>{row.speaking ?? '—'}</td><td>{row.writing ?? '—'}</td><td>{row.reading ?? '—'}</td><td>{row.listening ?? '—'}</td></tr>)}</tbody></table></div> : <p className="report-empty">{isID ? 'Nilai penilaian bulan ini belum tersedia.' : 'This month’s assessment scores are not available yet.'}</p>}</article>

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

      {page === 'challenge' && (
        <>
          <section className="detail-panel challenge-panel">
            <span className="detail-label">{programChallenge.name.toUpperCase()}</span>
            <h2>{isID ? 'Tantangan sesuai program Anda' : 'Your program challenge'}</h2>
            <p>{programChallenge.prompt}</p>
            <div className="challenge-target"><small>{isID ? 'PROGRAM AKTIF' : 'ACTIVE PROGRAM'}</small><strong>{overview?.program?.program || 'English'}</strong></div>
            <button className="challenge-program-action" type="button" disabled><span>{programChallenge.icon}</span><strong>{programChallenge.action}</strong></button>
            <p className="challenge-note">{isID ? 'Aktivitas akan diaktifkan setelah bank soal program tersedia.' : 'The activity will be enabled when the program question bank is ready.'}</p>
          </section>

          {studentChallenges.length > 0 && <section className="active-challenges-section"><div className="monthly-quests-title"><span>🎯</span><h2>{isID ? 'Challenge Aktif' : 'Active Challenges'}</h2></div>{studentSubmitMessage && <div className="student-submit-message">{studentSubmitMessage}</div>}<div className="student-challenge-list">{studentChallenges.map((item) => <article key={item.challengeId}><div className="assignment-title-row"><div><small>{programChallenge.name}</small><h3>{item.title}</h3></div><b>+{item.expReward} EXP</b></div><p>{item.instructions}</p><div className="assignment-meta"><span>{item.responseType === 'link' ? (isID ? 'Jawaban: tautan audio/video/file' : 'Response: audio/video/file link') : (isID ? 'Jawaban teks' : 'Text response')}</span><strong>{isID ? 'Tenggat' : 'Due'}: {item.dueDate}</strong></div>{item.result ? <div className={`submission-result ${String(item.result.status).toLowerCase()}`}><strong>{item.result.status === 'Reviewed' ? (isID ? 'Sudah Dinilai' : 'Reviewed') : (isID ? 'Sudah Dikirim' : 'Submitted')}</strong>{item.result.status === 'Reviewed' && <p>{item.result.score}/100 • +{item.result.expAwarded} EXP<br />{item.result.feedback}</p>}</div> : <div className="student-response-box"><textarea rows="3" value={challengeResponses[item.challengeId] || ''} onChange={(event) => setChallengeResponses({ ...challengeResponses, [item.challengeId]: event.target.value })} placeholder={item.responseType === 'link' ? (isID ? 'Tempel tautan audio, video, atau file...' : 'Paste an audio, video, or file link...') : (isID ? 'Tulis jawaban Anda...' : 'Write your response...')} /><button type="button" disabled={studentSubmitting === item.challengeId} onClick={() => sendChallenge(item.challengeId)}>{studentSubmitting === item.challengeId ? (isID ? 'Mengirim...' : 'Sending...') : (isID ? 'Kirim Challenge' : 'Submit Challenge')}</button></div>}</article>)}</div></section>}

          <section className="monthly-quests-card challenge-monthly-quests">
            <div className="monthly-quests-title"><span>◎</span><h2>{isID ? 'Tantangan & Misi Bulanan' : 'Challenges & Monthly Quests'} <small>({overview?.currentMonth || '—'})</small></h2></div>
            <article className={`quest-item ${attendanceQuestDone ? 'done' : ''}`}>
              <div className="quest-icon">♙</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Kehadiran Sempurna' : 'Perfect Attendance'}</strong><b>+150 EXP</b></div>
                <p>{isID ? 'Hadiri seluruh 8 pertemuan bulan ini' : 'Attend all 8 meetings this month'}</p>
                <div className="quest-progress-row"><div><span style={{ width: `${(attendanceQuestProgress / attendanceQuestTarget) * 100}%` }} /></div><strong>{attendanceQuestDone ? (isID ? 'SELESAI' : 'DONE') : `${attendanceQuestProgress}/${attendanceQuestTarget}`}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">🎯</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{programChallenge.name}</strong><b>+150 EXP</b></div>
                <p>{programChallenge.prompt}</p>
                <div className="quest-progress-row"><div><span style={{ width: experience?.monthly?.challengesTarget ? `${Math.min(100, (experience.monthly.challengesCompleted / experience.monthly.challengesTarget) * 100)}%` : '0%' }} /></div><strong>{experience?.monthly?.challengesTarget ? `${experience.monthly.challengesCompleted}/${experience.monthly.challengesTarget}` : (isID ? 'BELUM ADA DATA' : 'NO DATA')}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">☑</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Pahlawan Tugas' : 'Assignment Hero'}</strong><b>+100 EXP</b></div>
                <p>{isID ? 'Selesaikan semua tugas program bulan ini' : 'Complete all program assignments this month'}</p>
                <div className="quest-progress-row"><div><span style={{ width: experience?.monthly?.assignmentsTarget ? `${Math.min(100, (experience.monthly.assignmentsCompleted / experience.monthly.assignmentsTarget) * 100)}%` : '0%' }} /></div><strong>{experience?.monthly?.assignmentsTarget ? `${experience.monthly.assignmentsCompleted}/${experience.monthly.assignmentsTarget}` : (isID ? 'BELUM ADA DATA' : 'NO DATA')}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">📝</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Master Quiz & Tes' : 'Quiz & Test Master'}</strong><b>+150 EXP</b></div>
                <p>{isID ? 'Selesaikan seluruh quiz atau tes bulan ini sesuai standar tutor' : 'Complete every quiz or test this month to the tutor’s standard'}</p>
                <div className="quest-progress-row"><div><span style={{ width: '0%' }} /></div><strong>{isID ? 'BELUM ADA DATA' : 'NO DATA'}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">🙋</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Aktif di Kelas' : 'Active in Class'}</strong><b>+100 EXP</b></div>
                <p>{isID ? 'Berpartisipasi aktif, menjawab, bertanya, dan bekerja sama selama pembelajaran' : 'Participate, answer, ask questions, and collaborate during class'}</p>
                <div className="quest-progress-row"><div><span style={{ width: '0%' }} /></div><strong>{isID ? 'DINILAI TUTOR' : 'TUTOR REVIEW'}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">🚀</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Project Finisher' : 'Project Finisher'}</strong><b>+200 EXP</b></div>
                <p>{isID ? 'Selesaikan project program dan kumpulkan tepat waktu' : 'Complete the program project and submit it on time'}</p>
                <div className="quest-progress-row"><div><span style={{ width: '0%' }} /></div><strong>{isID ? 'BELUM ADA DATA' : 'NO DATA'}</strong></div>
              </div>
            </article>
            <article className="quest-item">
              <div className="quest-icon">🏆</div>
              <div className="quest-content">
                <div className="quest-name"><strong>{isID ? 'Pencapaian Istimewa' : 'Special Achievement'}</strong><b>+250 EXP</b></div>
                <p>{isID ? 'Raih prestasi, peningkatan menonjol, atau kontribusi khusus yang disahkan tutor' : 'Earn an achievement, notable improvement, or special contribution approved by the tutor'}</p>
                <div className="quest-progress-row"><div><span style={{ width: '0%' }} /></div><strong>{isID ? 'BONUS TUTOR' : 'TUTOR BONUS'}</strong></div>
              </div>
            </article>
          </section>

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

function Dashboard({
  user,
  metrics,
  recentPayments,
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

  const cards =
    user.role === 'CEO'
      ? [
          {
            label: 'Siswa Aktif',
            value: metrics?.activeStudents || 0,
            icon: '👥',
          },
          {
            label: 'Kelas Aktif',
            value: metrics?.activeClasses || 0,
            icon: '🏫',
          },
          {
            label: 'Pendapatan',
            value: formatRupiah(
              metrics?.totalRevenue
            ),
            icon: '💳',
          },
          {
            label: 'Kehadiran',
            value: `${metrics?.attendanceRate || 0}%`,
            icon: '✓',
          },
        ]
      : [
          {
            label: 'Data Siswa',
            value: metrics?.totalStudents || 0,
            icon: '👥',
          },
          {
            label: 'Kelas Aktif',
            value: metrics?.activeClasses || 0,
            icon: '🏫',
          },
          {
            label: 'Pembayaran',
            value: metrics?.verifiedPayments || 0,
            icon: '✓',
          },
          {
            label: 'Perlu Verifikasi',
            value: metrics?.pendingPayments || 0,
            icon: '!',
          },
        ];

  return (
    <main className="app-dashboard">
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
            Berikut ringkasan terbaru Mr One Course.
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
            {cards.map((card) => (
              <article
                className="metric-card"
                key={card.label}
              >
                <span className="metric-icon">
                  {card.icon}
                </span>

                <small>{card.label}</small>
                <strong>{card.value}</strong>
              </article>
            ))}
          </section>

          <section className="dashboard-section">
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
          </section>
        </>
      )}
      </>
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
        />
      ) : activePage === 'registrations' ? (
        <StudentRegistrationsPage registrations={registrations} loading={registrationsLoading} message={message} onApprove={onApproveRegistration} onReject={onRejectRegistration} />
      ) : activePage === 'payment-confirmations' ? (
        <PaymentConfirmationsPage confirmations={paymentConfirmations} payments={paymentRecords} loading={paymentConfirmationsLoading} message={message} onReview={onReviewPayment} onAddHistorical={onAddHistoricalPayment} onUpdateFulfillment={onUpdateFulfillment} token={token} />
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

function PaymentConfirmationsPage({ confirmations, payments, loading, message, onReview, onAddHistorical, onUpdateFulfillment, token }) {
  const [proof, setProof] = useState(null); const [proofLoading, setProofLoading] = useState(''); const [notes, setNotes] = useState({}); const [showHistorical, setShowHistorical] = useState(false);
  const [historical, setHistorical] = useState({ studentId: '', paymentCategory: 'Book Package', amount: 150000, paymentDate: new Date().toISOString().slice(0,10), paymentMethod: 'Tunai', period: '', fulfillmentStatus: 'Sedang Disiapkan', note: '' });
  const pending = (confirmations || []).filter((item) => /menunggu verifikasi/i.test(item.status));
  const productPayments = (payments || []).filter((item) => /book|id card/i.test(item.paymentCategory));
  async function viewProof(item) { setProofLoading(item.confirmationId); try { const result = await callApi({ action: 'getPaymentProof', token, confirmationId: item.confirmationId }); setProof({ ...result, confirmationId: item.confirmationId }); } catch (error) { window.alert(error.message); } finally { setProofLoading(''); } }
  async function submitHistorical(event) { event.preventDefault(); const success = await onAddHistorical(historical); if (success) { setShowHistorical(false); setHistorical({ studentId: '', paymentCategory: 'Book Package', amount: 150000, paymentDate: new Date().toISOString().slice(0,10), paymentMethod: 'Tunai', period: '', fulfillmentStatus: 'Sedang Disiapkan', note: '' }); } }
  function chooseCategory(category) { setHistorical({ ...historical, paymentCategory: category, amount: category === 'ID Card' ? 20000 : 150000, fulfillmentStatus: category === 'Tuition' ? '' : 'Sedang Disiapkan' }); }
  return <section className="payment-admin-page"><div className="section-heading"><div><span className="eyebrow">PAYMENT CENTER</span><h2>Kelola Pembayaran</h2></div><button className="add-historical-button" type="button" onClick={() => setShowHistorical((value) => !value)}>＋ Tambah Pembayaran Lama</button></div>{message && <div className="error-message">{message}</div>}
    {showHistorical && <form className="historical-payment-form" onSubmit={submitHistorical}><header><div><small>TRANSAKSI SEBELUM PORTAL</small><h3>Tambah Pembayaran Lama</h3></div><button type="button" onClick={() => setShowHistorical(false)}>×</button></header><div className="historical-payment-grid"><label><span>Student ID</span><input value={historical.studentId} onChange={(event) => setHistorical({ ...historical, studentId: event.target.value.toUpperCase() })} placeholder="MOC001" required /></label><label><span>Jenis Pembayaran</span><select value={historical.paymentCategory} onChange={(event) => chooseCategory(event.target.value)}><option value="Book Package">Paket 4 Buku</option><option value="ID Card">ID Card</option><option value="Tuition">Les Bulanan</option></select></label><label><span>Nominal</span><input type="number" value={historical.amount} onChange={(event) => setHistorical({ ...historical, amount: Number(event.target.value) })} required /></label><label><span>Tanggal Pembayaran</span><input type="date" value={historical.paymentDate} onChange={(event) => setHistorical({ ...historical, paymentDate: event.target.value })} required /></label><label><span>Metode</span><select value={historical.paymentMethod} onChange={(event) => setHistorical({ ...historical, paymentMethod: event.target.value })}><option>Tunai</option><option>QRIS</option><option>BCA</option><option>BPD Kaltimtara</option><option>SeaBank</option><option>GoPay / DANA</option></select></label>{historical.paymentCategory === 'Tuition' && <label><span>Periode Les</span><input type="month" value={historical.period} onChange={(event) => setHistorical({ ...historical, period: event.target.value })} required /></label>}{historical.paymentCategory !== 'Tuition' && <label><span>Status Penyerahan</span><select value={historical.fulfillmentStatus} onChange={(event) => setHistorical({ ...historical, fulfillmentStatus: event.target.value })}><option>Sedang Disiapkan</option><option>Siap Diambil</option><option>Sudah Diterima Siswa</option></select></label>}<label className="wide"><span>Catatan</span><input value={historical.note} onChange={(event) => setHistorical({ ...historical, note: event.target.value })} placeholder="Opsional" /></label></div><button className="save-historical-payment" type="submit" disabled={loading}>Simpan sebagai Lunas</button></form>}
    <div className="payment-admin-tabs-heading"><h3>Perlu Verifikasi</h3><span>{pending.length} menunggu</span></div>{loading ? <div className="dashboard-loading">Memuat pembayaran...</div> : pending.length === 0 ? <div className="empty-state">Tidak ada pembayaran yang menunggu verifikasi.</div> : <div className="payment-confirmation-list">{pending.map((item) => { const cash = /^Tunai\s*-/i.test(String(item.paymentMethod || '')); return <article key={item.confirmationId}><header><div><small>{item.invoiceNumber}</small><h3>{item.studentName}</h3><p>{item.studentId} • {item.itemLabel || item.paymentCategory} • {item.period}</p></div><span>MENUNGGU</span></header><div className="payment-review-details"><div><span>Nominal</span><strong>{formatRupiah(item.amount)}</strong></div><div><span>Metode</span><strong>{item.paymentMethod}</strong></div><div><span>Tanggal Bayar</span><strong>{item.paymentDate}</strong></div></div>{!cash && <button className="view-payment-proof" type="button" onClick={() => viewProof(item)} disabled={proofLoading === item.confirmationId}>{proofLoading === item.confirmationId ? 'Membuka...' : 'Lihat Bukti Pembayaran'}</button>}{cash && <div className="cash-admin-note">Pembayaran tunai — konfirmasi langsung kepada penerima yang tertera.</div>}{proof?.confirmationId === item.confirmationId && <div className="payment-proof-preview">{proof.mimeType === 'application/pdf' ? <iframe title="Bukti pembayaran PDF" src={`data:${proof.mimeType};base64,${proof.base64}`} /> : <img src={`data:${proof.mimeType};base64,${proof.base64}`} alt="Bukti pembayaran" />}<button type="button" onClick={() => setProof(null)}>Tutup Bukti</button></div>}<label className="payment-admin-note"><span>Catatan Admin (wajib jika ditolak)</span><input value={notes[item.confirmationId] || ''} onChange={(event) => setNotes({ ...notes, [item.confirmationId]: event.target.value })} placeholder="Contoh: nominal belum sesuai" /></label><footer><button className="reject" type="button" disabled={!notes[item.confirmationId]} onClick={() => onReview({ confirmationId: item.confirmationId, decision: 'reject', note: notes[item.confirmationId] })}>Tolak</button><button className="approve" type="button" onClick={() => onReview({ confirmationId: item.confirmationId, decision: 'verify', note: notes[item.confirmationId] || 'Pembayaran telah diverifikasi.' })}>Verifikasi & Tandai Lunas</button></footer></article>; })}</div>}
    <div className="payment-admin-tabs-heading"><h3>Buku & ID Card Sudah Dibayar</h3><span>{productPayments.length} transaksi</span></div><div className="fulfillment-admin-list">{productPayments.length ? productPayments.map((item) => <article key={item.paymentId}><div><span>{item.paymentCategory === 'Book Package' ? '📚' : '🪪'}</span><div><strong>{item.studentName}</strong><small>{item.studentId} • {item.itemLabel || item.paymentCategory} • {formatRupiah(item.amount)}</small></div></div><select value={item.fulfillmentStatus || 'Sedang Disiapkan'} onChange={(event) => onUpdateFulfillment({ paymentId: item.paymentId, status: event.target.value, note: item.notes })}><option>Sedang Disiapkan</option><option>Siap Diambil</option><option>Sudah Diterima Siswa</option></select></article>) : <div className="empty-state">Belum ada pembayaran buku atau ID Card yang tercatat.</div>}</div>
  </section>;
}

function StudentRegistrationsPage({ registrations, loading, message, onApprove, onReject }) {
  const [drafts, setDrafts] = useState({});
  const pending = (registrations || []).filter((item) => String(item.status).toLowerCase() === 'menunggu verifikasi');
  const draftFor = (item) => drafts[item.registrationId] || { registrationId: item.registrationId, studentId: '', program: item.requestedProgram || '', classId: '', schedule: item.requestedSchedule || '', note: '' };
  const update = (item, field, value) => setDrafts({ ...drafts, [item.registrationId]: { ...draftFor(item), [field]: value } });
  return <section className="registration-admin-page"><div className="section-heading"><div><span className="eyebrow">STUDENT ACCESS</span><h2>Pendaftaran Siswa Baru</h2></div><span className="data-count">{pending.length} menunggu</span></div>{message && <div className="error-message">{message}</div>}{loading ? <div className="dashboard-loading">Memuat pendaftaran...</div> : pending.length === 0 ? <div className="empty-state">Tidak ada pendaftaran yang menunggu verifikasi.</div> : <div className="registration-admin-list">{pending.map((item) => { const draft = draftFor(item); return <article key={item.registrationId}><header><div><small>{item.registrationId}</small><h3>{item.fullName}</h3><p>{item.school} • {item.grade}</p></div><span>MENUNGGU</span></header><div className="registration-contact"><span>WA Orang Tua: <b>{item.waParent}</b></span><span>Username: <b>{item.username}</b></span></div><div className="registration-approval-grid"><label><span>Student ID</span><input value={draft.studentId} onChange={(event) => update(item, 'studentId', event.target.value)} placeholder="MOC002" /></label><label><span>Program</span><input value={draft.program} onChange={(event) => update(item, 'program', event.target.value)} /></label><label><span>Class ID</span><input value={draft.classId} onChange={(event) => update(item, 'classId', event.target.value)} placeholder="GRAMMAR-A" /></label><label><span>Jadwal</span><input value={draft.schedule} onChange={(event) => update(item, 'schedule', event.target.value)} placeholder="Rabu & Jumat 19.00–20.00" /></label></div><label className="registration-note"><span>Catatan Admin</span><input value={draft.note} onChange={(event) => update(item, 'note', event.target.value)} /></label><footer><button type="button" className="reject" onClick={() => onReject(item.registrationId)}>Tolak</button><button type="button" className="approve" disabled={!draft.studentId || !draft.program || !draft.classId || !draft.schedule} onClick={() => onApprove(draft)}>Setujui & Aktifkan Akun</button></footer></article>; })}</div>}</section>;
}

function StudentsPage({
  students,
  loading,
  search,
  onSearchChange,
  onSearch,
  pagination,
  onPageChange,
  message,
}) {
  function submitSearch(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <section className="students-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STUDENT DIRECTORY</span>
          <h1>Data Siswa</h1>
          <p>{pagination.totalData || 0} siswa ditemukan</p>
        </div>
      </div>

      <form className="student-search" onSubmit={submitSearch}>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama, ID, sekolah, atau kelas"
        />
        <button type="submit">Cari</button>
      </form>

      {message && <div className="error-message">{message}</div>}

      {loading ? (
        <div className="dashboard-loading">Memuat data siswa...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">Data siswa tidak ditemukan.</div>
      ) : (
        <div className="student-list">
          {students.map((student) => (
            <article className="student-card" key={student.studentId}>
              <div className="student-avatar">
                {String(student.fullName || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="student-info">
                <div className="student-name-row">
                  <strong>{student.fullName || 'Tanpa nama'}</strong>
                  <span className={`student-status ${String(student.status).toLowerCase() === 'aktif' ? 'active' : ''}`}>
                    {student.status || 'Aktif'}
                  </span>
                </div>
                <span>{student.studentId || '-'}</span>
                <p>{student.program || 'Program belum diisi'} • {student.className || 'Kelas belum diisi'}</p>
                <small>{student.school || 'Sekolah belum diisi'}{student.grade ? ` • ${student.grade}` : ''}</small>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            ← Sebelumnya
          </button>
          <span>Halaman {pagination.page} dari {pagination.totalPages}</span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Berikutnya →
          </button>
        </div>
      )}
    </section>
  );
}

export default App;
