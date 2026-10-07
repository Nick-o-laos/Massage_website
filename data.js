// ===== CONFIG: fill these in =====
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD0upqY1t_J7EL3yXXo0XHOwBE92cHCFDo",
  authDomain: "massage-site-a77ce.firebaseapp.com",
  projectId: "massage-site-a77ce",
  storageBucket: "massage-site-a77ce.firebasestorage.app",
  messagingSenderId: "834583152514",
  appId: "1:834583152514:web:59ceecaa02507058e0b19b"
};
const ADMIN_NAME = "nikolaos";        // the name you register with = admin
const ADMIN_PHONE = "306908217726";   // WhatsApp number
const SITE_URL = location.origin + location.pathname; // used for invite links

// ===== MASSAGES (h = hearts, meal = what it "costs" in real life) =====
const MASSAGES = [
  { id:'face', name:'Face Massage', emoji:'💆‍♀️', min:20, h:2, meal:'1 breakfast', desc:'Gentle, slow, relaxing touch on the face.' },
  { id:'hands', name:'Hands Massage', emoji:'🤲', min:15, h:2, meal:'1 coffee + dessert', desc:'Hands and wrists, warm and soothing.' },
  { id:'back', name:'Back Massage', emoji:'💆‍♂️', min:30, h:4, meal:'1 lunch', desc:'Back and shoulders, all the tension gone.' },
  { id:'legs', name:'Legs Massage', emoji:'🦶', min:25, h:4, meal:'1 dinner', desc:'Legs and feet, pure bliss.' },
  { id:'backhands', name:'Back + Hands', emoji:'✨', min:45, h:6, meal:'1 dinner date', desc:'The best of two worlds.' },
  { id:'full', name:'Full Body', emoji:'🌹', min:60, h:10, meal:'3 dinners', desc:'The complete experience, head to toe.' },
  { id:'full+', name:'Full Body Deluxe', emoji:'👑', min:60, h:14, meal:'1 surprise date', desc:'Full body plus every extra. Royal treatment.' },
  // After Dark (only for people you enable it for)
  { id:'sensual', name:'Sensual Oil Massage', emoji:'🔥', min:45, h:12, meal:'1 candlelit dinner', desc:'Warm oil, candles, slow hands… and no rush.', dark:true },
  { id:'couples', name:"Candlelit Couple's Night", emoji:'🕯️', min:90, h:18, meal:'1 romantic evening', desc:'Massage for two, wine, music, and see where the night goes.', dark:true },
  { id:'surprise', name:'Surprise Ending', emoji:'😏', min:60, h:20, meal:'a very good dinner', desc:'You pick nothing. I decide everything.', dark:true },
  { id:'happy', name:'Happy Ending', emoji:'😈', min:60, h:25, meal:'a very, very good dinner', desc:'Exactly what it sounds like. 😘', dark:true }
];

const EXTRAS = {
  oil: ['None','Lavender','Mint','Coconut','Rose'],
  intensity: ['Soft','Medium','Strong'],
  music: ['None','Relaxing','Jazz','Classical','R&B'],
  location: ['Bed','Couch','Mat']
};
const ADDONS = [
  { id:'towel', label:'Warm towel', h:1 },
  { id:'candle', label:'Massage candle', h:1 },
  { id:'nophone', label:'No interruptions (phone silent)', h:1 },
  { id:'plus10', label:'+10 minutes', h:2 },
  { id:'hug', label:'5-minute hug afterwards', h:0 }
];

const QUESTS = [
  { id:'coffee', text:'Bring me a coffee ☕', h:2 },
  { id:'sweet', text:'Send me something sweet 💌', h:1 },
  { id:'nophone30', text:'30 min together, no phones 📵', h:3 },
  { id:'nocomplain', text:'A whole day without complaints 😄', h:4 },
  { id:'movie', text:'Let me pick the movie 🎬', h:2 },
  { id:'dedicate', text:'Dedicate a song to me 🎵', h:2 },
  { id:'dessert', text:'Homemade dessert 🍰', h:4 }
];
