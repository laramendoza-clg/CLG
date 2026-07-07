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
    ["","Studio"],
    ["agendas/","Agendas"],
    ["sponsor-generator/","Sponsor Section"],
    ["logo-sizes/","Logo Sizes"],
    ["dubai-pcs-card/","Attending Card"],
    ["speaker-card/","Speaker Card"]
  ];
  var css=
    "#studio-nav{position:sticky;top:0;z-index:99999;display:flex;align-items:center;gap:20px;"+
      "height:46px;padding:0 18px;background:rgba(22,10,22,.97);border-bottom:1px solid rgba(255,255,255,.09);"+
      "font-family:'Raleway',system-ui,sans-serif;-webkit-font-smoothing:antialiased}"+
    "#studio-nav .sn-brand{display:flex;align-items:center;text-decoration:none;flex:0 0 auto}"+
    "#studio-nav .sn-brand img{height:22px;width:auto;display:block}"+
    "#studio-nav .sn-links{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}"+
    "#studio-nav .sn-links::-webkit-scrollbar{display:none}"+
    "#studio-nav .sn-links a{white-space:nowrap;text-decoration:none;font-size:10.5px;font-weight:600;"+
      "letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.62);padding:6px 11px;border-radius:5px}"+
    "#studio-nav .sn-links a:hover{color:#fff;background:rgba(255,255,255,.08)}"+
    "#studio-nav .sn-links a.on{color:#fff;background:rgba(255,255,255,.12)}"+
    "@media print{#studio-nav{display:none!important}}";
  var st=document.createElement("style");
  st.textContent=css;
  document.head.appendChild(st);
  var here=location.pathname.replace(/index\.html$/,"");
  var nav=document.createElement("nav");
  nav.id="studio-nav";
  var links=LINKS.map(function(l){
    var href=base+l[0];
    var on="";
    try{on=(new URL(href,location.href)).pathname===here?' class="on"':"";}catch(_){}
    return "<a"+on+' href="'+href+'">'+l[1]+"</a>";
  }).join("");
  var LOGO="https://images.squarespace-cdn.com/content/5dc9f095a5705651ea40e08b/7a1e92c4-a7c8-4d34-b62e-bd2bbaef4550/CapLink+Studio+-+logo.png?content-type=image%2Fpng";
  nav.innerHTML='<a class="sn-brand" href="'+base+'"><img src="'+LOGO+'" alt="CapLink Studio"></a><div class="sn-links">'+links+"</div>";
  function mount(){document.body.insertBefore(nav,document.body.firstChild);}
  if(document.body)mount();else document.addEventListener("DOMContentLoaded",mount);
})();
