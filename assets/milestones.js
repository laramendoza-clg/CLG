/* CapLink Studio — the standard event production timeline.
   ONE place to define the rules: each milestone is "w" weeks before the
   event date. Every event page and the dashboard compute real calendar
   deadlines from these. Change the numbers here and every event updates. */
window.StudioMilestones=(function(){
  var TEMPLATE=[
    {w:16,label:"Event website live · registration open",detail:"Landing page up, save-the-date sent, first outreach wave"},
    {w:12,label:"Brand kit & sponsor tiers locked",detail:"Event lockup, colours, theme; sponsor packages confirmed"},
    {w:10,label:"Preliminary agenda published",detail:"Sessions and timings live on the agenda share link"},
    {w:8,label:"Speaker photos & bios collected",detail:"Every confirmed speaker: square headshot, title, firm, short bio"},
    {w:8,label:"Social campaign starts",detail:"“I'm Attending” and speaker announcement cards rolling out"},
    {w:6,label:"Print designs DONE",detail:"Lanyards, badges, signage, staging/backdrop, banners — final artwork approved"},
    {w:5,label:"Print sent to vendor & ordered",detail:"All print and staging orders placed; delivery dates confirmed in writing"},
    {w:4,label:"Event app content complete",detail:"Agenda, speakers, sponsors loaded into the app and tested"},
    {w:3,label:"Holding slides & screen content designed",detail:"Walk-in loop, session holding slides, sponsor reel"},
    {w:2,label:"Final agenda published · last reprint window",detail:"Late changes close; vendor deliveries reconfirmed"},
    {w:1,label:"Show-ready",detail:"Slides loaded, run-of-show locked, staging plan final, team briefed"},
    {w:0,label:"Event day",detail:""}
  ];
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
    return {event:ev,est:!!e.est,items:TEMPLATE.map(function(m){
      return {w:m.w,label:m.label,detail:m.detail,date:new Date(ev.getTime()-m.w*7*864e5)};
    })};
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
  return {TEMPLATE:TEMPLATE,DATES:DATES,schedule:schedule,next:next,fmt:fmt,status:status};
})();
