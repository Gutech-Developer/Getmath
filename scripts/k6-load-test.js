// import http from "k6/http";
// import { check, sleep } from "k6";

// /**
//  * Script load testing k6 untuk Frontend GetSmart (getsmart.id)
//  *
//  * Cara menjalankan script ini:
//  * 1. Install k6 (https://grafana.com/docs/k6/latest/get-started/installation/)
//  * 2. Jalankan load test sederhana (ke public domain):
//  *    k6 run scripts/k6-load-test.js
//  * 3. Menyesuaikan target domain melalui env:
//  *    k6 run -e BASE_URL=https://getsmart.id -e API_URL=http://localhost:8000/api scripts/k6-load-test.js
//  * 4. Untuk pengujian internal production (menghubungi container API langsung di vps):
//  *    k6 run -e BASE_URL=http://localhost:3000 -e API_URL=http://localhost:8000/api -e INTERNAL_API_KEY=key_kamu scripts/k6-load-test.js
//  * 5. Menambahkan kredensial testing siswa/guru untuk simulasi login terproteksi:
//  *    k6 run -e GS_TEST_EMAIL=siswa@getsmart.id -e GS_TEST_PASSWORD=password123 scripts/k6-load-test.js
//  */

// // Ambil kapasitas maks VU dari env (default ke 500 VU)
// const MAX_VUS = parseInt(__ENV.MAX_VUS || "500");

// // Hitung jumlah VU untuk tahap menengah (300 VU jika MAX_VUS = 500)
// const MID_VUS = Math.round(MAX_VUS * 0.6); // 60% dari kapasitas maks
// const LOW_VUS = Math.round(MAX_VUS * 0.2); // 20% dari kapasitas maks

// // ─── KONFIGURASI LOAD TEST ───────────────────────────────────────────────────
// export const options = {
//   // Skenario penahapan beban (ramping) Virtual Users (VUs)
//   stages: [
//     { duration: "1m", target: LOW_VUS },  // Ramping ke 20% kapasitas (e.g. 100 VUs) dalam 1 menit
//     { duration: "2m", target: MID_VUS },  // Ramping ke 60% kapasitas (e.g. 300 VUs) dalam 2 menit
//     { duration: "1m", target: MAX_VUS },  // Stress spike: Naikkan ke kapasitas maks (e.g. 500 VUs) dalam 1 menit
//     { duration: "2m", target: MAX_VUS },  // Pertahankan beban puncak selama 2 menit
//     { duration: "1m", target: 0 },        // Turunkan beban kembali ke 0 pengguna dalam 1 menit
//   ],

//   // Batas toleransi performa (thresholds)
//   thresholds: {
//     // Rasio error request harus di bawah 2% saat stress test tinggi
//     http_req_failed: ["rate<0.02"],
//     // Durasi request rata-rata 90% di bawah 1.5 detik saat stress test tinggi
//     http_req_duration: ["p(90)<1500", "p(95)<3000"],
//   },
// };

// // Target domain frontend default
// const BASE_URL = __ENV.BASE_URL || "https://getsmart.id";
// // Target endpoint API backend langsung ke container BE (default ke localhost port forwarded/host port 8000 di VPS)
// const API_URL = __ENV.API_URL || "http://getsmart-api-go:5000/api";
// // API Key internal untuk bypass/otentikasi langsung ke container internal
// // Default menggunakan key yang ada di .env.local jika tidak ditentukan via ENV
// const INTERNAL_API_KEY = __ENV.INTERNAL_API_KEY || "c120475fbb917358a9a9bac24772ccc6a951dda2996abcba85c9444a8b5aa7b2";

// // Helper untuk membangun header request API
// function getApiHeaders(extraHeaders = {}) {
//   const headers = Object.assign(
//     {
//       "Content-Type": "application/json",
//     },
//     extraHeaders,
//   );

//   // Jika INTERNAL_API_KEY didefinisikan (untuk testing langsung ke internal container), sertakan headernya
//   if (INTERNAL_API_KEY) {
//     headers["x-internal-api-key"] = INTERNAL_API_KEY;
//   }

//   return { headers: headers };
// }

