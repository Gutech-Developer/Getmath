# Rencana Integrasi Modul TKA — Getmath Frontend

> **Status:** Phase 1–5 selesai (manajemen, siswa, exam+CV, analytics+drill-down, export disabled). Verifikasi E2E staging dilakukan user.
>
> **Sumber acuan:**
> - `Getmath/TKA_FRONTEND_GUIDE.md` (2.105 baris, sudah dibaca lengkap)
> - Backend Go branch `origin/staging`: `internal/routes/tka_router.go`, `internal/dto/tka*.go`, `internal/services/tka_*.go`
> - Bruno collection `api_docs_bruno_getsmart/collections/GetSmart/TKA/` (18 endpoint)
> - Frontend `Getmath` branch `rafli/dev` (Next.js 16 App Router, React 19, TanStack Query v5, Tailwind v4)
>
> **Baseline verifikasi repo saat ini:**
> - `pnpm exec tsc --noEmit` → lulus.
> - `pnpm test` → 66 lulus, 3 gagal di `src/test/emotion/feedback.test.ts` (pre-existing, tidak terkait TKA).
> - Working tree masih memiliki WIP mock TKA yang belum di-commit: 3 halaman mock, 2 template mock, 1 organism mock, perubahan sidebar/topbar, dan `src/test/tka-navigation.test.ts`.

---

## 0. Ringkasan Eksekutif

Backend TKA sudah siap. Frontend baru memiliki tampilan mock. Integrasi penuh akan dipecah menjadi **5 fase implementasi**:

| Fase | Fokus | Hasil yang bisa diuji |
|---|---|---|
| **1** | Fondasi API, tipe, hook, helper, navigasi | 18 hook TKA siap; tsc/test helper lulus |
| **2** | Manajemen TKA Guru/Admin | List, create, edit, bank soal, assign, duplicate, delete |
| **3** | Alur masuk siswa & halaman hasil | List siswa, device guard, consent, start/resume, result |
| **4** | Exam engine & CV emotion | Ujian penuh: timer, autosave, submit, emotion bucket |
| **5** | Analytics, hardening, handoff QA | Dashboard 9-poin, drill-down, siap uji user |

Fase 4 adalah fase terbesar. Jika dibutuhkan, fase ini boleh dipecah internal menjadi 4A (timer/answer/submit) dan 4B (CV/polish) tanpa mengubah jumlah fase utama.

---

## 1. Hasil Pemeriksaan Ulang (Verified Facts)

Pemeriksaan ulang dilakukan terhadap backend `origin/staging`, Bruno collection, dan kode frontend. Temuan yang **sudah terverifikasi**:

| # | Area | Fakta |
|---|---|---|
| 1 | Base URL | `GETSMART_API_URL=https://apistaging.getsmart.id/api`; path TKA adalah `/tka/...` |
| 2 | Route | 18 endpoint terdaftar di `internal/routes/tka_router.go`; student endpoints memakai `Authenticate` + role STUDENT |
| 3 | Envelope | Sukses `{success,status,message,data}`; error `{success:false,status,message,errors:[{field,message}]}` |
| 4 | Error frontend | `GsFetchResult.errors` masih `Record<string,string[]>`; perlu union dengan array `{field,message}` |
| 5 | List manajemen | `GET /tka`: Teacher otomatis di-scope `teacher_id` miliknya; Admin bebas filter `schoolId/teacherId/status/search`; `counts` tidak terpengaruh filter status |
| 6 | Teacher lookup | `GET /users?role=teacher&schoolId=...` didukung backend; `profileId` = `teacher.id` (bukan user id) |
| 7 | Create | Teacher dilarang mengirim `schoolId`/`teacherId`; Admin wajib `schoolId`; `teacherId` opsional dan wajib satu sekolah |
| 8 | Update | Full `questions` akan menghapus lalu membuat ulang seluruh soal; `startAt/endAt` tidak bisa dikosongkan via PATCH; `accessCode` kosong/omit mempertahankan kode lama |
| 9 | Attempt lock | Jika sudah ada attempt: perubahan soal, durasi, revert ke DRAFT, delete, dan pindah sekolah ditolak 409 |
| 10 | Status | `DRAFT -> AVAILABLE` butuh minimal 1 soal + jadwal valid; `DRAFT -> COMPLETED` ditolak; `COMPLETED` immutable |
| 11 | Start | `cameraConsent` wajib `true`; UA mobile/tablet (iphone/ipad/ipod/android/mobile/tablet/windows phone/blackberry/opera mini) ditolak 403 |
| 12 | Resume | `POST /start` mengembalikan 200 + `savedAnswers`; 409 jika sudah selesai / auto-finalized |
| 13 | Answers | Omit field = pertahankan; `[]` eksplisit = hapus; `isDoubtful` omit = pertahankan; PG maksimal 1 opsi; MCMA bebas; CTF memakai `statementAnswers` |
| 14 | Grace | Auto-save +5 detik; submit +15 detik; lazy finalize setelah +15 detik atau tes ditutup |
| 15 | Submit | Idempoten 200; answers hanya di-flush jika belum lewat submit grace dan tes masih AVAILABLE |
| 16 | Result | `GET /my-result` mengembalikan 400 jika masih IN_PROGRESS; auto-finalize jika sudah lewat grace / tes ditutup |
| 17 | Analytics | Default `limit=20`, clamp 1..100; bucket skor kontinu (`<=25`, `<=50`, `<=75`, `>75`); score 2 desimal |
| 18 | Emotion | `POST /emotion-bucket` 202; `mode` wajib enum; distribution 8 key; `503` saat writer penuh; frontend wajib skip all-zero |
| 19 | Query | `status` student: `AVAILABLE/IN_PROGRESS/COMPLETED`; analytics: `ALL/COMPLETED/IN_PROGRESS` |
| 20 | Pagination | Helper backend `ParsePagination` default page=1 limit=10; service list clamp limit maks 100; analytics default 20 |
| 21 | Frontend types | `src/types/tka.ts` belum ada; tidak ada namespace `gsTka` di query keys; tidak ada `useGsTka.ts` |
| 22 | Frontend mock | `TeacherManageTKAContent.tsx`, `StudentTKATemplate.tsx`, dan 3 halaman memakai mock/`confirm()`/toast coming soon |
| 23 | CV layer | `useEmotionDetector`, `EmotionSampler`, `EmotionAggregator`, `toEmotionInput` sudah ada; `flushAndReset()` mengembalikan `{result, imageBase64}`, bukan aggregate langsung |
| 24 | CV widget | `EmotionDetectionWidget` meng-unmount `<video>` saat ditutup; berisiko menghentikan sampling |
| 25 | CV support | `isEmotionSupported()` mensyaratkan Worker + OffscreenCanvas, padahal sampler TKA berjalan di main thread; bisa false-negative |
| 26 | Render teks | `MathText` memakai `dangerouslySetInnerHTML` untuk bagian non-matematika; **rawan stored XSS** jika questionText berisi HTML |
| 27 | Body size | Next Server Action memiliki batas body default; payload `questions` besar berpotensi melebihi batas. Perlu diukur sebelum memilih bulk vs per-soal |
| 28 | Routing | `(private)/layout.tsx` selalu merender sidebar/topbar; route exam butuh layout terpisah |

