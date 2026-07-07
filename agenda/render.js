/* CapLink Studio — shared agenda deck renderer (portrait).
   Used by /agenda/ (public viewer) and /agenda-generator/ (editor preview).
   AgendaRender.buildDeck(rootEl, data, opts) -> number of pages.
   opts.edit=true adds click-to-edit attributes + per-section toolbars.     */
(function(){
"use strict";

var W=1000,H=1294;                       /* portrait, US Letter (8.5x11) ratio */
var LW=1647,LH=1000;                     /* landscape — LEGAL paper (14x8.5), same px-per-inch as portrait */
var LAND=false;                          /* set per document in buildDeck (meta.orient) */
var THEMES={
  dubai:{pill:"#102b35",ribbon:"#12303c",accent:"#2f5d63"},
  european:{pill:"#2A1228",ribbon:"#2A1228",accent:"#6b2554"},
  newyork:{pill:"#2b161c",ribbon:"#472E40",accent:"#A15D50"},
  boston:{pill:"#451523",ribbon:"#5E1A2E",accent:"#5E1A2E"},
  london:{pill:"#0D1426",ribbon:"#0D1426",accent:"#8A7547"}
};
var SIL='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" fill="#d3d3d6"/><circle cx="44" cy="34" r="15" fill="#b6b6bb"/><path d="M14 88c3-20 16-28 30-28s27 8 30 28z" fill="#b6b6bb"/></svg>');
var SKY="../assets/sky.jpg", CAP="../assets/caplink-group.png", LOCK="../assets/pcs-lockup.png";
var CAPW="https://images.squarespace-cdn.com/content/5dc9f095a5705651ea40e08b/008f2ad1-32fb-48f6-b1ba-0392c1d2b27b/CapLink-Logo-White.png?content-type=image%2Fpng";
var CAPSTACK="https://images.squarespace-cdn.com/content/5dc9f095a5705651ea40e08b/d3350fd1-e6ea-45ee-8a37-245875e886e2/CapLink-Colour-Stacked-White.png?content-type=image%2Fpng";
var EDIT=false;

function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function pic(src){return esc(src&&String(src).trim()?src:SIL);}
function de(p,ml){return EDIT?' data-edit="'+p+'"'+(ml?' data-ml="1"':""):"";}
function dp(p,mode){return EDIT?' data-photo="'+p+'" data-mode="'+mode+'"':"";}

var CSS=
".agdk{--pill:#102b35;--ribbon:#12303c;--accent:#2f5d63;font-family:'Raleway',system-ui,sans-serif;-webkit-font-smoothing:antialiased}"+
".agdk .sl{width:"+W+"px;height:"+H+"px;background:#fff;position:relative;overflow:hidden;color:#222}"+
".agdk .sl *{box-sizing:border-box;margin:0;padding:0}"+
".agdk .foot{position:absolute;left:64px;right:64px;bottom:30px;display:flex;justify-content:space-between;font-size:9px;letter-spacing:.22em;color:#9b9ba0;text-transform:uppercase;font-weight:500}"+
/* dark pages */
".agdk .dark{color:#fff}"+
".agdk .dark .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}"+
/* Standard cover scrim: gentle bands where type sits (top: host lockup,
   mid: title, bottom: date + partners) that ease off between them —
   legible without flattening the photo into night */
".agdk .dark .tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,10,16,.5) 0%,rgba(12,10,16,.2) 26%,rgba(12,10,16,.3) 46%,rgba(12,10,16,.2) 64%,rgba(12,10,16,.56) 100%)}"+
".agdk .ct-tint{position:absolute;inset:0;background:linear-gradient(160deg,rgba(30,11,27,.96) 0%,rgba(42,18,40,.9) 48%,rgba(22,8,20,.96) 100%)}"+
".agdk .ct-logo{position:absolute;top:58px;right:64px;height:34px}"+
".agdk .ct-web{position:absolute;left:0;right:0;bottom:44px;text-align:center;font-size:12px;letter-spacing:.32em;font-weight:600;color:rgba(255,255,255,.75);text-transform:uppercase}"+
".agdk .back-web{position:absolute;left:0;right:0;bottom:130px;text-align:center;font-size:13px;letter-spacing:.34em;font-weight:600;color:rgba(255,255,255,.85);text-transform:uppercase}"+
".agdk-edit [data-edit]:empty{display:inline-block;min-width:34px;min-height:1em}"+
".agdk-edit [data-edit]:empty::after{content:'· · ·';opacity:.18}"+
".agdk .cov-cap{position:absolute;top:64px;left:64px;height:42px}"+
".agdk .cov-host{position:absolute;top:56px;left:64px}"+
".agdk .cov-host .lbl{font-size:9px;letter-spacing:.3em;font-weight:600;color:rgba(255,255,255,.6);text-transform:uppercase;margin-bottom:8px}"+
".agdk .cov-host img{display:block;max-width:360px;object-fit:contain;object-position:left}"+
".agdk .cov-lock{position:absolute;top:372px;left:50%;transform:translateX(-50%);width:560px}"+
/* soft feathered plate behind the title zone — darkens only where the
   lockup and date sit, no visible edges, vanishes on already-dark skies */
".agdk .cov-glow{position:absolute;top:296px;left:0;right:0;height:480px;background:radial-gradient(ellipse 64% 52% at 50% 44%,rgba(10,8,13,.5),rgba(10,8,13,0) 74%)}"+
".agdk .cov-lockt{position:absolute;top:396px;left:64px;right:64px;display:flex;align-items:center;justify-content:center;gap:30px;color:#fff;text-shadow:0 1px 20px rgba(0,0,0,.5)}"+
".agdk .cov-lockt .c1{font-size:46px;font-weight:600;letter-spacing:.05em;white-space:nowrap;text-align:right;line-height:1.18}"+
".agdk .cov-lockt .vb{width:3px;align-self:stretch;background:rgba(255,255,255,.92)}"+
".agdk .cov-lockt .c2{display:flex;flex-direction:column;font-size:41px;font-weight:700;line-height:1.16;letter-spacing:.03em;text-align:left}"+
".agdk-edit .cov-lockt{cursor:pointer}"+
".agdk .cov-date{position:absolute;top:696px;left:0;right:0;text-align:center;font-size:19px;font-weight:700;letter-spacing:.26em;text-shadow:0 1px 16px rgba(0,0,0,.45)}"+
".agdk .cov-date span{font-weight:300;letter-spacing:.2em;opacity:.85}"+
".agdk .cov-rail{position:absolute;left:64px;right:64px;bottom:108px;display:flex;justify-content:center;gap:80px;text-align:center}"+
".agdk .cov-rail .cp{display:flex;flex-direction:column;align-items:center;gap:6px}"+
".agdk .cov-rail .lbl{font-size:9.5px;letter-spacing:.3em;font-weight:600;color:rgba(255,255,255,.85);text-transform:uppercase}"+
".agdk .cov-rail .slot{height:96px;display:flex;align-items:center;justify-content:center}"+
".agdk .cov-rail img{max-width:190px;object-fit:contain}"+
".agdk .cov-rail .txt{font-size:19px;font-weight:600;letter-spacing:.12em}"+
".agdk .cov-note{position:absolute;left:0;right:0;bottom:42px;text-align:center;font-size:10px;opacity:.55;font-weight:300;letter-spacing:.08em}"+
/* light page header */
".agdk .hd{position:absolute;top:52px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:flex-start}"+
".agdk .hd .t1{font-size:24px;font-weight:700;color:#1c1420}.agdk .hd .t1 span{font-weight:300}"+
".agdk .hd .t2{font-size:9px;letter-spacing:.3em;color:#a59fa4;font-weight:500;margin-top:6px;text-transform:uppercase}"+
".agdk .hd img{height:36px;filter:brightness(0) opacity(.82)}"+
".agdk .hrule{position:absolute;top:126px;left:64px;right:64px;height:2px;background:#241020}"+
/* welcome */
".agdk .wel-band{position:absolute;top:150px;left:64px;right:64px;background:var(--pill);color:#fff;border-radius:22px;text-align:center;font-size:11.5px;letter-spacing:.28em;font-weight:600;padding:10px 0;text-transform:uppercase}"+
".agdk .wel-body{position:absolute;top:206px;left:64px;right:64px;bottom:70px;font-size:14px;line-height:1.74;color:#4c4650;font-weight:400;overflow:hidden}"+
".agdk .wel-body p{margin-bottom:17px}"+
".agdk .wel-sig{margin-top:34px}"+
".agdk .wel-sigrow{display:flex;gap:120px}"+
".agdk .wel-sig .sig{height:58px;display:block;margin-bottom:9px;max-width:280px;object-fit:contain;object-position:left}"+
".agdk .wel-sig .nm{font-size:15.5px;color:#241020}.agdk .wel-sig .nm b{font-weight:700}"+
".agdk .wel-sig .org{font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--accent);margin-top:5px;text-transform:uppercase}"+
/* optional "at a glance" strip and slim photo band pinned to the bottom of
   the welcome page (meta.welcome.facts / meta.welcome.bandImg) — they fill
   the space under short letters as a bottom group */
".agdk .wel-body.hasfacts{display:flex;flex-direction:column}"+
".agdk .wel-photo{margin-top:auto;height:170px;border-radius:6px;overflow:hidden;flex:0 0 auto}"+
".agdk .wel-photo img{width:100%;height:100%;object-fit:cover;display:block}"+
".agdk .wel-facts{margin-top:auto;display:flex;gap:34px;padding-top:26px}"+
".agdk .wel-photo~.wel-facts{margin-top:28px}"+
".agdk .wf{flex:1;min-width:0;border-top:2.5px solid var(--accent);padding-top:12px;position:relative}"+
".agdk .wf .k{font-size:9.5px;letter-spacing:.26em;font-weight:700;color:var(--accent);text-transform:uppercase}"+
".agdk .wf .v{font-size:14.5px;font-weight:600;color:#241020;margin-top:8px;line-height:1.5}"+
".agdk-edit .wf .spx{position:absolute;top:4px;right:0;display:none}"+
".agdk-edit .wf:hover .spx{display:block}"+
/* speakers */
".agdk .spk-badge{position:absolute;top:150px;left:64px;background:var(--pill);color:#fff;font-size:10px;font-weight:700;letter-spacing:.24em;padding:8px 20px;border-radius:16px;text-transform:uppercase}"+
".agdk .spk-sub{position:absolute;top:198px;left:66px;right:64px;font-size:12.5px;font-style:italic;font-weight:400;color:#8a7f86;letter-spacing:.02em}"+
".agdk .spk-wrap{position:absolute;top:206px;left:64px;right:64px;bottom:72px;display:flex;gap:40px}"+
".agdk .spk-col{flex:1;min-width:0}"+
".agdk .spke1{font-size:11.6px;line-height:1.5;margin-bottom:10px;color:#5a5460}"+
".agdk .spke1 b{color:#241020;font-weight:700}"+
".agdk .spke1 i{font-weight:400}"+
".agdk .spke1 .f{font-weight:700;color:#38323c}"+
".agdk .spk-gridwrap{position:absolute;top:206px;left:64px;right:64px;bottom:72px;display:flex;flex-direction:column;gap:20px}"+
".agdk .spk-row{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 22px}"+
".agdk .spk-cell{display:flex;gap:11px;align-items:flex-start;min-width:0}"+
".agdk-edit .spk-cell{position:relative}"+
".agdk-edit .spk-cell .spx{position:absolute;top:-8px;right:-4px;display:none;z-index:5}"+
".agdk-edit .spk-cell:hover .spx{display:block}"+
".agdk-edit .spke1 .spx{margin-left:6px;display:none;vertical-align:1px}"+
".agdk-edit .spke1:hover .spx{display:inline-block}"+
/* hairline keyline so white-background headshots keep their square edge
   on the white speakers page (invisible on darker photos) */
".agdk .spk-cell img{width:56px;height:56px;object-fit:cover;border-radius:0;flex:0 0 auto;border:1px solid #e8e5e9}"+
".agdk .spk-cell .nm{font-size:12px;font-weight:700;color:#241020;line-height:1.25}"+
".agdk .spk-cell .tt{font-size:9.8px;color:#7f7984;font-style:italic;line-height:1.3;margin-top:1px}"+
".agdk .spk-cell .fm{font-size:10.4px;font-weight:700;color:#38323c;margin-top:2px;line-height:1.25}"+
/* agenda rows */
".agdk .rows{position:absolute;top:44px;left:56px;right:56px;bottom:60px;overflow:hidden;display:flex;flex-direction:column}"+
".agdk .rows.fill{justify-content:space-between}"+
".agdk .row{background:#f7f6f7;border-radius:8px;margin-bottom:12px;padding:0 28px;position:relative}"+
".agdk .rhead{display:flex;align-items:center;gap:22px;min-height:62px;padding:12px 0}"+
".agdk .pill{background:var(--pill);color:#fff;font-size:14px;font-weight:700;letter-spacing:.04em;border-radius:20px;padding:9px 19px;white-space:nowrap;font-variant-numeric:tabular-nums}"+
".agdk .rtitle{font-size:21px;font-weight:700;color:#241f26;flex:1;line-height:1.28}"+
".agdk .rnote{font-size:11.5px;color:#8d8791;font-style:italic;white-space:nowrap}"+
".agdk .rmeta{display:flex;justify-content:flex-end;align-items:center;gap:20px;padding:0 4px 12px;margin-top:-2px}"+
".agdk .notesblk{flex:1;display:flex;flex-direction:column;min-height:0;margin-top:6px}"+
".agdk .notesblk .nlab{font-size:9px;font-weight:700;letter-spacing:.28em;color:#b3a8b0;text-transform:uppercase;margin:0 4px 2px}"+
".agdk .notesblk .nlines{flex:1;margin:0 4px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 33px,#e6e0e4 33px,#e6e0e4 34px)}"+
".agdk .rspon{display:flex;align-items:center;gap:10px;white-space:nowrap;flex-wrap:wrap;justify-content:flex-end}"+
".agdk .spitem{display:inline-flex;align-items:center;gap:6px}"+
".agdk .spdiv{width:1px;height:20px;background:#ddd5da;margin:0 10px}"+
".agdk-edit .spx{font-family:inherit;font-size:9px;border:1px solid #dfb6b6;color:#a33;background:#fff;border-radius:3px;padding:2px 5px;cursor:pointer;line-height:1}"+
".agdk .rspon .sb{font-size:8px;letter-spacing:.24em;color:#9b95a0;font-weight:600}"+
".agdk .rspon img{max-width:150px;object-fit:contain}"+
".agdk .rspon .snm{font-size:13px;font-weight:700;color:#38323c}"+
".agdk .rl{font-size:8.5px;letter-spacing:.26em;color:#a09aa5;font-weight:600;margin-bottom:7px;text-transform:uppercase}"+
".agdk .rdesc{font-size:12.4px;line-height:1.62;color:#6e6873;padding:2px 4px 14px}"+
".agdk .prow{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 24px;padding:6px 4px 24px}"+
".agdk .pcell{display:flex;gap:13px;align-items:flex-start;min-width:0}"+
".agdk .pcell img{width:68px;height:68px;object-fit:cover;border-radius:0;flex:0 0 auto;border:1px solid #e8e5e9}"+
".agdk .pcell .mtag{font-size:9px;letter-spacing:.2em;color:var(--accent);font-weight:700;text-transform:uppercase;margin-bottom:3px}"+
".agdk .pcell .nm{font-size:12.8px;font-weight:700;color:#241f26;line-height:1.28}"+
".agdk .pcell .tt{font-size:11px;color:#7f7984;line-height:1.38;margin-top:2px}"+
".agdk .pcell .fm{font-size:11.2px;font-weight:700;color:#38323c;margin-top:3px;line-height:1.28}"+
/* roundtables */
".agdk .tbl-wrap{display:flex;gap:44px;padding:8px 4px 18px}"+
".agdk .tbl-col{flex:1}"+
".agdk .tbl{margin-bottom:13px;font-size:11.5px;line-height:1.5}"+
".agdk .tbl .tp{color:#38323c}.agdk .tbl .tp b{font-weight:700}.agdk .tbl .tp i{font-weight:400}"+
".agdk .tbl .hb{font-size:9.8px;font-weight:700;color:#241f26;margin-top:2px}"+
/* reception */
".agdk .rec2{display:flex;gap:30px;padding:8px 4px 24px;align-items:stretch}"+
".agdk .rec2-cols{flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px;min-width:0}"+
".agdk .rec2 h4{font-size:10.5px;letter-spacing:.26em;font-weight:700;color:var(--accent);margin-bottom:8px;text-transform:uppercase}"+
".agdk .rec2 p{font-size:12.2px;line-height:1.7;color:#6e6873}"+
".agdk .rec2-photo{flex:0 0 360px;overflow:hidden;min-height:210px;border-radius:4px}"+
".agdk .rec2-photo img{width:100%;height:100%;object-fit:cover;display:block}"+
".agdk .thanksnote{background:#faf7f3;border:1px solid #ece3d8;border-radius:10px;padding:36px 52px;text-align:center;margin-top:2px}"+
".agdk .thanksnote .tn-label{font-size:9.5px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin-bottom:13px}"+
".agdk .thanksnote .tn-body{font-size:14.5px;line-height:1.85;color:#5c5257;font-style:italic;font-weight:400;max-width:740px;margin:0 auto}"+
".agdk .rows.recpg .thanksnote{flex:1;display:flex;flex-direction:column;justify-content:center}"+
/* about-our-partners page (optional, meta.about) — one photo+blurb card per partner */
".agdk .ab-grid{position:absolute;top:206px;left:64px;right:64px;bottom:72px;display:flex;gap:44px}"+
".agdk .ab-card{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}"+
".agdk .ab-photo{height:300px;overflow:hidden;border-radius:6px;background:#efedef;flex:0 0 auto;position:relative}"+
".agdk .ab-photo img{width:100%;height:100%;object-fit:cover;display:block}"+
/* optional partner logo overlaid centred ON the photo (items[i].logo) */
".agdk .ab-plogo{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}"+
".agdk .ab-plogo img{width:auto;height:auto;max-height:56px;max-width:62%;object-fit:contain;filter:drop-shadow(0 2px 12px rgba(0,0,0,.5))}"+
".agdk-edit .ab-plogo{pointer-events:auto}"+
".agdk .ab-head{font-size:23px;font-weight:700;color:#241020;margin-top:24px}"+
".agdk .ab-sub{font-size:10px;letter-spacing:.26em;font-weight:700;color:var(--accent);text-transform:uppercase;margin-top:7px}"+
".agdk .ab-body{font-size:13.2px;line-height:1.78;color:#5a5460;margin-top:16px;overflow:hidden}"+
/* sponsors */
".agdk .sp-grid{position:absolute;top:156px;left:64px;right:64px;bottom:72px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:26px}"+
".agdk .sp-col{min-width:0;display:flex;flex-direction:column}"+
".agdk .sp-rib{background:var(--ribbon);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.24em;text-align:center;padding:7px 4px;text-transform:uppercase;clip-path:polygon(0 0,100% 0,97.5% 100%,2.5% 100%)}"+
".agdk .sp-logo{height:130px;display:flex;align-items:center;justify-content:center;padding:16px 12px}"+
".agdk .sp-logo img{max-width:75%;object-fit:contain}"+
".agdk .sp-logo .snm{font-size:22px;font-weight:700;color:#28222c;text-align:center}"+
".agdk .sp-desc{background:#f4f2f4;flex:1;padding:20px 19px;font-size:12.2px;line-height:1.7;color:#524c57;overflow:hidden}"+
/* contact */
".agdk .ct-cap{position:absolute;top:80px;left:64px;font-size:10px;letter-spacing:.34em;font-weight:600;text-transform:uppercase;color:rgba(255,255,255,.55)}"+
".agdk .ct-title{position:absolute;top:106px;left:64px;font-size:40px;font-weight:300;letter-spacing:.14em}"+
".agdk .ct-sub{position:absolute;top:180px;left:64px;right:64px;font-size:12px;font-weight:300;opacity:.88;line-height:1.6}"+
".agdk .ct-line{position:absolute;top:234px;left:64px;right:64px;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.4),rgba(255,255,255,.08))}"+
".agdk .ct-list{position:absolute;top:266px;left:64px;right:64px;bottom:104px;display:flex;flex-direction:column}"+
".agdk .ct-row{flex:1;display:flex;align-items:center;justify-content:space-between;gap:40px;border-bottom:1px solid rgba(255,255,255,.13);min-height:0}"+
".agdk .ct-row:last-child{border-bottom:none}"+
".agdk .ct .nm{font-size:16.5px;font-weight:600;letter-spacing:.02em;line-height:1.3}"+
".agdk .ct .rl2{font-size:8.5px;letter-spacing:.26em;font-weight:500;color:rgba(255,255,255,.5);margin-top:5px;text-transform:uppercase}"+
".agdk .ct-lines{text-align:right;flex:0 0 auto}"+
".agdk .ct .ln{font-size:11.8px;font-weight:300;color:rgba(255,255,255,.88);margin-top:3px;letter-spacing:.02em;font-variant-numeric:tabular-nums}"+
".agdk .ct .ln:first-child{margin-top:0;font-weight:400;color:#fff}"+
".agdk .ln .lk{display:inline-block;width:17px;font-size:8px;font-weight:600;letter-spacing:.1em;color:rgba(255,255,255,.35);text-align:left}"+
".agdk .back-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);width:330px}"+
/* centred feathered fade so the logo stands out on bright skies */
".agdk .back-glow{position:absolute;inset:0;background:radial-gradient(ellipse 42% 42% at 50% 48%,rgba(8,6,11,.6) 0%,rgba(8,6,11,.28) 50%,rgba(8,6,11,0) 74%)}"+
/* closing page — editorial contact spread with photo rail */
".agdk .cl2-rail{position:absolute;top:0;right:0;bottom:0;width:330px;overflow:hidden}"+
".agdk .cl2-rail .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}"+
".agdk .cl2-tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,10,22,.74),rgba(24,12,26,.38) 46%,rgba(20,10,22,.68))}"+
".agdk .cl2-logo{position:absolute;top:88px;left:50%;transform:translateX(-50%);width:192px}"+
".agdk .cl2-web{position:absolute;bottom:66px;left:0;right:0;text-align:center;font-size:9.5px;letter-spacing:.28em;font-weight:600;color:rgba(255,255,255,.85);text-transform:uppercase}"+
".agdk .cl2-bar{position:absolute;top:160px;left:78px;width:5px;height:98px;background:var(--accent)}"+
".agdk .cl2-head{position:absolute;top:154px;left:107px;right:410px}"+
".agdk .cl2-head .h1{font-size:36px;font-weight:700;color:#241020;letter-spacing:.01em;line-height:1.24}"+
".agdk .cl2-head .h2{font-size:29px;font-weight:300;font-style:italic;color:#8a7f86;line-height:1.32;margin-top:2px}"+
".agdk .cl2-grid{position:absolute;top:338px;left:107px;right:404px;bottom:96px;display:grid;grid-template-columns:1fr 1fr;gap:44px 50px;align-content:start}"+
".agdk .cl2-p .nm{font-size:15px;font-weight:700;color:#241020;letter-spacing:.01em}"+
".agdk .cl2-p .rl{font-size:8.5px;letter-spacing:.22em;color:#9a8f96;text-transform:uppercase;margin:4px 0 7px;font-weight:600}"+
".agdk .cl2-p .ln{font-size:11.3px;font-weight:400;color:#5a5460;line-height:1.6;letter-spacing:.02em;font-variant-numeric:tabular-nums;word-break:break-word}"+
".agdk .cl2-p .ln.em{color:var(--accent);font-weight:500}"+
".agdk .cl2-p .lk{font-size:7.5px;color:#b1a7ad;font-weight:700;letter-spacing:.08em}"+
/* editor affordances (active only under .agdk-edit) */
".agdk-edit [data-edit]{cursor:text;border-radius:3px;outline:1px dashed transparent;transition:outline-color .12s,background .12s}"+
".agdk-edit [data-edit]:hover{outline-color:#c9a0bd;background:rgba(107,37,84,.07)}"+
".agdk-edit [data-edit]:focus{outline:2px solid #8a3d6f;background:#fff;color:#241f26;min-width:30px}"+
".agdk-edit img[data-photo]{cursor:pointer}"+
".agdk-edit img[data-photo]:hover{outline:3px solid #8a3d6f;outline-offset:2px}"+
".agdk-edit .rowbar{position:absolute;top:-13px;right:14px;display:none;gap:5px;z-index:5}"+
".agdk-edit .row:hover .rowbar{display:flex}"+
".agdk-edit .rowbar button{font-family:inherit;font-size:11px;line-height:1;padding:6px 9px;border:1px solid #caa;border:1px solid #d0b3c6;border-radius:5px;background:#fff;color:#6b2554;cursor:pointer;box-shadow:0 2px 8px rgba(40,20,40,.18);font-weight:700}"+
".agdk-edit .rowbar button:hover{background:#f7eef4}"+
".agdk-edit .ghost{border:1.5px dashed #d0b3c6;color:#8a3d6f;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;border-radius:6px;min-height:52px;background:rgba(255,255,255,.6)}"+
".agdk-edit .ghost:hover{background:#f7eef4}"+
".agdk-edit .ghost.gt{min-height:30px;margin-top:4px}"+
".agdk-edit .pcell{position:relative}"+
".agdk-edit .pmv{position:absolute;top:-14px;left:0;display:none;gap:3px;z-index:4}"+
".agdk-edit .pcell:hover .pmv{display:flex}"+
".agdk-edit .pmv button{font-family:inherit;font-size:10px;line-height:1;padding:4px 7px;border:1px solid #d0b3c6;border-radius:4px;background:#fff;color:#6b2554;cursor:pointer;box-shadow:0 2px 6px rgba(40,20,40,.15);font-weight:700}"+
".agdk-edit .pmv button:hover{background:#f7eef4}"+
/* ---- landscape (legal, 14x8.5) overrides — active only with meta.orient:"landscape" ---- */
".agdk-land .sl{width:"+LW+"px;height:"+LH+"px}"+
/* landscape cover: everything scaled UP for the wide legal page.
   Lara's cover treatment (v73): a HALF-DOME of black rising from the
   bottom edge — darkest low (partner logos, date), still solid behind
   the event lockup that starts mid-page, feathering to NOTHING before
   the top so the sky stays completely clean. No edges anywhere. */
".agdk-land .cov .tint{background:none}"+
".agdk-land .cov-glow{top:0;height:100%;background:radial-gradient(ellipse 70% 90% at 50% 100%,rgba(0,0,0,.74) 0%,rgba(0,0,0,.6) 44%,rgba(0,0,0,.3) 70%,rgba(0,0,0,0) 100%)}"+
".agdk-land .cov-cap{height:58px}"+
".agdk-land .cov-host .lbl{font-size:11px}"+
".agdk-land .cov-host img{max-width:480px}"+
".agdk-land .cov-lock{top:270px;width:720px}"+
".agdk-land .cov-lockt{top:300px;gap:38px;text-shadow:0 2px 8px rgba(0,0,0,.6),0 0 36px rgba(0,0,0,.65)}"+
".agdk-land .cov-lockt .c1{font-size:58px}"+
".agdk-land .cov-lockt .vb{width:4px}"+
".agdk-land .cov-lockt .c2{font-size:52px}"+
".agdk-land .cov-date{top:600px;font-size:24px;text-shadow:0 2px 8px rgba(0,0,0,.6),0 0 30px rgba(0,0,0,.65)}"+
".agdk-land .cov-rail{bottom:88px;gap:120px}"+
".agdk-land .cov-rail .lbl{font-size:11.5px}"+
".agdk-land .cov-rail .slot{height:120px}"+
".agdk-land .cov-rail img{max-width:250px}"+
".agdk-land .cov-rail .txt{font-size:24px}"+
".agdk-land .cov-note{bottom:32px;font-size:11.5px}"+
".agdk-land .back-logo{width:430px}"+
/* landscape back cover: radial gradient, dark in the CENTRE (behind the
   logo) fading outwards; banded tint off */
".agdk-land .bck .tint{background:none}"+
".agdk-land .bck .back-glow{background:radial-gradient(ellipse 52% 52% at 50% 50%,rgba(0,0,0,.72) 0%,rgba(0,0,0,.4) 46%,rgba(0,0,0,0) 78%)}"+
/* landscape welcome: a proper letter — full-width text edge to edge,
   larger type, signature bottom-LEFT under the text (Lara: no columns,
   no side rail, signature belongs on the left with the name) */
".agdk-land .wel-band{font-size:13px}"+
".agdk-land .wel-body{bottom:64px;font-size:18px;line-height:1.8}"+
".agdk-land .wel-photo{height:180px}"+
".agdk-land .wel-body p{margin-bottom:20px}"+
".agdk-land .wel-sig{margin-top:30px}"+
".agdk-land .wel-sig .sig{height:66px}"+
".agdk-land .wel-sig .nm{font-size:17px}"+
".agdk-land .wel-sig .org{font-size:12px}"+
".agdk-land .wf .k{font-size:10.5px}"+
".agdk-land .wf .v{font-size:16px}"+
".agdk-land .ab-photo{height:330px}"+
".agdk-land .ab-head{font-size:26px}"+
".agdk-land .ab-sub{font-size:11.5px}"+
".agdk-land .ab-body{font-size:15px}"+
".agdk-land .spk-row{grid-template-columns:repeat(4,1fr)}"+
/* big headshots — Lara's composites carry the firm logo inside the photo,
   so the photo IS the identity; text is secondary */
".agdk-land .spk-cell img{width:210px;height:210px}"+
".agdk-land .spk-cell .tt{font-size:9.5px}"+
/* firms: normal case (caps vetoed — read too big), smallest thing in the cell */
".agdk-land .spk-cell .fm{font-size:6.5px;font-weight:500;letter-spacing:.02em;text-transform:none;color:#98929c}"+
".agdk-land .prow{grid-template-columns:repeat(5,1fr)}"+
".agdk-land .rec2-photo{flex:0 0 520px}"+
".agdk-land .sp-grid{grid-template-columns:repeat(3,1fr)}"+
".agdk-land .cl2-rail{width:400px}"+
".agdk-land .cl2-logo{width:220px}"+
".agdk-land .cl2-head{top:138px;right:560px}"+
".agdk-land .cl2-bar{top:144px;height:92px}"+
".agdk-land .cl2-grid{top:300px;bottom:78px;right:474px;grid-template-columns:repeat(3,1fr);gap:36px 44px}"+
".agdk-land .thanksnote .tn-body{max-width:1100px;font-size:16px}"+
/* landscape type scale: portrait sizes read TINY on the bigger legal page —
   every text role steps up. Pagination re-measures with these applied. */
".agdk-land .hd .t1{font-size:28px}"+
".agdk-land .hd .t2{font-size:10.5px}"+
".agdk-land .hd img{height:42px}"+
".agdk-land .foot{font-size:10.5px}"+
".agdk-land .pill{font-size:16px;padding:10px 22px}"+
".agdk-land .rtitle{font-size:24px}"+
".agdk-land .rnote{font-size:13px}"+
".agdk-land .rdesc{font-size:14px;line-height:1.66}"+
".agdk-land .rl{font-size:10px}"+
".agdk-land .pcell img{width:88px;height:88px}"+
".agdk-land .pcell .mtag{font-size:10.5px}"+
".agdk-land .pcell .nm{font-size:14.5px}"+
".agdk-land .pcell .tt{font-size:12.5px}"+
".agdk-land .pcell .fm{font-size:13px}"+
".agdk-land .tbl{font-size:13px}"+
".agdk-land .tbl .hb{font-size:11.5px}"+
".agdk-land .rec2 p{font-size:14px}"+
".agdk-land .rec2 h4{font-size:12px}"+
".agdk-land .rspon .sb{font-size:9.5px}"+
".agdk-land .rspon .snm{font-size:15px}"+
".agdk-land .notesblk .nlab{font-size:10.5px}"+
".agdk-land .spk-badge{font-size:12px}"+
".agdk-land .spk-sub{font-size:14.5px;top:204px}"+
".agdk-land .spke1{font-size:13.5px}"+
/* NOTE: spk-cell img/.tt/.fm sizes live in the speakers block ABOVE —
   duplicates here once silently overrode weeks of size edits (v54–v76 bug) */
".agdk-land .spk-cell .nm{font-size:14px}"+
".agdk-land .sp-rib{font-size:11px}"+
".agdk-land .sp-desc{font-size:13.5px}"+
".agdk-land .sp-logo .snm{font-size:25px}"+
".agdk-land .cl2-head .h1{font-size:42px}"+
".agdk-land .cl2-head .h2{font-size:34px}"+
".agdk-land .cl2-p .nm{font-size:17px}"+
".agdk-land .cl2-p .rl{font-size:10px}"+
".agdk-land .cl2-p .ln{font-size:13px}"+
".agdk-land .cl2-web{font-size:11px}"+
".agdk-land .ct-title{font-size:48px}"+
".agdk-land .ct-cap{font-size:11.5px}"+
".agdk-land .ct-sub{font-size:14px}"+
".agdk-land .ct .nm{font-size:19px}"+
".agdk-land .ct .rl2{font-size:10px}"+
".agdk-land .ct .ln{font-size:13.5px}"+
".agdk-land .ct-web{font-size:13.5px}";

function slide(cls,inner){return '<div class="sl '+(cls||"")+'">'+inner+"</div>";}
function foot(meta,n){return '<div class="foot"><span'+de("meta.footerLeft")+'>'+esc(meta.footerLeft)+'</span><span>PAGE '+n+'</span></div>';}
function header(meta){
  /* All-caps city names get the classic Title-case treatment; mixed-case names (e.g. "AI / Data & Insight") are respected as written */
  var city=meta.city?(/[a-z]/.test(meta.city)?meta.city:meta.city.charAt(0)+meta.city.slice(1).toLowerCase()):"";
  /* explicit headImg:"" → NO header logo (unbranded, e.g. pending MTA);
     absent → the CapLink mark, as always */
  var hi=(meta.headImg===undefined||meta.headImg===null)?CAP:meta.headImg;
  var hlogo=hi?'<img src="'+esc(hi)+'"'+(meta.headH?' style="height:'+(+meta.headH||36)+'px"':"")+dp("meta.headImg","logo")+' alt="">'
    :(EDIT?'<div class="ghost gt" data-op="logoslot" data-path="meta.headImg" data-mode="logo" style="min-height:32px;padding:4px 12px">+ logo</div>':"");
  return '<div class="hd"><div><div class="t1"><span'+de("meta.city")+' style="font-weight:700">'+esc(city)+'</span> <span'+de("meta.event")+' style="font-weight:700">'+esc(meta.event)+'</span> <span'+de("meta.year")+'>'+esc(meta.year)+'</span></div><div class="t2"'+de("meta.headKicker")+'>'+esc(meta.headKicker||"Preliminary Agenda")+'</div></div>'+hlogo+'</div><div class="hrule"></div>';
}
function pcell(p,path,tagPath,tagVal,mv){
  if(!p)return"";
  return '<div class="pcell">'+(mv||"")+'<img src="'+pic(p.img)+'"'+dp(path+".img","photo")+'><div style="min-width:0">'+
    (tagPath?'<div class="mtag"'+de(tagPath)+'>'+esc(tagVal||"")+'</div>':"")+
    '<div class="nm"'+de(path+".name")+'>'+esc(p.name)+'</div>'+
    '<div class="tt"'+de(path+".title")+'>'+esc(p.title)+'</div>'+
    '<div class="fm"'+de(path+".firm")+'>'+esc(p.firm)+'</div></div></div>';
}
function sponHtml(s,b){
  var i=b.split(".")[1];
  var hasArr=Array.isArray(s.sponsors);
  /* back-compat: docs without the sponsors array render their legacy single
     sponsor exactly as before */
  var list=hasArr?s.sponsors:((s.sponsorImg||s.sponsorName)?[{name:s.sponsorName,img:s.sponsorImg,h:s.sponsorH||30}]:[]);
  var addBtn=EDIT?'<span class="ghost gt" data-op="spadd" data-i="'+i+'" style="min-height:22px;padding:3px 9px;font-size:9px" title="Add a sponsor logo">+ sponsor</span>':"";
  if(!list.length)return EDIT?'<div class="rspon"><span class="sb">SPONSORED BY:</span><span class="snm" '+de(b+".sponsorName").slice(1)+' style="color:#c9bfc7">— add —</span>'+addBtn+'</div>':"";
  var parts=list.map(function(sp,j){
    var namePath=hasArr?b+".sponsors."+j+".name":b+".sponsorName";
    var imgPath=hasArr?b+".sponsors."+j+".img":b+".sponsorImg";
    var h=sp.h||30;
    var rm=(EDIT&&hasArr)?'<button class="spx" data-op="spdel" data-i="'+i+'" data-j="'+j+'" title="Remove this sponsor">✕</button>':"";
    return '<span class="spitem">'+(sp.img?'<img src="'+esc(sp.img)+'" style="height:'+h+'px"'+dp(imgPath,"logo")+'>':'<span class="snm"'+de(namePath)+'>'+esc(sp.name||"")+'</span>')+rm+'</span>';
  }).join('<span class="spdiv"></span>');
  return '<div class="rspon"><span class="sb">SPONSORED BY:</span>'+parts+addBtn+'</div>';
}
function rowbar(i){
  if(!EDIT)return"";
  return '<div class="rowbar"><button data-op="up" data-i="'+i+'" title="Move up">↑</button><button data-op="down" data-i="'+i+'" title="Move down">↓</button><button data-op="add" data-i="'+i+'" title="Add a session below">＋ Add below</button><button data-op="del" data-i="'+i+'" title="Delete" style="color:#a33;border-color:#dfb6b6">✕</button></div>';
}
function sessionHtml(s,i){
  var b="sessions."+i;
  var head='<div class="rhead"><span class="pill"'+de(b+".time")+'>'+esc(s.time)+'</span><span class="rtitle"'+de(b+".title")+'>'+esc(s.title)+'</span></div>';
  var metaBits="";
  if(s.note||EDIT)metaBits+='<span class="rnote"'+de(b+".note")+'>'+esc(s.note||(EDIT?"room / note":""))+'</span>';
  if(s.kind==="simple"||s.kind==="people")metaBits+=sponHtml(s,b);
  var meta=metaBits?'<div class="rmeta">'+metaBits+'</div>':"";
  var body="";
  if(s.kind==="simple"&&EDIT){
    body+='<div class="ghost gt" data-op="mkpanel" data-i="'+i+'" style="max-width:420px;margin-top:6px">+ Turn into a panel — add speakers &amp; a description</div>';
  }
  if(s.kind==="people"){
    if(s.desc||EDIT)body+='<div class="rdesc"'+de(b+".desc",1)+'>'+esc(s.desc)+'</div>';
    var cells="";
    if(s.lead)cells+=pcell(s.lead,b+".lead",b+".roleLabel",s.roleLabel||"MODERATOR");
    else if(EDIT)cells+='<div class="ghost" data-op="addlead" data-i="'+i+'">+ Moderator</div>';
    cells+=(s.people||[]).map(function(p,j){
      var mv="";
      if(EDIT&&s.people.length>1){
        mv='<span class="pmv">'+(j>0?'<button data-op="pleft" data-i="'+i+'" data-j="'+j+'" title="Move earlier">◂</button>':"")+(j<s.people.length-1?'<button data-op="pright" data-i="'+i+'" data-j="'+j+'" title="Move later">▸</button>':"")+'</span>';
      }
      return pcell(p,b+".people."+j,null,null,mv);
    }).join("");
    if(EDIT)cells+='<div class="ghost" data-op="addp" data-i="'+i+'">+ Add panelist</div>';
    if(cells)body+='<div class="prow">'+cells+'</div>';
  }else if(s.kind==="tables"){
    if(s.desc||EDIT)body+='<div class="rdesc"'+de(b+".desc",1)+'>'+esc(s.desc||"")+'</div>';
    var half=Math.ceil(s.tables.length/2),c1="",c2="";
    s.tables.forEach(function(t,j){
      var h='<div class="tbl"><div class="tp"><b>Table '+(j+1)+':</b> <i'+de(b+".tables."+j+".topic")+'>'+esc(t.topic)+'</i></div><div class="hb">Hosted By: <span'+de(b+".tables."+j+".host")+'>'+esc(t.host||"")+'</span></div></div>';
      if(j<half)c1+=h;else c2+=h;
    });
    if(EDIT)c2+='<div class="ghost gt" data-op="addtable" data-i="'+i+'">+ Add table</div>';
    body='<div class="tbl-wrap"><div class="tbl-col">'+c1+'</div><div class="tbl-col">'+c2+'</div></div>';
  }else if(s.kind==="reception"){
    var colHtml=(s.cols||[]).map(function(c,j){
      if(/thank/i.test(c.h||""))return "";
      return '<div><h4'+de(b+".cols."+j+".h")+'>'+esc(c.h)+'</h4><p'+de(b+".cols."+j+".body",1)+'>'+esc(c.body).replace(/\n/g,"<br>")+'</p></div>';
    }).join("");
    var photo=s.img?'<div class="rec2-photo"><img src="'+esc(s.img)+'"'+dp(b+".img","bg")+'></div>'
      :(EDIT?'<div class="rec2-photo ghost" data-op="recimg" data-i="'+i+'">+ Venue photo</div>':"");
    body='<div class="rec2"><div class="rec2-cols">'+colHtml+'</div>'+photo+'</div>';
  }
  var html='<div class="row" data-sess="'+i+'">'+rowbar(i)+head+body+meta+'</div>';
  if(s.kind==="reception"){
    var tcol=(s.cols||[]).filter(function(c){return /thank/i.test(c.h||"");})[0];
    var noteTxt=s.thanks||(tcol?tcol.body:"");
    if(noteTxt||EDIT)html+='<div class="thanksnote"><div class="tn-label">A Note of Thanks</div><div class="tn-body"'+de(b+".thanks",1)+'>'+esc(noteTxt)+'</div></div>';
  }
  return html;
}

function lockupHtml(m){
  /* Back-compat: documents published before lockImg existed must render
     exactly as before (the PCS lockup image). Only an explicit empty value
     opts in to the text-built lockup. */
  var li=(m.lockImg===undefined||m.lockImg===null)?LOCK:m.lockImg;
  if(li)return '<img class="cov-lock" src="'+esc(li)+'"'+dp("meta.lockImg","logo")+'>';
  /* lockCity (optional) overrides the lockup's left part and may contain manual line breaks; absent → city, one line, as always */
  var cityLines=String(m.lockCity||m.city||"").toUpperCase().split(/\n/).map(function(l){return "<div>"+esc(l)+"</div>";}).join("");
  var words=String(m.event||"").toUpperCase().split(/\s+/).filter(Boolean);
  while(words.length>4){var bi=0,bl=1e9;for(var i=0;i<words.length-1;i++){var l=words[i].length+words[i+1].length;if(l<bl){bl=l;bi=i;}}words.splice(bi,2,words[bi]+" "+words[bi+1]);}
  var lines=words.map(function(w){return "<div>"+esc(w)+"</div>";}).join("");
  return '<div class="cov-lockt"'+(EDIT?' data-op="lockimg" title="Click to use a logo image instead"':"")+'><div class="c1">'+cityLines+'</div><div class="vb"></div><div class="c2">'+lines+'</div></div>';
}
function coverSlide(d){
  var m=d.meta;
  /* landscape covers display every logo larger (stored sizes unchanged, so
     flipping orientation back changes nothing) */
  var CZ=LAND?1.35:1;
  var rail=(m.coverPartners||[]).map(function(p,i){
    var base="meta.coverPartners."+i;
    return '<div class="cp"><div class="lbl"'+de(base+".label")+'>'+esc(p.label)+'</div><div class="slot">'+
      (p.img?'<img src="'+esc(p.img)+'" style="height:'+Math.round((p.h||56)*CZ)+'px"'+dp(base+".img","logo")+'>':'<div class="txt"'+de(base+".name")+'>'+esc(p.name)+'</div>')+'</div></div>';
  }).join("");
  /* Back-compat: hostImg absent → the classic CapLink mark, no label.
     JV events set hostImg (+ hostLabel) for "Hosted by  CAPLINK × PE150". */
  var host;
  if(m.hostImg){
    var hl=(m.hostLabel===undefined||m.hostLabel===null)?"Hosted by":m.hostLabel;
    host='<div class="cov-host"><div class="lbl"'+de("meta.hostLabel")+'>'+esc(hl)+'</div><img src="'+esc(m.hostImg)+'" style="height:'+Math.round((m.hostH||34)*CZ)+'px"'+dp("meta.hostImg","logo")+'></div>';
  }else if(m.hostImg===""){
    /* explicit "" → unbranded cover (no mark at all); EDIT keeps a slot */
    host=EDIT?'<div class="cov-host"><div class="ghost gt" data-op="logoslot" data-path="meta.hostImg" data-mode="logo" style="padding:6px 14px;background:rgba(255,255,255,.85)">+ host logo</div></div>':"";
  }else{
    host='<img class="cov-cap" src="'+CAPW+'"'+(EDIT?dp("meta.hostImg","logo")+' title="Click to switch to a hosted-by / JV lockup"':"")+'>';
  }
  return slide("dark cov",'<img class="bg" src="'+esc(bgSrc(m))+'"><div class="tint"></div><div class="cov-glow"></div>'+
    host+
    lockupHtml(m)+
    '<div class="cov-date"><span'+de("meta.dateLine")+' style="font-weight:700">'+esc(m.dateLine)+'</span>  <span>|</span>  <span'+de("meta.locLine")+'>'+esc(m.locLine)+'</span></div>'+
    '<div class="cov-rail">'+rail+'</div>'+
    (m.preliminary||EDIT?'<div class="cov-note"'+de("meta.preliminary")+'>'+esc(m.preliminary)+'</div>':""));
}
function welcomeSlide(d,n){
  var m=d.meta,w=m.welcome||{};
  var sig1='<div class="wel-sig">'+
    (w.signImg?'<img class="sig" src="'+esc(w.signImg)+'"'+dp("meta.welcome.signImg","logo")+'>':(EDIT?'<div class="ghost gt" data-op="signimg" style="width:210px;margin-bottom:9px">+ Signature image</div>':""))+
    '<div class="nm"><b'+de("meta.welcome.signName")+'>'+esc(w.signName)+'</b>, <span'+de("meta.welcome.signTitle")+'>'+esc(w.signTitle)+'</span></div><div class="org"'+de("meta.welcome.signOrg")+'>'+esc(w.signOrg)+'</div></div>';
  /* signature block hides entirely in the published view when every field
     is blank (unbranded letters, e.g. pending MTA) — the builder still
     shows the editable placeholders so it can be re-added later */
  var sigs=(!EDIT&&!(w.signName||w.signTitle||w.signOrg||w.signImg))?"":sig1;
  /* Back-compat: optional second signatory (co-hosted events). Absent → exactly the classic single signature. */
  if(w.sign2){
    var s2=w.sign2,b2="meta.welcome.sign2";
    sigs='<div class="wel-sigrow">'+sig1+'<div class="wel-sig">'+
      (s2.img?'<img class="sig" src="'+esc(s2.img)+'"'+dp(b2+".img","logo")+'>':(EDIT?'<div class="ghost gt" data-op="sign2img" style="width:210px;margin-bottom:9px">+ Signature image</div>':""))+
      '<div class="nm"><b'+de(b2+".name")+'>'+esc(s2.name)+'</b>, <span'+de(b2+".title")+'>'+esc(s2.title)+'</span></div><div class="org"'+de(b2+".org")+'>'+esc(s2.org)+'</div></div></div>';
  }
  /* optional at-a-glance tiles (meta.welcome.facts) — absent → the classic
     letter page, unchanged. margin-top:auto pins them to the page bottom. */
  var facts=w.facts||[],fhtml="";
  /* optional slim photo band above the tiles — absent → nothing (classic page) */
  var bhtml="";
  if(w.bandImg)bhtml='<div class="wel-photo"><img src="'+esc(w.bandImg)+'"'+dp("meta.welcome.bandImg","bg")+'></div>';
  else if(EDIT)bhtml='<div class="wel-photo ghost" data-op="logoslot" data-path="meta.welcome.bandImg" data-mode="bg" style="height:auto;min-height:56px;margin-top:26px">+ Photo band (slim image strip under the letter)</div>';
  if(facts.length){
    var tiles=facts.map(function(ft,i){
      var b="meta.welcome.facts."+i;
      var rm=EDIT?'<button class="spx" data-op="wfdel" data-i="'+i+'" title="Remove this tile">✕</button>':"";
      return '<div class="wf">'+rm+'<div class="k"'+de(b+".k")+'>'+esc(ft.k)+'</div><div class="v"'+de(b+".v",1)+'>'+esc(ft.v)+'</div></div>';
    }).join("");
    if(EDIT&&facts.length<5)tiles+='<div class="wf ghost" data-op="wfadd" style="min-height:48px;border-top:none">+ tile</div>';
    fhtml='<div class="wel-facts">'+tiles+'</div>';
  }else if(EDIT){
    fhtml='<div class="ghost gt" data-op="wfadd" style="margin-top:26px;max-width:440px">+ Add an “at a glance” strip (date · venue · format) to fill this page</div>';
  }
  return slide("",header(m)+
    '<div class="wel-band"'+de("meta.bandLine")+'>'+esc(m.bandLine)+'</div>'+
    '<div class="wel-body'+((facts.length||w.bandImg)?' hasfacts':'')+'"><div class="wel-paras">'+(w.paras||[]).map(function(p,i){return '<p'+de("meta.welcome.paras."+i,1)+'>'+esc(p)+"</p>";}).join("")+'</div>'+
    sigs+bhtml+fhtml+'</div>'+foot(m,n));
}
/* optional "about our partners" page: meta.about={title,on,items:[{img,head,sub,body}]}.
   Absent → nothing renders (documents that predate it never change);
   on:false hides it without losing the content. */
function aboutSlide(d,n){
  var m=d.meta,a=m.about||{},items=a.items||[];
  var cards=items.map(function(it,i){
    var b="meta.about.items."+i;
    var del=EDIT?'<button class="spx" data-op="abdel" data-i="'+i+'" style="position:absolute;top:-10px;right:-6px;z-index:5" title="Remove this column">✕</button>':"";
    /* optional logo sitting right on top of the photo */
    var plogo=it.logo?'<div class="ab-plogo"><img src="'+esc(it.logo)+'" style="max-height:'+(+it.logoH||56)+'px"'+dp(b+".logo","logo")+'></div>'
      :(EDIT&&it.img?'<div class="ghost gt" data-op="logoslot" data-path="'+b+'.logo" data-mode="logo" style="position:absolute;top:10px;right:10px;min-height:22px;padding:3px 9px;font-size:9px;z-index:4">+ logo on photo</div>':"");
    var ph=it.img?'<div class="ab-photo"><img src="'+esc(it.img)+'"'+dp(b+".img","bg")+'>'+plogo+'</div>'
      :(EDIT?'<div class="ab-photo ghost" data-op="logoslot" data-path="'+b+'.img" data-mode="bg">+ photo</div>':'<div class="ab-photo"></div>');
    return '<div class="ab-card">'+del+ph+'<div class="ab-head"'+de(b+".head")+'>'+esc(it.head)+'</div>'+
      ((it.sub||EDIT)?'<div class="ab-sub"'+de(b+".sub")+'>'+esc(it.sub||"")+'</div>':"")+
      '<div class="ab-body"'+de(b+".body",1)+'>'+esc(it.body)+'</div></div>';
  }).join("");
  if(EDIT&&items.length<3)cards+='<div class="ab-card ghost" data-op="abadd" style="flex:0 0 110px" title="Add another partner column">+ column</div>';
  return slide("",header(m)+'<div class="spk-badge"'+de("meta.about.title")+'>'+esc(a.title||"Our Partners")+'</div><div class="ab-grid">'+cards+'</div>'+foot(m,n));
}
function speakerList(d){
  /* Back-compat: a curated d.speakersList (e.g. "Past Speakers" pages)
     replaces the session-derived list. Absent → derived, as always. */
  if(d.speakersList&&d.speakersList.length)return d.speakersList;
  var seen={},list=[];
  (d.sessions||[]).forEach(function(s){
    var all=[];if(s.lead)all.push(s.lead);if(s.people)all=all.concat(s.people);
    all.forEach(function(p){if(p&&p.name&&!/TB[AC]/i.test(p.name)&&!/announced/i.test(p.name)&&!seen[p.name]){seen[p.name]=1;list.push(p);}});
  });
  return list;
}
function curatedSpk(d){return !!(d.speakersList&&d.speakersList.length);}
function speakerEntries(d){
  /* compact one-line entries: Name, Title, Firm — wraps within the entry.
     Curated lists (d.speakersList) are editable in place; session-derived
     entries are edited on their session pages and update here. */
  var cur=curatedSpk(d);
  return speakerList(d).map(function(p,i){
    var b="speakersList."+i;
    var bits="<b"+(cur?de(b+".name"):"")+">"+esc(p.name)+"</b>";
    if(p.title||(EDIT&&cur))bits+=", <i"+(cur?de(b+".title"):"")+">"+esc(p.title||"")+"</i>";
    if(p.firm||(EDIT&&cur))bits+=', <span class="f"'+(cur?de(b+".firm"):"")+'>'+esc(p.firm||"")+"</span>";
    if(EDIT&&cur)bits+=' <button class="spx" data-op="spkdel" data-i="'+i+'" title="Remove from this page">✕</button>';
    return '<div class="spke1">'+bits+"</div>";
  });
}
function speakerCells(d){
  /* photo-grid cells: headshot + name / title / firm */
  var cur=curatedSpk(d);
  return speakerList(d).map(function(p,i){
    var b="speakersList."+i;
    return '<div class="spk-cell">'+(EDIT&&cur?'<button class="spx" data-op="spkdel" data-i="'+i+'" title="Remove from this page">✕</button>':"")+
      '<img src="'+pic(p.img)+'"'+(cur?dp(b+".img","photo"):"")+'><div style="min-width:0">'+
      '<div class="nm"'+(cur?de(b+".name"):"")+'>'+esc(p.name)+'</div>'+
      ((p.title||(EDIT&&cur))?'<div class="tt"'+(cur?de(b+".title"):"")+'>'+esc(p.title||"")+'</div>':"")+
      ((p.firm||(EDIT&&cur))?'<div class="fm"'+(cur?de(b+".firm"):"")+'>'+esc(p.firm||"")+'</div>':"")+
      '</div></div>';
  });
}
function sponsorSlides(d,startN){
  var out=[],sp=d.sponsors||[],per=LAND?6:4;
  for(var i=0;i<sp.length;i+=per){
    var cols=sp.slice(i,i+per).map(function(s,k){
      var b="sponsors."+(i+k);
      return '<div class="sp-col"><div class="sp-rib"'+de(b+".tier")+'>'+esc(s.tier)+'</div><div class="sp-logo">'+(s.img?'<img src="'+esc(s.img)+'" style="max-height:'+(s.h||86)+'px"'+dp(b+".img","logo")+'>':'<div class="snm"'+de(b+".name")+'>'+esc(s.name)+'</div>')+'</div><div class="sp-desc"'+de(b+".desc",1)+'>'+esc(s.desc)+'</div></div>';
    }).join("");
    out.push(slide("",header(d.meta)+'<div class="sp-grid">'+cols+'</div>'+foot(d.meta,startN+out.length)));
  }
  return out;
}
function closingSlide(m){
  /* Closing page: editorial contact spread — big headline + airy two-column
     directory on cream, with a full-height skyline photo rail on the right
     carrying the stacked CapLink logo and website. */
  var h1=(m.closingHead1===undefined||m.closingHead1===null)?"For further information,":m.closingHead1;
  var h2=(m.closingHead2===undefined||m.closingHead2===null)?"please contact:":m.closingHead2;
  /* rail logo: meta.closingLogo overrides; explicit "" → NO logo (unbranded);
     absent → JV lockup if set, else the stacked CapLink mark, as always.
     Same explicit-"" rule for the website line. */
  var cl=(m.closingLogo===undefined||m.closingLogo===null)?(m.hostImg||CAPSTACK):m.closingLogo;
  var clHtml=cl?'<img class="cl2-logo" src="'+esc(cl)+'"'+dp("meta.closingLogo","logo")+'>'
    :(EDIT?'<div class="cl2-logo ghost" data-op="logoslot" data-path="meta.closingLogo" data-mode="logo" style="min-height:52px;background:rgba(255,255,255,.85)">+ logo</div>':"");
  var web=(m.website===undefined||m.website===null)?"www.caplink-group.com":m.website;
  var inner='<div class="cl2-rail"><img class="bg" src="'+esc(bgSrc(m))+'"'+dp("meta.bgImg","bg")+'><div class="cl2-tint"></div>'+
    clHtml+
    ((web||EDIT)?'<div class="cl2-web"'+de("meta.website")+'>'+esc(web)+'</div>':"")+'</div>'+
    '<div class="cl2-bar"></div><div class="cl2-head"><div class="h1"'+de("meta.closingHead1")+'>'+esc(h1)+'</div><div class="h2"'+de("meta.closingHead2")+'>'+esc(h2)+'</div></div>';
  if(m.contacts&&m.contacts.length){
    inner+='<div class="cl2-grid">'+m.contacts.map(function(c,i){
      var b="meta.contacts."+i,ph="";
      /* one line per number — T and M never share a line */
      if(c.t||EDIT)ph+='<div class="ln"><span class="lk">T</span> <span'+de(b+".t")+'>'+esc(c.t)+'</span></div>';
      if(c.m||EDIT)ph+='<div class="ln"><span class="lk">M</span> <span'+de(b+".m")+'>'+esc(c.m)+'</span></div>';
      return '<div class="cl2-p"><div class="nm"'+de(b+".name")+'>'+esc(c.name)+'</div><div class="rl"'+de(b+".role")+'>'+esc(c.role)+'</div><div class="ln em"'+de(b+".email")+'>'+esc(c.email)+'</div>'+ph+'</div>';
    }).join("")+'</div>';
  }
  return slide("",inner);
}
function contactSlide(d,n){
  var m=d.meta;if(!m.contacts||!m.contacts.length)return null;
  var cells=m.contacts.map(function(c,i){
    var b="meta.contacts."+i;
    var lines='<div class="ct-lines"><div class="ln"><span'+de(b+".email")+'>'+esc(c.email)+'</span></div>'+
      (c.t||EDIT?'<div class="ln"><span class="lk">T</span><span'+de(b+".t")+'>'+esc(c.t)+'</span></div>':"")+
      (c.m||EDIT?'<div class="ln"><span class="lk">M</span><span'+de(b+".m")+'>'+esc(c.m)+'</span></div>':"")+'</div>';
    return '<div class="ct ct-row"><div><div class="nm"'+de(b+".name")+'>'+esc(c.name)+'</div><div class="rl2"'+de(b+".role")+'>'+esc(c.role)+'</div></div>'+lines+'</div>';
  }).join("");
  return slide("dark",'<img class="bg" src="'+esc(bgSrc(m))+'"><div class="tint"></div><div class="ct-tint"></div><div class="ct-cap">Get In Touch</div><div class="ct-title">CONTACT US</div><div class="ct-sub"'+de("meta.contactsSub",1)+'>'+esc(m.contactsSub||"")+'</div><div class="ct-line"></div><div class="ct-list">'+cells+'</div>');
}
function bgSrc(m){return (m&&m.bgImg&&String(m.bgImg).trim())?m.bgImg:SKY;}
/* back cover: just the sky photo and the centred lockup — nothing else.
   meta.backImg (optional) sets the back-cover logo independently of the
   rest of the document; absent → the JV lockup if set, else the stacked
   CapLink mark. Click it in the builder to swap. */
function backSlide(m){
  /* explicit backImg:"" → photo-only back cover, no logo (unbranded);
     absent → the JV lockup if set, else the stacked CapLink mark */
  var src=(m.backImg===undefined||m.backImg===null)?(m.hostImg||CAPSTACK):m.backImg;
  var lg=src?'<img class="back-logo" src="'+esc(src)+'"'+dp("meta.backImg","logo")+(m.backW?' style="width:'+(+m.backW||330)+'px"':"")+'>'
    :(EDIT?'<div class="back-logo ghost" data-op="logoslot" data-path="meta.backImg" data-mode="logo" style="min-height:64px;background:rgba(255,255,255,.85)">+ logo</div>':"");
  return slide("dark bck",'<img class="bg" src="'+esc(bgSrc(m))+'"><div class="tint"></div><div class="back-glow"></div>'+lg);
}

/* --- measurement helpers: run inside a live offscreen slide --- */
function measureBlocks(root,htmlList,wrapClass,width){
  var meas=document.createElement("div");
  meas.className=root.className.replace("agdk-edit","");
  meas.style.cssText="position:absolute;left:-99999px;top:0;visibility:hidden";
  meas.innerHTML='<div class="sl" style="height:auto"><div class="'+wrapClass+'" id="_m"></div></div>';
  document.body.appendChild(meas);
  var box=meas.querySelector("#_m");
  /* neutralise any absolute positioning/clamps from the display CSS so we
     measure natural content height at the real column width */
  box.style.cssText="position:static;top:auto;bottom:auto;left:auto;right:auto;height:auto;max-height:none;overflow:visible;width:"+width+"px";
  var hs=htmlList.map(function(h){box.innerHTML=h;return box.scrollHeight;});
  document.body.removeChild(meas);
  return hs;
}
function paginateSessions(root,d,startN){
  var PAGE_H=LAND?874:1168;   /* page height - 44 top - 60 footer zone - 22 safety */
  var notesOn=d.meta.notesFill!==false;
  /* when Notes lines are on, reserve space for them on EVERY page so all
     pages end identically: sessions, then ruled lines down to the footer */
  var CAP=notesOn?PAGE_H-120:PAGE_H;
  var htmls=(d.sessions||[]).map(function(s,i){return sessionHtml(s,i);});
  var hs=measureBlocks(root,htmls,"rows",LAND?1535:888).map(function(h){return h+12;});
  var n=hs.length;
  /* Balanced page breaks (what a book typesetter does): instead of greedily
     stuffing each page and orphaning the leftovers, choose break points that
     minimise squared slack across ALL pages, so consecutive pages look
     evenly full. DP over break positions; last page weighted lighter. */
  var best=[0],brk=[ -1 ];
  for(var i=1;i<=n;i++){
    best[i]=Infinity;brk[i]=-1;
    var sum=0;
    for(var j=i;j>=1;j--){
      sum+=hs[j-1];
      if(sum>CAP&&j<i)break;
      if(sum>CAP&&j===i){ // single block taller than a page: give it its own
        if(best[j-1]<best[i]){best[i]=best[j-1];brk[i]=j-1;}
        break;
      }
      var slack=(CAP-sum)/CAP,w=(i===n?0.55:1);
      var c=best[j-1]+w*slack*slack;
      if(c<best[i]){best[i]=c;brk[i]=j-1;}
    }
    if(brk[i]<0){best[i]=best[i-1];brk[i]=i-1;}
  }
  var cuts=[],k=n;
  while(k>0){cuts.unshift([brk[k],k]);k=brk[k];}
  return cuts.map(function(cut,pi){
    var pg=htmls.slice(cut[0],cut[1]);
    var tot=0;for(var q=cut[0];q<cut[1];q++)tot+=hs[q];
    var hasRec=d.sessions.slice(cut[0],cut[1]).some(function(x){return x.kind==="reception";});
    /* session spacing is FIXED (the .row margin) on every page; every page
       ends with the reserved Notes lines — except reception pages, where the
       thank-you note card stretches to absorb the remaining space instead */
    var notes=(notesOn&&!hasRec&&(PAGE_H-tot)>=54)?'<div class="notesblk"><div class="nlab">Notes</div><div class="nlines"></div></div>':"";
    return slide("",'<div class="rows'+(hasRec?' recpg':'')+'">'+pg.join("")+notes+'</div>'+foot(d.meta,startN+pi));
  });
}
function spkHead(m){
  /* Back-compat: no speakersTitle → the classic badge text */
  var t=(m.speakersTitle===undefined||m.speakersTitle===null)?"Confirmed Speakers Include":m.speakersTitle;
  var h='<div class="spk-badge"'+de("meta.speakersTitle")+'>'+esc(t)+'</div>';
  if(m.speakersSub)h+='<div class="spk-sub"'+de("meta.speakersSub")+'>'+esc(m.speakersSub)+'</div>';
  return h;
}
function speakersGridSlides(root,d,startN){
  var cells=speakerCells(d);
  if(!cells.length)return[];
  if(EDIT&&curatedSpk(d))cells.push('<div class="ghost" data-op="spkadd" style="min-height:56px">+ Add person</div>');
  var subOn=!!d.meta.speakersSub;
  var per=LAND?4:3,MW=LAND?1519:872;
  var PAGE=LAND?(subOn?690:722):(subOn?972:1004);
  var rows=[];
  for(var i=0;i<cells.length;i+=per)rows.push('<div class="spk-row">'+cells.slice(i,i+per).join("")+'</div>');
  var hs=measureBlocks(root,rows,"spk-gridwrap",MW);
  var total=0,q;for(q=0;q<hs.length;q++)total+=hs[q]+20;
  /* Scale to FILL the page — up as well as down — so a short list never
     leaves a sea of white space. Zoom changes the effective layout width,
     so re-measure at the zoomed width before committing to a scale-up. */
  /* landscape caps the fill-the-page zoom-UP hard — it was inflating the
     carefully-sized small type ("firms WAYYYY too big") */
  var MAXS=LAND?1.12:1.45;
  var scale=Math.max(0.6,Math.min(MAXS,PAGE/total*0.98));
  if(scale>1.001){
    hs=measureBlocks(root,rows,"spk-gridwrap",Math.round(MW/scale));
    total=0;for(q=0;q<hs.length;q++)total+=hs[q]+20;
    scale=Math.min(scale,Math.max(0.6,PAGE/total*0.98));
  }
  return [slide("",header(d.meta)+spkHead(d.meta)+'<div class="spk-gridwrap" style="zoom:'+scale.toFixed(3)+(subOn?';top:238px':'')+'">'+rows.join("")+'</div>'+foot(d.meta,startN))];
}
function speakersSlides(root,d,startN){
  if(d.meta.showSpeakers===false)return[];
  if(d.meta.speakersStyle==="grid")return speakersGridSlides(root,d,startN);
  var entries=speakerEntries(d);
  if(!entries.length)return[];
  if(EDIT&&curatedSpk(d))entries.push('<div class="ghost gt" data-op="spkadd">+ Add person</div>');
  var subOn=!!d.meta.speakersSub;
  var COL_H=LAND?(subOn?674:706):(subOn?970:1000),GAP=10;
  var W2=LAND?739:416,W3=LAND?489:272;
  function tot(hs){var t=0;for(var q=0;q<hs.length;q++)t+=hs[q]+GAP;return t;}
  /* ALWAYS one page: 2 columns, then 3 (measured at true column width),
     then scale down until it fits */
  var cols=2,hs=measureBlocks(root,entries,"spk-col",W2),total=tot(hs),scale=1;
  if(total>2*COL_H){
    cols=3;hs=measureBlocks(root,entries,"spk-col",W3);total=tot(hs);
    if(total>3*COL_H)scale=Math.max(0.6,(3*COL_H)/total*0.96);
  }
  var budget=total/cols+30,colArr=[],curCol=[],curH=0;
  entries.forEach(function(h,idx){
    var hh=hs[idx]+GAP;
    if(curH+hh>budget&&curCol.length&&colArr.length<cols-1){colArr.push(curCol);curCol=[];curH=0;}
    curCol.push(h);curH+=hh;
  });
  if(curCol.length)colArr.push(curCol);
  var inner='<div class="spk-wrap" style="zoom:'+scale.toFixed(3)+';gap:'+(cols===3?26:40)+'px'+(subOn?';top:238px':'')+'">'+colArr.map(function(c){return '<div class="spk-col">'+c.join("")+'</div>';}).join("")+'</div>';
  return [slide("",header(d.meta)+spkHead(d.meta)+inner+foot(d.meta,startN))];
}

function buildDeck(root,data,opts){
  var d=data||{},m=d.meta||{},t=THEMES[d.theme]||THEMES.dubai;
  EDIT=!!(opts&&opts.edit);
  /* orientation is per DOCUMENT (meta.orient) — absent → portrait, so
     existing documents never change (rule #1) */
  LAND=(m.orient==="landscape");
  window.AgendaRender.CUR={W:LAND?LW:W,H:LAND?LH:H,land:LAND};
  if(!document.getElementById("agdk-css")){
    var st=document.createElement("style");st.id="agdk-css";st.textContent=CSS;document.head.appendChild(st);
  }
  root.classList.add("agdk");
  root.classList.toggle("agdk-land",LAND);
  root.classList.toggle("agdk-edit",EDIT);
  root.style.setProperty("--pill",t.pill);root.style.setProperty("--ribbon",t.ribbon);root.style.setProperty("--accent",t.accent);
  var slides=[coverSlide(d)],n=2;
  if(m.welcome&&(m.welcome.paras||[]).length){slides.push(welcomeSlide(d,n));n++;}
  if(m.about&&m.about.on!==false&&(m.about.items||[]).length){slides.push(aboutSlide(d,n));n++;}
  var spk=speakersSlides(root,d,n);slides=slides.concat(spk);n+=spk.length;
  var ses=paginateSessions(root,d,n);slides=slides.concat(ses);n+=ses.length;
  var spo=sponsorSlides(d,n);slides=slides.concat(spo);n+=spo.length;
  /* explicit showClosing:false hides the contact/closing page; absent → shown, as always */
  if(m.showClosing!==false)slides.push(closingSlide(m));
  if(m.backCover)slides.push(backSlide(m));
  root.innerHTML=slides.join("");
  return root.querySelectorAll(".sl").length;
}

window.AgendaRender={buildDeck:buildDeck,THEMES:THEMES,SIL:SIL,W:W,H:H,CUR:{W:W,H:H,land:false},V:77};
})();
