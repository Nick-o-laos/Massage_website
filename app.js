firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();
const $ = id => document.getElementById(id);
const key = n => n.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
let me = null, cur = null, curTab = 'massages';
const inviteCode = new URLSearchParams(location.search).get('invite');

function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); scrollTo(0,0); }
function say(t){ $('msg').textContent = t; }

// floating hearts
setInterval(()=>{ const h=document.createElement('span'); h.textContent='💗'; h.style.left=Math.random()*100+'vw'; h.style.fontSize=(10+Math.random()*16)+'px'; $('hearts').appendChild(h); setTimeout(()=>h.remove(),7000); }, 1200);

// ===== LOGIN / REGISTER =====
if (inviteCode) $('login-sub').textContent = "You're invited 💌 Choose a name and a PIN to create your profile";

async function enter(){
  const name = $('name').value, pin = $('pin').value, k = key(name);
  if (!k || pin.length < 4) return say('Name and 4-digit PIN please');
  const ref = db.collection('users').doc(k), snap = await ref.get();
  if (snap.exists) {
    if (snap.data().pin !== pin) return say('Wrong PIN 🙈');
    me = { id:k, ...snap.data() };
  } else {
    const isAdmin = k === ADMIN_NAME;
    let inv = null;
    if (!isAdmin) {
      if (!inviteCode) return say('New here? You need an invite link 💌');
      inv = await db.collection('invites').doc(inviteCode).get();
      if (!inv.exists || inv.data().used) return say('This invite is no longer valid');
    }
    me = { id:k, name:name.trim(), pin, role:isAdmin?'admin':'user', hearts:isAdmin?0:5, adult:isAdmin, done:0, created:Date.now() };
    await ref.set(me);
    if (inv) await inv.ref.update({ used:true, by:k });
  }
  localStorage.setItem('mm_user', k);
  start();
}
function logout(){ localStorage.removeItem('mm_user'); me=null; show('login'); }

async function refresh(){ me = { id:me.id, ...(await db.collection('users').doc(me.id).get()).data() }; }

function start(){
  $('hello').textContent = 'Hello, ' + me.name + ' 💕';
  $('adminBtn').style.display = me.role==='admin' ? '' : 'none';
  updateStats(); tab('massages', document.querySelector('.tab')); show('menu');
}
function updateStats(){
  $('hearts-n').textContent = me.hearts;
  $('gift-n').textContent = 5 - ((me.done||0) % 5);
}

// ===== TABS =====
async function tab(t, btn){
  curTab = t;
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
  const L = $('list'); L.innerHTML = '';
  if (t === 'massages') {
    const free = ((me.done||0)+1) % 5 === 0;
    if (free) L.innerHTML = '<div class="card gift">🎁 Your next massage is a GIFT!</div>';
    MASSAGES.filter(m => !m.dark || me.adult).forEach(m => {
      const c = document.createElement('div'); c.className = 'card' + (m.dark?' dark':'');
      c.onclick = () => openOrder(m.id);
      c.innerHTML = `<h3>${m.emoji} ${m.name}</h3><p>⏱️ ${m.min} min</p><p class="cost">💖 ${free?0:m.h} · ${m.meal}</p>`;
      L.appendChild(c);
    });
  } else if (t === 'quests') {
    QUESTS.forEach(q => {
      const c = document.createElement('div'); c.className = 'card';
      c.innerHTML = `<h3>${q.text}</h3><p class="cost">+${q.h} 💖</p><button class="btn small">Done it!</button>`;
      c.querySelector('button').onclick = async () => {
        await db.collection('requests').add({ kind:'quest', user:me.id, uname:me.name, text:q.text, h:q.h, status:'pending', date:Date.now() });
        wa(`💌 ${me.name} says: "${q.text}" is done! Claim ${q.h} 💖?`);
      };
      L.appendChild(c);
    });
  } else {
    const s = await db.collection('requests').where('user','==',me.id).get();
    const rows = s.docs.map(d=>d.data()).sort((a,b)=>b.date-a.date);
    L.innerHTML = rows.length ? '' : '<div class="card">Nothing yet… 💕</div>';
    rows.forEach(r => L.innerHTML += `<div class="card"><h3>${r.kind==='quest'?'✅ '+r.text:'💆 '+r.massage}</h3><p>${new Date(r.date).toLocaleString()} · ${r.status}</p></div>`);
  }
}

