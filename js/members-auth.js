(function () {

  // ── Member credentials — update with real data ──────────────────
  var MEMBERS = [
    { username: 'president',  password: 'lions1977', name: 'Lion Daara Patel',       role: 'President', memberId: 'LCB-01' },
    { username: 'secretary',  password: 'lions1977', name: 'Lion Shahrukh Marolia',  role: 'Secretary', memberId: 'LCB-03' },
    { username: 'treasurer',  password: 'lions1977', name: 'Lion Percy Kaikobad',    role: 'Treasurer', memberId: 'LCB-04' },
    { username: 'member1',    password: 'lions1977', name: 'Lion [Member Name]',     role: 'Member',    memberId: 'LCB-11' },
    { username: 'member2',    password: 'lions1977', name: 'Lion [Member Name]',     role: 'Member',    memberId: 'LCB-12' },
  ];

  // ── Inject styles ───────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    /* Login modal */
    '.lcb-login-box{background:#fff;border-radius:var(--radius-lg,12px);padding:44px 40px;',
      'width:100%;max-width:400px;position:relative;box-shadow:0 24px 60px rgba(16,44,87,.28);',
      'box-sizing:border-box;}',
    '.lcb-login-close{position:absolute;top:14px;right:18px;background:none;border:none;',
      'font-size:26px;line-height:1;cursor:pointer;color:var(--muted,#6b7076);padding:0;}',
    '.lcb-login-icon{width:56px;height:56px;background:var(--navy,#102C57);border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}',
    '.lcb-login-h{font-family:var(--serif,"Georgia",serif);font-size:22px;font-weight:400;',
      'color:var(--navy,#102C57);text-align:center;margin:0 0 6px;}',
    '.lcb-login-sub{font-size:13px;color:var(--muted,#6b7076);text-align:center;margin:0 0 24px;}',
    '.lcb-login-error{background:#fee2e2;color:#b91c1c;font-size:13px;',
      'padding:10px 14px;border-radius:8px;margin-bottom:16px;}',
    '.lcb-field{position:relative;margin-bottom:16px;padding-top:16px;}',
    '.lcb-label{position:absolute;left:2px;top:26px;font-family:var(--sans,sans-serif);',
      'font-size:14px;font-weight:400;color:var(--muted,#6b7076);pointer-events:none;',
      'transition:top .15s ease,font-size .15s ease,color .15s ease,letter-spacing .15s ease;}',
    '.lcb-input{width:100%;padding:11px 2px;border:none;border-bottom:1.5px solid var(--rule,#e8e8e8);',
      'border-radius:0;font-size:14px;outline:none;box-sizing:border-box;background:transparent;',
      'font-family:var(--sans,sans-serif);color:var(--ink,#1a1a1a);transition:border-color .2s,border-bottom-width .2s;}',
    '.lcb-input:focus{border-bottom:2px solid var(--gold-deep,#e1b703);padding-bottom:10px;background:transparent;}',
    '.lcb-input::placeholder{color:transparent;}',
    '.lcb-input:focus::placeholder{color:var(--muted,#6b7076);}',
    '.lcb-input:focus + .lcb-label,.lcb-input:not(:placeholder-shown) + .lcb-label{',
      'top:0;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--navy,#102C57);}',
    '.lcb-input:focus + .lcb-label{color:var(--gold-deep,#e1b703);}',
    '.lcb-login-btn{display:flex;align-items:center;justify-content:center;gap:10px;',
      'width:100%;padding:14px;background:transparent;color:var(--navy,#102C57);',
      'border:1.5px solid var(--navy,#102C57);border-radius:var(--radius-md,8px);',
      'font-size:14px;font-weight:500;',
      'cursor:pointer;margin-top:8px;font-family:var(--serif,"Roboto Serif",serif);',
      'transition:background .2s,color .2s;}',
    '.lcb-login-btn:hover{background:var(--navy,#102C57);color:#fff;}',
    '.lcb-login-btn svg{width:17px;height:17px;stroke:var(--gold-deep,#e1b703);stroke-width:2.2;',
      'fill:none;transition:stroke .2s;}',
    '.lcb-login-hint{font-size:12px;color:var(--muted,#6b7076);text-align:center;margin:16px 0 0;}',

    /* Avatar pill */
    'a.lcb-avatar-pill{width:36px!important;height:36px!important;padding:0!important;',
      'border-radius:50%!important;display:inline-flex!important;',
      'align-items:center!important;justify-content:center!important;',
      'background:var(--gold,#FCCB06)!important;',
      'border:2px solid var(--gold,#FCCB06)!important;',
      'font-size:13px!important;font-weight:700!important;',
      'color:var(--navy,#102C57)!important;font-family:var(--serif,"Georgia",serif)!important;',
      'cursor:pointer!important;line-height:1!important;text-decoration:none!important;',
      'transition:box-shadow .2s,transform .2s!important;}',
    'a.lcb-avatar-pill:hover{box-shadow:0 0 0 3px rgba(252,203,6,.35)!important;',
      'transform:scale(1.07)!important;}',

    /* Dropdown */
    '.lcb-li-wrap{position:relative!important;}',
    '.lcb-dropdown{position:absolute;top:calc(100% + 12px);right:0;min-width:220px;',
      'background:#fff;border-radius:var(--radius-lg,12px);',
      'box-shadow:0 16px 48px rgba(16,44,87,.18),0 2px 8px rgba(16,44,87,.08);',
      'border:1px solid rgba(16,44,87,.08);',
      'opacity:0;pointer-events:none;transform:translateY(-8px);',
      'transition:opacity .18s ease,transform .18s ease;',
      'z-index:9100;overflow:hidden;}',
    '.lcb-dropdown.open{opacity:1;pointer-events:auto;transform:translateY(0);}',
    '.lcb-dd-header{padding:16px 18px;display:flex;align-items:center;gap:12px;',
      'background:var(--paper,#f7f6f3);border-bottom:1px solid var(--rule,#e8e8e8);}',
    '.lcb-dd-avatar{width:40px;height:40px;border-radius:50%;background:var(--navy,#102C57);',
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
      'font-family:var(--serif,"Georgia",serif);font-size:14px;font-weight:700;',
      'color:var(--gold,#FCCB06);}',
    '.lcb-dd-name{font-size:13px;font-weight:700;color:var(--navy,#102C57);',
      'line-height:1.3;white-space:nowrap;}',
    '.lcb-dd-role{font-size:11px;color:var(--muted,#6b7076);margin-top:3px;',
      'letter-spacing:.04em;text-transform:uppercase;}',
    '.lcb-dd-items{padding:6px 0;}',
    'a.lcb-dd-item,button.lcb-dd-item{display:flex;align-items:center;gap:10px;',
      'width:100%;padding:10px 18px;font-size:13px;font-weight:500;',
      'color:var(--ink,#1a1a1a);background:none;border:none;cursor:pointer;',
      'text-align:left;text-decoration:none;font-family:var(--sans,sans-serif);',
      'transition:background .15s;box-sizing:border-box;}',
    'a.lcb-dd-item:hover,button.lcb-dd-item:hover{background:var(--paper,#f7f6f3);}',
    'a.lcb-dd-item svg,button.lcb-dd-item svg{flex-shrink:0;opacity:.55;}',
    'button.lcb-dd-logout{color:#c0392b!important;}',
    'button.lcb-dd-logout:hover{background:rgba(192,57,43,.07)!important;}',

    /* Mobile logged-in state */
    '.lcb-mob-block{display:flex;flex-direction:column;gap:6px;}',
    'a.lcb-mob-logged{display:flex;align-items:center;gap:10px;text-decoration:none;',
      'padding:10px 14px;border:1px solid var(--rule,#e8e8e8);',
      'border-radius:var(--radius-md,8px);}',
    '.lcb-mob-avatar{width:34px;height:34px;border-radius:50%;',
      'background:var(--gold,#FCCB06);flex-shrink:0;',
      'display:flex;align-items:center;justify-content:center;',
      'font-family:var(--serif,"Georgia",serif);font-size:12px;font-weight:700;',
      'color:var(--navy,#102C57);}',
    '.lcb-mob-name{font-size:13px;font-weight:700;color:var(--navy,#102C57);}',
    '.lcb-mob-role{font-size:11px;color:var(--muted,#6b7076);}',
    'button.lcb-mob-logout{background:none;border:none;cursor:pointer;',
      'font-size:12px;font-weight:600;color:#c0392b;font-family:var(--sans,sans-serif);',
      'padding:6px 14px;text-align:left;}',

    /* Full-screen login on mobile */
    '@media(max-width:640px){',
      '#lcbLoginOverlay{backdrop-filter:none!important;}',
      '.lcb-login-box{max-width:none;width:100%;min-height:100vh;min-height:100dvh;',
        'border-radius:0;box-shadow:none;padding:24px 26px;',
        'display:flex;flex-direction:column;justify-content:center;}',
      '.lcb-login-close{top:18px;right:20px;font-size:30px;}',
      '.lcb-login-icon{width:64px;height:64px;margin-bottom:20px;}',
      '.lcb-login-h{font-size:26px;}',
      '.lcb-login-sub{font-size:14px;margin-bottom:32px;}',
      '.lcb-field{margin-bottom:20px;}',
      '.lcb-login-btn{padding:16px;font-size:15px;margin-top:14px;}',
    '}',
  ].join('');
  document.head.appendChild(style);

  // ── Inject login modal ──────────────────────────────────────────
  var modal = document.createElement('div');
  modal.id = 'lcbLoginOverlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,20,40,.85);z-index:9999;display:none;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
  modal.innerHTML = [
    '<div class="lcb-login-box">',
      '<button class="lcb-login-close" id="lcbLoginCloseBtn" aria-label="Close">&times;</button>',
      '<div class="lcb-login-icon">',
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCCB06" stroke-width="2" aria-hidden="true">',
          '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
        '</svg>',
      '</div>',
      '<h2 class="lcb-login-h">Members Login</h2>',
      '<p class="lcb-login-sub">Access the exclusive members portal.</p>',
      '<div id="lcbLoginError" class="lcb-login-error" style="display:none;">',
        'Incorrect username or password. Please try again.',
      '</div>',
      '<div class="lcb-field">',
        '<input id="lcbLoginUser" type="text" class="lcb-input" placeholder="Enter your username" autocomplete="username">',
        '<label class="lcb-label" for="lcbLoginUser">Username</label>',
      '</div>',
      '<div class="lcb-field">',
        '<input id="lcbLoginPass" type="password" class="lcb-input" placeholder="Enter your password" autocomplete="current-password">',
        '<label class="lcb-label" for="lcbLoginPass">Password</label>',
      '</div>',
      '<button id="lcbLoginSubmit" class="lcb-login-btn">',
        'Login to members portal',
        '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="4" y1="12" x2="19" y2="12" stroke-linecap="round"/><polyline points="13,6 19,12 13,18" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '</button>',
      '<p class="lcb-login-hint">Contact the club secretary for your login credentials.</p>',
    '</div>',
  ].join('');
  document.body.appendChild(modal);

  // Wire modal buttons (no inline onclick — avoids CSP issues)
  document.getElementById('lcbLoginCloseBtn').addEventListener('click', _closeModal);
  document.getElementById('lcbLoginSubmit').addEventListener('click', _doLogin);
  document.getElementById('lcbLoginUser').addEventListener('keydown', function (e) { if (e.key === 'Enter') _doLogin(); });
  document.getElementById('lcbLoginPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') _doLogin(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) _closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display !== 'none') _closeModal();
  });

  // ── Close all dropdowns on outside click ───────────────────────
  document.addEventListener('click', function () {
    document.querySelectorAll('.lcb-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  });

  // ── Helpers ────────────────────────────────────────────────────
  function getInitials(name) {
    var clean = name.replace(/^(Late\s+Lion|Lion|Late)\s+/i, '').trim();
    var parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function _closeModal() {
    modal.style.display = 'none';
    document.getElementById('lcbLoginUser').value = '';
    document.getElementById('lcbLoginPass').value = '';
    document.getElementById('lcbLoginError').style.display = 'none';
  }

  function _openModal() {
    modal.style.display = 'flex';
    setTimeout(function () { document.getElementById('lcbLoginUser').focus(); }, 50);
  }

  function _doLogin() {
    var user  = document.getElementById('lcbLoginUser').value.trim().toLowerCase();
    var pass  = document.getElementById('lcbLoginPass').value;
    var match = MEMBERS.find(function (m) { return m.username === user && m.password === pass; });
    if (match) {
      var data = { name: match.name, role: match.role, username: match.username, memberId: match.memberId };
      sessionStorage.setItem('lcb_member', JSON.stringify(data));
      _closeModal();
      window.location.href = 'members.html';
    } else {
      document.getElementById('lcbLoginError').style.display = 'block';
      document.getElementById('lcbLoginPass').value = '';
    }
  }

  // ── Update nav to avatar + dropdown (called only when logged in) ─
  function _updateNavPill(member) {
    var initials = getInitials(member.name);

    // Desktop: convert each login-pill / nav-login-icon to avatar with dropdown
    document.querySelectorAll('.login-pill, .nav-login-icon').forEach(function (el) {
      var li = el.closest('li') || el.parentElement;
      li.classList.add('lcb-li-wrap');

      // Replace pill with avatar
      el.innerHTML = initials;
      el.className = 'login-pill lcb-avatar-pill';
      el.removeAttribute('style');
      el.removeAttribute('href');
      el.setAttribute('aria-label', 'Account: ' + member.name);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');

      // Remove any previous dropdown
      var old = li.querySelector('.lcb-dropdown');
      if (old) li.removeChild(old);

      // Build dropdown
      var dd = document.createElement('div');
      dd.className = 'lcb-dropdown';
      dd.innerHTML = [
        '<div class="lcb-dd-header">',
          '<div class="lcb-dd-avatar">' + initials + '</div>',
          '<div>',
            '<div class="lcb-dd-name">' + member.name + '</div>',
            '<div class="lcb-dd-role">' + member.role + '</div>',
          '</div>',
        '</div>',
        '<div class="lcb-dd-items">',
          '<a href="members.html" class="lcb-dd-item">',
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
              '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>',
              '<rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
            '</svg>',
            'Members Portal',
          '</a>',
          '<button class="lcb-dd-item lcb-dd-logout" id="lcbDropdownLogout">',
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
              '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
              '<polyline points="16 17 21 12 16 7"/>',
              '<line x1="21" y1="12" x2="9" y2="12"/>',
            '</svg>',
            'Log out',
          '</button>',
        '</div>',
      ].join('');
      li.appendChild(dd);

      // Wire logout inside dropdown
      dd.querySelector('#lcbDropdownLogout').addEventListener('click', function (e) {
        e.stopPropagation();
        window.__lcbLogout();
      });

      // Toggle dropdown — use onclick to ensure only ONE handler ever exists
      el.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = dd.classList.contains('open');
        // Close all other dropdowns first
        document.querySelectorAll('.lcb-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
        if (!isOpen) dd.classList.add('open');
      };
    });

    // Mobile drawer: replace login-pill-mob with member card
    document.querySelectorAll('.login-pill-mob').forEach(function (el) {
      var block = document.createElement('div');
      block.className = 'lcb-mob-block';
      block.innerHTML = [
        '<a href="members.html" class="lcb-mob-logged">',
          '<div class="lcb-mob-avatar">' + initials + '</div>',
          '<div>',
            '<div class="lcb-mob-name">' + member.name + '</div>',
            '<div class="lcb-mob-role">' + member.role + '</div>',
          '</div>',
        '</a>',
        '<button class="lcb-mob-logout" id="lcbMobLogout">Log out</button>',
      ].join('');
      el.parentNode.replaceChild(block, el);
      block.querySelector('#lcbMobLogout').addEventListener('click', function () {
        window.__lcbLogout();
      });
    });
  }

  // ── Wire login buttons (only when NOT logged in) ───────────────
  function _wireLoginButtons() {
    document.querySelectorAll('.login-pill, .nav-login-icon').forEach(function (el) {
      el.onclick = function (e) { e.preventDefault(); _openModal(); };
    });
    document.querySelectorAll('.login-pill-mob').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); _openModal(); });
    });
  }

  // ── Init: check session, then wire appropriate handlers ────────
  var stored = sessionStorage.getItem('lcb_member');
  if (stored) {
    try {
      _updateNavPill(JSON.parse(stored));
    } catch (e) {
      sessionStorage.removeItem('lcb_member');
      _wireLoginButtons();
    }
  } else {
    _wireLoginButtons();
  }

  // ── Public API ──────────────────────────────────────────────────
  window.openMembersLogin = _openModal;

  window.__lcbLogout = function () {
    sessionStorage.removeItem('lcb_member');
    window.location.href = 'index.html';
  };

})();
