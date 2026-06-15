// 共享 UI 组件
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- 顶栏 ---------------- */
function Topbar({ dir, setDir, mode, toggleMode, onSearch }) {
  const dirs = [
    { id: "editorial", label: "编辑部" },
    { id: "garden", label: "花园" },
    { id: "index", label: "索引" },
  ];
  return (
    <header className="topbar">
      <div className="wrap topbar-in">
        <a className="brand" href="#top">
          <span className="brand-mark"><Ic.Leaf width="26" height="26" /></span>
          <span>
            <div className="brand-name">心智花园</div>
            <div className="brand-en">Mind Garden</div>
          </span>
        </a>

        <button className="searchpill" onClick={onSearch}>
          <Ic.Search />
          <span className="label-sm">搜索笔记…</span>
          <span className="kbd">⌘K</span>
        </button>

        <div className="top-actions">
          <span className="controls-label hide-sm" style={{ marginRight: 2 }}>方向</span>
          <div className="seg">
            {dirs.map((d) => (
              <button key={d.id} data-on={dir === d.id} onClick={() => setDir(d.id)}>
                <span className="dot">●</span>{d.label}
              </button>
            ))}
          </div>
          <button className="iconbtn" onClick={toggleMode} title="切换深浅色" aria-label="切换深浅色">
            {mode === "dark" ? <Ic.Sun /> : <Ic.Moon />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ meta, total, evergreen, lastUpdated }) {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-kicker">Digital Garden · 持续生长</div>
        <h1 className="hero-title">{meta.tagline}</h1>
        <p className="hero-lead">{meta.sub}</p>
        <p className="hero-sub">这是一座公开的思考花园，而非完成的作品集 —— 笔记会被反复修剪、连接、重写。</p>
        <div className="hero-stats">
          <div className="stat"><b>{total}</b><span>篇笔记 Notes</span></div>
          <div className="stat"><b>{evergreen}</b><span>常青 Evergreen</span></div>
          <div className="stat"><b>{lastUpdated}</b><span>最近更新 Updated</span></div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 控制条 ---------------- */
function Controls({ view, setView, cats, active, toggleCat, counts }) {
  const views = [
    { id: "grid", label: "网格", Icon: Ic.Grid },
    { id: "timeline", label: "时间线", Icon: Ic.Timeline },
    { id: "graph", label: "关系图谱", Icon: Ic.Graph },
  ];
  return (
    <div className="controls">
      <div className="wrap controls-in">
        <div className="seg">
          {views.map((v) => (
            <button key={v.id} data-on={view === v.id} onClick={() => setView(v.id)}>
              <v.Icon width="14" height="14" />{v.label}
            </button>
          ))}
        </div>
        {view === "graph" ? (
          <div className="controls-label" style={{ marginLeft: 4 }}>点击节点高亮关联 · 拖拽平移</div>
        ) : (
          <div className="chips">
            <button className="chip" data-on={active.length === 0} onClick={() => toggleCat("__all")}>
              全部<span className="ct">{counts.__all}</span>
            </button>
            {cats.map((c) => (
              <button key={c} className="chip" data-on={active.includes(c)} onClick={() => toggleCat(c)}>
                {c}<span className="ct">{counts[c]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- 笔记卡片 ---------------- */
function NoteCard({ note, onOpen }) {
  return (
    <button className="card" onClick={() => onOpen(note.id)}>
      <div className="card-top">
        <span className="card-cat">{note.cat}</span>
        <span className="seed" data-seed={note.seed}>
          <i></i>{note.seed === "evergreen" ? "常青" : "萌芽"}
        </span>
      </div>
      <div>
        <h3 className="card-title">{note.title}</h3>
        <div className="card-en">{note.en}</div>
      </div>
      <p className="card-ex">{note.excerpt}</p>
      <div className="card-foot">
        {note.tags.slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}
        <span className="card-link"><Ic.Link />{note.links.length}</span>
      </div>
    </button>
  );
}

/* ---------------- 时间线 ---------------- */
function Timeline({ notes, onOpen }) {
  const fmt = (d) => { const [y, m, day] = d.split("-"); return `${y} · ${m}.${day}`; };
  return (
    <div className="timeline">
      {notes.map((n) => (
        <div className="tl-item" key={n.id}>
          <div className="tl-date">{fmt(n.updated)}</div>
          <div className="tl-row" onClick={() => onOpen(n.id)}>
            <span className="tl-cat">{n.cat}</span>
            <span className="tl-title">{n.title}</span>
          </div>
          <p className="tl-ex">{n.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 搜索浮层 ---------------- */
function SearchOverlay({ notes, onClose, onSelect }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return notes.slice(0, 8);
    return notes.filter((n) =>
      (n.title + n.en + n.excerpt + n.cat + n.tags.join("")).toLowerCase().includes(s)
    );
  }, [q, notes]);

  useEffect(() => { setActive(0); }, [q]);

  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) onSelect(results[active].id);
  };

  return (
    <div className="search-scrim" onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="search-in">
          <Ic.Search />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="搜索标题、摘要、标签…" />
          <button className="search-esc" onClick={onClose}>ESC</button>
        </div>
        <div className="search-res">
          {results.length === 0 ? (
            <div className="search-empty">没有找到与「{q}」相关的笔记</div>
          ) : results.map((n, i) => (
            <div key={n.id} className="sr-item" data-active={i === active}
                 onMouseEnter={() => setActive(i)} onClick={() => onSelect(n.id)}>
              <span className="sr-cat">{n.cat}</span>
              <span className="sr-title">{n.title}</span>
              <span className="sr-ex">{n.excerpt}</span>
            </div>
          ))}
        </div>
        <div className="search-foot">
          <span><b>↑↓</b> 选择</span>
          <span><b>↵</b> 打开</span>
          <span><b>esc</b> 关闭</span>
          <span style={{ marginLeft: "auto" }}>{results.length} 个结果</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Topbar, Hero, Controls, NoteCard, Timeline, SearchOverlay });
