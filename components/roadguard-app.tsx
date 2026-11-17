'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check,
  ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Clock3, CloudRain,
  Command, Download, FileImage, Filter, Gauge, Globe2, HardHat, Layers3,
  LocateFixed, MapPin, Menu, MoreHorizontal, Plus, Search, Settings2, Shield,
  ShieldCheck, SlidersHorizontal, Sparkles, Upload, X,
} from 'lucide-react'

type Incident = { id: string; title: string; road: string; district: string; time: string; severity: 'Critical' | 'High' | 'Moderate'; score: number; status: string; category: string }

const initialIncidents: Incident[] = [
  { id: 'RG-2841', title: 'Deep pothole cluster', road: 'Eastern Express Hwy · km 14.2', district: 'Ward 8 · Thane', time: '8 min ago', severity: 'Critical', score: 92, status: 'Needs assignment', category: 'D40 · Pothole' },
  { id: 'RG-2839', title: 'Alligator cracking', road: 'LBS Marg · near Teen Hath Naka', district: 'Ward 3 · Thane', time: '24 min ago', severity: 'High', score: 78, status: 'Under review', category: 'D20 · Alligator crack' },
  { id: 'RG-2837', title: 'Longitudinal crack', road: 'Ghodbunder Rd · km 7.8', district: 'Ward 12 · Thane', time: '51 min ago', severity: 'High', score: 71, status: 'Team assigned', category: 'D00 · Longitudinal crack' },
  { id: 'RG-2834', title: 'Surface deterioration', road: 'Majiwada Junction · eastbound', district: 'Ward 5 · Thane', time: '1 hr ago', severity: 'Moderate', score: 46, status: 'Scheduled', category: 'D10 · Transverse crack' },
]

