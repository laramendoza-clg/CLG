/* CapLink Studio — shared agenda deck renderer.
   Used by /agenda/ (public viewer) and /agenda-generator/ (editor preview).
   AgendaRender.buildDeck(rootEl, data) -> number of slides rendered.       */
(function(){
"use strict";

var THEMES={
  dubai:{pill:"#102b35",ribbon:"#12303c",accent:"#2f5d63"},
  european:{pill:"#2A1228",ribbon:"#2A1228",accent:"#6b2554"},
  newyork:{pill:"#2b161c",ribbon:"#472E40",accent:"#A15D50"},
  london:{pill:"#0D1426",ribbon:"#0D1426",accent:"#8A7547"}
};
var SIL='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88"><rect width="88" height="88" fill="#d3d3d6"/><circle cx="44" cy="34" r="15" fill="#b6b6bb"/><path d="M14 88c3-20 16-28 30-28s27 8 30 28z" fill="#b6b6bb"/></svg>');
var SKY="../assets/sky.jpg", CAP="../assets/caplink-group.png";

function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function pic(src){return esc(src&&String(src).trim()?src:SIL);}

var CSS=[
"​.agdk{--pill:#102b35;--ribbon:#12303c;--accent:#2f5d63;font-family:'Raleway',system-ui,sans-serif;-webkit-font-smoothing:antialiased}",
".agdk .sl{width:1280px;height:720px;background:#fff;position:relative;overflow:hidden;color:#222;flex:0 0 auto}",
".agdk .sl *{box-sizing:border-box;margin:0;padding:0}",
".agdk .foot{position:absolute;left:56px;right:56px;bottom:22px;display:flex;justify-content:space-between;font-size:8.5px;letter-spacing:.22em;color:#9b9ba0;text-transform:uppercase;font-weight:500}",
/* cover / dark pages */
".agdk .dark{color:#fff}",
".agdk .dark .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}",
".agdk .dark .tint{position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,10,14,.55),rgba(10,10,14,.28) 55%,rgba(10,10,14,.5))}",
".agdk .cov-cap{position:absolute;top:64px;left:72px;height:44px}",
".agdk .cov-lock{position:absolute;top:212px;left:72px;width:420px}",
".agdk .cov-date{position:absolute;top:494px;left:72px;font-size:16px;font-weight:700;letter-spacing:.24em}",
".agdk .cov-date span{font-weight:300;letter-spacing:.18em;opacity:.85}",
".agdk .cov-note{position:absolute;left:72px;bottom:26px;font-size:9px;opacity:.5;font-weight:300;letter-spacing:.06em}",
".agdk .cov-rail{position:absolute;top:52px;right:72px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px}",
".agdk .cov-rail .lbl{font-size:8.5px;letter-spacing:.3em;font-weight:600;color:rgba(255,255,255,.82);margin-top:20px;text-transform:uppercase}",
".agdk .cov-rail img{max-height:52px;max-width:150px;object-fit:contain}",
".agdk .cov-rail .txt{font-size:17px;font-weight:600;letter-spacing:.12em}",
/* light page header */
".agdk .hd{position:absolute;top:38px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:flex-start}",
".agdk .hd .t1{font-size:21px;font-weight:700;color:#1c1420}.agdk .hd .t1 span{font-weight:300}",
".agdk .hd .t2{font-size:8.5px;letter-spacing:.3em;color:#a59fa4;font-weight:500;margin-top:5px;text-transform:uppercase}",
".agdk .hd img{height:34px;filter:brightness(0) opacity(.82)}",
".agdk .hrule{position:absolute;top:104px;left:56px;right:340px;height:2px;background:#241020}",
/* welcome */
".agdk .wel-band{position:absolute;top:120px;left:56px;right:56px;background:#122a33;color:#fff;border-radius:20px;text-align:center;font-size:10.5px;letter-spacing:.28em;font-weight:600;padding:8px 0;text-transform:uppercase}",
".agdk .wel-body{position:absolute;top:170px;left:56px;right:56px;font-size:12.5px;line-height:1.62;color:#4c4650;font-weight:400}",
".agdk .wel-body p{margin-bottom:13px}",
".agdk .wel-sig{position:absolute;left:56px;bottom:70px}",
".agdk .wel-sig .nm{font-size:14px;color:#241020}.agdk .wel-sig .nm b{font-weight:700}",
".agdk .wel-sig .org{font-size:10px;font-weight:700;letter-spacing:.18em;color:var(--accent);margin-top:4px;text-transform:uppercase}",
/* speakers list */
".agdk .spk-badge{position:absolute;top:124px;left:56px;background:#122a33;color:#fff;font-size:9px;font-weight:700;letter-spacing:.24em;padding:7px 18px;border-radius:14px;text-transform:uppercase}",
".agdk .spk-cols{position:absolute;top:168px;left:56px;right:56px;bottom:60px;column-count:2;column-gap:46px;font-size:10.8px;line-height:1.5;color:#544e57}",
".agdk .spk-cols div{margin-bottom:6.5px;break-inside:avoid}",
".agdk .spk-cols b{color:#241020;font-weight:700}.agdk .spk-cols i{font-weight:400}.agdk .spk-cols .f{font-weight:700;color:#241020}",
/* agenda rows */
".agdk .rows{position:absolute;top:34px;left:56px;right:56px}",
".agdk .row{background:#f7f6f7;border-radius:6px;margin-bottom:14px;padding:0 22px}",
".agdk .rhead{display:flex;align-items:center;gap:18px;min-height:44px;padding:8px 0}",
".agdk .pill{background:var(--pill);color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.04em;border-radius:16px;padding:6px 14px;white-space:nowrap;font-variant-numeric:tabular-nums}",
".agdk .rtitle{font-size:14.5px;font-weight:700;color:#241f26;flex:1}.agdk .rtitle i{font-weight:400}",
".agdk .rnote{font-size:9.5px;color:#8d8791;font-style:italic;white-space:nowrap}",
".agdk .rspon{display:flex;align-items:center;gap:9px;white-space:nowrap}",
".agdk .rspon .sb{font-size:7.5px;letter-spacing:.24em;color:#9b95a0;font-weight:600}",
".agdk .rspon img{max-height:26px;max-width:130px;object-fit:contain}",
".agdk .rspon .snm{font-size:12px;font-weight:700;color:#38323c}",
".agdk .rbody{display:flex;gap:26px;padding:10px 4px 18px}",
".agdk .lead{width:168px;flex:0 0 auto}",
".agdk .rl{font-size:7.5px;letter-spacing:.26em;color:#a09aa5;font-weight:600;margin-bottom:6px;text-transform:uppercase}",
".agdk .pcell{display:flex;gap:9px;align-items:flex-start}",
".agdk .pcell img{width:44px;height:44px;object-fit:cover;border-radius:3px;flex:0 0 auto}",
".agdk .pcell .nm{font-size:9.8px;font-weight:700;color:#241f26;line-height:1.25}",
".agdk .pcell .tt{font-size:8.6px;color:#7f7984;line-height:1.3;margin-top:2px}",
".agdk .pcell .fm{font-size:8.8px;font-weight:700;color:#38323c;margin-top:2px;line-height:1.25}",
".agdk .rdesc{flex:1;font-size:9.6px;line-height:1.55;color:#6e6873;padding-top:14px}",
".agdk .prow{display:flex;gap:14px;padding:2px 4px 18px}",
".agdk .prow .pcell{flex:1;min-width:0}",
/* roundtables */
".agdk .tbl-wrap{display:flex;gap:44px;padding:6px 4px 18px}",
".agdk .tbl-col{flex:1}",
".agdk .tbl{margin-bottom:11px;font-size:9.6px;line-height:1.4}",
".agdk .tbl .tp{color:#38323c}.agdk .tbl .tp b{font-weight:700}.agdk .tbl .tp i{font-weight:400}",
".agdk .tbl .hb{font-size:8.8px;font-weight:700;color:#241f26;margin-top:1px}",
/* reception */
".agdk .rec{display:flex;gap:30px;padding:14px 30px 20px;text-align:center}",
".agdk .rec .c{flex:1}",
".agdk .rec h4{font-size:9px;letter-spacing:.26em;font-weight:700;color:var(--accent);margin-bottom:8px;text-transform:uppercase}",
".agdk .rec p{font-size:9.8px;line-height:1.6;color:#6e6873}",
".agdk .thanks{font-size:9.2px;font-style:italic;color:#b9a9c0;text-align:center;line-height:1.6;margin-top:4px;padding:0 60px}",
/* sponsors */
".agdk .sp-grid{position:absolute;top:132px;left:56px;right:56px;bottom:60px;display:flex;gap:22px}",
".agdk .sp-col{flex:1;min-width:0;display:flex;flex-direction:column}",
".agdk .sp-rib{background:var(--ribbon);color:#fff;font-size:8.5px;font-weight:700;letter-spacing:.24em;text-align:center;padding:6px 4px;text-transform:uppercase;clip-path:polygon(0 0,100% 0,97% 100%,3% 100%)}",
".agdk .sp-logo{height:120px;display:flex;align-items:center;justify-content:center;padding:14px 10px}",
".agdk .sp-logo img{max-height:78px;max-width:88%;object-fit:contain}",
".agdk .sp-logo .snm{font-size:19px;font-weight:700;color:#28222c;text-align:center}",
".agdk .sp-desc{background:#f4f2f4;flex:1;padding:16px 15px;font-size:9.4px;line-height:1.6;color:#5c5661}",
/* contact */
".agdk .ct-cap{position:absolute;top:56px;left:72px;font-size:10px;letter-spacing:.3em;font-weight:600;text-transform:uppercase;opacity:.85}",
".agdk .ct-title{position:absolute;top:82px;left:72px;font-size:38px;font-weight:700;letter-spacing:.02em}",
".agdk .ct-sub{position:absolute;top:140px;left:72px;right:340px;font-size:10.5px;font-weight:300;opacity:.85}",
".agdk .ct-line{position:absolute;top:170px;left:72px;right:72px;height:1px;background:rgba(255,255,255,.35)}",
".agdk .ct-grid{position:absolute;top:200px;left:72px;right:72px;display:grid;grid-template-columns:repeat(4,1fr);gap:38px 28px}",
".agdk .ct .nm{font-size:15px;font-weight:700}",
".agdk .ct .rl2{font-size:8.5px;letter-spacing:.22em;font-weight:500;opacity:.75;margin:3px 0 10px;text-transform:uppercase}",
".agdk .ct .ln{font-size:9.8px;font-weight:300;opacity:.95;margin-bottom:4px}",
".agdk .back-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:360px}"
].join("\n").replace(/^​/,"");

function slide(cls,inner){return '<div class="sl '+(cls||"")+'">'+inner+"</div>";}
function foot(meta,n){return '<div class="foot"><span>'+esc(meta.footerLeft)+'</span><span>PAGE '+n+'</span></div>';}
function header(meta){return '<div class="hd"><div><div class="t1">'+esc(meta.city.charAt(0)+meta.city.slice(1).toLowerCase())+' '+esc(meta.event)+' <span>'+esc(meta.year)+'</span></div><div class="t2">'+esc(meta.headKicker||"Preliminary Agenda")+'</div></div><img src="'+CAP+'" alt="CapLink Group"></div><div class="hrule"></div>';}
function pcell(p,big){if(!p)return"";return '<div class="pcell"><img src="'+pic(p.img)+'"><div>'+(p.name?'<div class="nm">'+esc(p.name)+'</div>':"")+(p.title?'<div class="tt">'+esc(p.title)+'</div>':"")+(p.firm?'<div class="fm">'+esc(p.firm)+'</div>':"")+'</div></div>';}
function sponHtml(s){if(!s.sponsorImg&&!s.sponsorName)return"";return '<div class="rspon"><span class="sb">SPONSORED BY:</span>'+(s.sponsorImg?'<img src="'+esc(s.sponsorImg)+'">':'<span class="snm">'+esc(s.sponsorName)+'</span>')+'</div>';}

function sessionHtml(s){
  var head='<div class="rhead"><span class="pill">'+esc(s.time)+'</span><span class="rtitle">'+esc(s.title)+'</span>'+(s.note?'<span class="rnote">'+esc(s.note)+'</span>':"")+sponHtml(s)+'</div>';
  var body="";
  if(s.kind==="people"){
    var lead=s.lead?('<div class="lead">'+(s.roleLabel?'<div class="rl">'+esc(s.roleLabel)+'</div>':"")+pcell(s.lead)+'</div>'):"";
    if(lead||s.desc)body+='<div class="rbody">'+lead+(s.desc?'<div class="rdesc">'+esc(s.desc)+'</div>':"")+'</div>';
    if(s.people&&s.people.length)body+='<div class="prow">'+s.people.map(function(p){return pcell(p);}).join("")+'</div>';
  }else if(s.kind==="tables"){
    var half=Math.ceil(s.tables.length/2),c1="",c2="";
    s.tables.forEach(function(t,i){
      var h='<div class="tbl"><div class="tp"><b>Table '+(i+1)+':</b> <i>'+esc(t.topic)+'</i></div><div class="hb">Hosted By: '+esc(t.host||"")+'</div></div>';
      if(i<half)c1+=h;else c2+=h;
    });
    body='<div class="tbl-wrap"><div class="tbl-col">'+c1+'</div><div class="tbl-col">'+c2+'</div></div>';
  }else if(s.kind==="reception"){
    body='<div class="rec">'+(s.cols||[]).map(function(c){return '<div class="c"><h4>'+esc(c.h)+'</h4><p>'+esc(c.body).replace(/\n/g,"<br>")+'</p></div>';}).join("")+'</div>';
  }
  var html='<div class="row">'+head+body+'</div>';
  if(s.kind==="reception"&&s.thanks)html+='<div class="thanks">'+esc(s.thanks)+'</div>';
  return html;
}

function coverSlide(d){
  var m=d.meta;
  var rail=(m.coverPartners||[]).map(function(p){return '<div class="lbl">'+esc(p.label)+'</div>'+(p.img?'<img src="'+esc(p.img)+'">':'<div class="txt">'+esc(p.name)+'</div>');}).join("");
  return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div>'+
    '<img class="cov-cap" src="'+CAP+'">'+
    '<img class="cov-lock" src="../assets/pcs-lockup.png">'+
    '<div class="cov-date">'+esc(m.dateLine)+'  <span>|  '+esc(m.locLine)+'</span></div>'+
    (m.preliminary?'<div class="cov-note">'+esc(m.preliminary)+'</div>':"")+
    '<div class="cov-rail">'+rail+'</div>');
}

