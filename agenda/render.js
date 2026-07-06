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
  london:{pill:"#0D1426",ribbon:"#0D1426",accent:"#8A7547"}
};
var SIL='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" fill="#d3d3d6"/><circle cx="44" cy="34" r="15" fill="#b6b6bb"/><path d="M14 88c3-20 16-28 30-28s27 8 30 28z" fill="#b6b6bb"/></svg>');
var SKY="../assets/sky.jpg", CAP="../assets/caplink-group.png", LOCK="../assets/pcs-lockup.png";
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
".agdk .dark .tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,14,.45),rgba(10,10,14,.25) 45%,rgba(10,10,14,.62))}"+
".agdk .cov-cap{position:absolute;top:64px;left:64px;height:42px}"+
".agdk .cov-lock{position:absolute;top:372px;left:50%;transform:translateX(-50%);width:560px}"+
".agdk .cov-date{position:absolute;top:696px;left:0;right:0;text-align:center;font-size:19px;font-weight:700;letter-spacing:.26em}"+
".agdk .cov-date span{font-weight:300;letter-spacing:.2em;opacity:.85}"+
".agdk .cov-rail{position:absolute;left:64px;right:64px;bottom:108px;display:flex;justify-content:center;gap:80px;text-align:center}"+
".agdk .cov-rail .cp{display:flex;flex-direction:column;align-items:center;gap:10px}"+
".agdk .cov-rail .lbl{font-size:9.5px;letter-spacing:.3em;font-weight:600;color:rgba(255,255,255,.85);text-transform:uppercase}"+
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
".agdk .wel-sig{margin-top:38px}"+
".agdk .wel-sig .nm{font-size:15.5px;color:#241020}.agdk .wel-sig .nm b{font-weight:700}"+
".agdk .wel-sig .org{font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--accent);margin-top:5px;text-transform:uppercase}"+
/* speakers */
".agdk .spk-badge{position:absolute;top:150px;left:64px;background:var(--pill);color:#fff;font-size:10px;font-weight:700;letter-spacing:.24em;padding:8px 20px;border-radius:16px;text-transform:uppercase}"+
".agdk .spk-wrap{position:absolute;top:206px;left:64px;right:64px;bottom:72px;display:flex;gap:40px}"+
".agdk .spk-col{flex:1;min-width:0}"+
".agdk .spk-col div{margin-bottom:8px;font-size:12px;line-height:1.5;color:#544e57}"+
".agdk .spk-col b{color:#241020;font-weight:700}.agdk .spk-col i{font-weight:400}.agdk .spk-col .f{font-weight:700;color:#241020}"+
/* agenda rows */
".agdk .rows{position:absolute;top:44px;left:56px;right:56px;bottom:60px;overflow:hidden;display:flex;flex-direction:column}"+
".agdk .rows.fill{justify-content:space-between}"+
".agdk .row{background:#f7f6f7;border-radius:7px;margin-bottom:12px;padding:0 24px;position:relative}"+
".agdk .rhead{display:flex;align-items:center;gap:18px;min-height:46px;padding:7px 0}"+
".agdk .pill{background:var(--pill);color:#fff;font-size:12px;font-weight:700;letter-spacing:.04em;border-radius:17px;padding:7px 15px;white-space:nowrap;font-variant-numeric:tabular-nums}"+
".agdk .rtitle{font-size:16px;font-weight:700;color:#241f26;flex:1;line-height:1.3}"+
".agdk .rnote{font-size:10.8px;color:#8d8791;font-style:italic;white-space:nowrap}"+
".agdk .rspon{display:flex;align-items:center;gap:10px;white-space:nowrap}"+
".agdk .rspon .sb{font-size:8px;letter-spacing:.24em;color:#9b95a0;font-weight:600}"+
".agdk .rspon img{max-width:150px;object-fit:contain}"+
".agdk .rspon .snm{font-size:13px;font-weight:700;color:#38323c}"+
".agdk .rl{font-size:8.5px;letter-spacing:.26em;color:#a09aa5;font-weight:600;margin-bottom:7px;text-transform:uppercase}"+
".agdk .rdesc{font-size:11px;line-height:1.55;color:#6e6873;padding:0 4px 10px}"+
".agdk .prow{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 16px;padding:2px 4px 16px}"+
".agdk .pcell{display:flex;gap:12px;align-items:flex-start;min-width:0}"+
".agdk .pcell img{width:64px;height:64px;object-fit:cover;border-radius:5px;flex:0 0 auto}"+
".agdk .pcell .mtag{font-size:8.5px;letter-spacing:.2em;color:var(--accent);font-weight:700;text-transform:uppercase;margin-bottom:3px}"+
".agdk .pcell .nm{font-size:12px;font-weight:700;color:#241f26;line-height:1.25}"+
".agdk .pcell .tt{font-size:10.4px;color:#7f7984;line-height:1.35;margin-top:2px}"+
".agdk .pcell .fm{font-size:10.6px;font-weight:700;color:#38323c;margin-top:2px;line-height:1.25}"+
/* roundtables */
".agdk .tbl-wrap{display:flex;gap:44px;padding:6px 4px 14px}"+
".agdk .tbl-col{flex:1}"+
".agdk .tbl{margin-bottom:11px;font-size:11px;line-height:1.45}"+
".agdk .tbl .tp{color:#38323c}.agdk .tbl .tp b{font-weight:700}.agdk .tbl .tp i{font-weight:400}"+
".agdk .tbl .hb{font-size:9.8px;font-weight:700;color:#241f26;margin-top:2px}"+
/* reception */
".agdk .rec{display:flex;gap:28px;padding:12px 20px 16px;text-align:center}"+
".agdk .rec .c{flex:1}"+
".agdk .rec h4{font-size:10px;letter-spacing:.26em;font-weight:700;color:var(--accent);margin-bottom:9px;text-transform:uppercase}"+
".agdk .rec p{font-size:10.8px;line-height:1.65;color:#6e6873}"+
".agdk .thanks{font-size:10.2px;font-style:italic;color:#b9a9c0;text-align:center;line-height:1.65;margin-top:2px;padding:0 40px 6px}"+
/* sponsors */
".agdk .sp-grid{position:absolute;top:156px;left:64px;right:64px;bottom:72px;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:26px}"+
".agdk .sp-col{min-width:0;display:flex;flex-direction:column}"+
".agdk .sp-rib{background:var(--ribbon);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.24em;text-align:center;padding:7px 4px;text-transform:uppercase;clip-path:polygon(0 0,100% 0,97.5% 100%,2.5% 100%)}"+
".agdk .sp-logo{height:130px;display:flex;align-items:center;justify-content:center;padding:16px 12px}"+
".agdk .sp-logo img{max-width:75%;object-fit:contain}"+
".agdk .sp-logo .snm{font-size:22px;font-weight:700;color:#28222c;text-align:center}"+
".agdk .sp-desc{background:#f4f2f4;flex:1;padding:16px 16px;font-size:10.2px;line-height:1.6;color:#5c5661;overflow:hidden}"+
/* contact */
".agdk .ct-cap{position:absolute;top:82px;left:64px;font-size:11px;letter-spacing:.3em;font-weight:600;text-transform:uppercase;opacity:.85}"+
".agdk .ct-title{position:absolute;top:110px;left:64px;font-size:44px;font-weight:700;letter-spacing:.02em}"+
".agdk .ct-sub{position:absolute;top:180px;left:64px;right:64px;font-size:12px;font-weight:300;opacity:.88;line-height:1.6}"+
".agdk .ct-line{position:absolute;top:236px;left:64px;right:64px;height:1px;background:rgba(255,255,255,.35)}"+
".agdk .ct-grid{position:absolute;top:272px;left:64px;right:64px;display:grid;grid-template-columns:1fr 1fr;gap:42px 38px}"+
".agdk .ct .nm{font-size:18px;font-weight:700}"+
".agdk .ct .rl2{font-size:9.5px;letter-spacing:.22em;font-weight:500;opacity:.75;margin:4px 0 12px;text-transform:uppercase}"+
".agdk .ct .ln{font-size:11.5px;font-weight:300;opacity:.95;margin-bottom:5px}"+
".agdk .back-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:430px}"+
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
".agdk-edit .ghost.gt{min-height:30px;margin-top:4px}";

