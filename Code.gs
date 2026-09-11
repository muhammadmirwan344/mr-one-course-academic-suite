/**
 * MR ONE COURSE ACADEMIC SUITE
 * V18 AUTH CLEAN — Login semua role + aktivasi siswa
 * ID akun singkat tetap: TUT1, TUT2, ADM1, CEO
 */

const SHEET_NAMES = {
  STUDENTS: 'Data Siswa',
  PAYMENTS: 'Data Pembayaran',
  ATTENDANCE: 'Absensi',
  SCHEDULES: 'Master Jadwal'
};

/**
 * Jalankan satu kali untuk menyimpan ID Spreadsheet.
 */
function setupConnection() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'Spreadsheet tidak ditemukan. Pastikan Apps Script dibuka dari Google Sheet salinan.'
    );
  }

  PropertiesService.getScriptProperties().setProperty(
    'SPREADSHEET_ID',
    spreadsheet.getId()
  );

  const result = checkRequiredSheets_(spreadsheet);

  Logger.log('Koneksi berhasil.');
  Logger.log('Nama Spreadsheet: ' + spreadsheet.getName());
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  Logger.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Menguji koneksi dan membaca jumlah data.
 */
function testConnection() {
  const spreadsheet = getDatabase_();
  const result = checkRequiredSheets_(spreadsheet);

  Logger.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Endpoint awal API.
 */
function doGet(e) {
  try {
    const spreadsheet = getDatabase_();
    const result = checkRequiredSheets_(spreadsheet);

    return createJsonResponse_({
      success: true,
      message: 'Mr One Course Academic Suite API is connected.',
      data: result
    });
  } catch (error) {
    return createJsonResponse_({
      success: false,
      message: error.message
    });
  }
}

/**
 * Membuka Spreadsheet database berdasarkan ID yang tersimpan.
 */
function getDatabase_() {
  const spreadsheetId = PropertiesService
    .getScriptProperties()
    .getProperty('SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Spreadsheet belum dihubungkan. Jalankan setupConnection() terlebih dahulu.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Memeriksa keberadaan sheet dan jumlah data.
 */
function checkRequiredSheets_(spreadsheet) {
  const details = {};
  const missingSheets = [];

  Object.keys(SHEET_NAMES).forEach(function (key) {
    const sheetName = SHEET_NAMES[key];
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      missingSheets.push(sheetName);
      return;
    }

    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    let headers = [];

    if (lastColumn > 0) {
      headers = sheet
        .getRange(1, 1, 1, lastColumn)
        .getDisplayValues()[0]
        .map(function (header) {
          return String(header).trim();
        });
    }

    details[key] = {
      sheetName: sheetName,
      totalData: Math.max(lastRow - 1, 0),
      totalColumns: lastColumn,
      headers: headers
    };
  });

  return {
    spreadsheetName: spreadsheet.getName(),
    connected: missingSheets.length === 0,
    missingSheets: missingSheets,
    sheets: details
  };
}

/**
 * Membuat respons JSON.
 */
function createJsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menyiapkan struktur dasar Academic Suite.
 * Fungsi ini tidak menghapus atau mengubah data lama.
 */
function setupSystem() {
  const spreadsheet = getDatabase_();
  const lock = LockService.getScriptLock();

  lock.waitLock(30000);

  try {
    // Menambahkan kolom yang belum tersedia.
    ensureHeaders_(
      spreadsheet.getSheetByName('Data Siswa'),
      [
        'Join Date',
        'Student Status',
        'Account Status',
        'Current Level',
        'Last Updated'
      ]
    );

    ensureHeaders_(
      spreadsheet.getSheetByName('Data Pembayaran'),
      [
        'Payment ID',
        'Student ID',
        'Nama',
        'Payment Category',
        'Item Label',
        'Period',
        'Payment Method',
        'Payment Date',
        'Amount',
        'Status',
        'Fulfillment Status',
        'Verified Date',
        'Verified By',
        'Invoice Number',
        'Receipt Link',
        'Notes'
      ]
    );

    ensureHeaders_(
      spreadsheet.getSheetByName('Absensi'),
      [
        'Attendance ID',
        'Class ID',
        'Session ID',
        'Pertemuan Ke',
        'Catatan',
        'Updated By'
      ]
    );

    ensureHeaders_(
      spreadsheet.getSheetByName('Master Jadwal'),
      [
        'Class ID',
        'Nama Kelas',
        'Program',
        'Hari',
        'Mulai',
        'Selesai',
        'Sisa Kuota',
        'Status'
      ]
    );

    // Membuat dua sheet sistem awal.
    createSheetIfMissing_(
      spreadsheet,
      'Users',
      [
        'User ID',
        'Username',
        'Password Hash',
        'Role',
        'Related ID',
        'Full Name',
        'Status',
        'Created At',
        'Last Login'
      ]
    );

    createSheetIfMissing_(
      spreadsheet,
      'Settings',
      [
        'Setting Key',
        'Setting Value',
        'Description',
        'Last Updated'
      ]
    );

    setupDefaultSettings_(spreadsheet);

    const result = {
      success: true,
      message: 'Struktur dasar Academic Suite berhasil disiapkan.',
      spreadsheetName: spreadsheet.getName()
    };

    Logger.log(JSON.stringify(result, null, 2));

    return result;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menambahkan header baru tanpa mengubah header dan data lama.
 */
function ensureHeaders_(sheet, requiredHeaders) {
  if (!sheet) {
    throw new Error('Sheet yang diperlukan tidak ditemukan.');
  }

  const lastColumn = Math.max(sheet.getLastColumn(), 1);

  const existingHeaders = sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map(function (header) {
      return normalizeHeader_(header);
    });

  requiredHeaders.forEach(function (header) {
    const normalizedHeader = normalizeHeader_(header);

    if (existingHeaders.indexOf(normalizedHeader) === -1) {
      const newColumn = sheet.getLastColumn() + 1;
      sheet.getRange(1, newColumn).setValue(header);
      existingHeaders.push(normalizedHeader);
    }
  });

  sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setBackground('#0B1F33')
    .setFontColor('#FFFFFF');

  sheet.setFrozenRows(1);
}

/**
 * Membuat sheet baru jika belum tersedia.
 */
function createSheetIfMissing_(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0B1F33')
      .setFontColor('#FFFFFF');

    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Membuat pengaturan awal lembaga.
 */
function setupDefaultSettings_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Settings');

  if (!sheet) {
    throw new Error('Sheet Settings tidak ditemukan.');
  }

  const settings = [
    [
      'INSTITUTION_NAME',
      'Mr One Course',
      'Nama lembaga',
      new Date()
    ],
    [
      'TUITION_FEE',
      '150000',
      'Biaya les standar per bulan',
      new Date()
    ],
    [
      'PAYMENT_DUE_DATE',
      '7',
      'Batas pembayaran setiap bulan',
      new Date()
    ],
    [
      'MONTHLY_SESSIONS',
      '8',
      'Jumlah pertemuan setiap bulan',
      new Date()
    ],
    [
      'TIMEZONE',
      'Asia/Makassar',
      'Zona waktu aplikasi',
      new Date()
    ]
  ];

  const existingKeys =
    sheet.getLastRow() > 1
      ? sheet
          .getRange(2, 1, sheet.getLastRow() - 1, 1)
          .getDisplayValues()
          .flat()
          .map(function (key) {
            return String(key).trim();
          })
      : [];

  const newSettings = settings.filter(function (setting) {
    return existingKeys.indexOf(setting[0]) === -1;
  });

  if (newSettings.length > 0) {
    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        newSettings.length,
        newSettings[0].length
      )
      .setValues(newSettings);
  }
}

/**
 * Menyamakan pen dan spasi nama header.
 */
function normalizeHeader_(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Membuat akun awal CEO dan Admin.
 * Jalankan hanya satu kali.
 */
function createInitialManagementAccounts() {
  const spreadsheet = getDatabase_();
  const usersSheet = spreadsheet.getSheetByName('Users');

  if (!usersSheet) {
    throw new Error(
      'Sheet Users belum tersedia. Jalankan setupSystem() terlebih dahulu.'
    );
  }

  ensureHeaders_(
    usersSheet,
    [
      'User ID',
      'Username',
      'Password Hash',
      'Password Salt',
      'Role',
      'Related ID',
      'Full Name',
      'Status',
      'Must Change Password',
      'Created At',
      'Last Login'
    ]
  );

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const accounts = [
      {
        userId: 'CEO',
        username: 'CEO',
        role: 'CEO',
        relatedId: 'CEO',
        fullName: 'Mr Mirwan'
      },
      {
        userId: 'ADM1',
        username: 'ADM1',
        role: 'Admin',
        relatedId: 'ADM1',
        fullName: 'Miss Sita'
      }
    ];

    const results = [];

    accounts.forEach(function (account) {
      const existingUser = findUserByUsername_(
        usersSheet,
        account.username
      );

      if (existingUser) {
        results.push({
          username: account.username,
          status: 'Sudah tersedia'
        });

        return;
      }

      const temporaryPassword = generateTemporaryPassword_();
      const salt = Utilities.getUuid();
      const passwordHash = hashPassword_(
        temporaryPassword,
        salt
      );

      appendObjectToSheet_(
        usersSheet,
        {
          'User ID': account.userId,
          'Username': account.username,
          'Password Hash': passwordHash,
          'Password Salt': salt,
          'Role': account.role,
          'Related ID': account.relatedId,
          'Full Name': account.fullName,
          'Status': 'Aktif',
          'Must Change Password': 'Ya',
          'Created At': new Date(),
          'Last Login': ''
        }
      );

      results.push({
        username: account.username,
        fullName: account.fullName,
        role: account.role,
        temporaryPassword: temporaryPassword,
        status: 'Berhasil dibuat'
      });
    });

    Logger.log('CATAT PASSWORD SEMENTARA BERIKUT:');
    Logger.log(JSON.stringify(results, null, 2));
    Logger.log(
      'Jangan kirim atau membagikan screenshot yang menampilkan password.'
    );

    return {
      success: true,
      message: 'Akun awal berhasil diproses.',
      accounts: results
    };
  } finally {
    lock.releaseLock();
  }
}

// MR ONE COURSE ACADEMIC SUITE
// BACKEND VERSION: V17-SHORT-ACCOUNT-IDS
// SETUP FUNCTION TO RUN: setupTutor2MrOneV2

/**
 * Menyiapkan akun Tutor 2 (Mr One) dan struktur aktivasi siswa lama.
 * Jalankan satu kali dari editor Apps Script setelah setupSystem().
 * Fungsi aman dijalankan ulang: akun yang sudah ada tidak diduplikasi.
 */


/**
 * Nama eksekusi unik untuk menghindari fungsi setup lama/duplikat.
 * Jalankan fungsi ini dari dropdown Apps Script.
 */


/**
 * Setup mandiri V16. Tidak bergantung pada helper aktivasi lain.
 * Gunakan fungsi ini bila project lama tidak memiliki helper lengkap.
 */


/**
 * Mencari akun berdasarkan username.
 */
function findUserByUsername_(sheet, username) {
  if (sheet.getLastRow() < 2) {
    return null;
  }

  const data = getSheetObjects_(sheet);

  const normalizedUsername = String(username)
    .trim()
    .toLowerCase();

  return data.find(function (user) {
    return String(user.Username || '')
      .trim()
      .toLowerCase() === normalizedUsername;
  }) || null;
}

/**
 * Mengubah seluruh baris sheet menjadi object berdasarkan header.
 */
function getSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map(function (header) {
    return String(header).trim();
  });

  return values.slice(1).map(function (row, index) {
    const object = {
      _rowNumber: index + 2
    };

    headers.forEach(function (header, columnIndex) {
      if (header) {
        object[header] = row[columnIndex];
      }
    });

    return object;
  });
}

/**
 * Menambahkan object ke sheet sesuai nama header.
 */
function appendObjectToSheet_(sheet, objectData) {
  const lastColumn = sheet.getLastColumn();

  const headers = sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map(function (header) {
      return String(header).trim();
    });

  const row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(
      objectData,
      header
    )
      ? objectData[header]
      : '';
  });

  sheet.appendRow(row);
}

/**
 * Membuat password sementara.
 */
function generateTemporaryPassword_() {
  const randomText = Utilities
    .getUuid()
    .replace(/-/g, '')
    .substring(0, 10);

  return 'Moc!' + randomText;
}

/**
 * Membuat hash password menggunakan salt.
 */
function hashPassword_(password, salt) {
  const text = String(salt) + ':' + String(password);

  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );

  return digest
    .map(function (byte) {
      const value = byte < 0 ? byte + 256 : byte;
      return ('0' + value.toString(16)).slice(-2);
    })
    .join('');
}

/**
 * Mereset password CEO dan Admin yang sempat terlihat.
 */
function resetManagementPasswords() {
  const spreadsheet = getDatabase_();
  const sheet = spreadsheet.getSheetByName('Users');

  if (!sheet) {
    throw new Error('Sheet Users tidak ditemukan.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0]
      .map(function (header) {
        return String(header).trim();
      });

    const usernameColumn = headers.indexOf('Username') + 1;
    const hashColumn = headers.indexOf('Password Hash') + 1;
    const saltColumn = headers.indexOf('Password Salt') + 1;
    const mustChangeColumn =
      headers.indexOf('Must Change Password') + 1;

    if (
      usernameColumn < 1 ||
      hashColumn < 1 ||
      saltColumn < 1 ||
      mustChangeColumn < 1
    ) {
      throw new Error('Struktur sheet Users belum lengkap.');
    }

    const usernames = ['CEO', 'ADM1'];
    const results = [];

    const usernameValues = sheet
      .getRange(2, usernameColumn, sheet.getLastRow() - 1, 1)
      .getDisplayValues()
      .flat();

    usernames.forEach(function (username) {
      const index = usernameValues.findIndex(function (value) {
        return String(value).trim() === username;
      });

      if (index === -1) {
        results.push({
          username: username,
          status: 'Akun tidak ditemukan'
        });

        return;
      }

      const rowNumber = index + 2;
      const newPassword = generateTemporaryPassword_();
      const newSalt = Utilities.getUuid();
      const newHash = hashPassword_(newPassword, newSalt);

      sheet.getRange(rowNumber, hashColumn).setValue(newHash);
      sheet.getRange(rowNumber, saltColumn).setValue(newSalt);
      sheet
        .getRange(rowNumber, mustChangeColumn)
        .setValue('Ya');

      results.push({
        username: username,
        newTemporaryPassword: newPassword,
        status: 'Password berhasil direset'
      });
    });

    Logger.log('PASSWORD BARU — CATAT SECARA PRIBADI:');
    Logger.log(JSON.stringify(results, null, 2));
    Logger.log(
      'Jangan mengambil atau mengirim screenshot password ini.'
    );

    return {
      success: true,
      message: 'Password CEO dan Admin berhasil direset.'
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menerima permintaan POST dari frontend React.
 */
/**
 * Menerima permintaan POST dari frontend React.
 * V18 AUTH CLEAN — route API dibuat bersih, tanpa function lain di dalam switch.
 */
function doPost(e) {
  try {
    const request = parseRequest_(e);
    const action = String(request.action || '').trim();

    let result;

    switch (action) {
      case 'login':
        result = loginUser_(request);
        break;

      case 'validateSession':
        result = validateSession_(request.token);
        break;

      case 'logout':
        result = logoutUser_(request.token);
        break;

      case 'getDashboard':
        result = getDashboardData_(request.token);
        break;

      case 'getStudents':
        result = getStudents_(request.token, request);
        break;

      case 'getAdminStudentDetail':
        result = getAdminStudentDetail_(request.token, request.studentId);
        break;

      case 'getRegistrationSchedules':
        result = getRegistrationSchedules_(request.program);
        break;

      case 'registerStudent':
        result = registerStudent_(request.registration);
        break;

      case 'activateStudentAccount':
        result = activateStudentAccount_(request.activation);
        break;

      case 'getStudentRegistrations':
        result = getStudentRegistrations_(request.token);
        break;

      case 'getRegistrationFile':
        result = getRegistrationFile_(request.token, request.registrationId, request.fileType);
        break;

      case 'getRegistrationWhatsAppPayload':
        result = getRegistrationWhatsAppPayload_(request.token, request.registrationId);
        break;

      case 'approveStudentRegistration':
        result = approveStudentRegistration_(request.token, request.approval);
        break;

      case 'rejectStudentRegistration':
        result = rejectStudentRegistration_(request.token, request.rejection || {
          registrationId: request.registrationId,
          note: request.note || ''
        });
        break;

      case 'getStudentOverview':
        result = getStudentOverview_(request.token);
        break;

      case 'completeLearningActivityRead':
        result = completeLearningActivityRead_(
          request.token,
          request.meetingNumber
        );
        break;

      case 'submitPaymentConfirmation':
        result = submitPaymentConfirmation_(request.token, request.payment);
        break;

      case 'getPaymentConfirmations':
        result = getPaymentConfirmations_(request.token);
        break;

      case 'getPaymentProof':
        result = getPaymentProof_(request.token, request.confirmationId);
        break;

      case 'reviewPaymentConfirmation':
        result = reviewPaymentConfirmation_(request.token, request.review);
        break;

      case 'addHistoricalPayment':
        result = addHistoricalPayment_(request.token, request.payment);
        break;

      case 'updatePaymentFulfillment':
        result = updatePaymentFulfillment_(request.token, request.fulfillment);
        break;

      case 'submitStudentAttendance':
        result = submitStudentAttendance_(
          request.token,
          request.latitude,
          request.longitude,
          request.accuracy
        );
        break;

      case 'getTutorDashboard':
        result = getTutorDashboard_(request.token);
        break;

      case 'saveTutorJournal':
        result = saveTutorJournal_(request.token, request.journal);
        break;

      case 'saveTutorLearningPlan':
        result = saveTutorLearningPlan_(request.token, request.learningPlan);
        break;

      case 'saveTutorStudentNote':
        result = saveTutorStudentNote_(request.token, request.note);
        break;

      case 'createTutorAssignment':
        result = createTutorAssignment_(request.token, request.assignment);
        break;

      case 'saveTutorAssessment':
        result = saveTutorAssessment_(request.token, request.assessment);
        break;

      case 'submitStudentAssignment':
        result = submitStudentAssignment_(request.token, request.submission);
        break;

      case 'reviewTutorAssignment':
        result = reviewTutorAssignment_(request.token, request.review);
        break;

      case 'createTutorChallenge':
        result = createTutorChallenge_(request.token, request.challenge);
        break;

      case 'submitStudentChallenge':
        result = submitStudentChallenge_(request.token, request.submission);
        break;

      case 'reviewTutorChallenge':
        result = reviewTutorChallenge_(request.token, request.review);
        break;

      case 'saveTutorClassAttendance':
        result = saveTutorClassAttendance_(request.token, request.attendance);
        break;

      case 'reviewAttendanceFollowUp':
        result = reviewAttendanceFollowUp_(
          request.token,
          request.followUp
        );
        break;

      default:
        throw new Error('Action API tidak dikenali.');
    }

    return createJsonResponse_(result);

  } catch (error) {
    console.error(error && error.stack ? error.stack : error);

    return createJsonResponse_({
      success: false,
      message:
        error && error.message
          ? error.message
          : 'Terjadi kesalahan pada server.'
    });
  }
}

function requireRegistrationAdmin_(token) {
  const session = getSession_(token);
  const role = String(session.role || '').trim().toLowerCase();
  if (role !== 'admin' && role !== 'ceo') throw new Error('Hanya Admin atau CEO yang dapat mengelola pendaftaran.');
  return session;
}

function getOrCreateStudentRegistrationSheet_() {
  const database = getDatabase_();
  let sheet = database.getSheetByName('Student Registrations');
  const headers = [
    'Registration ID', 'Registered At', 'Full Name', 'DOB', 'School', 'Grade', 'Address', 'WA Student', 'WA Parent',
    'Requested Program', 'Requested Class ID', 'Requested Schedule',
    'First Tuition Amount', 'Book Package', 'Book Amount', 'ID Card', 'ID Card Amount', 'Total Amount', 'Transfer Bank',
    'Payment Proof File ID', 'Payment Proof File Name', 'Payment Proof MIME Type',
    'ID Photo File ID', 'ID Photo File Name', 'ID Photo MIME Type',
    'Payment Status',
    'Username', 'Password Hash', 'Password Salt', 'Status', 'Admin Note', 'Student ID', 'Class ID', 'Reviewed At'
  ];
  if (!sheet) {
    sheet = database.insertSheet('Student Registrations');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    ensureHeaders_(sheet, headers);
  }
  return sheet;
}

function appendMappedRow_(sheet, values) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0].map(function (header) { return String(header).trim(); });
  sheet.appendRow(headers.map(function (header) { return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : ''; }));
}

function validateNewPassword_(password) {
  if (String(password || '').length < 8) throw new Error('Password minimal 8 karakter.');
}

function assertUsernameAvailable_(username) {
  const usersSheet = getDatabase_().getSheetByName('Users');
  if (!usersSheet) throw new Error('Sheet Users tidak ditemukan.');
  if (findUserByUsername_(usersSheet, username)) throw new Error('Username sudah digunakan. Silakan pilih username lain.');
  return usersSheet;
}

function getOrCreateStudentUsersSheet_() {
  const database = getDatabase_();
  let sheet = database.getSheetByName('Users');
  const headers = ['User ID','Username','Password Hash','Role','Related ID','Full Name','Status','Created At','Last Login','Password Salt','Must Change Password','WhatsApp'];
  if (!sheet) { sheet = database.insertSheet('Users'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  else ensureHeaders_(sheet, headers);
  return sheet;
}

function normalizeStudentActivationName_(value) {
  let normalized = String(value || '');

  // Samakan variasi karakter dari hasil copy-paste HP/Google Sheets.
  // Termasuk non-breaking space, zero-width character, tanda baca, dan aksen.
  try {
    normalized = normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    // String.normalize tersedia pada runtime V8; fallback tetap aman bila tidak ada.
  }

  return normalized
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getStudentActivationNameError_(storedName, submittedName) {
  const stored = normalizeStudentActivationName_(storedName);
  const submitted = normalizeStudentActivationName_(submittedName);

  if (stored === submitted) return '';

  const storedWords = stored ? stored.split(' ') : [];
  const submittedWords = submitted ? submitted.split(' ') : [];
  const isIncompletePrefix = submittedWords.length > 0 &&
    submittedWords.length < storedWords.length &&
    submittedWords.every(function (word, index) {
      return word === storedWords[index];
    });

  if (isIncompletePrefix) {
    return 'Nama belum lengkap. Masukkan seluruh nama sampai nama belakang sesuai Data Siswa.';
  }

  return 'Nama lengkap tidak sesuai dengan Data Siswa. Salin nama langsung dari Data Siswa tanpa disingkat.';
}

function activateStudentAccount_(activation) {
  activation = activation || {};
  const studentId = String(activation.studentId || '').trim().toUpperCase();
  const fullName = String(activation.fullName || '').trim();
  const dob = String(activation.dob || '').trim();
  const phone = String(activation.phone || '').replace(/\D/g, '');
  const username = studentId;
  const password = String(activation.password || '');

  if (!studentId || !fullName) throw new Error('Lengkapi Student ID dan nama lengkap.');
  validateNewPassword_(password);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const database = getDatabase_();
    const studentSheet = database.getSheetByName('Data Siswa');
    if (!studentSheet) throw new Error('Sheet Data Siswa tidak ditemukan.');

    const student = getSheetObjects_(studentSheet).find(function (item) {
      return String(getObjectValue_(item, ['Student ID']) || '').trim().toUpperCase() === studentId;
    });
    if (!student) throw new Error('Student ID tidak ditemukan pada Data Siswa. Silakan hubungi Admin Mr One Course.');

    const storedName = String(getObjectValue_(student, ['Full Name', 'Nama']) || '').trim();
    const nameError = getStudentActivationNameError_(storedName, fullName);
    if (nameError) throw new Error(nameError);

    const usersSheet = getOrCreateStudentUsersSheet_();
    const existing = getSheetObjects_(usersSheet).some(function (item) {
      return String(getObjectValue_(item, ['Related ID', 'Username']) || '').trim().toUpperCase() === studentId ||
             String(getObjectValue_(item, ['Username']) || '').trim().toUpperCase() === studentId;
    });
    if (existing) throw new Error('Akun untuk Student ID ini sudah aktif. Silakan langsung Sign In atau gunakan Lupa Password.');

    const salt = Utilities.getUuid();
    appendMappedRow_(usersSheet, {
      'User ID': studentId,
      'Username': username,
      'Password Hash': hashPassword_(password, salt),
      'Role': 'Siswa',
      'Related ID': studentId,
      'Full Name': storedName,
      'Status': 'Aktif',
      'Created At': new Date(),
      'Last Login': '',
      'Password Salt': salt,
      'Must Change Password': 'Tidak',
      'WhatsApp': phone
    });

    ensureHeaders_(studentSheet, ['DOB', 'WA Account', 'Account Status', 'Last Updated']);
    const headers = studentSheet.getRange(1, 1, 1, studentSheet.getLastColumn()).getDisplayValues()[0].map(function (header) {
      return String(header).trim();
    });

    if (dob && headers.indexOf('DOB') > -1) {
      studentSheet.getRange(student._rowNumber, headers.indexOf('DOB') + 1).setValue(dob);
    }
    if (phone && headers.indexOf('WA Account') > -1) {
      studentSheet.getRange(student._rowNumber, headers.indexOf('WA Account') + 1).setValue(phone);
    }
    if (headers.indexOf('Account Status') > -1) {
      studentSheet.getRange(student._rowNumber, headers.indexOf('Account Status') + 1).setValue('Aktif');
    }
    if (headers.indexOf('Last Updated') > -1) {
      studentSheet.getRange(student._rowNumber, headers.indexOf('Last Updated') + 1).setValue(new Date());
    }

    clearFailedLogin_(username);
    return {
      success: true,
      username: username,
      fullName: storedName,
      whatsapp: phone,
      dob: dob,
      message: 'Akun berhasil diaktifkan. Username Anda adalah ' + username + '.'
    };
  } finally {
    lock.releaseLock();
  }
}


function normalizeRegistrationProgram_(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return '';
  if (text.indexOf('primary') >= 0 || text.indexOf('pre-primary') >= 0 || /\bpri\b/.test(text)) return 'Primary';
  if (text.indexOf('grammar') >= 0 || /\bgrm\b/.test(text) || /\bgra\b/.test(text)) return 'Grammar';
  if (text.indexOf('speaking') >= 0 || /\bspk\b/.test(text) || /\bspa\b/.test(text)) return 'Speaking';
  if (text.indexOf('toefl') >= 0) return 'TOEFL';
  return '';
}

function inferRegistrationProgram_(classId, className, directProgram, studentProgram) {
  const direct = normalizeRegistrationProgram_(directProgram);
  if (direct) return direct;

  const known = normalizeRegistrationProgram_(studentProgram);
  if (known) return known;

  return normalizeRegistrationProgram_(String(classId || '') + ' ' + String(className || ''));
}

function formatRegistrationScheduleTime_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, 'Asia/Makassar', 'HH.mm');
  const text = String(value || '').trim();
  if (!text) return '';
  const match = text.match(/(\d{1,2})[:.](\d{2})/);
  if (match) return String(match[1]).padStart(2, '0') + '.' + match[2];
  return text;
}

function slugRegistrationClassId_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


function debugMasterJadwalRegistration() {
  const quotaSync = syncMasterJadwalRemainingQuota_();
  Logger.log('QUOTA SYNC: ' + JSON.stringify(quotaSync));

  const database = getDatabase_();
  const sheet =
    database.getSheetByName('Master Jadwal') ||
    database.getSheetByName('Master_Jadwal');

  if (!sheet) {
    Logger.log('Master Jadwal tidak ditemukan.');
    return;
  }

  const rows = sheet
    .getRange(
      1,
      1,
      Math.min(sheet.getLastRow(), 30),
      Math.min(sheet.getLastColumn(), 12)
    )
    .getDisplayValues();

  Logger.log(JSON.stringify({
    sheetName: sheet.getName(),
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    structure: {
      A: 'Class ID',
      B: 'Program',
      C: 'Nama kelas',
      D: 'Kuota Maks',
      E: 'Tutor ID',
      F: 'Tutor',
      G: 'Link WAG',
      H: 'Hari',
      I: 'Mulai',
      J: 'Selesai',
      K: 'Sisa Kuota',
      L: 'Status'
    },
    rows: rows
  }, null, 2));

  ['Primary', 'Grammar', 'Speaking', 'TOEFL']
    .forEach(function (program) {
      Logger.log(
        program + ': ' +
        JSON.stringify(
          getRegistrationSchedules_(program)
        )
      );
    });
}

function syncMasterJadwalRemainingQuota_() {
  const database = getDatabase_();

  const scheduleSheet =
    database.getSheetByName('Master Jadwal') ||
    database.getSheetByName('Master_Jadwal');

  const studentSheet =
    database.getSheetByName('Data Siswa') ||
    database.getSheetByName('Data_Siswa');

  if (!scheduleSheet) {
    throw new Error('Sheet Master Jadwal tidak ditemukan.');
  }

  const lastRow = scheduleSheet.getLastRow();

  // Master Jadwal belum punya data kelas.
  if (lastRow < 2) {
    return {
      success: true,
      updatedRows: 0,
      classes: 0
    };
  }

  // Hitung JUMLAH SISWA yang ada di Data Siswa berdasarkan Class ID.
  // Tidak mengambil angka dari kolom K dan tidak bergantung pada status siswa.
  const studentsByClass = {};

  if (studentSheet) {
    getSheetObjects_(studentSheet).forEach(function (student) {
      const classId = String(
        getObjectValue_(student, [
          'Class ID',
          'Class Id',
          'Kode Kelas'
        ]) || ''
      ).trim().toUpperCase();

      if (classId) {
        studentsByClass[classId] =
          (studentsByClass[classId] || 0) + 1;
      }
    });
  }

  // Struktur Master Jadwal:
  // A Class ID | D Kuota Maks | K Sisa Kuota
  const raw = scheduleSheet
    .getRange(2, 1, lastRow - 1, 12)
    .getDisplayValues();

  const remainingValues = [];
  const seenClasses = {};

  raw.forEach(function (row) {
    const classId = String(row[0] || '').trim().toUpperCase();
    const maxQuotaText = String(row[3] || '').trim();
    const maxQuotaClean = maxQuotaText.replace(/[^\d.-]/g, '');
    const maxQuotaNumber =
      maxQuotaClean === '' ? 25 : Number(maxQuotaClean);

    const maxQuota =
      isNaN(maxQuotaNumber) ? 25 : maxQuotaNumber;

    const studentCount =
      classId ? (studentsByClass[classId] || 0) : 0;

    const remaining =
      classId ? Math.max(0, maxQuota - studentCount) : '';

    remainingValues.push([remaining]);

    if (classId) {
      seenClasses[classId] = {
        classId: classId,
        maxQuota: maxQuota,
        studentCount: studentCount,
        remaining: remaining
      };
    }
  });

  // Tulis otomatis ke kolom K (Sisa Kuota).
  scheduleSheet
    .getRange(2, 11, remainingValues.length, 1)
    .setValues(remainingValues);

  return {
    success: true,
    updatedRows: remainingValues.length,
    classes: Object.keys(seenClasses).length,
    details: Object.keys(seenClasses).map(function (key) {
      return seenClasses[key];
    })
  };
}

function refreshMasterJadwalQuota() {
  return syncMasterJadwalRemainingQuota_();
}

function getRegistrationSchedules_(program) {
  // Endpoint ini dipanggil sebelum siswa login.
  // Karena itu hanya READ dari Spreadsheet; tidak melakukan setValues().
  const wantedProgram = normalizeRegistrationProgram_(program);
  if (!wantedProgram) {
    return { success: true, program: '', schedules: [] };
  }

  const database = getDatabase_();
  const scheduleSheet =
    database.getSheetByName('Master Jadwal') ||
    database.getSheetByName('Master_Jadwal');

  if (!scheduleSheet) {
    throw new Error('Sheet Master Jadwal tidak ditemukan.');
  }

  const lastRow = scheduleSheet.getLastRow();
  const lastColumn = scheduleSheet.getLastColumn();

  // Hitung jumlah siswa dari Data Siswa berdasarkan Class ID, hanya di memori.
  const studentSheet =
    database.getSheetByName('Data Siswa') ||
    database.getSheetByName('Data_Siswa');

  const studentCountByClassId = {};

  if (studentSheet) {
    getSheetObjects_(studentSheet).forEach(function (student) {
      const studentClassId = String(
        getObjectValue_(student, [
          'Class ID',
          'Class Id',
          'Kode Kelas'
        ]) || ''
      ).trim().toUpperCase();

      if (studentClassId) {
        studentCountByClassId[studentClassId] =
          (studentCountByClassId[studentClassId] || 0) + 1;
      }
    });
  }

  if (lastRow < 2 || lastColumn < 12) {
    return {
      success: true,
      program: wantedProgram,
      schedules: [],
      message: 'Master Jadwal belum memiliki struktur A–L yang lengkap.'
    };
  }

  // =========================================================
  // STRUKTUR MASTER JADWAL AKTUAL
  // A = Class ID
  // B = Program
  // C = Nama kelas
  // D = Kuota Maks
  // E = Tutor ID
  // F = Tutor
  // G = Link WAG
  // H = Hari
  // I = Mulai
  // J = Selesai
  // K = Sisa Kuota
  // L = Status
  // =========================================================
  const raw = scheduleSheet
    .getRange(2, 1, lastRow - 1, 12)
    .getDisplayValues();

  const groups = {};

  raw.forEach(function (row) {
    const classId = String(row[0] || '').trim();
    const programText = String(row[1] || '').trim();
    const className = String(row[2] || '').trim();
    const maxQuotaText = String(row[3] || '').trim();
    const tutorId = String(row[4] || '').trim();
    const tutor = String(row[5] || '').trim();
    const groupLink = String(row[6] || '').trim();
    const day = String(row[7] || '').trim();
    const startTime = String(row[8] || '').trim();
    const endTime = String(row[9] || '').trim();
    const remainingText = String(row[10] || '').trim();
    const status = String(row[11] || '').trim().toLowerCase();

    if (!classId || !programText || !className) return;

    const rowProgram = normalizeRegistrationProgram_(programText);
    if (rowProgram !== wantedProgram) return;

    if (status && status !== 'aktif' && status !== 'active') return;

    const maxQuotaClean = maxQuotaText.replace(/[^\d.-]/g, '');
    const maxQuotaNumber = maxQuotaClean === '' ? 25 : Number(maxQuotaClean);
    const maxQuota = isNaN(maxQuotaNumber) ? 25 : maxQuotaNumber;

    const currentStudentCount =
      studentCountByClassId[classId.toUpperCase()] || 0;

    // Sisa kuota dihitung langsung:
    // Kuota Maks - jumlah siswa di Data Siswa dengan Class ID sama.
    const remaining =
      Math.max(0, maxQuota - currentStudentCount);

    if (remaining <= 0) return;

    if (!groups[classId]) {
      groups[classId] = {
        classId: classId,
        className: className,
        program: rowProgram,
        maxQuota: maxQuota,
        remaining: remaining,
        groupLink: groupLink,
        tutorId: tutorId,
        tutor: tutor,
        scheduleParts: []
      };
    } else {
      groups[classId].remaining = Math.min(
        Number(groups[classId].remaining || remaining),
        remaining
      );
      if (!groups[classId].groupLink && groupLink) groups[classId].groupLink = groupLink;
      if (!groups[classId].tutor && tutor) groups[classId].tutor = tutor;
      if (!groups[classId].tutorId && tutorId) groups[classId].tutorId = tutorId;
    }

    const timeText =
      startTime && endTime
        ? startTime + '–' + endTime
        : (startTime || endTime);

    const part = [day, timeText].filter(Boolean).join(' ');

    if (
      part &&
      groups[classId].scheduleParts.indexOf(part) === -1
    ) {
      groups[classId].scheduleParts.push(part);
    }
  });

  const schedules = Object.keys(groups)
    .map(function (classId) {
      const item = groups[classId];

      return {
        classId: item.classId,
        className: item.className,
        program: item.program,
        maxQuota: item.maxQuota,
        remaining: item.remaining,
        groupLink: item.groupLink,
        tutorId: item.tutorId,
        tutor: item.tutor,
        schedule: item.scheduleParts.join(' & '),
        label:
          item.className +
          ' • ' +
          (item.scheduleParts.join(' & ') || item.classId)
      };
    })
    .sort(function (a, b) {
      return a.label.localeCompare(b.label, 'id');
    });

  return {
    success: true,
    program: wantedProgram,
    schedules: schedules,
    source: 'Master Jadwal A:L',
    selectionFlow: 'Program -> Jadwal -> Class ID',
    quotaSource: 'READ ONLY: Kuota Maks - jumlah Data Siswa per Class ID',
    publicReadOnly: true,
    rowsRead: raw.length
  };
}

function setupRegistrationUploadFolderV44() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty('REGISTRATION_UPLOAD_FOLDER_ID');

  if (existingId) {
    try {
      const existing = DriveApp.getFolderById(existingId);
      return {
        success: true,
        folderId: existing.getId(),
        folderName: existing.getName(),
        message: 'Folder upload pendaftaran sudah siap.'
      };
    } catch (error) {}
  }

  const folder = DriveApp.createFolder('MOC Student Registration Uploads');
  properties.setProperty('REGISTRATION_UPLOAD_FOLDER_ID', folder.getId());

  return {
    success: true,
    folderId: folder.getId(),
    folderName: folder.getName(),
    message: 'Folder upload pendaftaran berhasil dibuat.'
  };
}

function getRegistrationUploadFolder_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty('REGISTRATION_UPLOAD_FOLDER_ID');

  if (!existingId) {
    throw new Error('Folder upload pendaftaran belum disiapkan oleh Admin. Jalankan setupRegistrationUploadFolderV44() satu kali di Apps Script.');
  }

  try {
    return DriveApp.getFolderById(existingId);
  } catch (error) {
    throw new Error('Folder upload pendaftaran tidak dapat diakses. Jalankan kembali setupRegistrationUploadFolderV44() di Apps Script.');
  }
}