function welcomeSlide(d,n){
  var m=d.meta,w=m.welcome||{};
  return slide("",header(m)+
    '<div class="wel-band">'+esc(m.bandLine)+'</div>'+
    '<div class="wel-body">'+(w.paras||[]).map(function(p){return "<p>"+esc(p)+"</p>";}).join("")+'</div>'+
    '<div class="wel-sig"><div class="nm"><b>'+esc(w.signName)+',</b> '+esc(w.signTitle)+'</div><div class="org">'+esc(w.signOrg)+'</div></div>'+foot(m,n));
}

function speakersSlide(d,n){
  var seen={},list=[];
  (d.sessions||[]).forEach(function(s){
    var all=[];if(s.lead)all.push(s.lead);if(s.people)all=all.concat(s.people);
    all.forEach(function(p){if(p&&p.name&&!/TB[AC]/i.test(p.name)&&!/announced/i.test(p.name)&&!seen[p.name]){seen[p.name]=1;list.push(p);}});
  });
  if(!list.length)return null;
  var items=list.map(function(p){return "<div><b>"+esc(p.name)+"</b>"+(p.title?", <i>"+esc(p.title)+"</i>":"")+(p.firm?', <span class="f">'+esc(p.firm)+"</span>":"")+"</div>";}).join("");
  return slide("",header(d.meta)+'<div class="spk-badge">Confirmed Speakers Include</div><div class="spk-cols">'+items+'</div>'+foot(d.meta,n));
}

