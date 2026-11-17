'use client'
import { useState } from 'react'
import { Shield, ShieldCheck, MapPin, ArrowRight } from 'lucide-react'

export default function AccessPortal({ onAuthenticated }: { onAuthenticated: (session:any)=>void }) {
  const [kind,setKind]=useState<'resident'|'authority'>('resident')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    const api=process.env.NEXT_PUBLIC_API_BASE_URL || ''
    if(!api){setError('Authentication API is not configured.');setBusy(false);return}
    try {
      const response=await fetch(api+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
      const data=await response.json()
      if(!response.ok) throw new Error(data.detail || 'Sign in failed')
      const authority=['government_authority','inspection_team','repair_team','super_admin','ai_data_reviewer'].includes(data.user.role)
      if((kind==='authority')!==authority) throw new Error(kind==='authority'?'This is a resident account. Select Resident / Local.':'This is an authority account. Select Authority.')
      onAuthenticated(data)
    } catch(err:any){setError(err.message || 'Unable to sign in')}
    finally{setBusy(false)}
  }
  return <main className={'access-screen access-'+kind}>
    <div className="access-brand"><span className="brand-mark"><Shield/></span><span><strong>ROADGUARD<span className="brand-ai"> AI</span></strong><small>INFRASTRUCTURE INTELLIGENCE</small></span></div>
    <div className="access-layout">
      <section className="access-story">
        <span className="access-kicker">{kind==='resident'?'YOUR STREET. YOUR VOICE.':'PUBLIC INFRASTRUCTURE OPERATIONS'}</span>
        <h1>{kind==='resident'?'Safer roads start with your report.':'Coordinate road safety operations.'}</h1>
        <p>{kind==='resident'?'Report potholes and damaged roads in your neighbourhood and follow their progress.':'Review incidents, coordinate inspections and manage repair workflows.'}</p>
        <div className="access-points">{(kind==='resident'?['Report road damage in your area','Track the progress of your reports','Help authorities understand local road issues']:['Monitor incidents across your jurisdiction','Manage inspection and repair workflows','Review evidence and operational risk']).map(x=><div key={x}><ShieldCheck size={16}/>{x}</div>)}</div>
      </section>
      <section className="access-card">
        <div className="access-switch">
          <button type="button" className={kind==='resident'?'selected':''} onClick={()=>{setKind('resident');setError('')}}><MapPin size={16}/> Resident / Local</button>
          <button type="button" className={kind==='authority'?'selected':''} onClick={()=>{setKind('authority');setError('')}}><ShieldCheck size={16}/> Authority</button>
        </div>
        <h2>{kind==='resident'?'Resident sign in':'Authority sign in'}</h2>
        <p>{kind==='resident'?'For people reporting local road issues.':'For authorized municipal and field operations teams.'}</p>
        <form className="access-form" onSubmit={submit}>
          <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={kind==='resident'?'you@example.com':'name@municipality.gov'} autoComplete="username"/></label>
          <label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password"/></label>
          {error&&<div className="access-error" role="alert">{error}</div>}
          <button className="access-submit" disabled={busy}>{busy?'Signing in…':kind==='resident'?'Sign in as resident':'Enter authority portal'}<ArrowRight size={16}/></button>
        </form>
        <div className="access-foot">{kind==='resident'?'New resident accounts must be registered through the resident registration flow.':'Authority accounts are provisioned by your organization administrator.'}</div>
        <div className="access-security"><Shield size={14}/> Role-checked access · Account permissions determine portal access</div>
      </section>
    </div>
    <footer className="access-footer">ROADGUARD AI · Safer roads through shared intelligence</footer>
  </main>
}