function slide(cls,inner){return '<div class="sl '+(cls||"")+'">'+inner+"</div>";}
function foot(meta,n){return '<div class="foot"><span'+de("meta.footerLeft")+'>'+esc(meta.footerLeft)+'</span><span>PAGE '+n+'</span></div>';}
function header(meta){
  var city=meta.city?meta.city.charAt(0)+meta.city.slice(1).toLowerCase():"";
  return '<div class="hd"><div><div class="t1"><span'+de("meta.city")+' style="font-weight:700">'+esc(city)+'</span> <span'+de("meta.event")+' style="font-weight:700">'+esc(meta.event)+'</span> <span'+de("meta.year")+'>'+esc(meta.year)+'</span></div><div class="t2"'+de("meta.headKicker")+'>'+esc(meta.headKicker||"Preliminary Agenda")+'</div></div><img src="'+CAP+'" alt=""></div><div class="hrule"></div>';
}
function pcell(p,path,tagPath,tagVal){
  if(!p)return"";
  return '<div class="pcell"><img src="'+pic(p.img)+'"'+dp(path+".img","photo")+'><div style="min-width:0">'+
    (tagPath?'<div class="mtag"'+de(tagPath)+'>'+esc(tagVal||"")+'</div>':"")+
    '<div class="nm"'+de(path+".name")+'>'+esc(p.name)+'</div>'+
    '<div class="tt"'+de(path+".title")+'>'+esc(p.title)+'</div>'+
    '<div class="fm"'+de(path+".firm")+'>'+esc(p.firm)+'</div></div></div>';
}
function sponHtml(s,b){
  if(!s.sponsorImg&&!s.sponsorName)return EDIT?'<div class="rspon"><span class="sb">SPONSORED BY:</span><span class="snm" '+de(b+".sponsorName").slice(1)+' style="color:#c9bfc7">— add —</span></div>':"";
  var h=s.sponsorH||30;
  return '<div class="rspon"><span class="sb">SPONSORED BY:</span>'+(s.sponsorImg?'<img src="'+esc(s.sponsorImg)+'" style="height:'+h+'px"'+dp(b+".sponsorImg","logo")+'>':'<span class="snm"'+de(b+".sponsorName")+'>'+esc(s.sponsorName)+'</span>')+'</div>';
}
function rowbar(i){
  if(!EDIT)return"";
  return '<div class="rowbar"><button data-op="up" data-i="'+i+'" title="Move up">↑</button><button data-op="down" data-i="'+i+'" title="Move down">↓</button><button data-op="add" data-i="'+i+'" title="Add a session below">＋ Add below</button><button data-op="del" data-i="'+i+'" title="Delete" style="color:#a33;border-color:#dfb6b6">✕</button></div>';
}
function sessionHtml(s,i){
  var b="sessions."+i;
  var head='<div class="rhead"><span class="pill"'+de(b+".time")+'>'+esc(s.time)+'</span><span class="rtitle"'+de(b+".title")+'>'+esc(s.title)+'</span>'+
    (s.note||EDIT?'<span class="rnote"'+de(b+".note")+'>'+esc(s.note||(EDIT?"room / note":""))+'</span>':"")+sponHtml(s,b)+'</div>';
  var body="";
  if(s.kind==="people"){
    if(s.desc||EDIT)body+='<div class="rdesc"'+de(b+".desc",1)+'>'+esc(s.desc)+'</div>';
    var cells="";
    if(s.lead)cells+=pcell(s.lead,b+".lead",b+".roleLabel",s.roleLabel||"MODERATOR");
    else if(EDIT)cells+='<div class="ghost" data-op="addlead" data-i="'+i+'">+ Moderator</div>';
    cells+=(s.people||[]).map(function(p,j){return pcell(p,b+".people."+j);}).join("");
    if(EDIT)cells+='<div class="ghost" data-op="addp" data-i="'+i+'">+ Add panelist</div>';
    if(cells)body+='<div class="prow">'+cells+'</div>';
  }else if(s.kind==="tables"){
    var half=Math.ceil(s.tables.length/2),c1="",c2="";
    s.tables.forEach(function(t,j){
      var h='<div class="tbl"><div class="tp"><b>Table '+(j+1)+':</b> <i'+de(b+".tables."+j+".topic")+'>'+esc(t.topic)+'</i></div><div class="hb">Hosted By: <span'+de(b+".tables."+j+".host")+'>'+esc(t.host||"")+'</span></div></div>';
      if(j<half)c1+=h;else c2+=h;
    });
    if(EDIT)c2+='<div class="ghost gt" data-op="addtable" data-i="'+i+'">+ Add table</div>';
    body='<div class="tbl-wrap"><div class="tbl-col">'+c1+'</div><div class="tbl-col">'+c2+'</div></div>';
  }else if(s.kind==="reception"){
    body='<div class="rec">'+(s.cols||[]).map(function(c,j){return '<div class="c"><h4'+de(b+".cols."+j+".h")+'>'+esc(c.h)+'</h4><p'+de(b+".cols."+j+".body",1)+'>'+esc(c.body).replace(/\n/g,"<br>")+'</p></div>';}).join("")+'</div>';
  }
  var html='<div class="row" data-sess="'+i+'">'+rowbar(i)+head+body+'</div>';
  if(s.kind==="reception"&&s.thanks!=null)html+='<div class="thanks"'+de(b+".thanks",1)+'>'+esc(s.thanks)+'</div>';
  return html;
}

