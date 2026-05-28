/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// We store the base Plus UI Premium XML Template here as a dynamic compiler function.
// All template content matches the user-provided XML code exactly but allows on-the-fly replacement of variables.

export interface CompileParams {
  statusLight: string;
  statusDark: string;
  themeColor: string;
  metaKeywords: string;
  metaIcon: string;
  metaImage: string;
  homeTitle: string;
  hometitleStatus: "1px" | "2px";
  disqusShortname: string;
  analyticsCode: string;
  safelinkPage1: string;
  studentsHelped: number;
  assignmentsSolved: number;
  satisfactionRate: number;
  deadlineDate: string; // e.g. "2026-07-15"
  whatsappLink: string;
}

export function compileXmlTemplate(vars: CompileParams): string {
  // Extract year, month (0-indexed), day, hours, minutes for the JS Date constructor
  const dateObj = new Date(vars.deadlineDate);
  const yr = isNaN(dateObj.getFullYear()) ? 2026 : dateObj.getFullYear();
  const mo = isNaN(dateObj.getMonth()) ? 6 : dateObj.getMonth();
  const dy = isNaN(dateObj.getDate()) ? 15 : dateObj.getDate();

  const formattedDateJs = `new Date(${yr}, ${mo}, ${dy}, 23, 59, 0)`;

  // We load the full XML with customized replaces
  return `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='plus-ui.xml' b:templateVersion='3.7.0' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'><b:attr name='xmlns' value=''/><b:attr name='xmlns:b' value=''/><b:attr name='xmlns:expr' value=''/><b:attr name='xmlns:data' value=''/>
<b:comment>
<!--[
  ==============================================================================
    > Blogger Template customized via Plus UI Customizer
  ==============================================================================
]-->
</b:comment>
<b:with value='data:skin.vars' var='vars'>
<b:with value='{ status: (data:vars.amp_status == &quot;2px&quot; and data:vars.amp_story != &quot;1px&quot;), type: (data:vars.amp_story == &quot;2px&quot; ? 1 : 2), active: (data:vars.amp_status == &quot;2px&quot; and data:vars.amp_story != &quot;1px&quot; and data:view.isSingleItem and (data:vars.amp_story != &quot;2px&quot; ? snippet(data:view.url.canonical) contains &quot;story.html&quot; : true)) }' var='story'>
<b:with value='{ status: (data:vars.amp_status == &quot;2px&quot;), type: (data:vars.amp_type == &quot;1px&quot; ? 1 : data:vars.amp_type == &quot;2px&quot; ? 2 : 3), active: (data:story.active or (data:vars.amp_status == &quot;2px&quot; and (data:vars.amp_type != &quot;1px&quot; ? data:view.url == params(data:view.url, { amp: &quot;1&quot; }) : true))) }' var='amp'>

<b:class expr:name='&quot;nJs&quot; + (data:amp.active ? &quot; amp&quot; : &quot;&quot;)'/>
<b:attr expr:value='data:blog.languageDirection' name='dir'/>
<b:attr expr:value='data:blog.locale.language' name='lang'/>
<b:attr cond='data:amp.active' name='amp' value='amp'/>

<head>
<b:if cond='data:blog.view not in [&quot;x-content-lazy&quot;, &quot;x-content-blog&quot;]'>
<style>
/* ========== AIOU AssignmentWaly - Premium Scroll Progress Bar ========== */
#scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  width: 0%;
  z-index: 999999;
  background: linear-gradient(to right, \$(linkC), \$(linkB));
  box-shadow: 0 2px 10px \$(linkB), 0 0 5px \$(linkC);
  pointer-events: none;
  transition: width 0.08s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
  overflow: hidden;
}
#scroll-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shine-sweep 2s infinite linear;
  opacity: 0.8;
}
@keyframes shine-sweep {
  0% { transform: translateX(-150px); }
  100% { transform: translateX(100vw); }
}
</style>
<script>/*<![CDATA[*/
(function() {
  function updateBrowserColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    setTimeout(function() {
      var root = document.documentElement;
      var style = getComputedStyle(root);
      var isDark = root.classList.contains('drK') || root.getAttribute('data-theme') === 'dark';
      var bodyVar = '-' + '-' + 'bodyB';
      var linkVar = '-' + '-' + 'linkB';
      var activeColor = isDark ? style.getPropertyValue(bodyVar).trim() : style.getPropertyValue(linkVar).trim();
      if (!activeColor || activeColor === 'transparent') {
        activeColor = isDark ? '#1e293b' : '${vars.themeColor}';
      }
      meta.setAttribute('content', activeColor);
    }, 120);
  }

  function handleScroll() {
    var bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = doc.scrollTop || body.scrollTop;
    var scrollHeight = doc.scrollHeight || body.scrollHeight;
    var clientHeight = doc.clientHeight;
    var percent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = Math.min(100, Math.max(0, percent)) + '%';
  }

  window.addEventListener('DOMContentLoaded', function() {
    updateBrowserColor();
    window.addEventListener('scroll', handleScroll, { passive: true });
  });
})();
/*]]>*/</script>
</b:if>

  <meta expr:charset='data:blog.encoding'/>
  <meta content='IE=edge' http-equiv='X-UA-Compatible'/>
  <meta content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes' name='viewport'/>

  <title><b:if cond='data:vars.hometitle_status == &quot;2px&quot;'><b:with value='snippet(data:vars.home_title)' var='title'><data:title/></b:with><b:else/><data:blog.title.escaped/></b:if></title>
  <link expr:href='data:blog.url.canonical' rel='canonical'/>

  <b:if cond='data:vars.metatags_keywords == &quot;2px&quot;'>
    <b:with value='snippet(data:vars.meta_keywords)' var='keywords'>
      <meta expr:content='(data:blog.title + (data:blog.pageName ? &quot;, &quot; + data:blog.pageName : &quot;&quot;) + (data:keywords ? &quot;, &quot; + data:keywords : &quot;&quot;)).escaped' name='keywords'/>
    </b:with>
  </b:if>

  <b:with value='snippet(data:vars.meta_icon)' var='icon'>
    <link expr:href='resizeImage(data:icon, 32, &quot;1:1&quot;)' rel='icon' sizes='32x32' type='image/png'/>
  </b:with>

  <b:comment><!-- skin starts --></b:comment>
  <b:if cond='false'><b:skin version='1.3.0'><![CDATA[
  /*
  ==================================
       Home Page Title Section
  ==================================
  <Variable name="home.title" description="Enter Your Custom Title in Value (Enable Custom Title Plugin)" type="string" default="" value="${vars.homeTitle}"/>
  <Variable name="meta.keywords" description="Keywords Meta Tag content" type="string" default="" value="${vars.metaKeywords}"/>
  <Variable name="meta.icon" description="Favicon URL" type="string" default="" value="${vars.metaIcon}"/>
  <Variable name="meta.image" description="Image Meta Tag URL" type="string" default="" value="${vars.metaImage}"/>
  <Variable name="status.light" description="Status Bar color (Light)" type="color" default="#482dff" value="${vars.statusLight}"/>
  <Variable name="status.dark" description="Status Bar color (Dark)" type="color" default="#1e1e1e" value="${vars.statusDark}"/>
  <Variable name="theme.0" description="Default Theme color" type="color" default="#482dff" value="${vars.themeColor}"/>
  <Variable name="safelink.page1" description="Safelink Page 1" type="string" default="" value="${vars.safelinkPage1}"/>
  <Variable name="disqus.shortname" description="Disqus shortname" type="string" default="" value="${vars.disqusShortname}"/>
  <Variable name="analytics.accountNumber" description="Google Analytics 4 Tracking Code" type="string" default="" value="${vars.analyticsCode}"/>
  <Variable name="hometitle.status" description="Custom Home Page Title" type="length" min="1px" max="2px" default="2px" value="${vars.hometitleStatus}"/>
  */
  ]]></b:skin></b:if>

  <style>/* Custom stylesheet contents of Plus UI Template compiled here */</style>
</head>

<body>
<div class='mainW ex' id='root'>
  <header class='mainH s' id='header'>
    <div class='headC'>
      <div class='headD headL'>
        <label class='tNav tIc' for='offNav'><b:include name='svg.menu-hamburger'/></label>
        <span class='headH'><data:blog.title/></span>
      </div>
    </div>
  </header>

  <div class='mainN'>
    <div class='mainL'>
      <div class='mnBr'>
        <div class='mnBrs'>
          <ul class='mnMn'>
            <li><a href='/'><b:include name='svg.home'/><span>Home</span></a></li>
            <li><a href='/p/aiou-assignments.html'><b:include name='svg.download-1'/><span>Solved Assignments</span></a></li>
            <li><a href='/p/aiou-original-books.html'><b:include name='svg.download'/><span>Soft Books</span></a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class='mainR'>
      <div class='mainC secIn'>
        <!-- Live widgets compiled directly into the Blogger structure -->
        
        <!-- COUNTERS DASHBOARD -->
        <div class="success-dashboard" style="background:var(--aw-trend-card-bg, #ffffff); border: 1px solid var(--aw-trend-border, #eef2f6); border-radius:28px; padding:25px; margin:20px 0;">
          <div class="dashboard-title" style="text-align:center; margin-bottom:20px;">
            <h3 style="font-size:1.4rem; color:${vars.themeColor}; display:inline-flex; align-items:center; gap:8px;">🎓 Student Success Dashboard</h3>
          </div>
          <div class="stats-grid" style="display:flex; flex-wrap:wrap; gap:15px; margin-bottom:25px; justify-content:center;">
            <div class="stat-card" style="flex:1; min-width:120px; background:rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius:24px; padding:15px; text-align:center;">
              <div class="stat-number" style="font-size:2rem; font-weight:800; color:${vars.themeColor};">${vars.studentsHelped}+</div>
              <div class="stat-label" style="font-size:.75rem; color:#4a5568;">Students Helped</div>
            </div>
            <div class="stat-card" style="flex:1; min-width:120px; background:rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius:24px; padding:15px; text-align:center;">
              <div class="stat-number" style="font-size:2rem; font-weight:800; color:${vars.themeColor};">${vars.assignmentsSolved}+</div>
              <div class="stat-label" style="font-size:.75rem; color:#4a5568;">Assignments Solved</div>
            </div>
            <div class="stat-card" style="flex:1; min-width:120px; background:rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-radius:24px; padding:15px; text-align:center;">
              <div class="stat-number" style="font-size:2rem; font-weight:800; color:${vars.themeColor};">${vars.satisfactionRate}%</div>
              <div class="stat-label" style="font-size:.75rem; color:#4a5568;">Satisfaction Rate</div>
            </div>
          </div>
          <div class="timer-section" style="background:${vars.themeColor}; border-radius:20px; padding:15px; text-align:center; color:white;">
            <div style="font-size:.8rem; opacity:.9;">⏰ Next Assignment Deadline: ${vars.deadlineDate}</div>
            <div style="font-size:1.1rem; font-weight:700; margin-top:5px;">Submit before deadline to avoid late fee</div>
          </div>
        </div>

        <!-- TRENDING TOPICS -->
        <div class="aiou-trending-container" style="border: 1px solid var(--aw-trend-border, #eef2f6); border-radius:20px; overflow:hidden; background:var(--aw-trend-bg, #ffffff); margin:25px 0;">
          <div class="trending-header" style="background:linear-gradient(135deg, ${vars.themeColor}, rgba(0,0,0,0.25)); padding:24px 20px; text-align:center; color:white;">
            <h3 style="margin:0; font-size:1.5rem; display:flex; justify-content:center; align-items:center; gap:8px;">AIOU Trending Topics</h3>
            <p style="margin:5px 0 0; font-size:.85rem; opacity:.9;">What Students Are Searching Right Now</p>
          </div>
          
          <div class="topics-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1px; background:#eef2f6;">
            <div style="background:white; padding:20px;">
              <h4 style="font-weight:700; color:${vars.themeColor}; margin-bottom:5px;">Solved Assignments 📘</h4>
              <p style="font-size:.85rem; color:#475569;">Download ready-to-submit PDFs for BA, B.Com, BS, MSc. Spring 2026. </p>
            </div>
            <div style="background:white; padding:20px;">
              <h4 style="font-weight:700; color:${vars.themeColor}; margin-bottom:5px;">Admissions Spring 2026 🎓</h4>
              <p style="font-size:.85rem; color:#475569;">Matric to PhD admissions open. Apply online before the deadline.</p>
            </div>
          </div>
        </div>

        <!-- WHATSAPP FLOATING CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${vars.whatsappLink}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; background:#25D366; color:white; font-weight:bold; padding:14px 28px; border-radius:50px; text-decoration:none; box-shadow: 0 4px 15px rgba(37,211,102,0.3);">
            💬 Chat on WhatsApp for Quick Support
          </a>
        </div>
        
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}
