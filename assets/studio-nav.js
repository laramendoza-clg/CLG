/* CapLink Studio — shared navigation bar.
   Include on any Studio page with:
   <script src="(path)/assets/studio-nav.js?v=1"></script>
   Links resolve relative to this script's location, so it works from any
   directory depth. Deliberately NOT used on the agenda viewer (/agenda/),
   which is shared outside CapLink. */
(function(){
  var src=(document.currentScript&&document.currentScript.src)||"";
  var base=src.replace(/assets\/studio-nav\.js.*$/,"");
  if(!base)return;
  var LINKS=[
    ["","Home"],
    ["event/?e=dubai-2026","Dubai 2026"],
    ["event/?e=newyork-2026","New York 2026"],
    ["event/?e=ai-data-breakfast-2026","AI / Data 2026"],
    ["event/?e=europe-2027","Europe 2027"],
    ["event/?e=mit-2027","MIT 2027"]
  ];
  var css=
    "#studio-nav{position:sticky;top:0;z-index:99999;display:flex;align-items:center;gap:22px;"+
      "height:58px;padding:0 20px;background:rgba(22,10,22,.97);border-bottom:1px solid rgba(255,255,255,.1);"+
      "font-family:'Raleway',system-ui,sans-serif;-webkit-font-smoothing:antialiased}"+
    "#studio-nav .sn-brand{display:flex;align-items:center;text-decoration:none;flex:0 0 auto}"+
    "#studio-nav .sn-brand img{height:28px;width:auto;display:block}"+
    "#studio-nav .sn-links{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}"+
    "#studio-nav .sn-links::-webkit-scrollbar{display:none}"+
    "#studio-nav .sn-links a{white-space:nowrap;text-decoration:none;font-size:12.5px;font-weight:600;"+
      "letter-spacing:.06em;color:rgba(255,255,255,.78);padding:9px 13px;border-radius:6px}"+
    "#studio-nav .sn-links a:hover{color:#fff;background:rgba(255,255,255,.1)}"+
    "#studio-nav .sn-links a.on{color:#fff;background:rgba(255,255,255,.16)}"+
    "@media print{#studio-nav{display:none!important}}";
  var st=document.createElement("style");
  st.textContent=css;
  document.head.appendChild(st);
  var here=location.pathname.replace(/index\.html$/,"")+location.search;
  var nav=document.createElement("nav");
  nav.id="studio-nav";
  var links=LINKS.map(function(l){
    var href=base+l[0];
    var on="";
    try{var u=new URL(href,location.href);on=(u.pathname.replace(/index\.html$/,"")+u.search)===here?' class="on"':"";}catch(_){}
    return "<a"+on+' href="'+href+'">'+l[1]+"</a>";
  }).join("");
  var LOGO="https://images.squarespace-cdn.com/content/5dc9f095a5705651ea40e08b/7a1e92c4-a7c8-4d34-b62e-bd2bbaef4550/CapLink+Studio+-+logo.png?content-type=image%2Fpng";
  nav.innerHTML='<a class="sn-brand" href="'+base+'"><img src="'+LOGO+'" alt="CapLink Studio"></a><div class="sn-links">'+links+"</div>";
  function mount(){document.body.insertBefore(nav,document.body.firstChild);}
  if(document.body)mount();else document.addEventListener("DOMContentLoaded",mount);
})();
