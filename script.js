(function () {
  var root = document.getElementById('app-root');

  var ICONS = {
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.3 12.3l2.4 2.4 4.8-5.2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 8.5 4.5 12l4 3.5"/><path d="M15.5 8.5 19.5 12l-4 3.5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 15.5C4 17 4 20.5 4 20.5s3.5 0 5-1.5"/><path d="M9 15c-1-4 1-9 8-11 2 7-3 12-7 13z"/><path d="M9.5 14.5 11 16"/><circle cx="14.5" cy="9" r="1.3"/></svg>'
  };

  var STAGES = [
    { name: 'Proposal', team: 'Operation Team', type: 'step', icon: 'doc',
      sop: ['Spot a painful task that’s worth creating a new system for / automating.',
            'Submit your proposal by filling in the “+ New proposal” form.',
            'Attach as complete an attachment as possible to help others understand your idea (e.g. presentation slides, flowchart or mindmap).',
            'Submit and wait for the Management Team’s approval.'] },
    { name: 'Approval', team: 'Management Team', type: 'gate', icon: 'check',
      sop: ['Each month the Management Team holds the approval meeting.',
            'Review the problem statement and the value-created calculation.',
            'Check the idea fits the company’s direction.',
            'Check for duplicate work (the idea may already exist, or another team proposed the same).',
            'Approve or reject the proposal.'] },
    { name: 'IT Review', team: 'IT Team', type: 'step', icon: 'search',
      sop: ['Confirm the planned tools are acceptable and supportable.',
            'Review and advise on the framework.'] },
    { name: 'Build & Test', team: 'Operation Team', type: 'step', icon: 'code',
      sop: ['The Operation Team builds the system and brings it to testing.',
            'Amend the system accordingly if problems occur during testing.',
            'Fill in the evaluation form before the next step, then submit it in the system for the Management Team to approve before it goes to IT for deploy & go-live.'] },
    { name: 'Final Approval', team: 'Management Team', type: 'gate', icon: 'shield',
      sop: ['Hold the final review once user testing and evaluation are complete.',
            'Check that serious problems are fixed, or have a clear plan.',
            'Approve for IT to deploy, add conditions, send it back for improvement, or reject.'] },
    { name: 'Deploy & Go Live', team: 'IT Team', type: 'milestone', icon: 'rocket',
      sop: ['The evaluated project request is accepted and added to the IT department’s project list.',
            'IT prepares the deployment and deploys it to production.',
            'Maintain the system.'] }
  ];
  var STORE_KEY = 'proposals';
  var SHARED = true;

  // ---- Supabase ----
  var SUPABASE_URL = 'https://frekhsgoxibxcsdgymxz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_jMtf2mrJGjcr_6hBfOvdZQ_ctN65AQm';
  var sb = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
  var TESTING_STAGE = 3; // Build & Test — evaluation happens here
  var IT_STAGE = 2; // IT Review — IT adds suggestions & files here

  var EVAL_CRITERIA = [
    'Easy to use',
    'Does what I need it to',
    'Fast / responsive enough',
    'Works without errors',
    'Clear and well laid out'
  ];
  var RATINGS = [
    { v: 'good', label: 'Good' },
    { v: 'okay', label: 'Okay' },
    { v: 'poor', label: 'Bad' }
  ];
  // Build & Test feasibility feedback — filled by the proposer
  var FEAS_METRICS = [
    { k: 'timeSaving', label: 'Time saving per month', ph: 'e.g. ~24 hours / month' },
    { k: 'costSaving', label: 'Cost saving per month (RM)', ph: 'e.g. 3,000' },
    { k: 'usersBenefit', label: 'People / departments benefiting', ph: 'e.g. HR team, ~15 staff' }
  ];
  var FEAS_CHECKS = [
    { k: 'noErrors', label: 'Works without errors' },
    { k: 'responsive', label: 'Fast / responsive enough' },
    { k: 'easyToUse', label: 'Easy to use' },
    { k: 'meetsObjective', label: 'Meets the objective & solves the problem' },
    { k: 'readyGoLive', label: 'Ready to go live' }
  ];
  // proposal-form categories (what a proposal is about)
  var CATEGORIES = [
    'Nursery', 'Plantation', 'Mill', 'Account', 'Human Resource (HR)',
    'HQ Support', 'Administration and Finance', 'Information Technology (IT)', 'Machinery'
  ];
  // management PIC areas (assigned to Management users in Settings; Director is a role, not an area)
  var MGMT_CATEGORIES = [
    'Admin & Finance', 'HR & HQ', 'Plantation / Operation',
    'Mill', 'Accounting', 'IT', 'Machinery', 'Nursery'
  ];
  // which management area is the PIC for a given proposal category
  var CAT_TO_MGMT = {
    'Nursery': 'Nursery',
    'Plantation': 'Plantation / Operation',
    'Mill': 'Mill',
    'Account': 'Accounting',
    'Human Resource (HR)': 'HR & HQ',
    'HQ Support': 'HR & HQ',
    'Administration and Finance': 'Admin & Finance',
    'Information Technology (IT)': 'IT',
    'Machinery': 'Machinery'
  };
  var MAX_FILE = 3 * 1024 * 1024; // 3 MB per attachment

  // demo/test accounts — auto-created on load if missing. Set SEED_DEMO = false to stop.
  var SEED_DEMO = true;
  var DEMO_USERS = [
    { name: 'Test Admin',       email: 'admin@test.com',    pw: 'test1234', roles: ['admin'],       categories: [] },
    { name: 'Test Director',    email: 'director@test.com', pw: 'test1234', roles: ['director'],    categories: [] },
    { name: 'Test IT',          email: 'it@test.com',       pw: 'test1234', roles: ['management'],  categories: ['IT'] },
    { name: 'Test Nursery PIC', email: 'nursery@test.com',  pw: 'test1234', roles: ['management'],  categories: ['Nursery'] },
    { name: 'Test User',        email: 'user@test.com',     pw: 'test1234', roles: [],              categories: [] }
  ];

  // storage — Supabase, with in-memory fallback if the client didn't load
  var mem = { proposals: [], users: [], notifications: [] };
  function normalizeAuthUser(u) {
    if (!u) return u;
    if (u.created_at != null && u.createdAt == null) u.createdAt = u.created_at;
    if (!Array.isArray(u.roles)) u.roles = u.roles ? [].concat(u.roles) : [];
    if (!Array.isArray(u.categories)) u.categories = u.categories ? [].concat(u.categories) : [];
    delete u.pass_hash;
    return u;
  }
  async function loadAll() {
    if (!sb) return mem.proposals;
    try {
      var r = await sb.from('proposals').select('*').order('createdAt', { ascending: false });
      return (r && r.data) ? r.data : [];
    } catch (e) { return []; }
  }
  async function saveAll(list) {
    if (!sb) { mem.proposals = list; return true; }
    var ok = true;
    for (var i = 0; i < list.length; i++) {
      try {
        var r = await sb.from('proposals').upsert(list[i]);
        if (r && r.error) { ok = false; if (window.console) console.error('proposal save failed:', r.error.message || r.error); }
      } catch (e) { ok = false; if (window.console) console.error(e); }
    }
    return ok;
  }

  /* ---------- users, session & auth ---------- */
  var USERS_KEY = 'users';
  var SESSION_KEY = 'proposal_session'; // per-device, localStorage
  async function loadUsers() {
    if (!sb) return mem.users;
    try {
      var r = await sb.from('users').select('id,name,email,roles,categories,createdAt:created_at').order('created_at', { ascending: true });
      return (r && r.data) ? r.data.map(normalizeAuthUser) : [];
    } catch (e) { return []; }
  }
  async function saveUsers(list) {
    // only name/roles/categories are editable from the client; accounts are created via RPC
    if (!sb) { mem.users = list; return true; }
    try {
      for (var i = 0; i < list.length; i++) {
        var u = list[i];
        await sb.from('users').update({ name: u.name, roles: u.roles || [], categories: u.categories || [] }).eq('id', u.id);
      }
      return true;
    } catch (e) { return false; }
  }
  async function seedDemo() {
    if (!SEED_DEMO || !sb) return;
    for (var i = 0; i < DEMO_USERS.length; i++) {
      var d = DEMO_USERS[i];
      if (findUserByEmail(d.email)) continue;
      try {
        var r = await sb.rpc('app_signup', { p_name: d.name, p_email: d.email, p_password: d.pw });
        if (r.error || !r.data) continue;
        var u = normalizeAuthUser(r.data);
        // apply the intended roles/categories (signup only auto-sets the first account as admin)
        await sb.from('users').update({ roles: d.roles.slice(), categories: d.categories.slice() }).eq('id', u.id);
        u.roles = d.roles.slice(); u.categories = d.categories.slice();
        users.push(u);
      } catch (e) {}
    }
  }

  /* notifications */
  var NOTES_KEY = 'notifications';
  async function loadNotes() {
    if (!sb) return mem.notifications;
    try {
      var r = await sb.from('notifications').select('*').order('at', { ascending: false });
      return (r && r.data) ? r.data : [];
    } catch (e) { return []; }
  }
  async function saveNotes(list) {
    if (!sb) { mem.notifications = list; return true; }
    var ok = true;
    for (var i = 0; i < list.length; i++) {
      try {
        var r = await sb.from('notifications').upsert(list[i]);
        if (r && r.error) { ok = false; if (window.console) console.error('notification save failed:', r.error.message || r.error); }
      } catch (e) { ok = false; }
    }
    return ok;
  }
  async function addNote(n) {
    n.id = 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    n.readBy = [];
    notes.unshift(n);
    if (sb) { try { await sb.from('notifications').insert(n); } catch (e) {} }
    else { mem.notifications = notes; }
    renderAuth();
  }
  function relevantNotes(u) {
    if (!u) return [];
    return notes.filter(function (n) {
      if (n.forUserId) return n.forUserId === u.id;
      if (n.forCat) return hasCat(u, n.forCat); // e.g. the IT team
      if (n.forRole === 'management') return hasCat(u, CAT_TO_MGMT[n.category] || n.category) || hasCat(u, 'IT') || canDirector(u);
      return false;
    });
  }
  function unreadCount(u) {
    return relevantNotes(u).filter(function (n) { return (n.readBy || []).indexOf(u.id) === -1; }).length;
  }
  function setSession(user) {
    try {
      if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id, name: user.name, email: user.email,
        roles: user.roles || [], categories: user.categories || [], createdAt: user.createdAt
      }));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }
  function getSession() {
    try {
      var s = window.localStorage.getItem(SESSION_KEY);
      if (!s) return null;
      if (s.charAt(0) === '{') return JSON.parse(s);
      return { id: s }; // legacy sessions stored just the id
    } catch (e) { return null; }
  }
  function resolveSession() {
    var s = getSession();
    if (!s || !s.id) { currentUser = null; return; }
    var u = users.find(function (x) { return x.id === s.id; });
    if (u) { currentUser = u; setSession(u); return; }
    // keep you logged in from the saved copy even if the user list is slow/failed to load
    currentUser = normalizeAuthUser({ id: s.id, name: s.name, email: s.email, roles: s.roles, categories: s.categories, createdAt: s.createdAt });
    users.push(currentUser);
  }
  function randHex(n) {
    var a = new Uint8Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function simpleHash(str) {
    var h = 5381, h2 = 52711, i;
    for (i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    for (i = str.length - 1; i >= 0; i--) h2 = ((h2 << 5) + h2 + str.charCodeAt(i)) >>> 0;
    return ('00000000' + h.toString(16)).slice(-8) + ('00000000' + h2.toString(16)).slice(-8);
  }
  async function hashPw(pw, salt) {
    var msg = salt + '|' + pw;
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      try {
        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
        return 'sha256:' + Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      } catch (e) {}
    }
    return 'x:' + simpleHash(msg);
  }
  function findUserByEmail(email) {
    email = (email || '').trim().toLowerCase();
    return users.find(function (u) { return (u.email || '').toLowerCase() === email; }) || null;
  }

  /* permissions — users can hold more than one role */
  var ROLE_OPTS = [['management', 'Management Team'], ['director', 'Director'], ['admin', 'Administrator']];
  function getRoles(u) {
    if (!u) return [];
    if (Array.isArray(u.roles)) return u.roles;
    if (u.role === 'admin') return ['admin'];
    if (u.role === 'management') return ['management'];
    if (u.role === 'director') return ['director'];
    return []; // normal user
  }
  function hasRole(u, r) { return getRoles(u).indexOf(r) !== -1; }
  function isAdmin(u) { return hasRole(u, 'admin'); }
  function isManagement(u) { return hasRole(u, 'management'); }
  function isDirector(u) { return hasRole(u, 'director'); }
  function canDirector(u) { return isAdmin(u) || isDirector(u); }
  function canITReview(u) { return hasCat(u, 'IT'); } // Management with IT area, or Admin
  function normalizeUsers() {
    users.forEach(function (u) {
      if (!Array.isArray(u.roles)) u.roles = getRoles(u);
      delete u.role;
      if (u.categories && u.categories.indexOf('Director') !== -1) { // Director is a role now, not an area
        if (u.roles.indexOf('director') === -1) u.roles.push('director');
        u.categories = u.categories.filter(function (c) { return c !== 'Director'; });
      }
    });
  }
  function roleLabel(r) {
    if (r === 'admin') return 'Administrator';
    if (r === 'management') return 'Management Team';
    if (r === 'director') return 'Director';
    return 'Normal User';
  }
  function userRolesLabel(u) {
    var rs = getRoles(u);
    return rs.length ? rs.map(roleLabel).join(' · ') : 'Normal User';
  }
  function describeUser(u) {
    if (isAdmin(u)) return 'Full access, plus manage everyone’s roles and access.';
    var parts = [];
    if (isManagement(u)) parts.push('approve as PIC / IT for the areas assigned below');
    if (isDirector(u)) parts.push('give the Director sign-off on approvals');
    if (!parts.length) return 'Submit proposals, run technical review, build & test, and deploy.';
    return parts.join('; ') + '. Can also submit and run build & test.';
  }
  function catHas(u, c) {
    var cats = u && u.categories || [];
    return cats.indexOf('*') !== -1 || cats.indexOf(c) !== -1;
  }
  function hasCat(u, c) {
    if (isAdmin(u)) return true;
    if (!isManagement(u)) return false;
    return catHas(u, c);
  }
  function isManagementFor(u, category) { return hasCat(u, category); }

  // An approval gate needs three sign-offs: the category PIC, IT, and Director.
  function picCat(p) { return (p && (CAT_TO_MGMT[p.category] || p.category)) || ''; }
  function slotLabel(s, p) {
    if (s === 'it') return 'IT';
    if (s === 'director') return 'Director';
    var pc = picCat(p);
    return 'PIC' + (pc ? ' (' + pc + ')' : '');
  }
  function requiredSlots(p) {
    var pc = picCat(p);
    var out = [];
    if (pc && pc !== 'IT' && pc !== 'Director') out.push('pic');
    out.push('it', 'director');
    return out;
  }
  function eligibleSlots(u, p) {
    var out = [];
    if (!u) return out;
    if (p.submittedBy && p.submittedBy === u.id) return out; // can't approve your own proposal
    var pc = picCat(p);
    if (pc && pc !== 'IT' && pc !== 'Director' && hasCat(u, pc)) out.push('pic');
    if (hasCat(u, 'IT')) out.push('it');
    if (canDirector(u)) out.push('director');
    return out;
  }
  function canApproveGate(u, p) { return eligibleSlots(u, p).length > 0; }

  function actorTag() { return currentUser ? ' by ' + currentUser.name : ''; }
  function canMove(p, act) {
    if (!currentUser) return false;
    if (act === 'reject' || act === 'reopen') return canApproveGate(currentUser, p);
    var active = STAGES[p.done + 1];
    if ((act === 'adv' || act === 'back') && active && active.type === 'gate') {
      return canApproveGate(currentUser, p); // gate: PIC/IT/Director only, and not the proposer
    }
    // IT Review step and the Deploy & Go Live milestone — only the IT team (or admin)
    if ((act === 'adv' || act === 'back') && ((p.done + 1) === IT_STAGE || (active && active.type === 'milestone'))) {
      return canITReview(currentUser);
    }
    return true; // other non-gate steps: any logged-in user
  }
  function loginPrompt(msg) {
    return '<span class="hint">' + esc(msg) + '</span> <button class="btn btn-ghost btn-sm" data-auth="login">Log in</button>';
  }

  var data = [];
  var users = [];
  var notes = [];
  var currentUser = null;
  var query = '';
  var summarizing = {};
  var openTesters = {};
  var modalMode = null;   // 'sop' | 'form' | 'detail' | 'auth' | 'settings'
  var detailId = null;
  var sopIdx = null;
  var editingId = null;
  var listTab = 'all'; // 'all' | 'mine' (pending my approval)

  var el = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function fmt(ts) {
    return new Date(Number(ts)).toLocaleString('en-US', {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true
    });
  }
  var BUILD_DAYS = 90; // Build & Test countdown, starts when IT Review completes
  function buildStartTs(p) {
    if (p.buildStart) return p.buildStart;
    var h = p.history || [];
    for (var i = h.length - 1; i >= 0; i--) { if (/IT Review completed/i.test(h[i].label || '')) return h[i].at; }
    return h.length ? h[h.length - 1].at : (p.updatedAt || p.createdAt);
  }
  function buildInfo(p) {
    var start = Number(buildStartTs(p));
    if (!start || !isFinite(start)) return null;
    var deadline = start + BUILD_DAYS * 86400000;
    var days = Math.ceil((deadline - Date.now()) / 86400000);
    return { start: start, deadline: deadline, days: days, overdue: days < 0 };
  }
  function inBuildTest(p) { return p.status !== 'rejected' && (p.done + 1) === TESTING_STAGE; }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function statusOf(p) {
    if (p.status === 'rejected') return 'rejected';
    if (p.done >= STAGES.length - 1) return 'live';
    var active = p.done + 1;
    return STAGES[active].type === 'gate' ? 'gate' : 'active';
  }
  function statusPill(p) {
    var s = statusOf(p);
    if (s === 'live') return { label: 'Live', cls: 'pill-live' };
    if (s === 'rejected') return { label: 'Rejected', cls: 'pill-stop' };
    var active = STAGES[p.done + 1];
    if (s === 'gate') return { label: 'Pending ' + active.name, cls: 'pill-gate' };
    return { label: 'In ' + active.name, cls: 'pill-active' };
  }
  function submitter(p) { return p.email || p.proposer || p.submitter || 'Unknown'; }

  function toast(msg) {
    var t = el('toast');
    t.textContent = msg; t.className = 'toast show';
    clearTimeout(t._t); t._t = setTimeout(function () { t.className = 'toast'; }, 2600);
  }

  /* ---------- hero rail ---------- */
  function renderRail() {
    el('rail').innerHTML = STAGES.map(function (st, i) {
      return '<button class="rnode" data-sop="' + i + '">' +
        '<span class="ico">' + ICONS[st.icon] + '</span>' +
        '<span class="rname">' + esc(st.name) + '</span>' +
        '<span class="rteam">' + esc(st.team) + '</span>' +
      '</button>';
    }).join('');
  }

  /* ---------- list ---------- */
  function matches(p) {
    if (!query) return true;
    var hay = [p.title, p.proposer, p.email, p.objective, p.proposerDept].join(' ').toLowerCase();
    return hay.indexOf(query) !== -1;
  }
  function canApproveAny(u) { return isAdmin(u) || isManagement(u) || isDirector(u); }
  function needsMyApproval(p) {
    if (!currentUser || p.status === 'rejected') return false;
    var active = STAGES[p.done + 1];
    if (!active || active.type !== 'gate') return false;
    var g = (p.approvals && p.approvals[String(p.done + 1)]) || {};
    var req = requiredSlots(p);
    return eligibleSlots(currentUser, p).some(function (s) { return req.indexOf(s) !== -1 && !g[s]; });
  }
  function atITReview(p) { return p.status !== 'rejected' && (p.done + 1) === IT_STAGE; }
  function atDeploy(p) { return p.status !== 'rejected' && (p.done + 1) === (STAGES.length - 1); }
  function matchTab(p) {
    if (listTab === 'mine') return needsMyApproval(p);
    if (listTab === 'itreview') return atITReview(p);
    if (listTab === 'deploy') return atDeploy(p);
    return true;
  }
  function renderTabs() {
    var box = el('list-tabs'); if (!box) return;
    var u = currentUser;
    var showApprove = canApproveAny(u), showIT = canITReview(u);
    // reset to All if the current tab isn't available to this user
    if (listTab === 'mine' && !showApprove) listTab = 'all';
    if ((listTab === 'itreview' || listTab === 'deploy') && !showIT) listTab = 'all';
    if (!showApprove && !showIT) { box.innerHTML = ''; return; }
    function tab(key, label, count) {
      return '<button class="ltab' + (listTab === key ? ' on' : '') + '" data-ltab="' + key + '">' + esc(label) +
        (count ? ' <span class="ltab-n">' + count + '</span>' : '') + '</button>';
    }
    var out = tab('all', 'All proposals', 0);
    if (showApprove) out += tab('mine', 'Pending my approval', data.filter(needsMyApproval).length);
    if (showIT) {
      out += tab('itreview', 'IT review', data.filter(atITReview).length);
      out += tab('deploy', 'Deploy & go live', data.filter(atDeploy).length);
    }
    box.innerHTML = out;
  }
  function render() {
    el('count').textContent = data.length + ' total';
    renderTabs();
    var list = data.filter(function (p) { return matchTab(p) && matches(p); });
    var box = el('plist');
    if (!data.length) {
      box.innerHTML = '<div class="empty"><p>No proposals yet — click “+ New proposal” to add the first one.</p></div>';
      return;
    }
    if (!list.length) {
      var emptyMsg = 'Nothing matches your search.';
      if (listTab === 'mine') emptyMsg = 'Nothing is waiting on your approval right now.';
      else if (listTab === 'itreview') emptyMsg = 'No projects are in IT review right now.';
      else if (listTab === 'deploy') emptyMsg = 'No projects are waiting to deploy right now.';
      box.innerHTML = '<div class="empty"><p>' + emptyMsg + '</p></div>';
      return;
    }
    var header = '<div class="list-head"><span>Project</span><span class="lh-roi">ROI</span>' +
      '<span class="lh-status">Status</span><span class="lh-action">Action</span></div>';
    box.innerHTML = header + list.map(function (p) {
      var pill = statusPill(p);
      var roiCell = (p.roi === 0 || p.roi) ? '<span class="roi-tag">' + p.roi + '%</span>' : '<span class="muted">—</span>';
      var cdTag = '';
      if (inBuildTest(p)) {
        var bi = buildInfo(p);
        if (bi) cdTag = '<span class="cd-chip' + (bi.overdue ? ' cd-over' : '') + '">' +
          (bi.overdue ? 'Overdue ' + Math.abs(bi.days) + 'd' : bi.days + 'd left') + '</span>';
      }
      return '<div class="row">' +
        '<div class="cell-proj">' +
          '<p class="p-title">' + esc(p.title) + '</p>' +
          '<p class="p-sub">submitted by <b>' + esc(submitter(p)) + '</b> &middot; ' + fmt(p.createdAt) + '</p>' +
        '</div>' +
        '<div class="cell-roi">' + roiCell + '</div>' +
        '<div class="cell-status"><span class="pill ' + pill.cls + '"><span class="dot"></span>' + esc(pill.label) + '</span>' + cdTag + '</div>' +
        '<div class="cell-action"><button class="viewbtn" data-view="' + p.id + '">View</button></div>' +
      '</div>';
    }).join('');
  }

  /* ---------- modal plumbing ---------- */
  function openModal(html, cls) {
    var m = el('modal');
    m.className = 'modal' + (cls ? ' ' + cls : '');
    m.innerHTML = html;
    el('backdrop').className = 'backdrop show' + (cls === 'auth' ? ' light' : '');
  }
  function closeModal() {
    if (gated) return; // login card can't be dismissed
    el('backdrop').className = 'backdrop';
    el('modal').innerHTML = '';
    modalMode = null; detailId = null; sopIdx = null;
  }

  /* ---------- SOP modal ---------- */
  function showSop(i) {
    modalMode = 'sop'; sopIdx = i;
    var st = STAGES[i];
    var items = st.sop.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('');
    openModal(
      '<div class="modal-head">' +
        '<div><p class="sop-eyebrow">Step ' + pad2(i + 1) + ' · ' + esc(st.team) + '</p>' +
        '<div class="sop-title"><span class="ico">' + ICONS[st.icon] + '</span><h2>' + esc(st.name) + '</h2></div></div>' +
        '<button class="xbtn" data-close="1">×</button>' +
      '</div>' +
      '<div class="modal-body">' +
        '<p class="sop-sub">Standard operating procedure</p>' +
        '<ol class="sop-list">' + items + '</ol>' +
      '</div>');
  }

  /* ---------- new proposal form ---------- */
  function showForm(edit) {
    modalMode = 'form';
    editingId = edit ? edit.id : null;
    var isEdit = !!edit;
    var cats = CATEGORIES.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('');
    openModal(
      '<div class="modal-head"><h2 class="d-title" style="margin:0">' + (isEdit ? 'Edit proposal' : 'New proposal') + '</h2>' +
      '<button class="xbtn" data-close="1">×</button></div>' +
      '<div class="modal-body">' +
        '<div class="grid2">' +
          fld('f-proposer', 'Proposer', 'e.g. Aisha Tan', true, 60) +
          fld('f-email', 'Your email', 'e.g. name@company.com', false, 80, 'email') +
        '</div>' +
        fld('f-title', 'Project title', 'e.g. Leave request portal', true, 80) +
        '<div class="field"><label for="f-category">Category of proposal <span class="req">*</span></label>' +
          '<select id="f-category" style="max-width:340px"><option value="" selected disabled>Select a category…</option>' + cats + '</select>' +
          '<div class="err" id="e-f-category"></div></div>' +
        ta('f-objective', 'Objective', 'What is this project meant to achieve?', true, 2, 500) +
        ta('f-problem', 'Current issue / problem faced', 'What isn’t working today? Who does it affect, and how?', false, 3, 800) +
        ta('f-tools', 'Planned tools / tech', 'Tools, platforms or frameworks you plan to use (e.g. Google Sheets, Power Automate, a web app). Helps IT review feasibility.', false, 2, 500) +
        '<p class="sec-l" style="margin-top:4px">Cost &amp; return</p>' +
        '<div class="grid2">' +
          fldNum('f-investment', 'Expense (RM) per annum', 'e.g. 12000 — subscription, licences') +
          fldNum('f-returns', 'Cost Savings / Benefit (RM) per annum', 'e.g. 30000 — annual cost saving') +
        '</div>' +
        '<div class="field"><label for="f-roi">ROI (auto-calculated)</label>' +
          '<input id="f-roi" type="text" value="—" readonly style="max-width:220px;background:#f4f5f8;font-weight:700" />' +
          '<div class="hint">ROI = (Cost Savings − Expense) ÷ Expense × 100%.</div></div>' +
        (isEdit ? '' :
        '<div class="field"><label>Attachments <span class="hint" style="font-weight:500">(optional — up to 2 files or images, max 3 MB each)</span></label>' +
          '<input id="f-file1" type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" style="margin-bottom:8px" />' +
          '<input id="f-file2" type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" /></div>') +
        '<div class="actions-row" style="margin-top:8px">' +
          '<button class="btn btn-primary" id="submit-btn">' + (isEdit ? 'Save changes' : 'Submit proposal') + '</button>' +
          '<button class="btn btn-ghost" data-close="1">Cancel</button>' +
        '</div>' +
      '</div>');
    el('submit-btn').onclick = submitProposal;
    var recompute = function () {
      var roi = calcRoi(el('f-investment').value, el('f-returns').value);
      el('f-roi').value = roi === null ? '—' : roi + '%';
    };
    el('f-investment').addEventListener('input', recompute);
    el('f-returns').addEventListener('input', recompute);
    if (edit) {
      el('f-proposer').value = edit.proposer || '';
      el('f-email').value = edit.email || '';
      el('f-title').value = edit.title || '';
      el('f-category').value = edit.category || '';
      el('f-objective').value = edit.objective || '';
      el('f-problem').value = edit.problem || '';
      el('f-tools').value = edit.tools || '';
      el('f-investment').value = (edit.investment != null ? edit.investment : '');
      el('f-returns').value = (edit.returns != null ? edit.returns : '');
      recompute();
    } else if (currentUser) {
      el('f-proposer').value = currentUser.name || '';
      el('f-email').value = currentUser.email || '';
    }
  }
  function canEditProposal(p) {
    return currentUser && (isAdmin(currentUser) || (p.submittedBy && p.submittedBy === currentUser.id));
  }
  function fld(id, label, ph, req, max, type) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + (req ? ' <span class="req">*</span>' : '') + '</label>' +
      '<input id="' + id + '" type="' + (type || 'text') + '" placeholder="' + esc(ph) + '" maxlength="' + max + '" />' +
      (req ? '<div class="err" id="e-' + id + '"></div>' : '') + '</div>';
  }
  function ta(id, label, ph, req, rows, max) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + (req ? ' <span class="req">*</span>' : '') + '</label>' +
      '<textarea id="' + id + '" rows="' + rows + '" placeholder="' + esc(ph) + '" maxlength="' + max + '"></textarea>' +
      (req ? '<div class="err" id="e-' + id + '"></div>' : '') + '</div>';
  }
  function fldNum(id, label, ph) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<input id="' + id + '" type="number" min="0" step="0.01" inputmode="decimal" placeholder="' + esc(ph) + '" /></div>';
  }
  function calcRoi(inv, ret) {
    inv = parseFloat(inv); ret = parseFloat(ret);
    if (!isFinite(inv) || inv <= 0 || !isFinite(ret)) return null;
    return Math.round(((ret - inv) / inv) * 1000) / 10; // ROI % = (cost savings − expense) ÷ expense, 1 decimal
  }
  function readFile(input) {
    return new Promise(function (resolve, reject) {
      var f = input && input.files && input.files[0];
      if (!f) return resolve(null);
      if (f.size > MAX_FILE) return reject(new Error('“' + f.name + '” is over 3 MB — please attach a smaller file.'));
      var r = new FileReader();
      r.onload = function () { resolve({ name: f.name, type: f.type, dataUrl: r.result }); };
      r.onerror = function () { reject(new Error('Could not read “' + f.name + '”.')); };
      r.readAsDataURL(f);
    });
  }
  async function submitProposal() {
    var proposer = el('f-proposer').value.trim();
    var title = el('f-title').value.trim();
    var objective = el('f-objective').value.trim();
    var category = el('f-category').value;
    var ok = true;
    el('e-f-proposer').textContent = proposer ? '' : (ok = false, 'Please enter the proposer name.');
    el('e-f-title').textContent = title ? '' : (ok = false, 'Please give the project a title.');
    el('e-f-category').textContent = category ? '' : (ok = false, 'Please choose a category.');
    el('e-f-objective').textContent = objective ? '' : (ok = false, 'Please state the objective.');
    if (!ok) return;

    var btn = el('submit-btn'); btn.disabled = true; btn.textContent = 'Saving…';
    var investment = parseFloat(el('f-investment').value);
    var returns = parseFloat(el('f-returns').value);

    // ---- edit an existing proposal (keeps its stage, history, attachments) ----
    if (editingId) {
      var target = data.find(function (x) { return x.id === editingId; });
      editingId = null;
      if (target) {
        target.title = title; target.proposer = proposer; target.email = el('f-email').value.trim();
        target.category = category; target.objective = objective;
        target.problem = el('f-problem').value.trim(); target.tools = el('f-tools').value.trim();
        target.investment = isFinite(investment) ? investment : null;
        target.returns = isFinite(returns) ? returns : null;
        target.roi = calcRoi(el('f-investment').value, el('f-returns').value);
        target.updatedAt = Date.now();
        if (!target.history) target.history = [];
        target.history.push({ at: Date.now(), label: 'Proposal edited' + actorTag(), note: '' });
        var oke = sb ? !(await sb.from('proposals').upsert(target)).error : (await saveAll(data));
        closeModal(); render();
        toast(oke ? 'Proposal updated' : 'Saved, but the server update failed — check your connection');
        return;
      }
    }

    var files = [];
    try {
      var f1 = await readFile(el('f-file1'));
      var f2 = await readFile(el('f-file2'));
      if (f1) files.push(f1);
      if (f2) files.push(f2);
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Submit proposal';
      toast(e && e.message ? e.message : 'Could not read the attachment');
      return;
    }

    var p = {
      id: uid(), title: title,
      proposer: proposer,
      email: el('f-email').value.trim(),
      category: category,
      objective: objective,
      problem: el('f-problem').value.trim(),
      tools: el('f-tools').value.trim(),
      investment: isFinite(investment) ? investment : null,
      returns: isFinite(returns) ? returns : null,
      roi: calcRoi(el('f-investment').value, el('f-returns').value),
      attachments: files,
      submittedBy: currentUser ? currentUser.id : null,
      done: 0, status: 'active',
      createdAt: Date.now(), updatedAt: Date.now(),
      evaluations: [],
      history: [{ at: Date.now(), label: 'Proposal submitted', note: '' }]
    };
    data.unshift(p);
    var ok = sb ? !(await sb.from('proposals').upsert(p)).error : (await saveAll(data));
    await addNote({
      kind: 'submitted', proposalId: p.id, proposalTitle: p.title, category: p.category,
      forRole: 'management', message: 'New proposal awaiting approval — arrange a meeting', at: Date.now()
    });
    query = ''; el('search').value = '';
    closeModal();
    render();
    toast(ok ? 'Proposal submitted — Management notified' : 'Submitted, but saving to the server failed — check your connection');
  }

  /* ---------- detail modal ---------- */
  function progressRail(p) {
    var stopped = p.status === 'rejected';
    var stopAt = stopped ? p.done + 1 : -1;
    return '<div class="prail">' + STAGES.map(function (st, i) {
      var cls = 'pn', inner = (i + 1);
      var isGate = st.type === 'gate';
      if (i <= p.done) {
        cls += ' done';
        if (i === STAGES.length - 1) cls += ' livedone';
        inner = '&#10003;';
      } else if (i === stopAt) {
        cls += ' stopped'; inner = '&#10005;';
      } else if (i === p.done + 1 && !stopped) {
        cls += ' active' + (isGate ? ' gate-active' : '');
      }
      var dotCls = 'pdot' + (isGate ? ' gate' : '');
      return '<div class="' + cls + '"><div class="seg"></div>' +
        '<div class="' + dotCls + '"><span>' + inner + '</span></div>' +
        '<div class="plabel">' + esc(st.name) + '</div></div>';
    }).join('') + '</div>';
  }
  function fieldBlk(label, val) {
    if (!val) return '';
    return '<p class="sec-l">' + label + '</p><p class="desc">' + esc(val) + '</p>';
  }
  function backBtn(p) {
    return (p.done > 0 && canMove(p, 'back'))
      ? '<button class="btn btn-ghost btn-sm" data-act="back" data-id="' + p.id + '">Send back a stage</button>' : '';
  }
  function actionsHTML(p) {
    if (!currentUser) return '<div class="actions-row">' + loginPrompt('Log in to move this proposal.') + '</div>';
    var cat = p.category || 'this category';
    if (p.status === 'rejected') {
      if (!canApproveGate(currentUser, p)) {
        return '<div class="actions-row"><span class="hint">Rejected. Only an approver for ' + esc(cat) + ' (PIC, IT or Director) can reopen it.</span></div>';
      }
      return '<div class="actions-row"><button class="btn btn-ghost btn-sm" data-act="reopen" data-id="' + p.id + '">Reopen proposal</button></div>';
    }
    if (p.done >= STAGES.length - 1) {
      return '<div class="actions-row"><span class="hint">This system is live. Track ongoing work in the maintenance phase.</span></div>';
    }
    var active = STAGES[p.done + 1];
    var nextName = STAGES[p.done + 2] ? STAGES[p.done + 2].name : 'next';
    if (active.type === 'gate') return gatePanelHTML(p);
    if (!canMove(p, 'adv')) {
      var who = ((p.done + 1) === IT_STAGE || active.type === 'milestone') ? 'the IT team' : 'the responsible team';
      var verb = active.type === 'milestone' ? 'deploy &amp; go live' : 'move this to the next stage';
      return '<div class="actions-row"><span class="hint">Awaiting ' + esc(active.name) + ' &mdash; only ' + who + ' can ' + verb + '.</span></div>';
    }
    var html = '';
    if (active.type === 'milestone') {
      html += '<button class="btn btn-primary btn-sm" data-act="adv" data-id="' + p.id + '">Mark as live</button>';
    } else {
      html += '<button class="btn btn-primary btn-sm" data-act="adv" data-id="' + p.id + '">Complete &rarr; ' + esc(nextName) + '</button>';
    }
    return '<div class="actions-row">' + html + backBtn(p) + '</div>';
  }
  function gatePanelHTML(p) {
    var active = STAGES[p.done + 1];
    var gate = String(p.done + 1);
    var req = requiredSlots(p);
    var g = (p.approvals && p.approvals[gate]) || {};
    var doneCount = req.filter(function (s) { return g[s]; }).length;
    var pctW = req.length ? Math.round(doneCount / req.length * 100) : 0;
    var nodes = req.map(function (s) {
      var a = g[s]; var done = !!a;
      return '<div class="apv-node' + (done ? ' done' : '') + '">' +
        '<div class="apv-ic">' + (done ? '&#10003;' : '') + '</div>' +
        '<div class="apv-lbl">' + esc(slotLabel(s, p)) + '</div>' +
        '<div class="apv-who">' + (done ? esc(a.by) : 'Pending') + '</div></div>';
    }).join('');
    var html = '<div class="apv-prog">' +
      '<div class="apv-top"><span class="apv-title">' + esc(active.name) + ' sign-off</span>' +
      '<span class="apv-count">' + doneCount + ' / ' + req.length + ' approved</span></div>' +
      '<div class="apv-track"><span class="apv-fill" style="width:' + pctW + '%"></span></div>' +
      '<div class="apv-nodes">' + nodes + '</div></div>';
    var isSubmitter = p.submittedBy && currentUser && p.submittedBy === currentUser.id;
    if (canApproveGate(currentUser, p)) {
      var mine = eligibleSlots(currentUser, p).filter(function (s) { return req.indexOf(s) !== -1 && !g[s]; });
      var btns = mine.length
        ? '<button class="btn btn-primary btn-sm" data-act="approve" data-id="' + p.id + '">Approve as ' + mine.map(function (s) { return esc(slotLabel(s, p)); }).join(' + ') + '</button>'
        : '<span class="hint">You’ve approved &mdash; waiting on the remaining sign-off.</span>';
      html += '<div class="actions-row">' + btns +
        '<button class="btn btn-stop btn-sm" data-act="reject" data-id="' + p.id + '">Reject</button>' + backBtn(p) + '</div>';
    } else if (isSubmitter) {
      html += '<div class="actions-row"><span class="hint">You submitted this proposal, so you can’t approve it &mdash; waiting on ' + req.map(function (s) { return esc(slotLabel(s, p)); }).join(', ') + '.</span></div>';
    } else {
      html += '<div class="actions-row"><span class="hint">Awaiting ' + esc(active.name) + ' &mdash; needs sign-off from ' + req.map(function (s) { return esc(slotLabel(s, p)); }).join(', ') + '.</span></div>';
    }
    return html;
  }
  function pct(n, total) { return total ? Math.round(n / total * 100) : 0; }
  function ratingTag(v) {
    var m = { good: ['r-good', 'Good'], okay: ['r-okay', 'Okay'], poor: ['r-poor', 'Bad'] };
    var x = m[v] || m.okay;
    return '<span class="rtag ' + x[0] + '">' + x[1] + '</span>';
  }
  function evalStatsHTML(p) {
    var evs = p.evaluations || [];
    if (!evs.length) return '';
    var rows = EVAL_CRITERIA.map(function (c, i) {
      var g = 0, o = 0, b = 0;
      evs.forEach(function (ev) {
        var r = ev.ratings && ev.ratings[i];
        if (r === 'good') g++; else if (r === 'okay') o++; else if (r === 'poor') b++;
      });
      var total = g + o + b;
      var gp = pct(g, total), op = pct(o, total), bp = pct(b, total);
      var nums = total ? (gp + '% good &middot; ' + op + '% okay &middot; ' + bp + '% bad') : 'no ratings yet';
      return '<div class="pct-row">' +
        '<div class="pct-top"><span class="ev-cn">' + esc(c) + '</span><span class="pct-nums">' + nums + '</span></div>' +
        '<div class="pct-bar"><span class="seg-good" style="width:' + gp + '%"></span>' +
          '<span class="seg-okay" style="width:' + op + '%"></span>' +
          '<span class="seg-bad" style="width:' + bp + '%"></span></div></div>';
    }).join('');
    return '<p class="sec-l">Ratings summary (' + evs.length + ' tester' + (evs.length === 1 ? '' : 's') + ')</p>' + rows;
  }
  function evalTestersHTML(p) {
    var evs = p.evaluations || [];
    if (!evs.length) return '';
    var items = evs.map(function (ev, idx) {
      var key = p.id + ':' + idx;
      var open = !!openTesters[key];
      var name = ev.tester || ('Tester ' + (idx + 1));
      var detail = '';
      if (open) {
        var chips = EVAL_CRITERIA.map(function (c, i) {
          var r = ev.ratings && ev.ratings[i];
          if (!r) return '';
          return '<div class="ev-crit"><span class="ev-cn">' + esc(c) + '</span>' + ratingTag(r) + '</div>';
        }).join('');
        detail = '<div class="tester-detail"><span class="ev-when">' + fmt(ev.at) + '</span>' +
          (chips ? '<div class="ev-crits" style="margin-top:8px">' + chips + '</div>' : '') +
          (ev.comment ? '<p class="ev-comment">' + esc(ev.comment) + '</p>' : '<p class="hint" style="margin-top:8px">No written comment.</p>') +
          '</div>';
      }
      return '<div class="tester' + (open ? ' open' : '') + '">' +
        '<button class="tester-name" data-act="tester" data-id="' + p.id + '" data-idx="' + idx + '">' +
        '<span class="tcaret">' + (open ? '&#9662;' : '&#9656;') + '</span>' + esc(name) + '</button>' +
        detail + '</div>';
    }).join('');
    return '<p class="sec-l">Testers &mdash; click a name to view their result</p>' +
      '<div class="tester-list">' + items + '</div>';
  }
  function evalSummaryHTML(p) {
    var evs = p.evaluations || [];
    if (!evs.length) return '';
    var busy = summarizing[p.id];
    var s = p.evalSummary;
    var stale = s && s.count !== evs.length;
    var out = '';
    if (s) {
      out += '<div class="ev-summary"><p class="ev-sum-head">AI summary <span class="ev-sum-meta">based on ' +
        s.count + ' evaluation' + (s.count === 1 ? '' : 's') + '</span></p>' +
        '<div class="ev-sum-body">' + esc(s.text).replace(/\n/g, '<br>') + '</div>' +
        (stale ? '<p class="ev-sum-stale">' + (evs.length - s.count) + ' new since this summary &mdash; regenerate to include them.</p>' : '') +
        '</div>';
    }
    var label = busy ? 'Summarizing&hellip;' : (s ? 'Regenerate summary' : 'Summarize all feedback');
    out += '<button class="btn btn-ghost btn-sm" data-act="summ" data-id="' + p.id + '"' + (busy ? ' disabled' : '') + '>' + label + '</button>';
    return out;
  }
  function evalFormHTML(p) {
    var crits = EVAL_CRITERIA.map(function (c, i) {
      var opts = RATINGS.map(function (r) {
        var id = 'ev-' + p.id + '-' + i + '-' + r.v;
        return '<label class="ropt ropt-' + r.v + '" for="' + id + '">' +
          '<input type="radio" name="ev-' + p.id + '-' + i + '" id="' + id + '" value="' + r.v + '" />' + r.label + '</label>';
      }).join('');
      return '<div class="ev-row"><span class="ev-cn">' + esc(c) + '</span><span class="ev-opts">' + opts + '</span></div>';
    }).join('');
    return '<div class="ev-form">' +
      '<div class="field"><label for="ev-name-' + p.id + '">Your name (optional)</label>' +
      '<input id="ev-name-' + p.id + '" type="text" placeholder="e.g. tester from HR" maxlength="60" /></div>' +
      '<div class="ev-grid">' + crits + '</div>' +
      '<div class="field" style="margin:12px 0"><label for="ev-comment-' + p.id + '">Feedback / comments</label>' +
      '<textarea id="ev-comment-' + p.id + '" rows="3" placeholder="What worked well? What needs fixing?" maxlength="600"></textarea></div>' +
      '<button class="btn btn-primary btn-sm" data-act="eval" data-id="' + p.id + '">Submit evaluation</button></div>';
  }
  function evalSection(p) {
    var isTesting = (p.status !== 'rejected') && (p.done + 1 === TESTING_STAGE);
    var hasEvals = (p.evaluations || []).length > 0;
    if (!isTesting && !hasEvals) return '';
    var body = '<p class="sec-l">User testing &amp; evaluation</p>';
    if (isTesting) {
      if (currentUser) {
        body += '<p class="hint" style="margin-bottom:6px">This system is in build &amp; test. Testers rate it below and leave feedback.</p>' + evalFormHTML(p);
      } else {
        body += '<p class="hint" style="margin-bottom:6px">This system is in build &amp; test. ' + loginPrompt('Log in to rate it and leave feedback.') + '</p>';
      }
    }
    body += evalStatsHTML(p) + evalSummaryHTML(p) + evalTestersHTML(p);
    return '<div class="ev-wrap">' + body + '</div>';
  }
  function renderAtts(atts) {
    if (!atts || !atts.length) return '';
    return '<div class="att-list">' + atts.map(function (a) {
      var isImg = a.type && a.type.indexOf('image/') === 0;
      if (isImg) {
        return '<a class="att" href="' + esc(a.dataUrl) + '" target="_blank" rel="noopener">' +
          '<img src="' + esc(a.dataUrl) + '" alt="' + esc(a.name) + '" /><span>' + esc(a.name) + '</span></a>';
      }
      return '<a class="att-file" href="' + esc(a.dataUrl) + '" target="_blank" rel="noopener"' +
        (a.link ? '' : ' download="' + esc(a.name) + '"') + '>' + esc(a.name || 'Attachment') + '</a>';
    }).join('') + '</div>';
  }
  function itReviewSection(p) {
    var isIT = (p.status !== 'rejected') && (p.done + 1 === IT_STAGE);
    var reviews = p.itReviews || [];
    if (!isIT && !reviews.length) return '';
    var body = '<p class="sec-l">IT technical review</p>';
    if (reviews.length) {
      body += reviews.slice().reverse().map(function (r) {
        return '<div class="itr-card"><div class="itr-top"><b>' + esc(r.by || 'IT') + '</b>' +
          '<span class="ev-when">' + fmt(r.at) + '</span></div>' +
          (r.comment ? '<p class="itr-comment">' + esc(r.comment) + '</p>' : '') +
          renderAtts(r.attachments) + '</div>';
      }).join('');
    }
    if (isIT) {
      if (canITReview(currentUser)) {
        body += '<div class="itr-form">' +
          '<div class="field"><label for="itr-comment-' + p.id + '">Suggestion / comment</label>' +
          '<textarea id="itr-comment-' + p.id + '" rows="3" placeholder="Are the planned tools acceptable and supportable? Framework advice, risks, requirements…" maxlength="800"></textarea></div>' +
          '<div class="field"><label>Attach files <span class="hint" style="font-weight:500">(optional — up to 2, max 3 MB each; .md and other files welcome)</span></label>' +
          '<input id="itr-file1-' + p.id + '" type="file" accept=".md,.markdown,.txt,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" style="margin-bottom:8px" />' +
          '<input id="itr-file2-' + p.id + '" type="file" accept=".md,.markdown,.txt,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" /></div>' +
          '<button class="btn btn-primary btn-sm" data-act="itreview" data-id="' + p.id + '">Submit IT review</button></div>';
      } else {
        body += '<p class="hint">The IT team will add their review and any files here.</p>';
      }
    }
    return '<div class="ev-wrap">' + body + '</div>';
  }

  /* ---------- feasibility feedback (proposer, at Build & Test) ---------- */
  function safeUrl(u) {
    u = (u || '').trim();
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : 'https://' + u; // force a safe http(s) scheme
  }
  function yesNo(v) {
    if (v === 'yes') return '<span class="fz-yes">Yes</span>';
    if (v === 'no') return '<span class="fz-no">No</span>';
    return '<span class="fz-na">—</span>';
  }
  function feasibilityView(f) {
    var link = f.systemLink
      ? '<p style="margin:0 0 12px"><a class="btn btn-primary btn-sm" href="' + esc(safeUrl(f.systemLink)) + '" target="_blank" rel="noopener">Open the system to review &#8599;</a></p>'
      : '';
    var metrics = FEAS_METRICS.map(function (m) {
      return f[m.k] ? '<div class="fz-row"><span class="fz-l">' + esc(m.label) + '</span><span class="fz-v">' + esc(f[m.k]) + '</span></div>' : '';
    }).join('');
    var checks = FEAS_CHECKS.map(function (c) {
      return '<div class="fz-row"><span class="fz-l">' + esc(c.label) + '</span>' + yesNo(f[c.k]) + '</div>';
    }).join('');
    var text = (f.issues ? '<p class="sec-l" style="margin-top:12px">Remaining issues / risks</p><p class="desc">' + esc(f.issues) + '</p>' : '') +
      (f.comment ? '<p class="sec-l">Comments</p><p class="desc">' + esc(f.comment) + '</p>' : '');
    return '<div class="fz-card">' + link + metrics + checks + text +
      '<div class="fz-by">Submitted by ' + esc(f.by || '') + ' &middot; ' + fmt(f.at) + '</div></div>';
  }
  function feasibilityForm(p, f) {
    f = f || {};
    var metrics = FEAS_METRICS.map(function (m) {
      return '<div class="field"><label for="fz-' + m.k + '-' + p.id + '">' + esc(m.label) + '</label>' +
        '<input id="fz-' + m.k + '-' + p.id + '" type="text" maxlength="120" placeholder="' + esc(m.ph || '') + '" value="' + esc(f[m.k] || '') + '" /></div>';
    }).join('');
    var checks = FEAS_CHECKS.map(function (c) {
      var opts = ['yes', 'no'].map(function (v) {
        var id = 'fz-' + c.k + '-' + v + '-' + p.id;
        return '<label class="ropt ropt-' + (v === 'yes' ? 'good' : 'poor') + '" for="' + id + '">' +
          '<input type="radio" name="fz-' + c.k + '-' + p.id + '" id="' + id + '" value="' + v + '"' + (f[c.k] === v ? ' checked' : '') + ' />' +
          (v === 'yes' ? 'Yes' : 'No') + '</label>';
      }).join('');
      return '<div class="ev-row"><span class="ev-cn">' + esc(c.label) + '</span><span class="ev-opts">' + opts + '</span></div>';
    }).join('');
    return '<div class="fz-form">' +
      '<div class="field"><label for="fz-link-' + p.id + '">System link (URL) <span class="hint" style="font-weight:500">— reviewers open this at final approval</span></label>' +
      '<input id="fz-link-' + p.id + '" type="url" placeholder="https://your-system-link…" value="' + esc(f.systemLink || '') + '" /></div>' +
      '<div class="grid2">' + metrics + '</div>' +
      '<div class="ev-grid">' + checks + '</div>' +
      '<div class="field" style="margin-top:12px"><label for="fz-issues-' + p.id + '">Remaining issues or risks</label>' +
      '<textarea id="fz-issues-' + p.id + '" rows="2" maxlength="600" placeholder="Anything still not working, or risks for go-live">' + esc(f.issues || '') + '</textarea></div>' +
      '<div class="field"><label for="fz-comment-' + p.id + '">Other comments</label>' +
      '<textarea id="fz-comment-' + p.id + '" rows="2" maxlength="600">' + esc(f.comment || '') + '</textarea></div>' +
      '<button class="btn btn-primary btn-sm" data-act="feas" data-id="' + p.id + '">' + (p.feasibility ? 'Update feasibility feedback' : 'Submit feasibility feedback') + '</button></div>';
  }
  function canFeasibility(p) {
    return currentUser && (isAdmin(currentUser) || (p.submittedBy && p.submittedBy === currentUser.id));
  }
  function feasibilitySection(p) {
    var isBT = (p.status !== 'rejected') && (p.done + 1 === TESTING_STAGE);
    var f = p.feasibility;
    if (!isBT && !f) return '';
    var body = '';
    if (isBT) {
      var bi = buildInfo(p);
      if (bi) body += '<div class="cd-box' + (bi.overdue ? ' cd-over' : '') + '">&#9203; <b>Build &amp; test deadline</b> &middot; ' + fmt(bi.deadline) +
        ' &mdash; ' + (bi.overdue
          ? 'overdue by ' + Math.abs(bi.days) + ' day' + (Math.abs(bi.days) === 1 ? '' : 's')
          : bi.days + ' day' + (bi.days === 1 ? '' : 's') + ' left') +
        ' <span class="cd-sub">(90 days from IT Review)</span></div>';
    }
    body += '<p class="sec-l">Feasibility feedback</p>';
    if (isBT) body += '<p class="hint" style="margin-bottom:8px">Filled in by the proposer after building &amp; testing, for Management to review before final approval.</p>';
    if (f) body += feasibilityView(f);
    if (isBT) {
      if (canFeasibility(p)) body += feasibilityForm(p, f);
      else if (!f) body += '<p class="hint">The proposer will complete the feasibility feedback here.</p>';
    }
    return '<div class="ev-wrap">' + body + '</div>';
  }
  function showDetail(id) {
    var p = data.find(function (x) { return x.id === id; });
    if (!p) return;
    modalMode = 'detail'; detailId = id;
    var pill = statusPill(p);
    var rows = (p.history || []).slice().reverse().map(function (h) {
      return '<li><span class="h-when">' + fmt(h.at) + '</span><span class="h-what grow2"><b>' +
        esc(h.label) + '</b>' + (h.note ? ' &middot; <span class="h-note">' + esc(h.note) + '</span>' : '') + '</span></li>';
    }).join('');

    var money = function (v) { return (v === 0 || v) ? 'RM ' + Number(v).toLocaleString('en-US') : '—'; };
    var cost = '';
    if (p.investment != null || p.returns != null || p.roi != null) {
      cost = '<p class="sec-l">Expense &amp; savings</p><p class="desc">' +
        'Expense: <b>' + money(p.investment) + '</b><br>' +
        'Cost savings / benefit: <b>' + money(p.returns) + '</b><br>' +
        'ROI: <b>' + (p.roi == null ? '—' : p.roi + '%') + '</b></p>';
    }

    var atts = p.attachments || (p.attachment ? [{ name: p.attachment, type: '', dataUrl: p.attachment, link: true }] : []);
    var attach = '';
    if (atts.length) {
      attach = '<p class="sec-l">Attachments</p><div class="att-list">' + atts.map(function (a) {
        var isImg = a.type && a.type.indexOf('image/') === 0;
        if (isImg) {
          return '<a class="att" href="' + esc(a.dataUrl) + '" target="_blank" rel="noopener">' +
            '<img src="' + esc(a.dataUrl) + '" alt="' + esc(a.name) + '" />' +
            '<span>' + esc(a.name) + '</span></a>';
        }
        return '<a class="att-file" href="' + esc(a.dataUrl) + '" target="_blank" rel="noopener"' +
          (a.link ? '' : ' download="' + esc(a.name) + '"') + '>' + esc(a.name || 'Attachment') + '</a>';
      }).join('') + '</div>';
    }

    var info =
      fieldBlk('Departments involved', p.deptInvolved) +
      fieldBlk('Objective', p.objective) +
      fieldBlk('Current issue / problem', p.problem) +
      fieldBlk('Planned tools / tech', p.tools) +
      fieldBlk('Content of the system', p.content) +
      fieldBlk('Outcome hoped for', p.outcome) +
      fieldBlk('Expected benefit', p.benefit) +
      cost +
      attach +
      (p.desc ? '<p class="sec-l">Details</p><p class="desc">' + esc(p.desc) + '</p>' : '');

    openModal(
      '<div class="modal-head"><div>' +
        '<h2 class="d-title">' + esc(p.title) + '</h2>' +
        '<span class="pill ' + pill.cls + '"><span class="dot"></span>' + esc(pill.label) + '</span>' +
      '</div><button class="xbtn" data-close="1">×</button></div>' +
      '<div class="modal-body">' +
        '<p class="d-meta">submitted by <b>' + esc(submitter(p)) + '</b> &middot; ' + fmt(p.createdAt) +
          (p.category ? ' &middot; ' + esc(p.category) : '') + '</p>' +
        (canEditProposal(p) ? '<div class="actions-row" style="margin:0 0 10px"><button class="btn btn-ghost btn-sm" data-act="editprop" data-id="' + p.id + '">✎ Edit proposal</button></div>' : '') +
        progressRail(p) +
        info +
        itReviewSection(p) +
        feasibilitySection(p) +
        '<p class="sec-l">Move this proposal</p>' +
        '<div class="note-in"><input type="text" placeholder="Add a note — required if rejecting or sending back" id="note-' + p.id + '" maxlength="160" /></div>' +
        actionsHTML(p) +
        '<p class="sec-l">Activity</p><ul class="history">' + rows + '</ul>' +
      '</div>', 'wide');
  }
  function refreshDetail() { if (modalMode === 'detail' && detailId) showDetail(detailId); }

  /* ---------- mutations ---------- */
  async function commit() { await saveAll(data); render(); refreshDetail(); }
  function logNote(p) {
    var inp = el('note-' + p.id);
    return inp && inp.value.trim() ? inp.value.trim() : '';
  }
  function denied() { toast('You don’t have permission for this action'); }
  async function advance(p) {
    if (!canMove(p, 'adv')) return denied();
    var note = logNote(p);
    var wasGate = STAGES[p.done + 1] && STAGES[p.done + 1].type === 'gate';
    p.done += 1;
    if ((p.done + 1) === TESTING_STAGE && !p.buildStart) p.buildStart = Date.now(); // entering Build & Test → start 90-day clock
    var reached = STAGES[p.done];
    var label = p.done >= STAGES.length - 1 ? 'System went live'
      : ((wasGate ? 'Approved' : (reached.name + ' completed')) + actorTag());
    p.history.push({ at: Date.now(), label: label, note: note });
    p.updatedAt = Date.now();
    await commit();
    var nowActive = STAGES[p.done + 1];
    if (nowActive && nowActive.type === 'gate') {
      // reached a management review gate (e.g. Final Approval) — notify Management to review
      await addNote({ kind: 'review', proposalId: p.id, proposalTitle: p.title, category: p.category, forRole: 'management', message: nowActive.name + ' needed — please review this proposal', at: Date.now() });
    }
    if (p.done >= STAGES.length - 1 && p.submittedBy) {
      // deployed & live — all stages completed, tell the proposer
      await addNote({ kind: 'live', proposalId: p.id, proposalTitle: p.title, category: p.category, forUserId: p.submittedBy, message: 'Your project is now live — all stages completed', at: Date.now() });
    }
    toast(p.done >= STAGES.length - 1 ? 'Marked as live' : 'Moved to next stage');
  }
  async function sendBack(p) {
    if (!canMove(p, 'back')) return denied();
    var note = logNote(p);
    if (!note) { toast('Add a comment/reason in the note box before sending it back'); return; }
    if (p.done > 0) p.done -= 1;
    p.approvals = {};
    p.history.push({ at: Date.now(), label: 'Sent back to ' + STAGES[p.done].name + actorTag(), note: note });
    p.updatedAt = Date.now();
    await commit(); toast('Sent back a stage');
  }
  async function reject(p) {
    if (!canMove(p, 'reject')) return denied();
    var note = logNote(p);
    if (!note) { toast('Add a comment/reason in the note box before rejecting'); return; }
    p.status = 'rejected';
    p.approvals = {};
    p.history.push({ at: Date.now(), label: 'Rejected at ' + STAGES[p.done + 1].name + actorTag(), note: note });
    p.updatedAt = Date.now();
    await commit(); toast('Proposal rejected');
  }
  async function reopen(p) {
    if (!canMove(p, 'reopen')) return denied();
    p.status = 'active';
    p.approvals = {};
    p.history.push({ at: Date.now(), label: 'Reopened' + actorTag(), note: '' });
    p.updatedAt = Date.now();
    await commit(); toast('Proposal reopened');
  }
  async function approveGate(p) {
    if (!canApproveGate(currentUser, p)) return denied();
    var active = STAGES[p.done + 1];
    if (!active || active.type !== 'gate') return;
    var gate = String(p.done + 1);
    var req = requiredSlots(p);
    p.approvals = p.approvals || {};
    var g = p.approvals[gate] = p.approvals[gate] || {};
    var mine = eligibleSlots(currentUser, p).filter(function (s) { return req.indexOf(s) !== -1 && !g[s]; });
    if (!mine.length) { toast('You’ve already recorded your approval here'); return; }
    mine.forEach(function (s) { g[s] = { by: currentUser.name, byId: currentUser.id, at: Date.now() }; });
    var complete = req.every(function (s) { return g[s]; });
    if (complete) {
      p.done += 1;
      delete p.approvals[gate];
      p.history.push({ at: Date.now(), label: active.name + ' fully approved — moved to ' + STAGES[p.done].name, note: '' });
      if (p.submittedBy) {
        await addNote({ kind: 'approved', proposalId: p.id, proposalTitle: p.title, category: p.category, forUserId: p.submittedBy, message: active.name + ' passed — now at ' + STAGES[p.done].name, at: Date.now() });
      }
      var nextStage = STAGES[p.done + 1];
      if (nextStage && nextStage.type === 'milestone') {
        // Final Approval passed → notify the IT team to deploy & go live
        await addNote({ kind: 'deploy', proposalId: p.id, proposalTitle: p.title, category: p.category, forCat: 'IT', message: 'Approved for deployment — IT to deploy & go live', at: Date.now() });
      }
    } else {
      p.history.push({ at: Date.now(), label: active.name + ' — approval recorded (' + mine.map(function (s) { return slotLabel(s, p); }).join(', ') + ')' + actorTag(), note: logNote(p) });
    }
    p.updatedAt = Date.now();
    await commit();
    toast(complete ? 'Fully approved — moved to next stage' : 'Your approval recorded');
  }
  async function arrangeMeeting(p) {
    if (!canMove(p, 'adv')) return denied();
    var active = STAGES[p.done + 1];
    var dt = el('meet-' + p.id); var when = dt ? dt.value : '';
    if (!when) { toast('Pick a date and time for the meeting'); return; }
    var ts = new Date(when).getTime();
    if (!isFinite(ts)) { toast('That date doesn’t look right'); return; }
    var noteEl = el('meetnote-' + p.id); var mnote = noteEl ? noteEl.value.trim() : '';
    p.meeting = { at: ts, note: mnote, stage: active.name, by: currentUser.name, setAt: Date.now() };
    p.history.push({ at: Date.now(), label: active.name + ' meeting arranged for ' + fmt(ts) + actorTag(), note: mnote });
    p.updatedAt = Date.now();
    await commit();
    if (p.submittedBy) {
      await addNote({
        kind: 'meeting', proposalId: p.id, proposalTitle: p.title, category: p.category, forUserId: p.submittedBy,
        message: active.name + ' meeting arranged for ' + fmt(ts), at: Date.now()
      });
    }
    toast('Meeting arranged — proposer notified');
  }
  async function submitEval(p) {
    var ratings = {}, anyRating = false;
    EVAL_CRITERIA.forEach(function (c, i) {
      var sel = root.querySelector('input[name="ev-' + p.id + '-' + i + '"]:checked');
      if (sel) { ratings[i] = sel.value; anyRating = true; }
    });
    var commentEl = el('ev-comment-' + p.id);
    var comment = commentEl ? commentEl.value.trim() : '';
    if (!anyRating && !comment) { toast('Add a rating or a comment first'); return; }
    var nameEl = el('ev-name-' + p.id);
    var tester = nameEl ? nameEl.value.trim() : '';
    if (!p.evaluations) p.evaluations = [];
    p.evaluations.push({ at: Date.now(), tester: tester, ratings: ratings, comment: comment });
    p.history.push({ at: Date.now(), label: 'Evaluation added' + (tester ? ' by ' + tester : ''), note: '' });
    p.updatedAt = Date.now();
    await commit(); toast('Evaluation submitted');
  }
  async function submitFeasibility(p) {
    if (!canFeasibility(p)) { toast('Only the proposer can fill this in'); return; }
    var f = { by: currentUser.name, byId: currentUser.id, at: Date.now() };
    var any = false;
    FEAS_METRICS.forEach(function (m) { var e = el('fz-' + m.k + '-' + p.id); var v = e ? e.value.trim() : ''; f[m.k] = v; if (v) any = true; });
    FEAS_CHECKS.forEach(function (c) { var sel = root.querySelector('input[name="fz-' + c.k + '-' + p.id + '"]:checked'); f[c.k] = sel ? sel.value : ''; if (sel) any = true; });
    var iss = el('fz-issues-' + p.id); f.issues = iss ? iss.value.trim() : ''; if (f.issues) any = true;
    var com = el('fz-comment-' + p.id); f.comment = com ? com.value.trim() : ''; if (f.comment) any = true;
    var lnk = el('fz-link-' + p.id); f.systemLink = lnk ? lnk.value.trim() : ''; if (f.systemLink) any = true;
    if (!any) { toast('Fill in at least one field'); return; }
    var update = !!p.feasibility;
    p.feasibility = f;
    p.history.push({ at: Date.now(), label: (update ? 'Feasibility feedback updated' : 'Feasibility feedback submitted') + actorTag(), note: '' });
    p.updatedAt = Date.now();
    await commit(); toast('Feasibility feedback saved');
  }
  async function submitItReview(p) {
    if (!canITReview(currentUser)) return denied();
    var cEl = el('itr-comment-' + p.id);
    var comment = cEl ? cEl.value.trim() : '';
    var files = [];
    try {
      var f1 = await readFile(el('itr-file1-' + p.id));
      var f2 = await readFile(el('itr-file2-' + p.id));
      if (f1) files.push(f1);
      if (f2) files.push(f2);
    } catch (e) { toast(e && e.message ? e.message : 'Could not read the file'); return; }
    if (!comment && !files.length) { toast('Add a comment or a file first'); return; }
    if (!p.itReviews) p.itReviews = [];
    p.itReviews.push({ at: Date.now(), by: currentUser.name, byId: currentUser.id, comment: comment, attachments: files });
    p.history.push({ at: Date.now(), label: 'IT review added' + actorTag(), note: '' });
    p.updatedAt = Date.now();
    await commit(); toast('IT review submitted');
  }
  async function summarizeEval(p) {
    var evs = p.evaluations || [];
    if (!evs.length) { toast('No evaluations to summarize yet'); return; }
    summarizing[p.id] = true; refreshDetail();
    try {
      var lines = evs.map(function (ev, idx) {
        var rs = EVAL_CRITERIA.map(function (c, i) {
          return (ev.ratings && ev.ratings[i]) ? (c + ': ' + ev.ratings[i]) : null;
        }).filter(Boolean).join('; ');
        return 'Tester ' + (idx + 1) + (ev.tester ? ' (' + ev.tester + ')' : '') +
          ' — ratings: ' + (rs || 'none given') + '. Comment: ' + (ev.comment || 'none');
      }).join('\n');
      var prompt = 'You are summarizing user-acceptance test feedback for an internal system titled "' +
        (p.title || 'the system') + '".\n\nEvaluations from ' + evs.length + ' tester(s):\n' + lines +
        '\n\nWrite a concise summary for management as plain text, with each of these labels on its own line:\n' +
        'Overall: one sentence on the general verdict and sentiment.\n' +
        'Strengths: the main positives in 1-2 sentences or a short list.\n' +
        'Issues to fix: the main problems or requests in a short list.\n' +
        'Keep it under 120 words. Only use feedback that was actually provided; do not invent anything.';
      var res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var d = await res.json();
      var text = (d.content || []).filter(function (b) { return b.type === 'text'; })
        .map(function (b) { return b.text; }).join('\n').trim();
      if (!text) throw new Error('empty response');
      p.evalSummary = { text: text, count: evs.length, at: Date.now() };
      p.updatedAt = Date.now();
      delete summarizing[p.id];
      await commit();
      toast('Summary ready');
    } catch (e) {
      delete summarizing[p.id];
      refreshDetail();
      toast('Could not generate the summary here');
    }
  }

  /* ---------- auth UI (top app bar) ---------- */
  var settingsMode = false;
  var gated = false; // when true, the login card blocks the whole app
  function showGate() { gated = true; showAuth('login'); }
  function showBootOverlay() {
    gated = true;
    openModal('<div class="authcard" style="text-align:center"><div class="auth-brand">MJM Group</div><p class="hint" style="margin:6px 0 0">Loading…</p></div>', 'auth');
  }
  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>';
  function renderAuth() {
    var box = el('appbar'); if (!box) return;
    var right;
    if (currentUser) {
      var cnt = unreadCount(currentUser);
      var bell = '<button class="iconbtn bell" data-auth="notes" title="Notifications" aria-label="Notifications">' + BELL +
        (cnt ? '<span class="ndot">' + (cnt > 9 ? '9+' : cnt) + '</span>' : '') + '</button>';
      right = '<span class="hi">Hi, ' + esc((currentUser.name || '').split(' ')[0] || 'there') + '</span>' +
        bell +
        '<button class="iconbtn" data-auth="settings" title="Settings" aria-label="Settings">' + GEAR + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-auth="logout">Sign out</button>';
    } else {
      right = '<button class="btn btn-primary btn-sm" data-auth="login">Sign in</button>';
    }
    box.innerHTML =
      '<div class="appbar-in">' +
        '<div class="brand"><span class="brand-name">MJM Group</span>' +
        '<span class="brand-sub">Vibe Coding Project Management</span></div>' +
        '<div class="appbar-right">' + right + '</div>' +
      '</div>';
  }

  /* ---------- sign-in / sign-up card ---------- */
  function authField(id, label, type, ac) {
    return '<div class="auth-field"><label for="' + id + '">' + esc(label) + '</label>' +
      '<input id="' + id + '" type="' + type + '" autocomplete="' + ac + '" /></div>';
  }
  function showAuth(mode) {
    modalMode = 'auth'; mode = mode || 'login';
    var body;
    if (mode === 'login') {
      body = '<h2 class="auth-h">Sign in</h2>' +
        authField('a-login-email', 'Email', 'email', 'username') +
        authField('a-login-pw', 'Password', 'password', 'current-password') +
        '<div class="err" id="a-login-err"></div>' +
        '<button class="btn-block" id="a-login-btn">Sign in</button>' +
        '<p class="auth-alt">No account? <button class="linkbtn" data-authmode="signup">Create one</button></p>';
    } else {
      body = '<h2 class="auth-h">Create account</h2>' +
        authField('a-name', 'Full name', 'text', 'name') +
        authField('a-email', 'Email', 'email', 'username') +
        authField('a-pw', 'Password', 'password', 'new-password') +
        authField('a-pw2', 'Confirm password', 'password', 'new-password') +
        '<div class="err" id="a-signup-err"></div>' +
        '<button class="btn-block" id="a-signup-btn">Create account</button>' +
        '<p class="auth-alt">Have an account? <button class="linkbtn" data-authmode="login">Sign in</button></p>';
    }
    openModal('<div class="authcard"><div class="auth-brand">MJM Group</div>' + body + '</div>', 'auth');
    var m = el('modal');
    Array.prototype.forEach.call(m.querySelectorAll('[data-authmode]'), function (b) {
      b.onclick = function () { showAuth(b.getAttribute('data-authmode')); };
    });
    if (mode === 'login') el('a-login-btn').onclick = doLogin; else el('a-signup-btn').onclick = doSignup;
  }
  async function doLogin() {
    var email = el('a-login-email').value.trim();
    var pw = el('a-login-pw').value;
    var err = el('a-login-err'); err.textContent = '';
    if (!email || !pw) { err.textContent = 'Enter your email and password.'; return; }
    var btn = el('a-login-btn'); if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
    var u = null;
    if (sb) {
      try {
        var r = await sb.rpc('app_login', { p_email: email, p_password: pw });
        if (r.error) { err.textContent = 'Could not sign in — please try again.'; }
        else if (!r.data) { err.textContent = 'Wrong email or password.'; }
        else u = normalizeAuthUser(r.data);
      } catch (e) { err.textContent = 'Could not reach the server.'; }
    } else {
      u = findUserByEmail(email); if (!u) err.textContent = 'No account found for that email.';
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Sign in'; }
    if (!u) return;
    var existing = users.find(function (x) { return x.id === u.id; });
    if (existing) { existing.name = u.name; existing.roles = u.roles; existing.categories = u.categories; u = existing; }
    else users.push(u);
    currentUser = u; setSession(u);
    gated = false; closeModal(); renderAuth(); render();
    toast('Welcome back, ' + (u.name || '').split(' ')[0]);
  }
  async function doSignup() {
    var name = el('a-name').value.trim();
    var email = el('a-email').value.trim();
    var pw = el('a-pw').value, pw2 = el('a-pw2').value;
    var err = el('a-signup-err'); err.textContent = '';
    if (!name || !email || !pw) { err.textContent = 'Fill in name, email and password.'; return; }
    if (!/.+@.+\..+/.test(email)) { err.textContent = 'Enter a valid email address.'; return; }
    if (pw.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
    if (pw !== pw2) { err.textContent = 'Passwords don’t match.'; return; }
    if (findUserByEmail(email)) { err.textContent = 'An account with that email already exists.'; return; }
    var btn = el('a-signup-btn'); if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }
    var u = null;
    if (sb) {
      try {
        var r = await sb.rpc('app_signup', { p_name: name, p_email: email, p_password: pw });
        if (r.error) { err.textContent = (r.error.message || '').indexOf('exists') !== -1 ? 'An account with that email already exists.' : 'Could not create the account.'; }
        else u = normalizeAuthUser(r.data);
      } catch (e) { err.textContent = 'Could not reach the server.'; }
    } else {
      u = { id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name, email: email, roles: users.length === 0 ? ['admin'] : [], categories: [], createdAt: Date.now() };
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Create account'; }
    if (!u) return;
    var first = (u.roles || []).indexOf('admin') !== -1;
    users.push(u);
    currentUser = u; setSession(u);
    gated = false; closeModal(); renderAuth(); render();
    toast(first ? 'Account created — you’re the Administrator' : 'Account created — you’re signed in');
  }
  function logout() {
    currentUser = null; setSession(null);
    if (settingsMode) closeSettings();
    if (el('backdrop').className.indexOf('show') !== -1) closeModal();
    renderAuth(); render();
    toast('Signed out');
  }

  /* ---------- notifications ---------- */
  function showNotes() {
    if (!currentUser) return;
    modalMode = 'notes';
    var u = currentUser;
    var list = relevantNotes(u).slice().sort(function (a, b) { return b.at - a.at; }).slice(0, 40);
    var items = list.length ? list.map(function (n) {
      var unread = (n.readBy || []).indexOf(u.id) === -1;
      return '<button class="note-item' + (unread ? ' unread' : '') + '" data-note="' + n.id + '" data-pid="' + esc(n.proposalId) + '">' +
        '<div class="note-msg">' + esc(n.message) + '</div>' +
        '<div class="note-sub">' + esc(n.proposalTitle || '') + (n.category ? ' &middot; ' + esc(n.category) : '') + ' &middot; ' + fmt(n.at) + '</div>' +
      '</button>';
    }).join('') : '<p class="hint" style="padding:8px 0">No notifications yet.</p>';
    openModal(
      '<div class="modal-head"><h2 class="d-title" style="margin:0">Notifications</h2>' +
      '<button class="xbtn" data-close="1">×</button></div>' +
      '<div class="modal-body"><div class="note-list">' + items + '</div>' +
      (list.length ? '<div class="actions-row" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-note="allread">Mark all as read</button></div>' : '') +
      '</div>');
  }
  async function onNoteClick(nb) {
    var u = currentUser; if (!u) return;
    var id = nb.getAttribute('data-note');
    if (id === 'allread') {
      relevantNotes(u).forEach(function (n) { n.readBy = n.readBy || []; if (n.readBy.indexOf(u.id) === -1) n.readBy.push(u.id); });
      await saveNotes(notes); renderAuth(); showNotes(); return;
    }
    var n = notes.find(function (x) { return x.id === id; });
    if (n) { n.readBy = n.readBy || []; if (n.readBy.indexOf(u.id) === -1) n.readBy.push(u.id); await saveNotes(notes); }
    renderAuth();
    var pid = nb.getAttribute('data-pid');
    if (pid && data.find(function (x) { return x.id === pid; })) showDetail(pid);
    else showNotes();
  }

  /* ---------- settings view (user access) ---------- */
  function showSettings() {
    if (!currentUser) { showAuth('login'); return; }
    settingsMode = true;
    el('view-main').className = 'hide';
    el('view-settings').className = '';
    renderSettings();
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  function closeSettings() {
    settingsMode = false;
    el('view-settings').className = 'hide';
    el('view-main').className = '';
  }
  function catChipsRow(u, editable) {
    var all = (u.categories || []).indexOf('*') !== -1;
    var chips = '<button class="catchip' + (all ? ' on' : '') + '" data-catall="' + u.id + '"' + (editable ? '' : ' disabled') + '>All</button>' +
      MGMT_CATEGORIES.map(function (c) {
        var on = !all && (u.categories || []).indexOf(c) !== -1;
        return '<button class="catchip' + (on ? ' on' : '') + '" data-uid="' + u.id + '" data-cat="' + esc(c) + '"' + ((editable && !all) ? '' : ' disabled') + '>' + esc(c) + '</button>';
      }).join('');
    return '<div class="ua-cats"><span class="ua-cats-l">Approves</span>' + chips + '</div>';
  }
  function uaRow(u) {
    var me = u.id === currentUser.id;
    var canEdit = isAdmin(currentUser);
    var checks = ROLE_OPTS.map(function (rr) {
      var on = hasRole(u, rr[0]);
      return '<label class="rolechk' + (on ? ' on' : '') + '"><input type="checkbox" data-role="' + rr[0] + '" data-uid="' + u.id + '"' +
        (on ? ' checked' : '') + (canEdit ? '' : ' disabled') + ' /> ' + esc(rr[1]) + '</label>';
    }).join('');
    var cats = isManagement(u) ? catChipsRow(u, canEdit) : '';
    return '<div class="ua-row"><div class="ua-main">' +
      '<div class="ua-head"><span class="ua-email">' + esc(u.email) + '</span>' + (me ? '<span class="ua-you">YOU</span>' : '') +
        '<span class="ua-roletag">' + esc(userRolesLabel(u)) + '</span></div>' +
      '<div class="ua-desc">' + esc(describeUser(u)) + '</div>' +
      '<div class="ua-roles">' + checks + '</div>' + cats +
      '</div></div>';
  }
  function profileFormHTML() {
    var u = currentUser;
    return '<div class="grid2">' +
      '<div class="field"><label for="prof-name">Full name</label><input id="prof-name" type="text" value="' + esc(u.name) + '" maxlength="60" /></div>' +
      '<div class="field"><label>Email</label><input type="text" value="' + esc(u.email) + '" readonly style="background:#f4f5f8" /></div>' +
    '</div>' +
    '<p class="hint" style="margin:4px 0 8px">To change your password, fill in all three boxes below.</p>' +
    '<div class="grid2">' +
      '<div class="field"><label for="prof-oldpw">Current password</label><input id="prof-oldpw" type="password" placeholder="leave blank to keep" autocomplete="current-password" /></div>' +
      '<div class="field"></div>' +
    '</div>' +
    '<div class="grid2">' +
      '<div class="field"><label for="prof-pw">New password</label><input id="prof-pw" type="password" autocomplete="new-password" /></div>' +
      '<div class="field"><label for="prof-pw2">Confirm new password</label><input id="prof-pw2" type="password" autocomplete="new-password" /></div>' +
    '</div>' +
    '<div class="err" id="prof-err"></div>' +
    '<button class="btn btn-primary" id="prof-save">Save profile</button>';
  }
  function renderSettings() {
    var admin = isAdmin(currentUser);
    var canSeeList = admin || isManagement(currentUser);
    var listBlock = '';
    if (canSeeList) {
      var list = users.slice().sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); }).map(uaRow).join('');
      listBlock =
        '<p class="ua-sec">User access</p>' +
        '<p class="hint" style="margin-bottom:16px">Set what each person can access. Only an Administrator can change other people’s access.</p>' +
        '<div class="ua-list">' + (list || '<p class="hint">No accounts yet.</p>') + '</div>' +
        (admin ? '' : '<p class="hint" style="margin-top:12px">You can view access here, but only an Administrator can change it.</p>');
    }
    el('view-settings').innerHTML =
      '<div class="card-lg">' +
        '<button class="linkback" data-settings="back">&larr; Back</button>' +
        '<h1 class="settings-h">Settings</h1>' +
        listBlock +
        '<p class="ua-sec"' + (canSeeList ? ' style="margin-top:28px"' : '') + '>Your profile</p>' +
        profileFormHTML() +
      '</div>';
  }
  async function toggleRole(uid, role, on) {
    if (!isAdmin(currentUser)) { toast('Only an Administrator can change access'); renderSettings(); return; }
    var u = users.find(function (x) { return x.id === uid; }); if (!u) return;
    if (role === 'admin' && !on) {
      var admins = users.filter(function (x) { return getRoles(x).indexOf('admin') !== -1; }).length;
      if (admins <= 1) { toast('There must be at least one Administrator'); renderSettings(); return; }
    }
    var roles = getRoles(u).slice();
    var i = roles.indexOf(role);
    if (on) { if (i === -1) roles.push(role); } else { if (i !== -1) roles.splice(i, 1); }
    u.roles = roles;
    delete u.role; // migrate off the single-role field
    if (roles.indexOf('management') !== -1 && !u.categories) u.categories = [];
    await saveUsers(users);
    if (u.id === currentUser.id) renderAuth();
    renderSettings(); render();
    toast('Access updated');
  }
  async function toggleCat(chip) {
    if (!isAdmin(currentUser)) { toast('Only an Administrator can change access'); return; }
    var uid = chip.getAttribute('data-uid') || chip.getAttribute('data-catall');
    var u = users.find(function (x) { return x.id === uid; }); if (!u) return;
    u.categories = u.categories || [];
    if (chip.hasAttribute('data-catall')) {
      u.categories = (u.categories.indexOf('*') !== -1) ? [] : ['*'];
    } else {
      var c = chip.getAttribute('data-cat');
      if (u.categories.indexOf('*') !== -1) u.categories = [];
      var i = u.categories.indexOf(c);
      if (i === -1) u.categories.push(c); else u.categories.splice(i, 1);
    }
    await saveUsers(users);
    renderSettings(); render();
  }
  async function saveProfile() {
    var u = currentUser;
    var name = el('prof-name').value.trim();
    var oldpw = (el('prof-oldpw') || {}).value || '';
    var pw = el('prof-pw').value, pw2 = el('prof-pw2').value;
    var err = el('prof-err'); err.textContent = '';
    if (!name) { err.textContent = 'Name can’t be empty.'; return; }
    if (pw || pw2 || oldpw) {
      if (!oldpw) { err.textContent = 'Enter your current password to change it.'; return; }
      if (pw.length < 6) { err.textContent = 'New password must be at least 6 characters.'; return; }
      if (pw !== pw2) { err.textContent = 'New passwords don’t match.'; return; }
      if (sb) {
        try {
          var r = await sb.rpc('app_change_password', { p_id: u.id, p_old: oldpw, p_new: pw });
          if (r.error || r.data !== true) { err.textContent = 'Current password is incorrect.'; return; }
        } catch (e) { err.textContent = 'Could not reach the server.'; return; }
      }
    }
    u.name = name;
    await saveUsers(users);
    renderAuth(); renderSettings(); render();
    toast('Profile saved');
  }
  function handleAuth(which) {
    if (which === 'login') showAuth('login');
    else if (which === 'signup') showAuth('signup');
    else if (which === 'settings') showSettings();
    else if (which === 'notes') showNotes();
    else if (which === 'logout') logout();
  }

  /* ---------- events ---------- */
  el('appbar').addEventListener('click', function (e) {
    var b = e.target.closest('[data-auth]'); if (!b) return;
    handleAuth(b.getAttribute('data-auth'));
  });
  el('view-settings').addEventListener('click', function (e) {
    if (e.target.closest('[data-settings="back"]')) { closeSettings(); return; }
    if (e.target.closest('#prof-save')) { saveProfile(); return; }
    var chip = e.target.closest('[data-cat],[data-catall]');
    if (chip && !chip.disabled) { toggleCat(chip); }
  });
  el('view-settings').addEventListener('change', function (e) {
    var rc = e.target.closest('input[data-role]');
    if (rc) toggleRole(rc.getAttribute('data-uid'), rc.getAttribute('data-role'), rc.checked);
  });
  el('rail').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sop]'); if (!b) return;
    showSop(parseInt(b.getAttribute('data-sop'), 10));
  });
  el('new-btn').onclick = function () { showForm(); };
  el('search').addEventListener('input', function (e) { query = e.target.value.trim().toLowerCase(); render(); });
  el('list-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ltab]'); if (!b) return;
    listTab = b.getAttribute('data-ltab'); render();
  });

  el('plist').addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]'); if (!v) return;
    showDetail(v.getAttribute('data-view'));
  });

  el('backdrop').addEventListener('click', function (e) {
    if (e.target === el('backdrop') || e.target.closest('[data-close]')) { closeModal(); return; }
    var ab = e.target.closest('[data-auth]');
    if (ab) { handleAuth(ab.getAttribute('data-auth')); return; }
    var nb = e.target.closest('[data-note]');
    if (nb) { onNoteClick(nb); return; }
    var t = e.target.closest('[data-act]'); if (!t) return;
    var act = t.getAttribute('data-act');
    var pid = t.getAttribute('data-id');
    var p = data.find(function (x) { return x.id === pid; });
    if (!p) return;
    if (act === 'tester') {
      var key = pid + ':' + t.getAttribute('data-idx');
      if (openTesters[key]) delete openTesters[key]; else openTesters[key] = true;
      refreshDetail(); return;
    }
    if (act === 'editprop') showForm(p);
    else if (act === 'adv') advance(p);
    else if (act === 'approve') approveGate(p);
    else if (act === 'back') sendBack(p);
    else if (act === 'reject') reject(p);
    else if (act === 'reopen') reopen(p);
    else if (act === 'meet') arrangeMeeting(p);
    else if (act === 'itreview') submitItReview(p);
    else if (act === 'feas') submitFeasibility(p);
    else if (act === 'eval') submitEval(p);
    else if (act === 'summ') summarizeEval(p);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el('backdrop').className.indexOf('show') !== -1) closeModal();
  });

  /* ---------- boot ---------- */
  renderRail();
  resolveSession();      // restore login if they signed in before (browsing no longer requires it)
  gated = false;
  renderAuth();
  render();              // open browsing — show proposals to everyone, no login gate
  (async function () {
    users = await loadUsers();
    if (!Array.isArray(users)) users = [];
    normalizeUsers();
    await seedDemo();
    notes = await loadNotes();
    if (!Array.isArray(notes)) notes = [];
    resolveSession();    // pick up the freshest profile (roles/categories) from the database
    data = await loadAll();
    if (!Array.isArray(data)) data = [];
    data.forEach(function (p) { if (!p.evaluations) p.evaluations = []; });
    renderAuth();
    render();
    if (modalMode === 'auth') closeModal();
  })();

  // light poll so others' changes surface without a manual reload (runs for guests too)
  if (sb && window.setInterval) {
    setInterval(async function () {
      try {
        var n = await loadNotes(); if (Array.isArray(n)) notes = n;
        var uu = await loadUsers(); if (Array.isArray(uu)) { users = uu; normalizeUsers(); }
        var dd = await loadAll(); if (Array.isArray(dd)) { data = dd; data.forEach(function (p) { if (!p.evaluations) p.evaluations = []; }); }
        resolveSession();
        renderAuth();
        if (!settingsMode && el('backdrop').className.indexOf('show') === -1) render();
      } catch (e) {}
    }, 45000);
  }
})();