function saveRegistrationUpload_(registrationId, payload, kind, allowedTypes) {
  payload = payload || {};
  const mimeType = String(payload.mimeType || '').toLowerCase();
  const base64 = String(payload.base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!base64) throw new Error(kind + ' belum dipilih.');
  if (allowedTypes.indexOf(mimeType) === -1) throw new Error('Format file ' + kind + ' tidak didukung.');
  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > 4 * 1024 * 1024) throw new Error('Ukuran ' + kind + ' maksimal 4 MB.');
  const safeName = String(payload.fileName || kind).replace(/[^a-zA-Z0-9._-]/g, '-');
  const file = getRegistrationUploadFolder_().createFile(Utilities.newBlob(bytes, mimeType, registrationId + '-' + kind.replace(/\s+/g, '-') + '-' + safeName));
  return { fileId: file.getId(), fileName: safeName, mimeType: mimeType, url: file.getUrl() };
}

function getRegistrationFile_(token, registrationId, fileType) {
  requireRegistrationAdmin_(token);
  const sheet = getOrCreateStudentRegistrationSheet_();
  const item = getSheetObjects_(sheet).find(function (row) {
    return String(getObjectValue_(row, ['Registration ID']) || '') === String(registrationId || '');
  });
  if (!item) throw new Error('Pendaftaran tidak ditemukan.');

  const isPhoto = String(fileType || '').toLowerCase() === 'photo';
  const fileId = String(getObjectValue_(item, [isPhoto ? 'ID Photo File ID' : 'Payment Proof File ID']) || '').trim();
  const mimeType = String(getObjectValue_(item, [isPhoto ? 'ID Photo MIME Type' : 'Payment Proof MIME Type']) || '').trim();
  if (!fileId) throw new Error(isPhoto ? 'Foto ID Card belum tersedia.' : 'Bukti pembayaran belum tersedia.');

  const bytes = DriveApp.getFileById(fileId).getBlob().getBytes();
  return { success: true, mimeType: mimeType || 'image/jpeg', base64: Utilities.base64Encode(bytes) };
}

function registerStudent_(registration) {
  registration = registration || {};

  const fullName = String(registration.fullName || '').trim();
  const waParent = String(registration.waParent || '').replace(/\D/g, '');
  const school = String(registration.school || '').trim();
  const grade = String(registration.grade || '').trim();
  const program = String(registration.program || '').trim();
  const classId = String(registration.classId || '').trim();
  const schedule = String(registration.schedule || '').trim();
  const transferBank = String(registration.transferBank || '').trim();
  const showBook = /^(primary|grammar)$/i.test(program);
  const bookPackage = showBook && !!registration.bookPackage;
  const idCard = !!registration.idCard;
  const tuitionAmount = 150000;
  const bookAmount = bookPackage ? 150000 : 0;
  const idCardAmount = idCard ? 20000 : 0;
  const totalAmount = tuitionAmount + bookAmount + idCardAmount;

  if (!fullName || waParent.length < 8 || !school || !grade || !program || !classId || !schedule) {
    throw new Error('Lengkapi nama lengkap, sekolah, kelas, program, nomor WhatsApp orang tua, dan pilihan jadwal.');
  }
  if (['BCA', 'SeaBank', 'BPD Kaltimtara', 'GoPay / DANA'].indexOf(transferBank) === -1) {
    throw new Error('Pilih rekening tujuan pembayaran.');
  }

  const available = getRegistrationSchedules_(program).schedules || [];
  const selectedSchedule = available.find(function (item) {
    return String(item.classId || '').toUpperCase() === classId.toUpperCase();
  });
  if (!selectedSchedule) throw new Error('Jadwal yang dipilih sudah tidak tersedia. Silakan pilih jadwal lain.');

  const sheet = getOrCreateStudentRegistrationSheet_();
  const normalizedName = normalizeStudentActivationName_(fullName);

  const pending = getSheetObjects_(sheet).some(function (item) {
    const itemName = normalizeStudentActivationName_(getObjectValue_(item, ['Full Name']) || '');
    const itemWa = String(getObjectValue_(item, ['WA Parent']) || '').replace(/\D/g, '');
    const status = String(getObjectValue_(item, ['Status']) || '').trim().toLowerCase();
    return itemName === normalizedName && itemWa === waParent && status === 'menunggu verifikasi';
  });

  if (pending) throw new Error('Pendaftaran dengan nama dan nomor WhatsApp tersebut sedang menunggu verifikasi Admin.');

  const now = new Date();
  const registrationId = 'REG-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss');

  const proofUpload = saveRegistrationUpload_(registrationId, registration.paymentProof, 'Bukti-Pembayaran', ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  let photoUpload = { fileId: '', fileName: '', mimeType: '', url: '' };
  if (idCard) {
    photoUpload = saveRegistrationUpload_(registrationId, registration.idCardPhoto, 'Foto-ID-Card', ['image/jpeg', 'image/png', 'image/webp']);
  }

  appendMappedRow_(sheet, {
    'Registration ID': registrationId,
    'Registered At': now,
    'Full Name': fullName,
    'DOB': registration.dob ? new Date(String(registration.dob) + 'T00:00:00+08:00') : '',
    'School': school,
    'Grade': grade,
    'Address': String(registration.address || ''),
    'WA Student': String(registration.waStudent || ''),
    'WA Parent': String(registration.waParent || ''),
    'Requested Program': program,
    'Requested Class ID': classId,
    'Requested Schedule': selectedSchedule.label || schedule,
    'First Tuition Amount': tuitionAmount,
    'Book Package': bookPackage ? 'Ya' : 'Tidak',
    'Book Amount': bookAmount,
    'ID Card': idCard ? 'Ya' : 'Tidak',
    'ID Card Amount': idCardAmount,
    'Total Amount': totalAmount,
    'Transfer Bank': transferBank,
    'Payment Proof File ID': proofUpload.fileId,
    'Payment Proof File Name': proofUpload.fileName,
    'Payment Proof MIME Type': proofUpload.mimeType,
    'ID Photo File ID': photoUpload.fileId,
    'ID Photo File Name': photoUpload.fileName,
    'ID Photo MIME Type': photoUpload.mimeType,
    'Payment Status': 'Menunggu Verifikasi',
    'Username': '',
    'Password Hash': '',
    'Password Salt': '',
    'Status': 'Menunggu Verifikasi',
    'Admin Note': '',
    'Student ID': '',
    'Class ID': '',
    'Reviewed At': ''
  });

  return {
    success: true,
    registrationId: registrationId,
    totalAmount: totalAmount,
    message: 'Pendaftaran dan bukti pembayaran berhasil dikirim. Admin akan memverifikasi data dan pembayaran. Setelah disetujui, Admin akan mengirim Student ID untuk Aktivasi Akun Belajar.'
  };
}

function getStudentRegistrations_(token) {
  requireRegistrationAdmin_(token);

  const database = getDatabase_();
  const sheet = getOrCreateStudentRegistrationSheet_();
  const studentSheet = database.getSheetByName('Data Siswa');
  const students = studentSheet ? getSheetObjects_(studentSheet) : [];

  const studentByRegistrationId = {};
  students.forEach(function (student) {
    const registrationId = String(getObjectValue_(student, ['Registration ID']) || '').trim();
    if (registrationId) studentByRegistrationId[registrationId] = student;
  });

  const registrations = getSheetObjects_(sheet).map(function (item) {
    const registrationId = String(getObjectValue_(item, ['Registration ID']) || '');
    const approvedStudent = studentByRegistrationId[registrationId] || null;

    return {
      registrationId: registrationId,
      registeredAt: String(getObjectValue_(item, ['Registered At']) || ''),
      fullName: String(getObjectValue_(item, ['Full Name']) || ''),
      dob: String(getObjectValue_(item, ['DOB']) || ''),
      school: String(getObjectValue_(item, ['School']) || ''),
      grade: String(getObjectValue_(item, ['Grade']) || ''),
      address: String(getObjectValue_(item, ['Address']) || ''),
      waStudent: String(getObjectValue_(item, ['WA Student']) || ''),
      waParent: String(getObjectValue_(item, ['WA Parent']) || ''),
      requestedProgram: String(getObjectValue_(item, ['Requested Program']) || ''),
      requestedClassId: String(getObjectValue_(item, ['Requested Class ID']) || ''),
      requestedSchedule: String(getObjectValue_(item, ['Requested Schedule']) || ''),
      firstTuitionAmount: Number(getObjectValue_(item, ['First Tuition Amount']) || 0),
      bookPackage: String(getObjectValue_(item, ['Book Package']) || 'Tidak'),
      bookAmount: Number(getObjectValue_(item, ['Book Amount']) || 0),
      idCard: String(getObjectValue_(item, ['ID Card']) || 'Tidak'),
      idCardAmount: Number(getObjectValue_(item, ['ID Card Amount']) || 0),
      totalAmount: Number(getObjectValue_(item, ['Total Amount']) || 0),
      transferBank: String(getObjectValue_(item, ['Transfer Bank']) || ''),
      paymentStatus: String(getObjectValue_(item, ['Payment Status']) || ''),
      status: String(getObjectValue_(item, ['Status']) || ''),
      adminNote: String(getObjectValue_(item, ['Admin Note']) || ''),
      studentId: approvedStudent
        ? String(getObjectValue_(approvedStudent, ['Student ID']) || '')
        : String(getObjectValue_(item, ['Student ID']) || ''),
      classId: approvedStudent
        ? String(getObjectValue_(approvedStudent, ['Class ID', 'Class Id']) || '')
        : String(getObjectValue_(item, ['Class ID']) || '')
    };
  }).sort(function (a, b) {
    return String(b.registeredAt).localeCompare(String(a.registeredAt));
  });

  return { success: true, registrations: registrations };
}


function getRegistrationClassWhatsApp_(classId) {
  const database = getDatabase_();
  const scheduleSheet =
    database.getSheetByName('Master Jadwal') ||
    database.getSheetByName('Master_Jadwal');

  if (!scheduleSheet) return '';

  const target = String(classId || '').trim().toUpperCase();
  const lastRow = scheduleSheet.getLastRow();

  if (lastRow < 2) return '';

  const raw = scheduleSheet
    .getRange(2, 1, lastRow - 1, 12)
    .getDisplayValues();

  for (let index = 0; index < raw.length; index++) {
    const rowClassId = String(raw[index][0] || '')
      .trim()
      .toUpperCase();

    if (rowClassId !== target) continue;

    const groupLink = String(raw[index][6] || '').trim();

    if (groupLink) return groupLink;
  }

  return '';
}

function getRegistrationWhatsAppPayload_(token, registrationId) {
  requireRegistrationAdmin_(token);

  const database = getDatabase_();
  const sheet = getOrCreateStudentRegistrationSheet_();
  const rows = getSheetObjects_(sheet);
  const item = rows.find(function (row) {
    return String(getObjectValue_(row, ['Registration ID']) || '') === String(registrationId || '');
  });
  if (!item) throw new Error('Pendaftaran tidak ditemukan.');

  const status = String(getObjectValue_(item, ['Status']) || '').trim();
  const statusKey = status.toLowerCase();
  const adminNote = String(getObjectValue_(item, ['Admin Note']) || '').trim();

  const studentSheet = database.getSheetByName('Data Siswa');
  const approvedStudent = studentSheet
    ? getSheetObjects_(studentSheet).find(function (student) {
        return String(getObjectValue_(student, ['Registration ID']) || '').trim() === String(registrationId || '').trim();
      })
    : null;

  const fullName = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['Full Name', 'Nama'])
      : getObjectValue_(item, ['Full Name'])
  || '').trim();

  const waStudent = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['WA Student', 'WA Siswa', 'WhatsApp'])
      : getObjectValue_(item, ['WA Student'])
  || '').trim();

  const waParent = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['WA Parent', 'WA Orang Tua'])
      : getObjectValue_(item, ['WA Parent'])
  || '').trim();

  if (statusKey === 'ditolak' || statusKey === 'rejected') {
    if (!adminNote) throw new Error('Alasan penolakan belum tersedia.');

    const rejectionMessage =
      'Halo ' + fullName + ' 👋\\n\\n' +
      'Terima kasih sudah mendaftar di *Mr One Course*.\\n\\n' +
      'Setelah kami melakukan verifikasi, pendaftaran saat ini belum dapat kami setujui.\\n\\n' +
      '*Alasan:* ' + adminNote + '\\n\\n' +
      'Silakan memperbaiki atau melengkapi data yang diperlukan. Setelah itu, Anda dapat menghubungi Manajemen Mr One Course untuk informasi lebih lanjut.\\n\\n' +
      'Terima kasih atas pengertiannya. 🙏';

    return {
      success: true,
      registrationId: registrationId,
      status: status,
      fullName: fullName,
      waStudent: waStudent,
      waParent: waParent,
      adminNote: adminNote,
      messageType: 'rejected',
      combinedMessage: rejectionMessage
    };
  }

  // Sesudah approval, Data Siswa menjadi sumber utama data operasional siswa.
  const studentId = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['Student ID'])
      : getObjectValue_(item, ['Student ID'])
  || '').trim().toUpperCase();

  const classId = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['Class ID', 'Class Id'])
      : getObjectValue_(item, ['Class ID', 'Requested Class ID'])
  || '').trim();

  const schedule = String(
    approvedStudent
      ? getObjectValue_(approvedStudent, ['Schedule', 'Jadwal'])
      : getObjectValue_(item, ['Requested Schedule'])
  || '').trim();

  const groupLink = getRegistrationClassWhatsApp_(classId);

  if (!studentId) throw new Error('Student ID belum tersedia. Setujui pendaftaran terlebih dahulu.');

  const approvalMessage =
    'Halo ' + fullName + ' 👋\\n\\n' +
    'Selamat! 🎉 Pendaftaran Anda di *Mr One Course* telah berhasil diverifikasi dan disetujui.\\n\\n' +
    '*Data Siswa*\\n' +
    'Student ID: ' + studentId + '\\n' +
    'Nama: ' + fullName + '\\n' +
    'Kelas: ' + (classId || '—') + '\\n' +
    (schedule ? 'Jadwal: ' + schedule + '\\n' : '') +
    '\\n*Grup WhatsApp Kelas*\\n' +
    (groupLink ? groupLink : 'Link grup belum tersedia. Manajemen akan menginformasikannya kemudian.') +
    '\\n\\n*Aktivasi Akun Belajar*\\n' +
    'Gunakan Student ID *' + studentId + '* untuk melakukan Aktivasi Akun Belajar di Mr One Course Academic Suite, lalu buat password Anda sendiri.\\n\\n' +
    'Selamat bergabung dan selamat belajar bersama Mr One Course! 🌟';

  return {
    success: true,
    registrationId: registrationId,
    status: status,
    studentId: studentId,
    fullName: fullName,
    waStudent: waStudent,
    waParent: waParent,
    classId: classId,
    schedule: schedule,
    groupLink: groupLink,
    messageType: 'approved',
    combinedMessage: approvalMessage
  };
}


function findReservedStudentRow_(studentSheet) {
  if (!studentSheet || studentSheet.getLastRow() < 2) return null;

  const rows = getSheetObjects_(studentSheet);

  for (let index = 0; index < rows.length; index++) {
    const item = rows[index];
    const studentId = String(getObjectValue_(item, ['Student ID', 'ID']) || '').trim().toUpperCase();
    const fullName = String(getObjectValue_(item, ['Full Name', 'Nama', 'Student Name']) || '').trim();
    const registrationId = String(getObjectValue_(item, ['Registration ID']) || '').trim();

    // Baris dianggap "slot siswa" yang masih kosong bila:
    // - Student ID sudah tersedia;
    // - nama siswa masih kosong;
    // - belum terhubung ke Registration ID lain.
    if (studentId && !fullName && !registrationId) {
      return {
        rowNumber: item._rowNumber,
        studentId: studentId
      };
    }
  }

  return null;
}

function writeMappedRowAt_(sheet, rowNumber, values) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (header) { return String(header).trim(); });

  Object.keys(values).forEach(function (header) {
    const column = headers.indexOf(header) + 1;
    if (column > 0) {
      sheet.getRange(rowNumber, column).setValue(values[header]);
    }
  });
}

function generateNextStudentId_(studentSheet) {
  const used = {};
  getSheetObjects_(studentSheet).forEach(function (item) {
    const id = String(getObjectValue_(item, ['Student ID', 'ID']) || '').trim().toUpperCase();
    const match = id.match(/^MOC(\d+)$/);
    if (match) used[Number(match[1])] = true;
  });

  let number = 1;
  while (used[number]) number += 1;
  return 'MOC' + String(number).padStart(3, '0');
}

function approveStudentRegistration_(token, approval) {
  requireRegistrationAdmin_(token);
  approval = approval || {};

  const registrationId = String(approval.registrationId || '').trim();
  let studentId = String(approval.studentId || '').trim().toUpperCase();
  const program = String(approval.program || '').trim();
  const classId = String(approval.classId || '').trim();
  const schedule = String(approval.schedule || '').trim();

  if (!registrationId || !program || !classId || !schedule) {
    throw new Error('Program, kelas, dan jadwal wajib diisi.');
  }

  const database = getDatabase_();
  const registrationSheet = getOrCreateStudentRegistrationSheet_();
  const registrationRows = getSheetObjects_(registrationSheet);
  const index = registrationRows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Registration ID']) || '') === registrationId;
  });

  if (index < 0) throw new Error('Pendaftaran tidak ditemukan.');

  const registration = registrationRows[index];
  if (String(getObjectValue_(registration, ['Status']) || '').toLowerCase() !== 'menunggu verifikasi') {
    throw new Error('Pendaftaran ini sudah diproses.');
  }

  const studentSheet = database.getSheetByName('Data Siswa');
  if (!studentSheet) throw new Error('Sheet Data Siswa tidak ditemukan.');

  ensureHeaders_(studentSheet, [
    'Registration ID',
    'Student ID',
    'Full Name',
    'DOB',
    'Address',
    'School',
    'Grade',
    'WA Student',
    'WA Parent',
    'Program',
    'Class ID',
    'Schedule',
    'Photo Link',
    'Student Status',
    'Account Status',
    'Join Date',
    'Last Updated'
  ]);

  const existingStudents = getSheetObjects_(studentSheet);
  let reservedRow = null;

  // Jika Admin tidak mengisi Student ID manual, gunakan dulu Student ID
  // yang sudah tersedia pada baris kosong di Data Siswa.
  if (!studentId) {
    reservedRow = findReservedStudentRow_(studentSheet);

    if (reservedRow) {
      studentId = reservedRow.studentId;
    } else {
      studentId = generateNextStudentId_(studentSheet);
    }
  } else {
    // Jika ID diisi manual dan ID itu memang ada pada baris kosong,
    // baris tersebut boleh dipakai. Bila sudah berisi siswa, tolak.
    const matchingRow = existingStudents.find(function (item) {
      return String(getObjectValue_(item, ['Student ID', 'ID']) || '').trim().toUpperCase() === studentId;
    });

    if (matchingRow) {
      const matchingName = String(getObjectValue_(matchingRow, ['Full Name', 'Nama', 'Student Name']) || '').trim();
      const matchingRegistrationId = String(getObjectValue_(matchingRow, ['Registration ID']) || '').trim();

      if (matchingName || matchingRegistrationId) {
        throw new Error('Student ID sudah digunakan.');
      }

      reservedRow = {
        rowNumber: matchingRow._rowNumber,
        studentId: studentId
      };
    }
  }

  const studentValues = {
    'Registration ID': registrationId,
    'Student ID': studentId,
    'Full Name': getObjectValue_(registration, ['Full Name']),
    'DOB': getObjectValue_(registration, ['DOB']),
    'Address': getObjectValue_(registration, ['Address']),
    'School': getObjectValue_(registration, ['School']),
    'Grade': getObjectValue_(registration, ['Grade']),
    'WA Student': getObjectValue_(registration, ['WA Student']),
    'WA Parent': getObjectValue_(registration, ['WA Parent']),
    'Program': program,
    'Class ID': classId,
    'Schedule': schedule,
    'Photo Link': (function () {
      const fileId = String(getObjectValue_(registration, ['ID Photo File ID']) || '').trim();
      return fileId ? DriveApp.getFileById(fileId).getUrl() : '';
    })(),
    'Student Status': 'Aktif',
    'Account Status': 'Belum Aktif',
    'Join Date': new Date(),
    'Last Updated': new Date()
  };

  if (reservedRow) {
    writeMappedRowAt_(studentSheet, reservedRow.rowNumber, studentValues);
  } else {
    appendMappedRow_(studentSheet, studentValues);
  }


  const paymentSheet = database.getSheetByName('Data Pembayaran');
  if (paymentSheet) {
    ensureHeaders_(paymentSheet, ['Payment ID', 'Student ID', 'Nama', 'Payment Category', 'Item Label', 'Period', 'Payment Method', 'Payment Date', 'Amount', 'Status', 'Fulfillment Status', 'Verified Date', 'Verified By', 'Invoice Number', 'Notes']);
    const verifiedAt = new Date();
    const currentPeriod = Utilities.formatDate(verifiedAt, 'Asia/Makassar', 'yyyy-MM');
    const transferBank = String(getObjectValue_(registration, ['Transfer Bank']) || 'Transfer').trim();
    const baseId = 'REGPAY-' + Utilities.formatDate(verifiedAt, 'Asia/Makassar', 'yyyyMMddHHmmss') + '-' + studentId;

    appendMappedRow_(paymentSheet, {
      'Payment ID': baseId + '-T',
      'Student ID': studentId,
      'Nama': getObjectValue_(registration, ['Full Name']),
      'Payment Category': 'Tuition',
      'Item Label': 'Les Bulanan',
      'Period': currentPeriod,
      'Payment Method': transferBank,
      'Payment Date': verifiedAt,
      'Amount': Number(getObjectValue_(registration, ['First Tuition Amount']) || 150000),
      'Status': 'Lunas',
      'Fulfillment Status': '',
      'Verified Date': verifiedAt,
      'Verified By': 'Admin',
      'Invoice Number': registrationId,
      'Notes': 'Pembayaran awal dari pendaftaran siswa baru.'
    });
    markStudentMonthPaid_(database, studentId, currentPeriod);

    if (String(getObjectValue_(registration, ['Book Package']) || '').toLowerCase() === 'ya') {
      appendMappedRow_(paymentSheet, {
        'Payment ID': baseId + '-B',
        'Student ID': studentId,
        'Nama': getObjectValue_(registration, ['Full Name']),
        'Payment Category': 'Book Package',
        'Item Label': 'Paket 4 Buku Pendamping',
        'Period': '',
        'Payment Method': transferBank,
        'Payment Date': verifiedAt,
        'Amount': Number(getObjectValue_(registration, ['Book Amount']) || 150000),
        'Status': 'Lunas',
        'Fulfillment Status': 'Sedang Disiapkan',
        'Verified Date': verifiedAt,
        'Verified By': 'Admin',
        'Invoice Number': registrationId,
        'Notes': 'Pembelian buku saat pendaftaran.'
      });
    }

    if (String(getObjectValue_(registration, ['ID Card']) || '').toLowerCase() === 'ya') {
      appendMappedRow_(paymentSheet, {
        'Payment ID': baseId + '-I',
        'Student ID': studentId,
        'Nama': getObjectValue_(registration, ['Full Name']),
        'Payment Category': 'ID Card',
        'Item Label': 'ID Card Siswa',
        'Period': '',
        'Payment Method': transferBank,
        'Payment Date': verifiedAt,
        'Amount': Number(getObjectValue_(registration, ['ID Card Amount']) || 20000),
        'Status': 'Lunas',
        'Fulfillment Status': 'Sedang Disiapkan',
        'Verified Date': verifiedAt,
        'Verified By': 'Admin',
        'Invoice Number': registrationId,
        'Notes': 'Pembuatan ID Card saat pendaftaran.'
      });
    }
  }

  const headers = registrationSheet
    .getRange(1, 1, 1, registrationSheet.getLastColumn())
    .getDisplayValues()[0];

  const values = {
    'Status': 'Disetujui',
    'Payment Status': 'Terverifikasi',
    'Student ID': studentId,
    'Class ID': classId,
    'Admin Note': String(approval.note || ''),
    'Reviewed At': new Date()
  };

  Object.keys(values).forEach(function (header) {
    const column = headers.indexOf(header) + 1;
    if (column > 0) {
      registrationSheet.getRange(index + 2, column).setValue(values[header]);
    }
  });

  // Siswa baru sudah masuk Data Siswa → perbarui Sisa Kuota Master Jadwal.
  syncMasterJadwalRemainingQuota_();

  return {
    success: true,
    studentId: studentId,
    accountStatus: 'Belum Aktif',
    dataSiswaRowMode: reservedRow ? 'reserved-row' : 'appended-row',
    message:
      'Pendaftaran disetujui dan Student ID ' +
      studentId +
      (reservedRow
        ? ' telah menggunakan slot Student ID kosong yang tersedia di Data Siswa.'
        : ' telah ditambahkan pada baris terakhir Data Siswa.') +
      ' Akun login belum dibuat. Silakan sampaikan Student ID kepada siswa agar siswa melakukan Aktivasi Akun dan membuat password sendiri.'
  };
}

function rejectStudentRegistration_(token, rejection) {
  requireRegistrationAdmin_(token);
  rejection = rejection || {};

  const registrationId = String(rejection.registrationId || '').trim();
  const note = String(rejection.note || '').trim();

  if (!registrationId) throw new Error('Registration ID wajib diisi.');
  if (!note) throw new Error('Tuliskan alasan penolakan terlebih dahulu agar dapat disampaikan kepada pendaftar.');

  const sheet = getOrCreateStudentRegistrationSheet_();
  const rows = getSheetObjects_(sheet);
  const index = rows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Registration ID']) || '') === registrationId;
  });

  if (index < 0) throw new Error('Pendaftaran tidak ditemukan.');

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (header) { return String(header).trim(); });

  const values = {
    'Status': 'Ditolak',
    'Admin Note': note,
    'Reviewed At': new Date()
  };

  Object.keys(values).forEach(function (header) {
    const column = headers.indexOf(header) + 1;
    if (column > 0) sheet.getRange(index + 2, column).setValue(values[header]);
  });

  return {
    success: true,
    registrationId: registrationId,
    status: 'Ditolak',
    message: 'Pendaftaran ditolak. Alasan penolakan sudah disimpan dan siap dikirim melalui WhatsApp.'
  };
}



/**
 * =========================================================
 * V18 AUTHENTICATION REPAIR
 * =========================================================
 *
 * Tujuan:
 * - memastikan struktur Users lengkap;
 * - memastikan CEO / ADM1 tetap aktif bila sudah ada;
 * - membuat CEO / ADM1 hanya bila benar-benar belum ada;
 * - mereset TUT1 dan TUT2 ke kredensial final;
 * - menonaktifkan duplikat username sistem;
 * - menyiapkan kolom aktivasi seluruh siswa;
 * - membersihkan rate-limit login akun sistem.
 *
 * Kredensial tutor final:
 * TUT1 / Vita26
 * TUT2 / One26
 *
 * CEO / ADM1 yang SUDAH ADA tidak direset passwordnya.
 * Jika belum ada, sistem membuat password sementara dan menampilkannya di log.
 */
function repairAuthenticationSystemV18() {
  const database = getDatabase_();
  const usersSheet = getOrCreateStudentUsersSheet_();
  const studentSheet = database.getSheetByName('Data Siswa');

  if (!studentSheet) {
    throw new Error('Sheet Data Siswa tidak ditemukan.');
  }

  ensureHeaders_(usersSheet, [
    'User ID',
    'Username',
    'Password Hash',
    'Password Salt',
    'Role',
    'Related ID',
    'Full Name',
    'Status',
    'Must Change Password',
    'WhatsApp',
    'Created At',
    'Last Login'
  ]);

  ensureHeaders_(studentSheet, [
    'Student ID',
    'Full Name',
    'DOB',
    'WA Account',
    'Account Status',
    'Last Updated'
  ]);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const headers = usersSheet
      .getRange(1, 1, 1, usersSheet.getLastColumn())
      .getDisplayValues()[0]
      .map(function (header) {
        return String(header || '').trim();
      });

    function writeFields_(rowNumber, values) {
      Object.keys(values).forEach(function (header) {
        const column = headers.indexOf(header) + 1;
        if (column > 0) {
          usersSheet
            .getRange(rowNumber, column)
            .setValue(values[header]);
        }
      });
    }

    function findRowsByUsername_(username) {
      return getSheetObjects_(usersSheet).filter(function (user) {
        return String(user.Username || '')
          .trim()
          .toUpperCase() === String(username).trim().toUpperCase();
      });
    }

    function createSystemAccount_(account, password, mustChangePassword) {
      const salt = Utilities.getUuid();

      appendMappedRow_(usersSheet, {
        'User ID': account.userId,
        'Username': account.username,
        'Password Hash': hashPassword_(password, salt),
        'Password Salt': salt,
        'Role': account.role,
        'Related ID': account.relatedId,
        'Full Name': account.fullName,
        'Status': 'Aktif',
        'Must Change Password': mustChangePassword ? 'Ya' : 'Tidak',
        'WhatsApp': '',
        'Created At': new Date(),
        'Last Login': ''
      });
    }

    const result = {
      management: [],
      tutors: [],
      duplicatesDeactivated: [],
      studentActivation: {}
    };

    // CEO dan Admin: jangan ubah password bila akun sudah ada.
    [
      {
        userId: 'CEO',
        username: 'CEO',
        role: 'CEO',
        relatedId: 'CEO',
        fullName: 'Mr Mirwan'
      },
      {
        userId: 'ADM1',
        username: 'ADM1',
        role: 'Admin',
        relatedId: 'ADM1',
        fullName: 'Miss Sita'
      }
    ].forEach(function (account) {
      const rows = findRowsByUsername_(account.username);

      if (rows.length === 0) {
        const temporaryPassword = generateTemporaryPassword_();

        createSystemAccount_(
          account,
          temporaryPassword,
          true
        );

        result.management.push({
          username: account.username,
          status: 'Dibuat',
          temporaryPassword: temporaryPassword
        });
      } else {
        const primary = rows[0];

        writeFields_(primary._rowNumber, {
          'User ID': account.userId,
          'Username': account.username,
          'Role': account.role,
          'Related ID': account.relatedId,
          'Full Name': account.fullName,
          'Status': 'Aktif'
        });

        result.management.push({
          username: account.username,
          status: 'Dipertahankan',
          passwordChanged: false
        });

        rows.slice(1).forEach(function (duplicate) {
          writeFields_(duplicate._rowNumber, {
            'Status': 'Tidak Aktif'
          });

          result.duplicatesDeactivated.push({
            username: account.username,
            row: duplicate._rowNumber
          });
        });
      }

      clearFailedLogin_(account.username);
    });

    // Tutor: selalu reset ke password final agar login pasti sinkron.
    [
      {
        userId: 'TUT1',
        username: 'TUT1',
        password: 'Vita26',
        fullName: 'Miss Vita'
      },
      {
        userId: 'TUT2',
        username: 'TUT2',
        password: 'One26',
        fullName: 'Mr One'
      }
    ].forEach(function (account) {
      const rows = findRowsByUsername_(account.username);
      const salt = Utilities.getUuid();
      const values = {
        'User ID': account.userId,
        'Username': account.username,
        'Password Hash': hashPassword_(account.password, salt),
        'Password Salt': salt,
        'Role': 'Tutor',
        'Related ID': account.userId,
        'Full Name': account.fullName,
        'Status': 'Aktif',
        'Must Change Password': 'Tidak',
        'Created At': new Date(),
        'Last Login': ''
      };

      if (rows.length === 0) {
        appendMappedRow_(usersSheet, values);
        result.tutors.push({
          username: account.username,
          status: 'Dibuat/reset',
          passwordVerifiedForSetup: true
        });
      } else {
        writeFields_(rows[0]._rowNumber, values);

        rows.slice(1).forEach(function (duplicate) {
          writeFields_(duplicate._rowNumber, {
            'Status': 'Tidak Aktif'
          });

          result.duplicatesDeactivated.push({
            username: account.username,
            row: duplicate._rowNumber
          });
        });

        result.tutors.push({
          username: account.username,
          status: 'Dibuat/reset',
          passwordVerifiedForSetup: true
        });
      }

      clearFailedLogin_(account.username);
    });

    // ID tutor versi lama tidak boleh ikut terbaca sebagai akun aktif.
    ['TUT001', 'TUT002'].forEach(function (oldUsername) {
      findRowsByUsername_(oldUsername).forEach(function (oldUser) {
        writeFields_(oldUser._rowNumber, {
          'Status': 'Tidak Aktif'
        });
      });
      clearFailedLogin_(oldUsername);
    });

    // Audit kesiapan aktivasi siswa.
    const students = getSheetObjects_(studentSheet);
    const users = getSheetObjects_(usersSheet);
    const activeStudentIds = {};

    users.forEach(function (user) {
      if (
        String(user.Role || '')
          .trim()
          .toLowerCase() !== 'siswa'
      ) {
        return;
      }

      const relatedId = String(
        user['Related ID'] || user.Username || ''
      )
        .trim()
        .toUpperCase();

      if (relatedId) {
        activeStudentIds[relatedId] = true;
      }
    });

    let readyForActivation = 0;
    let alreadyActivated = 0;
    const incompleteStudents = [];

    students.forEach(function (student) {
      const studentId = String(
        getObjectValue_(student, ['Student ID']) || ''
      )
        .trim()
        .toUpperCase();

      const fullName = String(
        getObjectValue_(student, ['Full Name', 'Nama']) || ''
      ).trim();

      if (!studentId || !fullName) {
        incompleteStudents.push({
          row: student._rowNumber,
          studentId: studentId,
          fullName: fullName,
          issue: !studentId
            ? 'Student ID kosong'
            : 'Full Name/Nama kosong'
        });

        return;
      }

      if (activeStudentIds[studentId]) {
        alreadyActivated += 1;
      } else {
        readyForActivation += 1;
      }
    });

    result.studentActivation = {
      totalStudents: students.length,
      readyForActivation: readyForActivation,
      alreadyActivated: alreadyActivated,
      incompleteStudents: incompleteStudents
    };

    SpreadsheetApp.flush();

    Logger.log('=== V18 AUTH REPAIR SELESAI ===');
    Logger.log(JSON.stringify(result, null, 2));
    Logger.log('Tutor final: TUT1 / Vita26');
    Logger.log('Tutor final: TUT2 / One26');
    Logger.log(
      'Jika CEO/ADM1 baru dibuat, catat password sementara dari log secara pribadi.'
    );

    return {
      success: true,
      message: 'Sistem autentikasi V18 berhasil diperbaiki.',
      result: result
    };

  } finally {
    lock.releaseLock();
  }
}


/**
 * Audit tanpa mengubah password.
 * Jalankan setelah repairAuthenticationSystemV18().
 */
function auditAuthenticationSystemV18() {
  const database = getDatabase_();
  const usersSheet = database.getSheetByName('Users');
  const studentSheet = database.getSheetByName('Data Siswa');

  if (!usersSheet) {
    throw new Error('Sheet Users tidak ditemukan.');
  }

  if (!studentSheet) {
    throw new Error('Sheet Data Siswa tidak ditemukan.');
  }

  const users = getSheetObjects_(usersSheet);

  const systemAccounts = ['CEO', 'ADM1', 'TUT1', 'TUT2']
    .map(function (username) {
      const matches = users.filter(function (user) {
        return String(user.Username || '')
          .trim()
          .toUpperCase() === username;
      });

      const user = matches[0] || null;

      return {
        username: username,
        exists: Boolean(user),
        duplicateCount: Math.max(matches.length - 1, 0),
        role: user ? String(user.Role || '') : '',
        status: user ? String(user.Status || '') : '',
        hasPasswordHash: Boolean(
          user && String(user['Password Hash'] || '').trim()
        ),
        hasPasswordSalt: Boolean(
          user && String(user['Password Salt'] || '').trim()
        ),
        lastLogin: user ? String(user['Last Login'] || '') : ''
      };
    });

  const tutors = {
    TUT1: false,
    TUT2: false
  };

  const tut1 = users.find(function (user) {
    return String(user.Username || '').trim().toUpperCase() === 'TUT1';
  });

  const tut2 = users.find(function (user) {
    return String(user.Username || '').trim().toUpperCase() === 'TUT2';
  });

  if (tut1) {
    tutors.TUT1 = verifyPassword_(
      'Vita26',
      tut1['Password Salt'],
      tut1['Password Hash']
    );
  }

  if (tut2) {
    tutors.TUT2 = verifyPassword_(
      'One26',
      tut2['Password Salt'],
      tut2['Password Hash']
    );
  }

  const students = getSheetObjects_(studentSheet);

  const activationRows = students.map(function (student) {
    return {
      row: student._rowNumber,
      studentId: String(
        getObjectValue_(student, ['Student ID']) || ''
      ).trim(),
      fullName: String(
        getObjectValue_(student, ['Full Name', 'Nama']) || ''
      ).trim()
    };
  });

  const missingActivationData = activationRows.filter(function (item) {
    return !item.studentId || !item.fullName;
  });

  const result = {
    success: true,
    systemAccounts: systemAccounts,
    knownTutorPasswordCheck: tutors,
    studentActivation: {
      totalStudents: students.length,
      missingRequiredDataCount: missingActivationData.length,
      missingRequiredData: missingActivationData
    }
  };

  Logger.log('=== V18 AUTH AUDIT ===');
  Logger.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Membaca JSON yang dikirim frontend.
 */
function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Data permintaan tidak ditemukan.');
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Format permintaan harus berupa JSON.');
  }
}

/**
 * Proses login.
 */