function coverSlide(d){
  var m=d.meta;
  var rail=(m.coverPartners||[]).map(function(p,i){
    var base="meta.coverPartners."+i;
    return '<div class="cp"><div class="lbl"'+de(base+".label")+'>'+esc(p.label)+'</div>'+
      (p.img?'<img src="'+esc(p.img)+'" style="height:'+(p.h||56)+'px"'+dp(base+".img","logo")+'>':'<div class="txt"'+de(base+".name")+'>'+esc(p.name)+'</div>')+'</div>';
  }).join("");
  return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div>'+
    '<img class="cov-cap" src="'+CAP+'">'+
    '<img class="cov-lock" src="'+LOCK+'">'+
    '<div class="cov-date"><span'+de("meta.dateLine")+' style="font-weight:700">'+esc(m.dateLine)+'</span>  <span>|</span>  <span'+de("meta.locLine")+'>'+esc(m.locLine)+'</span></div>'+
    '<div class="cov-rail">'+rail+'</div>'+
    (m.preliminary||EDIT?'<div class="cov-note"'+de("meta.preliminary")+'>'+esc(m.preliminary)+'</div>':""));
}
function welcomeSlide(d,n){
  var m=d.meta,w=m.welcome||{};
  return slide("",header(m)+
    '<div class="wel-band"'+de("meta.bandLine")+'>'+esc(m.bandLine)+'</div>'+
    '<div class="wel-body">'+(w.paras||[]).map(function(p,i){return '<p'+de("meta.welcome.paras."+i,1)+'>'+esc(p)+"</p>";}).join("")+
    '<div class="wel-sig"><div class="nm"><b'+de("meta.welcome.signName")+'>'+esc(w.signName)+'</b>, <span'+de("meta.welcome.signTitle")+'>'+esc(w.signTitle)+'</span></div><div class="org"'+de("meta.welcome.signOrg")+'>'+esc(w.signOrg)+'</div></div>'+
    '</div>'+foot(m,n));
}
function speakerEntries(d){
  var seen={},list=[];
  (d.sessions||[]).forEach(function(s){
    var all=[];if(s.lead)all.push(s.lead);if(s.people)all=all.concat(s.people);
    all.forEach(function(p){if(p&&p.name&&!/TB[AC]/i.test(p.name)&&!/announced/i.test(p.name)&&!seen[p.name]){seen[p.name]=1;list.push(p);}});
  });
  return list.map(function(p){return "<div><b>"+esc(p.name)+"</b>"+(p.title?", <i>"+esc(p.title)+"</i>":"")+(p.firm?', <span class="f">'+esc(p.firm)+"</span>":"")+"</div>";});
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
function contactSlide(d,n){
  var m=d.meta;if(!m.contacts||!m.contacts.length)return null;
  var cells=m.contacts.map(function(c,i){
    var b="meta.contacts."+i;
    return '<div class="ct"><div class="nm"'+de(b+".name")+'>'+esc(c.name)+'</div><div class="rl2"'+de(b+".role")+'>'+esc(c.role)+'</div>'+
      '<div class="ln"'+de(b+".email")+'>'+esc(c.email)+'</div>'+(c.t||EDIT?'<div class="ln">T: <span'+de(b+".t")+'>'+esc(c.t)+'</span></div>':"")+(c.m||EDIT?'<div class="ln">M: <span'+de(b+".m")+'>'+esc(c.m)+'</span></div>':"")+'</div>';
  }).join("");
  return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div><div class="ct-cap">Get In Touch</div><div class="ct-title">CONTACT US</div><div class="ct-sub"'+de("meta.contactsSub",1)+'>'+esc(m.contactsSub||"")+'</div><div class="ct-line"></div><div class="ct-grid">'+cells+'</div>');
}
function backSlide(){return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div><img class="back-logo" src="'+CAP+'">');}

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
  var htmls=(d.sessions||[]).map(function(s,i){return sessionHtml(s,i);});
  var hs=measureBlocks(root,htmls,"rows",888);
  var pages=[],cur=[],curH=0,tots=[];
  htmls.forEach(function(h,i){
    var hh=hs[i]+12;
    if(curH+hh>PAGE_H&&cur.length){pages.push(cur);tots.push(curH);cur=[];curH=0;}
    cur.push(h);curH+=hh;
  });
  if(cur.length){pages.push(cur);tots.push(curH);}
  return pages.map(function(pg,i){
    /* when a page is mostly full, distribute the slack between sessions so
       leftover space never pools at the bottom */
    var fill=(tots[i]>=PAGE_H*0.72&&pg.length>1)?" fill":"";
    return slide("",'<div class="rows'+fill+'">'+pg.join("")+'</div>'+foot(d.meta,startN+i));
  });
}
function speakersSlides(root,d,startN){
  if(d.meta.showSpeakers===false)return[];
  var entries=speakerEntries(d);
  if(!entries.length)return[];
  var hs=measureBlocks(root,entries,"spk-col",416),COL_H=950;
  var cols=[],cur=[],curH=0;
  entries.forEach(function(h,i){
    var hh=hs[i]+8;
    if(curH+hh>COL_H&&cur.length){cols.push(cur);cur=[];curH=0;}
    cur.push(h);curH+=hh;
  });
  if(cur.length)cols.push(cur);
  var out=[];
  for(var i=0;i<cols.length;i+=2){
    var inner='<div class="spk-wrap"><div class="spk-col">'+cols[i].join("")+'</div><div class="spk-col">'+(cols[i+1]?cols[i+1].join(""):"")+'</div></div>';
    out.push(slide("",header(d.meta)+'<div class="spk-badge">Confirmed Speakers Include</div>'+inner+foot(d.meta,startN+out.length)));
  }
  return out;
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
  var ct=contactSlide(d,n);if(ct)slides.push(ct);
  slides.push(backSlide());
  root.innerHTML=slides.join("");
  return root.querySelectorAll(".sl").length;
}

window.AgendaRender={buildDeck:buildDeck,THEMES:THEMES,SIL:SIL,W:W,H:H};
})();
