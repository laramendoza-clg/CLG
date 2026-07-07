/* CapLink Studio — the standard event production timeline.
   ONE place to define the rules: each milestone is "w" weeks before the
   event date. Every event page and the dashboard compute real calendar
   deadlines from these. Change the numbers here and every event updates. */
window.StudioMilestones=(function(){
  /* "to" says where the work happens: agenda → that event's editor,
     event → the event workspace page. */
  var TEMPLATE=[
    {w:16,label:"Event website live · registration open",detail:"Landing page up, save-the-date sent, first outreach wave",to:"event"},
    {w:12,label:"Brand kit & sponsor tiers locked",detail:"Event lockup, colours, theme; sponsor packages confirmed",to:"event"},
    {w:10,label:"Preliminary agenda published",detail:"Sessions and timings live on the agenda share link",to:"agenda"},
    {w:8,label:"Speaker photos & bios collected",detail:"Every confirmed speaker: square headshot, title, firm, short bio",to:"agenda"},
    {w:8,label:"Social campaign starts",detail:"“I'm Attending” and speaker announcement cards rolling out",to:"event"},
    {w:6,label:"Print designs DONE",detail:"Lanyards, badges, signage, staging/backdrop, banners — final artwork approved",to:"event"},
    {w:5,label:"Print sent to vendor & ordered",detail:"All print and staging orders placed; delivery dates confirmed in writing",to:"event"},
    {w:4,label:"Event app content complete",detail:"Agenda, speakers, sponsors loaded into the app and tested",to:"event"},
    {w:3,label:"Holding slides & screen content designed",detail:"Walk-in loop, session holding slides, sponsor reel",to:"event"},
    {w:2,label:"Final agenda published · last reprint window",detail:"Late changes close; vendor deliveries reconfirmed",to:"agenda"},
    {w:1,label:"Show-ready",detail:"Slides loaded, run-of-show locked, staging plan final, team briefed",to:"event"},
    {w:0,label:"Event day",detail:"",to:"event"}
  ];
  var SHORT={"dubai-2026":"Dubai","newyork-2026":"New York","ai-data-breakfast-2026":"AI / Data","europe-2027":"Europe","mit-2027":"MIT"};
  var ACC={"dubai-2026":"#2f5d63","newyork-2026":"#A15D50","ai-data-breakfast-2026":"#8A7547","europe-2027":"#6b2554","mit-2027":"#5E1A2E"};
  var DATES={
    "dubai-2026":{date:"2026-09-15"},
    "newyork-2026":{date:"2026-10-14"},
    "ai-data-breakfast-2026":{date:"2026-11-18"},
    "europe-2027":{date:"2027-02-15",est:true},
    "mit-2027":{date:"2027-02-24"}
  };
  function schedule(slug){
    var e=DATES[slug];if(!e)return null;
    var ev=new Date(e.date+"T12:00:00");
    return {event:ev,est:!!e.est,items:TEMPLATE.map(function(m,i){
      return {w:m.w,label:m.label,detail:m.detail,to:m.to,
        id:slug+"#"+m.w+"#"+i,
        date:new Date(ev.getTime()-m.w*7*864e5)};
    })};
  }
  function linkFor(slug,item,prefix){
    prefix=prefix||"./";
    return item.to==="agenda"?prefix+"agenda-generator/?e="+encodeURIComponent(slug)
                             :prefix+"event/?e="+encodeURIComponent(slug);
  }

  /* ---- done state: shared via Supabase when the table exists, else
     quietly per-device via localStorage ---- */
  var SUPA_URL="https://buijepdhgvcfmclztjez.supabase.co";
  var SUPA_KEY="sb_publishable_wWAcHfVy2dX0PZoxJ4NgrQ_-QhhFfGg";
  var LS="studio-ms-done",cloudOk=false;
  function lsGet(){try{return JSON.parse(localStorage.getItem(LS))||{};}catch(_){return {};}}
  function lsSet(m){try{localStorage.setItem(LS,JSON.stringify(m));}catch(_){}}
  function loadDone(){
    /* resolves {done:{id:1}, meta:{id:{by,at}}} — meta only when the shared table exists */
    return fetch(SUPA_URL+"/rest/v1/milestones?select=id,done,by_name,at",{headers:{apikey:SUPA_KEY}})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(rows){
        cloudOk=true;var m={},meta={};
        rows.forEach(function(x){if(x.done){m[x.id]=1;meta[x.id]={by:x.by_name,at:x.at};}});
        lsSet(m);return {done:m,meta:meta};
      })
      .catch(function(){return {done:lsGet(),meta:{}};});
  }
  /* everything ticked off, most recent deadline first — the reference log */
  function completed(doneMap){
    var out=[];
    Object.keys(DATES).forEach(function(slug){
      var s=schedule(slug);if(!s)return;
      s.items.forEach(function(it){
        if(doneMap[it.id])out.push({slug:slug,short:SHORT[slug]||slug,acc:ACC[slug]||"#531639",est:s.est,item:it});
      });
    });
    out.sort(function(a,b){return b.item.date-a.item.date;});
    return out;
  }
  function setDone(id,done){
    var m=lsGet();if(done)m[id]=1;else delete m[id];lsSet(m);
    if(!cloudOk)return;
    var by=null;try{var p=JSON.parse(localStorage.getItem("caplink-profile")||"null");by=p&&p.name||null;}catch(_){}
    fetch(SUPA_URL+"/rest/v1/milestones",{method:"POST",
      headers:{apikey:SUPA_KEY,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates"},
      body:JSON.stringify({id:id,done:!!done,by_name:by})}).catch(function(){});
  }
  /* Everything still open across all events, soonest first. */
  function agendaOfTheWeek(doneMap,now,horizonDays){
    now=now||new Date();horizonDays=horizonDays==null?21:horizonDays;
    var out=[];
    Object.keys(DATES).forEach(function(slug){
      var s=schedule(slug);if(!s)return;
      s.items.forEach(function(it){
        if(doneMap[it.id])return;
        var days=(it.date-now)/864e5;
        if(days<=horizonDays)out.push({slug:slug,short:SHORT[slug]||slug,acc:ACC[slug]||"#531639",est:s.est,item:it,days:Math.round(days)});
      });
    });
    out.sort(function(a,b){return a.item.date-b.item.date;});
    return out;
  }
  function fmt(d){return d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});}
  function status(d,now){
    var days=(d-(now||new Date()))/864e5;
    if(days<-0.5)return "past";
    if(days<=14)return "soon";
    return "future";
  }
  function next(slug,now){
    var s=schedule(slug);if(!s)return null;
    now=now||new Date();
    for(var i=0;i<s.items.length;i++){
      if(s.items[i].date.getTime()-now.getTime()>-43200000)return {item:s.items[i],est:s.est};
    }
    return null;
  }
  return {TEMPLATE:TEMPLATE,DATES:DATES,SHORT:SHORT,ACC:ACC,
    schedule:schedule,next:next,fmt:fmt,status:status,
    linkFor:linkFor,loadDone:loadDone,setDone:setDone,agendaOfTheWeek:agendaOfTheWeek,completed:completed};
})();