const navGroups = [
  { label: 'OVERVIEW', items: [{ label: 'Command center', icon: Gauge }, { label: 'Road intelligence', icon: Globe2 }, { label: 'Incident reports', icon: AlertTriangle, count: '18' }] },
  { label: 'OPERATIONS', items: [{ label: 'Inspection lab', icon: Layers3 }, { label: 'Maintenance jobs', icon: HardHat, count: '7' }, { label: 'Verification queue', icon: ClipboardCheck, count: '3' }] },
  { label: 'INTELLIGENCE', items: [{ label: 'Analytics & reports', icon: Activity }, { label: 'AI model centre', icon: Sparkles }] },
]

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export default function RoadguardApp() {
  const [active, setActive] = useState('Command center')
  const [incidents, setIncidents] = useState(initialIncidents)
  const [severityFilter, setSeverityFilter] = useState('All severity')
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('Last 7 days')
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const visibleIncidents = useMemo(() => incidents.filter((item) => {
    const matchesSeverity = severityFilter === 'All severity' || item.severity === severityFilter
    const matchesSearch = `${item.id} ${item.title} ${item.road} ${item.district}`.toLowerCase().includes(search.toLowerCase())
    return matchesSeverity && matchesSearch
  }), [incidents, severityFilter, search])

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  function selectNav(label: string) {
    setActive(label)
    setMobileNav(false)
  }

  function advanceStatus(id: string) {
    const next = ['Under review', 'Team assigned', 'Repair in progress', 'Awaiting verification', 'Resolved']
    setIncidents((current) => current.map((item) => item.id === id ? { ...item, status: next[(Math.max(0, next.indexOf(item.status)) + 1) % next.length] } : item))
    notify(`${id} moved to the next workflow stage.`)
  }

  function handleFile(selected: File | undefined) {
    if (!selected) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      notify('Choose a JPG, PNG, or WEBP image.')
      return
    }
    if (selected.size > 12 * 1024 * 1024) {
      notify('Image must be smaller than 12 MB.')
      return
    }
    setFile(selected)
    setActive('Inspection lab')
  }

  function downloadCsv() {
    const rows = [['ID', 'Issue', 'Road', 'District', 'Severity', 'Risk score', 'Status'], ...visibleIncidents.map((i) => [i.id, i.title, i.road, i.district, i.severity, String(i.score), i.status])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'roadguard-incidents.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#home" onClick={() => selectNav('Command center')}>
          <span className="brand-mark"><Shield aria-hidden="true" /></span>
          <span><strong>ROADGUARD<span className="brand-ai"> AI</span></strong><small>INFRASTRUCTURE INTELLIGENCE</small></span>
        </a>
        <div className="workspace-switch"><span className="workspace-icon">MC</span><span className="workspace-copy"><strong>Thane Municipal Corp.</strong><small>Operations workspace</small></span><ChevronDown size={15} /></div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><p className="nav-heading">{group.label}</p>{group.items.map(({ label, icon: Icon, count }) => <button key={label} className={`nav-item ${active === label ? 'nav-item-active' : ''}`} onClick={() => selectNav(label)}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="model-status"><span className="status-dot" /><div><strong>Vision model online</strong><small>Demo adapter · v0.1.0</small></div><ChevronRight size={14} /></div>
          <button className="nav-item" onClick={() => notify('Settings are available to workspace administrators.')}><Settings2 size={17} /><span>Settings</span></button>
          <div className="profile"><div className="avatar">AS</div><div><strong>Arjun Shah</strong><small>Infrastructure lead</small></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19} /></button><div className="crumb"><span>Operations</span><ChevronRight size={14} /><strong>{active}</strong></div></div>
          <div className="topbar-actions"><span className="live-status"><span className="status-dot" />SYSTEM LIVE</span><button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up on critical alerts.')}><Bell size={18} /><i /></button><span className="topbar-divider" /><button className="date-button" onClick={() => setRange(range === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days')}>{range}<ChevronDown size={14} /></button><button className="user-avatar" aria-label="User profile">AS</button></div>
        </header>

        {active === 'Command center' ? <Dashboard incidents={incidents} visibleIncidents={visibleIncidents} severityFilter={severityFilter} setSeverityFilter={setSeverityFilter} search={search} setSearch={setSearch} range={range} setRange={setRange} downloadCsv={downloadCsv} advanceStatus={advanceStatus} selectNav={selectNav} notify={notify} /> : active === 'Inspection lab' ? <InspectionLab file={file} setFile={setFile} inputRef={inputRef} handleFile={handleFile} notify={notify} analysis={analysis} setAnalysis={setAnalysis} analyzing={analyzing} setAnalyzing={setAnalyzing} /> : <WorkflowPage active={active} incidents={visibleIncidents} selectNav={selectNav} downloadCsv={downloadCsv} advanceStatus={advanceStatus} notify={notify} />}
      </main>
      {notice && <div className="toast" role="status"><Check size={16} />{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></div>}
    </div>
  )
}

