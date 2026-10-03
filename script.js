(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const toast = message => {
    const box = $('.toast'); if (!box) return;
    box.textContent = message; box.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => box.classList.remove('show'), 2300);
  };
  const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(amount) ? amount : 0);

  // Mobile menu and saved color theme.
  const menuButton = $('.menu'), navItems = $('.nav-items');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navItems.classList.toggle('open', open);
  });
  navItems?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navItems.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false');
  }));
  $('.theme')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('cb-theme', next); } catch (_) { /* Continue without storage. */ }
    $('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#10111b' : '#f8f7fc');
  });

  // Scroll indicator, section link highlighting, reveal animation, and back to top.
  const progressLine = $('.progress-line span'), topButton = $('.top');
  const navLinks = $$('.nav-items a');
  const pageSections = $$('main section[id]');
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progressLine) progressLine.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    topButton?.classList.toggle('visible', scrollY > 600);
    let current = '';
    pageSections.forEach(section => { if (section.getBoundingClientRect().top < 145) current = section.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${current}`));
  };
  addEventListener('scroll', updateScroll, { passive: true }); updateScroll();
  topButton?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  const reveals = $$('.section-head,.skill-card,.project,.about-grid,.bridge,.tool-tabs,.tracker,.experience,.education,.github-inner,.contact-grid');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('show'); revealObserver.unobserve(entry.target); }
    }), { threshold: .1 });
    reveals.forEach(element => { element.classList.add('reveal'); revealObserver.observe(element); });
  } else reveals.forEach(element => element.classList.add('show'));

  // Calculator tabs support mouse and keyboard use.
  const tabs = $$('.tool-tabs [role="tab"]'), panels = $$('.tool-panel');
  const openTab = tab => {
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => openTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[target].focus(); openTab(tabs[target]);
    });
  });

  // GST calculator: exclusive/inclusive amounts, with an intra/inter-state split.
  const gstForm = $('#gst-form'), rateSelect = $('#gst-rate'), customRateRow = $('#custom-rate-row');
  const calculateGST = event => {
    event?.preventDefault(); if (!gstForm) return;
    const amount = Math.max(0, Number($('#gst-amount').value) || 0);
    const rate = rateSelect.value === 'custom' ? Math.max(0, Number($('#custom-rate').value) || 0) : Number(rateSelect.value);
    const inclusive = $('input[name="gst-mode"]:checked').value === 'inclusive';
    const taxable = inclusive ? amount / (1 + rate / 100) : amount;
    const tax = inclusive ? amount - taxable : amount * rate / 100;
    $('#gst-taxable').textContent = money(taxable);
    $('#gst-label').textContent = `GST (${rate}%)`;
    $('#gst-tax').textContent = money(tax);
    $('#gst-total').textContent = money(taxable + tax);
    $('#gst-split').textContent = $('#interstate').checked ? `IGST ${money(tax)}` : `CGST ${money(tax / 2)} + SGST ${money(tax / 2)}`;
  };
  rateSelect?.addEventListener('change', () => { customRateRow.hidden = rateSelect.value !== 'custom'; calculateGST(); });
  gstForm?.addEventListener('submit', calculateGST);
  gstForm?.addEventListener('input', calculateGST);

  // Selected resident TDS estimates for the Income-tax Act, 2025 (from 1 Apr 2026).
  const tdsData = {
    'contract-ind': { rate: 1, threshold: 100000, single: 30000, mode: 'year', ref: 'Section 393(1) · Table 6(i)', note: 'Contractor is an individual/HUF. Individual payment threshold ₹30,000; annual aggregate threshold ₹1,00,000.' },
    'contract-other': { rate: 2, threshold: 100000, single: 30000, mode: 'year', ref: 'Section 393(1) · Table 6(i)', note: 'Contractor is another type of payee. Individual payment threshold ₹30,000; annual aggregate threshold ₹1,00,000.' },
    professional: { rate: 10, threshold: 50000, mode: 'year', ref: 'Section 393(1) · Table 6(iii)', note: 'Specified-payer case for professional services. Tax-year threshold ₹50,000; payer type can change the applicable entry.' },
    technical: { rate: 2, threshold: 50000, mode: 'year', ref: 'Section 393(1) · Table 6(iii)', note: 'Specified-payer case for technical services. Tax-year threshold ₹50,000; confirm service classification and payer type.' },
    commission: { rate: 2, threshold: 20000, mode: 'year', ref: 'Section 393(1) · Table 1(ii)', note: 'Commission or brokerage other than insurance commission. Tax-year threshold ₹20,000.' },
    'rent-building': { rate: 10, threshold: 50000, mode: 'month', ref: 'Section 393(1) · Table 2(ii)', note: 'Specified-payer case for land/building, furniture, or fittings. Threshold ₹50,000 per month or part of a month.' },
    'rent-machine': { rate: 2, threshold: 50000, mode: 'month', ref: 'Section 393(1) · Table 2(ii)', note: 'Specified-payer case for machinery, plant, or equipment. Threshold ₹50,000 per month or part of a month.' },
    goods: { rate: .1, threshold: 5000000, mode: 'goods', ref: 'Section 393(1) · Table 8(ii)', note: 'Tax applies only to goods purchases above ₹50 lakh; this estimates the current purchase’s portion above that threshold.' }
  };
  const calculateTDS = () => {
    const select = $('#tds-type'); if (!select) return;
    const item = tdsData[select.value];
    const payment = Math.max(0, Number($('#tds-payment').value) || 0);
    const total = Math.max(0, Number($('#tds-aggregate').value) || 0);
    let eligible = false, base = payment;
    if (item.mode === 'month') eligible = payment > item.threshold;
    else if (item.mode === 'goods') {
      eligible = total + payment > item.threshold;
      base = Math.max(0, total + payment - item.threshold) - Math.max(0, total - item.threshold);
    } else eligible = total > item.threshold;
    if (item.single && payment <= item.single) eligible = false;
    $('#tds-aggregate-label').textContent = item.mode === 'month' ? 'Monthly rent/payment (₹)' : item.mode === 'goods' ? 'FY purchases before this purchase (₹)' : 'Financial year total, including this payment (₹)';
    $('#tds-reference').textContent = `Income-tax Act, 2025 · ${item.ref}`;
    $('#tds-rate').textContent = `Estimated rate: ${item.rate}%`;
    $('#tds-note').textContent = item.note;
    $('#tds-output').textContent = money(eligible ? base * item.rate / 100 : 0);
  };
  $('#tds-type')?.addEventListener('change', calculateTDS);
  $('#tds-form')?.addEventListener('input', calculateTDS);
  $('#tds-form')?.addEventListener('submit', event => event.preventDefault());
  calculateTDS();

  // Chart builder and standalone SVG download.
  const chartRows = $('#chart-rows'), chartPreview = $('#chart-preview');
  const chartData = () => $$('.chart-row', chartRows).map(row => ({
    label: row.querySelectorAll('input')[0].value.trim() || 'Untitled',
    value: Math.max(0, Number(row.querySelectorAll('input')[1].value) || 0)
  }));
  const renderChart = () => {
    if (!chartRows || !chartPreview) return;
    const data = chartData(), max = Math.max(1, ...data.map(row => row.value));
    chartPreview.replaceChildren();
    const title = document.createElement('h4'); title.textContent = $('#chart-title').value.trim() || 'My chart'; chartPreview.append(title);
    data.forEach(item => {
      const row = document.createElement('div'); row.className = 'chart-bar-row';
      const label = document.createElement('span'); label.textContent = item.label;
      const track = document.createElement('div'); track.className = 'bar-track'; track.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('div'); bar.className = 'bar'; bar.style.width = `${item.value / max * 100}%`; track.append(bar);
      const number = document.createElement('b'); number.textContent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(item.value);
      row.append(label, track, number); chartPreview.append(row);
    });
    chartPreview.setAttribute('aria-label', `${title.textContent}: ${data.map(item => `${item.label}, ${item.value}`).join('; ')}`);
  };
  const labelRows = () => $$('.chart-row', chartRows).forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    inputs[0].setAttribute('aria-label', `Chart label ${i + 1}`); inputs[1].setAttribute('aria-label', `Chart value ${i + 1}`);
    const remove = row.querySelector('.remove-row'); remove.setAttribute('aria-label', `Remove row ${i + 1}`); remove.disabled = chartRows.children.length <= 1;
  });
  $('#add-row')?.addEventListener('click', () => {
    if (chartRows.children.length >= 10) return toast('Maximum 10 rows');
    const row = document.createElement('label'); row.className = 'chart-row';
    row.innerHTML = '<span>Label</span><input maxlength="28" placeholder="Category"><span>Value</span><input type="number" min="0" step="any" value="0"><button type="button" class="remove-row" aria-label="Remove row">×</button>';
    chartRows.append(row); labelRows(); renderChart(); row.querySelector('input').focus();
  });
  chartRows?.addEventListener('click', event => {
    if (event.target.matches('.remove-row') && chartRows.children.length > 1) { event.target.closest('.chart-row').remove(); labelRows(); renderChart(); }
  });
  chartRows?.addEventListener('input', renderChart); $('#chart-title')?.addEventListener('input', renderChart);
  const xml = text => String(text).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
  $('#download-chart')?.addEventListener('click', () => {
    const data = chartData(), max = Math.max(1, ...data.map(row => row.value));
    const title = $('#chart-title').value.trim() || 'My chart', height = 100 + data.length * 58;
    const bars = data.map((item, index) => {
      const y = 74 + index * 58, width = item.value / max * 500;
      return `<text x="25" y="${y + 19}" font-family="Arial,sans-serif" font-size="15" fill="#5b5b70">${xml(item.label)}</text><rect x="205" y="${y}" width="500" height="26" rx="4" fill="#eeeefa"/><rect x="205" y="${y}" width="${width}" height="26" rx="4" fill="#7650ca"/><text x="725" y="${y + 19}" font-family="Arial,sans-serif" font-size="14" fill="#242238">${xml(new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(item.value))}</text>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="${height}" viewBox="0 0 860 ${height}"><rect width="100%" height="100%" fill="#fff"/><text x="25" y="39" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#242238">${xml(title)}</text>${bars}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'my-chart'}.svg`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  labelRows(); renderChart(); calculateGST();

  // Owner-controlled learning checklist. It stays in this browser; backup/restore moves it.
  const progressKey = 'chetan-learning-progress-v1';
  const trackerRows = $$('.tracker-row');
  const topicIds = trackerRows.map(row => row.dataset.topic);
  let complete = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || '[]');
    if (Array.isArray(saved)) complete = new Set(saved.filter(id => topicIds.includes(id)));
  } catch (_) { /* An unavailable or invalid saved value starts a fresh local tracker. */ }
  const drawProgress = () => {
    trackerRows.forEach(row => {
      const done = complete.has(row.dataset.topic), button = row.querySelector('button');
      row.classList.toggle('done', done); button.setAttribute('aria-pressed', String(done)); button.textContent = done ? '✓ Completed' : 'Mark complete';
      row.querySelector('.tracker-state').textContent = done ? 'DONE' : row.querySelector('.tracker-state').classList.contains('current') ? 'CURRENT' : row.dataset.topic === 'fullstack' ? 'GOAL' : 'NEXT';
    });
    const count = complete.size, percentage = Math.round(count / trackerRows.length * 100);
    $('#done-count').textContent = `${count} of ${trackerRows.length}`; $('#done-percent').textContent = `${percentage}%`;
    $('#meter-fill').style.width = `${percentage}%`; $('.meter').setAttribute('aria-valuenow', String(percentage));
  };
  const saveProgress = () => {
    try { localStorage.setItem(progressKey, JSON.stringify([...complete])); }
    catch (_) { toast('Browser storage is unavailable; download a backup to keep progress.'); }
    drawProgress();
  };
  trackerRows.forEach(row => row.querySelector('button').addEventListener('click', () => {
    const id = row.dataset.topic; complete.has(id) ? complete.delete(id) : complete.add(id); saveProgress();
  }));
  $('#reset-progress')?.addEventListener('click', () => {
    if (!complete.size || confirm('Reset all saved learning progress on this browser?')) { complete.clear(); saveProgress(); toast('Progress reset'); }
  });
  $('#backup-progress')?.addEventListener('click', () => {
    const backup = { name: 'Chetan Bhatiya learning progress', savedAt: new Date().toISOString(), completed: [...complete] };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'chetan-learning-progress.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#restore-progress')?.addEventListener('change', async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!Array.isArray(backup.completed)) throw new Error('Invalid backup');
      complete = new Set(backup.completed.filter(id => topicIds.includes(id))); saveProgress(); toast('Learning progress restored');
    } catch (_) { toast('This backup file could not be read'); }
    event.target.value = '';
  });
  drawProgress();

  $('#year').textContent = new Date().getFullYear();
})();