function loginUser_(request) {
  const username = sanitizeText_(request.username);
  const password = String(request.password || '');

  if (!username || !password) {
    throw new Error('Username dan password wajib diisi.');
  }

  checkLoginRateLimit_(username);

  const spreadsheet = getDatabase_();
  const usersSheet = spreadsheet.getSheetByName('Users');

  if (!usersSheet) {
    throw new Error('Sistem akun belum tersedia.');
  }

  const user = findUserByUsername_(usersSheet, username);

  if (!user) {
    registerFailedLogin_(username);
    throw new Error('Username atau password tidak sesuai.');
  }

  const accountStatus = String(user.Status || '')
    .trim()
    .toLowerCase();

  if (accountStatus !== 'aktif') {
    throw new Error('Akun sedang tidak aktif.');
  }

  const passwordValid = verifyPassword_(
    password,
    user['Password Salt'],
    user['Password Hash']
  );

  if (!passwordValid) {
    registerFailedLogin_(username);
    throw new Error('Username atau password tidak sesuai.');
  }

  clearFailedLogin_(username);

  const token = createSession_(user);

  updateLastLogin_(
    usersSheet,
    user._rowNumber
  );

  return {
    success: true,
    message: 'Login berhasil.',
    token: token,
    expiresIn: 21600,
    mustChangePassword:
      String(user['Must Change Password'] || '')
        .trim()
        .toLowerCase() === 'ya',
    user: {
      userId: String(user['User ID'] || ''),
      username: String(user.Username || ''),
      fullName: String(user['Full Name'] || ''),
      role: String(user.Role || ''),
      relatedId: String(user['Related ID'] || '')
    }
  };
}

/**
 * Memeriksa password.
 */
function verifyPassword_(password, salt, storedHash) {
  if (!salt || !storedHash) {
    return false;
  }

  const calculatedHash = hashPassword_(
    String(password),
    String(salt)
  );

  return secureCompare_(
    calculatedHash,
    String(storedHash)
  );
}

/**
 * Membandingkan hash dengan lebih aman.
 */
function secureCompare_(firstValue, secondValue) {
  const first = String(firstValue);
  const second = String(secondValue);

  if (first.length !== second.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < first.length; index++) {
    difference |=
      first.charCodeAt(index) ^
      second.charCodeAt(index);
  }

  return difference === 0;
}

/**
 * Membuat token session selama enam jam.
 */
function createSession_(user) {
  const token =
    Utilities.getUuid().replace(/-/g, '') +
    Utilities.getUuid().replace(/-/g, '');

  const sessionData = {
    userId: String(user['User ID'] || ''),
    username: String(user.Username || ''),
    fullName: String(user['Full Name'] || ''),
    role: String(user.Role || ''),
    relatedId: String(user['Related ID'] || ''),
    createdAt: new Date().toISOString()
  };

  CacheService
    .getScriptCache()
    .put(
      'SESSION_' + token,
      JSON.stringify(sessionData),
      21600
    );

  return token;
}

/**
 * Memvalidasi session.
 */
function validateSession_(token) {
  const session = getSession_(token);

  return {
    success: true,
    valid: true,
    user: session
  };
}

/**
 * Mengambil session.
 */
function getSession_(token) {
  const cleanToken = String(token || '').trim();

  if (!cleanToken) {
    throw new Error('Session tidak ditemukan. Silakan login kembali.');
  }

  const sessionText = CacheService
    .getScriptCache()
    .get('SESSION_' + cleanToken);

  if (!sessionText) {
    throw new Error('Session telah berakhir. Silakan login kembali.');
  }

  return JSON.parse(sessionText);
}

/**
 * Logout dan menghapus session.
 */
function logoutUser_(token) {
  const cleanToken = String(token || '').trim();

  if (cleanToken) {
    CacheService
      .getScriptCache()
      .remove('SESSION_' + cleanToken);
  }

  return {
    success: true,
    message: 'Logout berhasil.'
  };
}

/**
 * Memperbarui waktu login terakhir.
 */
function updateLastLogin_(sheet, rowNumber) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (header) {
      return String(header).trim();
    });

  const lastLoginColumn =
    headers.indexOf('Last Login') + 1;

  if (lastLoginColumn > 0) {
    sheet
      .getRange(rowNumber, lastLoginColumn)
      .setValue(new Date());
  }
}

/**
 * Membatasi percobaan login.
 */
function checkLoginRateLimit_(username) {
  const key =
    'LOGIN_ATTEMPT_' +
    sanitizeKey_(username);

  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(key) || 0);

  if (attempts >= 5) {
    throw new Error(
      'Terlalu banyak percobaan login. Tunggu 15 menit.'
    );
  }
}

/**
 * Mencatat percobaan login yang gagal.
 */
function registerFailedLogin_(username) {
  const key =
    'LOGIN_ATTEMPT_' +
    sanitizeKey_(username);

  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(key) || 0);

  cache.put(
    key,
    String(attempts + 1),
    900
  );
}

/**
 * Menghapus catatan login gagal.
 */
function clearFailedLogin_(username) {
  const key =
    'LOGIN_ATTEMPT_' +
    sanitizeKey_(username);

  CacheService
    .getScriptCache()
    .remove(key);
}

/**
 * Membersihkan teks input.
 */
function sanitizeText_(value) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 200);
}

/**
 * Membuat teks aman untuk cache key.
 */
function sanitizeKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 100);
}

/**
 * Mengambil ringkasan dashboard sesuai pengguna.
 */
function getDashboardData_(token) {
  const session = getSession_(token);
  const spreadsheet = getDatabase_();

  const studentsSheet =
    spreadsheet.getSheetByName('Data Siswa');

  const paymentsSheet =
    spreadsheet.getSheetByName('Data Pembayaran');

  const attendanceSheet =
    spreadsheet.getSheetByName('Absensi');

  const schedulesSheet =
    spreadsheet.getSheetByName('Master Jadwal');

  const registrationsSheet =
    spreadsheet.getSheetByName('Student Registrations');

  const students = studentsSheet
    ? getSheetObjects_(studentsSheet)
    : [];

  const payments = paymentsSheet
    ? getSheetObjects_(paymentsSheet)
    : [];

  const attendance = attendanceSheet
    ? getSheetObjects_(attendanceSheet)
    : [];

  const schedules = schedulesSheet
    ? getSheetObjects_(schedulesSheet)
    : [];

  const registrations = registrationsSheet
    ? getSheetObjects_(registrationsSheet)
    : [];

  const activeStudents = students.filter(function (student) {
    const status = String(
      getObjectValue_(
        student,
        ['Student Status', 'Status']
      ) || 'Aktif'
    )
      .trim()
      .toLowerCase();

    return status === '' || status === 'aktif';
  });

  const activeScheduleRows = schedules.filter(function (schedule) {
    const status = String(
      getObjectValue_(
        schedule,
        ['Status', 'Status Kelas']
      ) || 'Aktif'
    )
      .trim()
      .toLowerCase();

    return status === '' || status === 'aktif';
  });

  // Satu Class ID dapat muncul beberapa baris karena hari belajar berbeda.
  // Card Kelas Aktif harus menghitung kelas unik, bukan jumlah baris jadwal.
  const activeClassMap = {};
  activeScheduleRows.forEach(function (schedule) {
    const classId = String(getObjectValue_(schedule, ['Class ID', 'Class Id']) || '').trim().toUpperCase();
    if (!classId) return;
    if (!activeClassMap[classId]) {
      activeClassMap[classId] = {
        classId: classId,
        className: String(getObjectValue_(schedule, ['Nama kelas', 'Nama Kelas', 'Class Name']) || classId),
        program: String(getObjectValue_(schedule, ['Program']) || ''),
        tutor: String(getObjectValue_(schedule, ['Tutor']) || ''),
        days: []
      };
    }
    const day = String(getObjectValue_(schedule, ['Hari', 'Day']) || '').trim();
    const start = formatStudentTime_(getObjectValue_(schedule, ['Mulai', 'Start', 'Start Time']));
    const end = formatStudentTime_(getObjectValue_(schedule, ['Selesai', 'End', 'End Time']));
    const label = [day, start && end ? start + '–' + end : ''].filter(Boolean).join(' ');
    if (label && activeClassMap[classId].days.indexOf(label) === -1) activeClassMap[classId].days.push(label);
  });
  const activeClasses = Object.keys(activeClassMap).sort().map(function (key) {
    const item = activeClassMap[key];
    return {
      classId: item.classId,
      className: item.className,
      program: item.program,
      tutor: item.tutor,
      schedule: item.days.join(' & ')
    };
  });

  const verifiedPayments = payments.filter(function (payment) {
    const status = String(
      getObjectValue_(
        payment,
        ['Status']
      )
    )
      .trim()
      .toLowerCase();

    return (
      status === 'verified' ||
      status === 'paid' ||
      status === 'lunas'
    );
  });

  const pendingPayments = payments.filter(function (payment) {
    const status = String(
      getObjectValue_(
        payment,
        ['Status']
      )
    )
      .trim()
      .toLowerCase();

    return (
      status === 'menunggu verifikasi' ||
      status === 'pending' ||
      status === 'menunggu'
    );
  });

  const pendingRegistrations = registrations.filter(function (registration) {
    const status = String(getObjectValue_(registration, ['Status']) || '').trim().toLowerCase();
    return status === 'menunggu verifikasi' || status === 'pending' || status === 'menunggu';
  });

  const timezone = 'Asia/Makassar';
  const now = new Date();
  const currentPeriod = Utilities.formatDate(now, timezone, 'yyyy-MM');
  const currentDay = Number(Utilities.formatDate(now, timezone, 'd'));
  const studentMap = {};
  students.forEach(function (student) {
    const id = String(getObjectValue_(student, ['Student ID', 'ID']) || '').trim();
    if (!id) return;
    studentMap[id] = {
      studentId: id,
      fullName: String(getObjectValue_(student, ['Full Name', 'Student Name', 'Nama']) || ''),
      program: String(getObjectValue_(student, ['Program']) || ''),
      classId: String(getObjectValue_(student, ['Class ID', 'Class Id']) || ''),
      className: String(getObjectValue_(student, ['Class', 'Nama Kelas', 'Kelas']) || ''),
      waStudent: String(getObjectValue_(student, ['WA Student', 'WA Siswa', 'WhatsApp', 'WA Account']) || ''),
      waParent: String(getObjectValue_(student, ['WA Parent', 'WA Orang Tua']) || '')
    };
  });

  const absentCounts = {};
  attendance.forEach(function (record) {
    const id = String(getObjectValue_(record, ['Student ID', 'ID']) || '').trim();
    const date = normalizeStudentDate_(getObjectValue_(record, ['Tanggal', 'Date']));
    if (!id || !studentMap[id] || !date || Utilities.formatDate(date, timezone, 'yyyy-MM') !== currentPeriod) return;
    const status = String(getObjectValue_(record, ['Status']) || '').trim().toLowerCase();
    if (status === 'tidak hadir' || status === 'absent' || status === 'alpa' || status === 'alpha') absentCounts[id] = (absentCounts[id] || 0) + 1;
  });
  const absentMoreThanFour = Object.keys(absentCounts).filter(function (id) { return absentCounts[id] > 4; }).map(function (id) {
    return {
      studentId:id,
      fullName:studentMap[id].fullName,
      classId:studentMap[id].classId,
      className:studentMap[id].className,
      absentCount:absentCounts[id],
      waStudent:studentMap[id].waStudent,
      waParent:studentMap[id].waParent
    };
  }).sort(function (a,b) { return b.absentCount - a.absentCount; });

  const paidThisPeriod = {};
  payments.forEach(function (payment) {
    const id = String(getObjectValue_(payment, ['Student ID', 'ID']) || '').trim();
    const status = String(getObjectValue_(payment, ['Status']) || '').trim().toLowerCase();
    const category = String(getObjectValue_(payment, ['Payment Category', 'Kategori']) || '').trim().toLowerCase();
    const period = String(getObjectValue_(payment, ['Period', 'Bulan yang dibayar', 'Periode']) || '').trim();
    const paid = status === 'verified' || status === 'paid' || status === 'lunas';
    const tuition = !category || category === 'tuition' || category.indexOf('les') >= 0 || category.indexOf('course') >= 0;
    if (id && paid && tuition && period === currentPeriod) paidThisPeriod[id] = true;
  });
  const tuitionReminderTargets = activeStudents.map(function (student) {
    const id = String(getObjectValue_(student, ['Student ID', 'ID']) || '').trim();
    return studentMap[id];
  }).filter(function (student) {
    return student && !paidThisPeriod[student.studentId];
  }).map(function (student) {
    return {
      studentId:student.studentId,
      fullName:student.fullName,
      program:student.program,
      classId:student.classId,
      period:currentPeriod,
      waStudent:student.waStudent,
      waParent:student.waParent
    };
  }).sort(function (a,b) { return a.fullName.localeCompare(b.fullName,'id'); });

  const unpaidAfterDaySeven = currentDay > 7
    ? tuitionReminderTargets.slice()
    : [];

  const monthLabels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  function normalizePeriodForMonitoring_(value, paymentDate) {
    const raw = String(value || '').trim();
    if (/^\d{4}-\d{2}$/.test(raw)) return raw;
    const date = normalizeStudentDate_(paymentDate);
    return date ? Utilities.formatDate(date, timezone, 'yyyy-MM') : '';
  }

  const tuitionMonthMap = {};
  const monthCursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let offset = 2; offset >= 0; offset--) {
    const d = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - offset, 1);
    const key = Utilities.formatDate(d, timezone, 'yyyy-MM');
    tuitionMonthMap[key] = {
      period: key,
      label: monthLabels[d.getMonth()] + ' ' + d.getFullYear(),
      paidStudentIds: {},
      transactions: 0,
      revenue: 0
    };
  }

  const bookPurchases = [];
  const idCardPurchases = [];

  verifiedPayments.forEach(function (payment) {
    const category = normalizePaymentCategory_(getObjectValue_(payment, ['Payment Category', 'Kategori']));
    const studentId = String(getObjectValue_(payment, ['Student ID', 'ID']) || '').trim();
    const studentName = String(getObjectValue_(payment, ['Nama', 'Student Name']) || (studentMap[studentId] ? studentMap[studentId].fullName : '')).trim();
    const paymentDate = getObjectValue_(payment, ['Payment Date', 'Tanggal', 'Date']);
    const period = normalizePeriodForMonitoring_(getObjectValue_(payment, ['Period', 'Bulan yang dibayar', 'Periode']), paymentDate);
    const amount = parseAmount_(getObjectValue_(payment, ['Amount', 'Nominal', 'Jumlah']));
    const fulfillmentStatus = String(getObjectValue_(payment, ['Fulfillment Status']) || '').trim();
    const itemLabel = String(getObjectValue_(payment, ['Item Label']) || '').trim();
    const program = studentMap[studentId] ? studentMap[studentId].program : '';

    if (category === 'Tuition' && tuitionMonthMap[period]) {
      tuitionMonthMap[period].transactions += 1;
      tuitionMonthMap[period].revenue += amount;
      if (studentId) tuitionMonthMap[period].paidStudentIds[studentId] = true;
    }

    const entry = {
      paymentId: String(getObjectValue_(payment, ['Payment ID']) || ''),
      studentId: studentId,
      fullName: studentName,
      program: program,
      amount: amount,
      paymentDate: paymentDate ? String(paymentDate) : '',
      itemLabel: itemLabel,
      fulfillmentStatus: fulfillmentStatus || 'Sedang Disiapkan'
    };

    if (category === 'Book Package') bookPurchases.push(entry);
    if (category === 'ID Card') idCardPurchases.push(entry);
  });

  const tuitionMonthly = Object.keys(tuitionMonthMap).sort().map(function (key) {
    const item = tuitionMonthMap[key];
    const paidStudents = Object.keys(item.paidStudentIds).length;
    return {
      period: item.period,
      label: item.label,
      paidStudents: paidStudents,
      totalStudents: activeStudents.length,
      unpaidStudents: Math.max(0, activeStudents.length - paidStudents),
      percentage: activeStudents.length ? Math.round((paidStudents / activeStudents.length) * 100) : 0,
      transactions: item.transactions,
      revenue: item.revenue
    };
  });

  bookPurchases.sort(function (a, b) { return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0); });
  idCardPurchases.sort(function (a, b) { return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0); });

  const booksReceived = bookPurchases.filter(function (item) {
    const status = String(item.fulfillmentStatus || '').trim().toLowerCase();
    return status === 'sudah diterima siswa' || status === 'received' || status === 'sudah diterima';
  });

  const booksPendingDelivery = bookPurchases.filter(function (item) {
    const status = String(item.fulfillmentStatus || '').trim().toLowerCase();
    return status !== 'sudah diterima siswa' && status !== 'received' && status !== 'sudah diterima';
  });

  const currentTuitionSummary = tuitionMonthly.length ? tuitionMonthly[tuitionMonthly.length - 1] : {
    period: currentPeriod,
    label: currentPeriod,
    paidStudents: 0,
    totalStudents: activeStudents.length,
    unpaidStudents: activeStudents.length,
    percentage: 0,
    transactions: 0,
    revenue: 0
  };

  const threeMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  threeMonthStart.setHours(0, 0, 0, 0);

  const verifiedPaymentsLast3Months = verifiedPayments.filter(function (payment) {
    const date = normalizeStudentDate_(getObjectValue_(payment, ['Payment Date', 'Tanggal', 'Date', 'Verified Date']));
    return date && date >= threeMonthStart && date <= now;
  });

  const totalRevenue = verifiedPaymentsLast3Months.reduce(
    function (total, payment) {
      return total + parseAmount_(getObjectValue_(payment, ['Amount', 'Nominal', 'Jumlah']));
    },
    0
  );

  // Kehadiran CEO: persentase kehadiran pada sesi les yang memang tercatat
  // di bulan berjalan, bukan seluruh histori absensi.
  const currentMonthAttendance = attendance.filter(function (record) {
    const date = normalizeStudentDate_(getObjectValue_(record, ['Tanggal', 'Date']));
    return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentPeriod;
  });

  const presentCount = currentMonthAttendance.filter(function (record) {
    const status = String(getObjectValue_(record, ['Status']) || '').trim().toLowerCase();
    return status === 'hadir' || status === 'present';
  }).length;

  const attendanceRate =
    currentMonthAttendance.length > 0
      ? Math.round((presentCount / currentMonthAttendance.length) * 100)
      : 0;

  const revenueByMethodMap = {};
  verifiedPaymentsLast3Months.forEach(function (payment) {
    let method = String(getObjectValue_(payment, ['Payment Method', 'Metode', 'Transfer Bank']) || 'Lainnya').trim();
    if (!method) method = 'Lainnya';

    // Normalisasi nama agar rekening yang sama tidak terpecah karena variasi label.
    const lower = method.toLowerCase();
    if (lower.indexOf('bca') >= 0) method = 'BCA';
    else if (lower.indexOf('seabank') >= 0) method = 'SeaBank';
    else if (lower.indexOf('bpd') >= 0 || lower.indexOf('kaltimtara') >= 0) method = 'BPD Kaltimtara';
    else if (lower.indexOf('gopay') >= 0 || lower.indexOf('dana') >= 0) method = 'GoPay / DANA';
    else if (lower.indexOf('tunai') >= 0 || lower.indexOf('cash') >= 0) method = 'Tunai';

    if (!revenueByMethodMap[method]) revenueByMethodMap[method] = { method: method, amount: 0, transactions: 0 };
    revenueByMethodMap[method].amount += parseAmount_(getObjectValue_(payment, ['Amount', 'Nominal', 'Jumlah']));
    revenueByMethodMap[method].transactions += 1;
  });

  const revenueByMethod = Object.keys(revenueByMethodMap)
    .map(function (key) { return revenueByMethodMap[key]; })
    .sort(function (a, b) { return b.amount - a.amount; });

  // Aktivitas Admin yang dapat ditelusuri dari data operasional yang memang tersimpan.
  const adminActivities = [];

  verifiedPayments.slice().forEach(function (payment) {
    const verifiedAt = normalizeStudentDate_(getObjectValue_(payment, ['Verified Date', 'Payment Date', 'Tanggal']));
    const verifiedBy = String(getObjectValue_(payment, ['Verified By']) || 'Admin').trim();
    if (!verifiedAt) return;
    adminActivities.push({
      type: 'payment',
      actor: verifiedBy || 'Admin',
      action: 'Verifikasi pembayaran',
      detail: String(getObjectValue_(payment, ['Nama', 'Student Name']) || '') + ' • ' +
        String(getObjectValue_(payment, ['Item Label', 'Payment Category']) || 'Pembayaran') + ' • ' +
        formatRupiahForLog_(parseAmount_(getObjectValue_(payment, ['Amount', 'Nominal', 'Jumlah']))),
      date: verifiedAt
    });
  });

  registrations.forEach(function (registration) {
    const reviewedAt = normalizeStudentDate_(getObjectValue_(registration, ['Reviewed At']));
    const status = String(getObjectValue_(registration, ['Status']) || '').trim();
    if (!reviewedAt || !status || /menunggu/i.test(status)) return;
    adminActivities.push({
      type: 'registration',
      actor: 'Admin',
      action: status === 'Disetujui' ? 'Setujui pendaftaran' : 'Proses pendaftaran',
      detail: String(getObjectValue_(registration, ['Full Name']) || '') + ' • ' + status,
      date: reviewedAt
    });
  });

  adminActivities.sort(function (a, b) { return b.date - a.date; });
  const recentAdminActivities = adminActivities.slice(0, 20).map(function (item) {
    return {
      type: item.type,
      actor: item.actor,
      action: item.action,
      detail: item.detail,
      date: Utilities.formatDate(item.date, timezone, 'yyyy-MM-dd HH:mm')
    };
  });

  const recentPayments = payments
    .slice()
    .reverse()
    .slice(0, 5)
    .map(function (payment) {
      return {
        studentId: String(
          getObjectValue_(
            payment,
            ['Student ID', 'ID']
          ) || ''
        ),
        studentName: String(
          getObjectValue_(
            payment,
            ['Student Name', 'Nama']
          ) || ''
        ),
        category: String(
          getObjectValue_(
            payment,
            ['Payment Category', 'Kategori']
          ) || ''
        ),
        amount: parseAmount_(
          getObjectValue_(
            payment,
            ['Amount', 'Nominal', 'Jumlah']
          )
        ),
        status: String(
          getObjectValue_(
            payment,
            ['Status']
          ) || ''
        ),
        period: String(
          getObjectValue_(
            payment,
            ['Bulan yang dibayar', 'Periode']
          ) || ''
        )
      };
    });

  return {
    success: true,
    user: {
      fullName: session.fullName,
      role: session.role
    },
    metrics: {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      activeClasses: activeClasses.length,
      totalPayments: payments.length,
      verifiedPayments: verifiedPayments.length,
      pendingPayments: pendingPayments.length,
      pendingRegistrations: pendingRegistrations.length,
      pendingVerificationTotal: pendingPayments.length + pendingRegistrations.length,
      totalRevenue: totalRevenue,
      revenuePeriodLabel: '3 bulan terakhir',
      attendanceRate: attendanceRate,
      attendancePresent: presentCount,
      attendanceRecorded: currentMonthAttendance.length
    },
    recentPayments: recentPayments,
    attendanceFollowUps:
      ['admin', 'ceo'].indexOf(String(session.role || '').trim().toLowerCase()) >= 0
        ? getAttendanceFollowUpsForRole_(session)
        : [],
    attentionLists: {
      absentMoreThanFour: absentMoreThanFour,
      unpaidAfterDaySeven: unpaidAfterDaySeven,
      tuitionReminderTargets: tuitionReminderTargets,
      paymentWatchActive: currentDay > 7,
      period: currentPeriod
    },
    ceoMonitoring: String(session.role || '').trim().toLowerCase() === 'ceo' ? {
      currentPeriod: currentPeriod,
      tuitionCurrent: currentTuitionSummary,
      tuitionMonthly: tuitionMonthly,
      bookSummary: {
        purchased: bookPurchases.length,
        received: booksReceived.length,
        pendingDelivery: booksPendingDelivery.length
      },
      idCardSummary: {
        purchased: idCardPurchases.length
      },
      bookPurchases: bookPurchases,
      idCardPurchases: idCardPurchases,
      activeClasses: activeClasses,
      revenueLast3Months: totalRevenue,
      revenueByMethod: revenueByMethod,
      attendanceCurrentMonth: {
        present: presentCount,
        totalRecords: currentMonthAttendance.length,
        percentage: attendanceRate
      }
    } : null,
    adminActivities: recentAdminActivities,
    generatedAt: new Date().toISOString()
  };
}

