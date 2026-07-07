/* CapLink Studio — shared agenda deck renderer (portrait).
   Used by /agenda/ (public viewer) and /agenda-generator/ (editor preview).
   AgendaRender.buildDeck(rootEl, data, opts) -> number of pages.
   opts.edit=true adds click-to-edit attributes + per-section toolbars.     */
(function(){
"use strict";

var W=1000,H=1294;                       /* portrait, US Letter (8.5x11) ratio */
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
".agdk .cov-lockt{position:absolute;top:396px;left:64px;right:64px;display:flex;align-items:center;justify-content:center;gap:30px;color:#fff}"+
".agdk .cov-lockt .c1{font-size:46px;font-weight:600;letter-spacing:.05em;white-space:nowrap;text-align:right;line-height:1.18}"+
".agdk .cov-lockt .vb{width:3px;align-self:stretch;background:rgba(255,255,255,.92)}"+
".agdk .cov-lockt .c2{display:flex;flex-direction:column;font-size:41px;font-weight:700;line-height:1.16;letter-spacing:.03em;text-align:left}"+
".agdk-edit .cov-lockt{cursor:pointer}"+
".agdk .cov-date{position:absolute;top:696px;left:0;right:0;text-align:center;font-size:19px;font-weight:700;letter-spacing:.26em}"+
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
".agdk .spk-cell img{width:56px;height:56px;object-fit:cover;border-radius:0;flex:0 0 auto}"+
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
".agdk .pcell img{width:68px;height:68px;object-fit:cover;border-radius:0;flex:0 0 auto}"+
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
".agdk-edit .pmv button:hover{background:#f7eef4}";

function slide(cls,inner){return '<div class="sl '+(cls||"")+'">'+inner+"</div>";}
function foot(meta,n){return '<div class="foot"><span'+de("meta.footerLeft")+'>'+esc(meta.footerLeft)+'</span><span>PAGE '+n+'</span></div>';}
function header(meta){
  /* All-caps city names get the classic Title-case treatment; mixed-case names (e.g. "AI / Data & Insight") are respected as written */
  var city=meta.city?(/[a-z]/.test(meta.city)?meta.city:meta.city.charAt(0)+meta.city.slice(1).toLowerCase()):"";
  return '<div class="hd"><div><div class="t1"><span'+de("meta.city")+' style="font-weight:700">'+esc(city)+'</span> <span'+de("meta.event")+' style="font-weight:700">'+esc(meta.event)+'</span> <span'+de("meta.year")+'>'+esc(meta.year)+'</span></div><div class="t2"'+de("meta.headKicker")+'>'+esc(meta.headKicker||"Preliminary Agenda")+'</div></div><img src="'+esc(meta.headImg||CAP)+'"'+(meta.headH?' style="height:'+(+meta.headH||36)+'px"':"")+dp("meta.headImg","logo")+' alt=""></div><div class="hrule"></div>';
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
  var rail=(m.coverPartners||[]).map(function(p,i){
    var base="meta.coverPartners."+i;
    return '<div class="cp"><div class="lbl"'+de(base+".label")+'>'+esc(p.label)+'</div><div class="slot">'+
      (p.img?'<img src="'+esc(p.img)+'" style="height:'+(p.h||56)+'px"'+dp(base+".img","logo")+'>':'<div class="txt"'+de(base+".name")+'>'+esc(p.name)+'</div>')+'</div></div>';
  }).join("");
  /* Back-compat: hostImg absent → the classic CapLink mark, no label.
     JV events set hostImg (+ hostLabel) for "Hosted by  CAPLINK × PE150". */
  var host;
  if(m.hostImg){
    var hl=(m.hostLabel===undefined||m.hostLabel===null)?"Hosted by":m.hostLabel;
    host='<div class="cov-host"><div class="lbl"'+de("meta.hostLabel")+'>'+esc(hl)+'</div><img src="'+esc(m.hostImg)+'" style="height:'+(m.hostH||34)+'px"'+dp("meta.hostImg","logo")+'></div>';
  }else{
    host='<img class="cov-cap" src="'+CAPW+'"'+(EDIT?dp("meta.hostImg","logo")+' title="Click to switch to a hosted-by / JV lockup"':"")+'>';
  }
  return slide("dark",'<img class="bg" src="'+esc(bgSrc(m))+'"><div class="tint"></div>'+
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
  var sigs=sig1;
  /* Back-compat: optional second signatory (co-hosted events). Absent → exactly the classic single signature. */
  if(w.sign2){
    var s2=w.sign2,b2="meta.welcome.sign2";
    sigs='<div class="wel-sigrow">'+sig1+'<div class="wel-sig">'+
      (s2.img?'<img class="sig" src="'+esc(s2.img)+'"'+dp(b2+".img","logo")+'>':(EDIT?'<div class="ghost gt" data-op="sign2img" style="width:210px;margin-bottom:9px">+ Signature image</div>':""))+
      '<div class="nm"><b'+de(b2+".name")+'>'+esc(s2.name)+'</b>, <span'+de(b2+".title")+'>'+esc(s2.title)+'</span></div><div class="org"'+de(b2+".org")+'>'+esc(s2.org)+'</div></div></div>';
  }
  return slide("",header(m)+
    '<div class="wel-band"'+de("meta.bandLine")+'>'+esc(m.bandLine)+'</div>'+
    '<div class="wel-body">'+(w.paras||[]).map(function(p,i){return '<p'+de("meta.welcome.paras."+i,1)+'>'+esc(p)+"</p>";}).join("")+
    sigs+'</div>'+foot(m,n));
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
      ((p.firm||(EDIT&&cur))?'<div class="fm"'+(cur?de(b+".firm"):"")+'>'+esc(p.firm||"")+'</div>':"")+'</div></div>';
  });
}
function sponsorSlides(d,startN){
  var out=[],sp=d.sponsors||[];
  for(var i=0;i<sp.length;i+=4){
    var cols=sp.slice(i,i+4).map(function(s,k){
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
  var inner='<div class="cl2-rail"><img class="bg" src="'+esc(bgSrc(m))+'"'+dp("meta.bgImg","bg")+'><div class="cl2-tint"></div>'+
    '<img class="cl2-logo" src="'+esc(m.hostImg||CAPSTACK)+'"'+(m.hostImg?dp("meta.hostImg","logo"):"")+'>'+
    '<div class="cl2-web"'+de("meta.website")+'>'+esc(m.website||"www.caplink-group.com")+'</div></div>'+
    '<div class="cl2-bar"></div><div class="cl2-head"><div class="h1"'+de("meta.closingHead1")+'>'+esc(h1)+'</div><div class="h2"'+de("meta.closingHead2")+'>'+esc(h2)+'</div></div>';
  if(m.contacts&&m.contacts.length){
    inner+='<div class="cl2-grid">'+m.contacts.map(function(c,i){
      var b="meta.contacts."+i,ph="";
      if(c.t||EDIT)ph+='<span class="lk">T</span> <span'+de(b+".t")+'>'+esc(c.t)+'</span>';
      if(c.m||EDIT)ph+=(ph?"&ensp;&ensp;":"")+'<span class="lk">M</span> <span'+de(b+".m")+'>'+esc(c.m)+'</span>';
      return '<div class="cl2-p"><div class="nm"'+de(b+".name")+'>'+esc(c.name)+'</div><div class="rl"'+de(b+".role")+'>'+esc(c.role)+'</div><div class="ln em"'+de(b+".email")+'>'+esc(c.email)+'</div>'+(ph?'<div class="ln">'+ph+'</div>':"")+'</div>';
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
function backSlide(m){return slide("dark",'<img class="bg" src="'+esc(bgSrc(m))+'"><div class="tint"></div><img class="back-logo" src="'+esc(m.hostImg||CAPSTACK)+'"'+(m.hostImg?dp("meta.hostImg","logo"):"")+'><div class="back-web"'+de("meta.website")+'>'+esc(m.website||"www.caplink-group.com")+'</div>');}

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
  var PAGE_H=1168;   /* 1294 - 44 top - 60 footer zone - 22 safety */
  var notesOn=d.meta.notesFill!==false;
  /* when Notes lines are on, reserve space for them on EVERY page so all
     pages end identically: sessions, then ruled lines down to the footer */
  var CAP=notesOn?PAGE_H-120:PAGE_H;
  var htmls=(d.sessions||[]).map(function(s,i){return sessionHtml(s,i);});
  var hs=measureBlocks(root,htmls,"rows",888).map(function(h){return h+12;});
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
  var rows=[];
  for(var i=0;i<cells.length;i+=3)rows.push('<div class="spk-row">'+cells.slice(i,i+3).join("")+'</div>');
  var hs=measureBlocks(root,rows,"spk-gridwrap",872),PAGE=subOn?972:1004;
  var total=0,q;for(q=0;q<hs.length;q++)total+=hs[q]+20;
  /* Scale to FILL the page — up as well as down — so a short list never
     leaves a sea of white space. Zoom changes the effective layout width,
     so re-measure at the zoomed width before committing to a scale-up. */
  var scale=Math.max(0.6,Math.min(1.45,PAGE/total*0.98));
  if(scale>1.001){
    hs=measureBlocks(root,rows,"spk-gridwrap",Math.round(872/scale));
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
  var COL_H=subOn?970:1000,GAP=10;
  function tot(hs){var t=0;for(var q=0;q<hs.length;q++)t+=hs[q]+GAP;return t;}
  /* ALWAYS one page: 2 columns, then 3 (measured at true column width),
     then scale down until it fits */
  var cols=2,hs=measureBlocks(root,entries,"spk-col",416),total=tot(hs),scale=1;
  if(total>2*COL_H){
    cols=3;hs=measureBlocks(root,entries,"spk-col",272);total=tot(hs);
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
  if(!document.getElementById("agdk-css")){
    var st=document.createElement("style");st.id="agdk-css";st.textContent=CSS;document.head.appendChild(st);
  }
  root.classList.add("agdk");
  root.classList.toggle("agdk-edit",EDIT);
  root.style.setProperty("--pill",t.pill);root.style.setProperty("--ribbon",t.ribbon);root.style.setProperty("--accent",t.accent);
  var slides=[coverSlide(d)],n=2;
  if(m.welcome&&(m.welcome.paras||[]).length){slides.push(welcomeSlide(d,n));n++;}
  var spk=speakersSlides(root,d,n);slides=slides.concat(spk);n+=spk.length;
  var ses=paginateSessions(root,d,n);slides=slides.concat(ses);n+=ses.length;
  var spo=sponsorSlides(d,n);slides=slides.concat(spo);n+=spo.length;
  slides.push(closingSlide(m));
  if(m.backCover)slides.push(backSlide(m));
  root.innerHTML=slides.join("");
  return root.querySelectorAll(".sl").length;
}

window.AgendaRender={buildDeck:buildDeck,THEMES:THEMES,SIL:SIL,W:W,H:H};
})();
