/* CapLink Studio — the standard event production timeline.
   ONE place to define the rules: each milestone is "w" weeks before the
   event date. Every event page and the dashboard compute real calendar
   deadlines from these. Change the numbers here and every event updates. */
window.StudioMilestones=(function(){
  /* The CapLink standard event production timeline — based on Doina's
     draft (production), July 2026, plus the design/print deadlines.
     "w" = weeks before the event (negative = after). "to" says where the
     work happens: agenda → that event's editor, event → its workspace. */
  var TEMPLATE=[
    {w:30,phase:"T-7 months",label:"Date and venue confirmed",track:"production",to:"event"},
    {w:30,phase:"T-7 months",label:"Agenda launch",track:"design",detail:"The agenda document goes live with the event skeleton",to:"agenda"},
    {w:30,phase:"T-7 months",label:"Website live",track:"marketing",to:"event"},
    {w:30,phase:"T-7 months",label:"Speaker outreach begins",track:"production",to:"event"},
    {w:30,phase:"T-7 months",label:"Event branding and assets prepared",track:"design",detail:"Event lockup, colours, theme, key art",to:"event"},

    {w:26,phase:"T-6 months",label:"Agenda 20–40% done",track:"production",detail:"And continuously updated from here on",to:"agenda"},
    {w:26,phase:"T-6 months",label:"Website updated with confirmed speakers",track:"marketing",to:"event"},
    {w:26,phase:"T-6 months",label:"Marketing campaigns launched",track:"marketing",to:"event"},
    {w:26,phase:"T-6 months",label:"Sponsor prospecting continues",track:"sales",to:"event"},

    {w:22,phase:"T-5 months",label:"Agenda 80% done",track:"production",detail:"Four speakers on each panel",to:"agenda"},
    {w:22,phase:"T-5 months",label:"Delegate outreach begins",track:"sales",detail:"Focus on CFOs, Operating Partners, Tax, GCs, Talent, etc.",to:"event"},
    {w:22,phase:"T-5 months",label:"Initial sponsor confirmations",track:"sales",to:"event"},

    {w:17,phase:"T-4 months",label:"Majority of speakers & moderators confirmed",track:"production",to:"agenda"},
    {w:17,phase:"T-4 months",label:"Majority of agenda complete",track:"production",to:"agenda"},
    {w:17,phase:"T-4 months",label:"Delegate outreach ramps up",track:"sales",to:"event"},
    {w:17,phase:"T-4 months",label:"Sponsor deliverables requested",track:"sales",to:"event"},
    {w:17,phase:"T-4 months",label:"Bios & headshots — collection begins",track:"production",detail:"Production starts collecting / chasing",to:"agenda"},

    {w:13,phase:"T-3 months",label:"Final speaker recruitment (keynotes)",track:"production",to:"agenda"},
    {w:13,phase:"T-3 months",label:"Remaining agenda gaps filled",track:"production",to:"agenda"},
    {w:13,phase:"T-3 months",label:"Bios & headshots — keep chasing",track:"production",to:"agenda"},
    {w:13,phase:"T-3 months",label:"Sponsor deliverables followed up",track:"sales",to:"event"},
    {w:13,phase:"T-3 months",label:"Initial AV requirements collected",track:"production",to:"event"},
    {w:13,phase:"T-3 months",label:"AUMs & notes on the ML — keep filling in",track:"sales",to:"event"},
    {w:13,phase:"T-3 months",label:"Initial app planning",track:"production",to:"event"},

    {w:9,phase:"T-2 months",label:"Speaker & guest reconfirmations",track:"production",to:"event"},
    {w:9,phase:"T-2 months",label:"Final request for bios & headshots",track:"production",to:"agenda"},
    {w:9,phase:"T-2 months",label:"Event app build begins",track:"production",to:"event"},
    {w:9,phase:"T-2 months",label:"Speaker pages uploaded",track:"marketing",to:"event"},
    {w:9,phase:"T-2 months",label:"Marketing push",track:"marketing",to:"event"},
    {w:9,phase:"T-2 months",label:"Final sponsor assets requested",track:"sales",to:"event"},
    {w:9,phase:"T-2 months",label:"Podcast preferences & scheduling",track:"sales",detail:"Sales asks sponsors for preferences; podcasts scheduled",to:"event"},
    {w:9,phase:"T-2 months",label:"Print & staging designs done",track:"design",detail:"Lanyards, badges, signage, backdrop/staging — final artwork approved",to:"event"},

    {w:4,phase:"T-1 month",label:"Delegate list shared with sponsors",track:"sales",to:"event"},
    {w:4,phase:"T-1 month",label:"All attendee AUMs & company notes completed",track:"sales",to:"event"},
    {w:4,phase:"T-1 month",label:"Panel preparation calls scheduled",track:"production",detail:"For roughly two weeks before the event",to:"event"},
    {w:4,phase:"T-1 month",label:"Moderator briefing preparation",track:"production",to:"event"},
    {w:4,phase:"T-1 month",label:"Final agenda published",track:"design",to:"agenda"},
    {w:4,phase:"T-1 month",label:"Registration push",track:"marketing",to:"event"},
    {w:4,phase:"T-1 month",label:"Final event app review",track:"production",to:"event"},
    {w:4,phase:"T-1 month",label:"Name badge data finalised",track:"production",to:"event"},
    {w:4,phase:"T-1 month",label:"Printing requirements confirmed · orders placed",track:"design",detail:"All print and staging orders with the vendor; delivery dates confirmed",to:"event"},
    {w:4,phase:"T-1 month",label:"Holding slides & screen content designed",track:"design",detail:"Walk-in loop, session holding slides, sponsor reel",to:"event"},

    {w:2,phase:"T-2 weeks",label:"Panel preparation calls",track:"production",to:"event"},
    {w:2,phase:"T-2 weeks",label:"Final delegate list",track:"sales",to:"event"},
    {w:2,phase:"T-2 weeks",label:"Seating plans",track:"production",to:"event"},
    {w:2,phase:"T-2 weeks",label:"Name badges printed",track:"production",detail:"Mark on the ML what didn't make the final print run — those print on site",to:"event"},
    {w:2,phase:"T-2 weeks",label:"Print materials completed",track:"production",to:"event"},
    {w:2,phase:"T-2 weeks",label:"Final operational review & event-day plan",track:"production",to:"event"},

    {w:0,phase:"Event day",label:"Event day",track:"production",detail:"Speaker & moderator check-ins · registration desk · AV testing · sponsor check-ins · green room · on-site badge printing · live execution & troubleshooting",to:"event"},

    {w:-1,phase:"Post event",label:"Thank-yous & follow-ups",track:"production",detail:"Speaker thank-you emails · sponsor follow-up · delegate follow-up",to:"event"}
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
      return {w:m.w,phase:m.phase,label:m.label,detail:m.detail,to:m.to,track:m.track,
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
  /* ---- one-off tasks (quick-added from the dashboard) ---- */
  var LS_T="studio-tasks",cloudTasksOk=false;
  function ltGet(){try{return JSON.parse(localStorage.getItem(LS_T))||[];}catch(_){return [];}}
  function ltSet(a){try{localStorage.setItem(LS_T,JSON.stringify(a));}catch(_){}}
  function loadTasks(){
    return fetch(SUPA_URL+"/rest/v1/tasks?select=id,label,slug,due,done,by_name,at",{headers:{apikey:SUPA_KEY}})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(rows){cloudTasksOk=true;ltSet(rows);return rows;})
      .catch(function(){return ltGet();});
  }
  function saveTask(t){
    ltSet(ltGet().filter(function(x){return x.id!==t.id;}).concat([t]));
    if(!cloudTasksOk)return;
    var by=null;try{var p=JSON.parse(localStorage.getItem("caplink-profile")||"null");by=p&&p.name||null;}catch(_){}
    fetch(SUPA_URL+"/rest/v1/tasks",{method:"POST",
      headers:{apikey:SUPA_KEY,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates"},
      body:JSON.stringify({id:t.id,label:t.label,slug:t.slug||"",due:t.due||null,done:!!t.done,by_name:t.by_name||by})}).catch(function(){});
  }
  function removeTask(id){
    ltSet(ltGet().filter(function(x){return x.id!==id;}));
    if(!cloudTasksOk)return;
    fetch(SUPA_URL+"/rest/v1/tasks?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:{apikey:SUPA_KEY}}).catch(function(){});
  }
  function newTaskId(){return "t"+Math.random().toString(36).slice(2,10)+Date.now().toString(36);}

  /* everything ticked off, most recent deadline first — the reference log */
  function completed(doneMap,tracks){
    var out=[];
    Object.keys(DATES).forEach(function(slug){
      var s=schedule(slug);if(!s)return;
      s.items.forEach(function(it){
        if(doneMap[it.id]&&inTracks(it,tracks))out.push({slug:slug,short:SHORT[slug]||slug,acc:ACC[slug]||"#531639",est:s.est,item:it});
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
  var TRACKS={design:"Design",marketing:"Marketing",production:"Production",sales:"Sales"};
  function inTracks(item,tracks){return !tracks||tracks.indexOf(item.track)>=0;}
  /* Everything still open across all events, soonest first.
     tracks (optional array) narrows to a lane, e.g. ["design","marketing"]. */
  function agendaOfTheWeek(doneMap,now,horizonDays,tracks){
    now=now||new Date();horizonDays=horizonDays==null?21:horizonDays;
    var out=[];
    Object.keys(DATES).forEach(function(slug){
      var s=schedule(slug);if(!s)return;
      s.items.forEach(function(it){
        if(doneMap[it.id]||!inTracks(it,tracks))return;
        var days=(it.date-now)/864e5;
        /* the daily list shows the recent past and near future; older
           still-open items live on the event page timeline */
        if(days>=-28&&days<=horizonDays)out.push({slug:slug,short:SHORT[slug]||slug,acc:ACC[slug]||"#531639",est:s.est,item:it,days:Math.round(days)});
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
  return {TEMPLATE:TEMPLATE,DATES:DATES,SHORT:SHORT,ACC:ACC,TRACKS:TRACKS,
    schedule:schedule,next:next,fmt:fmt,status:status,
    linkFor:linkFor,loadDone:loadDone,setDone:setDone,agendaOfTheWeek:agendaOfTheWeek,completed:completed,
    loadTasks:loadTasks,saveTask:saveTask,removeTask:removeTask,newTaskId:newTaskId};
})();