// // Helper untuk mencatat log sukses/gagal setiap request
// function logRequest(name, res) {
//   const method = res.request.method;
//   const url = res.request.url;
//   if (res.status >= 200 && res.status < 300) {
//     console.log(`[k6 SUCCESS] ${name} (${method} ${url}) loaded successfully (status ${res.status}, duration ${res.timings.duration.toFixed(2)}ms)`);
//   } else {
//     let errorDetail = "";
//     if (res.body) {
//       try {
//         const jsonBody = JSON.parse(res.body);
//         errorDetail = jsonBody.message || jsonBody.error || JSON.stringify(jsonBody);
//       } catch (_) {
//         errorDetail = res.body.substring(0, 150);
//       }
//     } else {
//       errorDetail = "empty body";
//     }
//     console.log(`[k6 ERROR] ${name} (${method} ${url}) failed (status ${res.status}, duration ${res.timings.duration.toFixed(2)}ms). Detail: ${errorDetail}`);
//   }
// }

// export default function () {
//   // ─── SCENARIO 1: Mengakses Halaman Beranda (Landing Page) ───
//   const resLanding = http.get(`${BASE_URL}/`);
//   logRequest("Landing Page", resLanding);
//   check(resLanding, {
//     "landing page status is 200": (r) => r.status === 200,
//     "landing page has app title": (r) =>
//       r.body.includes("Getmath") || r.body.includes("getsmart"),
//   });
//   sleep(1); // Jeda waktu berfikir user (think time)

//   // ─── SCENARIO 2: Mengakses Halaman Login ───
//   const resLogin = http.get(`${BASE_URL}/login`);
//   logRequest("Login Page", resLogin);
//   check(resLogin, {
//     "login page status is 200": (r) => r.status === 200,
//   });
//   sleep(1.5);

//   // ─── SCENARIO 3: Pendaftaran Akun (Siswa & Guru) ───
//   const resRegisterStudent = http.get(`${BASE_URL}/register/student`);
//   logRequest("Register Student Page", resRegisterStudent);
//   check(resRegisterStudent, {
//     "register student page status is 200": (r) => r.status === 200,
//   });

//   const resRegisterTeacher = http.get(`${BASE_URL}/register/teacher`);
//   logRequest("Register Teacher Page", resRegisterTeacher);
//   check(resRegisterTeacher, {
//     "register teacher page status is 200": (r) => r.status === 200,
//   });
//   sleep(2);

//   // ─── SCENARIO 4: Halaman Forgot Password ───
//   const resForgotPassword = http.get(`${BASE_URL}/forgot-password`);
//   logRequest("Forgot Password Page", resForgotPassword);
//   check(resForgotPassword, {
//     "forgot password page status is 200": (r) => r.status === 200,
//   });
//   sleep(1);

//   // ─── SCENARIO 5: Simulasi Login & Akses Dashboard Terproteksi ───
//   const testEmail = __ENV.GS_TEST_EMAIL;
//   const testPassword = __ENV.GS_TEST_PASSWORD;

//   if (testEmail && testPassword) {
//     const loginPayload = JSON.stringify({
//       email: testEmail,
//       password: testPassword,
//     });

//     const headers = getApiHeaders();

//     // Kirim request login ke backend API
//     const resAuth = http.post(`${API_URL}/auth/login`, loginPayload, headers);
//     logRequest("Login API", resAuth);

//     const isLoggedIn = check(resAuth, {
//       "login API status is 200/201": (r) =>
//         r.status === 200 || r.status === 201,
//       "login API response has tokens": (r) => {
//         try {
//           const body = r.json();
//           return body && body.tokens && body.tokens.accessToken;
//         } catch (_) {
//           return false;
//         }
//       },
//     });

//     if (isLoggedIn) {
//       const tokens = resAuth.json().tokens;
//       const accessToken = tokens.accessToken;
//       const role = resAuth.json().user.role; // e.g. STUDENT, TEACHER, ADMIN

//       const authHeaders = getApiHeaders({
//         Authorization: `Bearer ${accessToken}`,
//       });

//       // 1. Hit profile endpoint (/auth/me)
//       const resMe = http.get(`${API_URL}/auth/me`, authHeaders);
//       logRequest("Profile API", resMe);
//       check(resMe, {
//         "me profile status is 200": (r) => r.status === 200,
//       });
//       sleep(1);

