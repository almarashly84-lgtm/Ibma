/* IBMA Accounting — dashboard (/admin). Plain JavaScript, no external libraries.
   Security: every value from the server is inserted with textContent / value (never innerHTML). */
'use strict';

(() => {
  // ------------------------------------------------------------------ helpers
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  const LANGS = [['ar', 'العربية', 'rtl'], ['en', 'English', 'ltr'], ['fr', 'Français', 'ltr']];
  const OTTAWA = 'America/Toronto';

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    for (const c of children.flat()) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  let toastTimer;
  function toast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.className = isError ? 'error' : '';
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, isError ? 6000 : 3000);
  }

  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }

  async function api(path, options = {}) {
    const init = { method: options.method || 'GET', credentials: 'same-origin', headers: {} };
    if (options.body !== undefined) {
      if (options.raw) { init.body = options.body; init.headers['Content-Type'] = options.contentType || 'application/octet-stream'; }
      else { init.body = JSON.stringify(options.body); init.headers['Content-Type'] = 'application/json'; }
    }
    let res;
    try { res = await fetch('/api/admin' + path, init); }
    catch { throw new ApiError(0, 'لا يوجد اتصال بالإنترنت أو الخادم لا يستجيب.'); }
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }
    if (res.status === 401 && path !== '/login') { showLogin('انتهت الجلسة. يرجى الدخول مرة أخرى.'); throw new ApiError(401, 'unauthorized'); }
    if (res.status === 403 && data && data.error === 'must_change_password') { showPasswordChange(true); throw new ApiError(403, 'must_change_password'); }
    if (!res.ok || !data || data.ok === false) throw new ApiError(res.status, (data && data.error) || 'حدث خطأ غير متوقع. حاول مرة أخرى.');
    return data;
  }

  const fmtNumber = (n) => new Intl.NumberFormat('ar').format(n);
  const fmtDateTime = (ms) => new Intl.DateTimeFormat('ar', { timeZone: OTTAWA, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
  const fmtDay = (iso) => new Intl.DateTimeFormat('ar', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T00:00:00Z'));
  const fmtShortDay = (iso) => new Intl.DateTimeFormat('ar', { timeZone: 'UTC', day: 'numeric', month: 'short' }).format(new Date(iso + 'T00:00:00Z'));
  const clone = (v) => JSON.parse(JSON.stringify(v));

  // ------------------------------------------------------------------ dirty-state tracking
  let dirty = false;
  let saveState = null;
  function setDirty(v) {
    dirty = v;
    if (saveState) {
      saveState.textContent = v ? 'توجد تغييرات غير محفوظة' : 'كل التغييرات محفوظة';
      saveState.classList.toggle('dirty', v);
    }
  }
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  const confirmLeave = () => !dirty || confirm('توجد تغييرات غير محفوظة. هل تريد المتابعة دون حفظ؟');

  // ------------------------------------------------------------------ form field builders
  function counter(input, max) {
    const c = h('div', { class: 'counter', dir: 'ltr' });
    const update = () => {
      c.textContent = `${input.value.length} / ${max}`;
      c.classList.toggle('over', input.value.length > max);
    };
    input.addEventListener('input', update);
    update();
    return c;
  }

  function textInput(value, { max = 200, type = 'text', dir, placeholder, multiline, rows, tall, id } = {}) {
    const el = multiline
      ? h('textarea', { rows: rows || 4, maxlength: max, dir, placeholder, id, class: tall ? 'tall' : undefined })
      : h('input', { type, maxlength: max, dir, placeholder, id });
    el.value = value ?? '';
    el.addEventListener('input', () => setDirty(true));
    return el;
  }

  /** One field in three languages. Returns { el, get }. */
  function langField(label, value, opts = {}) {
    const inputs = {};
    const group = h('div', { class: 'lang-group' });
    for (const [code, name, dir] of LANGS) {
      const input = textInput(value?.[code] ?? '', { ...opts, dir, placeholder: name });
      input.setAttribute('aria-label', `${label} — ${name}`);
      inputs[code] = input;
      group.append(h('div', { class: 'lang-row' }, h('span', { class: 'lang-tag', 'aria-hidden': 'true' }, code.toUpperCase()), h('div', null, input, opts.max && opts.max <= 400 ? counter(input, opts.max) : null)));
    }
    const el = h('div', { class: 'field' }, h('div', { class: 'label' }, label), group, opts.help ? h('span', { class: 'help' }, opts.help) : null);
    return { el, get: () => ({ ar: inputs.ar.value, en: inputs.en.value, fr: inputs.fr.value }), inputs };
  }

  function singleField(label, value, opts = {}) {
    const id = 'f' + Math.random().toString(36).slice(2);
    const input = textInput(value, { ...opts, id });
    const el = h('div', { class: 'field' }, h('label', { for: id }, label), input, opts.help ? h('span', { class: 'help' }, opts.help) : null);
    return { el, get: () => input.value, input };
  }

  function toggleField(label, checked, help) {
    const input = h('input', { type: 'checkbox', checked });
    input.addEventListener('change', () => setDirty(true));
    const el = h('div', { class: 'field' }, h('label', { class: 'switch' }, input, label), help ? h('span', { class: 'help' }, help) : null);
    return { el, get: () => input.checked, input };
  }

  // ------------------------------------------------------------------ auth screens
  function authCard(title, lead, ...content) {
    app.replaceChildren(h('div', { class: 'auth' }, h('div', { class: 'auth-card' },
      h('div', { class: 'brand-mark', 'aria-hidden': 'true' }, 'IBMA'),
      h('h1', null, title), h('p', { class: 'lead' }, lead), ...content)));
  }

  function showLogin(message) {
    setDirty(false);
    const pw = h('input', { type: 'password', id: 'login-password', autocomplete: 'current-password', required: true, maxlength: 200 });
    const err = h('div', { class: 'alert error', role: 'alert', hidden: !message }, message || '');
    const btn = h('button', { type: 'submit', class: 'btn primary block' }, 'دخول');
    const form = h('form', { novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'login-password' }, 'كلمة السر'), pw), err, btn);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!pw.value) { err.textContent = 'أدخل كلمة السر.'; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = 'جارٍ الدخول...';
      try {
        const r = await api('/login', { method: 'POST', body: { password: pw.value } });
        if (r.mustChange) showPasswordChange(true); else start();
      } catch (ex) {
        err.textContent = ex.message; err.hidden = false; btn.disabled = false; btn.textContent = 'دخول';
      }
    });
    authCard('لوحة تحكم IBMA', 'إدارة موقع IBMA Accounting Ltd', form);
    pw.focus();
  }

  function passwordForm(onDone, forced) {
    const cur = h('input', { type: 'password', id: 'pw-current', autocomplete: 'current-password', maxlength: 200 });
    const next = h('input', { type: 'password', id: 'pw-next', autocomplete: 'new-password', maxlength: 200 });
    const again = h('input', { type: 'password', id: 'pw-again', autocomplete: 'new-password', maxlength: 200 });
    const err = h('div', { class: 'alert error', role: 'alert', hidden: true });
    const btn = h('button', { type: 'submit', class: 'btn primary block' }, 'حفظ كلمة السر الجديدة');
    const form = h('form', { novalidate: true },
      h('div', { class: 'field' }, h('label', { for: 'pw-current' }, forced ? 'كلمة السر المؤقتة (التي دخلت بها)' : 'كلمة السر الحالية'), cur),
      h('div', { class: 'field' }, h('label', { for: 'pw-next' }, 'كلمة السر الجديدة'), next, h('span', { class: 'help' }, '12 حرفًا على الأقل، تحتوي على حروف وأرقام. لا تستخدم كلمة سر من حساب آخر.')),
      h('div', { class: 'field' }, h('label', { for: 'pw-again' }, 'أعد كتابة كلمة السر الجديدة'), again),
      err, btn);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      if (next.value !== again.value) { err.textContent = 'كلمتا السر الجديدتان غير متطابقتين.'; err.hidden = false; return; }
      btn.disabled = true;
      try {
        await api('/password', { method: 'POST', body: { current: cur.value, next: next.value } });
        toast('تم حفظ كلمة السر الجديدة. تم تسجيل الخروج من الأجهزة الأخرى.');
        onDone();
      } catch (ex) {
        err.textContent = ex.message; err.hidden = false; btn.disabled = false;
      }
    });
    return form;
  }

  function showPasswordChange() {
    setDirty(false);
    authCard('اختر كلمة سر جديدة', 'هذا أول دخول. لأمان اللوحة يجب استبدال كلمة السر المؤقتة بكلمة سر خاصة بك.', passwordForm(start, true));
  }

  // ------------------------------------------------------------------ shell & tabs
  const TABS = [
    ['stats', 'الإحصائيات'],
    ['bookings', 'طلبات المواعيد'],
    ['subscribers', 'المشتركون'],
    ['services', 'الخدمات'],
    ['slider', 'صور السلايدر'],
    ['campaign', 'الحملة الضريبية'],
    ['contact', 'التواصل وساعات العمل'],
    ['about', 'عن المحاسب'],
    ['texts', 'النصوص وSEO'],
    ['privacy', 'سياسة الخصوصية'],
    ['security', 'الأمان'],
  ];
  let main, tabButtons = {}, currentTab = 'stats', content = null, defaults = null;

  async function start() {
    try {
      const me = await api('/me');
      if (me.mustChange) return showPasswordChange();
    } catch (ex) {
      if (ex.status === 401) return showLogin();
      if (ex.status !== 403) return authCard('تعذّر الاتصال', ex.message, h('button', { class: 'btn primary block', onclick: start }, 'إعادة المحاولة'));
      return;
    }
    const nav = h('nav', { class: 'tabs', role: 'tablist', 'aria-label': 'أقسام اللوحة' });
    for (const [id, label] of TABS) {
      const b = h('button', { type: 'button', class: 'tab', role: 'tab', id: 'tab-' + id, 'aria-selected': 'false', onclick: () => openTab(id) }, h('span', null, label));
      tabButtons[id] = b;
      nav.append(b);
    }
    main = h('main', { class: 'content', id: 'panel', role: 'tabpanel', tabindex: '-1' });
    const logout = h('button', { type: 'button', class: 'btn small', onclick: async () => {
      if (!confirmLeave()) return;
      try { await api('/logout', { method: 'POST' }); } catch { /* ignore */ }
      showLogin();
    } }, 'خروج');
    app.replaceChildren(h('div', { class: 'shell' },
      h('header', { class: 'topbar' },
        h('div', { class: 'title' }, h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, 'IBMA'), h('span', null, 'لوحة التحكم')),
        h('div', { class: 'actions' }, h('a', { class: 'btn small', href: '/', target: '_blank', rel: 'noopener' }, 'عرض الموقع'), logout)),
      nav, main));
    const fromHash = location.hash.slice(1);
    openTab(TABS.some(([id]) => id === fromHash) ? fromHash : 'stats', true);
    refreshBadge();
  }

  async function refreshBadge() {
    try {
      const s = await api('/stats?days=1');
      const b = tabButtons.bookings;
      b.querySelector('.badge')?.remove();
      if (s.counts.newBookings > 0) b.append(h('span', { class: 'badge', 'aria-label': `${s.counts.newBookings} طلب جديد` }, String(s.counts.newBookings)));
    } catch { /* ignore */ }
  }

  async function loadContent(force = false) {
    if (content && !force) return;
    const r = await api('/content');
    content = r.content;
    defaults = r.defaults;
  }

  async function openTab(id, initial = false) {
    if (!initial && id !== currentTab && !confirmLeave()) return;
    setDirty(false);
    saveState = null;
    currentTab = id;
    history.replaceState(null, '', '#' + id);
    for (const [tid, b] of Object.entries(tabButtons)) b.setAttribute('aria-selected', String(tid === id));
    tabButtons[id].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    show(h('div', { class: 'loading' }, 'جارٍ التحميل...'));
    try {
      await VIEWS[id]();
    } catch (ex) {
      if (ex.status === 401 || ex.status === 403) return;
      show(h('div', { class: 'alert error' }, ex.message), h('button', { class: 'btn', onclick: () => openTab(id, true) }, 'إعادة المحاولة'));
    }
  }

  /** Replaces the panel content, skipping empty parts (never prints "null"). */
  function show(...nodes) {
    main.replaceChildren(...nodes.flat().filter((n) => n !== null && n !== undefined && n !== false));
  }

  function header(title, hint) {
    return [h('h2', { class: 'section-title' }, title), hint ? h('p', { class: 'section-hint' }, hint) : null];
  }

  /** Bottom bar with save + restore defaults for a content section. */
  function saveBar(section, collect, after) {
    saveState = h('span', { class: 'state' }, 'كل التغييرات محفوظة');
    const save = h('button', { type: 'button', class: 'btn primary' }, 'حفظ');
    const reset = h('button', { type: 'button', class: 'btn small' }, 'استعادة الافتراضي');
    save.addEventListener('click', async () => {
      save.disabled = true; save.textContent = 'جارٍ الحفظ...';
      try {
        const r = await api('/content/' + section, { method: 'PUT', body: { value: collect() } });
        content[section] = r.value;
        setDirty(false);
        toast('تم الحفظ. يظهر التغيير في الموقع خلال أقل من دقيقة.');
        if (after) after(r.value);
      } catch (ex) {
        if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true);
      } finally { save.disabled = false; save.textContent = 'حفظ'; }
    });
    reset.addEventListener('click', async () => {
      if (!confirm('سيتم حذف تعديلاتك في هذا القسم والعودة إلى النص الأصلي. هل أنت متأكد؟')) return;
      try {
        const r = await api('/content/' + section + '/reset', { method: 'POST' });
        content[section] = r.value;
        setDirty(false);
        toast('تمت استعادة المحتوى الأصلي.');
        openTab(section === 'hero' || section === 'trust' || section === 'newsletter' || section === 'seo' ? 'texts' : currentTab, true);
      } catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
    });
    return h('div', { class: 'savebar' }, saveState, save, reset);
  }

  // ------------------------------------------------------------------ views
  const EVENT_LABELS = {
    view: 'زيارات الصفحة الرئيسية', view_privacy: 'زيارات سياسة الخصوصية', booking: 'طلبات مواعيد مُرسلة', booking_open: 'ضغطات زر الحجز',
    service_open: 'فتح تفاصيل خدمة', whatsapp: 'ضغطات واتساب', call: 'ضغطات الاتصال', email: 'ضغطات البريد الإلكتروني',
    directions: 'طلب الاتجاهات', map: 'فتح الخريطة', subscribe: 'اشتراكات جديدة', unsubscribe: 'إلغاء اشتراك',
  };
  let statsDays = 30;

  const VIEWS = {
    async stats() {
      const s = await api('/stats?days=' + statsDays);
      const totals = {}, byDay = {}, byLang = { ar: 0, en: 0, fr: 0 };
      for (const r of s.rows) {
        totals[r.event] = (totals[r.event] || 0) + r.count;
        if (r.event === 'view') { byDay[r.day] = (byDay[r.day] || 0) + r.count; byLang[r.lang] = (byLang[r.lang] || 0) + r.count; }
      }
      const days = [];
      for (let t = Date.parse(s.from + 'T12:00:00Z'); t <= Date.parse(s.to + 'T12:00:00Z'); t += 86400000) days.push(new Date(t).toISOString().slice(0, 10));
      const max = Math.max(1, ...days.map((d) => byDay[d] || 0));

      const seg = h('div', { class: 'segmented', role: 'group', 'aria-label': 'الفترة' });
      for (const d of [7, 30, 90, 365]) {
        seg.append(h('button', { type: 'button', 'aria-pressed': String(d === statsDays), onclick: () => { statsDays = d; openTab('stats', true); } }, d === 365 ? 'سنة' : `${d} يومًا`));
      }
      const kpi = (value, label, cls) => h('div', { class: 'kpi' + (cls ? ' ' + cls : '') }, h('div', { class: 'value' }, fmtNumber(value)), h('div', { class: 'label' }, label));
      const chart = h('div', { class: 'chart', role: 'img', 'aria-label': 'زيارات الصفحة الرئيسية يوميًا' });
      for (const d of days) {
        const v = byDay[d] || 0;
        const bar = h('div', { class: 'bar' + (v ? '' : ' zero'), title: `${fmtShortDay(d)}: ${v}` });
        bar.style.height = v ? `${Math.max(3, (v / max) * 100)}%` : '2px';
        chart.append(bar);
      }
      const table = h('table', { class: 'simple' }, h('thead', null, h('tr', null, h('th', null, 'الحدث'), h('th', { class: 'num' }, 'العدد'))),
        h('tbody', null, s.events.map((e) => h('tr', null, h('td', null, EVENT_LABELS[e] || e), h('td', { class: 'num' }, fmtNumber(totals[e] || 0))))));
      const langTotal = byLang.ar + byLang.en + byLang.fr;
      const pct = (n) => (langTotal ? Math.round((n / langTotal) * 100) : 0) + '%';

      show(
        ...header('الإحصائيات', 'أرقام مجهولة الهوية: لا تُحفظ أسماء الزوار ولا عناوينهم في الإحصائيات، ولا يُحسب زوار محركات البحث. التاريخ بتوقيت أوتاوا.'),
        h('div', { class: 'toolbar' }, seg),
        h('div', { class: 'kpis' },
          kpi(totals.view || 0, 'زيارات الموقع'),
          kpi(totals.booking || 0, 'طلبات مواعيد'),
          kpi(s.counts.newBookings, 'طلبات جديدة لم تُعالج', s.counts.newBookings ? 'alert-kpi' : ''),
          kpi(totals.whatsapp || 0, 'ضغطات واتساب'),
          kpi(totals.call || 0, 'ضغطات الاتصال'),
          kpi(s.counts.activeSubscribers, 'مشتركون نشطون')),
        h('div', { class: 'card' }, h('h3', null, 'الزيارات اليومية'), chart, h('div', { class: 'chart-axis' }, h('span', null, fmtShortDay(days[0])), h('span', null, fmtShortDay(days[days.length - 1])))),
        h('div', { class: 'card' }, h('h3', null, 'لغة الزوار'), h('table', { class: 'simple' }, h('tbody', null,
          h('tr', null, h('td', null, 'العربية'), h('td', { class: 'num' }, `${fmtNumber(byLang.ar)} (${pct(byLang.ar)})`)),
          h('tr', null, h('td', null, 'English'), h('td', { class: 'num' }, `${fmtNumber(byLang.en)} (${pct(byLang.en)})`)),
          h('tr', null, h('td', null, 'Français'), h('td', { class: 'num' }, `${fmtNumber(byLang.fr)} (${pct(byLang.fr)})`))))),
        h('div', { class: 'card' }, h('h3', null, 'كل الأحداث في الفترة'), table),
      );
    },

    async bookings() { await renderBookings(); },
    async subscribers() { await renderSubscribers(); },

    async services() {
      await loadContent();
      const value = clone(content.services);
      const list = h('div');
      const editors = {};
      const render = () => {
        list.replaceChildren();
        value.order.forEach((id, index) => {
          if (!editors[id]) {
            const it = value.items[id];
            const title = langField('اسم الخدمة', it.title, { max: 90 });
            const short = langField('الوصف المختصر (يظهر في البطاقة)', it.shortDesc, { max: 220, multiline: true, rows: 2 });
            const desc = langField('الوصف الكامل (يظهر في نافذة التفاصيل)', it.description, { max: 600, multiline: true, rows: 3 });
            const benefits = langField('المزايا (كل ميزة في سطر، حتى 6)', { ar: it.benefits.ar.join('\n'), en: it.benefits.en.join('\n'), fr: it.benefits.fr.join('\n') }, { max: 600, multiline: true, rows: 3 });
            const visible = h('input', { type: 'checkbox', checked: !value.hidden.includes(id) });
            visible.addEventListener('change', () => {
              setDirty(true);
              value.hidden = visible.checked ? value.hidden.filter((x) => x !== id) : [...value.hidden, id];
              render();
            });
            editors[id] = { title, short, desc, benefits, visible, open: false };
          }
          const ed = editors[id];
          const isHidden = value.hidden.includes(id);
          const up = h('button', { type: 'button', class: 'btn small', 'aria-label': 'تحريك للأعلى', disabled: index === 0, onclick: (e) => { e.preventDefault(); move(index, -1); } }, '▲');
          const down = h('button', { type: 'button', class: 'btn small', 'aria-label': 'تحريك للأسفل', disabled: index === value.order.length - 1, onclick: (e) => { e.preventDefault(); move(index, 1); } }, '▼');
          const det = h('details', { class: 'service' + (isHidden ? ' is-hidden' : ''), open: ed.open || undefined },
            h('summary', null, h('span', { class: 'svc-num' }, String(index + 1).padStart(2, '0')), h('span', { class: 'svc-title' }, ed.title.get().ar || id), h('span', { class: 'order-btns' }, up, down)),
            h('div', { class: 'svc-body' },
              h('label', { class: 'switch' }, ed.visible, 'ظاهرة في الموقع'),
              ed.title.el, ed.short.el, ed.desc.el, ed.benefits.el));
          det.addEventListener('toggle', () => { ed.open = det.open; });
          list.append(det);
        });
      };
      const move = (index, delta) => {
        const j = index + delta;
        [value.order[index], value.order[j]] = [value.order[j], value.order[index]];
        setDirty(true);
        render();
      };
      render();
      const collect = () => {
        const items = {};
        for (const id of value.order) {
          const ed = editors[id];
          const b = ed.benefits.get();
          const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
          items[id] = { title: ed.title.get(), shortDesc: ed.short.get(), description: ed.desc.get(), benefits: { ar: lines(b.ar), en: lines(b.en), fr: lines(b.fr) } };
        }
        return { order: value.order, hidden: value.hidden, items };
      };
      show(...header('الخدمات', 'رتّب الخدمات بالأسهم، أو أخفِ خدمة دون حذفها، واضغط على أي خدمة لتعديل نصوصها باللغات الثلاث. الخدمة المخفية لا تظهر في الموقع ولا في نموذج الحجز.'), list, saveBar('services', collect));
    },

    async slider() {
      await loadContent();
      const BUILTIN = {
        'builtin:business-needs': 'تصميم «حلول الأعمال»',
        'builtin:self-employed': 'تصميم «العمل الحر»',
        'builtin:tax-campaign': 'تصميم «حملة الضرائب»',
      };
      const preview = (src) => (src.startsWith('builtin:') ? `/admin/posters/${src.slice(8)}.webp` : src);
      const slides = clone(content.slider.slides).map((sl) => ({ ...sl, editor: null }));
      const list = h('div');
      const addBox = h('div', { class: 'row' });
      const MAX = 12;

      const render = () => {
        list.replaceChildren();
        if (!slides.length) list.append(h('div', { class: 'empty' }, 'لا توجد صور. السلايدر مخفي في الموقع حتى تضيف صورة.'));
        slides.forEach((sl, i) => {
          if (!sl.editor) sl.editor = langField('وصف الصورة (لقارئات الشاشة وGoogle)', sl.alt, { max: 140 });
          const up = h('button', { type: 'button', class: 'btn small', 'aria-label': 'تحريك للأعلى', disabled: i === 0, onclick: () => { collect(); [slides[i - 1], slides[i]] = [slides[i], slides[i - 1]]; setDirty(true); render(); } }, '▲');
          const down = h('button', { type: 'button', class: 'btn small', 'aria-label': 'تحريك للأسفل', disabled: i === slides.length - 1, onclick: () => { collect(); [slides[i + 1], slides[i]] = [slides[i], slides[i + 1]]; setDirty(true); render(); } }, '▼');
          const del = h('button', { type: 'button', class: 'btn small danger', onclick: () => {
            if (!confirm('إزالة هذه الصورة من السلايدر؟ الصورة المرفوعة تُحذف نهائيًا بعد الحفظ.')) return;
            collect(); slides.splice(i, 1); setDirty(true); render();
          } }, 'إزالة');
          list.append(h('div', { class: 'card slide-card' },
            h('div', { class: 'slide-head' },
              h('img', { src: preview(sl.src), alt: '', class: 'slide-thumb' }),
              h('div', { class: 'slide-info' }, h('strong', null, `الصورة ${i + 1}`), h('span', { class: 'help' }, BUILTIN[sl.src] || 'صورة مرفوعة'), h('div', { class: 'row' }, up, down, del))),
            sl.editor.el));
        });
        addBox.replaceChildren();
        if (slides.length >= MAX) { addBox.append(h('span', { class: 'help' }, `وصلت إلى الحد الأقصى (${MAX} صورة).`)); return; }
        addBox.append(pick);
        for (const [key, label] of Object.entries(BUILTIN)) {
          if (!slides.some((sl) => sl.src === key)) addBox.append(h('button', { type: 'button', class: 'btn small', onclick: () => { collect(); slides.push({ src: key, alt: { ar: '', en: '', fr: '' }, editor: null }); setDirty(true); render(); } }, '+ ' + label));
        }
      };
      const collect = () => slides.forEach((sl) => { if (sl.editor) sl.alt = sl.editor.get(); });

      const file = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', class: 'visually-hidden', multiple: true });
      const status = h('span', { class: 'help', role: 'status' });
      const pick = h('button', { type: 'button', class: 'btn small primary', onclick: () => file.click() }, '+ رفع صورة جديدة');
      file.addEventListener('change', async () => {
        const files = [...(file.files || [])];
        file.value = '';
        for (const f of files) {
          if (slides.length >= MAX) { toast(`الحد الأقصى ${MAX} صورة.`, true); break; }
          if (f.size > 5 * 1024 * 1024) { toast(`«${f.name}» أكبر من 5 ميغابايت.`, true); continue; }
          status.textContent = `جارٍ رفع «${f.name}»...`;
          try {
            const r = await api('/photo?kind=slide', { method: 'POST', body: f, raw: true, contentType: f.type || 'application/octet-stream' });
            collect();
            slides.push({ src: r.url, alt: { ar: '', en: '', fr: '' }, editor: null });
            setDirty(true);
            render();
          } catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        }
        status.textContent = dirty ? 'تم الرفع. اضغط «حفظ» لإظهار الصور في الموقع.' : '';
      });
      render();

      show(...header('صور السلايدر', 'الصور المتحركة أعلى قسم «خدمات IBMA والحلول المتكاملة». تتبدل تلقائيًا كل 5 ثوانٍ، ويمكن للزائر تحريكها بإصبعه. الأفضل صور مربعة تقريبًا (مثل 1080×1000)، بصيغة JPG أو PNG أو WebP حتى 5 ميغابايت.'),
        list,
        h('div', { class: 'card' }, h('h3', null, 'إضافة صورة'), addBox, file, status),
        saveBar('slider', () => { collect(); return { slides: slides.map((sl) => ({ src: sl.src, alt: sl.alt })) }; }));
    },

    async campaign() {
      await loadContent();
      const c = content.campaign;
      const enabled = toggleField('إظهار قسم الحملة في الموقع', c.enabled, 'أوقفه خارج موسم الضرائب وأعد تشغيله عند بدايته.');
      const title = langField('العنوان', c.title, { max: 120 });
      const subtitle = langField('النص', c.subtitle, { max: 400, multiline: true, rows: 3 });
      const cta = langField('نص الزر', c.cta, { max: 50 });
      show(...header('الحملة الضريبية', 'القسم الإعلاني لموسم الضرائب مع صورة الحملة.'),
        h('div', { class: 'card' }, enabled.el, title.el, subtitle.el, cta.el),
        saveBar('campaign', () => ({ enabled: enabled.get(), title: title.get(), subtitle: subtitle.get(), cta: cta.get() })));
    },

    async contact() {
      await loadContent();
      const c = content.contact;
      const phone = singleField('رقم الهاتف (كما يظهر للزوار)', c.phone, { max: 30, type: 'tel', dir: 'ltr' });
      const whatsapp = singleField('رقم واتساب', c.whatsapp, { max: 20, type: 'tel', dir: 'ltr', help: 'أرقام فقط مع رمز الدولة ودون + أو مسافات. مثال: 16138800300' });
      const email = singleField('البريد الإلكتروني', c.email, { max: 254, type: 'email', dir: 'ltr' });
      const address = singleField('العنوان', c.address, { max: 200, dir: 'ltr', help: 'يُستخدم أيضًا للخريطة وزر الاتجاهات.' });
      const facebook = singleField('رابط فيسبوك', c.facebookUrl, { max: 300, type: 'url', dir: 'ltr', help: 'اتركه فارغًا لإخفاء أيقونة فيسبوك.' });
      const reviews = singleField('رابط تقييمات Google', c.googleReviewsUrl, { max: 300, type: 'url', dir: 'ltr', help: 'اتركه فارغًا لإخفاء قسم التقييمات.' });

      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const hours = clone(content.hours.days);
      const rows = [1, 2, 3, 4, 5, 6, 0].map((i) => {
        const d = hours[i];
        const closed = h('input', { type: 'checkbox', checked: d.closed, 'aria-label': `${dayNames[i]} مغلق` });
        const open = h('input', { type: 'time', value: d.open, step: 900, 'aria-label': `${dayNames[i]} من` });
        const close = h('input', { type: 'time', value: d.close, step: 900, 'aria-label': `${dayNames[i]} إلى` });
        const row = h('div', { class: 'hours-row' + (d.closed ? ' closed' : '') },
          h('span', { class: 'day' }, dayNames[i]), h('label', { class: 'switch' }, closed, 'مغلق'),
          h('div', { class: 'hours-times' }, h('label', null, h('span', null, 'من'), open), h('label', null, h('span', null, 'إلى'), close)));
        const sync = () => { row.classList.toggle('closed', closed.checked); open.disabled = close.disabled = closed.checked; setDirty(true); };
        closed.addEventListener('change', sync);
        open.addEventListener('input', () => setDirty(true));
        close.addEventListener('input', () => setDirty(true));
        open.disabled = close.disabled = d.closed;
        return { i, closed, open, close, row };
      });

      // Two sections are saved together: contact and hours.
      saveState = h('span', { class: 'state' }, 'كل التغييرات محفوظة');
      const save = h('button', { type: 'button', class: 'btn primary' }, 'حفظ');
      save.addEventListener('click', async () => {
        save.disabled = true;
        try {
          const days = clone(hours);
          for (const r of rows) days[r.i] = { closed: r.closed.checked, open: r.open.value, close: r.close.value };
          const c1 = await api('/content/contact', { method: 'PUT', body: { value: { phone: phone.get(), whatsapp: whatsapp.get(), email: email.get(), address: address.get(), facebookUrl: facebook.get(), googleReviewsUrl: reviews.get() } } });
          const c2 = await api('/content/hours', { method: 'PUT', body: { value: { days } } });
          content.contact = c1.value; content.hours = c2.value;
          setDirty(false);
          toast('تم الحفظ. يظهر التغيير في الموقع خلال أقل من دقيقة.');
        } catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        finally { save.disabled = false; }
      });
      show(...header('التواصل وساعات العمل', 'تظهر هذه البيانات في كل أنحاء الموقع. ساعات العمل بتوقيت أوتاوا، وتحدد أيضًا الأوقات المتاحة في نموذج الحجز وحالة «مفتوح الآن».'),
        h('div', { class: 'card' }, h('h3', null, 'بيانات التواصل'), h('div', { class: 'grid-2' }, phone.el, whatsapp.el), email.el, address.el, h('div', { class: 'grid-2' }, facebook.el, reviews.el)),
        h('div', { class: 'card' }, h('h3', null, 'ساعات العمل (بتوقيت أوتاوا)'), ...rows.map((r) => r.row)),
        h('div', { class: 'savebar' }, saveState, save));
    },

    async about() {
      await loadContent();
      const a = clone(content.about);
      let photo = a.photo;
      const img = h('img', { alt: 'صورة المحاسب', src: photo || '/admin/default-photo.webp' });
      const file = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', id: 'photo-file', class: 'visually-hidden' });
      const status = h('span', { class: 'help' }, photo ? '' : 'تُعرض حاليًا الصورة الأصلية للموقع.');
      const removeBtn = h('button', { type: 'button', class: 'btn small danger', hidden: !photo, onclick: () => { photo = ''; img.src = '/admin/default-photo.webp'; removeBtn.hidden = true; status.textContent = 'ستُستخدم الصورة الأصلية بعد الحفظ.'; setDirty(true); } }, 'استخدام الصورة الأصلية');
      file.addEventListener('change', async () => {
        const f = file.files && file.files[0];
        if (!f) return;
        if (f.size > 3 * 1024 * 1024) { toast('الصورة أكبر من 3 ميغابايت.', true); return; }
        status.textContent = 'جارٍ رفع الصورة...';
        try {
          const r = await api('/photo', { method: 'POST', body: f, raw: true, contentType: f.type || 'application/octet-stream' });
          photo = r.url; img.src = r.url; removeBtn.hidden = false;
          status.textContent = 'تم رفع الصورة. اضغط «حفظ» لاعتمادها في الموقع.';
          setDirty(true);
        } catch (ex) { status.textContent = ''; if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        file.value = '';
      });
      const pick = h('button', { type: 'button', class: 'btn small', onclick: () => file.click() }, 'اختيار صورة جديدة');

      const name = langField('الاسم', a.name, { max: 60 });
      const title = langField('عنوان القسم', a.title, { max: 160 });
      const role = langField('الصفة والخبرة', a.role, { max: 160 });
      const bio1 = langField('الفقرة الأولى', a.bioP1, { max: 900, multiline: true, rows: 5 });
      const bio2 = langField('الفقرة الثانية (اختيارية)', a.bioP2, { max: 900, multiline: true, rows: 4 });
      const showBadge = toggleField('إظهار شارة الاعتماد تحت الصورة', a.showVerifiedBadge, 'لا تُظهرها إلا إذا كانت صحيحة ومؤكدة من المحاسب.');
      const badge = langField('نص الشارة', a.verifiedBadge, { max: 100 });

      const statsBox = h('div');
      const stats = a.stats.map((s) => ({ val: s.val, label: s.label }));
      const statEditors = [];
      const renderStats = () => {
        statsBox.replaceChildren();
        statEditors.length = 0;
        stats.forEach((s, i) => {
          const val = textInput(s.val, { max: 12, dir: 'ltr', placeholder: '15+' });
          val.setAttribute('aria-label', `الرقم ${i + 1}`);
          const label = langField(`وصف الرقم ${i + 1}`, s.label, { max: 50 });
          const del = h('button', { type: 'button', class: 'btn small danger', onclick: () => { collectStats(); stats.splice(i, 1); setDirty(true); renderStats(); } }, 'حذف');
          statEditors.push({ val, label });
          statsBox.append(h('div', { class: 'stat-row' }, h('div', { class: 'row' }, h('span', { class: 'label' }, `الرقم ${i + 1}`), val, del), label.el));
        });
        if (stats.length < 4) statsBox.append(h('button', { type: 'button', class: 'btn small', onclick: () => { collectStats(); stats.push({ val: '', label: { ar: '', en: '', fr: '' } }); setDirty(true); renderStats(); } }, '+ إضافة رقم'));
      };
      const collectStats = () => statEditors.forEach((e, i) => { stats[i] = { val: e.val.value, label: e.label.get() }; });
      renderStats();

      show(...header('عن المحاسب', 'الصورة والسيرة والأرقام. اكتب أرقامًا حقيقية فقط يمكن إثباتها.'),
        h('div', { class: 'card' }, h('h3', null, 'الصورة'), h('div', { class: 'photo-box' }, img, h('div', { class: 'row' }, pick, removeBtn, file)), status, h('span', { class: 'help' }, 'JPG أو PNG أو WebP، حتى 3 ميغابايت. يفضل صورة مربعة.')),
        h('div', { class: 'card' }, h('h3', null, 'النصوص'), name.el, title.el, role.el, bio1.el, bio2.el),
        h('div', { class: 'card' }, h('h3', null, 'الشارة'), showBadge.el, badge.el),
        h('div', { class: 'card' }, h('h3', null, 'الأرقام (حتى 4)'), statsBox),
        saveBar('about', () => {
          collectStats();
          return { name: name.get(), title: title.get(), role: role.get(), bioP1: bio1.get(), bioP2: bio2.get(), showVerifiedBadge: showBadge.get(), verifiedBadge: badge.get(), stats, photo };
        }));
    },

    async texts() {
      await loadContent();
      const hero = content.hero, trust = content.trust, nl = content.newsletter, seo = content.seo;
      const hBadge = langField('الشارة أعلى العنوان', hero.badge, { max: 120 });
      const hH1 = langField('العنوان الرئيسي', hero.h1, { max: 90 });
      const hSub = langField('النص التعريفي', hero.subtitle, { max: 400, multiline: true, rows: 3 });
      const tShow = toggleField('إظهار شارة CRA (أعلى الموقع وأسفله)', trust.showCraBadge, 'لا تُظهرها إلا إذا كان المكتب مسجلًا فعلًا كممثل ومقدّم إلكتروني لدى CRA.');
      const tText = langField('نص شارة CRA في أسفل الموقع', trust.craBadge, { max: 80 });
      const nShow = toggleField('إظهار قسم «اشترك لتصلك عروضنا»', nl.enabled);
      const nTitle = langField('عنوان قسم الاشتراك', nl.title, { max: 80 });
      const nText = langField('نص قسم الاشتراك', nl.text, { max: 300, multiline: true, rows: 2 });
      const sTitle = langField('عنوان الصفحة في Google', seo.title, { max: 70, help: 'الأفضل بين 50 و 60 حرفًا.' });
      const sDesc = langField('وصف الصفحة في Google', seo.description, { max: 300, multiline: true, rows: 3, help: 'الأفضل بين 120 و 160 حرفًا، ويتضمن المدينة والخدمات الأساسية.' });

      const previewLang = { v: 'en' };
      const serp = h('div', { class: 'serp' });
      const seg = h('div', { class: 'segmented', role: 'group', 'aria-label': 'لغة المعاينة' });
      const drawSerp = () => {
        const path = previewLang.v === 'ar' ? '/' : `/${previewLang.v}/`;
        serp.dir = previewLang.v === 'ar' ? 'rtl' : 'ltr';
        serp.replaceChildren(h('div', { class: 's' }, location.host + path), h('div', { class: 'u' }, sTitle.get()[previewLang.v]), h('div', { class: 'd' }, sDesc.get()[previewLang.v]));
        for (const b of seg.children) b.setAttribute('aria-pressed', String(b.dataset.l === previewLang.v));
      };
      for (const [code, label] of LANGS) seg.append(h('button', { type: 'button', 'data-l': code, onclick: () => { previewLang.v = code; drawSerp(); } }, label));
      for (const f of [sTitle, sDesc]) for (const i of Object.values(f.inputs)) i.addEventListener('input', drawSerp);
      drawSerp();

      saveState = h('span', { class: 'state' }, 'كل التغييرات محفوظة');
      const save = h('button', { type: 'button', class: 'btn primary' }, 'حفظ');
      save.addEventListener('click', async () => {
        save.disabled = true;
        try {
          const parts = [
            ['hero', { badge: hBadge.get(), h1: hH1.get(), subtitle: hSub.get() }],
            ['trust', { showCraBadge: tShow.get(), craBadge: tText.get() }],
            ['newsletter', { enabled: nShow.get(), title: nTitle.get(), text: nText.get() }],
            ['seo', { title: sTitle.get(), description: sDesc.get() }],
          ];
          for (const [section, value] of parts) {
            const r = await api('/content/' + section, { method: 'PUT', body: { value } });
            content[section] = r.value;
          }
          setDirty(false);
          toast('تم الحفظ. يظهر التغيير في الموقع خلال أقل من دقيقة.');
        } catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        finally { save.disabled = false; }
      });

      show(...header('النصوص وSEO', 'نصوص الواجهة الرئيسية، والشارات، وقسم الاشتراك، وطريقة ظهور الموقع في نتائج Google.'),
        h('div', { class: 'card' }, h('h3', null, 'الواجهة الرئيسية'), hBadge.el, hH1.el, hSub.el),
        h('div', { class: 'card' }, h('h3', null, 'شارة CRA'), tShow.el, tText.el),
        h('div', { class: 'card' }, h('h3', null, 'قسم الاشتراك في العروض'), nShow.el, nTitle.el, nText.el),
        h('div', { class: 'card' }, h('h3', null, 'الظهور في Google (SEO)'), sTitle.el, sDesc.el, h('div', { class: 'field' }, h('div', { class: 'label' }, 'معاينة تقريبية لنتيجة البحث'), seg, serp)),
        h('div', { class: 'savebar' }, saveState, save));
    },

    async privacy() {
      await loadContent();
      const p = content.privacy;
      const updated = singleField('تاريخ آخر تحديث', p.updated, { type: 'date', dir: 'ltr', help: 'غيّره عند كل تعديل جوهري على السياسة.' });
      const body = langField('نص السياسة', p.body, { max: 20000, multiline: true, tall: true, help: 'سطر يبدأ بـ «## » يصبح عنوانًا، وسطر يبدأ بـ «- » يصبح نقطة في قائمة، والسطر الفارغ يبدأ فقرة جديدة.' });
      show(...header('سياسة الخصوصية', 'سياسة متوافقة مع قانون الخصوصية الكندي (PIPEDA) وقانون مكافحة الرسائل المزعجة (CASL). يُنصح بمراجعتها من المحاسب أو محامٍ قبل اعتمادها النهائي.'),
        h('div', { class: 'alert info' }, 'معاينة: ', h('a', { href: '/privacy', target: '_blank', rel: 'noopener' }, 'العربية'), ' · ', h('a', { href: '/en/privacy', target: '_blank', rel: 'noopener' }, 'English'), ' · ', h('a', { href: '/fr/privacy', target: '_blank', rel: 'noopener' }, 'Français')),
        h('div', { class: 'card' }, updated.el, body.el),
        saveBar('privacy', () => ({ updated: updated.get(), body: body.get() })));
    },

    async security() {
      const out = h('button', { type: 'button', class: 'btn danger', onclick: async () => {
        if (!confirm('سيتم تسجيل الخروج من كل الأجهزة، بما فيها هذا الجهاز. متابعة؟')) return;
        try { await api('/logout-all', { method: 'POST' }); } catch { /* ignore */ }
        showLogin('تم تسجيل الخروج من كل الأجهزة.');
      } }, 'تسجيل الخروج من كل الأجهزة');
      show(...header('الأمان', 'كلمة السر محفوظة مشفّرة ولا يمكن لأحد قراءتها. تنتهي الجلسة بعد 7 أيام، ويُوقف الدخول 15 دقيقة بعد 5 محاولات خاطئة.'),
        h('div', { class: 'card' }, h('h3', null, 'تغيير كلمة السر'), passwordForm(() => openTab('security', true), false)),
        h('div', { class: 'card' }, h('h3', null, 'الجلسات'), h('p', { class: 'section-hint' }, 'استخدمه إذا دخلت من جهاز لا تملكه أو نسيت تسجيل الخروج.'), out),
        h('div', { class: 'card' }, h('h3', null, 'نصائح'), h('ul', null,
          h('li', null, 'لا تشارك كلمة السر عبر واتساب أو البريد.'),
          h('li', null, 'استخدم مدير كلمات السر لحفظها.'),
          h('li', null, 'رابط اللوحة غير موجود في الموقع؛ يُفتح بكتابة /admin بعد اسم الموقع.'))));
    },
  };

  // ------------------------------------------------------------------ appointment requests
  const STATUS = { new: 'جديد', contacted: 'تم التواصل', confirmed: 'مؤكد', done: 'منجز', cancelled: 'ملغى' };
  const LANG_NAME = { ar: 'العربية', en: 'English', fr: 'Français' };
  const bState = { status: '', q: '', page: 1 };

  async function renderBookings() {
    const params = new URLSearchParams({ page: String(bState.page) });
    if (bState.status) params.set('status', bState.status);
    if (bState.q) params.set('q', bState.q);
    const r = await api('/bookings?' + params);
    const counts = Object.fromEntries(r.byStatus.map((x) => [x.status, x.n]));
    const all = r.byStatus.reduce((s, x) => s + x.n, 0);

    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'تصفية حسب الحالة' });
    for (const [k, label] of [['', 'الكل'], ...Object.entries(STATUS)]) {
      const n = k ? counts[k] || 0 : all;
      chips.append(h('button', { type: 'button', class: 'chip', 'aria-pressed': String(bState.status === k), onclick: () => { bState.status = k; bState.page = 1; openTab('bookings', true); } }, `${label} (${fmtNumber(n)})`));
    }
    const search = h('input', { type: 'search', placeholder: 'بحث بالاسم أو الهاتف أو البريد', value: bState.q, 'aria-label': 'بحث' });
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { bState.q = search.value.trim(); bState.page = 1; openTab('bookings', true); } });
    const csv = h('a', { class: 'btn small', href: '/api/admin/bookings.csv', download: '' }, 'تنزيل Excel (CSV)');

    const list = h('div');
    if (!r.rows.length) list.append(h('div', { class: 'empty' }, bState.q || bState.status ? 'لا توجد نتائج.' : 'لا توجد طلبات مواعيد بعد.'));
    for (const b of r.rows) list.append(bookingCard(b));

    show(...header('طلبات المواعيد', 'كل طلب يرسله زائر من نموذج الحجز. الطلب ليس موعدًا مؤكدًا حتى يتواصل المكتب مع الزبون. تُحذف الطلبات تلقائيًا بعد 24 شهرًا.'),
      h('div', { class: 'toolbar' }, search, csv), chips, list, pager(r, (p) => { bState.page = p; openTab('bookings', true); }));
  }

  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  /** International number for call/WhatsApp links: a 10-digit local number is Canadian/US (+1). */
  function intlDigits(s) {
    const d = digits(s);
    return d.length === 10 && !String(s).trim().startsWith('+') ? '1' + d : d;
  }

  function bookingCard(b) {
    const statusSel = h('select', { 'aria-label': 'حالة الطلب' }, Object.entries(STATUS).map(([k, v]) => h('option', { value: k }, v)));
    statusSel.value = b.status;
    const note = h('textarea', { rows: 2, maxlength: 1000, placeholder: 'ملاحظة داخلية للمكتب (لا يراها الزبون)', 'aria-label': 'ملاحظة داخلية' });
    note.value = b.admin_note || '';
    const pill = h('span', { class: 'pill ' + b.status }, STATUS[b.status] || b.status);
    const card = h('article', { class: 'item' + (b.status === 'new' ? ' is-new' : '') });

    statusSel.addEventListener('change', async () => {
      try {
        await api('/bookings/' + b.id, { method: 'PATCH', body: { status: statusSel.value } });
        b.status = statusSel.value;
        pill.className = 'pill ' + b.status; pill.textContent = STATUS[b.status];
        card.classList.toggle('is-new', b.status === 'new');
        toast('تم تحديث الحالة.');
        refreshBadge();
      } catch (ex) { statusSel.value = b.status; if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
    });
    const saveNote = h('button', { type: 'button', class: 'btn small', onclick: async () => {
      try { await api('/bookings/' + b.id, { method: 'PATCH', body: { admin_note: note.value } }); toast('تم حفظ الملاحظة.'); }
      catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
    } }, 'حفظ الملاحظة');
    const del = h('button', { type: 'button', class: 'btn small danger', onclick: async () => {
      if (!confirm(`حذف طلب «${b.name}» نهائيًا؟ لا يمكن التراجع.`)) return;
      try { await api('/bookings/' + b.id, { method: 'DELETE' }); card.remove(); toast('تم حذف الطلب.'); refreshBadge(); }
      catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
    } }, 'حذف');

    const links = [];
    if (b.phone) {
      links.push(h('a', { class: 'btn small', href: 'tel:+' + intlDigits(b.phone) }, 'اتصال'));
      links.push(h('a', { class: 'btn small', href: 'https://wa.me/' + intlDigits(b.phone), target: '_blank', rel: 'noopener noreferrer' }, 'واتساب'));
    }
    if (b.email) links.push(h('a', { class: 'btn small', href: 'mailto:' + encodeURIComponent(b.email).replace('%40', '@') }, 'بريد'));

    card.append(
      h('div', { class: 'item-head' },
        h('div', null, h('div', { class: 'item-name' }, b.name), h('div', { class: 'item-meta' }, `وصل ${fmtDateTime(b.created_at)} (أوتاوا) · لغة الزبون: ${LANG_NAME[b.language] || b.language}`)),
        pill),
      h('div', { class: 'item-body' },
        h('div', null, h('span', { class: 'k' }, 'الخدمة: '), b.service_title),
        h('div', null, h('span', { class: 'k' }, 'الموعد المفضل: '), `${fmtDay(b.preferred_date)} — ${b.preferred_time} (بتوقيت أوتاوا)`),
        b.phone ? h('div', null, h('span', { class: 'k' }, 'الهاتف: '), h('span', { dir: 'ltr' }, b.phone)) : null,
        b.email ? h('div', null, h('span', { class: 'k' }, 'البريد: '), h('span', { dir: 'ltr' }, b.email)) : null,
        b.subscribed ? h('div', { class: 'item-meta' }, 'وافق على استلام العروض عبر البريد.') : null,
        b.notes ? h('div', { class: 'notes' }, b.notes) : null),
      note,
      h('div', { class: 'item-actions' }, statusSel, saveNote, ...links, del));
    return card;
  }

  function pager(r, go) {
    const pages = Math.max(1, Math.ceil(r.total / r.pageSize));
    if (pages <= 1) return null;
    return h('div', { class: 'pager' },
      h('button', { type: 'button', class: 'btn small', disabled: r.page <= 1, onclick: () => go(r.page - 1) }, 'السابق'),
      h('span', null, `صفحة ${fmtNumber(r.page)} من ${fmtNumber(pages)}`),
      h('button', { type: 'button', class: 'btn small', disabled: r.page >= pages, onclick: () => go(r.page + 1) }, 'التالي'));
  }

  // ------------------------------------------------------------------ subscribers
  const sState = { status: 'active', q: '', page: 1 };
  const SOURCE = { newsletter: 'نموذج الاشتراك', booking: 'نموذج الحجز' };

  async function renderSubscribers() {
    const params = new URLSearchParams({ page: String(sState.page) });
    if (sState.status) params.set('status', sState.status);
    if (sState.q) params.set('q', sState.q);
    const [r, s] = await Promise.all([api('/subscribers?' + params), api('/stats?days=1')]);

    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'تصفية' });
    for (const [k, label, n] of [['active', 'نشط', s.counts.activeSubscribers], ['unsubscribed', 'ألغى الاشتراك', s.counts.unsubscribed], ['', 'الكل', s.counts.activeSubscribers + s.counts.unsubscribed]]) {
      chips.append(h('button', { type: 'button', class: 'chip', 'aria-pressed': String(sState.status === k), onclick: () => { sState.status = k; sState.page = 1; openTab('subscribers', true); } }, `${label} (${fmtNumber(n)})`));
    }
    const search = h('input', { type: 'search', placeholder: 'بحث بالاسم أو البريد', value: sState.q, 'aria-label': 'بحث' });
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { sState.q = search.value.trim(); sState.page = 1; openTab('subscribers', true); } });
    const csv = h('a', { class: 'btn small primary', href: '/api/admin/subscribers.csv', download: '' }, 'تنزيل المشتركين النشطين (CSV)');

    const list = h('div');
    if (!r.rows.length) list.append(h('div', { class: 'empty' }, 'لا يوجد مشتركون في هذه القائمة.'));
    for (const sub of r.rows) {
      const card = h('article', { class: 'item' });
      const actions = h('div', { class: 'item-actions' });
      if (sub.status === 'active') {
        actions.append(h('button', { type: 'button', class: 'btn small', onclick: async () => {
          if (!confirm(`إلغاء اشتراك ${sub.email}؟`)) return;
          try { await api(`/subscribers/${sub.id}/unsubscribe`, { method: 'POST' }); toast('تم إلغاء الاشتراك.'); openTab('subscribers', true); }
          catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        } }, 'إلغاء الاشتراك'));
      }
      if (sub.status === 'unsubscribed' && sub.resubscribe_requested_at) {
        actions.append(h('button', { type: 'button', class: 'btn small primary', onclick: async () => {
          if (!confirm(`هل تأكدت مباشرة من صاحب البريد ${sub.email} أنه يريد استلام العروض من جديد؟\nلا تفعّل الاشتراك دون موافقته، لأن أي شخص قد يكتب بريد غيره.`)) return;
          try { await api(`/subscribers/${sub.id}/reactivate`, { method: 'POST' }); toast('تمت إعادة تفعيل الاشتراك.'); openTab('subscribers', true); }
          catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
        } }, 'إعادة التفعيل بعد التأكد'));
      }
      actions.append(h('button', { type: 'button', class: 'btn small danger', onclick: async () => {
        if (!confirm(`حذف ${sub.email} نهائيًا من القائمة؟\nاستخدمه فقط إذا طلب الشخص حذف بياناته. بعد الحذف لا يبقى سجل بأنه ألغى الاشتراك.`)) return;
        try { await api('/subscribers/' + sub.id, { method: 'DELETE' }); card.remove(); toast('تم الحذف.'); }
        catch (ex) { if (ex.status !== 401 && ex.status !== 403) toast(ex.message, true); }
      } }, 'حذف نهائي'));
      card.append(
        h('div', { class: 'item-head' },
          h('div', null, h('div', { class: 'item-name' }, sub.name), h('div', { dir: 'ltr', class: 'item-meta' }, sub.email)),
          h('span', { class: 'pill ' + sub.status }, sub.status === 'active' ? 'نشط' : 'ألغى الاشتراك')),
        h('div', { class: 'item-meta' }, `الموافقة: ${fmtDateTime(sub.consent_at)} · المصدر: ${SOURCE[sub.source] || sub.source} · اللغة: ${LANG_NAME[sub.language] || sub.language}` + (sub.unsubscribed_at ? ` · ألغى في ${fmtDateTime(sub.unsubscribed_at)}` : '')),
        sub.status === 'unsubscribed' && sub.resubscribe_requested_at
          ? h('div', { class: 'alert warn' }, `طلب اشتراك جديد بهذا البريد في ${fmtDateTime(sub.resubscribe_requested_at)}. لم يُفعَّل تلقائيًا لأن صاحبه ألغى اشتراكه سابقًا: تواصل معه وتأكد أولًا.`)
          : null,
        actions);
      list.append(card);
    }

    show(...header('المشتركون في العروض', 'من وافق على استلام العروض عبر البريد. القانون الكندي (CASL) يشترط: مراسلة من وافق فقط، وذكر اسم المكتب وعنوانه في كل رسالة، ووضع رابط إلغاء الاشتراك. ملف CSV يحتوي رابط الإلغاء الخاص بكل مشترك لاستخدامه في برنامج المراسلة.'),
      h('div', { class: 'toolbar' }, search, csv), chips, list, pager(r, (p) => { sState.page = p; openTab('subscribers', true); }));
  }

  // ------------------------------------------------------------------ boot
  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (main && tabButtons[id] && id !== currentTab) openTab(id);
  });
  start();
})();