function Dashboard({ incidents, visibleIncidents, severityFilter, setSeverityFilter, search, setSearch, range, setRange, downloadCsv, advanceStatus, selectNav, notify }: any) {
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />MONDAY, 17 NOVEMBER 2026 <span className="demo-chip">DEMO DATA</span></div><h1>Command center</h1><p className="page-subtitle">A clear view of road health, risk, and work in motion across Thane.</p></div><div className="heading-actions"><button className="button-secondary" onClick={downloadCsv}><Download size={16} />Export report</button><button className="button-primary" onClick={() => selectNav('Inspection lab')}><Plus size={17} />New inspection</button></div></div>
    <div className="notice-bar"><span className="notice-icon"><ShieldCheck size={16} /></span><span><strong>Operational overview</strong><span className="notice-copy">Sample workspace data · no live municipal records connected</span></span><button onClick={() => notify('Neon is connected, but the database schema is not yet available to the application.')}>Data setup <ArrowRight size={14} /></button></div>
    <section className="metric-grid" aria-label="Key road operations metrics">
      <Metric label="Roads monitored" value="1,284" delta="+6.2%" detail="vs. previous period" icon={Globe2} color="teal" trend="up" />
      <Metric label="Open incidents" value="86" delta="12 critical" detail="across 9 wards" icon={AlertTriangle} color="orange" trend="down" />
      <Metric label="High-risk segments" value="24" delta="−4 this week" detail="risk score ≥ 75" icon={Activity} color="red" trend="down" />
      <Metric label="Repairs completed" value="73%" delta="+8.4%" detail="target: 80%" icon={ClipboardCheck} color="blue" trend="up" />
    </section>

    <section className="main-grid">
      <article className="panel map-panel"><div className="panel-header"><div><div className="panel-title-row"><h2>Road condition overview</h2><span className="live-pill"><i /> LIVE</span></div><p>Incident concentration across monitored corridors</p></div><button className="icon-button panel-more" aria-label="Map options" onClick={() => notify('Map options are available when a live map layer is connected.')}><MoreHorizontal size={19} /></button></div>
        <div className="map-frame"><div className="map-grid-lines" /><div className="map-land land-one" /><div className="map-land land-two" /><div className="waterway" /><div className="map-road road-main" /><div className="map-road road-secondary" /><div className="map-road road-tertiary" /><div className="map-road road-diagonal" /><div className="map-road road-bridge" /><span className="map-place place-one">THANE WEST</span><span className="map-place place-two">WAGLE ESTATE</span><span className="map-place place-three">MAJIWADA</span><span className="map-place place-four">KALWA</span><span className="map-route route-label-one">EASTERN EXPRESS HWY</span><span className="map-route route-label-two">LBS MARG</span>
          {[['pin-a','critical'],['pin-b','high'],['pin-c','moderate'],['pin-d','critical'],['pin-e','high'],['pin-f','moderate'],['pin-g','high']].map(([name,tone], index) => <button key={name} className={`map-pin ${name} ${tone}`} aria-label={`${tone} road incident ${index + 1}`} onClick={() => notify(`Selected ${tone} road incident ${index + 1}.`)}><span>{index === 0 ? '!' : ''}</span></button>)}
          <div className="map-controls"><button aria-label="Zoom in" onClick={() => notify('Zoom controls are demo-only.')}>+</button><button aria-label="Zoom out" onClick={() => notify('Zoom controls are demo-only.')}>−</button><button aria-label="Locate me" onClick={() => notify('Location is not enabled for this demo.') }><LocateFixed size={15} /></button></div><div className="map-credit">Illustrative map · no precise incident coordinates</div>
        </div><div className="map-legend"><span><i className="legend-dot critical" />Critical <b>8</b></span><span><i className="legend-dot high" />High <b>16</b></span><span><i className="legend-dot moderate" />Moderate <b>42</b></span><button onClick={() => selectNav('Road intelligence')}>Open road intelligence <ArrowRight size={14} /></button></div>
      </article>
      <article className="panel risk-panel"><div className="panel-header"><div><h2>Risk distribution</h2><p>Current network exposure</p></div><button className="select-quiet" onClick={() => setRange(range === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days')}>{range}<ChevronDown size={13} /></button></div>
        <div className="risk-chart"><svg viewBox="0 0 210 150" role="img" aria-label="Donut chart: 8 critical, 16 high, 42 moderate, 20 low"><circle cx="105" cy="75" r="56" fill="none" stroke="#1d2b38" strokeWidth="14"/><circle cx="105" cy="75" r="56" fill="none" stroke="#ef6b4f" strokeWidth="14" strokeDasharray="29 323" strokeDashoffset="0" transform="rotate(-90 105 75)"/><circle cx="105" cy="75" r="56" fill="none" stroke="#f5b84b" strokeWidth="14" strokeDasharray="59 293" strokeDashoffset="-34" transform="rotate(-90 105 75)"/><circle cx="105" cy="75" r="56" fill="none" stroke="#48c7ad" strokeWidth="14" strokeDasharray="154 198" strokeDashoffset="-98" transform="rotate(-90 105 75)"/><text x="105" y="72" textAnchor="middle" className="donut-total">86</text><text x="105" y="92" textAnchor="middle" className="donut-caption">OPEN ISSUES</text></svg><div className="risk-legend"><div><i className="legend-dot critical" /><span>Critical</span><strong>8</strong><small>9%</small></div><div><i className="legend-dot high" /><span>High</span><strong>16</strong><small>19%</small></div><div><i className="legend-dot moderate" /><span>Moderate</span><strong>42</strong><small>49%</small></div><div><i className="legend-dot low" /><span>Low</span><strong>20</strong><small>23%</small></div></div></div>
        <div className="risk-note"><ShieldCheck size={15} /><span>Prioritization uses an <strong>explainable weighted score</strong><br />with evidence quality and missing-data flags.</span></div>
      </article>
    </section>

    <section className="lower-grid"><article className="panel trend-panel"><div className="panel-header"><div><h2>Inspection activity</h2><p>Survey volume across the network</p></div><button className="select-quiet" onClick={() => setRange(range === 'Last 7 days' ? 'Last 30 days' : 'Last 7 days')}>{range}<ChevronDown size={13} /></button></div><div className="trend-chart"><div className="chart-y"><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div><div className="chart-area"><div className="chart-grid"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 680 162" preserveAspectRatio="none" aria-label="Inspection activity rises through the week"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#42c6ad" stopOpacity=".22"/><stop offset="100%" stopColor="#42c6ad" stopOpacity="0"/></linearGradient></defs><path d="M0 120 C35 112 48 88 85 94 S145 121 182 84 S241 81 278 91 S329 116 365 67 S421 58 454 73 S511 88 545 46 S606 67 638 32 S664 29 680 15 V162 H0Z" fill="url(#chartFill)"/><path d="M0 120 C35 112 48 88 85 94 S145 121 182 84 S241 81 278 91 S329 116 365 67 S421 58 454 73 S511 88 545 46 S606 67 638 32 S664 29 680 15" fill="none" stroke="#48c7ad" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/><circle cx="680" cy="15" r="4" fill="#48c7ad" vectorEffect="non-scaling-stroke"/></svg><div className="chart-x"><span>Mon 10</span><span>Tue 11</span><span>Wed 12</span><span>Thu 13</span><span>Fri 14</span><span>Sat 15</span><span>Sun 16</span></div></div></div><div className="trend-footer"><span><i className="legend-dot moderate" />Inspections <strong>642</strong></span><span><i className="legend-dot critical" />Issues found <strong>118</strong></span><span className="trend-total"><ArrowUpRight size={15} /> 14.8% vs last week</span></div></article>
      <article className="panel weather-panel"><div className="panel-header"><div><h2>Field conditions</h2><p>Thane · operational context</p></div><CloudRain size={18} className="weather-icon" /></div><div className="weather-main"><div><span className="weather-number">28°</span><span className="weather-desc">Light rain</span></div><div className="weather-icon-large"><CloudRain size={31} /></div></div><div className="weather-details"><div><span>Humidity</span><strong>78%</strong></div><div><span>Surface risk</span><strong className="text-warning">Elevated</strong></div><div><span>Rainfall · 24h</span><strong>12.4 mm</strong></div></div><div className="weather-callout"><AlertTriangle size={14} /><span>Rain forecast may accelerate deterioration on <strong>6 high-risk corridors.</strong></span></div></article></section>

    <section className="panel incidents-panel"><div className="incidents-heading"><div><div className="panel-title-row"><h2>Priority incidents</h2><span className="count-pill">{visibleIncidents.length} active</span></div><p>Highest-risk reports requiring attention</p></div><button className="button-link" onClick={() => selectNav('Incident reports')}>View all incidents <ArrowRight size={15} /></button></div><div className="table-tools"><label className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search incidents, roads..." aria-label="Search incidents" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label><label className="filter-select"><Filter size={14} /><select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} aria-label="Filter severity"><option>All severity</option><option>Critical</option><option>High</option><option>Moderate</option></select><ChevronDown size={13} /></label><button className="filter-button" onClick={() => notify('Advanced filters are available in the full reporting workspace.')}><SlidersHorizontal size={15} />Filters</button></div>
      <div className="table-scroll"><table><thead><tr><th>INCIDENT</th><th>LOCATION</th><th>SEVERITY</th><th>RISK</th><th>STATUS</th><th>REPORTED</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleIncidents.map((item: Incident) => <tr key={item.id}><td><div className="incident-cell"><span className={`incident-mark ${item.severity.toLowerCase()}`}><AlertTriangle size={14} /></span><span><strong>{item.title}</strong><small>{item.id} <i /> {item.category}</small></span></div></td><td><strong className="location-main">{item.road}</strong><small className="location-sub">{item.district}</small></td><td><Badge tone={item.severity.toLowerCase()}><i />{item.severity}</Badge></td><td><div className="risk-score"><strong>{item.score}</strong><span>/ 100</span><div className="risk-bar"><i style={{ width: `${item.score}%` }} /></div></div></td><td><button className="status-button" onClick={() => advanceStatus(item.id)} title="Advance incident to next workflow stage">{item.status}<ChevronDown size={12} /></button></td><td><span className="time-label"><Clock3 size={13} />{item.time}</span></td><td><button className="row-action" aria-label={`Open ${item.id}`} onClick={() => advanceStatus(item.id)}><ChevronRight size={16} /></button></td></tr>)}</tbody></table>{visibleIncidents.length === 0 && <div className="no-results">No incidents match these filters.</div>}</div><div className="table-footer"><span>Showing <strong>{visibleIncidents.length}</strong> of <strong>{incidents.length}</strong> priority incidents</span><span>Demo data is illustrative · scores are not field measurements</span></div>
    </section>
    <footer className="page-footer"><span><ShieldCheck size={14} /> ROADGUARD AI <i /> Municipal operations</span><span>Model performance is not connected · No accuracy claims shown</span></footer>
  </div>
}

function Metric({ label, value, delta, detail, icon: Icon, color, trend }: any) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${color}`}><Icon size={17} /></span></div><div className="metric-value">{value}</div><div className="metric-foot"><span className={`metric-delta ${color}`}>{trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{delta}</span><span>{detail}</span></div></article>
}

function InspectionLab({ file, setFile, inputRef, handleFile, notify, analysis, setAnalysis, analyzing, setAnalyzing }: any) {
  async function startAnalysis() {
    if (!file || analyzing) return
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\\/$/, '')
    if (!apiBase) { notify('Inference API is not configured. Set NEXT_PUBLIC_API_BASE_URL to your FastAPI URL.'); return }
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const body = new FormData()
      body.append('image', file)
      const response = await fetch(`${apiBase}/api/v1/inspections/analyze`, { method: 'POST', body })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.detail || `Inference request failed (${response.status})`)
      setAnalysis(payload)
      notify(`Analysis completed: ${payload.detection_count} detection(s). Human review required.`)
    } catch (error: any) { notify(error?.message || 'Could not reach the inference service.') }
    finally { setAnalyzing(false) }
  }
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />FIELD OPERATIONS</div><h1>Inspection lab</h1><p className="page-subtitle">Review road imagery and capture inspection evidence.</p></div><button className="button-secondary" onClick={() => notify('No saved inspection records in the demo workspace.')}><Clock3 size={15} />Inspection history</button></div><div className="notice-bar"><span className="notice-icon"><Sparkles size={16} /></span><span><strong>Inference adapter: demo</strong><span className="notice-copy">Uploads are previewed locally. No AI model is connected and no prediction is generated.</span></span><Badge tone="amber">NOT A REAL PREDICTION</Badge></div><div className="inspection-layout"><section className="panel upload-panel"><div className="panel-header"><div><h2>New road inspection</h2><p>Upload an image to start a review session</p></div><span className="step-number">01 / 03</span></div><button className={`upload-zone ${file ? 'has-file' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(e: React.DragEvent) => e.preventDefault()} onDrop={(e: React.DragEvent) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])} />{file ? <><span className="upload-icon"><FileImage size={24} /></span><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(1)} MB · local preview only</span><span className="upload-change">Choose a different image</span></> : <><span className="upload-icon"><Upload size={23} /></span><strong>Drop road imagery here</strong><span>or <em>browse files</em> from your device</span><small>JPG, PNG, WEBP · up to 12 MB</small></>}</button>{file && <div className="image-preview"><img src={URL.createObjectURL(file)} alt="Selected road inspection image preview" /><div className="preview-overlay"><Badge tone="amber">LOCAL PREVIEW</Badge><span>Image is not stored or sent to a model</span></div></div>}<div className="form-fields"><label>Inspection source<select defaultValue="Field inspection team"><option>Field inspection team</option><option>Citizen submission</option><option>Dashcam capture</option><option>Contractor evidence</option></select></label><label>Road or segment<input placeholder="Search road name (optional)" /></label><label>Inspector notes<textarea placeholder="Add surface observations, weather, or nearby landmarks..." rows={3} /></label></div><div className="form-footer"><span><ShieldCheck size={14} /> Uploads stay in this browser session.</span><button className="button-primary" disabled={!file || analyzing} onClick={startAnalysis}><Sparkles size={16} />{analyzing ? 'Analyzing…' : 'Start analysis'}</button></div></section>{analysis && <section className="panel analysis-results"><div className="panel-header"><div><h2>Model detections</h2><p>{analysis.detection_count} detection(s) · {analysis.model}</p></div><Badge tone="teal">INFERENCE COMPLETE</Badge></div>{analysis.detections.length ? <div className="table-scroll"><table><thead><tr><th>CLASS</th><th>CONFIDENCE</th><th>BOUNDING BOX (X1, Y1, X2, Y2)</th></tr></thead><tbody>{analysis.detections.map((d: any, i: number) => <tr key={i}><td><strong>{d.class_name}</strong><small>Class ID {d.class_id}</small></td><td>{(d.confidence * 100).toFixed(1)}%</td><td>{d.bbox_xyxy.join(', ')}</td></tr>)}</tbody></table></div> : <p>No objects detected at the configured confidence threshold.</p>}<p className="notice-copy">{analysis.note}</p></section>}<aside className="inspection-side"><div className="panel side-info"><span className="side-info-icon"><CircleHelp size={18} /></span><h3>Before you inspect</h3><p>Record a clear, well-lit image of the road surface. Add GPS and segment information through a connected inspection workflow.</p><ul><li><Check size={14} />Capture surface context</li><li><Check size={14} />Avoid motion blur</li><li><Check size={14} />Do not infer depth from a single image</li></ul></div><div className="panel categories-card"><h3>Supported damage classes</h3><div><Badge>D00</Badge><span>Longitudinal crack</span></div><div><Badge>D10</Badge><span>Transverse crack</span></div><div><Badge>D20</Badge><span>Alligator crack</span></div><div><Badge>D40</Badge><span>Pothole</span></div><p>Severity and model confidence are assessed separately.</p></div><div className="model-card"><span><Sparkles size={15} /> MODEL STATUS</span><strong>Waiting for inference service</strong><small>Mock adapter intentionally disabled</small></div></aside></div></div>
}

