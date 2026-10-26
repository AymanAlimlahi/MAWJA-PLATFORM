/* ===== Settings =====
   FORM_ENDPOINT: paste a Formspree (or similar) URL here once the site is hosted, e.g. "https://formspree.io/f/xxxxxx".
   Left empty, the form opens the visitor's email app with the message pre-filled. */
var FORM_ENDPOINT = "";
var CONTACT_EMAIL = "contact@mawjaagency.com";
/* WHATSAPP_NUMBER: international format, digits only, no + or spaces (e.g. 212612345678). */
var WHATSAPP_NUMBER = "212693490335";

(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var body = document.body;

  /* ---------- Preloader ---------- */
  var intro = $('#intro'), introDone = false, onIntroDone = [];
  function finishIntro(){
    if(introDone) return; introDone = true;
    if(intro){ intro.remove(); intro = null; }
    body.classList.remove('locked');
    onIntroDone.forEach(function(f){ try{f()}catch(e){} });
  }
  if(intro && !reduce){
    body.classList.add('locked');
    var c = $('#count'), t0 = performance.now();
    (function tick(now){
      var p = Math.min(1,(now - t0)/2100), e = 1 - Math.pow(1-p,3);
      if(c) c.textContent = String(Math.round(e*100)).padStart(3,'0');
      if(p < 1 && intro) requestAnimationFrame(tick);
    })(t0);
    intro.addEventListener('animationend',function(e){ if(e.animationName==='introOut') finishIntro(); });
    intro.addEventListener('click',function(){ intro.style.animation='introOut .6s cubic-bezier(.76,0,.24,1) forwards'; });
    setTimeout(finishIntro, 3500);
  } else finishIntro();

  /* ---------- WebGL waves ---------- */
  (function(){
    var cv = $('#gl'); if(!cv) return;
    var gl = cv.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});
    if(!gl){ cv.remove(); return; }
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision highp float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;uniform float band;',
      'const vec3 NAVY=vec3(.016,.004,.192);const vec3 TURQ=vec3(.008,.925,.824);const vec3 ORA=vec3(.996,.42,0.);const vec3 YEL=vec3(.992,.922,.161);',
      'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
      'float wave(float x,float fi){',
      '  float y=sin(x*(2.2+fi*.7)+t*(.42+fi*.16)+fi*1.9)*.07;',
      '  y+=sin(x*(5.1-fi*.9)-t*(.55+fi*.1)+fi*3.1)*.025;',
      '  y+=exp(-pow((x-m.x)*3.2,2.))*(m.y-.35)*.16;',
      '  return y;}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/r; float yb=gl_FragCoord.y/band;',
      '  vec3 col=NAVY;',
      '  col+=TURQ*.10*exp(-length((uv-vec2(.88,.92))*vec2(r.x/r.y,1.))*2.2);',
      '  col+=ORA*.05*exp(-length((uv-vec2(.05,.55))*vec2(r.x/r.y,1.))*2.6);',
      '  for(int i=0;i<3;i++){',
      '    float fi=float(i);',
      '    float base=1.0-fi*.31;',
      '    float y=base+wave(uv.x,fi)*1.25;',
      '    float d=y-yb;',
      '    float aa=1.5/band;',
      '    float e=smoothstep(-aa,aa,d);',
      '    vec3 c=i==0?TURQ:(i==1?mix(ORA,vec3(1.,.6,.1),uv.x*.6):YEL);',
      '    c*=1.-.22*clamp(d*2.2,0.,1.);',
      '    c+=.18*smoothstep(.06,0.,abs(d))*step(0.,d);',
      '    col=mix(col,c,e);',
      '  }',
      '  col+=(h(gl_FragCoord.xy+fract(t)*91.)-.5)*.045;',
      '  gl_FragColor=vec4(col,1.);',
      '}'].join('\n');
    function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
    var v=sh(gl.VERTEX_SHADER,vs), f=sh(gl.FRAGMENT_SHADER,fs);
    if(!v||!f){ cv.remove(); return; }
    var pr=gl.createProgram(); gl.attachShader(pr,v); gl.attachShader(pr,f); gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){ cv.remove(); return; }
    gl.useProgram(pr);
    var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var uR=gl.getUniformLocation(pr,'r'),uT=gl.getUniformLocation(pr,'t'),uM=gl.getUniformLocation(pr,'m'),uB=gl.getUniformLocation(pr,'band');
    var hero=$('.hero'), heroIn=$('.hero-in'), dpr=Math.min(window.devicePixelRatio||1,1.5);
    var mx=.5,my=.35,tx=.5,ty=.35,visible=true,start=performance.now(),bandPx=300;
    $('.fallback').style.display='none';
    function size(){
      var w=hero.clientWidth,hh=hero.clientHeight;
      cv.width=Math.round(w*dpr); cv.height=Math.round(hh*dpr);
      gl.viewport(0,0,cv.width,cv.height);
      bandPx=parseFloat(getComputedStyle(heroIn).paddingBottom)||300;
    }
    size(); addEventListener('resize',size);
    hero.addEventListener('pointermove',function(e){var rc=hero.getBoundingClientRect();tx=(e.clientX-rc.left)/rc.width;ty=1-(e.clientY-rc.top)/rc.height;});
    hero.addEventListener('pointerleave',function(){tx=.5;ty=.35;});
    if('IntersectionObserver' in window) new IntersectionObserver(function(en){visible=en[0].isIntersecting; if(visible) requestAnimationFrame(draw);}).observe(hero);
    function draw(now){
      mx+=(tx-mx)*.06; my+=(ty-my)*.06;
      gl.uniform2f(uR,cv.width,cv.height); gl.uniform1f(uT,reduce?2.0:(now-start)/1000);
      gl.uniform2f(uM,mx,my); gl.uniform1f(uB,bandPx*dpr*0.82);
      gl.drawArrays(gl.TRIANGLES,0,3);
      if(visible && !reduce && !document.hidden) requestAnimationFrame(draw);
    }
    document.addEventListener('visibilitychange',function(){ if(!document.hidden && visible) requestAnimationFrame(draw); });
    requestAnimationFrame(draw);
  })();

  /* ---------- Language ---------- */
  var EN={
    introTag:"Marketing & Growth Agency",
    navServices:"Services",navMethod:"Method",navWhy:"Why Mawja",navContact:"Contact",navCta:"Start a project",
    heroEyebrow:"Marketing & growth agency · Rabat, Morocco",
    heroTitle:"Ride the <em>wave</em> of growth.",
    heroLead:"Strategy, content and branding for ambitious brands in Morocco and across Africa. We build growth with method, then we measure it.",
    heroCta1:"Start a project",heroCta2:"Our services",scroll:"Scroll",
    t1:"Growth strategy",t2:"Social media",t3:"Video content",t4:"Branding",t5:"Visual identity",t6:"Acquisition",t7:"Community management",t8:"Design",
    manifesto:"Mawja means <em>wave</em>. We create the momentum that carries ambitious brands further, with a clear strategy, content that sticks and a design people recognise at first glance.",
    sig:"Mounia El Alaoui & Mustapha, founders",
    svcEyebrow:"Our services",svcTitle:"Three crafts, one wave.",
    svcLead:"From strategy to the published visual: one point of contact, one coherent vision, results you can follow.",
    s1k:"Growth",s1t:"Marketing & growth strategy",s1p:"A clear growth plan built on your numbers, your market and your business goals. Then the campaigns that put it into action.",
    s1a:"Audit & positioning",s1b:"Acquisition plan",s1d:"KPI tracking",
    s2k:"Audience",s2t:"Social media & content",s2p:"Content that stops the scroll and an editorial line that grows your community, week after week.",
    s2a:"Editorial line",s2b:"Video & visuals",s2c:"Social media management",s2d:"Monthly reporting",
    s3k:"Identity",s3t:"Branding & design",s3p:"A strong, consistent identity, from logo to guidelines, so people recognise you at first glance on every channel.",
    s3a:"Logo & identity",s3b:"Brand charter",s3c:"Print & digital",
    mEyebrow:"Our method",mTitle:"From idea to growth, in four steps.",
    mLead:"A simple, transparent process. At every step you know what we do, why we do it and what it brings.",
    m1t:"Diagnosis",m1p:"We analyse your brand, your market, your competitors and your current numbers.",
    m2t:"Strategy",m2p:"We set the goals, the channels and the action plan, with a clear budget.",
    m3t:"Execution",m3p:"Content, campaigns, design: we produce and launch, with you in the loop.",
    m4t:"Measure & optimise",m4p:"We track results, adjust, and scale what works.",
    wEyebrow:"Why Mawja",wTitle:"What makes us different.",
    wLead:"A human-sized agency, built for brands that want to grow in Morocco and French-speaking Africa.",
    bk:"Our promise",bt:"An agency that knows <em>your market</em>, from Rabat to Abidjan.",
    p1t:"Rooted in Morocco",p1p:"Real hands-on experience in e-commerce and marketing across Moroccan and African markets.",
    p2t:"Results-driven",p2p:"Every action has a measurable goal. We show you what works, and what doesn't.",
    p3t:"A direct point of contact",p3p:"You work with the founders, not a middleman. Fast answers, fast decisions.",
    p4t:"Bilingual FR / EN",p4p:"Content and campaigns designed to speak to your customers, in French and in English.",
    r1:"CEO & co-founder",b1:"Marketing and account manager on e-commerce and B2B projects in Morocco and Africa.",
    r2:"Co-founder",b2:"Co-founder of Mawja, he leads the agency's strategy and growth alongside Mounia.",
    cEyebrow:"Contact",cTitle:"Ready to catch <em>the wave</em>?",
    cLead:"Tell us about your brand and your goals. We'll get back to you quickly with a first concrete idea.",
    cMail:"Or email us directly",copy:"Copy",copied:"Copied ✓",loc:"Rabat, Morocco",
    fName:"Full name",fEmail:"Email",fCompany:"Company / brand",fPhone:"Phone / WhatsApp",fNeed:"You need…",
    n1:"Strategy & growth",n2:"Social media & content",n3:"Branding & design",n5:"Website",
    fMsg:"Your project",fMsgPh:"A few words about your brand, your goals and your timeline.",fSend:"Send message",
    fTitle:"Ride the <em>wave</em>.",waTip:"Chat with us on WhatsApp",waBtn:"Message us on WhatsApp",
    errReq:"Please fill in your name, a valid email and a few words about your project.",
    sending:"Sending…",sent:"Thank you! Your message has been sent. We'll get back to you soon.",
    mailto:"Your email app is opening with your message ready. If nothing opens, write to us at "+CONTACT_EMAIL+".",
    sendErr:"The message could not be sent. Please write to us at "+CONTACT_EMAIL+"."
  };
  var FR={
    copied:"Copiée ✓",
    errReq:"Merci d'indiquer votre nom, un email valide et quelques mots sur votre projet.",
    sending:"Envoi en cours…",sent:"Merci ! Votre message a bien été envoyé. On revient vers vous très vite.",
    mailto:"Votre messagerie s'ouvre avec votre message prêt à envoyer. Si rien ne s'ouvre, écrivez-nous à "+CONTACT_EMAIL+".",
    sendErr:"Le message n'a pas pu être envoyé. Écrivez-nous à "+CONTACT_EMAIL+"."
  };
  $$('[data-i18n],[data-i18n-html]').forEach(function(el){
    var k=el.getAttribute('data-i18n')||el.getAttribute('data-i18n-html');
    if(!(k in FR)) FR[k]=el.hasAttribute('data-i18n-html')?el.innerHTML:el.textContent;
  });
  $$('[data-i18n-ph]').forEach(function(el){ FR[el.getAttribute('data-i18n-ph')]=el.placeholder; });
  var lang='fr', D=function(k){return (lang==='en'?EN:FR)[k]};
  var onLang=[];
  function applyLang(l){
    lang=l; document.documentElement.lang=l; var d=l==='en'?EN:FR;
    $$('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n'); if(d[k]!=null) el.textContent=d[k];});
    $$('[data-i18n-html]').forEach(function(el){var k=el.getAttribute('data-i18n-html'); if(d[k]!=null) el.innerHTML=d[k];});
    $$('[data-i18n-ph]').forEach(function(el){var k=el.getAttribute('data-i18n-ph'); if(d[k]!=null) el.placeholder=d[k];});
    $$('.lang button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.lang===l?'true':'false');});
    $('#totop').setAttribute('aria-label',l==='en'?'Back to top':'Retour en haut');
    onLang.forEach(function(f){ try{f()}catch(e){} });
  }
  function setLang(l){
    if(l===lang) return;
    try{localStorage.setItem('mawja-lang',l);}catch(e){}
    if(document.startViewTransition && !reduce) document.startViewTransition(function(){applyLang(l)}); else applyLang(l);
  }
  $$('.lang button').forEach(function(x){x.addEventListener('click',function(){setLang(x.dataset.lang)})});
  try{ if(localStorage.getItem('mawja-lang')==='en') applyLang('en'); }catch(e){}

  /* ---------- Mobile menu ---------- */
  var burger=$('#burger'), menu=$('#menu'), lenis=null;
  function setMenu(open){
    menu.hidden=!open; burger.setAttribute('aria-expanded',String(open));
    body.classList.toggle('locked',open);
    if(lenis){ open?lenis.stop():lenis.start(); }
    if(open && window.gsap && !reduce) gsap.from($$('#menu > *'),{yPercent:60,opacity:0,stagger:.06,duration:.7,ease:'expo.out'});
  }
  burger.addEventListener('click',function(){setMenu(menu.hidden)});
  addEventListener('keydown',function(e){ if(e.key==='Escape' && !menu.hidden) setMenu(false); });

  /* ---------- Smooth anchors ---------- */
  function goTo(target){
    if(lenis) lenis.scrollTo(target,{offset:target===0?0:-20,duration:1.4});
    else if(target===0) scrollTo({top:0,behavior:reduce?'auto':'smooth'});
    else target.scrollIntoView({behavior:reduce?'auto':'smooth'});
  }
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(id.length<2) return;
      var el=document.getElementById(id.slice(1)); if(!el) return;
      e.preventDefault(); if(!menu.hidden) setMenu(false);
      goTo(id==='#accueil'?0:el);
    });
  });

  /* ---------- Back to top + nav hide ---------- */
  var totop=$('#totop'), ring=$('#ring'), bar=$('#top-bar'), lastY=0;
  function onScroll(){
    var y=window.scrollY||document.documentElement.scrollTop, max=document.documentElement.scrollHeight-innerHeight;
    totop.classList.toggle('show', y > innerHeight*.75);
    ring.style.strokeDashoffset = String(201 - 201*Math.min(1,max>0?y/max:0));
    bar.classList.toggle('scrolled', y > 40);
    lastY=y;
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  totop.addEventListener('click',function(){ goTo(0); });

  /* ---------- Copy email ---------- */
  var copy=$('#copy'), mail=$('#mail');
  copy.addEventListener('click',function(){
    var done=function(){copy.textContent=D('copied'); setTimeout(function(){copy.textContent=D('copy')},1800)};
    var sel=function(){var r=document.createRange(); r.selectNodeContents(mail); var s=getSelection(); s.removeAllRanges(); s.addRange(r);};
    try{navigator.clipboard.writeText(mail.textContent).then(done,sel);}catch(e){sel();}
  });

  /* ---------- Contact form ---------- */
  var form=$('#form'), status=$('#status');
  function say(msg,cls){status.textContent=msg; status.className='status'+(cls?' '+cls:'');}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=$('#f-name').value.trim(), email=$('#f-email').value.trim(), msg=$('#f-msg').value.trim();
    if(!name || !$('#f-email').checkValidity() || !email || !msg){ say(D('errReq'),'err'); (!name?$('#f-name'):(!email||!$('#f-email').checkValidity())?$('#f-email'):$('#f-msg')).focus(); return; }
    var needs=$$('input[name="need"]:checked').map(function(x){return x.value});
    var data={name:name,email:email,company:$('#f-company').value.trim(),phone:$('#f-phone').value.trim(),needs:needs.join(', '),message:msg};
    if(FORM_ENDPOINT){
      say(D('sending'));
      fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
        .then(function(r){ if(!r.ok) throw 0; say(D('sent'),'ok'); form.reset(); })
        .catch(function(){ say(D('sendErr'),'err'); });
    } else {
      var subject='Nouveau projet — '+(data.company||data.name);
      var text='Nom : '+data.name+'\nEmail : '+data.email+(data.company?'\nEntreprise : '+data.company:'')+(data.phone?'\nTéléphone : '+data.phone:'')+(data.needs?'\nBesoins : '+data.needs:'')+'\n\n'+data.message;
      say(D('mailto'),'ok');
      location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
    }
  });

  /* ---------- WhatsApp links ---------- */
  function waLinks(){
    var msg = lang==='en' ? "Hello Mawja Agency, I'd like to talk about a project." : "Bonjour Mawja Agency, je souhaite discuter d'un projet.";
    $$('[data-wa]').forEach(function(a){ a.href='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg); });
  }
  waLinks(); onLang.push(waLinks);

  /* ---------- Spotlight tiles ---------- */
  $$('.tile').forEach(function(t){
    t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect(); t.style.setProperty('--mx',(e.clientX-r.left)+'px'); t.style.setProperty('--my',(e.clientY-r.top)+'px');});
  });

  /* ---------- Motion layer (GSAP + ScrollTrigger + SplitText + Lenis) ---------- */
  function motion(){
    if(reduce || !window.gsap) return;
    var hasST=!!window.ScrollTrigger, hasSplit=!!window.SplitText;
    if(hasST) gsap.registerPlugin(ScrollTrigger);
    if(hasSplit) gsap.registerPlugin(SplitText);

    if(window.Lenis){
      try{
        lenis=new Lenis({duration:1.15,smoothWheel:true});
        if(hasST) lenis.on('scroll',ScrollTrigger.update);
        gsap.ticker.add(function(t){lenis.raf(t*1000)}); gsap.ticker.lagSmoothing(0);
        if(!introDone) lenis.stop();
      }catch(e){ lenis=null; }
    }

    /* Hero entrance, played when the preloader leaves */
    var heroTl=function(){
      if(lenis) lenis.start();
      var h1=$('#hero-title'), tl=gsap.timeline({defaults:{ease:'expo.out'}});
      if(hasSplit){
        var sp=SplitText.create(h1,{type:'lines,words,chars',mask:'lines',linesClass:'split-line'});
        tl.from(sp.chars,{yPercent:115,rotate:6,duration:1.1,stagger:.018,onComplete:function(){ try{sp.revert()}catch(e){} }});
      } else tl.from(h1,{y:60,duration:1});
      tl.from(['.hero .label','#hero-lead','#hero-cta .btn'],{y:30,opacity:0,duration:.9,stagger:.08},'-=.8')
        .from('.top .bar',{y:-30,opacity:0,duration:.9},'-=.9');
    };
    if(introDone) heroTl(); else onIntroDone.push(heroTl);

    /* Marquees: speed follows scroll velocity */
    var mqs=[$('#mq1'),$('#mq2')].map(function(el,i){
      el.classList.remove('css');
      var w=el.scrollWidth/2, x=i?-w:0, dir=i?1:-1;
      return {el:el,w:w,x:x,dir:dir};
    });
    var boost=0;
    if(lenis) lenis.on('scroll',function(l){ boost=Math.min(Math.abs(l.velocity||0)*.25,14); });
    gsap.ticker.add(function(){
      mqs.forEach(function(m){
        m.x += m.dir*(1.1+boost);
        if(m.x <= -m.w) m.x += m.w; if(m.x >= 0) m.x -= m.w;
        m.el.style.transform='translate3d('+m.x+'px,0,0)';
      });
      boost*=.92;
    });
    addEventListener('resize',function(){ mqs.forEach(function(m){ m.w=m.el.scrollWidth/2; }); });

    if(!hasST) return;

    /* Manifesto: words light up as you read */
    var mtl=null;
    function buildManifesto(){
      if(mtl){ mtl.scrollTrigger && mtl.scrollTrigger.kill(); mtl.kill(); }
      var p=$('#manifesto');
      var html=p.innerHTML.replace(/<em>(.*?)<\/em>/g,'\u0001$1\u0002');
      var out='', inEm=false;
      html.split(/(\s+)/).forEach(function(tok){
        if(/^\s+$/.test(tok)){ out+=tok; return; }
        var open=tok.indexOf('\u0001')>-1, close=tok.indexOf('\u0002')>-1;
        var clean=tok.replace(/[\u0001\u0002]/g,'');
        if(open) inEm=true;
        out+='<span class="w">'+(inEm?'<em>'+clean+'</em>':clean)+'</span>';
        if(close) inEm=false;
      });
      p.innerHTML=out;
      mtl=gsap.fromTo(p.querySelectorAll('.w'),{opacity:.18},{opacity:1,stagger:.06,ease:'none',
        scrollTrigger:{trigger:p,start:'top 82%',end:'bottom 45%',scrub:true}});
    }
    buildManifesto(); onLang.push(function(){ buildManifesto(); ScrollTrigger.refresh(); });

    /* Section titles */
    $$('.sec-head h2, .contact h2, .foot-top h2').forEach(function(h){
      gsap.from(h,{y:70,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:h,start:'top 88%'}});
    });

    /* Stacked service cards */
    var cards=$$('.card');
    cards.forEach(function(card,i){
      var next=cards[i+1]; if(!next) return;
      gsap.to(card,{scale:.9,filter:'brightness(.72)',ease:'none',
        scrollTrigger:{trigger:next,start:'top bottom',end:'top '+(110+(i+1)*22)+'px',scrub:true}});
    });
    cards.forEach(function(card){
      gsap.from(card.querySelectorAll('.chips li'),{y:20,opacity:0,stagger:.06,duration:.7,ease:'expo.out',scrollTrigger:{trigger:card,start:'top 70%'}});
    });

    /* Method: pinned horizontal scroll on wide screens */
    var mm=gsap.matchMedia();
    mm.add('(min-width: 900px)',function(){
      var track=$('#track'), prog=$('#mprog'); track.style.overflow='visible';
      var dist=function(){return Math.max(0,track.scrollWidth-track.parentElement.clientWidth)};
      gsap.set(prog,{scaleX:0});
      var tw=gsap.to(track,{x:function(){return -dist()},ease:'none',
        scrollTrigger:{trigger:'#method-pin',start:'top top',end:function(){return '+='+(dist()+innerHeight*.3)},pin:true,scrub:1,invalidateOnRefresh:true,
          onUpdate:function(s){gsap.set(prog,{scaleX:s.progress})}}});
      return function(){ tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(track,{clearProps:'x'}); track.style.overflow=''; gsap.set(prog,{scaleX:1}); };
    });
    mm.add('(max-width: 899px)',function(){
      $$('.panel').forEach(function(pn){ gsap.from(pn,{y:60,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:pn,start:'top 88%'}}); });
    });

    /* Bento + team reveal */
    ScrollTrigger.batch('.tile, .member',{start:'top 90%',onEnter:function(b){gsap.from(b,{y:60,opacity:0,duration:1,stagger:.08,ease:'expo.out'})}});

    /* Footer mark parallax */
    gsap.from('.giant .mark',{yPercent:40,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:true}});

    addEventListener('load',function(){ScrollTrigger.refresh()});
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ScrollTrigger.refresh()});
  }

  /* ---------- Cursor + magnetic buttons (desktop) ---------- */
  function cursor(){
    if(reduce || !window.gsap || !matchMedia('(pointer:fine)').matches) return;
    var c=$('#cursor'); c.classList.add('on');
    var qx=gsap.quickTo(c,'x',{duration:.35,ease:'power3'}), qy=gsap.quickTo(c,'y',{duration:.35,ease:'power3'});
    addEventListener('pointermove',function(e){qx(e.clientX);qy(e.clientY);});
    $$('a, button, .tile, label').forEach(function(el){
      el.addEventListener('pointerenter',function(){c.classList.add('big')});
      el.addEventListener('pointerleave',function(){c.classList.remove('big')});
    });
    $$('.magnetic').forEach(function(el){
      var mx=gsap.quickTo(el,'x',{duration:.6,ease:'elastic.out(1,.4)'}), my=gsap.quickTo(el,'y',{duration:.6,ease:'elastic.out(1,.4)'});
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(); mx((e.clientX-r.left-r.width/2)*.3); my((e.clientY-r.top-r.height/2)*.3);});
      el.addEventListener('pointerleave',function(){mx(0);my(0)});
    });
  }

  function boot(){ try{motion()}catch(e){console.warn(e)} try{cursor()}catch(e){} }
  if(document.readyState==='complete' || window.gsap) boot();
  else addEventListener('load',boot,{once:true});
})();