function formatRupiahForLog_(value) {
  const number = Number(value || 0);
  return 'Rp' + String(Math.round(number)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Mengambil nilai object berdasarkan beberapa kemungkinan header.
 */
function getObjectValue_(object, possibleHeaders) {
  for (
    let index = 0;
    index < possibleHeaders.length;
    index++
  ) {
    const header = possibleHeaders[index];

    if (
      Object.prototype.hasOwnProperty.call(
        object,
        header
      ) &&
      object[header] !== ''
    ) {
      return object[header];
    }
  }

  return '';
}

/**
 * Mengubah nilai uang menjadi angka.
 */
function parseAmount_(value) {
  if (typeof value === 'number') {
    return value;
  }

  const cleanedValue = String(value || '')
    .replace(/[^\d,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const numberValue = Number(cleanedValue);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

/**
 * Mengambil daftar siswa untuk CEO dan Admin.
 */
function getStudents_(token, request) {
  const session = getSession_(token);

  if (
    session.role !== 'CEO' &&
    session.role !== 'Admin'
  ) {
    throw new Error(
      'Anda tidak memiliki akses ke data siswa.'
    );
  }

  const spreadsheet = getDatabase_();
  const sheet = spreadsheet.getSheetByName('Data Siswa');

  if (!sheet) {
    throw new Error('Sheet Data Siswa tidak ditemukan.');
  }

  const allStudents = getSheetObjects_(sheet);

  const search = sanitizeText_(request.search)
    .toLowerCase();

  const requestedPage = Number(request.page || 1);
  const requestedLimit = Number(request.limit || 20);

  const page =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const limit =
    Number.isFinite(requestedLimit) &&
    requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 50)
      : 20;

  const students = allStudents
    .map(function (student) {
      return {
        studentId: String(
          getObjectValue_(
            student,
            ['Student ID', 'ID']
          ) || ''
        ),
        fullName: String(
          getObjectValue_(
            student,
            ['Full Name', 'Student Name', 'Nama']
          ) || ''
        ),
        school: String(
          getObjectValue_(student, ['School']) || ''
        ),
        grade: String(
          getObjectValue_(student, ['Grade']) || ''
        ),
        program: String(
          getObjectValue_(student, ['Program']) || ''
        ),
        className: String(
          getObjectValue_(
            student,
            ['Class', 'Nama Kelas', 'Kelas']
          ) || ''
        ),
        classId: String(getObjectValue_(student, ['Class ID', 'Class Id']) || ''),
        schedule: String(
          getObjectValue_(
            student,
            ['Schedule', 'Jadwal']
          ) || ''
        ),
        waStudent: String(
          getObjectValue_(
            student,
            ['WA Student']
          ) || ''
        ),
        waParent: String(
          getObjectValue_(
            student,
            ['WA Parent']
          ) || ''
        ),
        photoLink: String(
          getObjectValue_(
            student,
            ['Photo Link', 'Photo link']
          ) || ''
        ),
        currentLevel: String(
          getObjectValue_(
            student,
            ['Current Level']
          ) || ''
        ),
        accountStatus: String(getObjectValue_(student, ['Account Status']) || ''),
        status: String(
          getObjectValue_(
            student,
            ['Student Status', 'Status']
          ) || 'Aktif'
        )
      };
    })
    .filter(function (student) {
      if (!search) {
        return true;
      }

      const searchableText = [
        student.studentId,
        student.fullName,
        student.school,
        student.grade,
        student.program,
        student.className
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    })
    .sort(function (first, second) {
      return first.fullName.localeCompare(
        second.fullName,
        'id'
      );
    });

  const totalData = students.length;
  const totalPages = Math.max(
    Math.ceil(totalData / limit),
    1
  );

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const pageData = students.slice(
    startIndex,
    startIndex + limit
  );

  return {
    success: true,
    students: pageData,
    pagination: {
      page: safePage,
      limit: limit,
      totalData: totalData,
      totalPages: totalPages
    }
  };
}


function getAdminStudentDetail_(token, studentId) {
  const session = getSession_(token);
  const role = String(session.role || '').trim().toLowerCase();
  if (role !== 'admin' && role !== 'ceo') throw new Error('Anda tidak memiliki akses ke detail siswa.');

  const id = String(studentId || '').trim().toUpperCase();
  if (!id) throw new Error('Student ID wajib diisi.');

  const database = getDatabase_();
  const studentSheet = database.getSheetByName('Data Siswa');
  if (!studentSheet) throw new Error('Sheet Data Siswa tidak ditemukan.');
  const students = getSheetObjects_(studentSheet);
  const student = students.find(function (item) {
    return String(getObjectValue_(item, ['Student ID', 'ID']) || '').trim().toUpperCase() === id;
  });
  if (!student) throw new Error('Data siswa tidak ditemukan.');

  const timezone = 'Asia/Makassar';
  const currentPeriod = Utilities.formatDate(new Date(), timezone, 'yyyy-MM');
  const classId = String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim();

  const attendanceSheet = database.getSheetByName('Absensi');
  const attendanceRows = attendanceSheet ? getSheetObjects_(attendanceSheet) : [];
  const monthAttendance = attendanceRows.filter(function (row) {
    const rowId = String(getObjectValue_(row, ['Student ID', 'ID']) || '').trim().toUpperCase();
    const date = normalizeStudentDate_(getObjectValue_(row, ['Tanggal', 'Date']));
    return rowId === id && date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentPeriod;
  });
  const present = monthAttendance.filter(function (row) {
    const status = String(getObjectValue_(row, ['Status']) || '').trim().toLowerCase();
    return status === 'hadir' || status === 'present';
  }).length;
  const absent = monthAttendance.length - present;
  const attendancePercentage = monthAttendance.length ? Math.round((present / monthAttendance.length) * 100) : 0;

  const journalSheet = database.getSheetByName('Learning Journal');
  const journalRows = journalSheet ? getSheetObjects_(journalSheet) : [];
  const learningPlanSheet = database.getSheetByName('Monthly Learning Plan');
  const planRows = learningPlanSheet ? getSheetObjects_(learningPlanSheet) : [];
  const journals = journalRows.filter(function (row) {
    const rowClassId = String(getObjectValue_(row, ['Class ID', 'Class Id']) || '').trim();
    const date = normalizeStudentDate_(getObjectValue_(row, ['Date', 'Tanggal']));
    return rowClassId === classId && (!date || Utilities.formatDate(date, timezone, 'yyyy-MM') === currentPeriod);
  }).map(function (row) {
    const date = normalizeStudentDate_(getObjectValue_(row, ['Date', 'Tanggal']));
    return { date:date ? Utilities.formatDate(date,timezone,'yyyy-MM-dd') : '', meetingNumber:Number(getObjectValue_(row,['Meeting Number','Pertemuan Ke'])||0), title:String(getObjectValue_(row,['Material / Topic','Material','Topic'])||''), activities:String(getObjectValue_(row,['Activities','Aktivitas'])||''), notes:String(getObjectValue_(row,['Tutor Notes','Catatan Tutor'])||'') };
  });
  const plans = planRows.filter(function (row) {
    return String(getObjectValue_(row, ['Class ID', 'Class Id']) || '').trim() === classId && String(getObjectValue_(row, ['Month','Bulan']) || '').trim() === currentPeriod;
  }).map(function (row) {
    const date = normalizeStudentDate_(getObjectValue_(row,['Planned Date','Tanggal Rencana']));
    return { date:date ? Utilities.formatDate(date,timezone,'yyyy-MM-dd') : '', meetingNumber:Number(getObjectValue_(row,['Meeting Number','Pertemuan Ke'])||0), title:String(getObjectValue_(row,['Material / Topic'])||''), objective:String(getObjectValue_(row,['Learning Objective','Tujuan Pembelajaran'])||''), activities:String(getObjectValue_(row,['Planned Activities','Rencana Aktivitas'])||'') };
  });
  const learningActivities = (journals.length ? journals : plans).sort(function(a,b){ return Number(a.meetingNumber||0)-Number(b.meetingNumber||0); });

  const assessmentSheet = database.getSheetByName('Assessment Scores');
  const assessments = assessmentSheet ? getSheetObjects_(assessmentSheet).filter(function (row) {
    const rowId = String(getObjectValue_(row,['Student ID'])||'').trim().toUpperCase();
    const date = normalizeStudentDate_(getObjectValue_(row,['Date','Tanggal']));
    return rowId === id && (!date || Utilities.formatDate(date,timezone,'yyyy-MM') === currentPeriod);
  }) : [];
  const averageScore = assessments.length ? Math.round(assessments.reduce(function(sum,row){
    const avg = Number(getObjectValue_(row,['Average Score'])||0);
    if (avg) return sum+avg;
    const vals = ['Speaking','Writing','Reading','Listening','Quiz / Test'].map(function(h){return Number(getObjectValue_(row,[h])||0);}).filter(function(v){return v>0;});
    return sum+(vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0);
  },0)/assessments.length) : null;

  const submissionSheet = database.getSheetByName('Assignment Submissions');
  const submissions = submissionSheet ? getSheetObjects_(submissionSheet).filter(function(row){return String(getObjectValue_(row,['Student ID'])||'').trim().toUpperCase()===id;}) : [];
  const completedAssignments = submissions.filter(function(row){const s=String(getObjectValue_(row,['Status'])||'').trim().toLowerCase();return s==='reviewed'||s==='submitted'||s==='completed'||s==='selesai';}).length;

  const notesSheet = database.getSheetByName('Student Notes');
  const notes = notesSheet ? getSheetObjects_(notesSheet).filter(function(row){return String(getObjectValue_(row,['Student ID'])||'').trim().toUpperCase()===id;}) : [];
  const tutorComment = notes.length ? String(getObjectValue_(notes[notes.length-1],['Comment','Tutor Comment','Komentar'])||'') : '';

  const paymentSheet = database.getSheetByName('Data Pembayaran');
  const payments = paymentSheet ? getSheetObjects_(paymentSheet).filter(function(row){return String(getObjectValue_(row,['Student ID','ID'])||'').trim().toUpperCase()===id;}) : [];
  const tuitionPaid = payments.some(function(row){
    const status=String(getObjectValue_(row,['Status'])||'').trim().toLowerCase();
    const category=String(getObjectValue_(row,['Payment Category','Kategori'])||'').trim().toLowerCase();
    const period=String(getObjectValue_(row,['Period','Bulan yang dibayar','Periode'])||'').trim();
    return (status==='lunas'||status==='verified'||status==='paid') && (!category||category==='tuition'||category.indexOf('les')>=0||category.indexOf('course')>=0) && period===currentPeriod;
  });
  const lastPaymentRow = payments.length ? payments[payments.length-1] : null;
  const lastPaymentDate = lastPaymentRow ? normalizeStudentDate_(getObjectValue_(lastPaymentRow,['Payment Date','Tanggal Pembayaran','Date'])) : null;

  let rewards = { lifetimeExp:0, rank:'Newcomer', unlockedBadges:0, badges:[] };
  try {
    const summary = getStudentGamificationSummaryV22_(id,classId,currentPeriod);
    const badgeSheet = database.getSheetByName('Badge Progress');
    const badgeRows = badgeSheet ? getSheetObjects_(badgeSheet).filter(function(row){
      return String(getObjectValue_(row,['Student ID'])||'').trim().toUpperCase()===id && String(getObjectValue_(row,['Month'])||'').trim()===currentPeriod && String(getObjectValue_(row,['Status'])||'').trim().toLowerCase()==='unlocked';
    }) : [];
    rewards = { lifetimeExp:Number(summary.lifetimeExp||summary.totalExp||0), rank:String(summary.rank||summary.rankName||'Newcomer'), unlockedBadges:badgeRows.length, badges:badgeRows.map(function(row){return {name:String(getObjectValue_(row,['Badge Name','Badge'])||'Badge')};}) };
  } catch (error) {}

  return {
    success:true,
    student:{
      studentId:id,
      fullName:String(getObjectValue_(student,['Full Name','Student Name','Nama'])||''),
      school:String(getObjectValue_(student,['School'])||''),
      grade:String(getObjectValue_(student,['Grade'])||''),
      program:String(getObjectValue_(student,['Program'])||''),
      classId:classId,
      className:String(getObjectValue_(student,['Class','Nama Kelas','Kelas'])||''),
      schedule:String(getObjectValue_(student,['Schedule','Jadwal'])||''),
      waStudent:String(getObjectValue_(student,['WA Student','WA Account'])||''),
      waParent:String(getObjectValue_(student,['WA Parent'])||''),
      accountStatus:String(getObjectValue_(student,['Account Status'])||''),
      status:String(getObjectValue_(student,['Student Status','Status'])||'Aktif')
    },
    monthlyReport:{period:currentPeriod,attendancePercentage:attendancePercentage,averageScore:averageScore,completedAssignments:completedAssignments,tutorComment:tutorComment},
    learningActivities:learningActivities,
    administration:{present:present,absent:absent,tuitionStatus:tuitionPaid?'Lunas':'Belum Lunas',lastPayment:lastPaymentDate?Utilities.formatDate(lastPaymentDate,timezone,'dd MMM yyyy'):'Belum ada'},
    rewards:rewards
  };
}

function createTestStudentAccount() {
  const studentId = 'MOC001';
  const fullName = 'AQIL OMAR DIZZA';

  const spreadsheet = getDatabase_();
  const sheet = spreadsheet.getSheetByName('Users');

  if (!sheet) {
    throw new Error('Sheet Users tidak ditemukan.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0]
      .map(function (header) {
        return String(header).trim();
      });

    const requiredHeaders = [
      'User ID',
      'Username',
      'Password Hash',
      'Role',
      'Related ID',
      'Full Name',
      'Status',
      'Created At',
      'Last Login',
      'Password Salt',
      'Must Change Password'
    ];

    requiredHeaders.forEach(function (header) {
      if (!headers.includes(header)) {
        throw new Error(
          'Kolom "' + header + '" tidak ditemukan di sheet Users.'
        );
      }
    });

    const usernameColumn = headers.indexOf('Username') + 1;
    const relatedIdColumn = headers.indexOf('Related ID') + 1;
    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {
      const usernames = sheet
        .getRange(2, usernameColumn, lastRow - 1, 1)
        .getDisplayValues()
        .flat()
        .map(function (value) {
          return String(value).trim().toUpperCase();
        });

      if (usernames.includes(studentId.toUpperCase())) {
        throw new Error(
          'Akun dengan username ' + studentId + ' sudah tersedia.'
        );
      }

      const relatedIds = sheet
        .getRange(2, relatedIdColumn, lastRow - 1, 1)
        .getDisplayValues()
        .flat()
        .map(function (value) {
          return String(value).trim().toUpperCase();
        });

      if (relatedIds.includes(studentId.toUpperCase())) {
        throw new Error(
          'Student ID ' + studentId + ' sudah terhubung dengan akun lain.'
        );
      }
    }

    const temporaryPassword = generateTemporaryPassword_();
    const passwordSalt = Utilities.getUuid();
    const passwordHash = hashPassword_(
      temporaryPassword,
      passwordSalt
    );

    const userData = {
      'User ID': studentId,
      'Username': studentId,
      'Password Hash': passwordHash,
      'Role': 'Siswa',
      'Related ID': studentId,
      'Full Name': fullName,
      'Status': 'Aktif',
      'Created At': new Date(),
      'Last Login': '',
      'Password Salt': passwordSalt,
      'Must Change Password': 'Ya'
    };

    const newRow = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(
        userData,
        header
      )
        ? userData[header]
        : '';
    });

    sheet.appendRow(newRow);

    Logger.log('AKUN SISWA BERHASIL DIBUAT');
    Logger.log('Username: ' + studentId);
    Logger.log(
      'Password sementara: ' + temporaryPassword
    );
    Logger.log(
      'Catat password secara pribadi dan jangan kirim screenshot.'
    );

    return {
      success: true,
      username: studentId,
      message: 'Akun siswa berhasil dibuat.'
    };
  } finally {
    lock.releaseLock();
  }
}

/*
 * MR ONE COURSE — STUDENT ACADEMIC OVERVIEW API
 * 1) Tambahkan case getStudentOverview ke switch(action) di doPost(e).
 * 2) Tempel seluruh fungsi di bawah ini pada bagian paling bawah Code.gs.
 */

// Tambahkan di dalam switch(action):
// case 'getStudentOverview':
//   result = getStudentOverview_(request.token);
//   break;
// case 'submitStudentAttendance':
//   result = submitStudentAttendance_(request.token, request.latitude, request.longitude, request.accuracy);
//   break;
// case 'getTutorDashboard':
//   result = getTutorDashboard_(request.token);
//   break;
// case 'saveTutorJournal':
//   result = saveTutorJournal_(request.token, request.journal);
//   break;
// case 'saveTutorLearningPlan':
//   result = saveTutorLearningPlan_(request.token, request.learningPlan);
//   break;
// case 'saveTutorStudentNote':
//   result = saveTutorStudentNote_(request.token, request.note);
//   break;
// case 'createTutorAssignment':
//   result = createTutorAssignment_(request.token, request.assignment);
//   break;
// case 'saveTutorAssessment':
//   result = saveTutorAssessment_(request.token, request.assessment);
//   break;
// case 'submitStudentAssignment':
//   result = submitStudentAssignment_(request.token, request.submission);
//   break;
// case 'reviewTutorAssignment':
//   result = reviewTutorAssignment_(request.token, request.review);
//   break;
// case 'createTutorChallenge':
//   result = createTutorChallenge_(request.token, request.challenge);
//   break;
// case 'submitStudentChallenge':
//   result = submitStudentChallenge_(request.token, request.submission);
//   break;
// case 'reviewTutorChallenge':
//   result = reviewTutorChallenge_(request.token, request.review);
//   break;
// case 'saveTutorClassAttendance':
//   result = saveTutorClassAttendance_(request.token, request.attendance);
//   break;

const MOC_ATTENDANCE_LOCATION_ = {
  latitude: -1.2611667,
  longitude: 116.8646389,
  radiusMeters: 200,
  maxAccuracyMeters: 150,
  openBeforeMinutes: 30,
  closeAfterStartMinutes: 30
};

function getTutorDashboard_(token) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') {
    throw new Error('Halaman ini hanya dapat digunakan oleh Tutor.');
  }

  const database = getDatabase_();
  const scheduleSheet = database.getSheetByName('Master Jadwal');
  const studentSheet = database.getSheetByName('Data Siswa');
  if (!scheduleSheet || !studentSheet) throw new Error('Master Jadwal atau Data Siswa belum tersedia.');

  const tutorCandidates = [session.relatedId, session.userId, session.fullName, session.name, session.username]
    .map(function (value) { return String(value || '').trim().toLowerCase(); })
    .filter(Boolean);
  const scheduleRows = getSheetObjects_(scheduleSheet).filter(function (item) {
    const tutorId = String(getObjectValue_(item, ['Tutor ID', 'Tutor Id']) || '').trim().toLowerCase();
    const tutorName = String(getObjectValue_(item, ['Tutor', 'Nama Tutor']) || '').trim().toLowerCase();
    return tutorCandidates.indexOf(tutorId) >= 0 || tutorCandidates.indexOf(tutorName) >= 0;
  });

  const students = getSheetObjects_(studentSheet);
  const journalSheet = database.getSheetByName('Learning Journal');
  const journalRows = journalSheet ? getSheetObjects_(journalSheet) : [];
  const learningPlanSheet = database.getSheetByName('Monthly Learning Plan');
  const learningPlanRows = learningPlanSheet ? getSheetObjects_(learningPlanSheet) : [];
  const notesSheet = database.getSheetByName('Student Notes');
  const notesRows = notesSheet ? getSheetObjects_(notesSheet) : [];
  const assignmentsSheet = database.getSheetByName('Assignments');
  const assignmentRows = assignmentsSheet ? getSheetObjects_(assignmentsSheet) : [];
  const assessmentsSheet = database.getSheetByName('Assessment Scores');
  const assessmentRows = assessmentsSheet ? getSheetObjects_(assessmentsSheet) : [];
  const submissionsSheet = database.getSheetByName('Assignment Submissions');
  const submissionRows = submissionsSheet ? getSheetObjects_(submissionsSheet) : [];
  const challengesSheet = database.getSheetByName('Challenges');
  const challengeRows = challengesSheet ? getSheetObjects_(challengesSheet) : [];
  const challengeResultsSheet = database.getSheetByName('Challenge Results');
  const challengeResultRows = challengeResultsSheet ? getSheetObjects_(challengeResultsSheet) : [];
  const attendanceSheet = database.getSheetByName('Absensi');
  const attendanceRows = attendanceSheet ? getSheetObjects_(attendanceSheet) : [];
  const timezone = 'Asia/Makassar';
  const now = new Date();
  const todayIndex = Number(Utilities.formatDate(now, timezone, 'u')) % 7;
  const classMap = {};

  scheduleRows.forEach(function (item) {
    const classId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    if (!classId) return;
    if (!classMap[classId]) {
      classMap[classId] = {
        classId: classId,
        className: String(getObjectValue_(item, ['Nama kelas', 'Nama Kelas', 'Class']) || classId),
        program: String(getObjectValue_(item, ['Program']) || ''),
        schedules: [],
        students: [],
        journals: [],
        learningPlans: [],
        studentNotes: [],
        assignments: [],
        assessments: [],
        submissions: [],
        challenges: [],
        challengeResults: [],
        attendanceRecords: []
      };
    }
    classMap[classId].schedules.push({
      day: String(getObjectValue_(item, ['Hari']) || ''),
      dayIndex: normalizeStudentDay_(getObjectValue_(item, ['Hari'])),
      start: formatStudentTime_(getObjectValue_(item, ['Mulai'])),
      end: formatStudentTime_(getObjectValue_(item, ['Selesai']))
    });
  });

  Object.keys(classMap).forEach(function (classId) {
    classMap[classId].students = students.filter(function (student) {
      return String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (student) {
      return {
        studentId: String(getObjectValue_(student, ['Student ID']) || ''),
        fullName: String(getObjectValue_(student, ['Full Name', 'Nama']) || ''),
        grade: String(getObjectValue_(student, ['Grade']) || ''),
        photoLink: String(getObjectValue_(student, ['Photo Link']) || '')
      };
    });
    classMap[classId].journals = journalRows.filter(function (journal) {
      return String(getObjectValue_(journal, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (journal) {
      const date = normalizeStudentDate_(getObjectValue_(journal, ['Date', 'Tanggal']));
      return {
        journalId: String(getObjectValue_(journal, ['Journal ID']) || ''),
        date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
        meetingNumber: Number(getObjectValue_(journal, ['Meeting Number', 'Pertemuan Ke']) || 0),
        title: String(getObjectValue_(journal, ['Material / Topic', 'Material', 'Topic']) || ''),
        activities: String(getObjectValue_(journal, ['Activities', 'Aktivitas']) || ''),
        notes: String(getObjectValue_(journal, ['Tutor Notes', 'Catatan Tutor']) || '')
      };
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    classMap[classId].learningPlans = learningPlanRows.filter(function (plan) {
      return String(getObjectValue_(plan, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (plan) {
      const plannedDate = normalizeStudentDate_(getObjectValue_(plan, ['Planned Date', 'Tanggal Rencana']));
      return {
        planId: String(getObjectValue_(plan, ['Plan ID']) || ''),
        month: String(getObjectValue_(plan, ['Month', 'Bulan']) || ''),
        meetingNumber: Number(getObjectValue_(plan, ['Meeting Number', 'Pertemuan Ke']) || 0),
        plannedDate: plannedDate ? Utilities.formatDate(plannedDate, timezone, 'yyyy-MM-dd') : '',
        title: String(getObjectValue_(plan, ['Material / Topic']) || ''),
        objective: String(getObjectValue_(plan, ['Learning Objective', 'Tujuan Pembelajaran']) || ''),
        targetCompetency: String(getObjectValue_(plan, ['Target Competency', 'Target Capaian']) || ''),
        activities: String(getObjectValue_(plan, ['Planned Activities', 'Rencana Aktivitas']) || ''),
        status: String(getObjectValue_(plan, ['Status']) || 'Direncanakan')
      };
    }).sort(function (a, b) { return a.meetingNumber - b.meetingNumber; });
    classMap[classId].studentNotes = notesRows.filter(function (note) {
      return String(getObjectValue_(note, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (note) {
      const date = normalizeStudentDate_(getObjectValue_(note, ['Date', 'Tanggal']));
      return {
        noteId: String(getObjectValue_(note, ['Note ID']) || ''),
        date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
        studentId: String(getObjectValue_(note, ['Student ID']) || ''),
        studentName: String(getObjectValue_(note, ['Student Name', 'Nama']) || ''),
        participation: String(getObjectValue_(note, ['Participation', 'Partisipasi']) || ''),
        strengths: String(getObjectValue_(note, ['Strengths', 'Kekuatan']) || ''),
        improvements: String(getObjectValue_(note, ['Areas for Improvement', 'Perlu Ditingkatkan']) || ''),
        comment: String(getObjectValue_(note, ['Tutor Comment', 'Komentar Tutor']) || ''),
        achievement: String(getObjectValue_(note, ['Achievement', 'Pencapaian']) || ''),
        expAwarded: Number(getObjectValue_(note, ['EXP Awarded']) || 0)
      };
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    classMap[classId].assignments = assignmentRows.filter(function (assignment) {
      return String(getObjectValue_(assignment, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (assignment) {
      const assignedDate = normalizeStudentDate_(getObjectValue_(assignment, ['Assigned Date', 'Tanggal Diberikan']));
      const dueDate = normalizeStudentDate_(getObjectValue_(assignment, ['Due Date', 'Tenggat']));
      let questions = [];
      try { questions = JSON.parse(String(getObjectValue_(assignment, ['Questions JSON']) || '[]')); } catch (error) { questions = []; }
      return {
        assignmentId: String(getObjectValue_(assignment, ['Assignment ID']) || ''), planId: String(getObjectValue_(assignment, ['Plan ID']) || ''), meetingNumber: Number(getObjectValue_(assignment, ['Meeting Number']) || 0), targetCompetency: String(getObjectValue_(assignment, ['Target Competency']) || ''), title: String(getObjectValue_(assignment, ['Title', 'Judul']) || ''),
        instructions: String(getObjectValue_(assignment, ['Instructions', 'Instruksi']) || ''),
        assignedDate: assignedDate ? Utilities.formatDate(assignedDate, timezone, 'yyyy-MM-dd') : '', dueDate: dueDate ? Utilities.formatDate(dueDate, timezone, 'yyyy-MM-dd') : '',
        maxScore: Number(getObjectValue_(assignment, ['Max Score']) || 100), totalPoints: Number(getObjectValue_(assignment, ['Total Points']) || 0), questions: questions, expReward: Number(getObjectValue_(assignment, ['EXP Reward']) || 0), status: String(getObjectValue_(assignment, ['Status']) || 'Aktif')
      };
    }).sort(function (a, b) { return b.assignedDate.localeCompare(a.assignedDate); });
    classMap[classId].assessments = assessmentRows.filter(function (assessment) {
      return String(getObjectValue_(assessment, ['Class ID', 'Class Id']) || '').trim() === classId;
    }).map(function (assessment) {
      const date = normalizeStudentDate_(getObjectValue_(assessment, ['Date', 'Tanggal']));
      return {
        assessmentId: String(getObjectValue_(assessment, ['Assessment ID']) || ''),
        date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
        studentId: String(getObjectValue_(assessment, ['Student ID']) || ''),
        studentName: String(getObjectValue_(assessment, ['Student Name']) || ''),
        type: String(getObjectValue_(assessment, ['Assessment Type', 'Jenis Penilaian']) || ''),
        speaking: Number(getObjectValue_(assessment, ['Speaking']) || 0),
        writing: Number(getObjectValue_(assessment, ['Writing']) || 0),
        reading: Number(getObjectValue_(assessment, ['Reading']) || 0),
        listening: Number(getObjectValue_(assessment, ['Listening']) || 0),
        quizTest: Number(getObjectValue_(assessment, ['Quiz / Test']) || 0),
        average: Number(getObjectValue_(assessment, ['Average Score']) || 0),
        finalGrade: String(getObjectValue_(assessment, ['Final Grade']) || ''),
        comment: String(getObjectValue_(assessment, ['Tutor Comment']) || '')
      };
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    classMap[classId].submissions = submissionRows.filter(function (item) { return String(getObjectValue_(item, ['Class ID']) || '') === classId; }).map(function (item) {
      const submittedAt = normalizeStudentDate_(getObjectValue_(item, ['Submitted At']));
      return { submissionId: String(getObjectValue_(item, ['Submission ID']) || ''), assignmentId: String(getObjectValue_(item, ['Assignment ID']) || ''), studentId: String(getObjectValue_(item, ['Student ID']) || ''), studentName: String(getObjectValue_(item, ['Student Name']) || ''), response: String(getObjectValue_(item, ['Response']) || ''), submittedAt: submittedAt ? Utilities.formatDate(submittedAt, timezone, 'yyyy-MM-dd') : '', status: String(getObjectValue_(item, ['Status']) || ''), score: getObjectValue_(item, ['Score']), feedback: String(getObjectValue_(item, ['Feedback']) || ''), expAwarded: Number(getObjectValue_(item, ['EXP Awarded']) || 0) };
    });
    classMap[classId].challenges = challengeRows.filter(function (item) { return String(getObjectValue_(item, ['Class ID']) || '') === classId && String(getObjectValue_(item, ['Status']) || 'Aktif').toLowerCase() !== 'nonaktif'; }).map(function (item) {
      const due = normalizeStudentDate_(getObjectValue_(item, ['Due Date'])); return { challengeId: String(getObjectValue_(item, ['Challenge ID']) || ''), planId: String(getObjectValue_(item, ['Plan ID']) || ''), meetingNumber: Number(getObjectValue_(item, ['Meeting Number']) || 0), targetCompetency: String(getObjectValue_(item, ['Target Competency']) || ''), title: String(getObjectValue_(item, ['Title']) || ''), instructions: String(getObjectValue_(item, ['Instructions']) || ''), responseType: String(getObjectValue_(item, ['Response Type']) || 'text'), dueDate: due ? Utilities.formatDate(due, timezone, 'yyyy-MM-dd') : '', expReward: Number(getObjectValue_(item, ['EXP Reward']) || 0) };
    });
    classMap[classId].challengeResults = challengeResultRows.filter(function (item) { return String(getObjectValue_(item, ['Class ID']) || '') === classId; }).map(function (item) {
      const submittedAt = normalizeStudentDate_(getObjectValue_(item, ['Submitted At']));
      return { resultId: String(getObjectValue_(item, ['Result ID']) || ''), challengeId: String(getObjectValue_(item, ['Challenge ID']) || ''), studentId: String(getObjectValue_(item, ['Student ID']) || ''), studentName: String(getObjectValue_(item, ['Student Name']) || ''), response: String(getObjectValue_(item, ['Response']) || ''), submittedAt: submittedAt ? Utilities.formatDate(submittedAt, timezone, 'yyyy-MM-dd') : '', status: String(getObjectValue_(item, ['Status']) || ''), score: getObjectValue_(item, ['Score']), feedback: String(getObjectValue_(item, ['Feedback']) || ''), expAwarded: Number(getObjectValue_(item, ['EXP Awarded']) || 0) };
    });
    classMap[classId].attendanceRecords = attendanceRows.filter(function (item) {
      const recordClassId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
      return !recordClassId || recordClassId === classId;
    }).filter(function (item) {
      const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
      return classMap[classId].students.some(function (student) { return student.studentId === studentId; });
    }).map(function (item) {
      const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
      const rawStatus = String(getObjectValue_(item, ['Status']) || '').toLowerCase();
      return {
        attendanceId: String(getObjectValue_(item, ['Attendance ID']) || ''),
        studentId: String(getObjectValue_(item, ['Student ID']) || ''),
        date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
        meetingNumber: Number(getObjectValue_(item, ['Pertemuan Ke', 'Meeting Number']) || 0),
        status: rawStatus === 'hadir' || rawStatus === 'present' ? 'Present' : 'Absent'
      };
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  });

  const classes = Object.keys(classMap).map(function (key) { return classMap[key]; });
  return {
    success: true,
    tutor: { name: session.fullName || session.name || session.username || 'Tutor', relatedId: session.relatedId || '' },
    generatedAt: now.toISOString(),
    classes: classes,
    attendanceFollowUps: getAttendanceFollowUpsForRole_(
      session,
      classes.map(function (item) { return item.classId; })
    ),
    challengeTemplates: classes.reduce(function (result, item) { result[item.classId] = getChallengeTemplates_(item.program); return result; }, {}),
    todayClasses: classes.filter(function (item) {
      return item.schedules.some(function (schedule) { return schedule.dayIndex === todayIndex; });
    })
  };
}

function saveTutorLearningPlan_(token, learningPlan) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menyimpan rencana pembelajaran.');
  learningPlan = learningPlan || {};
  const classId = String(learningPlan.classId || '').trim();
  const month = String(learningPlan.month || '').trim();
  const meetingNumber = Number(learningPlan.meetingNumber || 0);
  const plannedDate = String(learningPlan.plannedDate || '').trim();
  const title = String(learningPlan.title || '').trim();
  const objective = String(learningPlan.objective || '').trim();
  const targetCompetency = String(learningPlan.targetCompetency || '').trim();
  const activities = String(learningPlan.activities || '').trim();
  if (!classId || !/^\d{4}-\d{2}$/.test(month) || meetingNumber < 1 || meetingNumber > 8 || !title || !objective || !targetCompetency || !activities) {
    throw new Error('Kelas, bulan, pertemuan 1–8, materi, tujuan, target capaian, dan aktivitas wajib diisi.');
  }

  const dashboard = getTutorDashboard_(token);
  const tutorClass = dashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');

  const database = getDatabase_();
  let sheet = database.getSheetByName('Monthly Learning Plan');
  const headers = ['Plan ID', 'Month', 'Class ID', 'Class Name', 'Meeting Number', 'Planned Date', 'Tutor', 'Material / Topic', 'Learning Objective', 'Target Competency', 'Planned Activities', 'Status', 'Updated At'];
  if (!sheet) {
    sheet = database.insertSheet('Monthly Learning Plan');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders_(sheet, headers);
  }

  const rows = getSheetObjects_(sheet);
  const existingIndex = rows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
      String(getObjectValue_(item, ['Month', 'Bulan']) || '').trim() === month &&
      Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber;
  });
  const existing = existingIndex >= 0 ? rows[existingIndex] : null;
  const now = new Date();
  const values = {
    'Plan ID': existing ? String(getObjectValue_(existing, ['Plan ID']) || '') : 'PLAN-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss') + '-' + meetingNumber,
    'Month': month,
    'Class ID': classId,
    'Class Name': tutorClass.className,
    'Meeting Number': meetingNumber,
    'Planned Date': plannedDate ? new Date(plannedDate + 'T00:00:00+08:00') : '',
    'Tutor': dashboard.tutor.name,
    'Material / Topic': title,
    'Learning Objective': objective,
    'Target Competency': targetCompetency,
    'Planned Activities': activities,
    'Status': String(learningPlan.status || 'Direncanakan'),
    'Updated At': now
  };
  const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, sheetHeaders.length).setValues([sheetHeaders.map(function (header) {
      return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : getObjectValue_(existing, [header]);
    })]);
  } else {
    sheet.appendRow(sheetHeaders.map(function (header) { return values[header] || ''; }));
  }
  const packageMessages = [];
  if (learningPlan.assignment && learningPlan.assignment.enabled) {
    const assignmentResult = createTutorAssignment_(token, {
      classId: classId,
      planId: values['Plan ID'],
      month: month,
      meetingNumber: meetingNumber,
      targetCompetency: targetCompetency,
      title: learningPlan.assignment.title,
      instructions: learningPlan.assignment.instructions,
      assignedDate: learningPlan.assignment.assignedDate || plannedDate || month + '-01',
      dueDate: learningPlan.assignment.dueDate,
      expReward: learningPlan.assignment.expReward,
      gradingMode: learningPlan.assignment.gradingMode,
      answerKey: learningPlan.assignment.answerKey,
      questions: learningPlan.assignment.questions
    });
    packageMessages.push(assignmentResult.message);
  }
  if (learningPlan.challenge && learningPlan.challenge.enabled) {
    const challengeResult = createTutorChallenge_(token, {
      classId: classId,
      planId: values['Plan ID'],
      month: month,
      meetingNumber: meetingNumber,
      targetCompetency: targetCompetency,
      title: learningPlan.challenge.title,
      instructions: learningPlan.challenge.instructions,
      responseType: learningPlan.challenge.responseType,
      dueDate: learningPlan.challenge.dueDate,
      expReward: learningPlan.challenge.expReward,
      gradingMode: learningPlan.challenge.gradingMode,
      answerKey: learningPlan.challenge.answerKey
    });
    packageMessages.push(challengeResult.message);
  }
  return {
    success: true,
    message: 'Paket pembelajaran pertemuan ' + meetingNumber + ' berhasil disimpan.' + (packageMessages.length ? ' ' + packageMessages.join(' ') : ''),
    planId: values['Plan ID']
  };
}

function saveTutorJournal_(token, journal) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menyimpan jurnal.');
  journal = journal || {};
  const classId = String(journal.classId || '').trim();
  const dateText = String(journal.date || '').trim();
  const meetingNumber = Number(journal.meetingNumber || 0);
  const material = String(journal.title || '').trim();
  const activities = String(journal.activities || '').trim();
  if (!classId || !dateText || meetingNumber < 1 || meetingNumber > 8 || !material || !activities) {
    throw new Error('Kelas, tanggal, pertemuan 1–8, materi, dan aktivitas wajib diisi.');
  }

  const tutorDashboard = getTutorDashboard_(token);
  const tutorClass = tutorDashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');

  const database = getDatabase_();
  let sheet = database.getSheetByName('Learning Journal');
  const headers = ['Journal ID', 'Date', 'Class ID', 'Class Name', 'Meeting Number', 'Tutor', 'Material / Topic', 'Activities', 'Tutor Notes', 'Updated At'];
  if (!sheet) {
    sheet = database.insertSheet('Learning Journal');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  const rows = getSheetObjects_(sheet);
  const existingIndex = rows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
      Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber &&
      String(getObjectValue_(item, ['Date', 'Tanggal']) || '').slice(0, 10) === dateText.slice(0, 10);
  });
  const existing = existingIndex >= 0 ? rows[existingIndex] : null;
  const now = new Date();
  const values = {
    'Journal ID': existing ? String(getObjectValue_(existing, ['Journal ID']) || '') : 'JRN-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'),
    'Date': new Date(dateText + 'T00:00:00+08:00'), 'Class ID': classId, 'Class Name': tutorClass.className,
    'Meeting Number': meetingNumber, 'Tutor': tutorDashboard.tutor.name, 'Material / Topic': material,
    'Activities': activities, 'Tutor Notes': String(journal.notes || '').trim(), 'Updated At': now
  };

  if (existingIndex >= 0) {
    const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    sheet.getRange(existingIndex + 2, 1, 1, sheetHeaders.length).setValues([sheetHeaders.map(function (header) {
      return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : getObjectValue_(existing, [header]);
    })]);
  } else {
    sheet.appendRow(headers.map(function (header) { return values[header]; }));
  }
  const planSheet = database.getSheetByName('Monthly Learning Plan');
  if (planSheet) {
    const planRows = getSheetObjects_(planSheet);
    const journalMonth = Utilities.formatDate(new Date(dateText + 'T00:00:00+08:00'), 'Asia/Makassar', 'yyyy-MM');
    const planIndex = planRows.findIndex(function (item) {
      return String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
        String(getObjectValue_(item, ['Month', 'Bulan']) || '').trim() === journalMonth &&
        Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber;
    });
    if (planIndex >= 0) {
      const planHeaders = planSheet.getRange(1, 1, 1, planSheet.getLastColumn()).getDisplayValues()[0];
      const statusColumn = planHeaders.indexOf('Status') + 1;
      const updatedColumn = planHeaders.indexOf('Updated At') + 1;
      if (statusColumn > 0) planSheet.getRange(planIndex + 2, statusColumn).setValue('Terlaksana');
      if (updatedColumn > 0) planSheet.getRange(planIndex + 2, updatedColumn).setValue(now);
    }
  }
  const studentEntries = Array.isArray(journal.studentEntries) ? journal.studentEntries : [];
  let savedStudentCount = 0;

  if (studentEntries.length) {
    let notesSheet = database.getSheetByName('Student Notes');
    const noteHeaders = [
      'Note ID', 'Date', 'Student ID', 'Student Name', 'Class ID', 'Class Name',
      'Tutor', 'Participation', 'Strengths', 'Areas for Improvement',
      'Tutor Comment', 'Achievement', 'EXP Awarded', 'Source',
      'Meeting Number', 'Material / Topic', 'Updated At'
    ];

    if (!notesSheet) {
      notesSheet = database.insertSheet('Student Notes');
      notesSheet.getRange(1, 1, 1, noteHeaders.length).setValues([noteHeaders]);
      notesSheet.setFrozenRows(1);
    } else {
      ensureHeaders_(notesSheet, noteHeaders);
    }

    const noteRows = getSheetObjects_(notesSheet);
    const noteSheetHeaders = notesSheet.getRange(1, 1, 1, notesSheet.getLastColumn()).getDisplayValues()[0];

    studentEntries.forEach(function (entry, index) {
      if (!entry || entry.selected === false) return;
      const studentId = String(entry.studentId || '').trim();
      const student = tutorClass.students.find(function (item) { return item.studentId === studentId; });
      if (!student) return;

      const comment = String(entry.comment || '').trim();
      if (!comment) return;

      const existingNoteIndex = noteRows.findIndex(function (item) {
        const noteDate = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
        const formattedDate = noteDate ? Utilities.formatDate(noteDate, 'Asia/Makassar', 'yyyy-MM-dd') : '';
        return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
          String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
          formattedDate === dateText &&
          Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber &&
          String(getObjectValue_(item, ['Source', 'Sumber']) || '').trim() === 'Learning Journal';
      });
      const existingNote = existingNoteIndex >= 0 ? noteRows[existingNoteIndex] : null;
      const achievement = String(entry.achievement || 'Berkembang').trim();
      const noteValues = {
        'Note ID': existingNote ? String(getObjectValue_(existingNote, ['Note ID']) || '') : 'NOTE-JRN-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss') + '-' + (index + 1),
        'Date': new Date(dateText + 'T00:00:00+08:00'),
        'Student ID': studentId,
        'Student Name': student.fullName,
        'Class ID': classId,
        'Class Name': tutorClass.className,
        'Tutor': tutorDashboard.tutor.name,
        'Participation': achievement,
        'Strengths': String(entry.strengths || '').trim(),
        'Areas for Improvement': String(entry.improvements || '').trim(),
        'Tutor Comment': comment,
        'Achievement': achievement,
        'EXP Awarded': 0,
        'Source': 'Learning Journal',
        'Meeting Number': meetingNumber,
        'Material / Topic': material,
        'Updated At': now
      };

      if (existingNoteIndex >= 0) {
        notesSheet.getRange(existingNoteIndex + 2, 1, 1, noteSheetHeaders.length).setValues([
          noteSheetHeaders.map(function (header) {
            return Object.prototype.hasOwnProperty.call(noteValues, header) ? noteValues[header] : getObjectValue_(existingNote, [header]);
          })
        ]);
      } else {
        notesSheet.appendRow(noteSheetHeaders.map(function (header) { return noteValues[header] || ''; }));
      }
      savedStudentCount += 1;
    });
  }

  return {
    success: true,
    message: savedStudentCount
      ? 'Learning Journal dan capaian ' + savedStudentCount + ' siswa berhasil disimpan.'
      : 'Learning Journal berhasil disimpan.',
    savedStudentCount: savedStudentCount
  };
}

function saveTutorStudentNote_(token, note) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menyimpan catatan siswa.');
  note = note || {};
  const classId = String(note.classId || '').trim();
  const studentId = String(note.studentId || '').trim();
  const dateText = String(note.date || '').trim();
  const comment = String(note.comment || '').trim();
  const expAwarded = Math.max(0, Math.min(250, Number(note.expAwarded || 0)));
  if (!classId || !studentId || !dateText || !comment) throw new Error('Kelas, siswa, tanggal, dan komentar tutor wajib diisi.');

  const tutorDashboard = getTutorDashboard_(token);
  const tutorClass = tutorDashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');
  const student = tutorClass.students.find(function (item) { return item.studentId === studentId; });
  if (!student) throw new Error('Siswa tidak terdaftar di kelas tersebut.');

  const database = getDatabase_();
  let sheet = database.getSheetByName('Student Notes');
  const headers = ['Note ID', 'Date', 'Student ID', 'Student Name', 'Class ID', 'Class Name', 'Tutor', 'Participation', 'Strengths', 'Areas for Improvement', 'Tutor Comment', 'Achievement', 'EXP Awarded', 'Updated At'];
  if (!sheet) {
    sheet = database.insertSheet('Student Notes');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders_(sheet, headers);
  }

  const now = new Date();
  const rows = getSheetObjects_(sheet);
  const existingIndex = rows.findIndex(function (item) {
    const itemDate = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    const formattedDate = itemDate ? Utilities.formatDate(itemDate, 'Asia/Makassar', 'yyyy-MM-dd') : '';
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId &&
      formattedDate === dateText &&
      String(getObjectValue_(item, ['Source', 'Sumber']) || '').trim() !== 'Learning Journal';
  });
  const existing = existingIndex >= 0 ? rows[existingIndex] : null;

  const values = {
    'Note ID': existing
      ? String(getObjectValue_(existing, ['Note ID']) || '')
      : 'NOTE-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'),
    'Date': new Date(dateText + 'T00:00:00+08:00'),
    'Student ID': studentId,
    'Student Name': student.fullName,
    'Class ID': classId,
    'Class Name': tutorClass.className,
    'Tutor': tutorDashboard.tutor.name,
    'Participation': String(note.participation || ''),
    'Strengths': String(note.strengths || '').trim(),
    'Areas for Improvement': String(note.improvements || '').trim(),
    'Tutor Comment': comment,
    'Achievement': String(note.achievement || '').trim(),
    'EXP Awarded': expAwarded,
    'Updated At': now
  };

  const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const rowValues = sheetHeaders.map(function (header) {
    return Object.prototype.hasOwnProperty.call(values, header)
      ? values[header]
      : (existing ? getObjectValue_(existing, [header]) : '');
  });

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, sheetHeaders.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return {
    success: true,
    updatedExisting: existingIndex >= 0,
    message: existingIndex >= 0
      ? 'Catatan siswa pada tanggal yang sama berhasil diperbarui.'
      : 'Catatan individual siswa berhasil disimpan.'
  };
}

function createTutorAssignment_(token, assignment) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat membuat tugas.');
  assignment = assignment || {};
  const classId = String(assignment.classId || '').trim();
  const title = String(assignment.title || '').trim();
  const instructions = String(assignment.instructions || '').trim();
  const assignedDate = String(assignment.assignedDate || '').trim();
  const dueDate = String(assignment.dueDate || '').trim();
  const expReward = Math.max(0, Math.min(200, Number(assignment.expReward || 0)));
  const gradingMode = String(assignment.gradingMode || 'automatic').toLowerCase() === 'automatic' ? 'Automatic' : 'Tutor Review';
  const answerKey = String(assignment.answerKey || '').trim();
  const questions = (Array.isArray(assignment.questions) ? assignment.questions : []).map(function (item, index) {
    return {
      id: String(item.id || 'q-' + (index + 1)),
      text: String(item.text || '').trim(),
      options: (Array.isArray(item.options) ? item.options : []).slice(0, 4).map(function (option) { return String(option || '').trim(); }),
      correctOption: Number(item.correctOption || 0),
      points: Math.max(1, Math.min(100, Number(item.points || 1)))
    };
  }).filter(function (item) { return item.text || item.options.some(function (option) { return option; }); });
  const totalPoints = questions.reduce(function (sum, item) { return sum + item.points; }, 0);
  if (!classId || !title || !instructions || !assignedDate || !dueDate) throw new Error('Kelas, judul, instruksi, tanggal, dan tenggat wajib diisi.');
  if (gradingMode === 'Automatic' && !questions.length && !answerKey) throw new Error('Tambahkan soal dan kunci jawaban untuk penilaian otomatis.');
  if (questions.some(function (item) { return !item.text || item.options.length !== 4 || item.options.some(function (option) { return !option; }) || item.correctOption < 0 || item.correctOption > 3; })) throw new Error('Setiap soal harus memiliki pertanyaan, empat pilihan, kunci jawaban, dan bobot poin.');
  const tutorDashboard = getTutorDashboard_(token);
  const tutorClass = tutorDashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');
  const database = getDatabase_();
  let sheet = database.getSheetByName('Assignments');
  const headers = ['Assignment ID', 'Plan ID', 'Month', 'Meeting Number', 'Target Competency', 'Class ID', 'Class Name', 'Program', 'Title', 'Instructions', 'Questions JSON', 'Total Points', 'Assigned Date', 'Due Date', 'Max Score', 'EXP Reward', 'Grading Mode', 'Answer Key', 'Status', 'Tutor', 'Updated At'];
  if (!sheet) { sheet = database.insertSheet('Assignments'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  else ensureStudentPortalColumns_(sheet, headers);
  const now = new Date();
  const planId = String(assignment.planId || '').trim();
  const existingRows = getSheetObjects_(sheet);
  const existingIndex = planId ? existingRows.findIndex(function (item) { return String(getObjectValue_(item, ['Plan ID']) || '').trim() === planId; }) : -1;
  const existing = existingIndex >= 0 ? existingRows[existingIndex] : null;
  const rowValues = { 'Assignment ID': existing ? String(getObjectValue_(existing, ['Assignment ID']) || '') : 'ASG-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'), 'Plan ID': planId, 'Month': String(assignment.month || ''), 'Meeting Number': Number(assignment.meetingNumber || 0), 'Target Competency': String(assignment.targetCompetency || ''), 'Class ID': classId, 'Class Name': tutorClass.className, 'Program': tutorClass.program, 'Title': title, 'Instructions': instructions, 'Questions JSON': questions.length ? JSON.stringify(questions) : '', 'Total Points': totalPoints, 'Assigned Date': new Date(assignedDate + 'T00:00:00+08:00'), 'Due Date': new Date(dueDate + 'T23:59:59+08:00'), 'Max Score': 100, 'EXP Reward': expReward, 'Grading Mode': gradingMode, 'Answer Key': answerKey, 'Status': 'Aktif', 'Tutor': tutorDashboard.tutor.name, 'Updated At': now };
  const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, sheetHeaders.length).setValues([sheetHeaders.map(function (header) { return Object.prototype.hasOwnProperty.call(rowValues, header) ? rowValues[header] : getObjectValue_(existing, [header]); })]);
  } else {
    sheet.appendRow(sheetHeaders.map(function (header) { return Object.prototype.hasOwnProperty.call(rowValues, header) ? rowValues[header] : ''; }));
  }
  return { success: true, message: existing ? 'Assignment rencana berhasil diperbarui.' : 'Assignment berhasil dibuat.' };
}

function ensureStudentPortalColumns_(sheet, requiredHeaders) {
  const current = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getDisplayValues()[0];
  requiredHeaders.forEach(function (header) {
    if (current.indexOf(header) < 0) {
      sheet.getRange(1, current.length + 1).setValue(header);
      current.push(header);
    }
  });
}

function normalizeAutoGradeText_(value) {
  return String(value || '').toLowerCase().replace(/^\s*\d+\s*[.)-]\s*/, '').replace(/[^a-z0-9\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function autoGradeSpeakingResponse_(transcript, target, expReward) {
  function normalize_(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const spoken = normalize_(transcript);
  const expected = normalize_(target);

  if (!spoken || !expected) {
    return {
      score: 0,
      feedback: 'Speaking belum dapat dinilai. Ulangi dengan suara yang lebih jelas.',
      expAwarded: 0
    };
  }

  const spokenWords = spoken.split(' ').filter(Boolean);
  const expectedWords = expected.split(' ').filter(Boolean);
  const matched = expectedWords.filter(function (word) {
    return spokenWords.indexOf(word) >= 0;
  }).length;

  const precision = spokenWords.length ? matched / spokenWords.length : 0;
  const recall = expectedWords.length ? matched / expectedWords.length : 0;
  const score = Math.max(0, Math.min(100, Math.round(((precision + recall) / 2) * 100)));
  const reward = Math.max(0, Number(expReward || 0));
  const expAwarded = Math.round(reward * score / 100);

  let feedback = '';
  if (score >= 90) {
    feedback = 'Excellent speaking. Kata yang terdeteksi sangat dekat dengan target. Pertahankan kejelasan dan ritmenya.';
  } else if (score >= 75) {
    feedback = 'Good speaking. Sebagian besar kata sudah tepat. Ulangi untuk meningkatkan kejelasan kata yang belum terdeteksi.';
  } else if (score >= 55) {
    feedback = 'Developing well. Coba ucapkan lebih perlahan dan beri penekanan pada setiap kata target.';
  } else {
    feedback = 'Keep practicing. Ucapkan target lebih perlahan, jelas, dan dekatkan mikrofon.';
  }

  return {
    score: score,
    feedback: feedback,
    expAwarded: expAwarded
  };
}

function autoGradeStudentResponse_(response, answerKey, maxExp) {
  const keys = String(answerKey || '').split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
  const answers = String(response || '').split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
  if (!keys.length) throw new Error('Kunci jawaban belum tersedia.');
  let correct = 0;
  keys.forEach(function (keyLine, index) {
    const accepted = keyLine.split('|').map(normalizeAutoGradeText_).filter(Boolean);
    const studentAnswer = normalizeAutoGradeText_(answers[index] || '');
    if (studentAnswer && accepted.indexOf(studentAnswer) >= 0) correct += 1;
  });
  const score = Math.round(correct / keys.length * 100);
  return {
    score: score,
    expAwarded: Math.round(Math.max(0, Number(maxExp || 0)) * score / 100),
    feedback: 'Penilaian otomatis: ' + correct + ' dari ' + keys.length + ' jawaban benar.'
  };
}

function autoGradeStructuredAssignment_(response, questions, maxExp) {
  let answers = {};
  try { answers = JSON.parse(String(response || '{}')); } catch (error) { throw new Error('Format jawaban assignment tidak valid.'); }
  const rows = Array.isArray(questions) ? questions : [];
  const totalPoints = rows.reduce(function (sum, item) { return sum + Math.max(1, Number(item.points || 1)); }, 0);
  let earnedPoints = 0;
  let correct = 0;
  rows.forEach(function (item, index) {
    const selected = Number(Object.prototype.hasOwnProperty.call(answers, item.id) ? answers[item.id] : answers[index]);
    if (selected === Number(item.correctOption)) {
      correct += 1;
      earnedPoints += Math.max(1, Number(item.points || 1));
    }
  });
  const score = totalPoints ? Math.round(earnedPoints / totalPoints * 100) : 0;
  return { score: score, expAwarded: Math.round(Math.max(0, Number(maxExp || 0)) * score / 100), feedback: 'Penilaian otomatis: ' + correct + '/' + rows.length + ' jawaban benar, ' + earnedPoints + '/' + totalPoints + ' poin.' };
}

function saveTutorAssessment_(token, assessment) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menyimpan penilaian.');
  assessment = assessment || {};
  const classId = String(assessment.classId || '').trim();
  const studentId = String(assessment.studentId || '').trim();
  const dateText = String(assessment.date || '').trim();
  const type = String(assessment.type || '').trim();
  if (!classId || !studentId || !dateText || !type) throw new Error('Kelas, siswa, tanggal, dan jenis penilaian wajib diisi.');
  const tutorDashboard = getTutorDashboard_(token);
  const tutorClass = tutorDashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');
  const student = tutorClass.students.find(function (item) { return item.studentId === studentId; });
  if (!student) throw new Error('Siswa tidak terdaftar di kelas tersebut.');
  function score(value) { const number = Number(value); return value === '' || value === null || typeof value === 'undefined' || isNaN(number) ? '' : Math.max(0, Math.min(100, number)); }
  const scores = { speaking: score(assessment.speaking), writing: score(assessment.writing), reading: score(assessment.reading), listening: score(assessment.listening), quizTest: score(assessment.quizTest) };
  const validScores = Object.keys(scores).map(function (key) { return scores[key]; }).filter(function (value) { return value !== ''; });
  if (!validScores.length) throw new Error('Isi minimal satu nilai antara 0–100.');
  const average = Math.round(validScores.reduce(function (sum, value) { return sum + value; }, 0) / validScores.length * 10) / 10;
  const grade = average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'E';
  const database = getDatabase_();
  let sheet = database.getSheetByName('Assessment Scores');
  const headers = ['Assessment ID', 'Date', 'Period', 'Student ID', 'Student Name', 'Class ID', 'Class Name', 'Tutor', 'Assessment Type', 'Speaking', 'Writing', 'Reading', 'Listening', 'Quiz / Test', 'Average Score', 'Final Grade', 'Tutor Comment', 'Updated At'];
  if (!sheet) { sheet = database.insertSheet('Assessment Scores'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  const now = new Date();
  sheet.appendRow(['ASM-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'), new Date(dateText + 'T00:00:00+08:00'), Utilities.formatDate(new Date(dateText + 'T00:00:00+08:00'), 'Asia/Makassar', 'MMMM yyyy'), studentId, student.fullName, classId, tutorClass.className, tutorDashboard.tutor.name, type, scores.speaking, scores.writing, scores.reading, scores.listening, scores.quizTest, average, grade, String(assessment.comment || '').trim(), now]);
  return { success: true, message: 'Penilaian siswa berhasil disimpan.', average: average, finalGrade: grade };
}

function getChallengeTemplates_(program) {
  const key = String(program || '').toLowerCase();

  if (key.indexOf('grammar') >= 0) return [
    {
      title: 'Sentence Builder',
      instructions: 'Susun menjadi kalimat yang benar: always / she / English / studies',
      responseType: 'text',
      answerKey: 'She always studies English.',
      gradingMode: 'automatic'
    },
    {
      title: 'Grammar Correction',
      instructions: 'Perbaiki kalimat berikut: He go to school every day.',
      responseType: 'text',
      answerKey: 'He goes to school every day.',
      gradingMode: 'automatic'
    },
    {
      title: 'Tense Challenge',
      instructions: 'Ubah menjadi Simple Past: They play football yesterday.',
      responseType: 'text',
      answerKey: 'They played football yesterday.',
      gradingMode: 'automatic'
    }
  ];

  if (key.indexOf('speaking') >= 0) return [
    {
      title: 'Word Practice',
      instructions: 'Dengarkan target di layar lalu ucapkan menggunakan mikrofon.',
      responseType: 'speech',
      answerKey: 'beautiful',
      gradingMode: 'automatic'
    },
    {
      title: 'Phrase Practice',
      instructions: 'Ikuti frasa yang tampil lalu ucapkan dengan jelas.',
      responseType: 'speech',
      answerKey: 'How are you today?',
      gradingMode: 'automatic'
    },
    {
      title: 'Sentence Practice',
      instructions: 'Ikuti sentence yang tampil lalu ucapkan dengan jelas.',
      responseType: 'speech',
      answerKey: 'Practice makes progress.',
      gradingMode: 'automatic'
    }
  ];

  if (key.indexOf('primary') >= 0 || key.indexOf('kids') >= 0) return [
    {
      title: 'Vocabulary Fun',
      instructions: 'Tuliskan bahasa Inggris dari kata: kucing',
      responseType: 'text',
      answerKey: 'cat',
      gradingMode: 'automatic'
    },
    {
      title: 'Simple Sentence',
      instructions: 'Lengkapi kalimat: I ___ a student.',
      responseType: 'text',
      answerKey: 'am',
      gradingMode: 'automatic'
    },
    {
      title: 'Primary Speaking',
      instructions: 'Ikuti kalimat yang tampil lalu ucapkan menggunakan mikrofon.',
      responseType: 'speech',
      answerKey: 'I like English.',
      gradingMode: 'automatic'
    }
  ];

  return [
    {
      title: 'Vocabulary Challenge',
      instructions: 'Gunakan kosakata baru dalam kalimat.',
      responseType: 'text',
      gradingMode: 'review'
    },
    {
      title: 'Sentence Challenge',
      instructions: 'Buat kalimat sesuai topik program.',
      responseType: 'text',
      gradingMode: 'review'
    }
  ];
}

function submitStudentAssignment_(token, submission) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'siswa') throw new Error('Hanya siswa yang dapat mengumpulkan tugas.');
  submission = submission || {};
  const studentId = String(session.relatedId || session.userId || '').trim();
  const assignmentId = String(submission.assignmentId || '').trim();
  const response = String(submission.response || '').trim();
  if (!assignmentId || !response) throw new Error('Jawaban atau tautan tugas wajib diisi.');
  const database = getDatabase_();
  const student = getSheetObjects_(database.getSheetByName('Data Siswa')).find(function (item) { return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId; });
  const assignmentSheet = database.getSheetByName('Assignments');
  if (!student || !assignmentSheet) throw new Error('Data siswa atau assignment tidak ditemukan.');
  const assignment = getSheetObjects_(assignmentSheet).find(function (item) { return String(getObjectValue_(item, ['Assignment ID']) || '').trim() === assignmentId; });
  const classId = String(getObjectValue_(student, ['Class ID']) || '').trim();
  if (!assignment || String(getObjectValue_(assignment, ['Class ID']) || '').trim() !== classId) throw new Error('Assignment tidak tersedia untuk kelas Anda.');
  let sheet = database.getSheetByName('Assignment Submissions');
  const headers = ['Submission ID', 'Assignment ID', 'Class ID', 'Student ID', 'Student Name', 'Response', 'Submitted At', 'Status', 'Score', 'Feedback', 'EXP Awarded', 'Reviewed At'];
  if (!sheet) { sheet = database.insertSheet('Assignment Submissions'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  const rows = getSheetObjects_(sheet);
  const index = rows.findIndex(function (item) { return String(getObjectValue_(item, ['Assignment ID']) || '') === assignmentId && String(getObjectValue_(item, ['Student ID']) || '') === studentId; });
  const now = new Date();
  const automatic = String(getObjectValue_(assignment, ['Grading Mode']) || '').toLowerCase() === 'automatic';
  let assignmentQuestions = [];
  try { assignmentQuestions = JSON.parse(String(getObjectValue_(assignment, ['Questions JSON']) || '[]')); } catch (error) { assignmentQuestions = []; }
  const grade = automatic ? (assignmentQuestions.length ? autoGradeStructuredAssignment_(response, assignmentQuestions, getObjectValue_(assignment, ['EXP Reward'])) : autoGradeStudentResponse_(response, getObjectValue_(assignment, ['Answer Key']), getObjectValue_(assignment, ['EXP Reward']))) : null;
  const values = [index >= 0 ? String(getObjectValue_(rows[index], ['Submission ID']) || '') : 'SUB-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'), assignmentId, classId, studentId, String(getObjectValue_(student, ['Full Name', 'Nama']) || ''), response, now, automatic ? 'Reviewed' : 'Submitted', automatic ? grade.score : '', automatic ? grade.feedback : '', automatic ? grade.expAwarded : 0, automatic ? now : ''];
  if (index >= 0) sheet.getRange(index + 2, 1, 1, headers.length).setValues([values]); else sheet.appendRow(values);
  const assignmentGamification = automatic && grade.expAwarded > 0 ? awardStudentExpV22_({
    studentId: studentId,
    sourceType: 'Assignment',
    sourceId: assignmentId,
    activityName: String(getObjectValue_(assignment, ['Title']) || 'Assignment'),
    exp: grade.expAwarded,
    skillCategory: 'Assignment',
    timestamp: now
  }) : null;
  return { success: true, message: automatic ? 'Assignment langsung diperiksa. Nilai Anda: ' + grade.score + '/100.' : 'Assignment berhasil dikumpulkan dan menunggu penilaian tutor.', score: automatic ? grade.score : null, expAwarded: automatic ? grade.expAwarded : 0, gamification: assignmentGamification && assignmentGamification.awarded ? { expAwarded: assignmentGamification.expAwarded, message: 'Assignment completed' } : null, status: automatic ? 'Reviewed' : 'Submitted' };
}

function reviewTutorAssignment_(token, review) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menilai assignment.');
  review = review || {};
  const submissionId = String(review.submissionId || '').trim();
  const score = Math.max(0, Math.min(100, Number(review.score || 0)));
  const exp = Math.max(0, Math.min(200, Number(review.expAwarded || 0)));
  const database = getDatabase_();
  const sheet = database.getSheetByName('Assignment Submissions');
  if (!sheet || !submissionId) throw new Error('Pengumpulan tugas tidak ditemukan.');
  const rows = getSheetObjects_(sheet); const index = rows.findIndex(function (item) { return String(getObjectValue_(item, ['Submission ID']) || '') === submissionId; });
  if (index < 0) throw new Error('Pengumpulan tugas tidak ditemukan.');
  const allowed = getTutorDashboard_(token).classes.some(function (item) { return item.classId === String(getObjectValue_(rows[index], ['Class ID']) || ''); });
  if (!allowed) throw new Error('Tutor tidak memiliki akses ke pengumpulan ini.');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const updates = { 'Status': 'Reviewed', 'Score': score, 'Feedback': String(review.feedback || '').trim(), 'EXP Awarded': exp, 'Reviewed At': new Date() };
  sheet.getRange(index + 2, 1, 1, headers.length).setValues([headers.map(function (header) { return Object.prototype.hasOwnProperty.call(updates, header) ? updates[header] : getObjectValue_(rows[index], [header]); })]);
  if (exp > 0) {
    awardStudentExpV22_({
      studentId: String(getObjectValue_(rows[index], ['Student ID']) || ''),
      sourceType: 'Assignment',
      sourceId: String(getObjectValue_(rows[index], ['Assignment ID']) || ''),
      activityName: 'Assignment',
      exp: exp,
      skillCategory: 'Assignment',
      timestamp: new Date()
    });
  }
  return { success: true, message: 'Assignment berhasil dinilai.' };
}

function createTutorChallenge_(token, challenge) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat membuat challenge.');
  challenge = challenge || {};
  const classId = String(challenge.classId || '').trim(); const title = String(challenge.title || '').trim(); const instructions = String(challenge.instructions || '').trim();
  if (!classId || !title || !instructions || !challenge.dueDate) throw new Error('Kelas, judul, instruksi, dan tenggat wajib diisi.');
  const dashboard = getTutorDashboard_(token); const tutorClass = dashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');
  const database = getDatabase_(); let sheet = database.getSheetByName('Challenges');
  const gradingMode = String(challenge.gradingMode || 'automatic').toLowerCase() === 'automatic' ? 'Automatic' : 'Tutor Review';
  const answerKey = String(challenge.answerKey || '').trim();
  if (gradingMode === 'Automatic' && ['text', 'speech'].indexOf(String(challenge.responseType || 'text')) === -1) throw new Error('Penilaian otomatis hanya tersedia untuk jawaban teks atau speaking.');
  if (gradingMode === 'Automatic' && !answerKey) throw new Error('Kunci jawaban wajib diisi untuk penilaian otomatis.');
  const headers = ['Challenge ID', 'Plan ID', 'Month', 'Meeting Number', 'Target Competency', 'Class ID', 'Class Name', 'Program', 'Title', 'Instructions', 'Response Type', 'Due Date', 'EXP Reward', 'Grading Mode', 'Answer Key', 'Status', 'Tutor', 'Created At'];
  if (!sheet) { sheet = database.insertSheet('Challenges'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  else ensureStudentPortalColumns_(sheet, headers);
  const now = new Date();
  const planId = String(challenge.planId || '').trim();
  const existingRows = getSheetObjects_(sheet);
  const existingIndex = planId ? existingRows.findIndex(function (item) { return String(getObjectValue_(item, ['Plan ID']) || '').trim() === planId; }) : -1;
  const existing = existingIndex >= 0 ? existingRows[existingIndex] : null;
  const rowValues = { 'Challenge ID': existing ? String(getObjectValue_(existing, ['Challenge ID']) || '') : 'CHL-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'), 'Plan ID': planId, 'Month': String(challenge.month || ''), 'Meeting Number': Number(challenge.meetingNumber || 0), 'Target Competency': String(challenge.targetCompetency || ''), 'Class ID': classId, 'Class Name': tutorClass.className, 'Program': tutorClass.program, 'Title': title, 'Instructions': instructions, 'Response Type': String(challenge.responseType || 'text'), 'Due Date': new Date(String(challenge.dueDate) + 'T23:59:59+08:00'), 'EXP Reward': Math.max(0, Math.min(250, Number(challenge.expReward || 150))), 'Grading Mode': gradingMode, 'Answer Key': answerKey, 'Status': 'Aktif', 'Tutor': dashboard.tutor.name, 'Created At': existing ? getObjectValue_(existing, ['Created At']) || now : now };
  const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, sheetHeaders.length).setValues([sheetHeaders.map(function (header) { return Object.prototype.hasOwnProperty.call(rowValues, header) ? rowValues[header] : getObjectValue_(existing, [header]); })]);
  } else {
    sheet.appendRow(sheetHeaders.map(function (header) { return Object.prototype.hasOwnProperty.call(rowValues, header) ? rowValues[header] : ''; }));
  }
  return { success: true, message: existing ? 'Challenge rencana berhasil diperbarui.' : 'Challenge berhasil dibuat.' };
}

function submitStudentChallenge_(token, submission) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'siswa') throw new Error('Hanya siswa yang dapat mengirim challenge.');
  submission = submission || {}; const studentId = String(session.relatedId || session.userId || '').trim(); const challengeId = String(submission.challengeId || '').trim(); const response = String(submission.response || '').trim();
  if (!challengeId || !response) throw new Error('Jawaban atau tautan challenge wajib diisi.');
  const database = getDatabase_(); const student = getSheetObjects_(database.getSheetByName('Data Siswa')).find(function (item) { return String(getObjectValue_(item, ['Student ID']) || '') === studentId; }); const challengeSheet = database.getSheetByName('Challenges');
  if (!student || !challengeSheet) throw new Error('Challenge tidak ditemukan.');
  const challenge = getSheetObjects_(challengeSheet).find(function (item) { return String(getObjectValue_(item, ['Challenge ID']) || '') === challengeId; }); const classId = String(getObjectValue_(student, ['Class ID']) || '');
  if (!challenge || String(getObjectValue_(challenge, ['Class ID']) || '') !== classId) throw new Error('Challenge tidak tersedia untuk kelas Anda.');
  let sheet = database.getSheetByName('Challenge Results'); const headers = ['Result ID', 'Challenge ID', 'Class ID', 'Student ID', 'Student Name', 'Response', 'Submitted At', 'Status', 'Score', 'Feedback', 'EXP Awarded', 'Reviewed At'];
  if (!sheet) { sheet = database.insertSheet('Challenge Results'); sheet.getRange(1, 1, 1, headers.length).setValues([headers]); sheet.setFrozenRows(1); }
  const rows = getSheetObjects_(sheet); const index = rows.findIndex(function (item) { return String(getObjectValue_(item, ['Challenge ID']) || '') === challengeId && String(getObjectValue_(item, ['Student ID']) || '') === studentId; }); const now = new Date();
  const automatic = String(getObjectValue_(challenge, ['Grading Mode']) || '').toLowerCase() === 'automatic';
  const responseType = String(getObjectValue_(challenge, ['Response Type']) || 'text').toLowerCase();
  const grade = automatic
    ? (responseType === 'speech'
        ? autoGradeSpeakingResponse_(response, getObjectValue_(challenge, ['Answer Key']), getObjectValue_(challenge, ['EXP Reward']))
        : autoGradeStudentResponse_(response, getObjectValue_(challenge, ['Answer Key']), getObjectValue_(challenge, ['EXP Reward'])))
    : null;
  const values = [index >= 0 ? String(getObjectValue_(rows[index], ['Result ID']) || '') : 'RES-' + Utilities.formatDate(now, 'Asia/Makassar', 'yyyyMMddHHmmss'), challengeId, classId, studentId, String(getObjectValue_(student, ['Full Name', 'Nama']) || ''), response, now, automatic ? 'Reviewed' : 'Submitted', automatic ? grade.score : '', automatic ? grade.feedback : '', automatic ? grade.expAwarded : 0, automatic ? now : ''];
  if (index >= 0) sheet.getRange(index + 2, 1, 1, headers.length).setValues([values]); else sheet.appendRow(values);
  const challengeGamification = automatic && grade.expAwarded > 0 ? awardStudentExpV22_({
    studentId: studentId,
    sourceType: 'Challenge',
    sourceId: challengeId,
    activityName: String(getObjectValue_(challenge, ['Title']) || 'Challenge'),
    exp: grade.expAwarded,
    skillCategory: responseType === 'speech' ? 'Speaking' : 'Challenge',
    timestamp: now
  }) : null;
  return { success: true, message: automatic ? 'Challenge langsung diperiksa. Nilai Anda: ' + grade.score + '/100.' : 'Challenge berhasil dikirim dan menunggu penilaian tutor.', score: automatic ? grade.score : null, expAwarded: automatic ? grade.expAwarded : 0, gamification: challengeGamification && challengeGamification.awarded ? { expAwarded: challengeGamification.expAwarded, message: responseType === 'speech' ? 'Speaking challenge completed' : 'Challenge completed' } : null, status: automatic ? 'Reviewed' : 'Submitted' };
}

function reviewTutorChallenge_(token, review) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat menilai challenge.');
  review = review || {}; const resultId = String(review.resultId || '').trim(); const database = getDatabase_(); const sheet = database.getSheetByName('Challenge Results');
  if (!sheet || !resultId) throw new Error('Hasil challenge tidak ditemukan.');
  const rows = getSheetObjects_(sheet); const index = rows.findIndex(function (item) { return String(getObjectValue_(item, ['Result ID']) || '') === resultId; }); if (index < 0) throw new Error('Hasil challenge tidak ditemukan.');
  const allowed = getTutorDashboard_(token).classes.some(function (item) { return item.classId === String(getObjectValue_(rows[index], ['Class ID']) || ''); }); if (!allowed) throw new Error('Tutor tidak memiliki akses ke hasil ini.');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]; const updates = { 'Status': 'Reviewed', 'Score': Math.max(0, Math.min(100, Number(review.score || 0))), 'Feedback': String(review.feedback || '').trim(), 'EXP Awarded': Math.max(0, Math.min(250, Number(review.expAwarded || 0))), 'Reviewed At': new Date() };
  sheet.getRange(index + 2, 1, 1, headers.length).setValues([headers.map(function (header) { return Object.prototype.hasOwnProperty.call(updates, header) ? updates[header] : getObjectValue_(rows[index], [header]); })]);
  if (updates['EXP Awarded'] > 0) {
    awardStudentExpV22_({
      studentId: String(getObjectValue_(rows[index], ['Student ID']) || ''),
      sourceType: 'Challenge',
      sourceId: String(getObjectValue_(rows[index], ['Challenge ID']) || ''),
      activityName: 'Challenge',
      exp: updates['EXP Awarded'],
      skillCategory: 'Challenge',
      timestamp: updates['Reviewed At']
    });
  }
  return { success: true, message: 'Challenge berhasil dinilai dan EXP disimpan.' };
}


function getOrCreateAttendanceFollowUpSheet_() {
  const database = getDatabase_();
  let sheet = database.getSheetByName('Attendance Follow-up');
  const headers = [
    'Alert ID',
    'Student ID',
    'Student Name',
    'Class ID',
    'Class Name',
    'Tutor',
    'Absence Count',
    'Absence Threshold',
    'Triggered At',
    'Status',
    'Admin Outcome',
    'Admin Follow Up',
    'Reviewed By',
    'Reviewed At',
    'Last Updated'
  ];

  if (!sheet) {
    sheet = database.insertSheet('Attendance Follow-up');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders_(sheet, headers);
  }

  return sheet;
}

function getAttendanceFollowUpsForRole_(session, allowedClassIds) {
  const database = getDatabase_();
  const sheet = database.getSheetByName('Attendance Follow-up');

  if (!sheet) return [];

  const role = String(session.role || '').trim().toLowerCase();
  const allowed = Array.isArray(allowedClassIds) ? allowedClassIds : [];
  let rows = getSheetObjects_(sheet);

  if (role === 'tutor') {
    rows = rows.filter(function (item) {
      return allowed.indexOf(
        String(getObjectValue_(item, ['Class ID']) || '').trim()
      ) >= 0;
    });
  }

  return rows
    .map(function (item) {
      const triggeredAt = normalizeStudentDate_(
        getObjectValue_(item, ['Triggered At'])
      );
      const reviewedAt = normalizeStudentDate_(
        getObjectValue_(item, ['Reviewed At'])
      );

      return {
        alertId: String(getObjectValue_(item, ['Alert ID']) || ''),
        studentId: String(getObjectValue_(item, ['Student ID']) || ''),
        studentName: String(getObjectValue_(item, ['Student Name']) || ''),
        classId: String(getObjectValue_(item, ['Class ID']) || ''),
        className: String(getObjectValue_(item, ['Class Name']) || ''),
        tutor: String(getObjectValue_(item, ['Tutor']) || ''),
        absenceCount: Number(getObjectValue_(item, ['Absence Count']) || 0),
        absenceThreshold: Number(getObjectValue_(item, ['Absence Threshold']) || 0),
        triggeredAt: triggeredAt ? triggeredAt.toISOString() : '',
        status: String(getObjectValue_(item, ['Status']) || 'Menunggu Tindak Lanjut'),
        adminOutcome: String(getObjectValue_(item, ['Admin Outcome']) || ''),
        adminFollowUp: String(getObjectValue_(item, ['Admin Follow Up']) || ''),
        reviewedBy: String(getObjectValue_(item, ['Reviewed By']) || ''),
        reviewedAt: reviewedAt ? reviewedAt.toISOString() : ''
      };
    })
    .sort(function (a, b) {
      const aOpen = a.status === 'Menunggu Tindak Lanjut' || a.status === 'Perlu Pemantauan' || a.status === 'Belum Terhubung';
      const bOpen = b.status === 'Menunggu Tindak Lanjut' || b.status === 'Perlu Pemantauan' || b.status === 'Belum Terhubung';
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return String(b.triggeredAt).localeCompare(String(a.triggeredAt));
    });
}

function createAttendanceFollowUpsAfterSave_(attendanceSheet, classId, className, tutorName, students) {
  const database = getDatabase_();
  const followUpSheet = getOrCreateAttendanceFollowUpSheet_();
  const attendanceRows = getSheetObjects_(attendanceSheet);
  const existingAlerts = getSheetObjects_(followUpSheet);
  const now = new Date();
  const timezone = 'Asia/Makassar';
  let created = 0;

  students.forEach(function (student) {
    const studentId = String(student.studentId || '').trim();
    if (!studentId) return;

    const absenceDates = {};
    attendanceRows.forEach(function (item) {
      const itemStudentId = String(
        getObjectValue_(item, ['Student ID']) || ''
      ).trim();

      const itemClassId = String(
        getObjectValue_(item, ['Class ID']) || classId
      ).trim();

      const status = String(
        getObjectValue_(item, ['Status']) || ''
      ).trim().toLowerCase();

      if (
        itemStudentId !== studentId ||
        itemClassId !== classId ||
        ['tidak hadir', 'absent', 'alpa'].indexOf(status) < 0
      ) {
        return;
      }

      const date = normalizeStudentDate_(
        getObjectValue_(item, ['Tanggal', 'Date'])
      );

      if (date) {
        absenceDates[
          Utilities.formatDate(date, timezone, 'yyyy-MM-dd')
        ] = true;
      }
    });

    const absenceCount = Object.keys(absenceDates).length;
    const threshold = Math.floor(absenceCount / 3) * 3;

    if (threshold < 3) return;

    const highestReported = existingAlerts
      .filter(function (item) {
        return String(
          getObjectValue_(item, ['Student ID']) || ''
        ).trim() === studentId &&
          String(
            getObjectValue_(item, ['Class ID']) || ''
          ).trim() === classId;
      })
      .reduce(function (highest, item) {
        return Math.max(
          highest,
          Number(
            getObjectValue_(item, ['Absence Threshold']) || 0
          )
        );
      }, 0);

    if (threshold <= highestReported) return;

    appendMappedRow_(followUpSheet, {
      'Alert ID':
        'CARE-' +
        Utilities.formatDate(now, timezone, 'yyyyMMddHHmmss') +
        '-' +
        studentId +
        '-' +
        threshold,
      'Student ID': studentId,
      'Student Name': String(student.fullName || ''),
      'Class ID': classId,
      'Class Name': className,
      'Tutor': tutorName,
      'Absence Count': absenceCount,
      'Absence Threshold': threshold,
      'Triggered At': now,
      'Status': 'Menunggu Tindak Lanjut',
      'Admin Outcome': '',
      'Admin Follow Up': '',
      'Reviewed By': '',
      'Reviewed At': '',
      'Last Updated': now
    });

    existingAlerts.push({
      'Student ID': studentId,
      'Class ID': classId,
      'Absence Threshold': threshold
    });

    created += 1;
  });

  return created;
}

function reviewAttendanceFollowUp_(token, followUp) {
  const session = getSession_(token);
  const role = String(session.role || '').trim().toLowerCase();

  if (role !== 'admin') {
    throw new Error('Tindak lanjut kehadiran hanya dapat dikonfirmasi oleh Admin.');
  }

  followUp = followUp || {};
  const alertId = String(followUp.alertId || '').trim();
  const outcome = String(followUp.outcome || '').trim();
  const adminFollowUp = String(followUp.followUp || '').trim();
  const status = String(followUp.status || '').trim();

  if (!alertId || !outcome || !adminFollowUp) {
    throw new Error('Mohon lengkapi hasil komunikasi dan tindak lanjut dengan baik.');
  }

  const allowedStatuses = [
    'Sudah Dikonfirmasi',
    'Perlu Pemantauan',
    'Belum Terhubung'
  ];

  if (allowedStatuses.indexOf(status) < 0) {
    throw new Error('Status tindak lanjut tidak valid.');
  }

  const sheet = getOrCreateAttendanceFollowUpSheet_();
  const rows = getSheetObjects_(sheet);
  const index = rows.findIndex(function (item) {
    return String(
      getObjectValue_(item, ['Alert ID']) || ''
    ).trim() === alertId;
  });

  if (index < 0) {
    throw new Error('Laporan kehadiran tidak ditemukan.');
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (header) {
      return String(header || '').trim();
    });

  const now = new Date();
  const updates = {
    'Status': status,
    'Admin Outcome': outcome,
    'Admin Follow Up': adminFollowUp,
    'Reviewed By': session.fullName || session.username || 'Admin',
    'Reviewed At': now,
    'Last Updated': now
  };

  Object.keys(updates).forEach(function (header) {
    const column = headers.indexOf(header) + 1;
    if (column > 0) {
      sheet.getRange(index + 2, column).setValue(updates[header]);
    }
  });

  return {
    success: true,
    message: 'Terima kasih. Hasil komunikasi dan tindak lanjut telah tersimpan.'
  };
}

function saveTutorClassAttendance_(token, attendance) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'tutor') throw new Error('Hanya Tutor yang dapat mengelola kehadiran kelas.');
  attendance = attendance || {};
  const classId = String(attendance.classId || '').trim();
  const dateText = String(attendance.date || '').trim();
  const meetingNumber = Math.max(1, Math.min(8, Number(attendance.meetingNumber || 0)));
  const records = Array.isArray(attendance.records) ? attendance.records : [];
  if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(dateText) || !records.length) throw new Error('Kelas, tanggal, pertemuan, dan status siswa wajib dilengkapi.');

  const dashboard = getTutorDashboard_(token);
  const tutorClass = dashboard.classes.find(function (item) { return item.classId === classId; });
  if (!tutorClass) throw new Error('Tutor tidak memiliki akses ke kelas tersebut.');
  const studentMap = {};
  tutorClass.students.forEach(function (student) { studentMap[student.studentId] = student; });
  const seenStudents = {};
  const cleanRecords = records.map(function (record) {
    const studentId = String(record.studentId || '').trim();
    const statusKey = String(record.status || '').trim().toLowerCase();
    if (!studentMap[studentId]) throw new Error('Ada siswa yang tidak terdaftar di kelas ini.');
    if (seenStudents[studentId]) throw new Error('Data siswa ganda terdeteksi pada daftar kehadiran.');
    seenStudents[studentId] = true;
    if (['hadir', 'present'].indexOf(statusKey) < 0 && ['tidak hadir', 'absent'].indexOf(statusKey) < 0) throw new Error('Status setiap siswa harus Hadir atau Tidak Hadir.');
    return { studentId: studentId, status: ['hadir', 'present'].indexOf(statusKey) >= 0 ? 'Hadir' : 'Tidak Hadir' };
  });
  if (cleanRecords.length !== tutorClass.students.length) throw new Error('Tetapkan status untuk seluruh siswa sebelum menyimpan.');

  const database = getDatabase_();
  let sheet = database.getSheetByName('Absensi');
  const requiredHeaders = ['Timestamp', 'Tanggal', 'Kelas', 'Student ID', 'Nama', 'Status', 'Tutor', 'Attendance ID', 'Class ID', 'Session ID', 'Pertemuan Ke', 'Catatan', 'Updated At', 'Latitude', 'Longitude', 'Accuracy (m)', 'Distance (m)', 'Check-in Method'];
  if (!sheet) {
    sheet = database.insertSheet('Absensi');
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    sheet.setFrozenRows(1);
  } else ensureStudentPortalColumns_(sheet, requiredHeaders);

  const timezone = 'Asia/Makassar';
  const now = new Date();
  const attendanceDate = new Date(dateText + 'T12:00:00+08:00');
  const sessionId = classId + '-' + dateText.replace(/-/g, '');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existingRows = getSheetObjects_(sheet);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    cleanRecords.forEach(function (record) {
      const existingIndex = existingRows.findIndex(function (item) {
        const itemDate = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
        return String(getObjectValue_(item, ['Student ID']) || '').trim() === record.studentId &&
          String(getObjectValue_(item, ['Class ID']) || classId).trim() === classId &&
          itemDate && Utilities.formatDate(itemDate, timezone, 'yyyy-MM-dd') === dateText;
      });
      const student = studentMap[record.studentId];
      const existing = existingIndex >= 0 ? existingRows[existingIndex] : null;
      const values = {
        'Timestamp': existing ? getObjectValue_(existing, ['Timestamp']) || now : now,
        'Tanggal': attendanceDate,
        'Kelas': tutorClass.className,
        'Student ID': record.studentId,
        'Nama': student.fullName,
        'Status': record.status,
        'Tutor': dashboard.tutor.name,
        'Attendance ID': existing ? String(getObjectValue_(existing, ['Attendance ID']) || '') : 'ATT-' + Utilities.formatDate(now, timezone, 'yyyyMMddHHmmss') + '-' + record.studentId,
        'Class ID': classId,
        'Session ID': sessionId,
        'Pertemuan Ke': meetingNumber,
        'Catatan': existing && String(getObjectValue_(existing, ['Check-in Method']) || '').indexOf('QR') >= 0 ? 'Diverifikasi tutor dari QR check-in' : 'Dicatat oleh tutor',
        'Updated At': now,
        'Latitude': existing ? getObjectValue_(existing, ['Latitude']) : '',
        'Longitude': existing ? getObjectValue_(existing, ['Longitude']) : '',
        'Accuracy (m)': existing ? getObjectValue_(existing, ['Accuracy (m)']) : '',
        'Distance (m)': existing ? getObjectValue_(existing, ['Distance (m)']) : '',
        'Check-in Method': existing ? String(getObjectValue_(existing, ['Check-in Method']) || 'Tutor Dashboard') : 'Tutor Dashboard'
      };
      const row = headers.map(function (header) { return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : (existing ? getObjectValue_(existing, [header]) : ''); });
      if (existingIndex >= 0) sheet.getRange(existingIndex + 2, 1, 1, headers.length).setValues([row]);
      else sheet.appendRow(row);
    });
  } finally {
    lock.releaseLock();
  }
  const followUpAlertsCreated = createAttendanceFollowUpsAfterSave_(
    sheet,
    classId,
    tutorClass.className,
    dashboard.tutor.name,
    tutorClass.students
  );

  const rewardAttendanceDate = normalizeStudentDate_(attendance.date);
  const attendanceDayKey = rewardAttendanceDate
    ? Utilities.formatDate(rewardAttendanceDate, MOC_GAMIFICATION_V22_.timezone, 'yyyy-MM-dd')
    : String(attendance.date || '').trim();

  cleanRecords.forEach(function (record) {
    const status = String(record.status || '').trim().toLowerCase();
    const present = status === 'hadir' || status === 'present';
    const late = status === 'terlambat' || status === 'late';
    if (!present && !late) return;
    awardStudentExpV22_({
      studentId: record.studentId,
      sourceType: 'Attendance',
      sourceId: 'ATT-' + attendanceDayKey,
      activityName: late ? 'Late Attendance' : 'Present Attendance',
      exp: getGamificationConfigValueV22_(late ? 'EXP-ATTENDANCE-LATE' : 'EXP-ATTENDANCE-PRESENT', late ? 5 : 10),
      skillCategory: 'Attendance',
      timestamp: rewardAttendanceDate || new Date(),
      notes: 'Tutor attendance save'
    });
  });

  return {
    success: true,
    message: 'Data kehadiran kelas berhasil disimpan.',
    totalStudents: cleanRecords.length,
    followUpAlertsCreated: followUpAlertsCreated
  };
}