function WorkflowPage({ active, incidents, selectNav, downloadCsv, advanceStatus, notify }: any) {
  const titles: Record<string, string> = { 'Road intelligence': 'Road intelligence', 'Incident reports': 'Incident reports', 'Maintenance jobs': 'Maintenance operations', 'Verification queue': 'Verification queue', 'Analytics & reports': 'Analytics & reports', 'AI model centre': 'AI model centre' }
  const subtitle: Record<string, string> = { 'Road intelligence': 'Explore road-condition signals and infrastructure risk.', 'Incident reports': 'Review incoming damage reports and move issues through verification.', 'Maintenance jobs': 'Coordinate assignments, repair progress, and close-out evidence.', 'Verification queue': 'Review completed maintenance before an authorized sign-off.', 'Analytics & reports': 'Export the current illustrative incident register.', 'AI model centre': 'Model governance and inference service readiness.' }
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />OPERATIONS WORKSPACE</div><h1>{titles[active] || active}</h1><p className="page-subtitle">{subtitle[active]}</p></div><div className="heading-actions"><button className="button-secondary" onClick={downloadCsv}><Download size={16} />Export CSV</button><button className="button-primary" onClick={() => selectNav('Inspection lab')}><Plus size={17} />New inspection</button></div></div><div className="notice-bar"><span className="notice-icon"><ShieldCheck size={16} /></span><span><strong>Demo workspace</strong><span className="notice-copy">The Neon integration is connected, but schema discovery returned an error. These records are sample data.</span></span></div>{active === 'AI model centre' ? <section className="panel model-overview"><div className="model-hero"><span className="model-hero-icon"><Sparkles size={22} /></span><div><Badge tone="amber">NO MODEL DEPLOYED</Badge><h2>Human review stays in control</h2><p>Connect a validated inference service to enable prediction review, evaluation metrics, and version governance.</p></div></div><div className="model-stats"><div><span>Active model</span><strong>Not connected</strong></div><div><span>Evaluation metrics</span><strong>Not available</strong></div><div><span>Training runs</span><strong>0 recorded</strong></div><div><span>Deployment status</span><strong>Integration pending</strong></div></div><div className="risk-note"><ShieldCheck size={15} /><span>Accuracy metrics are not shown until an actual evaluation run is available.</span></div></section> : active === 'Analytics & reports' ? <section className="panel report-export"><div className="report-icon"><Download size={21} /></div><h2>Export incident register</h2><p>Download the current filtered sample rows as a CSV for review. This report is marked as illustrative demo data.</p><button className="button-primary" onClick={downloadCsv}><Download size={16} />Download CSV</button></section> : <><section className="metric-grid compact-metrics"><Metric label="Active reports" value="86" delta="12 critical" detail="sample records" icon={AlertTriangle} color="orange" trend="down" /><Metric label="Awaiting assignment" value="8" delta="3 overdue" detail="requires triage" icon={HardHat} color="red" trend="down" /><Metric label="In progress" value="14" delta="−2 this week" detail="across 4 crews" icon={Activity} color="blue" trend="up" /><Metric label="Verification due" value="3" delta="Needs review" detail="human sign-off" icon={ClipboardCheck} color="teal" trend="down" /></section><section className="panel incidents-panel workflow-table"><div className="incidents-heading"><div><div className="panel-title-row"><h2>{active === 'Maintenance jobs' ? 'Assigned maintenance' : active === 'Verification queue' ? 'Awaiting verification' : 'Incident register'}</h2><span className="count-pill">{incidents.length} shown</span></div><p>Status changes update this local demo session.</p></div><button className="button-link" onClick={() => notify('Records are illustrative and not persisted.')}>Workflow guide <ArrowRight size={15} /></button></div><div className="table-scroll"><table><thead><tr><th>RECORD</th><th>LOCATION</th><th>RISK</th><th>WORKFLOW STATUS</th><th>UPDATED</th><th><span className="sr-only">Action</span></th></tr></thead><tbody>{incidents.map((item: Incident) => <tr key={item.id}><td><div className="incident-cell"><span className={`incident-mark ${item.severity.toLowerCase()}`}><AlertTriangle size={14} /></span><span><strong>{item.title}</strong><small>{item.id} <i /> {item.category}</small></span></div></td><td><strong className="location-main">{item.road}</strong><small className="location-sub">{item.district}</small></td><td><div className="risk-score"><strong>{item.score}</strong><span>/ 100</span><div className="risk-bar"><i style={{ width: `${item.score}%` }} /></div></div></td><td><button className="status-button" onClick={() => advanceStatus(item.id)}>{item.status}<ChevronDown size={12} /></button></td><td><span className="time-label"><Clock3 size={13} />{item.time}</span></td><td><button className="row-action" onClick={() => advanceStatus(item.id)} aria-label={`Advance ${item.id}`}><ChevronRight size={16} /></button></td></tr>)}</tbody></table></div></section><section className="workflow-callout"><span><MapPin size={17} /></span><div><strong>Location precision matters</strong><p>Incident map markers shown in this demo are illustrative and are not verified GPS locations.</p></div><button onClick={() => selectNav('Road intelligence')}>View map <ArrowRight size={14} /></button></section></>}</div>
}
