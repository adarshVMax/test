// Real candidates for Faith Model Public School - Annual Voting.
// Names + roles are taken from the image files in
// frontend/public/canditates/  (filename format: "Name(Role).ext").
// Photos are served by the frontend from that public folder.

const img = (file) => encodeURI(`/canditates/${file}`);

// Four school houses with their theme colors.
export const HOUSES = [
  { key: "red_riders", name: "Red Riders", color: "#dc2626", soft: "#fee2e2" },
  { key: "flying_squad", name: "Flying Squad", color: "#2563eb", soft: "#dbeafe" },
  { key: "honey_warriors", name: "Honey Warriors", color: "#d97706", soft: "#fef3c7" },
  { key: "power_rangers", name: "Power Rangers", color: "#16a34a", soft: "#dcfce7" },
];

// category: 'head_boy' | 'head_girl' | 'discipline_leader' | 'sports_mentor' | 'house_leader'
// house: only set for house_leader candidates.
export const CANDIDATES = [
  // ---- Head Boy ----
  { name: "Hasid", category: "head_boy", house: null, photo: img("Hasid(Headboy).avif") },
  { name: "Owais", category: "head_boy", house: null, photo: img("Owais(Headboy).jpg") },
  { name: "Sithesh", category: "head_boy", house: null, photo: img("Sithesh(headboy).avif") },

  // ---- Head Girl ----
  { name: "Afrah Tanzeel", category: "head_girl", house: null, photo: img("Afrah Tanzeel(Headgirl).png") },
  { name: "Ayesha Begum", category: "head_girl", house: null, photo: img("Ayesha Begum(Headgirl).jpeg") },
  { name: "Sadhiya", category: "head_girl", house: null, photo: img("Sadhiya(HEadgirl).png") },

  // ---- Discipline Leader ----
  { name: "Hafsa Mariyam", category: "discipline_leader", house: null, photo: img("Hafsa MAriyam(DiscLeader).jpg") },
  { name: "Shruthi", category: "discipline_leader", house: null, photo: img("Shruthi(DiscLeader).png") },
  { name: "Syed Ishain", category: "discipline_leader", house: null, photo: img("Syed Ishain(DiscLeader).png") },

  // ---- Sports Mentor ----
  { name: "Faizullah", category: "sports_mentor", house: null, photo: img("Faizullah(Sportsmentor).avif") },
  { name: "Nuha Mufliha", category: "sports_mentor", house: null, photo: img("Nuha Mufliha(Sportsmentor).png") },

  // ---- House Leaders: Red Riders ----
  { name: "Aidha Naseem", category: "house_leader", house: "red_riders", photo: img("Aidha Naseem(Red Riders).jpeg") },
  { name: "Jaza Mariyam", category: "house_leader", house: "red_riders", photo: img("Jaza Mariyam(Red Riders).webp") },

  // ---- House Leaders: Flying Squad ----
  { name: "Aneeqa", category: "house_leader", house: "flying_squad", photo: img("Aneeqa(FlyingSquad).jpg") },
  { name: "Mariyam Khashiya", category: "house_leader", house: "flying_squad", photo: img("Mariyam Khashiya(FlyingSquad).png") },

  // ---- House Leaders: Honey Warriors ----
  { name: "Fabia Christy", category: "house_leader", house: "honey_warriors", photo: img("Fabia Christy(Honey Warriors).png") },
  { name: "Rija", category: "house_leader", house: "honey_warriors", photo: img("Rija(Honey Warriors).jpg") },

  // ---- House Leaders: Power Rangers ----
  { name: "Rinaz", category: "house_leader", house: "power_rangers", photo: img("Rinaz(Power Rangers).jpeg") },
  { name: "Shazana Fathima", category: "house_leader", house: "power_rangers", photo: img("Shazana Fathima(Power Rangers).jpeg") },
];