function submitStudentAttendance_(token, latitude, longitude, accuracy) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'siswa') {
    throw new Error('Absensi mandiri hanya dapat digunakan oleh siswa.');
  }

  const studentId = String(session.relatedId || session['Related ID'] || session.userId || '').trim();
  const lat = Number(latitude);
  const lng = Number(longitude);
  const gpsAccuracy = Number(accuracy);
  if (!studentId) throw new Error('Student ID belum terhubung dengan akun.');
  if (!isFinite(lat) || !isFinite(lng)) throw new Error('Lokasi tidak berhasil dibaca. Aktifkan GPS lalu coba kembali.');
  if (!isFinite(gpsAccuracy) || gpsAccuracy > MOC_ATTENDANCE_LOCATION_.maxAccuracyMeters) {
    throw new Error('Akurasi lokasi masih terlalu rendah. Dekati ruang kelas, aktifkan GPS, lalu coba kembali.');
  }

  const distance = calculateDistanceMeters_(lat, lng, MOC_ATTENDANCE_LOCATION_.latitude, MOC_ATTENDANCE_LOCATION_.longitude);
  if (distance > MOC_ATTENDANCE_LOCATION_.radiusMeters) {
    throw new Error('Anda berada di luar area absensi. Jarak terdeteksi sekitar ' + Math.round(distance) + ' meter.');
  }

  const spreadsheet = getDatabase_();
  const studentSheet = spreadsheet.getSheetByName('Data Siswa');
  const scheduleSheet = spreadsheet.getSheetByName('Master Jadwal');
  const attendanceSheet = spreadsheet.getSheetByName('Absensi');
  if (!studentSheet || !scheduleSheet || !attendanceSheet) throw new Error('Data absensi belum lengkap.');

  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  });
  if (!student) throw new Error('Data siswa tidak ditemukan.');

  const classId = String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim();
  const now = new Date();
  const timezone = 'Asia/Makassar';
  const dayCodes = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const todayIndex = dayCodes[Utilities.formatDate(now, timezone, 'EEE')];
  const todayText = Utilities.formatDate(now, timezone, 'yyyy-MM-dd');

  const validSchedules = getSheetObjects_(scheduleSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId &&
      String(getObjectValue_(item, ['Status']) || 'Aktif').trim().toLowerCase() === 'aktif' &&
      normalizeStudentDay_(getObjectValue_(item, ['Hari'])) === todayIndex;
  });

  const activeSchedule = validSchedules.find(function (item) {
    const start = formatStudentTime_(getObjectValue_(item, ['Mulai']));
    if (!/^\d{2}:\d{2}$/.test(start)) return false;
    const classStart = new Date(todayText + 'T' + start + ':00+08:00');
    const opensAt = new Date(classStart.getTime() - MOC_ATTENDANCE_LOCATION_.openBeforeMinutes * 60000);
    const closesAt = new Date(classStart.getTime() + MOC_ATTENDANCE_LOCATION_.closeAfterStartMinutes * 60000);
    return now >= opensAt && now <= closesAt;
  });

  if (!activeSchedule) {
    throw new Error('Absensi belum dibuka atau sudah ditutup. Absensi tersedia 30 menit sebelum hingga 30 menit setelah kelas dimulai.');
  }

  const className = String(getObjectValue_(activeSchedule, ['Nama kelas', 'Nama Kelas', 'Class']) || classId);
  const tutor = String(getObjectValue_(activeSchedule, ['Tutor']) || '');
  const sessionId = classId + '-' + todayText.replace(/-/g, '');
  const existingRows = getSheetObjects_(attendanceSheet);
  const duplicate = existingRows.find(function (item) {
    const itemStudentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    const itemSessionId = String(getObjectValue_(item, ['Session ID']) || '').trim();
    const itemDate = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
    const sameLegacyDate = itemDate && Utilities.formatDate(itemDate, timezone, 'yyyy-MM-dd') === todayText &&
      String(getObjectValue_(item, ['Class ID']) || classId).trim() === classId;
    return itemStudentId === studentId && (itemSessionId === sessionId || sameLegacyDate);
  });
  if (duplicate) {
    return { success: true, alreadyRecorded: true, message: 'Kehadiran Anda sudah tercatat untuk pertemuan ini.', distanceMeters: Math.round(distance) };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureAttendanceLocationHeaders_(attendanceSheet);
    const headers = attendanceSheet.getRange(1, 1, 1, attendanceSheet.getLastColumn()).getDisplayValues()[0];
    const attendanceId = 'ATT-' + Utilities.formatDate(now, timezone, 'yyyyMMdd-HHmmss') + '-' + studentId;
    const monthKey = Utilities.formatDate(now, timezone, 'yyyy-MM');
    const meetingDates = {};
    existingRows.forEach(function (item) {
      const itemDate = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
      if (String(getObjectValue_(item, ['Class ID']) || '').trim() === classId && itemDate && Utilities.formatDate(itemDate, timezone, 'yyyy-MM') === monthKey) {
        meetingDates[Utilities.formatDate(itemDate, timezone, 'yyyy-MM-dd')] = true;
      }
    });
    meetingDates[todayText] = true;
    const meetingNumber = Object.keys(meetingDates).sort().indexOf(todayText) + 1;
    const values = {
      'Timestamp': now, 'Tanggal': now, 'Kelas': className, 'Student ID': studentId,
      'Nama': String(getObjectValue_(student, ['Full Name', 'Nama']) || ''), 'Status': 'Hadir',
      'Tutor': tutor, 'Attendance ID': attendanceId, 'Class ID': classId, 'Session ID': sessionId,
      'Pertemuan Ke': meetingNumber, 'Catatan': 'Self check-in via QR', 'Updated At': now,
      'Latitude': lat, 'Longitude': lng, 'Accuracy (m)': Math.round(gpsAccuracy),
      'Distance (m)': Math.round(distance), 'Check-in Method': 'QR + GPS'
    };
    attendanceSheet.appendRow(headers.map(function (header) { return Object.prototype.hasOwnProperty.call(values, header) ? values[header] : ''; }));
    return {
      success: true, alreadyRecorded: false, message: 'Kehadiran berhasil dicatat.',
      attendanceId: attendanceId, className: className,
      checkInTime: Utilities.formatDate(now, timezone, 'dd MMMM yyyy, HH:mm') + ' WITA',
      distanceMeters: Math.round(distance)
    };
  } finally {
    lock.releaseLock();
  }
}

