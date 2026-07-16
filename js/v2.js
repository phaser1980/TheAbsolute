(() => {
  const REMOTE_PDF = 'https://www.cia.gov/readingroom/docs/CIA-RDP96-00788R001700210016-5.pdf';
  const LOCAL_PDF = 'assets/source/gateway-process.pdf';
  const frame = document.getElementById('sourceFrame');
  const title = document.getElementById('sourceTitle');
  let activePdf = REMOTE_PDF;

  function currentScanPage() {
    const match = title?.textContent.match(/page\s+(\d+)/i);
    return match ? Number(match[1]) : 1;
  }

  function loadScan() {
    if (!frame) return;
    const page = currentScanPage();
    frame.src = `${activePdf}#page=${page}&zoom=page-width&toolbar=0&navpanes=0`;
    frame.title = `Gateway Process scan, PDF page ${page}`;
  }

  function setSourceLinks(pdf) {
    document.querySelectorAll('.source-card-head a, .nav-links a.keep').forEach(link => link.href = pdf);
    const page = currentScanPage();
    ['sourcePageLink','sourceFallback'].forEach(id => {
      const link = document.getElementById(id);
      if (link) link.href = `${pdf}#page=${page}`;
    });
    const caseLink = document.getElementById('casePdfLink');
    if (caseLink) caseLink.href = `${pdf}#page=26`;
  }

  async function preferLocalArchive() {
    try {
      const response = await fetch(LOCAL_PDF, {method:'HEAD', cache:'no-store'});
      if (!response.ok) throw new Error('not uploaded');
      activePdf = LOCAL_PDF;
      setSourceLinks(activePdf);
      loadScan();
      const sourceHead = document.querySelector('.source-card-head div');
      if (sourceHead && !sourceHead.querySelector('.local-source-badge')) {
        const badge = document.createElement('em');
        badge.className = 'local-source-badge';
        badge.textContent = 'Local archive';
        sourceHead.appendChild(badge);
      }
    } catch (_) {
      const fallback = document.querySelector('.source-fallback');
      if (fallback && !fallback.querySelector('.source-setup')) {
        const note = document.createElement('span');
        note.className = 'source-setup';
        note.innerHTML = '<strong>Local archive pending.</strong> Add the supplied PDF at <code>assets/source/gateway-process.pdf</code> to remove CIA embed blocking.';
        fallback.append(' ', note);
      }
    }
  }

  if (title) new MutationObserver(() => { setSourceLinks(activePdf); loadScan(); }).observe(title, {childList:true, characterData:true,subtree:true});
  preferLocalArchive();

  document.getElementById('openCaseNotes')?.addEventListener('click', () => {
    document.getElementById('journal')?.scrollIntoView({behavior:'smooth'});
    const observation = document.getElementById('reflection');
    if (observation && !observation.value) {
      observation.value = 'Missing-page investigation note: ';
      setTimeout(() => observation.focus(), 500);
    }
  });
})();
