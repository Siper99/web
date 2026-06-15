// 关系图谱 — 轻量力导向布局（一次性静态求解）+ 平移 + 点击高亮
const { useState: useStateG, useMemo: useMemoG, useRef: useRefG } = React;

function computeLayout(notes, edges, W, H) {
  const pos = {};
  const N = notes.length;
  notes.forEach((n, i) => {
    const a = (i / N) * Math.PI * 2;
    pos[n.id] = { x: W / 2 + Math.cos(a) * 190, y: H / 2 + Math.sin(a) * 155, vx: 0, vy: 0 };
  });
  for (let it = 0; it < 320; it++) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = pos[notes[i].id], b = pos[notes[j].id];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01, d = Math.sqrt(d2);
        const rep = 11000 / d2, fx = (dx / d) * rep, fy = (dy / d) * rep;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
    }
    edges.forEach((e) => {
      const a = pos[e.s], b = pos[e.t];
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - 128) * 0.022, fx = (dx / d) * f, fy = (dy / d) * f;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    });
    notes.forEach((n) => {
      const p = pos[n.id];
      p.vx += (W / 2 - p.x) * 0.006; p.vy += (H / 2 - p.y) * 0.006;
      p.x += Math.max(-9, Math.min(9, p.vx)); p.y += Math.max(-9, Math.min(9, p.vy));
      p.vx *= 0.86; p.vy *= 0.86;
    });
  }
  // 收进边距
  notes.forEach((n) => {
    const p = pos[n.id];
    p.x = Math.max(60, Math.min(W - 60, p.x));
    p.y = Math.max(44, Math.min(H - 44, p.y));
  });
  return pos;
}

function GraphView({ notes, onOpen }) {
  const W = 900, H = 540;
  const [sel, setSel] = useStateG(null);
  const [pan, setPan] = useStateG({ x: 0, y: 0 });
  const drag = useRefG(null);

  const { pos, edges, degree, byId } = useMemoG(() => {
    const byId = Object.fromEntries(notes.map((n) => [n.id, n]));
    const set = new Set(), edges = [];
    notes.forEach((n) => n.links.forEach((t) => {
      if (!byId[t]) return;
      const key = [n.id, t].sort().join("·");
      if (!set.has(key)) { set.add(key); edges.push({ s: n.id, t }); }
    }));
    const degree = {};
    notes.forEach((n) => (degree[n.id] = 0));
    edges.forEach((e) => { degree[e.s]++; degree[e.t]++; });
    const pos = computeLayout(notes, edges, W, H);
    return { pos, edges, degree, byId };
  }, [notes]);

  const neighbors = useMemoG(() => {
    if (!sel) return null;
    const s = new Set([sel]);
    edges.forEach((e) => { if (e.s === sel) s.add(e.t); if (e.t === sel) s.add(e.s); });
    return s;
  }, [sel, edges]);

  const onDown = (e) => { drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; };
  const onMove = (e) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };
  const onUp = () => { drag.current = null; };

  const selNote = sel ? byId[sel] : null;

  return (
    <div className="graph-wrap">
      <div className="graph-legend">
        <span><i className="ev"></i>常青</span>
        <span><i></i>萌芽</span>
      </div>
      <svg className="graph-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
           onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
           onClick={(e) => { if (e.target.tagName === "svg") setSel(null); }}>
        <g transform={`translate(${pan.x} ${pan.y})`}>
          {edges.map((e, i) => {
            const hot = neighbors && (e.s === sel || e.t === sel);
            const dim = neighbors && !hot;
            return (
              <line key={i} className={"g-edge" + (hot ? " hot" : "")}
                    style={dim ? { opacity: 0.12 } : null}
                    x1={pos[e.s].x} y1={pos[e.s].y} x2={pos[e.t].x} y2={pos[e.t].y} />
            );
          })}
          {notes.map((n) => {
            const p = pos[n.id];
            const r = 7 + degree[n.id] * 1.7;
            const hot = neighbors && neighbors.has(n.id);
            const isSel = sel === n.id;
            const cls = "g-node" + (isSel ? " hot" : "") + (neighbors && !hot ? " dim" : "");
            return (
              <g key={n.id} className={cls} transform={`translate(${p.x} ${p.y})`}
                 onClick={(e) => { e.stopPropagation(); sel === n.id ? onOpen(n.id) : setSel(n.id); }}>
                <circle r={r} style={n.seed === "evergreen" && !isSel ? { fill: "var(--accent-soft)" } : null} />
                <text x={r + 6} y={4}>{n.title}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="graph-hint">
        {selNote ? <>已选「{selNote.title}」· 再次点击节点可打开</> : <>点击节点查看连接 · 拖拽背景平移</>}
      </div>
      {selNote && (
        <div style={{
          position: "absolute", left: 16, bottom: 44, background: "var(--surface)",
          border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "14px 16px",
          boxShadow: "var(--shadow-lift)", maxWidth: 280,
        }}>
          <div className="card-cat" style={{ marginBottom: 4 }}>{selNote.cat}</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, marginBottom: 6 }}>{selNote.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 12 }}>{selNote.excerpt}</div>
          <button className="chip" data-on="true" onClick={() => onOpen(selNote.id)}>打开笔记 →</button>
        </div>
      )}
    </div>
  );
}

window.GraphView = GraphView;