---

## 2. Prasyarat & Keputusan yang Sudah Dikonfirmasi

### 2.1. Keputusan produk/desain

| # | Keputusan | Implementasi |
|---|---|---|
| D1 | Exam memakai route khusus; sebelum ujian ada **boarding** seperti remedial/diagnostik | Route group `(exam)`; alur `camera/akses -> briefing -> exam` |
| D2 | `questionText` memakai **rich text** | Reuse `MathEditor` (tiptap) + renderer aman; dukung opsi/pernyataan rich text |
| D3 | Bank soal disimpan **bulk** | Form create/edit mengirim `questions` sekaligus; hook per-soal tetap tersedia |
| D4 | Timezone jadwal memakai **timezone browser** | `datetime-local` -> ISO lokal; tampilkan via `Intl` di zona browser |
| D5 | Tidak boleh ada mock lagi | Semua halaman TKA memakai API; mock/WIP lama diganti |
| D6 | Export Excel/CSV | Tombol disabled + tooltip "Segera hadir" (endpoint belum ada) |
| D7 | i18n | Hardcoded Bahasa Indonesia seperti mayoritas UI existing |
| D8 | Kamera gagal di tengah ujian | Lanjut ujian; blokir hanya jika izin kamera gagal saat boarding/start |
| D9 | iPadOS UA desktop | Client width hint + backend 403 defense-in-depth |

### 2.1.1. Detail boarding TKA (mengikuti pola remedial/diagnostik)

Pola existing (`ClassDiagnosisContentPageTemplate`): `flowStep = "camera" -> "briefing" -> "quiz"`. TKA akan mengikuti pola yang sama:

1. **Step 1 — Kode Akses & Izin Kamera**
   - Input kode akses (uppercase di UI).
   - Checkbox consent kamera (wajib).
   - Daftar `CAMERA_REQUIREMENTS`.
   - Tombol "Buka Kamera & Lanjutkan" melakukan probe `getUserMedia` lalu langsung menghentikan track.
   - Jika ditolak: tampilkan error inline; tetap di step ini.
   - Jika `IN_PROGRESS`: tampilkan informasi resume.
2. **Step 2 — Briefing TKA**
   - Kartu ringkasan: jumlah soal, durasi, bobot per soal, skor maksimal 100.
   - Daftar aturan TKA: satu attempt, desktop/laptop, kamera wajib, auto-save, waktu, tanpa kunci jawaban.
   - Tombol "Mulai Ujian" / "Lanjutkan Ujian" memanggil `POST /start` dengan `accessCode`, `cameraConsent: true`, `deviceInfo`.
   - Jika 403 kode salah: kembali ke Step 1 dengan error inline.
   - Jika 403 mobile: layar blokir device.
   - Jika 409: hentikan kamera dan redirect ke halaman hasil.
3. **Step 3 — Exam aktif**
   - Baru setelah `POST /start` sukses, exam shell dirender dan `emotion.start()` dipanggil.
   - Video panel selalu ter-mount; probe stream Step 1 sudah dilepas.

Boarding TKA **tidak** memakai modal terpisah; boarding adalah bagian dari halaman `/student/tka/[id]/exam` agar sesuai pola remedial/diagnostik dan tetap full-screen.

### 2.2. Akses dan environment

- [x] Backend staging berisi commit TKA `origin/staging`; kontrak sudah diverifikasi dari source. E2E staging **bukan tanggung jawab implementasi**; user akan menguji.
- [x] Tidak perlu menyiapkan akun/token uji di repo; jika perlu probe kontrak, ambil token langsung dari API staging.
- [x] Izin mengganti/menghapus WIP mock TKA yang belum di-commit (target akhir tanpa mock).
- [x] Branch kerja frontend: `rafli/dev`.

