// 图标集 — 极简线性图标，stroke 跟随 currentColor
const Ic = {};
const mk = (paths, opts = {}) => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={opts.sw || 1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {paths}
  </svg>
);

Ic.Search = mk(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>);
Ic.Sun = mk(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" /></>);
Ic.Moon = mk(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />);
Ic.Grid = mk(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>);
Ic.Timeline = mk(<><path d="M5 4v16" /><circle cx="5" cy="8" r="1.6" fill="currentColor" stroke="none" /><circle cx="5" cy="16" r="1.6" fill="currentColor" stroke="none" /><path d="M10 8h9M10 16h9" /></>);
Ic.Graph = mk(<><circle cx="6" cy="7" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="16" cy="18" r="2.4" /><circle cx="8" cy="16" r="2" /><path d="M8 8.6l8-1.6M8.4 14.4l6.6 2.4M7.4 9.2L7.6 14M16.4 8.2L16.2 15.6" /></>);
Ic.Close = mk(<path d="M6 6l12 12M18 6L6 18" />);
Ic.Link = mk(<path d="M9 12h6M11 8H8a4 4 0 0 0 0 8h3M13 8h3a4 4 0 0 1 0 8h-3" />);
Ic.Arrow = mk(<path d="M5 12h14M13 6l6 6-6 6" />);
Ic.ArrowUL = mk(<path d="M17 17L7 7M7 7v9M7 7h9" />);
Ic.Leaf = mk(<><path d="M5 21c0-8 5-14 14-15-1 9-6 14-14 15z" /><path d="M9 17c2-4 5-6 8-7" /></>);
Ic.Hash = mk(<path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" />);
Ic.Seed = mk(<><circle cx="12" cy="13" r="6" /><path d="M12 7V3M12 3c1.5 0 3 .8 3 2" /></>);

window.Ic = Ic;
