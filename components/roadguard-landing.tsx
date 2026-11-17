'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Activity, ArrowRight, ArrowUpRight, Camera, Check, ChevronDown, CircleAlert, ClipboardList, Cpu, Gauge, MapPin, Menu, Shield, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react'

const stages=[
  {n:'01',icon:Camera,title:'Capture road conditions',desc:'Residents, inspection teams and approved camera sources submit road images with location and context.'},
  {n:'02',icon:Cpu,title:'Analyse and classify damage',desc:'The inference service identifies supported damage classes and returns detections for review. Unavailable models are reported honestly.'},
  {n:'03',icon:Gauge,title:'Prioritise by risk',desc:'Combine damage severity, location context and operational factors to help teams decide what needs attention first.'},
  {n:'04',icon:Wrench,title:'Coordinate maintenance',desc:'Create maintenance work, assign teams, track status and record repair evidence in one workflow.'},
]
const damage=[['D00','Longitudinal crack','Cracking along the direction of travel'],['D10','Transverse crack','Cracking across the road surface'],['D20','Alligator crack','Interconnected fatigue cracking'],['D40','Pothole','Localised surface failure and material loss']]
const capabilities=[
  {icon:MapPin,title:'Location-aware reporting',desc:'Attach road and location context to reports so teams can find the issue.'},
  {icon:ShieldCheck,title:'Human-reviewed intelligence',desc:'Keep inspection and authority review in the loop before operational decisions.'},
  {icon:ClipboardList,title:'Maintenance workflow',desc:'Move verified issues from report to assignment, repair and verification.'},
  {icon:Activity,title:'Infrastructure analytics',desc:'Build a consistent view of incident patterns, workload and repair progress.'},
]
export default function RoadguardLanding(){
 const [menu,setMenu]=useState(false)
 return <main className="landing">
  <header className="landing-nav">
   <Link href="/" className="landing-brand"><span className="landing-mark"><Shield/></span><span><b>ROADGUARD <i>AI</i></b><small>ROAD INFRASTRUCTURE INTELLIGENCE</small></span></Link>
   <button className="landing-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation">{menu?<X/>:<Menu/>}</button>
   <nav className={menu?'open':''}><a href="#solution" onClick={()=>setMenu(false)}>Solution</a><a href="#workflow" onClick={()=>setMenu(false)}>How it works</a><a href="#classification" onClick={()=>setMenu(false)}>Damage classes</a><a href="#about" onClick={()=>setMenu(false)}>About</a><Link className="nav-login" href="/dashboard">Authority portal <ArrowUpRight size={14}/></Link><Link className="nav-cta" href="/dashboard">Get started <ArrowRight size={15}/></Link></nav>
  </header>
  <section className="landing-hero">
   <div className="hero-grid"></div><div className="hero-copy">
    <div className="eyebrow"><span></span> SMARTER ROADS. FASTER RESPONSE.</div>
    <h1>Every road tells a story.<br/><em>Make damage visible.</em></h1>
    <p>ROADGUARD AI brings road-damage reporting, AI-assisted inspection and maintenance coordination into one infrastructure intelligence platform.</p>
    <div className="hero-actions"><Link href="/dashboard" className="primary-cta">Report road damage <ArrowRight size={17}/></Link><a href="#solution" className="secondary-cta">Explore the platform <ArrowUpRight size={16}/></a></div>
    <div className="hero-proof"><span><Check/> Citizen and field reporting</span><span><Check/> AI-assisted inspection</span><span><Check/> Repair tracking</span></div>
   </div>
   <div className="hero-visual" aria-label="Road infrastructure intelligence illustration">
    <div className="visual-glow"></div><div className="visual-top"><span><i></i> ROAD CONDITION MONITOR</span><span>LIVE WORKSPACE</span></div>
    <div className="road-scene"><div className="road-horizon"></div><div className="road-surface"><div className="road-line"></div><div className="road-damage"></div><div className="detect-box"><b>D40 · POTHOLE</b><small>Detection preview · illustrative</small></div></div><div className="scan-line"></div></div>
    <div className="visual-bottom"><div><small>PLATFORM WORKFLOW</small><b>Report → Review → Repair</b></div><span className="visual-status"><i></i> Operational workflow</span></div>
   </div>
   <div className="hero-index">01 <span>/</span> ROAD INTELLIGENCE PLATFORM</div>
  </section>
  <section className="landing-strip"><div><b>01</b><span>Capture</span></div><div><b>02</b><span>Understand</span></div><div><b>03</b><span>Prioritise</span></div><div><b>04</b><span>Repair & verify</span></div></section>
  <section className="landing-section problem-section" id="solution"><div className="section-label">THE CHALLENGE <span>01 — 04</span></div><div className="section-heading"><h2>Road maintenance<br/><em>needs better intelligence.</em></h2><p>Road damage is difficult to manage when reports, inspections, locations and repair updates live in disconnected systems.</p></div>
   <div className="challenge-grid"><article><span>01 / VISIBILITY</span><h3>Issues go unnoticed</h3><p>Periodic manual inspections cannot provide a complete, continuously updated picture of road conditions.</p></article><article><span>02 / TRACEABILITY</span><h3>Reports lose context</h3><p>Without clear images, coordinates and status history, teams can struggle to verify and locate reported damage.</p></article><article><span>03 / COORDINATION</span><h3>Repairs are hard to track</h3><p>When reporting, assignment and verification are disconnected, accountability across the repair lifecycle suffers.</p></article></div>
  </section>
  <section className="landing-section workflow-section" id="workflow"><div className="section-label">THE ROADGUARD APPROACH <span>02 — 04</span></div><div className="section-heading"><h2>From a road report<br/><em>to a repair action.</em></h2><p>A connected workflow helps residents and infrastructure teams work from the same verified information.</p></div>
   <div className="stage-grid">{stages.map(s=><article key={s.n}><div className="stage-top"><span>{s.n}</span><s.icon/></div><h3>{s.title}</h3><p>{s.desc}</p></article>)}</div>
  </section>
  <section className="landing-section capability-section"><div className="section-label">BUILT FOR THE FULL LIFECYCLE <span>03 — 04</span></div><div className="section-heading"><h2>Not just detection.<br/><em>Infrastructure intelligence.</em></h2><p>Detection is one step. ROADGUARD connects the information and operational work that follows.</p></div>
   <div className="capability-grid">{capabilities.map(c=><article key={c.title}><span className="cap-icon"><c.icon/></span><h3>{c.title}</h3><p>{c.desc}</p></article>)}</div>
  </section>
  <section className="landing-section classes-section" id="classification"><div className="section-label">SUPPORTED DAMAGE TAXONOMY <span>04 — 04</span></div><div className="section-heading"><h2>Recognise the<br/><em>condition of the road.</em></h2><p>The inspection interface is designed around these road-damage categories. Actual detections depend on a configured and evaluated model.</p></div>
   <div className="damage-list">{damage.map((d,i)=><div key={d[0]}><span className={'damage-dot d'+i}></span><b>{d[0]}</b><strong>{d[1]}</strong><small>{d[2]}</small><ArrowUpRight/></div>)}</div>
   <div className="integrity-note"><Sparkles/><span><b>Built on verifiable outputs</b><small>ROADGUARD does not display invented detection accuracy or pretend a model is online when inference is not configured.</small></span></div>
  </section>
  <section className="landing-cta" id="about"><div><span className="eyebrow">BETTER ROADS BEGIN WITH BETTER INFORMATION</span><h2>Make every road issue<br/><em>count.</em></h2><p>Bring community reports and infrastructure operations into one clear workflow.</p><div className="hero-actions"><Link href="/dashboard" className="primary-cta">Open ROADGUARD <ArrowRight size={17}/></Link><a href="#workflow" className="secondary-cta">See how it works</a></div></div><div className="cta-mark"><Shield/><span>ROADGUARD AI</span><small>INFRASTRUCTURE INTELLIGENCE</small></div></section>
  <footer className="landing-footer"><Link href="/" className="landing-brand"><span className="landing-mark"><Shield/></span><span><b>ROADGUARD <i>AI</i></b><small>ROAD INFRASTRUCTURE INTELLIGENCE</small></span></Link><span>Making road conditions visible. Helping repairs move forward.</span><Link href="/dashboard">Authority portal <ArrowUpRight size={14}/></Link></footer>
 </main>
}