### 2.3. Data uji (disiapkan user untuk E2E; bukan blocker implementasi)

- [ ] TKA `DRAFT` dengan 3 tipe soal.
- [ ] TKA `AVAILABLE` dalam admission window.
- [ ] TKA `AVAILABLE` yang sudah lewat `endAt`.
- [ ] TKA `COMPLETED` dengan attempt selesai.
- [ ] Attempt `IN_PROGRESS` dengan sebagian jawaban dan `savedAnswers`.
- [ ] TKA lintas sekolah untuk uji 403/assign/duplicate.
- [ ] Emotion bucket dengan window normal, `sampleCount=0`, dan distribusi valid.

### 2.4. Aset desain/legal

- [x] Mockup/arahan visual tersedia (mengikuti pola remedial/diagnostik + mockup 8.2.5/8.3.8–8.3.9).
- [x] Copy consent kamera disetujui.
- [ ] Copy peringatan device guard dan batas waktu.

### 2.5. Prasyarat teknis (sudah tersedia / perlu dicek)

- [x] `node_modules` dan `pnpm` tersedia.
- [x] Model face-api ada di `public/models`.
- [x] Komponen UI dasar (`Modal`, `Table`, `FilterTabs`, `DonutChart`, recharts) tersedia.
- [x] `MathEditor` tiptap, `MathText`, dan `useGsUploadFile` tersedia untuk rich text/gambar.
- [ ] Ukur ukuran payload pertanyaan rich text; bulk tetap dipakai, tetapi perlu guard batas body Server Action.
- [ ] Validasi apakah `navigator.userAgent` dari client dapat diteruskan sebagai header pada Server Action (rencana: `gsTkaRequest`).
- [ ] Pastikan renderer rich text TKA aman dari XSS (escape/allowlist; jangan render HTML mentah).

---

## 3. Blocker Teknis & Keputusan Implementasi

### B1. User-Agent untuk Device Guard

`coreFetch` (`src/libs/api/getsmart.ts:365`) tidak meneruskan UA browser. Backend membaca `c.Get("User-Agent")` pada start/save/submit.

**Rencana:** tambah `gsTkaRequest` di `src/libs/api/gsAction.ts` yang menyisipkan `navigator.userAgent` ke `headers`; `coreFetch` sudah meneruskan `extraHeaders`. Client tetap mendeteksi device untuk UX, tetap handle 403 server sebagai defense-in-depth.

### B2. Format Error Backend

Backend mengirim `errors: [{field,message}]`; frontend memakai `Record<string,string[]>`.

**Rencana:** buat union `GsApiErrors`, tambah `GsApiFieldError`, helper `getFieldErrors()`, dan tampilkan error per field pada form TKA. Jangan mengandalkan toast generik saja.

### B3. Layout Exam Full-Screen

`(private)/layout.tsx` selalu merender `MainLayout` (Topbar + Sidebar + ContentLayout).

**Rencana:** buat route group `(exam)` dengan layout guard token + role STUDENT sendiri, tanpa sidebar/topbar. URL `/student/tka/[id]/exam` dan `/result`; halaman daftar tetap di `/student/dashboard/tka`.

### B4. Lifecycle Video CV

`useEmotionDetector.start()` membutuhkan `<video>` yang ter-mount; `EmotionDetectionWidget` meng-unmount video saat ditutup.

**Rencana:** buat panel kamera TKA yang selalu me-mount video; tombol sembunyikan hanya menyembunyikan container, bukan video. Jangan mengubah perilaku widget remedial tanpa perlu.

### B5. Signature `flushAndReset`

Guide memakai `const agg = emotion.flushAndReset()`, sedangkan kode existing mengembalikan `{result, imageBase64}`.

**Rencana:** gunakan `const { result } = emotion.flushAndReset()`; kirim `toEmotionInput(result)`.

### B6. Rich Text & Stored XSS

`MathText` memakai `dangerouslySetInnerHTML` untuk bagian non-matematika. Jika guru dapat menyimpan HTML mentah, siswa berisiko terkena stored XSS. TKA **wajib rich text**, jadi risiko ini harus diselesaikan, bukan dihindari.

**Rencana:**
- Reuse `MathEditor` (tiptap) untuk input `questionText`, `optionText`, dan `statementText`.
- Reuse `MathEditor` (input) dan `MathText` (output) yang sudah ada; jangan membuat komponen renderer baru.
- Pindahkan konversi tiptap HTML -> LaTeX/HTML tersimpan ke `src/libs/utils.ts` (sudah ada) agar tidak menduplikasi fungsi di form remedial/diagnostik.
- Simpan format yang sama dengan remedial: HTML tiptap + `$...$`/`$$...$$`.
- Jika `MathText` perlu hardening XSS, lakukan sebagai perbaikan komponen existing, bukan komponen TKA baru.

### B7. Deteksi Dukungan CV

`isEmotionSupported()` mensyaratkan Worker/OffscreenCanvas padahal sampler berjalan di main thread.

**Rencana:** tambah pengecekan yang sesuai (mediaDevices, video, WebGL/face-api) untuk TKA; jangan salah menampilkan "browser tidak mendukung" pada browser yang sebenarnya mampu.

### B8. Batas Payload Server Action

Bank soal disimpan **bulk**. Rich text + gambar dapat memperbesar payload `questions` dan berpotensi melebihi batas body Server Action Next.js.

