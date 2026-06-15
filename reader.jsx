// 阅读页 — 侧边目录(scroll spy) + 正文 + 反向链接
const { useState: useStateR, useEffect: useEffectR, useRef: useRefR, useMemo: useMemoR } = React;

function renderInline(text) {
  return text.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : p));
}

function ReaderView({ note, allNotes, onClose, onOpen }) {
  const scrollRef = useRefR(null);
  const [activeH, setActiveH] = useStateR(0);

  // 大纲锚点
  const headings = useMemoR(() => {
    const hs = [];
    note.body.forEach((b, i) => { if (b.h) hs.push({ id: `sec-${i}`, text: b.h }); });
    return hs;
  }, [note]);

  const byId = useMemoR(() => Object.fromEntries(allNotes.map((n) => [n.id, n])), [allNotes]);
  const outgoing = note.links.map((id) => byId[id]).filter(Boolean);
  const incoming = allNotes.filter((n) => n.links.includes(note.id) && n.id !== note.id);

  useEffectR(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    return () => window.removeEventListener("keydown", onKey);
  }, [note, onClose]);

  const onScroll = () => {
    const c = scrollRef.current;
    if (!c) return;
    let cur = 0;
    headings.forEach((h, i) => {
      const el = document.getElementById(h.id);
      if (el && el.offsetTop - c.scrollTop < 140) cur = i;
    });
    setActiveH(cur);
  };

  const jump = (id) => {
    const el = document.getElementById(id), c = scrollRef.current;
    if (el && c) c.scrollTo({ top: el.offsetTop - 28, behavior: "smooth" });
  };

  const fmt = (d) => { const [y, m, day] = d.split("-"); return `${y}.${m}.${day}`; };

  return (
    <React.Fragment>
      <div className="reader-scrim" onClick={onClose}></div>
      <article className="reader">
        <div className="reader-main" ref={scrollRef} onScroll={onScroll}>
          <header className="reader-head">
            <button className="iconbtn reader-close" onClick={onClose} aria-label="关闭"><Ic.Close /></button>
            <div className="reader-cat">
              <Ic.Hash width="13" height="13" />{note.cat}
              <span style={{ color: "var(--ink-faint)" }}>· {note.seed === "evergreen" ? "常青笔记" : "萌芽笔记"}</span>
            </div>
            <h1 className="reader-title">{note.title}</h1>
            <div className="reader-meta">
              <span>{note.en}</span>
              <span>更新于 {fmt(note.updated)}</span>
              <span className="tg">{note.tags.map((t) => "#" + t).join("  ")}</span>
            </div>
          </header>

          <div className="article">
            {note.body.map((b, i) =>
              b.h ? <h3 key={i} id={`sec-${i}`}>{b.h}</h3>
              : b.p ? <p key={i}>{renderInline(b.p)}</p>
              : b.q ? <blockquote key={i}>{renderInline(b.q)}</blockquote>
              : b.list ? <ul key={i}>{b.list.map((li, k) => <li key={k}>{renderInline(li)}</li>)}</ul>
              : null
            )}
          </div>

          {(outgoing.length > 0 || incoming.length > 0) && (
            <div className="backlinks">
              {outgoing.length > 0 && <>
                <h4>链接到 · Links</h4>
                <div className="bl-list">
                  {outgoing.map((n) => (
                    <div className="bl-item" key={n.id} onClick={() => onOpen(n.id)}>
                      <Ic.Arrow /><b>{n.title}</b><span>{n.cat}</span>
                    </div>
                  ))}
                </div>
              </>}
              {incoming.length > 0 && <>
                <h4 style={{ marginTop: outgoing.length ? 22 : 0 }}>反向链接 · Backlinks</h4>
                <div className="bl-list">
                  {incoming.map((n) => (
                    <div className="bl-item" key={n.id} onClick={() => onOpen(n.id)}>
                      <Ic.ArrowUL /><b>{n.title}</b><span>{n.cat}</span>
                    </div>
                  ))}
                </div>
              </>}
            </div>
          )}
        </div>

        <aside className="reader-toc">
          <div className="toc-label">本页大纲</div>
          {headings.length > 0 ? (
            <nav className="toc-list">
              {headings.map((h, i) => (
                <button key={h.id} className="toc-link" data-on={i === activeH} onClick={() => jump(h.id)}>
                  {h.text}
                </button>
              ))}
            </nav>
          ) : (
            <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>这是一篇短笔记。</div>
          )}
          <div style={{ marginTop: 30 }} className="toc-label">连接</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>
            出链 {outgoing.length} · 反链 {incoming.length}
          </div>
        </aside>
      </article>
    </React.Fragment>
  );
}

window.ReaderView = ReaderView;
