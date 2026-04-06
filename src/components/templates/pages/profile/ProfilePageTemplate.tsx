"use client";

import { Heading3, Heading5 } from "@/components/atoms/Typography";
import { useState, useEffect } from "react";
import {
  useCurrentUser,
  useUpdateCounselorProfile,
  useUpdateParentProfile,
  useChangePassword,
} from "@/services";
import { isCounselor, IEducation } from "@/types/auth";
import { showToast } from "@/libs/toast";

const ProfilePageTemplate = () => {
  const { data: user, isLoading } = useCurrentUser();
  const updateCounselorProfile = useUpdateCounselorProfile();
  const updateParentProfile = useUpdateParentProfile();
  const changePassword = useChangePassword();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Counselor-specific fields
  const [isStudent, setIsStudent] = useState(false);
  const [university, setUniversity] = useState("");
  const [stage, setStage] = useState<"D3" | "D4" | "S1" | "S2" | "S3">("S1");
  const [majority, setMajority] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [practiceLicenseNumber, setPracticeLicenseNumber] = useState("");
  const [counselorWork, setCounselorWork] = useState("");

  // Parent-specific fields
  const [parentWork, setParentWork] = useState("");
  const [age, setAge] = useState<number>(0);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFullName(user.fullname || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");

      if (isCounselor(user)) {
        const studentStatus = user.isStudent || false;
        setIsStudent(studentStatus);
        setUniversity(user.education?.university || "");
        setStage(user.education?.stage || "S1");
        setMajority(user.education?.majority || "");

        // Set semester from user data (can be null for professionals)
        setSemester(user.education?.semester ?? null);

        setPracticeLicenseNumber(user.practiceLicenseNumber || "");
        setCounselorWork(user.work || "");
      } else {
        setParentWork(user.work || "");
        setAge(user.age || 0);
      }
    }
  }, [user]);

  // Clear fields when switching status
  useEffect(() => {
    if (isStudent) {
      // Students should not have professional fields
      setPracticeLicenseNumber("");
      setCounselorWork("");
    } else {
      // Professionals should not have semester
      setSemester(null);
    }
  }, [isStudent]);

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      if (isCounselor(user)) {
        // Validate required fields for students
        if (isStudent) {
          if (!semester || semester <= 0) {
            showToast.error("Semester wajib diisi untuk mahasiswa");
            return;
          }
          if (semester < 1 || semester > 14) {
            showToast.error("Semester harus antara 1-14");
            return;
          }
          if (!university.trim()) {
            showToast.error("University wajib diisi");
            return;
          }
          if (!majority.trim()) {
            showToast.error("Major wajib diisi");
            return;
          }
        } else {
          // Validate required fields for professionals
          if (!practiceLicenseNumber.trim()) {
            showToast.error(
              "Practice License Number wajib diisi untuk non-mahasiswa"
            );
            return;
          }
          if (practiceLicenseNumber.length < 10) {
            showToast.error("Practice License Number minimal 10 karakter");
            return;
          }
          if (!/^\d+$/.test(practiceLicenseNumber)) {
            showToast.error("Practice License Number hanya boleh berisi angka");
            return;
          }
          if (!counselorWork.trim()) {
            showToast.error("Pekerjaan wajib diisi untuk non-mahasiswa");
            return;
          }
          if (!university.trim()) {
            showToast.error("University wajib diisi");
            return;
          }
          if (!majority.trim()) {
            showToast.error("Major wajib diisi");
            return;
          }
        }

        // Build education object based on student status
        const education: IEducation = {
          university,
          stage,
          majority,
          // Semester: must be a valid number for students, null for professionals
          semester: isStudent ? semester : null,
        };

        const updateData: any = {
          fullname: fullName,
          email: email,
          phone: phone,
          address: address,
          isStudent,
          education,
        };

        // Only send practiceLicenseNumber and work if professional (not student)
        // For students, don't include these fields at all (backend expects them to be absent/undefined)
        if (!isStudent) {
          updateData.practiceLicenseNumber = practiceLicenseNumber || "";
          updateData.work = counselorWork || "";
        }
        // For students, we don't add these fields to updateData at all

        await updateCounselorProfile.mutateAsync(updateData);
      } else {
        await updateParentProfile.mutateAsync({
          fullname: fullName,
          email: email,
          phone: phone,
          address: address,
          work: parentWork,
          age: age,
        });
      }
      showToast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      showToast.error(error?.message || "Gagal memperbarui profil");
    }
  };

  // Password validation function
  const validatePassword = (
    password: string
  ): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password minimal 8 karakter",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password harus mengandung minimal 1 huruf kapital",
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: "Password harus mengandung minimal 1 angka",
      };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        message:
          'Password harus mengandung minimal 1 karakter spesial (!@#$%^&*(),.?":{}|<>)',
      };
    }

    return { valid: true, message: "" };
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      showToast.error("Harap isi password lama dan password baru");
      return;
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      showToast.error(validation.message);
      return;
    }

    try {
      await changePassword.mutateAsync({
        oldPassword,
        newPassword,
      });
      showToast.success("Password berhasil diubah");
      setOldPassword("");
      setNewPassword("");
      setIsEditingPassword(false);
    } catch (error: any) {
      showToast.error(error?.message || "Gagal mengubah password");
    }
  };

  const handleCancelPasswordEdit = () => {
    setOldPassword("");
    setNewPassword("");
    setIsEditingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading3 className="text-xl sm:text-2xl lg:text-3xl">
            Profil
          </Heading3>
        </div>
        <div className="bg-neutral-01 rounded-lg border border-grey-stroke p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Heading3 className="text-xl sm:text-2xl lg:text-3xl">Profil</Heading3>
        <div className="bg-neutral-01 rounded-lg border border-grey-stroke p-4 sm:p-6">
          <p className="text-grey text-sm">Gagal memuat data pengguna</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <Heading3 className="text-xl sm:text-2xl lg:text-3xl">Profil</Heading3>
        <button
          onClick={handleSaveChanges}
          disabled={
            updateCounselorProfile.isPending || updateParentProfile.isPending
          }
          className="px-4 py-2.5 bg-moss-stone text-neutral-01 rounded-lg text-sm sm:text-base font-medium hover:bg-moss-stone/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {updateCounselorProfile.isPending || updateParentProfile.isPending
            ? "Menyimpan..."
            : "Simpan Perubahan"}
        </button>
      </div>

      <div className="bg-neutral-01 rounded-lg border border-grey-stroke p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Alamat
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone resize-none"
            />
          </div>

          {/* Counselor-specific fields */}
          {isCounselor(user) && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                  Status
                </label>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isStudent}
                      onChange={() => setIsStudent(true)}
                      className="w-4 h-4 text-moss-stone focus:ring-moss-stone"
                    />
                    <span className="text-sm">Mahasiswa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isStudent}
                      onChange={() => setIsStudent(false)}
                      className="w-4 h-4 text-moss-stone focus:ring-moss-stone"
                    />
                    <span className="text-sm">Profesional</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Universitas <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jenjang <span className="text-error">*</span>
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                    required
                  >
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
              </div>

              {/* Major and Semester */}
              {isStudent ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Jurusan <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={majority}
                      onChange={(e) => setMajority(e.target.value)}
                      className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Semester <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={semester ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseInt(e.target.value)
                          : null;
                        setSemester(val);
                      }}
                      className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                      placeholder="Masukkan semester (1-14)"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Jurusan <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={majority}
                    onChange={(e) => setMajority(e.target.value)}
                    className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                    required
                  />
                </div>
              )}

              {/* Practice License Number - Only for Professional */}
              {!isStudent && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nomor Surat Tanda Registrasi (STR){" "}
                    <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={practiceLicenseNumber}
                    onChange={(e) => setPracticeLicenseNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                    placeholder="Minimal 10 angka"
                    required
                  />
                </div>
              )}

              {/* Work - Only for Professional */}
              {!isStudent && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pekerjaan/Institusi <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={counselorWork}
                    onChange={(e) => setCounselorWork(e.target.value)}
                    className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                    placeholder="Nama pekerjaan/institusi"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Parent-specific fields */}
          {!isCounselor(user) && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={parentWork}
                  onChange={(e) => setParentWork(e.target.value)}
                  className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Usia</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Peran</label>
            <input
              type="text"
              value={isCounselor(user) ? "Konselor" : "Orang Tua"}
              disabled
              className="w-full px-4 py-2.5 border border-grey-stroke rounded-lg text-sm bg-grey-lightest text-grey cursor-not-allowed"
            />
          </div>

          {/* Change Password Section */}
          <div className="border-t border-grey-stroke pt-6 mt-4">
            <div className="flex items-center justify-between mb-4 flex-col gap-4 md:flex-row">
              <div>
                <Heading5 className="mb-1">Ubah Password</Heading5>
                <p className="text-sm text-grey">
                  Perbarui password Anda untuk menjaga keamanan akun
                </p>
              </div>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-4 py-2 w-full md:w-auto border border-moss-stone text-moss-stone rounded-lg text-sm font-medium hover:bg-moss-stone/5 transition-colors"
                >
                  Edit Password
                </button>
              )}
            </div>

            {isEditingPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password Lama
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                      placeholder="Masukkan password lama"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-grey-dark transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showOldPassword ? (
                          <>
                            <path
                              d="M1.667 10s3.333-6.667 8.333-6.667S18.333 10 18.333 10s-3.333 6.667-8.333 6.667S1.667 10 1.667 10z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M14.95 14.95A8.5 8.5 0 0 1 10 16.667c-5 0-8.333-6.667-8.333-6.667a15.318 15.318 0 0 1 3.383-4.05m2.45-1.617a6.665 6.665 0 0 1 2.5-.5c5 0 8.333 6.667 8.333 6.667a15.32 15.32 0 0 1-1.283 1.817M11.767 11.767a2.5 2.5 0 1 1-3.534-3.534"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.667 1.667l16.666 16.666"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-grey-stroke rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-moss-stone"
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-grey-dark transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {showNewPassword ? (
                          <>
                            <path
                              d="M1.667 10s3.333-6.667 8.333-6.667S18.333 10 18.333 10s-3.333 6.667-8.333 6.667S1.667 10 1.667 10z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M14.95 14.95A8.5 8.5 0 0 1 10 16.667c-5 0-8.333-6.667-8.333-6.667a15.318 15.318 0 0 1 3.383-4.05m2.45-1.617a6.665 6.665 0 0 1 2.5-.5c5 0 8.333 6.667 8.333 6.667a15.32 15.32 0 0 1-1.283 1.817M11.767 11.767a2.5 2.5 0 1 1-3.534-3.534"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.667 1.667l16.666 16.666"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-neutral-02">
                      Password harus mengandung:
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 ${
                            newPassword.length >= 8
                              ? "text-success"
                              : "text-grey"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {newPassword.length >= 8 ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          )}
                        </svg>
                        <span
                          className={`text-xs ${
                            newPassword.length >= 8
                              ? "text-success"
                              : "text-grey"
                          }`}
                        >
                          Minimal 8 karakter
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 ${
                            /[A-Z]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {/[A-Z]/.test(newPassword) ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          )}
                        </svg>
                        <span
                          className={`text-xs ${
                            /[A-Z]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                        >
                          Minimal 1 huruf kapital
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 ${
                            /[0-9]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {/[0-9]/.test(newPassword) ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          )}
                        </svg>
                        <span
                          className={`text-xs ${
                            /[0-9]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                        >
                          Minimal 1 angka
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          )}
                        </svg>
                        <span
                          className={`text-xs ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                              ? "text-success"
                              : "text-grey"
                          }`}
                        >
                          Minimal 1 karakter spesial (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleCancelPasswordEdit}
                    className="px-4 py-2 border border-grey-stroke text-grey rounded-lg text-sm font-medium hover:bg-grey-lightest transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="px-4 py-2 bg-moss-stone text-white rounded-lg text-sm font-medium hover:bg-moss-stone/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePassword.isPending ? "Mengubah..." : "Ubah Password"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageTemplate;
