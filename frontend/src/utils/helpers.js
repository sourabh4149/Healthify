// src/utils/helpers.js

// ── BMI Calculator ───────────────────────────────────────────────────────────
// heightCm: number, weightKg: number → returns BMI rounded to 1 decimal
export const calcBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null
  const heightM = heightCm / 100
  return +(weightKg / (heightM * heightM)).toFixed(1)
}

// ── Formatters ───────────────────────────────────────────────────────────────
export const fmt = {

  // Age from date of birth string or Date object → e.g. 34
  age: (dob) => {
    if (!dob) return '?'
    const birth = new Date(dob)
    if (isNaN(birth)) return '?'
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const notYetHadBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    if (notYetHadBirthday) age--
    return age
  },

  // Date string → "Jan 5, 2024"
  date: (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d)) return '—'
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  },

  // Number → "1,23,456" (Indian locale) or plain if not a number
  number: (val, decimals = 0) => {
    if (val === null || val === undefined || isNaN(val)) return '—'
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  },

  // Capitalize first letter of each word
  title: (str) => {
    if (!str) return '—'
    return str.replace(/\b\w/g, c => c.toUpperCase())
  },

  // Phone number → "+91 98100 00001" style (no-op if already formatted)
  phone: (phone) => {
    if (!phone) return '—'
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    if (digits.length === 12 && digits.startsWith('91'))
      return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`
    return phone
  },

  // File size bytes → "1.4 MB" / "320 KB"
  fileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    if (bytes < 1024)       return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  },
}