**Rencana:**
- Tetap bulk untuk form create/edit.
- Batasi panjang teks/HTML per field di UI dan hitung total payload sebelum submit.
- Jika payload melebihi batas, tampilkan error yang jelas; fallback ke endpoint per-soal hanya jika disetujui.
- Jangan menambah dependency atau mengubah konfigurasi body limit tanpa persetujuan.

### B9. Perbedaan Guide vs Codebase

| Hal | Guide | Existing | Keputusan |
|---|---|---|---|
| Delete helper | `gsDelete` | `gsDel` | Pakai `gsDel` |
| Query keys | `queryKeys.tka` | namespace `gs*` | Pakai `gsTka` |
| Route | `/admin/tka` | `/admin/dashboard/manage-tka` | Pertahankan existing |
| Tipe emosi | Duplikat di `tka.ts` | Sudah ada di `libs/emotion/types` | Import/re-export |
| Error | `ApiFieldError[]` | `Record<string,string[]>` | Union + helper |
| Export | Belum tersedia | Belum ada | Disabled |

---

## 4. Peta File Target

### 4.1. Data layer

```
src/types/tka.ts                                   (baru)
src/types/index.ts                                 (mod: export tka)
src/libs/api/queryKeys.ts                          (mod: gsTka)
src/libs/api/getsmart.types.ts                     (mod: GsApiErrors)
src/libs/api/gsAction.ts                           (mod: gsTkaRequest)
src/services/hooks/useGsTka.ts                     (baru: 18 hook)
src/services/hooks/useUser.ts                      (mod: schoolId)
src/services/hooks/helper.ts                       (mod: query builder)
src/services/index.ts                              (mod: export hook)
src/utils/tka.ts                                   (baru: timer, bucket, validasi, device)
```

### 4.2. UI & template

```
src/components/molecules/tka/TkaStatusBadge.tsx
src/components/molecules/tka/TkaTestCard.tsx
src/components/molecules/tka/TkaExamBoarding.tsx       (Step 1 akses/kamera + Step 2 briefing)
src/components/molecules/tka/TkaSubmitConfirmModal.tsx
src/components/molecules/tka/TkaExamCameraPanel.tsx
src/components/molecules/tka/TkaScoreDistributionChart.tsx
src/components/molecules/tka/TkaEmotionSummary.tsx
src/components/organisms/tka/TkaManagePage.tsx
src/components/organisms/tka/TkaFormPage.tsx
src/components/organisms/tka/TkaQuestionBuilder.tsx
src/components/organisms/tka/TkaStudentExamPage.tsx
src/components/organisms/tka/TkaStudentResultPage.tsx
src/components/organisms/tka/TkaAnalyticsPage.tsx
src/components/organisms/tka/TkaAttemptDetailPage.tsx
```

Komponen existing yang dipakai ulang: `Modal`, `AlertBanner`, `FilterTabs`, `Table`, `TablePagination`, `DonutChart`, `LADBarChart`, `MathEditor` (tiptap, rich text), `SearchableInput`, `Badge`, `Checkbox`, `CameraRequiredScreen`, `CAMERA_REQUIREMENTS`/`DIAGNOSTIC_RULES` sebagai referensi copy boarding.

### 4.3. Halaman

```
src/app/(pages)/(private)/admin/dashboard/manage-tka/create/page.tsx
src/app/(pages)/(private)/admin/dashboard/manage-tka/[id]/edit/page.tsx
src/app/(pages)/(private)/admin/dashboard/manage-tka/[id]/analytics/page.tsx
src/app/(pages)/(private)/admin/dashboard/manage-tka/[id]/analytics/[attemptId]/page.tsx
src/app/(pages)/(private)/teacher/dashboard/manage-tka/create/page.tsx
src/app/(pages)/(private)/teacher/dashboard/manage-tka/[id]/edit/page.tsx
src/app/(pages)/(private)/teacher/dashboard/manage-tka/[id]/analytics/page.tsx
src/app/(pages)/(private)/teacher/dashboard/manage-tka/[id]/analytics/[attemptId]/page.tsx
src/app/(pages)/(exam)/layout.tsx
src/app/(pages)/(exam)/student/tka/[id]/exam/page.tsx
src/app/(pages)/(exam)/student/tka/[id]/result/page.tsx
```

Template thin wrapper mengikuti pola existing (`page.tsx` hanya menerima `params` Promise dan merender template/organism).

### 4.4. Navigasi & test

```
src/constant/topbarTitle.ts          (mod: title nested TKA)
src/constant/dashboardSidebarRoutes.ts (menu sudah ada; tidak perlu ubah menu)
src/test/tka-navigation.test.ts      (mod: nested route)
src/test/tka-logic.test.ts           (baru: timer, bucket, validasi, device)
```

---

## 5. Rencana 5 Fase Implementasi

### Fase 1 — Fondasi API, Tipe, Hook, dan Navigasi (2–3 hari)

**Tugas:**
- Buat `src/types/tka.ts`; reuse `GsPaginationMeta` dari `types/gs-course.ts` dan tipe emosi dari `libs/emotion/types.ts`.
- Tambah `queryKeys.gsTka` (all/lists/list/details/detail/analyticsRoot/analytics/attemptDetail/studentList/studentResult).
- Buat 18 hook di `useGsTka.ts` dengan invalidasi cache yang benar.
- Tambah `gsTkaRequest` untuk UA forwarding.
- Ubah `GsApiErrors` menjadi union dan tambah helper field error.
- Extend `buildQuery`/`useSearchUser` untuk `schoolId`, `status`, `teacherId`.
- Buat `src/utils/tka.ts`: `getScoreBucketLabel`, `computeServerOffsetMs`, `isMobileOrTabletUserAgent`, `shouldSendEmotionBucket`, `validateTkaQuestionDraft`, `validateTkaPublishGate`, `toIsoOrUndefined`.
- Reuse `MathEditor` dan `MathText`; pindahkan konversi tiptap ke `src/libs/utils.ts`.
- Tambah pengecekan dukungan CV yang sesuai dan helper route constants/nav title.
- Export hook di `src/services/index.ts`.
- Tambah unit test helper + perluas navigation test.