function ensureAttendanceLocationHeaders_(sheet) {
  const required = ['Latitude', 'Longitude', 'Accuracy (m)', 'Distance (m)', 'Check-in Method'];
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  required.forEach(function (header) {
    if (headers.indexOf(header) === -1) {
      headers.push(header);
      sheet.getRange(1, headers.length).setValue(header);
    }
  });
}

function calculateDistanceMeters_(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;
  const toRadians = function (degrees) { return degrees * Math.PI / 180; };
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStudentOverview_(token) {
  const session = getSession_(token);
  const role = String(session.role || '').trim().toLowerCase();

  if (role !== 'siswa') {
    throw new Error('Menu ini hanya dapat diakses oleh siswa.');
  }

  const studentId = String(
    session.relatedId ||
    session['Related ID'] ||
    session.userId ||
    ''
  ).trim();

  if (!studentId) {
    throw new Error('Student ID belum terhubung dengan akun.');
  }

  const spreadsheet = getDatabase_();
  const studentSheet = spreadsheet.getSheetByName('Data Siswa');
  const scheduleSheet = spreadsheet.getSheetByName('Master Jadwal');
  const attendanceSheet = spreadsheet.getSheetByName('Absensi');

  if (!studentSheet) throw new Error('Sheet Data Siswa tidak ditemukan.');
  if (!scheduleSheet) throw new Error('Sheet Master Jadwal tidak ditemukan.');
  if (!attendanceSheet) throw new Error('Sheet Absensi tidak ditemukan.');

  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  });

  if (!student) {
    throw new Error('Data siswa ' + studentId + ' tidak ditemukan.');
  }

  const classId = String(
    getObjectValue_(student, ['Class ID', 'Class Id', 'Kode Kelas', 'Class']) || ''
  ).trim();

  let schedules = getSheetObjects_(scheduleSheet)
    .filter(function (item) {
      const itemClassId = String(
        getObjectValue_(item, ['Class ID', 'Class Id', 'Kode Kelas']) || ''
      ).trim();
      const status = String(
        getObjectValue_(item, ['Status']) || 'Aktif'
      ).trim().toLowerCase();

      return itemClassId.toUpperCase() === classId.toUpperCase() &&
        (status === 'aktif' || status === 'active');
    });

  // Data Siswa tetap menjadi sumber utama. Jika Class ID belum cocok dengan
  // Master Jadwal, baca kolom Schedule/Jadwal pada baris siswa sebagai fallback.
  if (!schedules.length) {
    schedules = buildStudentScheduleFallback_(student, classId);
  }

  const classInfo = schedules[0] || {};
  const allAttendance = getSheetObjects_(attendanceSheet)
    .filter(function (item) {
      return String(
        getObjectValue_(item, ['Student ID']) || ''
      ).trim() === studentId;
    });

  const timezone = 'Asia/Makassar';
  const now = new Date();
  const currentMonthKey = Utilities.formatDate(now, timezone, 'yyyy-MM');
  const currentMonthName = Utilities.formatDate(now, timezone, 'MMMM');

  const monthlyAttendance = allAttendance.filter(function (item) {
    const value = getObjectValue_(item, ['Tanggal', 'Date']);
    const date = normalizeStudentDate_(value);
    return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
  });

  const monthHeaderMap = {
    January: 'January', February: 'February', March: 'March',
    April: 'April', May: 'May', June: 'June', July: 'July',
    August: 'August', September: 'September', October: 'October',
    November: 'November', December: 'December'
  };
  const paymentRaw = String(
    getObjectValue_(student, [monthHeaderMap[currentMonthName]]) || ''
  ).trim();
  const paymentConfirmation = getLatestStudentPaymentConfirmation_(spreadsheet, studentId, currentMonthKey);
  const paymentCenter = buildStudentPaymentCenter_(spreadsheet, studentId, currentMonthKey, paymentRaw);
  const currentTuitionItem = (paymentCenter.items || []).find(function (item) {
    return item.category === 'Tuition';
  }) || {};

  const currentYear = Number(Utilities.formatDate(now, timezone, 'yyyy'));
  const currentMonthNumber = Number(Utilities.formatDate(now, timezone, 'M'));

  const monthNamesID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const tuitionPaymentRows = (paymentCenter.history || []).filter(function (item) {
    return item.category === 'Tuition';
  });

  const paymentYearProgress = monthNamesID.map(function (monthName, index) {
    const monthNumber = index + 1;
    const period = currentYear + '-' + String(monthNumber).padStart(2, '0');

    if (monthNumber === 7) {
      return {
        month: monthName,
        monthNumber: monthNumber,
        period: period,
        status: 'Libur',
        label: 'LIBUR'
      };
    }

    if (monthNumber > currentMonthNumber) {
      return {
        month: monthName,
        monthNumber: monthNumber,
        period: period,
        status: 'Belum Berjalan',
        label: '—'
      };
    }

    const paidRow = tuitionPaymentRows.find(function (item) {
      return String(item.period || '').trim() === period &&
        /^(lunas|paid)$/i.test(String(item.status || '').trim());
    });

    return {
      month: monthName,
      monthNumber: monthNumber,
      period: period,
      status: paidRow ? 'Lunas' : 'Belum Lunas',
      label: paidRow ? 'LUNAS' : 'BELUM LUNAS',
      amount: paidRow ? Number(paidRow.amount || 0) : 0,
      paymentDate: paidRow ? paidRow.paymentDate : '',
      paymentMethod: paidRow ? String(paidRow.paymentMethod || '') : ''
    };
  });
  const experienceSummary = buildExperienceSummary_(student, allAttendance);
  const learningReadSheet = spreadsheet.getSheetByName('Learning Activity Reads');
  const learningReadRows = learningReadSheet ? getSheetObjects_(learningReadSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  }) : [];
  const monthlyLearningReads = learningReadRows.filter(function (item) {
    return String(getObjectValue_(item, ['Month']) || '').trim() === currentMonthKey;
  });
  const learningReadExp = learningReadRows.reduce(function (sum, item) {
    return sum + Math.max(0, Number(getObjectValue_(item, ['EXP Awarded']) || 0));
  }, 0);
  experienceSummary.breakdown.learning = learningReadExp;
  experienceSummary.totalExp += learningReadExp;
  rebuildMonthlyGamificationV22_(currentMonthKey, studentId);
  syncBadgeProgressForStudentV22_(studentId, currentMonthKey);
  const gamificationSummary = getStudentGamificationSummaryV22_(studentId, classId, currentMonthKey);
  const journalSheet = spreadsheet.getSheetByName('Learning Journal');
  const classJournals = journalSheet ? getSheetObjects_(journalSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId;
  }) : [];
  const monthlyJournals = classJournals.filter(function (item) {
    const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
  });
  const learningPlanSheet = spreadsheet.getSheetByName('Monthly Learning Plan');
  const monthlyLearningPlans = learningPlanSheet ? getSheetObjects_(learningPlanSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId &&
      String(getObjectValue_(item, ['Month', 'Bulan']) || '').trim() === currentMonthKey;
  }) : [];
  const notesSheet = spreadsheet.getSheetByName('Student Notes');
  const studentNotes = notesSheet ? getSheetObjects_(notesSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  }) : [];
  const monthlyNotes = studentNotes.filter(function (item) {
    const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
  }).sort(function (a, b) {
    return normalizeStudentDate_(getObjectValue_(b, ['Date', 'Tanggal'])) - normalizeStudentDate_(getObjectValue_(a, ['Date', 'Tanggal']));
  });
  const tutorExp = studentNotes.reduce(function (sum, item) { return sum + Math.max(0, Number(getObjectValue_(item, ['EXP Awarded']) || 0)); }, 0);
  experienceSummary.breakdown.participation += tutorExp;
  experienceSummary.totalExp += tutorExp;
  const assignmentsSheet = spreadsheet.getSheetByName('Assignments');
  const classAssignments = assignmentsSheet ? getSheetObjects_(assignmentsSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId &&
      String(getObjectValue_(item, ['Status']) || 'Aktif').trim().toLowerCase() !== 'nonaktif';
  }) : [];
  const submissionSheet = spreadsheet.getSheetByName('Assignment Submissions');
  const studentSubmissions = submissionSheet ? getSheetObjects_(submissionSheet).filter(function (item) { return String(getObjectValue_(item, ['Student ID']) || '') === studentId; }) : [];
  const challengesSheet = spreadsheet.getSheetByName('Challenges');
  const classChallenges = challengesSheet ? getSheetObjects_(challengesSheet).filter(function (item) { return String(getObjectValue_(item, ['Class ID']) || '') === classId && String(getObjectValue_(item, ['Status']) || 'Aktif').toLowerCase() !== 'nonaktif'; }) : [];
  const challengeResultsSheet = spreadsheet.getSheetByName('Challenge Results');
  const studentChallengeResults = challengeResultsSheet ? getSheetObjects_(challengeResultsSheet).filter(function (item) { return String(getObjectValue_(item, ['Student ID']) || '') === studentId; }) : [];
  const assignmentReviewExp = studentSubmissions.filter(function (item) { return String(getObjectValue_(item, ['Status']) || '').toLowerCase() === 'reviewed'; }).reduce(function (sum, item) { return sum + Number(getObjectValue_(item, ['EXP Awarded']) || 0); }, 0);
  const challengeReviewExp = studentChallengeResults.filter(function (item) { return String(getObjectValue_(item, ['Status']) || '').toLowerCase() === 'reviewed'; }).reduce(function (sum, item) { return sum + Number(getObjectValue_(item, ['EXP Awarded']) || 0); }, 0);
  experienceSummary.breakdown.assignment += assignmentReviewExp;
  experienceSummary.breakdown.challenge += challengeReviewExp;
  experienceSummary.totalExp += assignmentReviewExp + challengeReviewExp;
  const assessmentsSheet = spreadsheet.getSheetByName('Assessment Scores');
  const studentAssessments = assessmentsSheet ? getSheetObjects_(assessmentsSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  }) : [];
  const monthlyAssessments = studentAssessments.filter(function (item) {
    const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
  });
  function studentScore_(headers) {
    const value = Number(getObjectValue_(student, headers));
    return isNaN(value) || value <= 0 ? null : value;
  }
  const skillScores = {
    speaking: studentScore_(['Speaking Score', 'Speaking']), writing: studentScore_(['Writing Score', 'Writing']),
    reading: studentScore_(['Reading Score', 'Reading']), listening: studentScore_(['Listening Score', 'Listening'])
  };
  ['speaking', 'writing', 'reading', 'listening'].forEach(function (skill) {
    const header = skill.charAt(0).toUpperCase() + skill.slice(1);
    const values = monthlyAssessments.map(function (item) { return Number(getObjectValue_(item, [header])); })
      .filter(function (value) { return !isNaN(value) && value > 0; });
    if (values.length) skillScores[skill] = Math.round(values.reduce(function (sum, value) { return sum + value; }, 0) / values.length * 10) / 10;
  });
  const availableScores = Object.keys(skillScores).map(function (key) { return skillScores[key]; }).filter(function (value) { return value !== null; });
  const attendanceSummary = buildAttendanceSummary_(monthlyAttendance);
  let nextClassSummary = findNextStudentClass_(schedules, now);
  if (!nextClassSummary) {
    nextClassSummary = findNextStudentClass_(buildStudentScheduleFallback_(student, classId), now);
  }
  if (nextClassSummary) {
    nextClassSummary.className = nextClassSummary.className || String(getObjectValue_(classInfo, ['Nama kelas', 'Nama Kelas', 'Class Name', 'Class']) || classId);
    nextClassSummary.program = nextClassSummary.program || String(getObjectValue_(student, ['Program']) || '');
    nextClassSummary.tutor = nextClassSummary.tutor || String(getObjectValue_(classInfo, ['Tutor', 'Teacher']) || '');
  }
  const activeAssignmentIds = classAssignments.map(function (item) { return String(getObjectValue_(item, ['Assignment ID']) || ''); });
  const completedAssignmentIds = {};
  studentSubmissions.forEach(function (item) {
    const assignmentId = String(getObjectValue_(item, ['Assignment ID']) || '');
    const status = String(getObjectValue_(item, ['Status']) || '').toLowerCase();
    if (activeAssignmentIds.indexOf(assignmentId) >= 0 && (status === 'submitted' || status === 'reviewed' || status === 'dikumpulkan' || status === 'dinilai')) completedAssignmentIds[assignmentId] = true;
  });
  const latestAssessment = studentAssessments.slice().sort(function (a, b) {
    return (normalizeStudentDate_(getObjectValue_(b, ['Date', 'Tanggal'])) || 0) - (normalizeStudentDate_(getObjectValue_(a, ['Date', 'Tanggal'])) || 0);
  })[0] || {};
  const latestAverageValue = Number(getObjectValue_(latestAssessment, ['Average Score', 'Average', 'Nilai Rata-rata']));
  const academicAverage = !isNaN(latestAverageValue) && latestAverageValue > 0
    ? Math.round(latestAverageValue * 10) / 10
    : (availableScores.length ? Math.round(availableScores.reduce(function (sum, value) { return sum + value; }, 0) / availableScores.length * 10) / 10 : null);
  const detectedCefrLevel = String(
    getObjectValue_(latestAssessment, ['CEFR Level', 'English Level', 'Level']) ||
    getObjectValue_(student, ['CEFR Level', 'Current Level', 'English Level', 'Level Bahasa Inggris']) || ''
  ).trim();

  return {
    success: true,
    generatedAt: now.toISOString(),
    academicYear: getAcademicYearLabel_(now),
    currentMonth: currentMonthName,
    profile: {
      studentId: studentId,
      fullName: String(getObjectValue_(student, ['Full Name', 'Nama']) || ''),
      school: String(getObjectValue_(student, ['School']) || ''),
      grade: String(getObjectValue_(student, ['Grade']) || ''),
      photoLink: String(getObjectValue_(student, ['Photo Link']) || ''),
      joinDate: String(getObjectValue_(student, ['Join Date']) || ''),
      studentStatus: String(
        getObjectValue_(student, ['Student Status', 'Status']) || 'Aktif'
      ),
      accountStatus: String(
        getObjectValue_(student, ['Account Status']) || 'Aktif'
      )
    },
    experience: experienceSummary,
    gamification: gamificationSummary,
    paymentCenter: paymentCenter,
    paymentYearProgress: paymentYearProgress,
    academicSummary: {
      nextClass: nextClassSummary,
      assignments: {
        total: classAssignments.length,
        completed: Object.keys(completedAssignmentIds).length,
        pending: Math.max(0, classAssignments.length - Object.keys(completedAssignmentIds).length)
      },
      attendance: attendanceSummary,
      levelAndScore: {
        cefrLevel: detectedCefrLevel,
        academicAverage: academicAverage,
        finalGrade: String(getObjectValue_(latestAssessment, ['Final Grade', 'Grade']) || ''),
        totalExp: experienceSummary.totalExp
      }
    },
    learningActivities: Array.from({ length: 8 }, function (_, index) {
      const meetingNumber = index + 1;
      const plan = monthlyLearningPlans.find(function (item) { return Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber; });
      const journalItem = monthlyJournals.find(function (item) { return Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber; });
      const source = journalItem || plan || {};
      const planId = plan ? String(getObjectValue_(plan, ['Plan ID']) || '') : '';
      const linkedAssignment = classAssignments.find(function (item) {
        const itemPlanId = String(getObjectValue_(item, ['Plan ID']) || '');
        const itemMeeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
        const itemMonth = String(getObjectValue_(item, ['Month', 'Bulan']) || '');
        return (planId && itemPlanId === planId) || (!itemPlanId && itemMeeting === meetingNumber && (!itemMonth || itemMonth === currentMonthKey));
      });
      const linkedChallenge = classChallenges.find(function (item) {
        const itemPlanId = String(getObjectValue_(item, ['Plan ID']) || '');
        const itemMeeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
        const itemMonth = String(getObjectValue_(item, ['Month', 'Bulan']) || '');
        return (planId && itemPlanId === planId) || (!itemPlanId && itemMeeting === meetingNumber && (!itemMonth || itemMonth === currentMonthKey));
      });
      const assignmentId = linkedAssignment ? String(getObjectValue_(linkedAssignment, ['Assignment ID']) || '') : '';
      const challengeId = linkedChallenge ? String(getObjectValue_(linkedChallenge, ['Challenge ID']) || '') : '';
      const assignmentSubmission = assignmentId ? studentSubmissions.find(function (item) { return String(getObjectValue_(item, ['Assignment ID']) || '') === assignmentId; }) : null;
      const challengeResult = challengeId ? studentChallengeResults.find(function (item) { return String(getObjectValue_(item, ['Challenge ID']) || '') === challengeId; }) : null;
      const date = normalizeStudentDate_(getObjectValue_(source, journalItem ? ['Date', 'Tanggal'] : ['Planned Date', 'Tanggal Rencana']));
      const dateText = date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '';
      const individualNote = monthlyNotes.find(function (note) {
        const noteDate = normalizeStudentDate_(getObjectValue_(note, ['Date', 'Tanggal']));
        const noteDateText = noteDate ? Utilities.formatDate(noteDate, timezone, 'yyyy-MM-dd') : '';
        const noteMeeting = Number(getObjectValue_(note, ['Meeting Number', 'Pertemuan Ke']) || 0);
        return noteDateText === dateText && (!noteMeeting || noteMeeting === meetingNumber);
      });
      return {
        meetingNumber: meetingNumber,
        date: dateText,
        title: String(getObjectValue_(source, ['Material / Topic']) || ''),
        objective: String(getObjectValue_(plan || source, ['Learning Objective', 'Tujuan Pembelajaran']) || ''),
        targetCompetency: String(getObjectValue_(plan || source, ['Target Competency', 'Target Capaian']) || ''),
        activities: String(getObjectValue_(source, journalItem ? ['Activities', 'Aktivitas'] : ['Planned Activities', 'Rencana Aktivitas']) || ''),
        status: journalItem ? 'Terlaksana' : (plan ? 'Direncanakan' : 'Belum Diisi'),
        tutor: String(getObjectValue_(source, ['Tutor']) || getObjectValue_(classInfo, ['Tutor']) || ''),
        achievement: individualNote ? String(getObjectValue_(individualNote, ['Achievement', 'Participation']) || '') : '',
        individualComment: individualNote ? String(getObjectValue_(individualNote, ['Tutor Comment']) || '') : '',
        readCompleted: monthlyLearningReads.some(function (read) {
          return Number(getObjectValue_(read, ['Meeting Number']) || 0) === meetingNumber;
        }),
        readExp: 25,
        assignment: linkedAssignment ? {
          assignmentId: assignmentId,
          title: String(getObjectValue_(linkedAssignment, ['Title']) || ''),
          dueDate: (function () { const value = normalizeStudentDate_(getObjectValue_(linkedAssignment, ['Due Date'])); return value ? Utilities.formatDate(value, timezone, 'yyyy-MM-dd') : ''; })(),
          expReward: Number(getObjectValue_(linkedAssignment, ['EXP Reward']) || 0),
          status: assignmentSubmission ? String(getObjectValue_(assignmentSubmission, ['Status']) || '') : 'Belum Dikerjakan',
          score: assignmentSubmission ? getObjectValue_(assignmentSubmission, ['Score']) : ''
        } : null,
        challenge: linkedChallenge ? {
          challengeId: challengeId,
          title: String(getObjectValue_(linkedChallenge, ['Title']) || ''),
          dueDate: (function () { const value = normalizeStudentDate_(getObjectValue_(linkedChallenge, ['Due Date'])); return value ? Utilities.formatDate(value, timezone, 'yyyy-MM-dd') : ''; })(),
          expReward: Number(getObjectValue_(linkedChallenge, ['EXP Reward']) || 0),
          status: challengeResult ? String(getObjectValue_(challengeResult, ['Status']) || '') : 'Belum Dikerjakan',
          score: challengeResult ? getObjectValue_(challengeResult, ['Score']) : ''
        } : null
      };
    }),
    learningJournal: monthlyJournals.map(function (item) {
      const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
      const dateText = date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '';
      const meetingNumber = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
      const individualNote = monthlyNotes.find(function (note) {
        const noteDate = normalizeStudentDate_(getObjectValue_(note, ['Date', 'Tanggal']));
        const noteDateText = noteDate ? Utilities.formatDate(noteDate, timezone, 'yyyy-MM-dd') : '';
        const noteMeeting = Number(getObjectValue_(note, ['Meeting Number', 'Pertemuan Ke']) || 0);
        return noteDateText === dateText && (!noteMeeting || noteMeeting === meetingNumber);
      });
      return {
        id: String(getObjectValue_(item, ['Journal ID']) || ''),
        date: dateText,
        meetingNumber: meetingNumber,
        title: String(getObjectValue_(item, ['Material / Topic', 'Material', 'Topic']) || ''),
        activities: String(getObjectValue_(item, ['Activities', 'Aktivitas']) || ''),
        notes: String(getObjectValue_(item, ['Tutor Notes', 'Catatan Tutor']) || ''),
        tutor: String(getObjectValue_(item, ['Tutor']) || ''),
        achievement: individualNote ? String(getObjectValue_(individualNote, ['Achievement', 'Participation']) || '') : '',
        individualComment: individualNote ? String(getObjectValue_(individualNote, ['Tutor Comment']) || '') : ''
      };
    }).sort(function (a, b) { return a.meetingNumber - b.meetingNumber; }),
    studentNotes: monthlyNotes.map(function (item) {
      const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
      return {
        date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
        participation: String(getObjectValue_(item, ['Participation']) || ''),
        strengths: String(getObjectValue_(item, ['Strengths']) || ''),
        improvements: String(getObjectValue_(item, ['Areas for Improvement']) || ''),
        comment: String(getObjectValue_(item, ['Tutor Comment']) || ''),
        achievement: String(getObjectValue_(item, ['Achievement']) || ''),
        expAwarded: Number(getObjectValue_(item, ['EXP Awarded']) || 0)
      };
    }),
    monthlyReport: {
      skills: skillScores,
      averageScore: availableScores.length ? Math.round(availableScores.reduce(function (sum, value) { return sum + value; }, 0) / availableScores.length * 10) / 10 : null,
      finalGrade: monthlyAssessments.length ? String(getObjectValue_(monthlyAssessments[monthlyAssessments.length - 1], ['Final Grade']) || '') : String(getObjectValue_(student, ['Final Grade', 'Grade Result']) || ''),
      tutorComments: monthlyNotes.length ? String(getObjectValue_(monthlyNotes[0], ['Tutor Comment']) || '') : '',
      assessments: monthlyAssessments.map(function (item) {
        return {
          id: String(getObjectValue_(item, ['Assessment ID']) || ''), name: String(getObjectValue_(item, ['Assessment Type']) || ''),
          speaking: getObjectValue_(item, ['Speaking']), writing: getObjectValue_(item, ['Writing']), reading: getObjectValue_(item, ['Reading']), listening: getObjectValue_(item, ['Listening']),
          quizTest: getObjectValue_(item, ['Quiz / Test']), average: getObjectValue_(item, ['Average Score']), finalGrade: String(getObjectValue_(item, ['Final Grade']) || '')
        };
      }),
      sessions: monthlyJournals.map(function (item, index) {
        const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
        const dateText = date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '';
        const attendanceItem = monthlyAttendance.find(function (record) {
          const attendanceDate = normalizeStudentDate_(getObjectValue_(record, ['Tanggal', 'Date']));
          return attendanceDate && Utilities.formatDate(attendanceDate, timezone, 'yyyy-MM-dd') === dateText;
        });
        const meetingNumber = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || index + 1);
        const plan = monthlyLearningPlans.find(function (entry) { return Number(getObjectValue_(entry, ['Meeting Number', 'Pertemuan Ke']) || 0) === meetingNumber; });
        const planId = plan ? String(getObjectValue_(plan, ['Plan ID']) || '') : '';
        const linkedAssignment = classAssignments.find(function (entry) { return planId && String(getObjectValue_(entry, ['Plan ID']) || '') === planId; });
        const linkedChallenge = classChallenges.find(function (entry) { return planId && String(getObjectValue_(entry, ['Plan ID']) || '') === planId; });
        const assignmentSubmission = linkedAssignment ? studentSubmissions.find(function (entry) { return String(getObjectValue_(entry, ['Assignment ID']) || '') === String(getObjectValue_(linkedAssignment, ['Assignment ID']) || ''); }) : null;
        const challengeResult = linkedChallenge ? studentChallengeResults.find(function (entry) { return String(getObjectValue_(entry, ['Challenge ID']) || '') === String(getObjectValue_(linkedChallenge, ['Challenge ID']) || ''); }) : null;
        const individualNote = monthlyNotes.find(function (note) {
          const noteDate = normalizeStudentDate_(getObjectValue_(note, ['Date', 'Tanggal']));
          const noteDateText = noteDate ? Utilities.formatDate(noteDate, timezone, 'yyyy-MM-dd') : '';
          const noteMeeting = Number(getObjectValue_(note, ['Meeting Number', 'Pertemuan Ke']) || 0);
          return noteDateText === dateText && (!noteMeeting || noteMeeting === meetingNumber);
        });
        return {
          number: meetingNumber,
          date: dateText,
          topic: String(getObjectValue_(item, ['Material / Topic']) || ''),
          targetCompetency: plan ? String(getObjectValue_(plan, ['Target Competency', 'Target Capaian']) || getObjectValue_(plan, ['Learning Objective']) || '') : '',
          activities: String(getObjectValue_(item, ['Activities', 'Aktivitas']) || ''),
          status: attendanceItem ? String(getObjectValue_(attendanceItem, ['Status']) || '') : 'Tidak Hadir',
          achievement: individualNote ? String(getObjectValue_(individualNote, ['Achievement', 'Participation']) || '') : '',
          comment: individualNote ? String(getObjectValue_(individualNote, ['Tutor Comment']) || '') : '',
          assignment: linkedAssignment ? { title: String(getObjectValue_(linkedAssignment, ['Title']) || ''), status: assignmentSubmission ? String(getObjectValue_(assignmentSubmission, ['Status']) || '') : 'Belum Dikerjakan', score: assignmentSubmission ? getObjectValue_(assignmentSubmission, ['Score']) : '' } : null,
          challenge: linkedChallenge ? { title: String(getObjectValue_(linkedChallenge, ['Title']) || ''), status: challengeResult ? String(getObjectValue_(challengeResult, ['Status']) || '') : 'Belum Dikerjakan', score: challengeResult ? getObjectValue_(challengeResult, ['Score']) : '' } : null
        };
      }),
      assignments: studentSubmissions.filter(function (item) {
        const date = normalizeStudentDate_(getObjectValue_(item, ['Submitted At']));
        return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
      }).map(function (item) {
        const assignmentId = String(getObjectValue_(item, ['Assignment ID']) || '');
        const assignment = classAssignments.find(function (entry) { return String(getObjectValue_(entry, ['Assignment ID']) || '') === assignmentId; });
        return { meetingNumber: assignment ? Number(getObjectValue_(assignment, ['Meeting Number']) || 0) : 0, targetCompetency: assignment ? String(getObjectValue_(assignment, ['Target Competency']) || '') : '', title: assignment ? String(getObjectValue_(assignment, ['Title']) || '') : 'Assignment', score: getObjectValue_(item, ['Score']), status: String(getObjectValue_(item, ['Status']) || ''), feedback: String(getObjectValue_(item, ['Feedback']) || '') };
      }),
      challenges: studentChallengeResults.filter(function (item) {
        const date = normalizeStudentDate_(getObjectValue_(item, ['Submitted At']));
        return date && Utilities.formatDate(date, timezone, 'yyyy-MM') === currentMonthKey;
      }).map(function (item) {
        const challengeId = String(getObjectValue_(item, ['Challenge ID']) || '');
        const challenge = classChallenges.find(function (entry) { return String(getObjectValue_(entry, ['Challenge ID']) || '') === challengeId; });
        return { meetingNumber: challenge ? Number(getObjectValue_(challenge, ['Meeting Number']) || 0) : 0, targetCompetency: challenge ? String(getObjectValue_(challenge, ['Target Competency']) || '') : '', title: challenge ? String(getObjectValue_(challenge, ['Title']) || '') : 'Challenge', score: getObjectValue_(item, ['Score']), status: String(getObjectValue_(item, ['Status']) || ''), feedback: String(getObjectValue_(item, ['Feedback']) || '') };
      })
    },
    program: {
      classId: classId,
      program: String(getObjectValue_(student, ['Program']) || ''),
      className: String(
        getObjectValue_(classInfo, ['Nama kelas', 'Nama Kelas', 'Class Name', 'Class']) || classId
      ),
      level: String(
        getObjectValue_(student, ['Current Level']) || 'Belum ditentukan'
      ),
      tutor: String(getObjectValue_(classInfo, ['Tutor']) || ''),
      groupLink: String(getObjectValue_(classInfo, ['Link WAG']) || ''),
      weeklySchedule: schedules.map(function (item) {
        return {
          day: String(getObjectValue_(item, ['Hari']) || ''),
          start: formatStudentTime_(getObjectValue_(item, ['Mulai'])),
          end: formatStudentTime_(getObjectValue_(item, ['Selesai']))
        };
      })
    },
    nextClass: nextClassSummary,
    assignments: classAssignments.map(function (item) {
      const assignedDate = normalizeStudentDate_(getObjectValue_(item, ['Assigned Date']));
      const dueDate = normalizeStudentDate_(getObjectValue_(item, ['Due Date']));
      const assignmentId = String(getObjectValue_(item, ['Assignment ID']) || '');
      const submission = studentSubmissions.find(function (result) { return String(getObjectValue_(result, ['Assignment ID']) || '') === assignmentId; });
      let questions = [];
      try { questions = JSON.parse(String(getObjectValue_(item, ['Questions JSON']) || '[]')); } catch (error) { questions = []; }
      return {
        assignmentId: assignmentId, title: String(getObjectValue_(item, ['Title']) || ''), instructions: String(getObjectValue_(item, ['Instructions']) || ''),
        assignedDate: assignedDate ? Utilities.formatDate(assignedDate, timezone, 'yyyy-MM-dd') : '', dueDate: dueDate ? Utilities.formatDate(dueDate, timezone, 'yyyy-MM-dd') : '',
        maxScore: Number(getObjectValue_(item, ['Max Score']) || 100), totalPoints: Number(getObjectValue_(item, ['Total Points']) || 0), questions: questions.map(function (question) { return { id: question.id, text: question.text, options: question.options, points: question.points }; }), expReward: Number(getObjectValue_(item, ['EXP Reward']) || 0), status: String(getObjectValue_(item, ['Status']) || 'Aktif'),
        submission: submission ? { response: String(getObjectValue_(submission, ['Response']) || ''), status: String(getObjectValue_(submission, ['Status']) || ''), score: getObjectValue_(submission, ['Score']), feedback: String(getObjectValue_(submission, ['Feedback']) || ''), expAwarded: Number(getObjectValue_(submission, ['EXP Awarded']) || 0) } : null
      };
    }).sort(function (a, b) { return b.assignedDate.localeCompare(a.assignedDate); }),
    challenges: classChallenges.map(function (item) {
      const challengeId = String(getObjectValue_(item, ['Challenge ID']) || ''); const dueDate = normalizeStudentDate_(getObjectValue_(item, ['Due Date']));
      const result = studentChallengeResults.find(function (row) { return String(getObjectValue_(row, ['Challenge ID']) || '') === challengeId; });
      const responseType = String(getObjectValue_(item, ['Response Type']) || 'text').toLowerCase();
      return {
        challengeId: challengeId,
        title: String(getObjectValue_(item, ['Title']) || ''),
        instructions: String(getObjectValue_(item, ['Instructions']) || ''),
        responseType: responseType,
        speechTarget: responseType === 'speech'
          ? String(getObjectValue_(item, ['Answer Key']) || '')
          : '',
        dueDate: dueDate ? Utilities.formatDate(dueDate, timezone, 'yyyy-MM-dd') : '',
        expReward: Number(getObjectValue_(item, ['EXP Reward']) || 0),
        result: result ? {
          response: String(getObjectValue_(result, ['Response']) || ''),
          status: String(getObjectValue_(result, ['Status']) || ''),
          score: getObjectValue_(result, ['Score']),
          feedback: String(getObjectValue_(result, ['Feedback']) || ''),
          expAwarded: Number(getObjectValue_(result, ['EXP Awarded']) || 0)
        } : null
      };
    }),
    monthly: {
      attendance: attendanceSummary,
      payment: {
        month: currentMonthName,
        status: currentMonthName === 'July'
          ? 'Libur'
          : String(currentTuitionItem.status || 'Belum Lunas'),
        detail: currentMonthName === 'July'
          ? 'Libur les — tidak ditagihkan'
          : (
              currentTuitionItem.note ||
              (
                /lunas|paid/i.test(String(currentTuitionItem.status || ''))
                  ? 'Pembayaran les bulan ini sudah tercatat di Data Pembayaran.'
                  : /menunggu verifikasi/i.test(String(currentTuitionItem.status || ''))
                    ? 'Pembayaran sudah dikirim dan sedang menunggu verifikasi Admin.'
                    : 'Tagihan les bulan ini masih aktif.'
              )
            ),
        confirmationId: paymentConfirmation ? String(getObjectValue_(paymentConfirmation, ['Confirmation ID']) || '') : '',
        paymentLink: String(
          getObjectValue_(student, ['Payment Link', 'Link Payment', 'Link Pembayaran']) || ''
        )
      },
      assignments: classAssignments.length,
      currentScore: null,
      learningJournal: null
    },
    overall: {
      attendance: buildAttendanceSummary_(allAttendance),
      paymentHistory: buildPaymentHistory_(student)
    },
    recentAttendance: allAttendance
      .slice()
      .sort(function (a, b) {
        return normalizeStudentDate_(getObjectValue_(b, ['Tanggal', 'Date'])) -
          normalizeStudentDate_(getObjectValue_(a, ['Tanggal', 'Date']));
      })
      .map(function (item) {
        const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
        return {
          date: date ? Utilities.formatDate(date, timezone, 'yyyy-MM-dd') : '',
          className: String(getObjectValue_(item, ['Kelas']) || ''),
          status: String(getObjectValue_(item, ['Status']) || ''),
          meetingNumber: String(getObjectValue_(item, ['Pertemuan Ke']) || ''),
          note: String(getObjectValue_(item, ['Catatan']) || '')
        };
      })
  };
}