// ===== ORDER =====
function openOrder(id){
  cur = { m: MASSAGES.find(x=>x.id===id), sel:{}, addons:{} };
  $('m-title').textContent = cur.m.emoji + ' ' + cur.m.name;
  $('m-desc').textContent = cur.m.desc;
  const o = $('m-opts'); o.innerHTML = '';
  Object.keys(EXTRAS).forEach(k => {
    cur.sel[k] = EXTRAS[k][0];
    o.innerHTML += `<label>${k}</label><select onchange="cur.sel['${k}']=this.value">${EXTRAS[k].map(v=>`<option>${v}</option>`).join('')}</select>`;
  });
  o.innerHTML += '<label>Add-ons</label>' + ADDONS.map(a=>`<div class="chk"><input type="checkbox" id="a-${a.id}" onchange="cur.addons['${a.id}']=this.checked;calc()"><span>${a.label} ${a.h?'(+'+a.h+'💖)':''}</span></div>`).join('');
  calc(); $('modal').classList.add('active');
}
function total(){
  if (((me.done||0)+1) % 5 === 0) return 0;
  return cur.m.h + ADDONS.filter(a=>cur.addons[a.id]).reduce((s,a)=>s+a.h,0);
}
function calc(){ $('m-cost').textContent = total() + ' 💖  (' + cur.m.meal + ')'; }

async function confirmOrder(){
  const cost = total(), adds = ADDONS.filter(a=>cur.addons[a.id]).map(a=>a.label);
  await db.collection('requests').add({ kind:'massage', user:me.id, uname:me.name, massage:cur.m.name, sel:cur.sel, addons:adds, h:cost, meal:cur.m.meal, status:'pending', date:Date.now() });
  await db.collection('users').doc(me.id).update({ hearts: firebase.firestore.FieldValue.increment(-cost), done: firebase.firestore.FieldValue.increment(1) });
  $('modal').classList.remove('active');
  wa(`Hey my love 💕\n\n${me.name} chose: *${cur.m.name}*\n⏱️ ${cur.m.min} min\n💧 Oil: ${cur.sel.oil}\n💪 Intensity: ${cur.sel.intensity}\n🎵 Music: ${cur.sel.music}\n🛏️ Location: ${cur.sel.location}\n✨ Add-ons: ${adds.join(', ')||'none'}\n\n💖 Cost: *${cost} hearts* (${cur.m.meal})\n\nWaiting for you 😘`);
  await refresh(); updateStats(); tab('massages', document.querySelector('.tab'));
}
function wa(text){ window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(text)}`, '_blank'); }

// ===== ADMIN =====
async function makeInvite(){
  const code = Math.random().toString(36).slice(2,10);
  await db.collection('invites').doc(code).set({ used:false, date:Date.now() });
  const url = SITE_URL + '?invite=' + code;
  $('invite-out').innerHTML = `Send this (works once):<br><b>${url}</b>`;
  navigator.clipboard && navigator.clipboard.writeText(url);
}
async function openAdmin(){
  show('admin');
  const r = await db.collection('requests').where('status','==','pending').get();
  $('reqs').innerHTML = r.docs.length ? '' : '<div class="card">No pending requests</div>';
  r.docs.forEach(d => { const x = d.data(), c = document.createElement('div'); c.className='card';
    c.innerHTML = `<h3>${x.uname}: ${x.massage||x.text}</h3><p>${x.kind==='massage'?x.h+' 💖 · '+x.meal:'+'+x.h+' 💖 quest'}</p><button class="btn small">${x.kind==='quest'?'Approve':'Done'}</button>`;
    c.querySelector('button').onclick = async () => {
      if (x.kind==='quest') await db.collection('users').doc(x.user).update({ hearts: firebase.firestore.FieldValue.increment(x.h) });
      await d.ref.update({ status: x.kind==='quest'?'approved':'done' }); openAdmin();
    };
    $('reqs').appendChild(c); });
  const u = await db.collection('users').get();
  $('users').innerHTML = '';
  u.docs.forEach(d => { const x = d.data(), c = document.createElement('div'); c.className='card';
    c.innerHTML = `<h3>${x.name}</h3><p>💖 ${x.hearts} · ${x.done||0} massages${x.hearts<0?' · owes '+(-x.hearts)+' 💖':''}</p>
      <button class="btn small" data-a="1">+1</button> <button class="btn small" data-a="5">+5</button>
      <button class="btn small ghost" data-a="r">Redeem debt</button>
      <button class="btn small ghost" data-a="d">After Dark: ${x.adult?'ON':'OFF'}</button>`;
    c.querySelectorAll('button').forEach(b => b.onclick = async () => {
      const a = b.dataset.a, ref = d.ref;
      if (a==='r') await ref.update({ hearts: Math.max(0, x.hearts) });
      else if (a==='d') await ref.update({ adult: !x.adult });
      else await ref.update({ hearts: firebase.firestore.FieldValue.increment(+a) });
      openAdmin();
    });
    $('users').appendChild(c); });
}

// auto-login
(async()=>{ const k = localStorage.getItem('mm_user'); if (k) { const s = await db.collection('users').doc(k).get(); if (s.exists) { me = { id:k, ...s.data() }; start(); } } })();
