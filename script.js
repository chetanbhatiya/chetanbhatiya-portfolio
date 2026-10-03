(() => {
  const root = document.documentElement;
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const themeToggle = document.querySelector('.theme-toggle');
  const toast = document.querySelector('.toast');

  // Mobile navigation stays keyboard accessible and closes after navigation.
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navLinks?.classList.toggle('open', !isOpen);
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }));

  // Remember the visitor's theme preference when storage is available.
  const updateThemeLabel = () => {
    const light = root.dataset.theme === 'light';
    themeToggle?.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle?.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f5f7fa' : '#0b0e14');
  };
  updateThemeLabel();
  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('cb-theme', root.dataset.theme); } catch (_) { /* Storage can be unavailable in private contexts. */ }
    updateThemeLabel();
  });

  // Reveal content as it enters view; show it all when observers are unavailable.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Scroll progress, active section, and back-to-top affordance share one passive listener.
  const progress = document.querySelector('.scroll-progress span');
  const backToTop = document.querySelector('.back-to-top');
  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  let ticking = false;
  const updateScrollState = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
    backToTop?.classList.toggle('visible', window.scrollY > 650);
    let current = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= 150) current = section.id;
    sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateScrollState); ticking = true; }
  }, { passive: true });
  updateScrollState();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Project filters only describe the current project statuses.
  const filters = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');
  filters.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(project => { project.hidden = filter !== 'all' && project.dataset.status !== filter; });
  }));

  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  };
  document.querySelector('.copy-email')?.addEventListener('click', async event => {
    const address = event.currentTarget.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(address);
      showToast('Email address copied');
    } catch (_) {
      window.location.href = `mailto:${address}`;
      showToast('Opening your email app');
    }
  });

  // Switch between the three self-contained public tools.
  const toolTabs = [...document.querySelectorAll('.tool-tab')];
  const toolPanels = [...document.querySelectorAll('.tool-panel')];
  const activateTool = tab => {
    toolTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    toolPanels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  };
  toolTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTool(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? toolTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + toolTabs.length) % toolTabs.length;
      toolTabs[next].focus();
      activateTool(toolTabs[next]);
    });
  });

  const rupees = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);

  // GST: supports tax-exclusive/inclusive prices and intra/inter-state splits.
  const gstForm = document.querySelector('#gst-form');
  const gstRate = document.querySelector('#gst-rate');
  const gstCustomWrap = document.querySelector('#gst-custom-wrap');
  const calculateGST = event => {
    event?.preventDefault();
    if (!gstForm?.reportValidity()) return;
    const amount = Number(document.querySelector('#gst-amount').value);
    const rate = gstRate.value === 'custom' ? Number(document.querySelector('#gst-custom').value) : Number(gstRate.value);
    const inclusive = document.querySelector('input[name="gst-mode"]:checked').value === 'inclusive';
    const taxable = inclusive ? amount / (1 + rate / 100) : amount;
    const tax = inclusive ? amount - taxable : amount * rate / 100;
    const total = taxable + tax;
    const interstate = document.querySelector('#gst-interstate').checked;
    document.querySelector('#gst-taxable').textContent = rupees(taxable);
    document.querySelector('#gst-label').textContent = `GST (${rate.toLocaleString('en-IN')}%)`;
    document.querySelector('#gst-tax').textContent = rupees(tax);
    document.querySelector('#gst-total').textContent = rupees(total);
    document.querySelector('#gst-split').textContent = interstate ? `IGST ${rupees(tax)}` : `CGST ${rupees(tax / 2)} + SGST ${rupees(tax / 2)}`;
  };
  gstRate?.addEventListener('change', () => {
    gstCustomWrap.hidden = gstRate.value !== 'custom';
    calculateGST();
  });
  gstForm?.addEventListener('submit', calculateGST);
  gstForm?.querySelectorAll('input').forEach(input => input.addEventListener('input', calculateGST));

  // Selected common resident TDS cases. New Act table references apply from 1 Apr 2026.
  const tdsCases = {
    'contract-individual': { rate: 1, threshold: 100000, single: 30000, type: 'annual', section: 'Section 393(1) · Table 6(i)', note: 'Usually 1% where the contractor is an individual/HUF. No deduction for an individual payment up to ₹30,000; annual aggregate threshold ₹1,00,000.' },
    'contract-other': { rate: 2, threshold: 100000, single: 30000, type: 'annual', section: 'Section 393(1) · Table 6(i)', note: 'Usually 2% for other contractor payees. No deduction for an individual payment up to ₹30,000; annual aggregate threshold ₹1,00,000.' },
    'professional': { rate: 10, threshold: 50000, type: 'annual', section: 'Section 393(1) · Table 6(iii)', note: 'For the specified-payer case; threshold is ₹50,000 in the tax year. Some individual/HUF payer cases use a different entry and threshold.' },
    'technical': { rate: 2, threshold: 50000, type: 'annual', section: 'Section 393(1) · Table 6(iii)', note: 'For the specified-payer case; threshold is ₹50,000 in the tax year. Payer status and service classification matter.' },
    'commission': { rate: 2, threshold: 20000, type: 'annual', section: 'Section 393(1) · Table 1(ii)', note: 'For commission or brokerage other than insurance commission; threshold is ₹20,000 in the tax year.' },
    'rent-building': { rate: 10, threshold: 50000, type: 'monthly', section: 'Section 393(1) · Table 2(ii)', note: 'Specified-payer case for land/building, furniture, or fittings; threshold is ₹50,000 per month or part of a month.' },
    'rent-equipment': { rate: 2, threshold: 50000, type: 'monthly', section: 'Section 393(1) · Table 2(ii)', note: 'Specified-payer case for machinery, plant, or equipment; threshold is ₹50,000 per month or part of a month.' },
    'goods': { rate: 0.1, threshold: 5000000, type: 'annual', section: 'Section 393(1) · Table 8(ii)', note: 'For goods purchases exceeding ₹50 lakh. The tax is calculated only on the amount above ₹50 lakh.' }
  };
  const tdsType = document.querySelector('#tds-type');
  const tdsAggregateLabel = document.querySelector('#tds-aggregate-label');
  const calculateTDS = () => {
    if (!tdsType) return;
    const item = tdsCases[tdsType.value];
    const payment = Math.max(0, Number(document.querySelector('#tds-payment').value) || 0);
    const aggregate = Math.max(0, Number(document.querySelector('#tds-aggregate').value) || 0);
    const thresholdMet = item.type === 'monthly' ? payment > item.threshold : item === tdsCases.goods ? aggregate + payment > item.threshold : aggregate > item.threshold;
    const oneOffException = item.single && payment <= item.single;
    const goodsBase = item === tdsCases.goods ? Math.max(0, aggregate + payment - item.threshold) - Math.max(0, aggregate - item.threshold) : payment;
    const estimated = thresholdMet && !oneOffException ? (item === tdsCases.goods ? goodsBase : payment) * item.rate / 100 : 0;
    tdsAggregateLabel.textContent = item.type === 'monthly' ? 'Monthly rent/payment (₹)' : item === tdsCases.goods ? 'Financial year purchases before this one (₹)' : 'Financial year total so far (₹)';
    document.querySelector('#tds-rate-label').textContent = `Rate: ${item.rate}%${oneOffException ? ' · individual payment exception' : ''}`;
    document.querySelector('#tds-section-label').textContent = `IT Act 2025 · ${item.section}`;
    document.querySelector('#tds-threshold-note').textContent = item.note;
    document.querySelector('#tds-result').textContent = rupees(estimated);
  };
  tdsType?.addEventListener('change', calculateTDS);
  document.querySelector('#tds-form')?.addEventListener('input', calculateTDS);
  document.querySelector('#tds-form')?.addEventListener('submit', event => event.preventDefault());
  calculateTDS();

  // Chart maker renders a labeled, responsive bar chart and exports a standalone SVG.
  const chartRows = document.querySelector('#chart-rows');
  const chartPreview = document.querySelector('#chart-preview');
  const escapeXML = value => String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
  const chartData = () => [...chartRows.querySelectorAll('.chart-row')].map(row => ({
    label: row.querySelector('input[type="text"],input:not([type])').value.trim() || 'Untitled',
    value: Math.max(0, Number(row.querySelector('input[type="number"]').value) || 0)
  }));
  const renderChart = () => {
    if (!chartRows || !chartPreview) return;
    const data = chartData();
    const max = Math.max(1, ...data.map(item => item.value));
    chartPreview.replaceChildren();
    const title = document.createElement('p');
    title.className = 'chart-preview-title';
    title.textContent = document.querySelector('#chart-title').value.trim() || 'My chart';
    chartPreview.append(title);
    data.forEach(item => {
      const row = document.createElement('div'); row.className = 'chart-bar-row';
      const label = document.createElement('span'); label.textContent = item.label;
      const track = document.createElement('div'); track.className = 'chart-bar-track'; track.setAttribute('aria-hidden', 'true');
      const bar = document.createElement('div'); bar.className = 'chart-bar'; bar.style.width = `${item.value / max * 100}%`; track.append(bar);
      const amount = document.createElement('strong'); amount.textContent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(item.value);
      row.append(label, track, amount); chartPreview.append(row);
    });
    chartPreview.setAttribute('aria-label', `${title.textContent}: ${data.map(item => `${item.label}, ${item.value}`).join('; ')}`);
  };
  const updateChartRowLabels = () => chartRows?.querySelectorAll('.chart-row').forEach((row, index) => {
    row.querySelectorAll('input')[0].setAttribute('aria-label', `Chart label ${index + 1}`);
    row.querySelectorAll('input')[1].setAttribute('aria-label', `Chart value ${index + 1}`);
    const remove = row.querySelector('button'); remove.setAttribute('aria-label', `Remove row ${index + 1}`); remove.disabled = chartRows.children.length <= 1;
  });
  document.querySelector('#add-chart-row')?.addEventListener('click', () => {
    if (chartRows.children.length >= 10) return showToast('A chart can have up to 10 rows');
    const row = document.createElement('label'); row.className = 'chart-row';
    row.innerHTML = '<span>Label</span><input aria-label="Chart label" type="text" maxlength="28" placeholder="Category"><span>Value</span><input aria-label="Chart value" type="number" min="0" step="any" value="0"><button type="button" class="remove-chart-row" aria-label="Remove row">×</button>';
    chartRows.append(row); updateChartRowLabels(); renderChart(); row.querySelector('input').focus();
  });
  chartRows?.addEventListener('click', event => {
    if (!event.target.matches('.remove-chart-row') || chartRows.children.length <= 1) return;
    event.target.closest('.chart-row').remove(); updateChartRowLabels(); renderChart();
  });
  chartRows?.addEventListener('input', renderChart);
  document.querySelector('#chart-title')?.addEventListener('input', renderChart);
  document.querySelector('#download-chart')?.addEventListener('click', () => {
    const data = chartData();
    const title = document.querySelector('#chart-title').value.trim() || 'My chart';
    const max = Math.max(1, ...data.map(item => item.value));
    const width = 900, rowHeight = 58, top = 74, height = top + rowHeight * data.length + 30;
    const rows = data.map((item, index) => {
      const y = top + index * rowHeight;
      const barWidth = Math.max(item.value ? 2 : 0, item.value / max * 510);
      return `<text x="30" y="${y + 19}" font-family="Arial,sans-serif" font-size="15" fill="#506071">${escapeXML(item.label)}</text><rect x="210" y="${y}" width="510" height="26" rx="4" fill="#edf2f4"/><rect x="210" y="${y}" width="${barWidth}" height="26" rx="4" fill="#218d70"/><text x="740" y="${y + 19}" font-family="Arial,sans-serif" font-size="14" fill="#18212e">${escapeXML(new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(item.value))}</text>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/><text x="30" y="42" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#18212e">${escapeXML(title)}</text>${rows}</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-chart'}.svg`;
    document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  updateChartRowLabels(); renderChart(); calculateGST();

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