function sponsorSlides(d,startN){
  var out=[],sp=d.sponsors||[];
  for(var i=0;i<sp.length;i+=4){
    var cols=sp.slice(i,i+4).map(function(s){
      return '<div class="sp-col"><div class="sp-rib">'+esc(s.tier)+'</div><div class="sp-logo">'+(s.img?'<img src="'+esc(s.img)+'">':'<div class="snm">'+esc(s.name)+'</div>')+'</div><div class="sp-desc">'+esc(s.desc)+'</div></div>';
    }).join("");
    out.push(slide("",header(d.meta)+'<div class="sp-grid">'+cols+'</div>'+foot(d.meta,startN+out.length)));
  }
  return out;
}

function contactSlide(d,n){
  var m=d.meta;if(!m.contacts||!m.contacts.length)return null;
  var cells=m.contacts.map(function(c){
    return '<div class="ct"><div class="nm">'+esc(c.name)+'</div><div class="rl2">'+esc(c.role)+'</div>'+
      (c.email?'<div class="ln">'+esc(c.email)+'</div>':"")+(c.t?'<div class="ln">T: '+esc(c.t)+'</div>':"")+(c.m?'<div class="ln">M: '+esc(c.m)+'</div>':"")+'</div>';
  }).join("");
  return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div><div class="ct-cap">Get In Touch</div><div class="ct-title">CONTACT US</div><div class="ct-sub">'+esc(m.contactsSub||"")+'</div><div class="ct-line"></div><div class="ct-grid">'+cells+'</div>');
}

