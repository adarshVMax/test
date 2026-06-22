// Mock data for Faith Model Public School - Annual Voting.
// Avatars are generated on the fly by DiceBear (https://dicebear.com),
// so no binary images need to be stored in the repo.

const avatar = (seed, bg) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
    seed
  )}&radius=18&backgroundColor=${bg}`;

// Four school houses with their theme colors.
export const HOUSES = [
  { key: "aravali", name: "Aravali House", color: "#16a34a", soft: "#dcfce7" },
  { key: "nilgiri", name: "Nilgiri House", color: "#2563eb", soft: "#dbeafe" },
  { key: "shivalik", name: "Shivalik House", color: "#dc2626", soft: "#fee2e2" },
  { key: "udaygiri", name: "Udaygiri House", color: "#d97706", soft: "#fef3c7" },
];

// category: 'head_boy' | 'head_girl' | 'house_leader'
// house: only set for house_leader candidates.
export const CANDIDATES = [
  // ---- Head Boy (4) ----
  { name: "Aarav Sharma", category: "head_boy", house: null, photo: avatar("Aarav Sharma", "b6e3f4") },
  { name: "Vivaan Gupta", category: "head_boy", house: null, photo: avatar("Vivaan Gupta", "c0aede") },
  { name: "Aditya Verma", category: "head_boy", house: null, photo: avatar("Aditya Verma", "ffd5dc") },
  { name: "Kabir Singh", category: "head_boy", house: null, photo: avatar("Kabir Singh", "ffdfbf") },

  // ---- Head Girl (4) ----
  { name: "Ananya Iyer", category: "head_girl", house: null, photo: avatar("Ananya Iyer", "ffd5dc") },
  { name: "Diya Patel", category: "head_girl", house: null, photo: avatar("Diya Patel", "b6e3f4") },
  { name: "Saanvi Reddy", category: "head_girl", house: null, photo: avatar("Saanvi Reddy", "d1d4f9") },
  { name: "Ishita Nair", category: "head_girl", house: null, photo: avatar("Ishita Nair", "c0aede") },

  // ---- House Leaders: Aravali (2) ----
  { name: "Rohan Mehta", category: "house_leader", house: "aravali", photo: avatar("Rohan Mehta", "dcfce7") },
  { name: "Arjun Rao", category: "house_leader", house: "aravali", photo: avatar("Arjun Rao", "bbf7d0") },

  // ---- House Leaders: Nilgiri (2) ----
  { name: "Karan Malhotra", category: "house_leader", house: "nilgiri", photo: avatar("Karan Malhotra", "dbeafe") },
  { name: "Dev Joshi", category: "house_leader", house: "nilgiri", photo: avatar("Dev Joshi", "bfdbfe") },

  // ---- House Leaders: Shivalik (2) ----
  { name: "Nikhil Bose", category: "house_leader", house: "shivalik", photo: avatar("Nikhil Bose", "fee2e2") },
  { name: "Meera Kapoor", category: "house_leader", house: "shivalik", photo: avatar("Meera Kapoor", "fecaca") },

  // ---- House Leaders: Udaygiri (2) ----
  { name: "Aryan Khanna", category: "house_leader", house: "udaygiri", photo: avatar("Aryan Khanna", "fef3c7") },
  { name: "Veer Chauhan", category: "house_leader", house: "udaygiri", photo: avatar("Veer Chauhan", "fde68a") },
];