**Acceptance:**
- `pnpm exec tsc --noEmit` lulus.
- Test helper lulus.
- 18 hook dapat diimpor; belum ada UI TKA.
- Error field helper teruji.
- UA wrapper terverifikasi minimal lewat log/stub test.
- Konversi rich text konsisten dengan form remedial/diagnostik; tidak ada komponen renderer duplikat.

**Dependensi:** keputusan §2.1 (sudah dikonfirmasi).

---

### Fase 2 — Manajemen TKA Guru/Admin (3–4 hari)

**Tugas:**
- Refactor `TeacherManageTKAContent` menjadi `TkaManagePage` berbasis API.
- Tab status dengan `counts`; search debounce; filter Admin sekolah/guru; pagination.
- Kartu/list: judul, guru/sekolah, tahun ajaran, jadwal, jumlah soal, durasi, status, access code + copy.
- Aksi: edit, analytics, delete (modal; 409 → info tutup tes), duplicate (Admin).
- Buat `TkaFormPage` + `TkaQuestionBuilder`:
  - Metadata: title, description, schoolYear, durationMinutes, status, accessCode, startAt/endAt.
  - Admin: sekolah wajib + guru opsional; Teacher: field disembunyikan.
  - MULTIPLE_CHOICE: >=2 opsi, tepat 1 kunci.
  - MCMA: >=2 opsi, >=1 kunci.
  - COMPLEX_TRUE_FALSE: >=1 statement, isTrue eksplisit.
  - Rich text `MathEditor` untuk questionText/optionText/statementText; dukung upload gambar.
  - Tambah/hapus soal; nomor otomatis; preview label A/B/C.
  - Publish gate client-side; bobot `100/totalQuestions`.
  - Konversi `datetime-local` ke ISO timezone browser (bukan fixed Asia/Jakarta).
  - Guard ukuran payload bulk sebelum submit.
- Hydration edit dari `GET /tka/:id`; hanya kirim field berubah; `questions` dikirim bulk jika bank soal berubah.
- Attempt lock: fetch `analytics.overview.joinedCount` (limit=1) atau deteksi 409; disable soal/durasi/revert; completed read-only.
- Modal Assign (Admin): sekolah/guru; "Tanpa Guru" → `teacherId: null`; 409 → shortcut Duplicate.
- Modal Duplicate (Admin): 1–50 target; tampilkan accessCode baru.
- Pastikan status transition UI tidak menawarkan DRAFT→COMPLETED.

**Acceptance:**
- Teacher create/edit/delete tanpa `schoolId/teacherId` sukses.
- Admin create wajib sekolah; guru harus satu sekolah.
- 3 tipe soal tersimpan/terbaca; rich text + LaTeX tampil benar di preview.
- Publish gate mencegah 0 soal/jadwal invalid.
- Edit dengan attempt menampilkan banner lock; assign/duplicate berfungsi; 409 ditangani.
- Delete 409 menampilkan informasi, bukan crash.
- Halaman list/form tidak memakai mock.

**Dependensi:** Fase 1; D2/D3/D4/D5.

---

### Fase 3 — Boarding Siswa & Halaman Hasil (2–3 hari)

**Tugas:**
- Ganti `StudentTKATemplate` dengan list API: search, filter `AVAILABLE/IN_PROGRESS/COMPLETED`, pagination.
- Kartu TKA siswa: judul, guru, sekolah, tahun ajaran, soal, durasi, status, skor/sisa waktu.
- CTA matrix:
  - COMPLETED → Lihat Hasil.
  - IN_PROGRESS → Lanjutkan.
  - Tanpa attempt + AVAILABLE:
    - sebelum `startAt` → "Belum Dimulai";
    - setelah `endAt` → "Waktu Masuk Berakhir";
    - dalam window → "Mulai TKA".
  - Tanpa attempt + COMPLETED → "Tes Ditutup".
- Device guard client (`navigator.userAgent` + lebar layar) dan layar blokir.
- Buat `TkaExamBoarding` (bagian dari route exam) dengan dua step:
  - **Step 1:** kode akses, checkbox consent, daftar camera requirements, tombol "Buka Kamera & Lanjutkan"; probe `getUserMedia` lalu stop track.
  - **Step 2:** briefing TKA (jumlah soal, durasi, bobot, skor maksimal 100, aturan), tombol "Mulai Ujian"/"Lanjutkan Ujian".
- Start sequence: probe kamera → `POST /start` (UA + `cameraConsent: true` + `deviceInfo`) → hydrate session; stop kamera jika gagal.
- Handle 403 mobile/kode/sekolah, 404, 409 (redirect result); 403 kode salah kembali ke Step 1 dengan error inline.
- Buat halaman result `/student/tka/[id]/result`:
  - skor, benar/salah/kosong, `unansweredQuestionNumbers`, waktu, `submissionType`, status emosi;
  - render rich text pertanyaan bila ditampilkan; tanpa kunci jawaban;
  - 400 → redirect exam; 403/404 → state sesuai.