//       // 2. Hit halaman dashboard terproteksi berdasarkan role
//       let dashboardUrl = `${BASE_URL}/student/dashboard`;
//       if (role === "TEACHER") dashboardUrl = `${BASE_URL}/teacher/dashboard`;
//       else if (role === "ADMIN") dashboardUrl = `${BASE_URL}/admin/dashboard`;
//       else if (role === "PARENT") dashboardUrl = `${BASE_URL}/parent/dashboard`;

//       // Halaman terproteksi diakses via browser klien, tidak butuh internal API key,
//       // tetapi butuh JWT token/cookies jika dirender sebagai server-side component.
//       const resDashboard = http.get(dashboardUrl, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       logRequest("Dashboard Page", resDashboard);
//       check(resDashboard, {
//         "dashboard page status is 200": (r) => r.status === 200,
//       });

//       // 3. Skenario tambahan untuk fetch data dashboard jika login sebagai STUDENT
//       if (role === "STUDENT") {
//         sleep(0.5); // Jeda sebelum memanggil API dashboard siswa

//         // GET /course-enrollments/my?limit=50 (Daftar kelas yang diikuti)
//         const resEnrollments = http.get(`${API_URL}/course-enrollments/my?limit=50`, authHeaders);
//         logRequest("Student Enrollments API", resEnrollments);
//         check(resEnrollments, {
//           "enrollments list status is 200": (r) => r.status === 200,
//         });

//         // GET /courses/school?limit=50 (Daftar kelas yang tersedia di sekolah)
//         const resSchoolCourses = http.get(`${API_URL}/courses/school?limit=50`, authHeaders);
//         logRequest("Student School Courses API", resSchoolCourses);
//         check(resSchoolCourses, {
//           "school courses list status is 200": (r) => r.status === 200,
//         });
//       }
//     }
//     sleep(3);
//   }
// }

// ============================================= dashboard api ==============================

// import http from "k6/http";
// import { check } from "k6";

// const API_URL = __ENV.API_URL;
// const TOKEN = __ENV.TOKEN;
// const INTERNAL_API_KEY = __ENV.INTERNAL_API_KEY;

// export const options = {
//   scenarios: {
//     dashboard_load: {
//       executor: "constant-arrival-rate",

//       rate: Number(__ENV.RATE || 100),

//       timeUnit: "1s",

//       duration: "5m",

//       preAllocatedVUs: 200,

//       maxVUs: 2000,
//     },
//   },

//   thresholds: {
//     http_req_failed: ["rate<0.01"],
//     http_req_duration: ["p(95)<2000"],
//   },
// };

// const params = {
//   headers: {
//     Authorization: `Bearer ${TOKEN}`,
//     "x-internal-api-key": INTERNAL_API_KEY,
//     "Content-Type": "application/json",
//   },
// };

// export default function () {
//   const responses = http.batch([
//     ["GET", `${API_URL}/course-enrollments/my?limit=50`, null, params],
//     ["GET", `${API_URL}/courses/school?limit=50`, null, params],
//   ]);

//   responses.forEach((res) => {
//     check(res, {
//       "status 200": (r) => r.status === 200,
//     });
//   });
// }

// ============================================ Frontend =============================

import http from "k6/http";
import { check } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://getsmart.id";

export const options = {
  scenarios: {
    frontend_load: {
      executor: "constant-arrival-rate",

      rate: Number(__ENV.RATE || 100),

      timeUnit: "1s",

      duration: __ENV.DURATION || "5m",

      preAllocatedVUs: 200,

      maxVUs: 3000,
    },
  },

  thresholds: {
    http_req_failed: ["rate<0.01"],

    http_req_duration: ["p(95)<2000", "p(99)<5000"],
  },
};

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/`],
    ["GET", `${BASE_URL}/about-us`],
    ["GET", `${BASE_URL}/business-and-operations`],
    ["GET", `${BASE_URL}/investor-relations`],
  ]);

  responses.forEach((res) => {
    check(res, {
      "status is 200": (r) => r.status === 200,
    });
  });
}
