/* CovidWatch front end. Validation rules mirror src/validators.js */
var RX={
name:/^[A-Za-z][A-Za-z .'’-]{2,29}$/,
email:/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
phone:/^[6-9]\d{9}$/,
pass:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,32}$/,
comment:/^(?!\s*$)[^<>]{3,200}$/};
var MSG={name:"Enter 3–30 letters; spaces, dots and hyphens are allowed.",email:"Enter an email like name@example.com.",phone:"Enter 10 digits starting with 6, 7, 8 or 9.",pass:"Use 8–32 characters with upper, lower, digit and symbol.",comment:"Write 3–200 characters without < or >."};

/* ===== helpers ===== */
function $(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(n){return Number(n).toLocaleString("en-IN")}
function api(p,m,b){return fetch("/api/"+p,{method:m||"GET",headers:b?{"Content-Type":"application/json"}:{},body:b?JSON.stringify(b):undefined,credentials:"same-origin"}).then(function(r){return r.json().then(function(j){if(j&&typeof j==="object")j.ok=r.ok;return j},function(){return{ok:r.ok}})},function(){return{ok:false,error:"Cannot reach the server. Start it with npm start and open http://localhost:3000."}})}
function ago(d){var s=(Date.now()-new Date(d))/1000;if(isNaN(s))return"";if(s<60)return"just now";if(s<3600)return Math.floor(s/60)+" min ago";if(s<86400)return Math.floor(s/3600)+" h ago";if(s<604800)return Math.floor(s/86400)+" d ago";return new Date(d).toLocaleDateString()}
function avatar(n,big){var h=0;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%360;return'<span class="av'+(big?" big":"")+'" style="background:hsl('+h+',55%,45%)">'+esc(n.charAt(0).toUpperCase())+"</span>"}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show")},2600)}
function note(id,t,good){var e=$(id);e.hidden=false;e.textContent=t;e.className="msg "+(good?"okm":"errm")}
function tile(ic,v,l){return'<div class="card tile"><span class="ic">'+ic+"</span><div><b>"+v+"</b><span>"+l+"</span></div></div>"}
var me=null,POSTS=[],DATA=[],V=["feed","stats","tips","me","login","register","lab"];
function go(v){if(location.hash==="#"+v)route();else location.hash="#"+v}

/* ===== user state (header, menu) ===== */
function setUser(u){me=u;$("auth-in").hidden=!u;$("auth-out").hidden=!!u;$("m-me").hidden=!u;
if(u){$("tav").innerHTML=avatar(u.name);$("tnm").textContent=u.name.split(" ")[0];$("tcnt").textContent=u.commentCount}}
function refreshMe(){return api("me").then(function(j){setUser(j.user||null)})}

/* ===== router ===== */
function route(){var v=(location.hash||"#feed").slice(1);if(V.indexOf(v)<0)v="feed";
if(v==="me"&&!me)v="login";if((v==="login"||v==="register")&&me)v="feed";
document.querySelectorAll(".view").forEach(function(x){x.hidden=x.id!=="v-"+v});
document.querySelectorAll("#menu a").forEach(function(a){a.classList.toggle("on",a.dataset.v===v)});
if(v==="feed")loadFeed();if(v==="stats")loadStats();if(v==="me")loadMe();window.scrollTo(0,0)}
window.addEventListener("hashchange",route);

/* ===== community feed ===== */
function postHTML(x,by,own){return'<article class="card post"><div class="ph">'+avatar(by)+"<div><b>"+esc(by)+'</b><div class="note" title="'+esc(new Date(x.at).toLocaleString())+'">'+ago(x.at)+"</div></div>"+(own?'<button class="del" data-id="'+x.id+'" title="Delete comment" aria-label="Delete comment">🗑️</button>':"")+"</div><p>"+esc(x.t)+"</p></article>"}
function renderComposer(){var c=$("composer");
if(!me){c.innerHTML='<p class="join">Join the conversation. <a href="#login">Log in</a> or <a href="#register">create an account</a> to post a comment.</p>';return}
c.innerHTML='<div class="row">'+avatar(me.name)+'<textarea id="ct" rows="2" maxlength="200" placeholder="What’s on your mind, '+esc(me.name.split(" ")[0])+'?"></textarea></div><div class="row end"><span class="note" id="cc">0 / 200</span><button class="btn" id="csub">Post</button></div><div class="err" id="e-ct"></div>';
$("ct").oninput=function(){$("cc").textContent=this.value.length+" / 200"};
$("csub").onclick=function(){var v=$("ct").value;
if(!RX.comment.test(v)){$("ct").classList.add("bad");$("e-ct").textContent=MSG.comment;return}
api("comments","POST",{text:v}).then(function(j){if(j.ok){toast("Comment posted");refreshMe();loadFeed();side()}else $("e-ct").textContent=j.error})}}
function renderPosts(){var q=$("gs").value.trim().toLowerCase();
var l=POSTS.filter(function(x){return!q||x.t.toLowerCase().indexOf(q)>-1||x.by.toLowerCase().indexOf(q)>-1});
$("posts").innerHTML=l.length?l.map(function(x){return postHTML(x,x.by,me&&x.uid===me.id)}).join(""):'<div class="card empty">'+(q?"No comments match your search.":"No comments yet. Be the first to post!")+"</div>"}
function loadFeed(){renderComposer();api("comments").then(function(c){POSTS=Array.isArray(c)?c:[];renderPosts()});side()}
function side(){api("overview").then(function(o){if(o.members===undefined)return;$("side").innerHTML=tile("👥",fmt(o.members),"Members")+tile("💬",fmt(o.comments),"Comments")})}
$("gs").oninput=function(){if(location.hash&&location.hash!=="#feed")go("feed");else renderPosts()};
function del(e){var b=e.target.closest(".del");if(!b||!confirm("Delete this comment?"))return;
api("comments/"+b.dataset.id,"DELETE").then(function(j){if(j.ok){toast("Comment deleted");refreshMe();side();route()}else toast(j.error||"Could not delete")})}
$("posts").onclick=del;$("mylist").onclick=del;

/* ===== my activity (count + history) ===== */
function loadMe(){if(!me)return;
$("pf").innerHTML=avatar(me.name,1)+"<div><h2>"+esc(me.name)+'</h2><div class="note">'+esc(me.email)+"</div></div>";
api("my/comments").then(function(c){c=Array.isArray(c)?c:[];
$("mstats").innerHTML=tile("💬",c.length,"Comments posted")+tile("🕒",c.length?ago(c[0].at):"–","Last activity")+tile("📅",new Date(me.since).toLocaleDateString(),"Member since");
$("hist").textContent="Comment history ("+c.length+")";
$("mylist").innerHTML=c.length?c.map(function(x){return postHTML(x,me.name,true)}).join(""):'<div class="card empty">You haven’t posted yet. Visit the <a href="#feed">community feed</a> to write your first comment.</div>'})}

/* ===== statistics ===== */
function loadStats(){api("stats").then(function(r){DATA=(Array.isArray(r)?r:[]).map(function(x){return[x.country,+x.cases,+x.recovered,+x.deaths]});renderStats()})}
function renderStats(){var T=0,R=0,D=0;DATA.forEach(function(r){T+=r[1];R+=r[2];D+=r[3]});var A=T-R-D;
$("tiles").innerHTML=tile("🌍",fmt(T),"Total cases")+tile("💚",fmt(R),"Recovered")+tile("🟠",fmt(A),"Active")+tile("🖤",fmt(D),"Deaths");
var rp=T?R/T*100:0,ap=T?A/T*100:0;
$("donut").style.background="conic-gradient(var(--ok) 0 "+rp+"%,var(--warn) "+rp+"% "+(rp+ap)+"%,var(--bad) "+(rp+ap)+"% 100%)";
$("legend").innerHTML='<li><i style="background:var(--ok)"></i>Recovered '+rp.toFixed(1)+'%</li><li><i style="background:var(--warn)"></i>Active '+ap.toFixed(1)+'%</li><li><i style="background:var(--bad)"></i>Deaths '+(T?100-rp-ap:0).toFixed(1)+"%</li>";
var q=$("q").value.trim().toLowerCase(),k=$("srt").value;
var rows=DATA.filter(function(r){return r[0].toLowerCase().indexOf(q)>-1});
rows.sort(function(a,b){return k==="country"?a[0].localeCompare(b[0]):k==="deaths"?b[3]-a[3]:b[1]-a[1]});
$("tb").innerHTML=rows.map(function(r){return"<tr><td>"+esc(r[0])+"</td><td>"+fmt(r[1])+"</td><td>"+fmt(r[2])+"</td><td>"+fmt(r[3])+"</td><td>"+fmt(r[1]-r[2]-r[3])+"</td></tr>"}).join("");
$("none").hidden=rows.length>0;
var mx=Math.max.apply(null,DATA.map(function(r){return r[1]}).concat([1]));
$("bars").innerHTML=rows.map(function(r){return'<div class="row2"><span>'+esc(r[0])+'</span><div class="t"><div class="f" style="width:'+r[1]/mx*100+'%"></div></div><span>'+(r[1]/1e6).toFixed(1)+"M</span></div>"}).join("")}
$("q").oninput=renderStats;$("srt").onchange=renderStats;

/* ===== register / login / logout ===== */
function chk(id,rule){var el=$(id),ok=RX[rule].test(el.value);el.classList.toggle("bad",!ok&&el.value!=="");$("e-"+id).textContent=ok||!el.value?"":MSG[rule];return ok}
$("rn").oninput=function(){chk("rn","name")};$("re").oninput=function(){chk("re","email")};$("rp").oninput=function(){chk("rp","phone")};
$("rw").oninput=function(){var v=this.value,sc=0;if(v.length>=8)sc++;if(/[a-z]/.test(v)&&/[A-Z]/.test(v))sc++;if(/\d/.test(v))sc++;if(/[^\w\s]/.test(v))sc++;
var m=$("mt");m.style.width=sc*25+"%";m.style.background=sc<3?"var(--bad)":sc<4?"var(--warn)":"var(--ok)";chk("rw","pass")};
$("rsub").onclick=function(){
var a=chk("rn","name"),b=chk("re","email"),c=chk("rp","phone"),d=chk("rw","pass"),same=$("rw").value===$("rc").value;
$("e-rc").textContent=same?"":"Passwords do not match.";
if(!(a&&b&&c&&d&&same)){note("rmsg","Fix the highlighted fields and try again.",0);return}
var em=$("re").value.trim(),pw=$("rw").value;
api("register","POST",{name:$("rn").value,email:em,phone:$("rp").value,password:pw,confirm:$("rc").value}).then(function(j){
if(!j.ok){note("rmsg",j.error,0);return}
api("login","POST",{email:em,password:pw}).then(function(l){$("rf").reset();$("mt").style.width="0";
if(l.ok){setUser(l.user);go("feed");toast("Welcome to CovidWatch!")}else{go("login");toast(j.message)}})})};
$("lsub").onclick=function(){var em=$("le").value.trim();
if(!RX.email.test(em)||!$("lw").value){note("lmsg","Enter a valid email and your password.",0);return}
api("login","POST",{email:em,password:$("lw").value}).then(function(j){
if(j.ok){$("lw").value="";$("lmsg").hidden=true;setUser(j.user);go("feed");toast(j.message)}else note("lmsg",j.error,0)})};
$("lout").onclick=function(){api("logout","POST",{}).then(function(){setUser(null);go("feed");toast("You have been logged out")})};

/* ===== start: ask the server who is logged in, then show the right view ===== */
api("me").then(function(j){setUser(j.user||null);route()});

/* test lab: [id, field, technique, input, expected] */
var TC=[
["TC01","name","EP","Rahul Patil",1],["TC02","name","BVA (min 3)","Raj",1],["TC03","name","BVA (below min)","Ra",0],["TC04","name","BVA (max 30)","A"+"b".repeat(29),1],["TC05","name","BVA (above max)","A"+"b".repeat(30),0],["TC06","name","EP (digits)","Rahul123",0],
["TC07","email","EP","user@example.com",1],["TC08","email","EP (no @)","userexample.com",0],["TC09","email","EP (no TLD)","user@example",0],["TC10","email","EG (spaces)","us er@mail.com",0],
["TC11","phone","EP","9876543210",1],["TC12","phone","BVA (9 digits)","987654321",0],["TC13","phone","BVA (11 digits)","98765432101",0],["TC14","phone","EP (starts with 5)","5876543210",0],["TC15","phone","EG (letters)","98765abcde",0],
["TC16","pass","EP","Covid@2026",1],["TC17","pass","BVA (7 chars)","Ab1@xyz",0],["TC18","pass","EP (no symbol)","Covid2026",0],["TC19","pass","EP (no upper)","covid@2026",0],["TC20","pass","BVA (33 chars)","Aa1@"+"x".repeat(29),0],
["TC21","comment","EP","Wash your hands often.",1],["TC22","comment","EG (XSS)","<script>alert(1)</script>",0],["TC23","comment","EG (blank)","     ",0],["TC24","comment","BVA (201 chars)","a".repeat(201),0]];
$("run").onclick=function(){var p=0;
$("tr").innerHTML=TC.map(function(t){var act=RX[t[1]].test(t[3])?1:0,ok=act===t[4];if(ok)p++;
var shown=t[3].length>28?t[3].slice(0,25)+"… ("+t[3].length+")":t[3];
return"<tr><td>"+t[0]+"</td><td>"+t[1]+"</td><td>"+t[2]+"</td><td><code>"+esc(shown)+"</code></td><td>"+(t[4]?"Accept":"Reject")+"</td><td>"+(act?"Accept":"Reject")+"</td><td class='"+(ok?"pass":"fail")+"'>"+(ok?"Pass":"Fail")+"</td></tr>"}).join("");
var e=$("sum");e.hidden=false;e.innerHTML="<b>"+p+" of "+TC.length+" passed</b> ("+Math.round(p/TC.length*100)+"%). Failed: "+(TC.length-p)+". Verdict: "+(p===TC.length?"Accepted – all validation rules behave as specified.":"Not accepted – review the failed rows.")};