**Acceptance:**
- Siswa hanya melihat TKA sekolahnya; tidak ada accessCode/isCorrect/isTrue.
- Mobile diblokir di UI; backend 403 diteruskan.
- Boarding Step 1/2 tampil seperti remedial/diagnostik; consent wajib; kamera probe berhasil/gagal ditangani.
- Start 201 / resume 200 dengan savedAnswers ter-hydrate.
- Result tampil benar; 0 skor tidak dianggap kosong (`!== undefined`).
- Semua error start/result punya UX jelas.
- Tidak ada mock.

**Dependensi:** Fase 1; D1 boarding/route; D8; copy consent.

---

### Fase 4 — Exam Engine & CV Emotion (4–5 hari)

**Tugas:**
- Buat route group `(exam)` + guard role STUDENT; boarding Phase 3 menjadi gerbang sebelum exam shell.
- Setelah boarding sukses, render exam shell + video panel, lalu panggil `emotion.start()`.
- State ujian: session, answersMap, doubtfulMap, dirty/touched set, saving state, submittingRef, remainingSeconds, serverOffsetMs.
- Timer:
  - offset = `effectiveDeadlineAt - remainingSeconds*1000 - Date.now()`;
  - tick dari deadline absolut;
  - kalibrasi ulang jika selisih > 3 detik.
- Render soal rich text dengan `MathText` existing; radio PG, checkbox MCMA, Benar/Salah CTF.
- Grid navigasi: belum dijawab / dijawab / ragu-ragu.
- Toggle ragu-ragu hanya kirim `{questionId,isDoubtful}`.
- Auto-save debounce 400–600 ms; antrean/in-flight per soal; abaikan respons lama; indikator menyimpan/tersimpan.
- Error auto-save: 410 → submit auto dengan jawaban lokal; 409 → result; 403 mobile/sekolah → sesuai; jangan hapus state.
- Submit manual: modal konfirmasi (dijawab/ragu/belum).
- Auto-submit saat timer 0: guard sekali; flush bucket → stop kamera → kumpulkan semua jawaban touched → POST submit → prime result cache → redirect.
- `beforeunload` selama exam aktif.
- CV:
  - reuse `useEmotionDetector` + `toEmotionInput`;
  - interval 30–60 detik saat `ready && active`;
  - skip `sampleCount<=0` atau distribution all-zero;
  - retry 0, tanpa toast, 503 silent;
  - 403/404/409/410 hentikan timer CV;
  - flush final sebelum submit;
  - kegagalan kamera setelah exam aktif tidak memblokir ujian.
- Panel kamera persisten (video tidak unmount).

**Acceptance (wajib diuji):**
- Masuk di `endAt - 2 menit` tetap dapat durasi penuh; resume setelah `endAt` selama belum lewat deadline personal tetap 200.
- Timer tidak mundur setelah tab kembali aktif.
- Rich text/LaTeX/gambar tampil aman; tidak ada script yang dieksekusi.
- Toggle ragu-ragu tidak menghapus jawaban; `[]` menghapus jawaban.
- `PUT /answers` 410 → tidak ada jawaban lokal yang hilang.
- Auto-submit tepat sekali; manual + auto tidak dobel.
- Bucket emosi tidak all-zero; 503 tidak memunculkan toast.
- Kamera dicabut di tengah ujian tidak menghentikan autosave/submit.
- Mobile UA tidak bisa masuk.

**Dependensi:** Fase 1 & 3; boarding sudah selesai; renderer rich text selesai.

---

### Fase 5 — Analytics, Hardening, QA (3–4 hari)

**Tugas:**
- `TkaAnalyticsPage`:
  - KPI overview (joined/schoolTotalStudents, completed, inProgress, completionRate, averageScore, averageAnsweredCount).
  - Bar chart 4 bucket skor (gunakan label/count/percentage backend).
  - Akurasi per tipe soal.
  - Tabel per butir soal (render rich text ringkas via `MathText`).
  - Donut/bar distribusi emosi + dominant + participants + samples.
  - Tabel siswa: search nama/NIS, filter ALL/COMPLETED/IN_PROGRESS, pagination default 20.
  - IN_PROGRESS: skor "-", progress `answeredCount/totalQuestions`.
- `TkaAttemptDetailPage`: profil, emotionSummary, daftar soal rich text + jawaban vs kunci, `isDoubtful`, points.
- Export disabled + tooltip.
- Chart filter jika disetujui: gunakan `getScoreBucketLabel` kontinu, bukan min/max.
- Polish navigasi/topbar, responsive, accessibility, empty/loading/error state.
- Unit test + manual checklist + handoff QA untuk user; perbaiki regresi TKA.

**Acceptance:**
- 9 poin analytics ter-render dari satu response.
- Skor 25.58/50.82/75.56 masuk bucket benar.
- Drill-down konsisten dengan header.
- Tidak ada mock tersisa; `tsc` lulus; test TKA lulus; checklist QA lulus.
- Tidak ada regresi baru di luar 3 test `emotion/feedback` yang sudah gagal.

**Dependensi:** Fase 1–4; handoff QA untuk user.

---

## 6. Kontrak 18 Endpoint → UI

