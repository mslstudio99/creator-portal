'use client';

import { useState } from 'react';

// SUPABASE CREDENTIALS:
const SUPABASE_URL = "https://redxcmumihxuugsxolsj.supabase.co";
const API_KEY = "sb_publishable_HzUooLrwGJqNX0YVBZRIdw_lb0lQDIT";

export default function CreatorPortal() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');

  // Form Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Project Upload States
  const [projectTitle, setProjectTitle] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [notes, setNotes] = useState('');

  // UI States
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. SIGN UP PROCESS
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, password: signupPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: '🎉 Account created successfully! Please log in using the Log In tab.', type: 'success' });
        setEmail(signupEmail);
        setPassword(signupPassword);
        setActiveTab('login');
      } else {
        setAlertMsg({ text: 'Sign Up Failed: ' + (data.msg || data.error_description || 'An error occurred'), type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Error: ' + err.message, type: 'error' });
    }
    setLoading(false);
  };

  // 2. LOG IN PROCESS
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAccessToken(data.access_token);
        setUserEmail(data.user.email);
        setUserId(data.user.id);
        setIsLoggedIn(true);
        fetchProjects(data.access_token);
      } else {
        setAlertMsg({ text: 'Log In Failed: ' + (data.error_description || data.msg || 'Invalid email or password'), type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Error: ' + err.message, type: 'error' });
    }
    setLoading(false);
  };

  // 3. SUBMIT PROJECT TO SUPABASE (TRIGGERS MAKE / GEMINI / AIRTABLE)
  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/creator_projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          creator_name: userEmail.split('@')[0],
          project_title: projectTitle,
          video_link: videoLink,
          notes: notes,
          status: 'Needs Processing',
          user_id: userId
        })
      });

      if (res.ok) {
        setAlertMsg({ text: '🎉 Successfully submitted to Make/Gemini Automation!', type: 'success' });
        setProjectTitle('');
        setVideoLink('');
        setNotes('');
        fetchProjects(accessToken);
      } else {
        const err = await res.json();
        setAlertMsg({ text: 'Upload Failed: ' + (err.message || 'Error occurred'), type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Error: ' + err.message, type: 'error' });
    }
    setLoading(false);
  };

  // 4. LOAD USER'S PROJECTS (RLS PROTECTED)
  const fetchProjects = async (token) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/creator_projects?select=*`, {
        headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMyProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. LOG OUT
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccessToken('');
    setUserEmail('');
    setUserId('');
    setAlertMsg({ text: '', type: '' });
  };

  return (
    <main style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0f3ff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '480px' }}>
        
        {!isLoggedIn ? (
          <>
            <h2 style={{ color: '#1b2559', margin: '0 0 6px 0', fontSize: '22px' }}>🚀 Creator Portal V2 (Next.js)</h2>
            <p style={{ color: '#707ebe', marginBottom: '20px', fontSize: '14px' }}>ExpandMyFans Content Pipeline Engine</p>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f4f7fe', padding: '4px', borderRadius: '10px' }}>
              <button 
                type="button"
                onClick={() => { setActiveTab('login'); setAlertMsg({text:'', type:''}); }}
                style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'login' ? '#4318ff' : 'transparent', color: activeTab === 'login' ? 'white' : '#707ebe', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                LOG IN
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('signup'); setAlertMsg({text:'', type:''}); }}
                style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === 'signup' ? '#4318ff' : 'transparent', color: activeTab === 'signup' ? 'white' : '#707ebe', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                SIGN UP
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Creator Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="creator@gmail.com" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

                <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

                <button type="submit" disabled={loading} style={{ width: '100%', background: '#4318ff', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Authenticating...' : 'Log In to Portal'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>New Creator Email</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="name.creator@gmail.com" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

                <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Password</label>
                <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

                <button type="submit" disabled={loading} style={{ width: '100%', background: '#00c853', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Registering...' : 'Create New Account'}
                </button>
              </form>
            )}

            {alertMsg.text && (
              <div style={{ padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px', textAlign: 'center', background: alertMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: alertMsg.type === 'success' ? '#137333' : '#c5221f' }}>
                {alertMsg.text}
              </div>
            )}
          </>
        ) : (
          /* Dashboard User View */
          <div>
            <h2 style={{ color: '#1b2559', margin: '0 0 6px 0', fontSize: '22px' }}>🚀 Creator Dashboard</h2>
            <p style={{ color: '#707ebe', marginBottom: '20px', fontSize: '14px' }}>Welcome, <strong style={{ color: '#4318ff' }}>{userEmail}</strong></p>

            <form onSubmit={handleUpload}>
              <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Project / Content Title</label>
              <input type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="e.g., Running Shoes XYZ Review" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

              <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Video Link (Drive / YouTube / Loom)</label>
              <input type="url" value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="https://..." required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

              <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>Brief Notes / Video Concept</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Describe key points of the video..." required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e0e5f2', borderRadius: '8px', boxSizing: 'border-box' }} />

              <button type="submit" disabled={loading} style={{ width: '100%', background: '#4318ff', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Submitting...' : 'Submit to Automation Pipeline'}
              </button>
            </form>

            {alertMsg.text && (
              <div style={{ padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px', textAlign: 'center', background: alertMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: alertMsg.type === 'success' ? '#137333' : '#c5221f' }}>
                {alertMsg.text}
              </div>
            )}

            <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #e0e5f2' }} />
            
            <label style={{ fontWeight: 600, fontSize: '13px', color: '#2b3674', display: 'block', marginBottom: '6px' }}>📋 Your Submitted Content (RLS Protected):</label>
            <div style={{ marginTop: '10px' }}>
              {myProjects.length === 0 ? (
                <i style={{ color: '#707ebe', fontSize: '13px' }}>No projects submitted yet.</i>
              ) : (
                myProjects.map(p => (
                  <div key={p.id} style={{ background: '#f8f9ff', border: '1px solid #e0e5f2', padding: '12px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold', color: '#1b2559' }}>{p.project_title}</div>
                    <div style={{ color: '#707ebe' }}>{p.notes}</div>
                    <span style={{ display: 'inline-block', background: '#4318ff', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginTop: '4px' }}>{p.status}</span>
                  </div>
                ))
              )}
            </div>

            <button type="button" onClick={handleLogout} style={{ width: '100%', background: '#e0e5f2', color: '#2b3674', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}>
              Log Out
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
