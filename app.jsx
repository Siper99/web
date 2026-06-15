// 主 App — 状态管理与组合
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const LS = {
  get: (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
};

function App() {
  const D = window.GARDEN;
  const [dir, setDir] = useStateA(() => LS.get("mg-dir", "editorial"));
  const [mode, setMode] = useStateA(() => LS.get("mg-mode", "light"));
  const [view, setView] = useStateA("grid");
  const [active, setActive] = useStateA([]);
  const [searchOpen, setSearchOpen] = useStateA(false);
  const [openId, setOpenId] = useStateA(null);

  useEffectA(() => {
    document.documentElement.setAttribute("data-dir", dir);
    document.documentElement.setAttribute("data-mode", mode);
    LS.set("mg-dir", dir); LS.set("mg-mode", mode);
  }, [dir, mode]);

  useEffectA(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 按更新时间倒序
  const notes = useMemoA(() => [...D.notes].sort((a, b) => b.updated.localeCompare(a.updated)), [D]);

  const counts = useMemoA(() => {
    const c = { __all: notes.length };
    D.categories.forEach((cat) => (c[cat] = notes.filter((n) => n.cat === cat).length));
    return c;
  }, [notes, D]);

  const filtered = useMemoA(
    () => (active.length === 0 ? notes : notes.filter((n) => active.includes(n.cat))),
    [notes, active]
  );

  const toggleCat = (c) => {
    if (c === "__all") return setActive([]);
    setActive((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));
  };

  const toggleMode = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const openNote = (id) => { setOpenId(id); setSearchOpen(false); };

  const evergreen = notes.filter((n) => n.seed === "evergreen").length;
  const lastUpdated = (() => { const [, m, d] = notes[0].updated.split("-"); return `${m}.${d}`; })();
  const openNoteObj = openId ? notes.find((n) => n.id === openId) : null;

  return (
    <div className="app">
      <Topbar dir={dir} setDir={setDir} mode={mode} toggleMode={toggleMode} onSearch={() => setSearchOpen(true)} />
      <Hero meta={D.meta} total={notes.length} evergreen={evergreen} lastUpdated={lastUpdated} />
      <Controls view={view} setView={setView} cats={D.categories} active={active} toggleCat={toggleCat} counts={counts} />

      <main>
        <div className="wrap">
          <div className="section-head">
            <span className="num">{view === "graph" ? `${notes.length} 节点 / ${notes.reduce((s, n) => s + n.links.length, 0)} 连接` : `${filtered.length} / ${notes.length}`}</span>
            <h2>{view === "grid" ? "笔记 Notes" : view === "timeline" ? "更新时间线 Timeline" : "关系图谱 Graph"}</h2>
            <span className="rule"></span>
          </div>

          {view === "grid" && (
            filtered.length === 0
              ? <div className="empty">该分类下还没有笔记。</div>
              : <div className="grid">{filtered.map((n) => <NoteCard key={n.id} note={n} onOpen={openNote} />)}</div>
          )}
          {view === "timeline" && (
            filtered.length === 0
              ? <div className="empty">该分类下还没有笔记。</div>
              : <Timeline notes={filtered} onOpen={openNote} />
          )}
          {view === "graph" && <GraphView notes={notes} onOpen={openNote} />}
        </div>
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <span className="brand-mark" style={{ width: 22, height: 22 }}><Ic.Leaf width="20" height="20" /></span>
          <span className="footer-note">{D.meta.name} · 一座持续生长的数字花园 · 占位内容，可随时替换为你的 Obsidian 笔记</span>
          <span className="footer-en">Tend your garden</span>
        </div>
      </footer>

      {searchOpen && <SearchOverlay notes={notes} onClose={() => setSearchOpen(false)} onSelect={openNote} />}
      {openNoteObj && <ReaderView note={openNoteObj} allNotes={notes} onClose={() => setOpenId(null)} onOpen={openNote} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