| # | Endpoint | Hook | Dipakai |
|---|---|---|---|
| 1 | `POST /tka` | `useCreateTka` | Form create |
| 2 | `GET /tka` | `useTkaList` | List Guru/Admin |
| 3 | `GET /tka/:id` | `useTkaDetail` | Form edit, analytics fallback |
| 4 | `PATCH /tka/:id` | `useUpdateTka` | Form edit |
| 5 | `DELETE /tka/:id` | `useDeleteTka` | Hapus list |
| 6 | `POST /tka/:id/questions` | `useAddTkaQuestion` | Hook tersedia; form memakai bulk |
| 7 | `PUT /tka/:id/questions/:questionId` | `useUpdateTkaQuestion` | Hook tersedia; form memakai bulk |
| 8 | `DELETE /tka/:id/questions/:questionId` | `useDeleteTkaQuestion` | Hook tersedia; form memakai bulk |
| 9 | `POST /tka/:id/assign` | `useAssignTka` | Modal Assign Admin |
| 10 | `POST /tka/:id/duplicate` | `useDuplicateTka` | Modal Duplicate Admin |
| 11 | `GET /tka/student` | `useStudentTkaList` | List siswa |
| 12 | `POST /tka/:id/start` | `useStartOrResumeTka` | Boarding Step 1/2 |
| 13 | `PUT /tka/:id/attempts/:attemptId/answers` | `useSaveTkaAnswer` | Autosave exam |
| 14 | `POST /tka/:id/attempts/:attemptId/submit` | `useSubmitTkaAttempt` | Submit manual/auto |
| 15 | `POST /tka/:id/attempts/:attemptId/emotion-bucket` | `useSubmitTkaEmotionBucket` | Interval CV |
| 16 | `GET /tka/:id/my-result` | `useStudentTkaResult` | Halaman hasil |
| 17 | `GET /tka/:id/analytics` | `useTkaAnalytics` | Dashboard 9 poin |
| 18 | `GET /tka/:id/analytics/attempts/:attemptId` | `useTkaAttemptDetail` | Drill-down |

Query key yang direkomendasikan:

```ts
gsTka: {
  all: ["gs", "tka"] as const,
  lists: () => [...queryKeys.gsTka.all, "list"] as const,
  list: (params?: ListTKATestsQuery) =>
    [...queryKeys.gsTka.lists(), params ?? {}] as const,
  details: () => [...queryKeys.gsTka.all, "detail"] as const,
  detail: (testId: string) =>
    [...queryKeys.gsTka.details(), testId] as const,
  analyticsRoot: (testId: string) =>
    [...queryKeys.gsTka.all, "analytics", testId] as const,
  analytics: (testId: string, params?: TKAAnalyticsQuery) =>
    [...queryKeys.gsTka.analyticsRoot(testId), params ?? {}] as const,
  attemptDetail: (testId: string, attemptId: string) =>
    [...queryKeys.gsTka.analyticsRoot(testId), "attempt", attemptId] as const,
  studentLists: () => [...queryKeys.gsTka.all, "student", "list"] as const,
  studentList: (params?: ListStudentTKAsQuery) =>
    [...queryKeys.gsTka.studentLists(), params ?? {}] as const,
  studentResult: (testId: string) =>
    [...queryKeys.gsTka.all, "student", "result", testId] as const,
}
```

---

## 7. Aturan Bisnis Kunci yang Wajib Diimplementasikan

### 7.1. Timer & Grace

- `startAt`–`endAt` = admission window, bukan batas pengerjaan.
- `effectiveDeadlineAt = startedAt + durationMinutes`.
- Timer memakai `effectiveDeadlineAt`/`remainingSeconds` server.
- Resume diizinkan setelah `endAt` selama belum lewat `effectiveDeadlineAt + 15s`.
- Auto-save +5s; submit +15s; submit idempoten.
- Jadwal memakai timezone browser: `datetime-local` -> ISO dengan offset lokal; tampilkan kembali di zona browser. Tidak memakai fixed Asia/Jakarta.

### 7.2. Partial Save

- Omit `selectedOptionIds`/`statementAnswers` → pertahankan.
- Kirim `[]` eksplisit → hapus.
- Omit `isDoubtful` → pertahankan.
- PG maksimal 1 opsi; MCMA 0..N; CTF `statementAnswers`.
- Jangan cek nilai numerik dengan `if (score)`; gunakan `!== undefined`.

### 7.3. Status & Lock

- `DRAFT -> AVAILABLE`: minimal 1 soal + jadwal valid.
- `DRAFT -> COMPLETED`: dilarang.
- `COMPLETED`: immutable.
- Ada attempt: soal/durasi/revert/delete/pindah sekolah → 409.
- Masih boleh: title, description, schoolYear, accessCode, jadwal, tutup tes, reassign guru satu sekolah.
- Jadwal yang sudah diisi tidak bisa dikosongkan via PATCH; UI tidak menawarkan clear.
- Access code kosong/omit mempertahankan kode lama.

### 7.4. Scoring & Analytics

- `pointsPerQuestion = Math.round(10000/totalQuestions)/100`.
- `score = Math.round(correctCount*10000/totalQuestions)/100`.
- Bucket kontinu: `<=25`, `<=50`, `<=75`, `>75`.
- Jangan memakai `minScore/maxScore` untuk filter skor desimal.
- Analytics default 20, clamp 100; search nama/NIS; status ALL/COMPLETED/IN_PROGRESS.
- IN_PROGRESS: skor undefined; answered live; progress dijawab.

### 7.5. Boarding & Kamera