function backSlide(){
  return slide("dark",'<img class="bg" src="'+SKY+'"><div class="tint"></div><img class="back-logo" src="'+CAP+'">');
}

/* Paginate agenda sessions by measuring rendered block heights. */
function paginateSessions(root,d,startN){
  var PAGE_H=636, meas=document.createElement("div");
  meas.className="agdk";meas.style.cssText="position:absolute;left:-99999px;top:0";
  meas.innerHTML='<div class="sl"><div class="rows" id="_mrows"></div></div>';
  root.appendChild(meas);
  var mrows=meas.querySelector("#_mrows"),pages=[],cur=[],curH=0;
  (d.sessions||[]).forEach(function(s){
    mrows.innerHTML=sessionHtml(s);
    var h=mrows.firstChild?mrows.getBoundingClientRect().height:60;
    h=mrows.scrollHeight;
    if(curH+h>PAGE_H&&cur.length){pages.push(cur);cur=[];curH=0;}
    cur.push(s);curH+=h;
  });
  if(cur.length)pages.push(cur);
  root.removeChild(meas);
  return pages.map(function(pg,i){
    return slide("",'<div class="rows">'+pg.map(sessionHtml).join("")+'</div>'+foot(d.meta,startN+i));
  });
}

function buildDeck(root,data){
  var d=data||{},m=d.meta||{},t=THEMES[d.theme]||THEMES.dubai;
  if(!document.getElementById("agdk-css")){
    var st=document.createElement("style");st.id="agdk-css";st.textContent=CSS;document.head.appendChild(st);
  }
  root.classList.add("agdk");
  root.style.setProperty("--pill",t.pill);root.style.setProperty("--ribbon",t.ribbon);root.style.setProperty("--accent",t.accent);
  var slides=[coverSlide(d)],n=2;
  var wel=m.welcome&&(m.welcome.paras||[]).length?welcomeSlide(d,n):null;if(wel){slides.push(wel);n++;}
  if(m.showSpeakers!==false){var sp=speakersSlide(d,n);if(sp){slides.push(sp);n++;}}
  root.innerHTML="";root.appendChild(document.createElement("div"));root.innerHTML="";
  var ses=paginateSessions(root,d,n);n+=ses.length;slides=slides.concat(ses);
  slides=slides.concat(sponsorSlides(d,n));n+=Math.ceil(((d.sponsors||[]).length)/4);
  var ct=contactSlide(d,n);if(ct)slides.push(ct);
  slides.push(backSlide());
  root.innerHTML=slides.join("");
  return root.querySelectorAll(".sl").length;
}

window.AgendaRender={buildDeck:buildDeck,THEMES:THEMES,SIL:SIL};
})();
