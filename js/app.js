(() => {
  'use strict';

  const pages = window.ABSOLUTE_PAGES || [];
  const practiceSteps = window.ABSOLUTE_PRACTICE_STEPS || [];
  const STORAGE = {
    practice: 'theAbsolutePracticeV2',
    visited: 'theAbsoluteVisitedPages',
    sessions: 'theAbsoluteSessions',
    experiments: 'theAbsoluteExperiments'
  };

  const $ = (id) => document.getElementById(id);
  const safeParse = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  };
  const load = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const formatDate = (value) => new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(new Date(value));

  let page = 0;
  let filteredPageIndexes = pages.map((_, index) => index);
  let visited = new Set(load(STORAGE.visited, []));
  let sessions = load(STORAGE.sessions, []);
  let experiments = load(STORAGE.experiments, []);
  let recordTab = 'sessions';
  let speech = null;

  const toneMap = {grounded:'var(--green)', mixed:'var(--gold)', speculative:'var(--danger)'};

  function applyPageFilter() {
    const query = $('pageSearch').value.trim().toLowerCase();
    const filter = $('evidenceFilter').value;
    filteredPageIndexes = pages.map((_, index) => index).filter(index => {
      const item = pages[index];
      const searchable = [item.title, item.summary, item.plain, item.evidence, item.practice, item.status].join(' ').toLowerCase();
      return (!query || searchable.includes(query)) && (filter === 'all' || item.tone === filter);
    });
    if (!filteredPageIndexes.includes(page) && filteredPageIndexes.length) page = filteredPageIndexes[0];
    renderPageIndex();
    if (filteredPageIndexes.length) renderPage(false);
  }

  function renderPageIndex() {
    const index = $('pageIndex');
    if (!filteredPageIndexes.length) {
      index.innerHTML = '<div class="page-index-empty">No pages match that search and evidence filter.</div>';
      return;
    }
    index.innerHTML = filteredPageIndexes.map(i => {
      const item = pages[i];
      return `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''} ${visited.has(i) ? 'visited' : ''}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="label">${escapeHtml(item.title)}</span><i class="read-dot" aria-hidden="true"></i></button>`;
    }).join('');
    index.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      page = Number(button.dataset.page);
      renderPage(true);
    }));
  }

  function markVisited(index) {
    visited.add(index);
    save(STORAGE.visited, [...visited]);
    updateStats();
  }

  function renderPage(scrollIndex = false) {
    const item = pages[page];
    if (!item) return;
    const alreadyVisited = visited.has(page);
    $('pageKicker').textContent = `Page ${String(page + 1).padStart(2, '0')} of ${pages.length}`;
    $('pageTitle').textContent = item.title;
    $('pageSummary').textContent = item.summary;
    $('plainEnglish').textContent = item.plain;
    $('evidenceLens').textContent = item.evidence;
    $('practiceLink').textContent = item.practice;
    $('statusText').textContent = item.status;
    $('statusDot').style.background = toneMap[item.tone];
    $('statusDot').style.color = toneMap[item.tone];
    $('visitedBadge').textContent = alreadyVisited ? 'Explored' : 'New page';
    $('visitedBadge').classList.toggle('done', alreadyVisited);

    const position = filteredPageIndexes.indexOf(page);
    $('prevPage').disabled = position <= 0;
    $('nextPage').disabled = position < 0 || position >= filteredPageIndexes.length - 1;
    markVisited(page);
    renderPageIndex();
    if (scrollIndex) $('pageIndex').querySelector('.active')?.scrollIntoView({block:'nearest'});
  }

  function movePage(direction) {
    const position = filteredPageIndexes.indexOf(page);
    const target = filteredPageIndexes[position + direction];
    if (typeof target === 'number') { page = target; renderPage(true); }
  }

  function toggleSpeech(text, button) {
    if (!('speechSynthesis' in window)) {
      button.textContent = 'Speech unavailable';
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      button.textContent = 'Listen to summary';
      return;
    }
    speech = new SpeechSynthesisUtterance(text);
    speech.rate = .92;
    speech.pitch = .96;
    speech.onend = () => { button.textContent = 'Listen to summary'; };
    button.textContent = 'Stop listening';
    speechSynthesis.speak(speech);
  }

  $('pageSearch').addEventListener('input', applyPageFilter);
  $('evidenceFilter').addEventListener('change', applyPageFilter);
  $('prevPage').addEventListener('click', () => movePage(-1));
  $('nextPage').addEventListener('click', () => movePage(1));
  $('listenPage').addEventListener('click', () => toggleSpeech(`${pages[page].title}. ${pages[page].summary} Evidence note. ${pages[page].evidence}`, $('listenPage')));
  document.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowLeft') movePage(-1);
    if (event.key === 'ArrowRight') movePage(1);
  });

  let practiceIndex = 0;
  let running = false;
  let interval = null;
  let remaining = 120;
  let breathPhase = 0;
  let sessionStartedAt = null;
  let sessionCompleted = false;
  const orb = $('breathOrb');

  function secondsPerStep() { return Math.round(Number($('duration').value) * 60 / practiceSteps.length); }
  function formatTime(value) { const m = Math.floor(value / 60); const s = value % 60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

  function speakPracticeStep() {
    if (!$('voiceGuidance').checked || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const item = practiceSteps[practiceIndex];
    const utterance = new SpeechSynthesisUtterance(`${item.title} ${$('practiceInstruction').textContent}`);
    utterance.rate = .84;
    utterance.pitch = .92;
    speechSynthesis.speak(utterance);
  }

  function renderPractice(resetTime = true) {
    const item = practiceSteps[practiceIndex];
    $('practiceStep').textContent = `Step ${practiceIndex + 1} · ${item.label}`;
    $('practiceTitle').textContent = item.title;
    let instruction = item.instruction;
    if (practiceIndex === 4) {
      const intention = $('intention').value.trim();
      const cue = $('imageCue').value.trim();
      if (intention || cue) instruction += ` Your saved pattern: ${intention || 'your chosen outcome'}${cue ? `. Image cue: ${cue}.` : '.'}`;
    }
    if (practiceIndex === 5) instruction += ` Return anchor: ${$('anchor').value || 'Open eyes. Feel feet. Name the room.'}`;
    $('practiceInstruction').textContent = instruction;
    if (resetTime) remaining = secondsPerStep();
    $('timer').textContent = formatTime(remaining);
    $('stepDots').innerHTML = practiceSteps.map((_, index) => `<button type="button" aria-label="Go to practice step ${index + 1}" data-step="${index}" class="${index === practiceIndex ? 'active' : ''}">${index + 1}</button>`).join('');
    $('stepDots').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      stopPractice();
      practiceIndex = Number(button.dataset.step);
      renderPractice();
      speakPracticeStep();
    }));
  }

  function completePractice() {
    stopPractice();
    sessionCompleted = true;
    $('breathWord').textContent = 'Complete';
    $('reflection').focus({preventScroll:true});
    $('reflectionMessage').textContent = 'Sequence complete. Record the raw experience while it is fresh.';
    $('reflectionMessage').className = 'form-message success';
    $('journal').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function tick() {
    remaining -= 1;
    breathPhase = (breathPhase + 1) % 10;
    const inhale = breathPhase < 4;
    const pause = breathPhase === 4 || breathPhase === 9;
    orb.classList.toggle('inhale', inhale && !pause);
    orb.classList.toggle('exhale', !inhale && !pause);
    $('breathWord').textContent = pause ? 'Pause' : inhale ? 'Inhale' : 'Exhale';
    $('timer').textContent = formatTime(Math.max(0, remaining));
    if (remaining <= 0) {
      if (practiceIndex < practiceSteps.length - 1) {
        practiceIndex += 1;
        renderPractice(true);
        speakPracticeStep();
      } else completePractice();
    }
  }

  function startPractice() {
    if (running) { stopPractice(); return; }
    if (!sessionStartedAt) sessionStartedAt = new Date().toISOString();
    sessionCompleted = false;
    running = true;
    $('startPractice').textContent = 'Pause';
    $('breathWord').textContent = 'Inhale';
    speakPracticeStep();
    interval = setInterval(tick, 1000);
  }

  function stopPractice() {
    running = false;
    clearInterval(interval);
    interval = null;
    $('startPractice').textContent = 'Start';
    orb.classList.remove('inhale', 'exhale');
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  function resetPractice() {
    stopPractice();
    practiceIndex = 0;
    sessionStartedAt = null;
    sessionCompleted = false;
    renderPractice(true);
    $('breathWord').textContent = 'Ready';
  }

  $('startPractice').addEventListener('click', startPractice);
  $('resetPractice').addEventListener('click', resetPractice);
  $('nextPractice').addEventListener('click', () => {
    stopPractice();
    practiceIndex = (practiceIndex + 1) % practiceSteps.length;
    renderPractice(true);
    speakPracticeStep();
  });
  $('duration').addEventListener('change', () => renderPractice(true));

  $('intentionForm').addEventListener('submit', event => {
    event.preventDefault();
    const values = ['intention','imageCue','duration','anchor','beforeFocus','voiceGuidance'].reduce((acc, id) => {
      const element = $(id);
      acc[id] = element.type === 'checkbox' ? element.checked : element.value;
      return acc;
    }, {});
    save(STORAGE.practice, values);
    practiceIndex = 0;
    sessionStartedAt = new Date().toISOString();
    renderPractice(true);
    startPractice();
    document.querySelector('.practice-stage').scrollIntoView({behavior:'smooth', block:'center'});
  });

  const savedPractice = load(STORAGE.practice, null);
  if (savedPractice) Object.entries(savedPractice).forEach(([id, value]) => {
    const element = $(id);
    if (!element) return;
    if (element.type === 'checkbox') element.checked = Boolean(value);
    else element.value = value;
  });

  function saveSession(event) {
    event.preventDefault();
    const observation = $('reflection').value.trim();
    const action = $('nextAction').value.trim();
    if (!observation && !action) {
      $('reflectionMessage').textContent = 'Add an observation or practical next action first.';
      $('reflectionMessage').className = 'form-message';
      return;
    }
    const duration = Number($('duration').value);
    const record = {
      id: uid(),
      createdAt: new Date().toISOString(),
      startedAt: sessionStartedAt,
      completedSequence: sessionCompleted,
      duration,
      intention: $('intention').value.trim(),
      imageCue: $('imageCue').value.trim(),
      beforeFocus: Number($('beforeFocus').value),
      afterFocus: Number($('afterFocus').value),
      observation,
      nextAction: action
    };
    sessions.unshift(record);
    save(STORAGE.sessions, sessions);
    $('reflectionForm').reset();
    $('afterFocus').value = '3';
    $('reflectionMessage').textContent = 'Session record saved locally.';
    $('reflectionMessage').className = 'form-message success';
    sessionStartedAt = null;
    sessionCompleted = false;
    updateStats();
    renderRecords();
  }

  function saveExperiment(event) {
    event.preventDefault();
    const question = $('experimentQuestion').value.trim();
    const prediction = $('experimentPrediction').value.trim();
    if (!question || !prediction) {
      $('experimentMessage').textContent = 'A question and a scoreable prediction are required.';
      return;
    }
    experiments.unshift({
      id: uid(),
      createdAt: new Date().toISOString(),
      question,
      prediction,
      confidence: Number($('experimentConfidence').value),
      checkDate: $('experimentDate').value || null,
      result: 'pending',
      resolvedAt: null
    });
    save(STORAGE.experiments, experiments);
    $('experimentForm').reset();
    $('experimentConfidence').value = '50';
    $('experimentMessage').textContent = 'Prediction locked with a timestamp.';
    $('experimentMessage').className = 'form-message success';
    recordTab = 'experiments';
    updateRecordTabs();
    renderRecords();
  }

  function resolveExperiment(id, result) {
    experiments = experiments.map(item => item.id === id ? {...item, result, resolvedAt: new Date().toISOString()} : item);
    save(STORAGE.experiments, experiments);
    renderRecords();
  }

  function calculateStreak() {
    const days = [...new Set(sessions.map(item => new Date(item.createdAt).toISOString().slice(0, 10)))].sort().reverse();
    if (!days.length) return 0;
    const cursor = new Date();
    cursor.setHours(0,0,0,0);
    const mostRecent = new Date(`${days[0]}T00:00:00`);
    const diff = Math.round((cursor - mostRecent) / 86400000);
    if (diff > 1) return 0;
    let streak = 0;
    let expected = new Date(mostRecent);
    for (const day of days) {
      if (day !== expected.toISOString().slice(0,10)) break;
      streak += 1;
      expected.setDate(expected.getDate() - 1);
    }
    return streak;
  }

  function updateStats() {
    const minutes = sessions.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    const progress = Math.round((visited.size / pages.length) * 100);
    $('statSessions').textContent = String(sessions.length);
    $('statMinutes').textContent = String(minutes);
    $('statStreak').textContent = `${calculateStreak()} days`;
    $('statPages').textContent = `${visited.size} / ${pages.length}`;
    $('heroProgressText').textContent = `${visited.size} of ${pages.length} pages explored`;
    $('heroProgressRing').textContent = String(visited.size);
    $('heroProgressRing').style.setProperty('--progress', `${progress}%`);
  }

  function sessionMarkup(item) {
    const shift = item.afterFocus - item.beforeFocus;
    const shiftLabel = shift > 0 ? `Focus +${shift}` : shift < 0 ? `Focus ${shift}` : 'Focus unchanged';
    return `<article class="record"><div class="record-head"><div><h4>${escapeHtml(item.intention || 'Open practice')}</h4><time>${formatDate(item.createdAt)}</time></div><small>${item.duration} min</small></div>${item.observation ? `<p>${escapeHtml(item.observation)}</p>` : ''}${item.nextAction ? `<p><b>Next action:</b> ${escapeHtml(item.nextAction)}</p>` : ''}<div class="record-tags"><span class="record-tag">${shiftLabel}</span><span class="record-tag">${item.completedSequence ? 'Full sequence' : 'Partial / manual'}</span>${item.imageCue ? `<span class="record-tag">Image: ${escapeHtml(item.imageCue)}</span>` : ''}</div></article>`;
  }

  function experimentMarkup(item) {
    const due = item.checkDate ? `Check ${escapeHtml(item.checkDate)}` : 'No check date';
    const result = item.result === 'pending' ? 'Pending' : item.result[0].toUpperCase() + item.result.slice(1);
    return `<article class="record"><div class="record-head"><div><h4>${escapeHtml(item.question)}</h4><time>${formatDate(item.createdAt)}</time></div><small>${item.confidence}% confidence</small></div><p>${escapeHtml(item.prediction)}</p><div class="record-tags"><span class="record-tag">${due}</span><span class="record-tag">${result}</span></div>${item.result === 'pending' ? `<div class="resolve-actions"><button type="button" data-resolve="hit" data-id="${item.id}">Score hit</button><button type="button" data-resolve="ambiguous" data-id="${item.id}">Ambiguous</button><button type="button" data-resolve="miss" data-id="${item.id}">Score miss</button></div>` : ''}</article>`;
  }

  function renderRecords() {
    const list = $('recordsList');
    const records = recordTab === 'sessions' ? sessions : experiments;
    if (!records.length) {
      list.innerHTML = `<div class="empty-records">No ${recordTab} recorded yet. This archive remains entirely in your browser until you export it.</div>`;
      return;
    }
    list.innerHTML = records.slice(0, 30).map(recordTab === 'sessions' ? sessionMarkup : experimentMarkup).join('');
    list.querySelectorAll('[data-resolve]').forEach(button => button.addEventListener('click', () => resolveExperiment(button.dataset.id, button.dataset.resolve)));
  }

  function updateRecordTabs() {
    document.querySelectorAll('[data-record-tab]').forEach(button => button.classList.toggle('active', button.dataset.recordTab === recordTab));
  }

  document.querySelectorAll('[data-record-tab]').forEach(button => button.addEventListener('click', () => {
    recordTab = button.dataset.recordTab;
    updateRecordTabs();
    renderRecords();
  }));
  $('reflectionForm').addEventListener('submit', saveSession);
  $('experimentForm').addEventListener('submit', saveExperiment);

  function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  $('exportJson').addEventListener('click', () => download(`the-absolute-journal-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify({exportedAt:new Date().toISOString(), sessions, experiments, visitedPages:[...visited]}, null, 2), 'application/json'));
  $('exportCsv').addEventListener('click', () => {
    const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [['type','created_at','title_or_question','observation_or_prediction','duration_or_confidence','result','next_action']];
    sessions.forEach(item => rows.push(['session', item.createdAt, item.intention, item.observation, item.duration, item.completedSequence ? 'complete' : 'partial', item.nextAction]));
    experiments.forEach(item => rows.push(['experiment', item.createdAt, item.question, item.prediction, item.confidence, item.result, '']));
    download(`the-absolute-journal-${new Date().toISOString().slice(0,10)}.csv`, rows.map(row => row.map(quote).join(',')).join('\n'), 'text/csv');
  });
  $('clearJournal').addEventListener('click', () => {
    if (!confirm('Clear all locally stored sessions, experiments, practice settings and page progress? Export first if you want a copy.')) return;
    Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
    sessions = [];
    experiments = [];
    visited = new Set();
    updateStats();
    renderRecords();
    renderPageIndex();
  });

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), {threshold:.12});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const canvas = $('field');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeField() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    particles = Array.from({length:Math.min(90, Math.floor(innerWidth / 14))}, () => ({x:Math.random()*innerWidth, y:Math.random()*innerHeight, r:Math.random()*1.4+.2, v:Math.random()*.16+.04, a:Math.random()*.45+.08}));
  }
  function drawField() {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    particles.forEach(particle => {
      particle.y -= particle.v;
      if (particle.y < -8) { particle.y = innerHeight + 8; particle.x = Math.random() * innerWidth; }
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185,215,255,${particle.a})`;
      ctx.fill();
    });
    requestAnimationFrame(drawField);
  }
  addEventListener('resize', resizeField, {passive:true});
  resizeField();
  drawField();

  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    $('installApp').hidden = false;
  });
  $('installApp').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $('installApp').hidden = true;
  });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

  applyPageFilter();
  renderPage(false);
  renderPractice(true);
  updateStats();
  renderRecords();
})();