- Boarding TKA mengikuti pola remedial/diagnostik: Step 1 kode akses + consent + probe kamera, Step 2 briefing/aturan, lalu exam.
- `POST /start` baru dipanggil di Step 2; `emotion.start()` baru dipanggil setelah exam shell + video ter-mount.
- Probe kamera Step 1 hanya `getUserMedia` lalu stop track; jangan biarkan stream probe hidup.
- Kamera gagal saat boarding: tetap di Step 1, tampilkan error, izinkan retry.
- Kamera gagal setelah exam aktif: lanjutkan ujian, hentikan panel CV, jangan tampilkan blocking screen.

### 7.6. Emotion Bucket

- Reuse layer CV existing; jangan buat worker/loader baru.
- Hanya kirim aggregate; video tidak dikirim.
- Skip `sampleCount <= 0` atau semua distribution 0.
- Interval 30–60 detik + flush sebelum submit.
- Retry 0; 503 silent; tidak memblokir ujian.
- Fatal error kamera setelah start tidak memblokir ujian; error izin saat start menampilkan retry/`CameraRequiredScreen`.

### 7.7. Rich Text

- Input TKA wajib memakai `MathEditor` untuk questionText/optionText/statementText.
- Simpan hasil dalam format yang sama dengan remedial (HTML tiptap + `$...$`/`$$...$$`), agar konsisten dan bisa di-edit ulang.
- Render melalui `MathText` existing; gunakan konversi `tiptapHtmlToLatexHtml` sebelum disimpan.
- Dukung gambar via `useGsUploadFile`; batasi URL ke `/api/uploads/` atau host yang diizinkan.
- Teks kosong setelah konversi tetap ditolak; guard ukuran payload bulk.

---

## 8. Testing & QA

### Unit test (vitest)

- `getScoreBucketLabel`: 0, 25, 25.01, 25.58, 50, 50.82, 75, 75.56, 100.
- `computeServerOffsetMs`; format durasi memakai `formatDiagnosticTime` existing.
- `shouldSendEmotionBucket`: sampleCount 0, all-zero, positive, unknown=1.
- `isMobileOrTabletUserAgent`: iPhone/iPad/Android/tablet/mobile vs desktop.
- `validateTkaQuestionDraft`: 3 tipe, opsi <2, kunci 0/2, statement kosong, isTrue null.
- `validateTkaPublishGate`: 0 soal, jadwal tidak berpasangan, start>=end, valid.
- Payload builder partial save: omit vs `[]` vs isDoubtful-only.
- Rich text: konversi tiptap <-> LaTeX, sanitasi script/event handler, render gambar aman.
- Timezone: `datetime-local` -> ISO lokal dan render balik di zona browser.
- Navigasi: nested route active + title.

### Manual checklist

**Manajemen**
- Teacher create/edit/delete tanpa schoolId/teacherId.
- Admin filter sekolah/guru/status/search; counts akurat.
- 3 tipe soal + label opsi otomatis.
- Publish gate; DRAFT→COMPLETED tidak ditawarkan.
- Attempt lock; assign/unassign; duplicate.

**Siswa & CV**
- Mobile/tablet diblokir UI + server 403.
- Tidak ada accessCode/isCorrect/isTrue di payload siswa.
- Boarding Step 1 (kode/consent/kamera) + Step 2 (briefing/aturan); timer dari effectiveDeadlineAt.
- Rich text/LaTeX/gambar di soal, opsi, pernyataan tampil aman.
- Toggle ragu-ragu aman; `[]` menghapus.
- 410 memicu submit tanpa kehilangan jawaban.
- CV interval; skip all-zero; 503 silent.
- Result tanpa kunci jawaban.

**Analytics**
- 9 poin; default 20/halaman; search/filter.
- IN_PROGRESS skor "-" + progress.
- Bucket desimal benar.
- Drill-down konsisten.
- Export disabled.

### Commands

```bash
cd /home/whoami/getsmart/Getmath
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Catatan: 3 test `src/test/emotion/feedback.test.ts` sudah gagal sebelum TKA; bukan regresi TKA.

### Uji staging (diserahkan ke user)

Implementasi tidak melakukan E2E staging. Tim implementasi menyiapkan unit test, `tsc`, `build`, dan checklist manual; user melakukan verifikasi end-to-end di staging dengan akun/TKA miliknya. Bruno `collections/GetSmart/TKA/` tetap menjadi referensi kontrak.

---

## 9. Definition of Done

- [ ] 18 hook TKA selesai; tidak ada mock/data palsu.
- [ ] `User-Agent` diteruskan untuk start/save/submit; device guard client + server teruji.
- [ ] Error validasi backend tampil per field.
- [ ] Manajemen Admin/Teacher lengkap: list/create/edit/delete/assign/duplicate/analytics.
- [ ] Siswa lengkap: list/boarding/start/resume/exam/result.
- [ ] Rich text + LaTeX + gambar aman di builder, exam, result, dan analytics.
- [ ] Timer, grace, autosave, submit, CV sesuai §7.
- [ ] Analytics 9 poin + drill-down; bucket kontinu; export disabled.
- [ ] Sidebar/topbar active untuk semua route TKA.
- [ ] `tsc` lulus; test TKA lulus; checklist handoff QA disiapkan.
- [ ] Tidak ada dependency baru tanpa persetujuan.

---

## 10. Out of Scope

- Endpoint export Excel/CSV (belum ada di backend).
- Perubahan backend, migration, atau kontrak API.
- Dependency baru (chart/form/date/E2E) tanpa persetujuan.
- Perbaikan 3 test `emotion/feedback` yang sudah gagal.
- TKA di dalam halaman kelas (`/class/[slug]`) — TKA tetap standalone.
- Refactor remedial/diagnostic selain reuse komponen.