/* PAYMENT CONFIRMATION — proof files stay private in Drive and are returned only
   after an authenticated Admin/CEO request. */
function getPaymentConfirmationSheet_(spreadsheet) {
  return createSheetIfMissing_(spreadsheet, 'Payment Confirmations', [
    'Confirmation ID', 'Submitted At', 'Student ID', 'Student Name', 'Invoice Number',
    'Payment Category', 'Item Label', 'Period', 'Amount', 'Payment Method', 'Sender Name', 'Payment Date', 'Proof File ID',
    'Proof File Name', 'Proof MIME Type', 'Status', 'Admin Note', 'Verified At', 'Verified By'
  ]);
}

function getLatestStudentPaymentConfirmation_(spreadsheet, studentId, period) {
  const sheet = spreadsheet.getSheetByName('Payment Confirmations');
  if (!sheet) return null;
  return getSheetObjects_(sheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === String(studentId || '').trim() &&
      String(getObjectValue_(item, ['Period']) || '').trim() === String(period || '').trim();
  }).sort(function (a, b) {
    return new Date(getObjectValue_(b, ['Submitted At']) || 0) - new Date(getObjectValue_(a, ['Submitted At']) || 0);
  })[0] || null;
}

function getPaymentProofFolder_() {
  const properties = PropertiesService.getScriptProperties();
  const savedId = properties.getProperty('PAYMENT_PROOF_FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (error) { /* recreate below */ }
  }
  const folder = DriveApp.createFolder('Bukti Pembayaran Mr One Course');
  properties.setProperty('PAYMENT_PROOF_FOLDER_ID', folder.getId());
  return folder;
}

function submitPaymentConfirmation_(token, payment) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'siswa') throw new Error('Hanya siswa yang dapat mengirim bukti pembayaran.');
  payment = payment || {};
  const studentId = String(session.relatedId || session.userId || '').trim();
  const invoiceNumber = String(payment.invoiceNumber || '').trim();
  const period = String(payment.period || '').trim();
  const method = String(payment.paymentMethod || '').trim();
  const paymentCategory = String(payment.paymentCategory || 'Tuition').trim();
  const itemLabel = String(payment.itemLabel || 'Biaya Les').trim();
  const senderName = String(payment.senderName || '').trim();
  const paymentDate = String(payment.paymentDate || '').trim();
  const amount = Number(payment.amount || 0);
  const proof = payment.proof || {};
  const isCashPayment = /^Tunai\s*-/i.test(method);
  if (!studentId || !invoiceNumber || !period || !method || !senderName || !paymentDate || amount <= 0) throw new Error('Lengkapi seluruh data pembayaran.');
  const mimeType = String(proof.mimeType || '').toLowerCase();
  const base64 = String(proof.base64 || '').replace(/^data:[^;]+;base64,/, '');
  let bytes = [];
  if (!isCashPayment) {
    if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].indexOf(mimeType) === -1) throw new Error('Bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF.');
    if (!base64) throw new Error('Pilih file bukti pembayaran.');
    bytes = Utilities.base64Decode(base64);
    if (bytes.length > 4 * 1024 * 1024) throw new Error('Ukuran bukti pembayaran maksimal 4 MB.');
  }
  const spreadsheet = getDatabase_();
  const sheet = getPaymentConfirmationSheet_(spreadsheet);
  const confirmationRows = getSheetObjects_(sheet);
  const normalizedCategory = normalizePaymentCategory_(paymentCategory);

  const existingIndex = confirmationRows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      String(getObjectValue_(item, ['Period']) || '').trim() === period &&
      normalizePaymentCategory_(getObjectValue_(item, ['Payment Category'])) === normalizedCategory;
  });
  const existing = existingIndex >= 0 ? confirmationRows[existingIndex] : null;
  const existingStatus = existing ? String(getObjectValue_(existing, ['Status']) || '').trim() : '';

  if (existing && /menunggu verifikasi/i.test(existingStatus)) {
    throw new Error('Bukti pembayaran periode ini sedang menunggu verifikasi Admin.');
  }
  if (existing && /lunas|paid|verified/i.test(existingStatus)) {
    throw new Error('Pembayaran periode ini sudah terverifikasi.');
  }

  const studentSheet = spreadsheet.getSheetByName('Data Siswa');
  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  }) || {};

  const confirmationId = existing
    ? String(getObjectValue_(existing, ['Confirmation ID']) || '')
    : 'PAY-' + Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyyMMddHHmmss') + '-' + studentId;

  const safeName = isCashPayment ? '' : String(proof.fileName || 'bukti-pembayaran').replace(/[^a-zA-Z0-9._-]/g, '-');
  let proofFileId = '';

  if (!isCashPayment) {
    const oldProofId = existing ? String(getObjectValue_(existing, ['Proof File ID']) || '').trim() : '';
    if (oldProofId) {
      try { DriveApp.getFileById(oldProofId).setTrashed(true); } catch (error) { /* ignore old file cleanup */ }
    }

    const blob = Utilities.newBlob(bytes, mimeType, confirmationId + '-' + safeName);
    proofFileId = getPaymentProofFolder_().createFile(blob).getId();
  }

  const values = {
    'Confirmation ID': confirmationId,
    'Submitted At': new Date(),
    'Student ID': studentId,
    'Student Name': String(getObjectValue_(student, ['Full Name', 'Nama']) || session.fullName || ''),
    'Invoice Number': invoiceNumber,
    'Payment Category': paymentCategory,
    'Item Label': itemLabel,
    'Period': period,
    'Amount': amount,
    'Payment Method': method,
    'Sender Name': senderName,
    'Payment Date': paymentDate,
    'Proof File ID': proofFileId,
    'Proof File Name': safeName,
    'Proof MIME Type': isCashPayment ? '' : mimeType,
    'Status': 'Menunggu Verifikasi',
    'Admin Note': '',
    'Verified At': '',
    'Verified By': ''
  };

  if (existingIndex >= 0) {
    updateMappedRow_(sheet, existingIndex + 2, values);
  } else {
    appendMappedRow_(sheet, values);
  }

  return {
    success: true,
    updatedExisting: existingIndex >= 0,
    message: existingIndex >= 0
      ? 'Bukti pembayaran diperbarui dan kembali menunggu verifikasi Admin.'
      : 'Bukti pembayaran berhasil dikirim dan sedang menunggu verifikasi Admin.',
    confirmationId: confirmationId,
    status: 'Menunggu Verifikasi'
  };
}

function requirePaymentAdmin_(token) {
  const session = getSession_(token);
  const role = String(session.role || '').trim().toLowerCase();
  if (role !== 'admin' && role !== 'ceo') throw new Error('Hanya Admin atau CEO yang dapat memverifikasi pembayaran.');
  return session;
}

function getPaymentConfirmations_(token) {
  requirePaymentAdmin_(token);
  const spreadsheet = getDatabase_();
  const sheet = getPaymentConfirmationSheet_(spreadsheet);
  const confirmations = getSheetObjects_(sheet).map(function (item) {
    return {
      confirmationId: String(getObjectValue_(item, ['Confirmation ID']) || ''), submittedAt: getObjectValue_(item, ['Submitted At']),
      studentId: String(getObjectValue_(item, ['Student ID']) || ''), studentName: String(getObjectValue_(item, ['Student Name']) || ''),
      invoiceNumber: String(getObjectValue_(item, ['Invoice Number']) || ''), period: String(getObjectValue_(item, ['Period']) || ''),
      paymentCategory: String(getObjectValue_(item, ['Payment Category']) || 'Tuition'), itemLabel: String(getObjectValue_(item, ['Item Label']) || ''),
      amount: Number(getObjectValue_(item, ['Amount']) || 0), paymentMethod: String(getObjectValue_(item, ['Payment Method']) || ''),
      senderName: String(getObjectValue_(item, ['Sender Name']) || ''), paymentDate: String(getObjectValue_(item, ['Payment Date']) || ''),
      proofFileName: String(getObjectValue_(item, ['Proof File Name']) || ''), proofMimeType: String(getObjectValue_(item, ['Proof MIME Type']) || ''),
      status: String(getObjectValue_(item, ['Status']) || ''), adminNote: String(getObjectValue_(item, ['Admin Note']) || ''),
      verifiedAt: getObjectValue_(item, ['Verified At']), verifiedBy: String(getObjectValue_(item, ['Verified By']) || '')
    };
  }).sort(function (a, b) { return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0); });
  const paymentsSheet = spreadsheet.getSheetByName('Data Pembayaran');
  const payments = paymentsSheet ? getSheetObjects_(paymentsSheet).map(function (item) {
    return {
      paymentId: String(getObjectValue_(item, ['Payment ID']) || ''), studentId: String(getObjectValue_(item, ['Student ID']) || ''),
      studentName: String(getObjectValue_(item, ['Nama', 'Student Name']) || ''), paymentCategory: normalizePaymentCategory_(getObjectValue_(item, ['Payment Category', 'Kategori'])),
      itemLabel: String(getObjectValue_(item, ['Item Label']) || ''), period: String(getObjectValue_(item, ['Period', 'Periode']) || ''),
      amount: Number(getObjectValue_(item, ['Amount', 'Nominal']) || 0), paymentMethod: String(getObjectValue_(item, ['Payment Method', 'Metode']) || ''),
      paymentDate: getObjectValue_(item, ['Payment Date', 'Tanggal']), status: String(getObjectValue_(item, ['Status']) || ''),
      fulfillmentStatus: String(getObjectValue_(item, ['Fulfillment Status']) || ''), notes: String(getObjectValue_(item, ['Notes', 'Catatan']) || '')
    };
  }).filter(function (item) { return item.paymentId; }).sort(function (a, b) { return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0); }) : [];
  return { success: true, confirmations: confirmations, payments: payments };
}

function getPaymentProof_(token, confirmationId) {
  requirePaymentAdmin_(token);
  const sheet = getPaymentConfirmationSheet_(getDatabase_());
  const item = getSheetObjects_(sheet).find(function (row) { return String(getObjectValue_(row, ['Confirmation ID']) || '') === String(confirmationId || ''); });
  if (!item) throw new Error('Bukti pembayaran tidak ditemukan.');
  const file = DriveApp.getFileById(String(getObjectValue_(item, ['Proof File ID']) || ''));
  const blob = file.getBlob();
  return { success: true, fileName: file.getName(), mimeType: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) };
}

function reviewPaymentConfirmation_(token, review) {
  const session = requirePaymentAdmin_(token);
  review = review || {};
  const confirmationId = String(review.confirmationId || '').trim();
  const decision = String(review.decision || '').trim().toLowerCase();
  if (!confirmationId || ['verify', 'reject'].indexOf(decision) === -1) throw new Error('Keputusan verifikasi tidak valid.');
  const spreadsheet = getDatabase_();
  const sheet = getPaymentConfirmationSheet_(spreadsheet);
  const rows = getSheetObjects_(sheet);
  const index = rows.findIndex(function (row) { return String(getObjectValue_(row, ['Confirmation ID']) || '') === confirmationId; });
  if (index < 0) throw new Error('Konfirmasi pembayaran tidak ditemukan.');
  const item = rows[index];
  const status = decision === 'verify' ? 'Lunas' : 'Ditolak';
  updateMappedRow_(sheet, index + 2, { 'Status': status, 'Admin Note': String(review.note || '').trim(), 'Verified At': new Date(), 'Verified By': session.fullName || session.username || session.userId || 'Admin' });
  if (decision === 'verify') {
    const paymentSheet = spreadsheet.getSheetByName('Data Pembayaran');
    ensureHeaders_(paymentSheet, ['Payment ID', 'Student ID', 'Nama', 'Payment Category', 'Item Label', 'Period', 'Payment Method', 'Payment Date', 'Amount', 'Status', 'Fulfillment Status', 'Verified Date', 'Verified By', 'Invoice Number', 'Receipt Link', 'Notes']);

    const paymentRows = getSheetObjects_(paymentSheet);
    const existingPaymentIndex = paymentRows.findIndex(function (paymentRow) {
      return String(getObjectValue_(paymentRow, ['Payment ID']) || '').trim() === confirmationId;
    });

    const paymentValues = {
      'Payment ID': confirmationId,
      'Student ID': String(getObjectValue_(item, ['Student ID']) || ''),
      'Nama': String(getObjectValue_(item, ['Student Name']) || ''),
      'Payment Method': String(getObjectValue_(item, ['Payment Method']) || ''),
      'Payment Category': String(getObjectValue_(item, ['Payment Category']) || 'Tuition'),
      'Item Label': String(getObjectValue_(item, ['Item Label']) || ''),
      'Period': String(getObjectValue_(item, ['Period']) || ''),
      'Payment Date': getObjectValue_(item, ['Payment Date']),
      'Amount': Number(getObjectValue_(item, ['Amount']) || 0),
      'Status': 'Lunas',
      'Fulfillment Status': /book|id card/i.test(String(getObjectValue_(item, ['Payment Category']) || '')) ? 'Sedang Disiapkan' : '',
      'Verified Date': new Date(),
      'Verified By': session.fullName || session.username || 'Admin',
      'Invoice Number': String(getObjectValue_(item, ['Invoice Number']) || ''),
      'Notes': String(review.note || 'Diverifikasi melalui portal')
    };

    if (existingPaymentIndex >= 0) {
      updateMappedRow_(paymentSheet, existingPaymentIndex + 2, paymentValues);
    } else {
      appendMappedRow_(paymentSheet, paymentValues);
    }

    if (/tuition/i.test(String(getObjectValue_(item, ['Payment Category']) || 'Tuition'))) {
      markStudentMonthPaid_(
        spreadsheet,
        String(getObjectValue_(item, ['Student ID']) || ''),
        String(getObjectValue_(item, ['Period']) || '')
      );
    }
  }
  return { success: true, message: decision === 'verify' ? 'Pembayaran telah diverifikasi dan ditandai Lunas.' : 'Bukti pembayaran ditolak. Siswa dapat mengirim ulang bukti.', status: status };
}

function updateMappedRow_(sheet, rowNumber, values) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  Object.keys(values).forEach(function (key) { const column = headers.indexOf(key) + 1; if (column > 0) sheet.getRange(rowNumber, column).setValue(values[key]); });
}

function markStudentMonthPaid_(spreadsheet, studentId, period) {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const parts = String(period || '').split('-');
  const monthIndex = Number(parts[1]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return;
  const sheet = spreadsheet.getSheetByName('Data Siswa');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const idColumn = headers.indexOf('Student ID') + 1;
  const monthColumn = headers.indexOf(monthNames[monthIndex]) + 1;
  if (idColumn < 1 || monthColumn < 1) return;
  const ids = sheet.getRange(2, idColumn, Math.max(sheet.getLastRow() - 1, 1), 1).getDisplayValues();
  for (let index = 0; index < ids.length; index += 1) if (String(ids[index][0]).trim() === studentId) { sheet.getRange(index + 2, monthColumn).setValue('Lunas'); break; }
}

function normalizePaymentCategory_(value) {
  const text = String(value || '').trim().toLowerCase();
  if (/book|buku|workbook/.test(text)) return 'Book Package';
  if (/id\s*card|kartu/.test(text)) return 'ID Card';
  return 'Tuition';
}

function buildStudentPaymentCenter_(spreadsheet, studentId, currentPeriod, legacyTuitionValue) {
  const paymentsSheet = spreadsheet.getSheetByName('Data Pembayaran');
  const confirmationsSheet = spreadsheet.getSheetByName('Payment Confirmations');
  const payments = paymentsSheet ? getSheetObjects_(paymentsSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId && /lunas|paid|verified/i.test(String(getObjectValue_(item, ['Status']) || ''));
  }) : [];
  const confirmations = confirmationsSheet ? getSheetObjects_(confirmationsSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  }) : [];
  function latestByCategory(category, period) {
    const paid = payments.filter(function (item) {
      const itemCategory = normalizePaymentCategory_(getObjectValue_(item, ['Payment Category', 'Kategori']));
      const itemPeriod = String(getObjectValue_(item, ['Period', 'Periode']) || '').trim();
      return itemCategory === category && (!period || itemPeriod === period || (category === 'Tuition' && !itemPeriod));
    }).sort(function (a, b) { return new Date(getObjectValue_(b, ['Payment Date', 'Tanggal']) || 0) - new Date(getObjectValue_(a, ['Payment Date', 'Tanggal']) || 0); })[0];
    if (paid) return { source: 'payment', row: paid };
    const confirmation = confirmations.filter(function (item) {
      return normalizePaymentCategory_(getObjectValue_(item, ['Payment Category'])) === category && (!period || String(getObjectValue_(item, ['Period']) || '') === period);
    }).sort(function (a, b) { return new Date(getObjectValue_(b, ['Submitted At']) || 0) - new Date(getObjectValue_(a, ['Submitted At']) || 0); })[0];
    return confirmation ? { source: 'confirmation', row: confirmation } : null;
  }
  function makeItem(category, label, amount, period, icon) {
    const found = latestByCategory(category, period);
    const row = found ? found.row : {};
    let status = found ? String(getObjectValue_(row, ['Status']) || '') : (category === 'Tuition' ? 'Belum Lunas' : 'Belum Dibeli');
    if (category === 'Tuition' && /-07$/.test(String(period || ''))) status = 'Libur';
    if (category === 'Tuition' && /lunas/i.test(String(legacyTuitionValue || ''))) status = 'Lunas';
    return {
      category: category, label: label, icon: icon, amount: amount, period: period || 'Sekali Bayar', status: status || (category === 'Tuition' ? 'Belum Lunas' : 'Belum Dibeli'),
      paymentId: String(getObjectValue_(row, ['Payment ID', 'Confirmation ID']) || ''), invoiceNumber: String(getObjectValue_(row, ['Invoice Number']) || ''),
      paymentDate: getObjectValue_(row, ['Payment Date']), paymentMethod: String(getObjectValue_(row, ['Payment Method']) || ''),
      fulfillmentStatus: category === 'Tuition' ? '' : String(getObjectValue_(row, ['Fulfillment Status']) || (/lunas/i.test(status) ? 'Sedang Disiapkan' : '')),
      note: String(getObjectValue_(row, ['Notes', 'Admin Note']) || '')
    };
  }
  const nowDate = new Date();

  const history = payments
    .filter(function (row) {
      const category = normalizePaymentCategory_(
        getObjectValue_(row, ['Payment Category', 'Kategori'])
      );

      const period = String(
        getObjectValue_(row, ['Period', 'Periode']) || ''
      ).trim();

      const paymentDateValue =
        getObjectValue_(row, ['Payment Date', 'Tanggal']);

      const paymentDate = paymentDateValue
        ? new Date(paymentDateValue)
        : null;

      // Jangan tampilkan transaksi dengan tanggal di masa depan.
      if (
        paymentDate &&
        !isNaN(paymentDate) &&
        paymentDate > nowDate
      ) {
        return false;
      }

      // Untuk les bulanan, jangan tampilkan periode setelah bulan berjalan.
      // Format periode yang dipakai sistem: YYYY-MM.
      if (
        category === 'Tuition' &&
        /^\d{4}-\d{2}$/.test(period) &&
        period > currentPeriod
      ) {
        return false;
      }

      return true;
    })
    .sort(function (a, b) {
      return new Date(getObjectValue_(b, ['Payment Date', 'Tanggal']) || 0) -
        new Date(getObjectValue_(a, ['Payment Date', 'Tanggal']) || 0);
    })
    .map(function (row) {
      const category = normalizePaymentCategory_(getObjectValue_(row, ['Payment Category', 'Kategori']));
      const label = String(getObjectValue_(row, ['Item Label']) || (
        category === 'Book Package'
          ? 'Paket 4 Buku Pendamping'
          : category === 'ID Card'
            ? 'ID Card Siswa'
            : 'Les Bulanan'
      ));
      return {
        paymentId: String(getObjectValue_(row, ['Payment ID']) || ''),
        invoiceNumber: String(getObjectValue_(row, ['Invoice Number']) || ''),
        category: category,
        label: label,
        period: String(getObjectValue_(row, ['Period', 'Periode']) || ''),
        amount: Number(getObjectValue_(row, ['Amount', 'Nominal']) || 0),
        status: String(getObjectValue_(row, ['Status']) || 'Lunas'),
        paymentDate: getObjectValue_(row, ['Payment Date', 'Tanggal']),
        paymentMethod: String(getObjectValue_(row, ['Payment Method', 'Metode']) || ''),
        fulfillmentStatus: category === 'Tuition' ? '' : String(getObjectValue_(row, ['Fulfillment Status']) || ''),
        note: String(getObjectValue_(row, ['Notes', 'Catatan']) || '')
      };
    });

  return {
    items: [
      makeItem('Tuition', 'Les Bulanan', 150000, currentPeriod, '💳'),
      makeItem('Book Package', 'Paket 4 Buku Pendamping', 150000, '', '📚'),
      makeItem('ID Card', 'ID Card Siswa', 20000, '', '🪪')
    ],
    history: history
  };
}

function addHistoricalPayment_(token, payment) {
  const session = requirePaymentAdmin_(token); payment = payment || {};
  const studentId = String(payment.studentId || '').trim(); const category = normalizePaymentCategory_(payment.paymentCategory);
  const amount = Number(payment.amount || 0); const paymentDate = String(payment.paymentDate || '').trim();
  if (!studentId || !paymentDate || amount <= 0) throw new Error('Lengkapi Student ID, tanggal, dan nominal pembayaran.');
  const spreadsheet = getDatabase_(); const studentSheet = spreadsheet.getSheetByName('Data Siswa');
  const student = getSheetObjects_(studentSheet).find(function (item) { return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId; });
  if (!student) throw new Error('Student ID tidak ditemukan.');
  const sheet = spreadsheet.getSheetByName('Data Pembayaran');
  ensureHeaders_(sheet, ['Payment ID', 'Student ID', 'Nama', 'Payment Category', 'Item Label', 'Period', 'Payment Method', 'Payment Date', 'Amount', 'Status', 'Fulfillment Status', 'Verified Date', 'Verified By', 'Invoice Number', 'Notes']);

  const period = String(payment.period || '').trim();
  const rows = getSheetObjects_(sheet);
  const existingIndex = rows.findIndex(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      normalizePaymentCategory_(getObjectValue_(item, ['Payment Category', 'Kategori'])) === category &&
      String(getObjectValue_(item, ['Period', 'Periode']) || '').trim() === period;
  });
  const existing = existingIndex >= 0 ? rows[existingIndex] : null;

  const paymentId = existing
    ? String(getObjectValue_(existing, ['Payment ID']) || '')
    : 'HIST-' + Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyyMMddHHmmss') + '-' + studentId;

  const values = {
    'Payment ID': paymentId,
    'Student ID': studentId,
    'Nama': String(getObjectValue_(student, ['Full Name', 'Nama']) || ''),
    'Payment Category': category,
    'Item Label': category === 'Book Package' ? 'Paket 4 Buku Pendamping' : (category === 'ID Card' ? 'ID Card Siswa' : 'Les Bulanan'),
    'Period': period,
    'Payment Method': String(payment.paymentMethod || 'Pembayaran Lama'),
    'Payment Date': paymentDate,
    'Amount': amount,
    'Status': 'Lunas',
    'Fulfillment Status': category === 'Tuition' ? '' : String(payment.fulfillmentStatus || 'Sedang Disiapkan'),
    'Verified Date': new Date(),
    'Verified By': session.fullName || session.username || 'Admin',
    'Invoice Number': existing ? String(getObjectValue_(existing, ['Invoice Number']) || paymentId) : paymentId,
    'Notes': String(payment.note || 'Pembayaran lama dicatat Admin')
  };

  if (existingIndex >= 0) {
    updateMappedRow_(sheet, existingIndex + 2, values);
  } else {
    appendMappedRow_(sheet, values);
  }

  if (category === 'Tuition' && period) markStudentMonthPaid_(spreadsheet, studentId, period);

  return {
    success: true,
    updatedExisting: existingIndex >= 0,
    message: existingIndex >= 0
      ? 'Data pembayaran lama untuk periode yang sama berhasil diperbarui.'
      : 'Pembayaran lama berhasil dicatat sebagai Lunas.',
    paymentId: paymentId
  };
}

function updatePaymentFulfillment_(token, fulfillment) {
  const session = requirePaymentAdmin_(token); fulfillment = fulfillment || {};
  const paymentId = String(fulfillment.paymentId || '').trim(); const status = String(fulfillment.status || '').trim();
  if (!paymentId || ['Sedang Disiapkan', 'Siap Diambil', 'Sudah Diterima Siswa'].indexOf(status) === -1) throw new Error('Status penyerahan tidak valid.');
  const sheet = getDatabase_().getSheetByName('Data Pembayaran'); ensureHeaders_(sheet, ['Fulfillment Status', 'Notes']);
  const rows = getSheetObjects_(sheet); const index = rows.findIndex(function (item) { return String(getObjectValue_(item, ['Payment ID']) || '') === paymentId; });
  if (index < 0) throw new Error('Transaksi tidak ditemukan.');
  updateMappedRow_(sheet, index + 2, { 'Fulfillment Status': status, 'Notes': String(fulfillment.note || getObjectValue_(rows[index], ['Notes']) || '') });
  return { success: true, message: 'Status penyerahan berhasil diperbarui.', status: status, updatedBy: session.fullName || session.username || 'Admin' };
}


function compactCoreActivitySheetsV63() {
  const database = getDatabase_();
  const timezone = 'Asia/Makassar';
  const summary = {};

  function compactSheet_(sheetName, keyBuilder) {
    const sheet = database.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 3) {
      summary[sheetName] = { removed: 0, kept: Math.max(0, sheet ? sheet.getLastRow() - 1 : 0) };
      return;
    }

    const rows = getSheetObjects_(sheet);
    const lastIndexByKey = {};
    rows.forEach(function (item, index) {
      const key = keyBuilder(item);
      if (key) lastIndexByKey[key] = index;
    });

    const rowsToDelete = [];
    rows.forEach(function (item, index) {
      const key = keyBuilder(item);
      if (key && lastIndexByKey[key] !== index) rowsToDelete.push(index + 2);
    });

    rowsToDelete.sort(function (a, b) { return b - a; }).forEach(function (rowNumber) {
      sheet.deleteRow(rowNumber);
    });

    summary[sheetName] = {
      removed: rowsToDelete.length,
      kept: rows.length - rowsToDelete.length
    };
  }

  compactSheet_('Absensi', function (item) {
    const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    const classId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
    if (!studentId || !date) return '';
    return [studentId, classId, Utilities.formatDate(date, timezone, 'yyyy-MM-dd')].join('|');
  });

  compactSheet_('Monthly Learning Plan', function (item) {
    const classId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    const month = String(getObjectValue_(item, ['Month', 'Bulan']) || '').trim();
    const meeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
    if (!classId || !month || !meeting) return '';
    return [classId, month, meeting].join('|');
  });

  compactSheet_('Learning Journal', function (item) {
    const classId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    const meeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
    const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    if (!classId || !meeting || !date) return '';
    return [classId, meeting, Utilities.formatDate(date, timezone, 'yyyy-MM-dd')].join('|');
  });

  compactSheet_('Student Notes', function (item) {
    const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    const classId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    const source = String(getObjectValue_(item, ['Source', 'Sumber']) || 'Manual').trim();
    const meeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
    const date = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal']));
    if (!studentId || !date) return '';
    return [
      studentId,
      classId,
      source,
      meeting,
      Utilities.formatDate(date, timezone, 'yyyy-MM-dd')
    ].join('|');
  });

  return summary;
}

function buildAttendanceSummary_(records) {
  const summary = { total: records.length, present: 0, absent: 0 };

  records.forEach(function (item) {
    const status = String(getObjectValue_(item, ['Status']) || '')
      .trim().toLowerCase();

    if (status === 'hadir' || status === 'present') summary.present += 1;
    else summary.absent += 1;
  });

  summary.percentage = summary.total
    ? Math.round((summary.present / summary.total) * 1000) / 10
    : null;

  return summary;
}


const MOC_GAMIFICATION_V22_ = {
  timezone: 'Asia/Makassar',
  sheets: {
    ledger: 'EXP Ledger',
    monthly: 'Monthly Gamification',
    badges: 'Badge Progress',
    config: 'Gamification Config'
  }
};

function setupGamificationSystemV22() {
  const database = getDatabase_();

  const definitions = [
    {
      name: MOC_GAMIFICATION_V22_.sheets.ledger,
      headers: ['EXP ID', 'Timestamp', 'Month', 'Student ID', 'Student Name', 'Class ID', 'Program', 'Source Type', 'Source ID', 'Activity Name', 'EXP Earned', 'Skill Category', 'Meeting Number', 'Award Method', 'Status', 'Notes']
    },
    {
      name: MOC_GAMIFICATION_V22_.sheets.monthly,
      headers: ['Month', 'Student ID', 'Student Name', 'Class ID', 'Program', 'Monthly EXP', 'Attendance EXP', 'Learning EXP', 'Assignment EXP', 'Challenge EXP', 'Quiz EXP', 'Project EXP', 'Achievement EXP', 'Speaking EXP', 'Grammar EXP', 'Listening EXP', 'Reading EXP', 'Writing EXP', 'Monthly Class Rank', 'Previous Rank', 'Last Updated']
    },
    {
      name: MOC_GAMIFICATION_V22_.sheets.badges,
      headers: ['Month', 'Student ID', 'Badge ID', 'Badge Name', 'Mission Type', 'Current Progress', 'Target', 'Progress Percent', 'EXP Reward', 'Unlocked', 'Unlocked At', 'Claimed', 'Claimed At', 'Last Updated']
    },
    {
      name: MOC_GAMIFICATION_V22_.sheets.config,
      headers: ['Config ID', 'Category', 'Name', 'EXP Value', 'Target', 'Frequency', 'Active', 'Notes']
    }
  ];

  definitions.forEach(function (definition) {
    let sheet = database.getSheetByName(definition.name);
    if (!sheet) {
      sheet = database.insertSheet(definition.name);
      sheet.getRange(1, 1, 1, definition.headers.length).setValues([definition.headers]);
      sheet.setFrozenRows(1);
    } else {
      ensureHeaders_(sheet, definition.headers);
    }
  });

  seedGamificationConfigV22_();
  backfillGamificationCurrentMonthV22_();
  syncAllBadgeProgressV22_();
  rebuildMonthlyGamificationV22_();

  return auditGamificationSystemV22();
}

function seedGamificationConfigV22_() {
  const database = getDatabase_();
  const sheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.config);
  if (!sheet) return;

  const defaults = [
    ['EXP-LEARNING', 'Learning', 'Learning Summary', 25, 1, 'Per Meeting', 'Ya', 'Sekali per ringkasan per pertemuan'],
    ['EXP-ATTENDANCE-PRESENT', 'Attendance', 'Present', 10, 1, 'Per Meeting', 'Ya', 'Kehadiran valid'],
    ['EXP-ATTENDANCE-LATE', 'Attendance', 'Late', 5, 1, 'Per Meeting', 'Ya', 'Terlambat'],
    ['EXP-ASSIGNMENT', 'Assignment', 'Assignment Completion', 50, 1, 'Per Assignment', 'Ya', 'Nilai aktual dapat mengikuti EXP Awarded pada submission'],
    ['EXP-CHALLENGE', 'Challenge', 'Challenge Completion', 75, 1, 'Per Challenge', 'Ya', 'Nilai aktual dapat mengikuti EXP Awarded'],
    ['EXP-SPEAKING', 'Challenge', 'Speaking Challenge', 100, 1, 'Per Challenge', 'Ya', '75% completion + 25% performance direkomendasikan untuk challenge baru'],
    ['EXP-QUIZ-PARTICIPATE', 'Quiz', 'Quiz Participation', 25, 1, 'Per Quiz', 'Ya', 'Bonus dasar mengikuti quiz/test'],
    ['EXP-PROJECT', 'Project', 'Project Completion', 200, 1, 'Per Project', 'Ya', 'Nilai maksimum project'],
    ['BADGE-LOYAL', 'Badge', 'Pembelajar Setia', 50, 4, 'Monthly', 'Ya', 'Hadir minimal 4 kali'],
    ['BADGE-PERFECT', 'Badge', 'Kehadiran Sempurna', 150, 8, 'Monthly', 'Ya', 'Hadir 8/8'],
    ['BADGE-LEARNING', 'Badge', 'Learning Explorer', 200, 8, 'Monthly', 'Ya', 'Semua ringkasan pembelajaran dibaca'],
    ['BADGE-TASK', 'Badge', 'Task Master', 100, 1, 'Monthly', 'Ya', 'Semua tugas bulan ini selesai'],
    ['BADGE-CHALLENGE', 'Badge', 'Program Champion', 150, 1, 'Monthly', 'Ya', 'Semua challenge program bulan ini selesai'],
    ['BADGE-QUIZ', 'Badge', 'Quiz Master', 150, 1, 'Monthly', 'Ya', 'Pencapaian quiz/test'],
    ['BADGE-PROJECT', 'Badge', 'Project Star', 200, 1, 'Monthly', 'Ya', 'Project program selesai'],
    ['BADGE-ALLROUND', 'Badge', 'MOC All-Rounder', 250, 4, 'Monthly', 'Ya', 'Attendance + Learning + Task + Challenge']
  ];

  const existing = getSheetObjects_(sheet);
  const ids = {};
  existing.forEach(function (item) {
    ids[String(getObjectValue_(item, ['Config ID']) || '').trim()] = true;
  });

  defaults.forEach(function (row) {
    if (!ids[row[0]]) sheet.appendRow(row);
  });
}

function getGamificationConfigValueV22_(configId, fallback) {
  const database = getDatabase_();
  const sheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.config);
  if (!sheet) return Number(fallback || 0);
  const row = getSheetObjects_(sheet).find(function (item) {
    return String(getObjectValue_(item, ['Config ID']) || '').trim() === configId &&
      String(getObjectValue_(item, ['Active']) || 'Ya').trim().toLowerCase() !== 'tidak';
  });
  if (!row) return Number(fallback || 0);
  const value = Number(getObjectValue_(row, ['EXP Value']) || fallback || 0);
  return isNaN(value) ? Number(fallback || 0) : Math.max(0, value);
}

function getStudentGamificationIdentityV22_(studentId) {
  const database = getDatabase_();
  const studentSheet = database.getSheetByName('Data Siswa');
  const scheduleSheet = database.getSheetByName('Master Jadwal');
  if (!studentSheet) return null;

  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === String(studentId || '').trim();
  });
  if (!student) return null;

  const classId = String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim();
  let program = String(getObjectValue_(student, ['Program']) || '').trim();
  if (!program && scheduleSheet) {
    const schedule = getSheetObjects_(scheduleSheet).find(function (item) {
      return String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim() === classId;
    });
    program = schedule ? String(getObjectValue_(schedule, ['Program']) || '').trim() : '';
  }

  return {
    studentId: String(studentId || '').trim(),
    studentName: String(getObjectValue_(student, ['Full Name', 'Nama']) || '').trim(),
    classId: classId,
    program: program
  };
}

