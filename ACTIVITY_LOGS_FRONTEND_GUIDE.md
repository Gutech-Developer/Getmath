# 📖 Panduan Integrasi Frontend: Log Aktivitas Siswa & Ekspor Laporan (Excel/CSV)

Dokumen ini berisi panduan lengkap untuk tim **Frontend** dalam mengintegrasikan API **Log Aktivitas Siswa** (`GetActivityLogs`) dan API **Ekspor Laporan Log** (`ExportActivityLogs`).

---

## 📌 1. Ringkasan Perubahan Penting (Perubahan dari Versi Sebelumnya)

> [!IMPORTANT]
> **PERUBAHAN PENTING UNTUK TEAM FRONTEND:**
> 1. **`studentId` Sekarang bersifat OPSIONAL untuk Guru/Admin**:
>    - **Dahulu:** Frontend harus selalu mengirimkan `studentId` dalam query parameter.
>    - **Sekarang:** Jika `studentId` tidak dikirim (atau dikirim string kosong `""`), Backend akan secara otomatis menampilkan **log aktivitas seluruh murid di kelas tersebut**.
>    - Jika `studentId` diisi UUID spesifik, Backend akan menampilkan log milik murid itu saja.
>    - Untuk role **Student**, Backend otomatis menyaring log milik dirinya sendiri tanpa perlu mengirim `studentId`.
> 2. **Pengayaan Data Respon Log Aktivitas (`logs`)**:
>    - Respon log sekarang menyertakan bidang `studentId`, `studentName`, dan `nis` secara otomatis.
>    - Ini mempermudah Frontend menampilkan daftar aktivitas satu kelas karena sudah tahu nama dan NIS murid terkait di setiap baris log.
> 3. **Presisi Timestamp Sampai Detik/Milidetik**:
>    - Format timestamp `createdAt` kini presisi hingga detik/milidetik (`RFC3339` contoh: `2026-08-08T19:40:15Z`).
> 4. **API Baru: Ekspor File Excel (`.xlsx`) & CSV (`.csv`)**:
>    - Endpoint baru `GET /learning-analytics/courses/:courseId/activity-logs/export` untuk mendownload laporan aktivitas dalam format `.xlsx` atau `.csv`.

---

## 🚀 2. Integrasi Endpoint Log Aktivitas (`GetActivityLogs`)

### Endpoint
`GET /api/v1/learning-analytics/courses/:courseId/activity-logs`

### Headers
`Authorization: Bearer <accessToken>`

### Query Parameters
| Parameter | Tipe | Wajib? | Keterangan |
|---|---|---|---|
| `page` | `number` | Opsional | Halaman data (default: `1`) |
| `limit` | `number` | Opsional | Jumlah data per halaman (default: `10`) |
| `action` | `string` | Opsional | Filter berdasarkan jenis aksi (contoh: `LOGIN`, `FILE_READ`, `DIAGNOSTIC_SUBMITTED`, dll.) |
| `studentId` | `string` | Opsional | **Baru:** UUID Murid. Jika kosong `""` / diabaikan, Guru/Admin akan mendapatkan log **seluruh murid** di kelas. |

### Contoh Request (Axios / Fetch)
```typescript
// 1. Ambil Log Seluruh Kelas (Guru / Admin)
const fetchClassLogs = async (courseId: string, page = 1, limit = 10, action = '') => {
  const response = await api.get(`/learning-analytics/courses/${courseId}/activity-logs`, {
    params: { page, limit, action /* studentId diabaikan / kosong */ }
  });
  return response.data; // { success: true, data: { logs: [...], pagination: {...} } }
};

// 2. Ambil Log 1 Murid Spesifik
const fetchStudentLogs = async (courseId: string, studentId: string, page = 1, limit = 10) => {
  const response = await api.get(`/learning-analytics/courses/${courseId}/activity-logs`, {
    params: { studentId, page, limit }
  });
  return response.data;
};
```

### Struktur Respon JSON
```json
{
  "success": true,
  "message": "Log aktivitas berhasil didapatkan",
  "data": {
    "logs": [
      {
        "id": "a3b0eb10-2fd1-4aa0-a158-550fd2ac97fe",
        "studentId": "4907b52c-b2ef-4fdc-a072-80acaa8fb575",
        "studentName": "Ahmad Yani",
        "nis": "12345678",
        "action": "FILE_READ",
        "createdAt": "2026-08-08T19:40:15Z",
        "courseId": "a3158e9d-4926-4f12-baf1-927c114a7ddd",
        "courseName": "Matematika Kelas X",
        "courseModuleId": "b1158e9d-4926-4f12-baf1-927c114a7eee",
        "moduleName": "Bab 1: Aljabar dasar",
        "metadata": {
          "fileName": "Modul_Aljabar.pdf"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5
    }
  }
}
```

---

## 📊 3. Integrasi Endpoint Ekspor Laporan Log (`ExportActivityLogs`)

Endpoint ini digunakan ketika pengguna mengeklik tombol **"Export Excel"** atau **"Export CSV"** pada dashboard.

### Endpoint
`GET /api/v1/learning-analytics/courses/:courseId/activity-logs/export`

### Headers
`Authorization: Bearer <accessToken>`

### Query Parameters
| Parameter | Tipe | Wajib? | Keterangan |
|---|---|---|---|
| `studentId` | `string` | Opsional | Jika diisi: ekspor log 1 murid spesifik.<br>Jika kosong/omitted: ekspor log **seluruh murid** di kelas. |
| `format` | `string` | Opsional | Format file: `excel` (default, `.xlsx`) atau `csv` (`.csv`). |

---

### Cara Mengunduh File di Browser (Frontend Handling)

Karena respon API mengembalikan file biner (`Blob`), Frontend **harus** mengonfigurasi request dengan `responseType: 'blob'` agar file tidak rusak.

#### 1. Implementasi Helper Download (Axios)
```typescript
import api from '@/lib/api'; // instance Axios Anda

export interface ExportLogsParams {
  courseId: string;
  studentId?: string;
  format?: 'excel' | 'csv';
}

export const exportActivityLogs = async ({ courseId, studentId, format = 'excel' }: ExportLogsParams) => {
  try {
    const response = await api.get(
      `/learning-analytics/courses/${courseId}/activity-logs/export`,
      {
        params: {
          studentId: studentId || undefined,
          format,
        },
        responseType: 'blob', // SANGAT PENTING!
      }
    );

    // Ambil nama file dari header Content-Disposition (jika ada)
    let filename = `log_aktivitas_${format === 'csv' ? 'csv' : 'xlsx'}`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1]);
      }
    }

    // Trigger download di browser
    const blob = new Blob([response.data], {
      type: format === 'csv' 
        ? 'text/csv;charset=utf-8;' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Gagal mengunduh laporan log:', error);
    throw error;
  }
};
```

#### 2. Contoh Penggunaan di Komponen React / Next.js / Vue
```tsx
import React, { useState } from 'react';
import { exportActivityLogs } from '@/services/analyticsService';

interface ExportButtonsProps {
  courseId: string;
  selectedStudentId?: string; // Optional: jika sedang memfilter 1 murid
}

export const ExportLogButtons: React.FC<ExportButtonsProps> = ({ courseId, selectedStudentId }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'excel' | 'csv') => {
    setLoading(true);
    try {
      await exportActivityLogs({
        courseId,
        studentId: selectedStudentId,
        format,
      });
    } catch (err) {
      alert('Gagal mengunduh file log aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => handleExport('excel')}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Mengunduh...' : '📥 Ekspor Excel (.xlsx)'}
      </button>

      <button
        disabled={loading}
        onClick={() => handleExport('csv')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Mengunduh...' : '📄 Ekspor CSV (.csv)'}
      </button>
    </div>
  );
};
```

---

## 📋 4. Format & Isi Laporan Ekspor

Di dalam file hasil ekspor (Excel maupun CSV), data akan ditampilkan dengan format rapi sebagai berikut:

| No | Nama Murid | NIS | Aktivitas | Waktu (Timestamp) |
|---|---|---|---|---|
| 1 | Ahmad Yani | 12345678 | Masuk Aplikasi (Login) | 2026-08-08 20:30:15 |
| 2 | Ahmad Yani | 12345678 | Membuka Halaman Kelas | 2026-08-08 20:31:02 |
| 3 | Siti Rahma | 87654321 | Membuka Modul Materi - Bab 1: Aljabar | 2026-08-08 20:32:45 |
| 4 | Siti Rahma | 87654321 | Membaca Dokumen / Materi - Modul_Aljabar.pdf | 2026-08-08 20:33:10 |
| 5 | Budi Santoso | 11223344 | Mengumpulkan Tes Diagnostik - Diagnostik Bab 1 | 2026-08-08 20:35:00 |

### Daftar Kode Aktivitas -> Bahasa Manusia:
- `LOGIN` $\rightarrow$ *"Masuk Aplikasi (Login)"*
- `LOGOUT` $\rightarrow$ *"Keluar Aplikasi (Logout)"*
- `COURSE_ENROLLED` $\rightarrow$ *"Terdaftar di Kelas"*
- `COURSE_OPENED` $\rightarrow$ *"Membuka Halaman Kelas"*
- `SUBJECT_MODULE_OPENED` $\rightarrow$ *"Membuka Modul Materi"*
- `FILE_READ` $\rightarrow$ *"Membaca Dokumen / Materi"*
- `VIDEO_WATCHED` $\rightarrow$ *"Menonton Video Pembelajaran"*
- `ELKPD_SUBMITTED` $\rightarrow$ *"Mengumpulkan E-LKPD"*
- `DIAGNOSTIC_MODULE_OPENED` $\rightarrow$ *"Membuka Modul Tes Diagnostik"*
- `DIAGNOSTIC_STARTED` $\rightarrow$ *"Memulai Tes Diagnostik"*
- `DIAGNOSTIC_SUBMITTED` $\rightarrow$ *"Mengumpulkan Tes Diagnostik"*
- `REMEDIAL_STARTED` $\rightarrow$ *"Memulai Tes Remedial"*
- `REMEDIAL_COMPLETED` $\rightarrow$ *"Menyelesaikan Tes Remedial"*
- `DISCUSSION_STARTED` $\rightarrow$ *"Membuat Forum Diskusi Baru"*
- `DISCUSSION_COMMENTED` $\rightarrow$ *"Menambahkan Komentar Diskusi"*
- `DISCUSSION_LIKED` $\rightarrow$ *"Menyukai Diskusi"*
- `COMMENT_LIKED` $\rightarrow$ *"Menyukai Komentar"*

---

## ⚡ 5. Tipe Data TypeScript (Siap Pakai)

```typescript
export interface StudentActivityLogItem {
  id: string;
  studentId: string;
  studentName?: string;
  nis?: string;
  action: string;
  createdAt: string; // ISO 8601 RFC3339, misal: "2026-08-08T19:40:15Z"
  courseId?: string;
  courseName?: string;
  courseModuleId?: string;
  moduleName?: string;
  metadata?: Record<string, any>;
}

export interface ActivityLogPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ActivityLogListResponse {
  success: boolean;
  message?: string;
  data: {
    logs: StudentActivityLogItem[];
    pagination: ActivityLogPagination;
  };
}
```