function awardStudentExpV22_(options) {
  options = options || {};
  setupGamificationSheetsOnlyV22_();

  const studentId = String(options.studentId || '').trim();
  const sourceType = String(options.sourceType || '').trim();
  const sourceId = String(options.sourceId || '').trim();
  const exp = Math.max(0, Number(options.exp || 0));
  if (!studentId || !sourceType || !sourceId || exp <= 0) {
    return { awarded: false, expAwarded: 0, duplicate: false };
  }

  const identity = getStudentGamificationIdentityV22_(studentId);
  if (!identity) return { awarded: false, expAwarded: 0, duplicate: false };

  const database = getDatabase_();
  const sheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.ledger);
  const rows = getSheetObjects_(sheet);
  const duplicate = rows.some(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      String(getObjectValue_(item, ['Source Type']) || '').trim() === sourceType &&
      String(getObjectValue_(item, ['Source ID']) || '').trim() === sourceId &&
      String(getObjectValue_(item, ['Status']) || 'Active').trim().toLowerCase() !== 'void';
  });

  if (duplicate) {
    return { awarded: false, expAwarded: 0, duplicate: true };
  }

  const now = options.timestamp instanceof Date ? options.timestamp : new Date();
  const month = String(options.month || Utilities.formatDate(now, MOC_GAMIFICATION_V22_.timezone, 'yyyy-MM')).trim();
  const expId = 'EXP-' + Utilities.formatDate(now, MOC_GAMIFICATION_V22_.timezone, 'yyyyMMddHHmmss') + '-' + studentId + '-' + Utilities.getUuid().slice(0, 8);

  appendMappedRow_(sheet, {
    'EXP ID': expId,
    'Timestamp': now,
    'Month': month,
    'Student ID': studentId,
    'Student Name': identity.studentName,
    'Class ID': identity.classId,
    'Program': identity.program,
    'Source Type': sourceType,
    'Source ID': sourceId,
    'Activity Name': String(options.activityName || sourceType),
    'EXP Earned': exp,
    'Skill Category': String(options.skillCategory || sourceType),
    'Meeting Number': options.meetingNumber || '',
    'Award Method': String(options.awardMethod || 'Automatic'),
    'Status': 'Active',
    'Notes': String(options.notes || '')
  });

  if (!options.deferSync) {
    rebuildMonthlyGamificationV22_(month, studentId);
    syncBadgeProgressForStudentV22_(studentId, month);
  }

  return {
    awarded: true,
    expAwarded: exp,
    duplicate: false,
    month: month
  };
}

function setupGamificationSheetsOnlyV22_() {
  const database = getDatabase_();
  const sheetHeaders = {};
  sheetHeaders[MOC_GAMIFICATION_V22_.sheets.ledger] = ['EXP ID', 'Timestamp', 'Month', 'Student ID', 'Student Name', 'Class ID', 'Program', 'Source Type', 'Source ID', 'Activity Name', 'EXP Earned', 'Skill Category', 'Meeting Number', 'Award Method', 'Status', 'Notes'];
  sheetHeaders[MOC_GAMIFICATION_V22_.sheets.monthly] = ['Month', 'Student ID', 'Student Name', 'Class ID', 'Program', 'Monthly EXP', 'Attendance EXP', 'Learning EXP', 'Assignment EXP', 'Challenge EXP', 'Quiz EXP', 'Project EXP', 'Achievement EXP', 'Speaking EXP', 'Grammar EXP', 'Listening EXP', 'Reading EXP', 'Writing EXP', 'Monthly Class Rank', 'Previous Rank', 'Last Updated'];
  sheetHeaders[MOC_GAMIFICATION_V22_.sheets.badges] = ['Month', 'Student ID', 'Badge ID', 'Badge Name', 'Mission Type', 'Current Progress', 'Target', 'Progress Percent', 'EXP Reward', 'Unlocked', 'Unlocked At', 'Claimed', 'Claimed At', 'Last Updated'];
  sheetHeaders[MOC_GAMIFICATION_V22_.sheets.config] = ['Config ID', 'Category', 'Name', 'EXP Value', 'Target', 'Frequency', 'Active', 'Notes'];

  Object.keys(sheetHeaders).forEach(function (name) {
    let sheet = database.getSheetByName(name);
    if (!sheet) {
      sheet = database.insertSheet(name);
      sheet.getRange(1, 1, 1, sheetHeaders[name].length).setValues([sheetHeaders[name]]);
      sheet.setFrozenRows(1);
    } else {
      ensureHeaders_(sheet, sheetHeaders[name]);
    }
  });
}

function rebuildMonthlyGamificationV22_(monthFilter, studentIdFilter) {
  setupGamificationSheetsOnlyV22_();

  const database = getDatabase_();
  const ledgerSheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.ledger);
  const monthlySheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.monthly);
  const ledger = getSheetObjects_(ledgerSheet).filter(function (item) {
    const active = String(getObjectValue_(item, ['Status']) || 'Active').trim().toLowerCase() !== 'void';
    const month = String(getObjectValue_(item, ['Month']) || '').trim();
    const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    return active &&
      (!monthFilter || month === monthFilter) &&
      (!studentIdFilter || studentId === studentIdFilter);
  });

  const groups = {};
  ledger.forEach(function (item) {
    const month = String(getObjectValue_(item, ['Month']) || '').trim();
    const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    const key = month + '|' + studentId;
    if (!groups[key]) {
      groups[key] = {
        month: month,
        studentId: studentId,
        studentName: String(getObjectValue_(item, ['Student Name']) || ''),
        classId: String(getObjectValue_(item, ['Class ID']) || ''),
        program: String(getObjectValue_(item, ['Program']) || ''),
        total: 0,
        source: {},
        skill: {}
      };
    }
    const exp = Math.max(0, Number(getObjectValue_(item, ['EXP Earned']) || 0));
    const sourceType = String(getObjectValue_(item, ['Source Type']) || '').trim();
    const skill = String(getObjectValue_(item, ['Skill Category']) || '').trim();
    groups[key].total += exp;
    groups[key].source[sourceType] = (groups[key].source[sourceType] || 0) + exp;
    groups[key].skill[skill] = (groups[key].skill[skill] || 0) + exp;
  });

  const existing = getSheetObjects_(monthlySheet);
  const headers = monthlySheet.getRange(1, 1, 1, monthlySheet.getLastColumn()).getDisplayValues()[0];
  const now = new Date();

  Object.keys(groups).forEach(function (key) {
    const g = groups[key];
    const existingIndex = existing.findIndex(function (item) {
      return String(getObjectValue_(item, ['Month']) || '').trim() === g.month &&
        String(getObjectValue_(item, ['Student ID']) || '').trim() === g.studentId;
    });

    const previousRank = existingIndex >= 0 ? Number(getObjectValue_(existing[existingIndex], ['Monthly Class Rank']) || 0) : '';
    const values = {
      'Month': g.month,
      'Student ID': g.studentId,
      'Student Name': g.studentName,
      'Class ID': g.classId,
      'Program': g.program,
      'Monthly EXP': g.total,
      'Attendance EXP': g.source.Attendance || 0,
      'Learning EXP': g.source.Learning || 0,
      'Assignment EXP': g.source.Assignment || 0,
      'Challenge EXP': g.source.Challenge || 0,
      'Quiz EXP': g.source.Quiz || 0,
      'Project EXP': g.source.Project || 0,
      'Achievement EXP': g.source.Achievement || 0,
      'Speaking EXP': g.skill.Speaking || 0,
      'Grammar EXP': g.skill.Grammar || 0,
      'Listening EXP': g.skill.Listening || 0,
      'Reading EXP': g.skill.Reading || 0,
      'Writing EXP': g.skill.Writing || 0,
      'Previous Rank': previousRank,
      'Last Updated': now
    };

    const row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(values, header)
        ? values[header]
        : (existingIndex >= 0 ? getObjectValue_(existing[existingIndex], [header]) : '');
    });

    if (existingIndex >= 0) monthlySheet.getRange(existingIndex + 2, 1, 1, headers.length).setValues([row]);
    else monthlySheet.appendRow(row);
  });

  updateMonthlyClassRanksV22_(monthFilter);
}

function updateMonthlyClassRanksV22_(monthFilter) {
  const database = getDatabase_();
  const sheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.monthly);
  if (!sheet) return;

  const rows = getSheetObjects_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const rankColumn = headers.indexOf('Monthly Class Rank') + 1;
  if (rankColumn < 1) return;

  const groups = {};
  rows.forEach(function (item, index) {
    const month = String(getObjectValue_(item, ['Month']) || '').trim();
    if (monthFilter && month !== monthFilter) return;
    const classId = String(getObjectValue_(item, ['Class ID']) || '').trim();
    const key = month + '|' + classId;
    if (!groups[key]) groups[key] = [];
    groups[key].push({
      row: index + 2,
      exp: Number(getObjectValue_(item, ['Monthly EXP']) || 0),
      studentId: String(getObjectValue_(item, ['Student ID']) || '')
    });
  });

  Object.keys(groups).forEach(function (key) {
    groups[key]
      .sort(function (a, b) { return b.exp - a.exp || a.studentId.localeCompare(b.studentId); })
      .forEach(function (entry, index) {
        sheet.getRange(entry.row, rankColumn).setValue(index + 1);
      });
  });
}

function getStudentGamificationSummaryV22_(studentId, classId, month) {
  setupGamificationSheetsOnlyV22_();
  const database = getDatabase_();
  const sheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.monthly);
  if (!sheet) return { month: month, monthlyExp: 0, breakdown: {}, classRank: null, classSize: 0, leaderboard: [] };

  const rows = getSheetObjects_(sheet).filter(function (item) {
    return String(getObjectValue_(item, ['Month']) || '').trim() === month &&
      String(getObjectValue_(item, ['Class ID']) || '').trim() === classId;
  });

  const current = rows.find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  });

  const leaderboard = rows
    .slice()
    .sort(function (a, b) {
      return Number(getObjectValue_(b, ['Monthly EXP']) || 0) - Number(getObjectValue_(a, ['Monthly EXP']) || 0);
    })
    .slice(0, 10)
    .map(function (item, index) {
      return {
        rank: Number(getObjectValue_(item, ['Monthly Class Rank']) || index + 1),
        studentId: String(getObjectValue_(item, ['Student ID']) || ''),
        displayName: abbreviateStudentNameV22_(String(getObjectValue_(item, ['Student Name']) || 'Student')),
        monthlyExp: Number(getObjectValue_(item, ['Monthly EXP']) || 0)
      };
    });

  return {
    month: month,
    monthlyExp: current ? Number(getObjectValue_(current, ['Monthly EXP']) || 0) : 0,
    classRank: current ? Number(getObjectValue_(current, ['Monthly Class Rank']) || 0) || null : null,
    classSize: rows.length,
    breakdown: current ? {
      attendance: Number(getObjectValue_(current, ['Attendance EXP']) || 0),
      learning: Number(getObjectValue_(current, ['Learning EXP']) || 0),
      assignment: Number(getObjectValue_(current, ['Assignment EXP']) || 0),
      challenge: Number(getObjectValue_(current, ['Challenge EXP']) || 0),
      quiz: Number(getObjectValue_(current, ['Quiz EXP']) || 0),
      project: Number(getObjectValue_(current, ['Project EXP']) || 0),
      achievement: Number(getObjectValue_(current, ['Achievement EXP']) || 0),
      speaking: Number(getObjectValue_(current, ['Speaking EXP']) || 0),
      grammar: Number(getObjectValue_(current, ['Grammar EXP']) || 0),
      listening: Number(getObjectValue_(current, ['Listening EXP']) || 0),
      reading: Number(getObjectValue_(current, ['Reading EXP']) || 0),
      writing: Number(getObjectValue_(current, ['Writing EXP']) || 0)
    } : {},
    leaderboard: leaderboard
  };
}

function abbreviateStudentNameV22_(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Student';
  if (parts.length === 1) return parts[0];
  return parts[0] + ' ' + parts.slice(1).map(function (part) { return part.charAt(0).toUpperCase() + '.'; }).join(' ');
}

function syncBadgeProgressForStudentV22_(studentId, month) {
  setupGamificationSheetsOnlyV22_();
  const database = getDatabase_();
  const studentSheet = database.getSheetByName('Data Siswa');
  const attendanceSheet = database.getSheetByName('Absensi');
  const readSheet = database.getSheetByName('Learning Activity Reads');
  const assignmentSheet = database.getSheetByName('Assignments');
  const submissionSheet = database.getSheetByName('Assignment Submissions');
  const challengeSheet = database.getSheetByName('Challenges');
  const resultSheet = database.getSheetByName('Challenge Results');
  const badgeSheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.badges);
  if (!studentSheet || !badgeSheet) return;

  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  });
  if (!student) return;

  const classId = String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim();
  const timezone = MOC_GAMIFICATION_V22_.timezone;

  const attendanceRows = attendanceSheet ? getSheetObjects_(attendanceSheet).filter(function (item) {
    const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
    const status = String(getObjectValue_(item, ['Status']) || '').trim().toLowerCase();
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      date && Utilities.formatDate(date, timezone, 'yyyy-MM') === month &&
      (status === 'hadir' || status === 'present');
  }) : [];

  const uniquePresentDates = {};
  attendanceRows.forEach(function (item) {
    const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
    if (date) uniquePresentDates[Utilities.formatDate(date, timezone, 'yyyy-MM-dd')] = true;
  });
  const presentCount = Object.keys(uniquePresentDates).length;

  const readCount = readSheet ? getSheetObjects_(readSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      String(getObjectValue_(item, ['Month']) || '').trim() === month;
  }).length : 0;

  const assignments = assignmentSheet ? getSheetObjects_(assignmentSheet).filter(function (item) {
    const assigned = normalizeStudentDate_(getObjectValue_(item, ['Assigned Date', 'Date']));
    return String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
      (!assigned || Utilities.formatDate(assigned, timezone, 'yyyy-MM') === month);
  }) : [];
  const assignmentIds = assignments.map(function (item) { return String(getObjectValue_(item, ['Assignment ID']) || ''); }).filter(Boolean);
  const assignmentDone = submissionSheet ? getSheetObjects_(submissionSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      assignmentIds.indexOf(String(getObjectValue_(item, ['Assignment ID']) || '')) >= 0;
  }).length : 0;

  const challenges = challengeSheet ? getSheetObjects_(challengeSheet).filter(function (item) {
    const due = normalizeStudentDate_(getObjectValue_(item, ['Due Date', 'Date']));
    return String(getObjectValue_(item, ['Class ID']) || '').trim() === classId &&
      (!due || Utilities.formatDate(due, timezone, 'yyyy-MM') === month);
  }) : [];
  const challengeIds = challenges.map(function (item) { return String(getObjectValue_(item, ['Challenge ID']) || ''); }).filter(Boolean);
  const challengeDone = resultSheet ? getSheetObjects_(resultSheet).filter(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      challengeIds.indexOf(String(getObjectValue_(item, ['Challenge ID']) || '')) >= 0;
  }).length : 0;

  const definitions = [
    ['BADGE-LOYAL', 'Pembelajar Setia', 'Attendance', Math.min(presentCount, 4), 4, getGamificationConfigValueV22_('BADGE-LOYAL', 50)],
    ['BADGE-PERFECT', 'Kehadiran Sempurna', 'Attendance', Math.min(presentCount, 8), 8, getGamificationConfigValueV22_('BADGE-PERFECT', 150)],
    ['BADGE-LEARNING', 'Learning Explorer', 'Learning', Math.min(readCount, 8), 8, getGamificationConfigValueV22_('BADGE-LEARNING', 200)],
    ['BADGE-TASK', 'Task Master', 'Assignment', assignmentDone, Math.max(assignments.length, 1), getGamificationConfigValueV22_('BADGE-TASK', 100)],
    ['BADGE-CHALLENGE', 'Program Champion', 'Challenge', challengeDone, Math.max(challenges.length, 1), getGamificationConfigValueV22_('BADGE-CHALLENGE', 150)]
  ];

  const existing = getSheetObjects_(badgeSheet);
  const headers = badgeSheet.getRange(1, 1, 1, badgeSheet.getLastColumn()).getDisplayValues()[0];
  const now = new Date();

  definitions.forEach(function (definition) {
    const badgeId = definition[0];
    const current = Number(definition[3] || 0);
    const target = Math.max(1, Number(definition[4] || 1));
    const unlocked = current >= target;
    const existingIndex = existing.findIndex(function (item) {
      return String(getObjectValue_(item, ['Month']) || '').trim() === month &&
        String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
        String(getObjectValue_(item, ['Badge ID']) || '').trim() === badgeId;
    });
    const previousUnlocked = existingIndex >= 0 &&
      String(getObjectValue_(existing[existingIndex], ['Unlocked']) || '').trim().toLowerCase() === 'ya';

    const values = {
      'Month': month,
      'Student ID': studentId,
      'Badge ID': badgeId,
      'Badge Name': definition[1],
      'Mission Type': definition[2],
      'Current Progress': current,
      'Target': target,
      'Progress Percent': Math.min(100, Math.round(current / target * 100)),
      'EXP Reward': Number(definition[5] || 0),
      'Unlocked': unlocked ? 'Ya' : 'Tidak',
      'Unlocked At': unlocked ? (previousUnlocked ? getObjectValue_(existing[existingIndex], ['Unlocked At']) : now) : '',
      'Claimed': existingIndex >= 0 ? String(getObjectValue_(existing[existingIndex], ['Claimed']) || 'Tidak') : 'Tidak',
      'Claimed At': existingIndex >= 0 ? getObjectValue_(existing[existingIndex], ['Claimed At']) : '',
      'Last Updated': now
    };

    const row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(values, header)
        ? values[header]
        : (existingIndex >= 0 ? getObjectValue_(existing[existingIndex], [header]) : '');
    });
    if (existingIndex >= 0) badgeSheet.getRange(existingIndex + 2, 1, 1, headers.length).setValues([row]);
    else badgeSheet.appendRow(row);
  });
}

function syncAllBadgeProgressV22_() {
  setupGamificationSheetsOnlyV22_();
  const database = getDatabase_();
  const studentSheet = database.getSheetByName('Data Siswa');
  if (!studentSheet) return;
  const month = Utilities.formatDate(new Date(), MOC_GAMIFICATION_V22_.timezone, 'yyyy-MM');
  getSheetObjects_(studentSheet).forEach(function (item) {
    const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
    if (studentId) syncBadgeProgressForStudentV22_(studentId, month);
  });
}

function backfillGamificationCurrentMonthV22_() {
  setupGamificationSheetsOnlyV22_();
  seedGamificationConfigV22_();

  const database = getDatabase_();
  const timezone = MOC_GAMIFICATION_V22_.timezone;
  const month = Utilities.formatDate(new Date(), timezone, 'yyyy-MM');

  const attendanceSheet = database.getSheetByName('Absensi');
  if (attendanceSheet) {
    const seen = {};
    getSheetObjects_(attendanceSheet).forEach(function (item) {
      const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
      const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
      const status = String(getObjectValue_(item, ['Status']) || '').trim().toLowerCase();
      if (!studentId || !date || Utilities.formatDate(date, timezone, 'yyyy-MM') !== month) return;
      if (status !== 'hadir' && status !== 'present' && status !== 'terlambat' && status !== 'late') return;
      const day = Utilities.formatDate(date, timezone, 'yyyy-MM-dd');
      const key = studentId + '|' + day;
      if (seen[key]) return;
      seen[key] = true;
      const late = status === 'terlambat' || status === 'late';
      awardStudentExpV22_({
        studentId: studentId,
        sourceType: 'Attendance',
        sourceId: 'ATT-' + day,
        activityName: late ? 'Late Attendance' : 'Present Attendance',
        exp: getGamificationConfigValueV22_(late ? 'EXP-ATTENDANCE-LATE' : 'EXP-ATTENDANCE-PRESENT', late ? 5 : 10),
        skillCategory: 'Attendance',
        timestamp: date,
        month: month,
        notes: 'Backfill current month',
        deferSync: true
      });
    });
  }

  const readSheet = database.getSheetByName('Learning Activity Reads');
  if (readSheet) {
    getSheetObjects_(readSheet).forEach(function (item) {
      if (String(getObjectValue_(item, ['Month']) || '').trim() !== month) return;
      const studentId = String(getObjectValue_(item, ['Student ID']) || '').trim();
      const meeting = Number(getObjectValue_(item, ['Meeting Number']) || 0);
      const completedAt = normalizeStudentDate_(getObjectValue_(item, ['Completed At'])) || new Date();
      awardStudentExpV22_({
        studentId: studentId,
        sourceType: 'Learning',
        sourceId: 'READ-' + month + '-' + meeting,
        activityName: 'Learning Summary Meeting ' + meeting,
        exp: Number(getObjectValue_(item, ['EXP Awarded']) || getGamificationConfigValueV22_('EXP-LEARNING', 25)),
        skillCategory: 'Learning',
        meetingNumber: meeting,
        timestamp: completedAt,
        month: month,
        notes: 'Backfill current month',
        deferSync: true
      });
    });
  }

  const assignmentSubmissions = database.getSheetByName('Assignment Submissions');
  if (assignmentSubmissions) {
    getSheetObjects_(assignmentSubmissions).forEach(function (item) {
      const date = normalizeStudentDate_(getObjectValue_(item, ['Reviewed At', 'Submitted At']));
      if (!date || Utilities.formatDate(date, timezone, 'yyyy-MM') !== month) return;
      const exp = Number(getObjectValue_(item, ['EXP Awarded']) || 0);
      if (exp <= 0) return;
      awardStudentExpV22_({
        studentId: String(getObjectValue_(item, ['Student ID']) || ''),
        sourceType: 'Assignment',
        sourceId: String(getObjectValue_(item, ['Assignment ID']) || ''),
        activityName: 'Assignment',
        exp: exp,
        skillCategory: 'Assignment',
        timestamp: date,
        month: month,
        notes: 'Backfill current month',
        deferSync: true
      });
    });
  }

  const challengeResults = database.getSheetByName('Challenge Results');
  if (challengeResults) {
    getSheetObjects_(challengeResults).forEach(function (item) {
      const date = normalizeStudentDate_(getObjectValue_(item, ['Reviewed At', 'Submitted At']));
      if (!date || Utilities.formatDate(date, timezone, 'yyyy-MM') !== month) return;
      const exp = Number(getObjectValue_(item, ['EXP Awarded']) || 0);
      if (exp <= 0) return;
      const responseType = String(getObjectValue_(item, ['Response Type']) || '').trim().toLowerCase();
      awardStudentExpV22_({
        studentId: String(getObjectValue_(item, ['Student ID']) || ''),
        sourceType: 'Challenge',
        sourceId: String(getObjectValue_(item, ['Challenge ID']) || ''),
        activityName: 'Challenge',
        exp: exp,
        skillCategory: responseType === 'speech' ? 'Speaking' : 'Challenge',
        timestamp: date,
        month: month,
        notes: 'Backfill current month',
        deferSync: true
      });
    });
  }

  rebuildMonthlyGamificationV22_(month);
}

function auditGamificationSystemV22() {
  const database = getDatabase_();
  const required = [
    MOC_GAMIFICATION_V22_.sheets.ledger,
    MOC_GAMIFICATION_V22_.sheets.monthly,
    MOC_GAMIFICATION_V22_.sheets.badges,
    MOC_GAMIFICATION_V22_.sheets.config
  ];
  const missingSheets = required.filter(function (name) { return !database.getSheetByName(name); });

  const ledgerSheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.ledger);
  const monthlySheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.monthly);
  const badgeSheet = database.getSheetByName(MOC_GAMIFICATION_V22_.sheets.badges);

  function duplicateKeys(rows, keyFn) {
    const counts = {};
    rows.forEach(function (item) {
      const key = keyFn(item);
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).filter(function (key) { return counts[key] > 1; });
  }

  const ledgerDuplicates = ledgerSheet ? duplicateKeys(getSheetObjects_(ledgerSheet), function (item) {
    return [
      getObjectValue_(item, ['Student ID']),
      getObjectValue_(item, ['Source Type']),
      getObjectValue_(item, ['Source ID'])
    ].map(function (value) { return String(value || '').trim(); }).join('|');
  }) : [];

  const monthlyDuplicates = monthlySheet ? duplicateKeys(getSheetObjects_(monthlySheet), function (item) {
    return String(getObjectValue_(item, ['Month']) || '').trim() + '|' + String(getObjectValue_(item, ['Student ID']) || '').trim();
  }) : [];

  const badgeDuplicates = badgeSheet ? duplicateKeys(getSheetObjects_(badgeSheet), function (item) {
    return [
      getObjectValue_(item, ['Month']),
      getObjectValue_(item, ['Student ID']),
      getObjectValue_(item, ['Badge ID'])
    ].map(function (value) { return String(value || '').trim(); }).join('|');
  }) : [];

  return {
    success: true,
    safe: missingSheets.length === 0 && ledgerDuplicates.length === 0 && monthlyDuplicates.length === 0 && badgeDuplicates.length === 0,
    missingSheets: missingSheets,
    duplicateExpLedgerCount: ledgerDuplicates.length,
    duplicateMonthlyGamificationCount: monthlyDuplicates.length,
    duplicateBadgeProgressCount: badgeDuplicates.length,
    ledgerRows: ledgerSheet ? Math.max(0, ledgerSheet.getLastRow() - 1) : 0,
    monthlyRows: monthlySheet ? Math.max(0, monthlySheet.getLastRow() - 1) : 0,
    badgeRows: badgeSheet ? Math.max(0, badgeSheet.getLastRow() - 1) : 0,
    checkedAt: new Date().toISOString()
  };
}

function buildExperienceSummary_(student, attendanceRecords) {
  function numberFrom(headers) {
    const raw = getObjectValue_(student, headers);
    if (raw === '' || raw === null || typeof raw === 'undefined') return 0;
    const value = Number(String(raw).replace(/[^0-9.-]/g, ''));
    return isNaN(value) ? 0 : Math.max(0, value);
  }

  const monthCounts = {};
  let presentCount = 0;
  attendanceRecords.forEach(function (item) {
    const status = String(getObjectValue_(item, ['Status']) || '').trim().toLowerCase();
    if (status !== 'hadir' && status !== 'present') return;
    presentCount += 1;
    const date = normalizeStudentDate_(getObjectValue_(item, ['Tanggal', 'Date']));
    if (!date) return;
    const key = Utilities.formatDate(date, 'Asia/Makassar', 'yyyy-MM');
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });

  let attendanceExp = presentCount * 20;
  Object.keys(monthCounts).forEach(function (key) {
    if (monthCounts[key] >= 8) attendanceExp += 150;
    else if (monthCounts[key] >= 4) attendanceExp += 50;
  });

  const breakdown = {
    attendance: attendanceExp,
    assignment: numberFrom(['Assignment EXP']),
    challenge: numberFrom(['Challenge EXP']),
    quizTest: numberFrom(['Quiz Test EXP', 'Quiz & Test EXP']),
    participation: numberFrom(['Participation EXP', 'Class Participation EXP']),
    project: numberFrom(['Project EXP']),
    achievement: numberFrom(['Achievement EXP']),
    learning: 0
  };
  const calculatedTotal = Object.keys(breakdown).reduce(function (sum, key) {
    return sum + breakdown[key];
  }, 0);
  const storedTotal = numberFrom(['Total EXP', 'EXP', 'Experience Points']);

  return {
    totalExp: storedTotal || calculatedTotal,
    breakdown: breakdown,
    monthly: {
      assignmentsCompleted: numberFrom(['Monthly Assignments Completed']),
      assignmentsTarget: numberFrom(['Monthly Assignments Target']),
      challengesCompleted: numberFrom(['Monthly Challenges Completed']),
      challengesTarget: numberFrom(['Monthly Challenges Target'])
    }
  };
}

function completeLearningActivityRead_(token, meetingNumber) {
  const session = getSession_(token);
  if (String(session.role || '').trim().toLowerCase() !== 'siswa') {
    throw new Error('Misi membaca hanya tersedia untuk siswa.');
  }

  const studentId = String(session.relatedId || session.userId || '').trim();
  const meeting = Number(meetingNumber || 0);
  if (!studentId || meeting < 1 || meeting > 8) {
    throw new Error('Pertemuan tidak valid.');
  }

  const database = getDatabase_();
  const studentSheet = database.getSheetByName('Data Siswa');
  if (!studentSheet) throw new Error('Data Siswa tidak ditemukan.');

  const student = getSheetObjects_(studentSheet).find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId;
  });
  if (!student) throw new Error('Data siswa tidak ditemukan.');

  const classId = String(getObjectValue_(student, ['Class ID', 'Class Id']) || '').trim();
  const timezone = 'Asia/Makassar';
  const now = new Date();
  const month = Utilities.formatDate(now, timezone, 'yyyy-MM');

  const planSheet = database.getSheetByName('Monthly Learning Plan');
  const journalSheet = database.getSheetByName('Learning Journal');
  const plans = planSheet ? getSheetObjects_(planSheet) : [];
  const journals = journalSheet ? getSheetObjects_(journalSheet) : [];

  const hasContent = plans.concat(journals).some(function (item) {
    const itemClassId = String(getObjectValue_(item, ['Class ID', 'Class Id']) || '').trim();
    const itemMeeting = Number(getObjectValue_(item, ['Meeting Number', 'Pertemuan Ke']) || 0);
    const itemMonth = String(getObjectValue_(item, ['Month', 'Bulan']) || '').trim();
    const itemDate = normalizeStudentDate_(getObjectValue_(item, ['Date', 'Tanggal', 'Planned Date', 'Tanggal Rencana']));
    const derivedMonth = itemDate ? Utilities.formatDate(itemDate, timezone, 'yyyy-MM') : '';
    return itemClassId === classId && itemMeeting === meeting && (itemMonth === month || derivedMonth === month);
  });

  if (!hasContent) {
    throw new Error('Ringkasan pembelajaran pertemuan ini belum tersedia.');
  }

  let sheet = database.getSheetByName('Learning Activity Reads');
  const headers = ['Read ID', 'Month', 'Meeting Number', 'Class ID', 'Student ID', 'Student Name', 'Completed At', 'EXP Awarded'];
  if (!sheet) {
    sheet = database.insertSheet('Learning Activity Reads');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders_(sheet, headers);
  }

  const rows = getSheetObjects_(sheet);
  const existing = rows.find(function (item) {
    return String(getObjectValue_(item, ['Student ID']) || '').trim() === studentId &&
      String(getObjectValue_(item, ['Month']) || '').trim() === month &&
      Number(getObjectValue_(item, ['Meeting Number']) || 0) === meeting;
  });

  if (existing) {
    return {
      success: true,
      alreadyCompleted: true,
      expAwarded: Number(getObjectValue_(existing, ['EXP Awarded']) || 25),
      message: 'Misi membaca sudah tercatat.'
    };
  }

  const expAwarded = 25;
  appendMappedRow_(sheet, {
    'Read ID': 'READ-' + Utilities.formatDate(now, timezone, 'yyyyMMddHHmmss') + '-' + studentId + '-' + meeting,
    'Month': month,
    'Meeting Number': meeting,
    'Class ID': classId,
    'Student ID': studentId,
    'Student Name': String(getObjectValue_(student, ['Full Name', 'Nama']) || ''),
    'Completed At': now,
    'EXP Awarded': expAwarded
  });

  const gamificationAward = awardStudentExpV22_({
    studentId: studentId,
    sourceType: 'Learning',
    sourceId: 'READ-' + month + '-' + meeting,
    activityName: 'Learning Summary Meeting ' + meeting,
    exp: expAwarded,
    skillCategory: 'Learning',
    meetingNumber: meeting,
    timestamp: now,
    month: month
  });

  return {
    success: true,
    alreadyCompleted: false,
    expAwarded: expAwarded,
    gamification: gamificationAward.awarded ? { expAwarded: gamificationAward.expAwarded, message: 'Learning completed' } : null,
    message: 'Ringkasan selesai dibaca. +' + expAwarded + ' EXP.'
  };
}

function buildPaymentHistory_(student) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return months.map(function (month) {
    if (month === 'July') {
      return {
        month: month,
        status: 'Libur',
        detail: 'Libur les — tidak ditagihkan'
      };
    }
    const detail = String(getObjectValue_(student, [month]) || '').trim();
    return {
      month: month,
      status: detail.toLowerCase().includes('lunas') ? 'Lunas' : 'Belum Lunas',
      detail: detail
    };
  });
}

function normalizeStudentDate_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return value;
  }

  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(text + 'T00:00:00+08:00');

  const date = new Date(text);
  return isNaN(date) ? null : date;
}

function formatStudentTime_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, 'Asia/Makassar', 'HH:mm');
  }

  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  return match
    ? String(match[1]).padStart(2, '0') + ':' + match[2]
    : String(value).trim();
}

function normalizeStudentDay_(value) {
  const key = String(value).toLowerCase().replace(/[^a-z]/g, '');
  const days = {
    minggu: 0, sunday: 0,
    senin: 1, monday: 1,
    selasa: 2, tuesday: 2,
    rabu: 3, wednesday: 3,
    kamis: 4, thursday: 4,
    jumat: 5, friday: 5,
    sabtu: 6, saturday: 6
  };
  return Object.prototype.hasOwnProperty.call(days, key) ? days[key] : null;
}

function findNextStudentClass_(schedules, now) {
  if (!schedules.length) return null;

  const timezone = 'Asia/Makassar';
  const dayCodes = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const todayIndex = dayCodes[Utilities.formatDate(now, timezone, 'EEE')];
  const todayText = Utilities.formatDate(now, timezone, 'yyyy-MM-dd');
  const candidates = [];

  schedules.forEach(function (item) {
    const dayIndex = normalizeStudentDay_(getObjectValue_(item, ['Hari', 'Day']));
    const start = formatStudentTime_(getObjectValue_(item, ['Mulai', 'Start', 'Start Time', 'Jam Mulai']));
    const end = formatStudentTime_(getObjectValue_(item, ['Selesai', 'End', 'End Time', 'Jam Selesai']));
    if (dayIndex === null || !/^\d{2}:\d{2}$/.test(start)) return;

    let daysAhead = (dayIndex - todayIndex + 7) % 7;
    let candidate = new Date(todayText + 'T' + start + ':00+08:00');
    candidate = new Date(candidate.getTime() + daysAhead * 86400000);
    if (candidate <= now) candidate = new Date(candidate.getTime() + 7 * 86400000);

    candidates.push({ date: candidate, item: item, start: start, end: end });
  });

  candidates.sort(function (a, b) { return a.date - b.date; });
  if (!candidates.length) return null;

  const next = candidates[0];
  return {
    date: next.date.toISOString(),
    day: String(getObjectValue_(next.item, ['Hari', 'Day']) || ''),
    start: next.start,
    end: next.end,
    classId: String(getObjectValue_(next.item, ['Class ID', 'Class Id', 'Kode Kelas']) || ''),
    className: String(
      getObjectValue_(next.item, ['Nama kelas', 'Nama Kelas', 'Class Name', 'Class']) || ''
    ),
    program: String(getObjectValue_(next.item, ['Program']) || ''),
    tutor: String(getObjectValue_(next.item, ['Tutor', 'Teacher']) || ''),
    groupLink: String(getObjectValue_(next.item, ['Link WAG', 'WhatsApp Group', 'Group Link']) || '')
  };
}

function buildStudentScheduleFallback_(student, classId) {
  const scheduleText = String(getObjectValue_(student, ['Schedule', 'Jadwal', 'Jadwal Les']) || '').trim();
  if (!scheduleText) return [];

  const dayPattern = /(Senin|Selasa|Rabu|Kamis|Jum(?:'|’)?at|Jumat|Sabtu|Minggu|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi;
  const timeMatches = scheduleText.match(/\b\d{1,2}[.:]\d{2}\b/g) || [];
  const days = scheduleText.match(dayPattern) || [];
  if (!days.length || !timeMatches.length) return [];

  const start = timeMatches[0].replace('.', ':');
  const end = (timeMatches[1] || '').replace('.', ':');
  const program = String(getObjectValue_(student, ['Program']) || '');

  return days.map(function (day) {
    return {
      'Hari': day.replace(/[’']/g, ''),
      'Mulai': start,
      'Selesai': end,
      'Class ID': classId,
      'Nama Kelas': classId,
      'Program': program,
      'Tutor': String(getObjectValue_(student, ['Tutor', 'Teacher']) || ''),
      'Link WAG': String(getObjectValue_(student, ['Link WAG', 'WhatsApp Group', 'Group Link']) || '')
    };
  });
}

function getAcademicYearLabel_(date) {
  const month = Number(Utilities.formatDate(date, 'Asia/Makassar', 'M'));
  const year = Number(Utilities.formatDate(date, 'Asia/Makassar', 'yyyy'));
  const startYear = month >= 7 ? year : year - 1;
  return startYear + '/' + (startYear + 1);
}





function createTutorTestAccount() {
  const spreadsheet = getDatabase_();
  const sheet = spreadsheet.getSheetByName('Users');

  if (!sheet) {
    throw new Error('Sheet Users tidak ditemukan.');
  }

  ensureHeaders_(sheet, [
    'User ID',
    'Username',
    'Password Hash',
    'Password Salt',
    'Role',
    'Related ID',
    'Full Name',
    'Status',
    'Must Change Password',
    'Created At',
    'Last Login'
  ]);

  const username = 'TUT1';
  const password = 'Vita2026';
  const salt = Utilities.getUuid();
  const passwordHash = hashPassword_(password, salt);

  const accountData = {
    'User ID': 'TUT1',
    'Username': username,
    'Password Hash': passwordHash,
    'Password Salt': salt,
    'Role': 'Tutor',
    'Related ID': 'TUT1',
    'Full Name': 'Miss Vita',
    'Status': 'Aktif',
    'Must Change Password': 'Tidak',
    'Created At': new Date(),
    'Last Login': ''
  };

  const existingUser = findUserByUsername_(sheet, username);

  if (existingUser) {
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0]
      .map(function(header) {
        return String(header).trim();
      });

    Object.keys(accountData).forEach(function(header) {
      const column = headers.indexOf(header) + 1;

      if (column > 0) {
        sheet
          .getRange(existingUser._rowNumber, column)
          .setValue(accountData[header]);
      }
    });
  } else {
    appendObjectToSheet_(sheet, accountData);
  }

  clearFailedLogin_(username);

  Logger.log('Akun tutor berhasil disiapkan.');
  Logger.log('Username: ' + username);
  Logger.log('Password: ' + password);
}
