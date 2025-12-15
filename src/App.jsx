// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useSwipeable } from 'react-swipeable'; 
import './App.css';

// Firebase Imports
import { auth, googleProvider, db } from './firebase';
import { 
  signInWithPopup, signOut, onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { 
    collection, addDoc, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc 
} from 'firebase/firestore'; 

// --- Icons ---
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>;
const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const EventIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>;
const TaskIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/></svg>;
const GiftIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"/></svg>;
// Eye Icons for Password
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>;
const EyeOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.89l.42.42 3.98 3.98 1.41-1.41L3.41 2.86 2 4.27zm4.93 5.35c.77-1.39 1.95-2.61 3.43-3.36L9.6 7.02c-.89.5-1.68 1.15-2.33 1.94l-.34.66zM12 17c-2.76 0-5-2.24-5-5 0-.36.04-.71.11-1.04l1.55 1.55c-.05.16-.12.31-.12.49 0 1.66 1.34 3 3 3 .18 0 .33-.07.49-.12l1.55 1.55c-.33.07-.68.11-1.04.11z"/></svg>;

function App() {
  const calendarRef = useRef(null);
  
  // -- State --
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewType, setViewType] = useState('dayGridMonth'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', color: '#4285F4' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fabOpen, setFabOpen] = useState(false);

  // --- LOGIN & UI STATES ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // -- Password Visibility States --
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- FORM DATA ---
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // --- MESSAGES ---
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Swipe Handlers
  const swipeHandlers = useSwipeable({ onSwipedLeft: () => { if (calendarRef.current) calendarRef.current.getApi().next(); }, onSwipedRight: () => { if (calendarRef.current) calendarRef.current.getApi().prev(); }, preventScrollOnSwipe: true, trackMouse: true });

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!successMsg) setLoginError('');
    });
    return () => unsubscribe();
  }, [successMsg]);

  // Fetch Events
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "events"), where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else { setEvents([]); }
  }, [user]);

  // Back Button
  useEffect(() => {
    const handlePopState = () => {
      if (viewType !== 'dayGridMonth' && calendarRef.current) {
        calendarRef.current.getApi().changeView('dayGridMonth');
        setViewType('dayGridMonth');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewType]);

  // --- 1. USERNAME LOGIN ---
  const handleUsernameLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMsg('');
    try {
      const userDocRef = doc(db, "usernames", username.toLowerCase());
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setLoginError("Username not found.");
        return;
      }

      const realEmail = userDoc.data().email;
      await signInWithEmailAndPassword(auth, realEmail, password);
    } catch (error) {
      setLoginError("Invalid username or password.");
      console.error("Login failed:", error.code);
    }
  };

  // --- 2. REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMsg('');

    if (username.length < 3) { setLoginError("Username too short."); return; }

    try {
      const userDocRef = doc(db, "usernames", username.toLowerCase());
      const checkDoc = await getDoc(userDocRef);
      if (checkDoc.exists()) {
        setLoginError("Username already taken.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      let newUser = userCredential.user;
      
      await updateProfile(newUser, {
        displayName: displayName || username, 
        photoURL: newUser.photoURL || `https://ui-avatars.com/api/?name=${(displayName || username).replace(' ', '+')}&background=1a73e8&color=fff`
      });

      await setDoc(userDocRef, { email: email, uid: newUser.uid });

      await signOut(auth);
      setIsRegistering(false);
      setSuccessMsg("Account created! Please sign in.");
      setUsername(''); setPassword(''); setEmail('');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') setLoginError("Email already registered.");
      else if (error.code === 'auth/weak-password') setLoginError("Password too weak.");
      else setLoginError("Error: " + error.message);
    }
  };

  // --- 3. FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Reset link sent! Check your Inbox and Spam folder.");
      setIsForgotPassword(false);
    } catch (error) {
      setLoginError("Error: " + error.message);
    }
  };

  // --- 4. EDIT PROFILE ---
  const handleUpdateProfile = async () => {
    try {
      if (displayName) await updateProfile(user, { displayName });
      if (newPassword) await updatePassword(user, newPassword);
      alert("Profile updated successfully!");
      setShowEditProfile(false);
      setShowProfileMenu(false);
      setNewPassword('');
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  const handleLogout = () => { if(confirm("Log out?")) { signOut(auth); setSidebarOpen(false); setShowProfileMenu(false); } };
  
  // -- Calendar Logic --
  const handleSaveEvent = async () => {
    if (newEvent.title && user) {
      setModalOpen(false);
      await addDoc(collection(db, "events"), { uid: user.uid, title: newEvent.title, start: newEvent.start, backgroundColor: newEvent.color, borderColor: newEvent.color });
    }
  };
  const handleEventClick = async (info) => { if (confirm(`Delete "${info.event.title}"?`)) await deleteDoc(doc(db, "events", info.event.id)); };
  const handleDatesSet = (dateInfo) => setCurrentTitle(dateInfo.view.title);
  
  const handleDateClick = (arg) => {
    // IMPORTANT: Ensure we just get YYYY-MM-DD even if clicked on a time slot
    const cleanDate = arg.dateStr.split('T')[0];
    setSelectedDate(cleanDate);

    if (calendarRef.current && calendarRef.current.getApi().view.type === 'dayGridMonth') {
      window.history.pushState({ view: 'day' }, '');
      calendarRef.current.getApi().changeView('timeGridDay', cleanDate);
      setViewType('timeGridDay');
    }
  };

  const handleFabClick = (type) => {
    setFabOpen(false); 
    let defaultTitle = ""; let defaultColor = "#4285F4";
    if (type === 'Task') { defaultTitle = "Task: "; defaultColor = "#0B8043"; }
    if (type === 'Birthday') { defaultTitle = "Birthday: "; defaultColor = "#F4511E"; }
    setNewEvent({ title: defaultTitle, start: selectedDate, color: defaultColor });
    setModalOpen(true);
  };
  const getGreeting = () => { const h = new Date().getHours(); return h<12?"Good Morning":h<18?"Good Afternoon":"Good Evening"; };

  // --- VIEW SWITCHER ---
  if (loading) return <div style={{height:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background: '#121212', color: 'white'}}>Loading...</div>;
  
  // PAGE 1: LOGIN (Fixed Layout with position:fixed)
  if (!user) return (
    <div style={{
      position: 'fixed', // Forces full screen coverage
      top: 0, left: 0, width: '100vw', height: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/church.jpg')",
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      padding: '20px', boxSizing: 'border-box', overflow: 'hidden', margin: 0
    }}>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', 
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255, 255, 255, 0.18)', 
        padding: '30px 20px', borderRadius: '24px', textAlign: 'center', 
        width: '100%', maxWidth: '350px' 
      }}>
        <h1 style={{color: 'white', margin: '0 0 8px 0', fontSize: '26px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
          {isForgotPassword ? 'Reset Password' : isRegistering ? 'Create Account' : 'Neeloor Parish'}
        </h1>
        <p style={{color: 'rgba(255,255,255,0.85)', marginBottom: '25px', fontSize: '13px', fontWeight: '400'}}>
          {isForgotPassword ? 'Enter email to reset.' : isRegistering ? 'Join our community app.' : 'Welcome back, please sign in.'}
        </p>

        {loginError && <div style={{color: '#ffcccc', fontSize:'13px', background:'rgba(255,0,0,0.25)', padding:'8px 12px', borderRadius:'12px', marginBottom:'15px', textAlign:'left', border:'1px solid rgba(255,0,0,0.2)'}}>{loginError}</div>}
        {successMsg && <div style={{color: '#ccffcc', fontSize:'13px', background:'rgba(0,255,0,0.25)', padding:'8px 12px', borderRadius:'12px', marginBottom:'15px', textAlign:'left', border:'1px solid rgba(0,255,0,0.2)'}}>{successMsg}</div>}

        {/* --- FORM 1: FORGOT PASSWORD --- */}
        {isForgotPassword && (
          <form onSubmit={handleForgotPassword}>
            <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{width:'100%', padding:'14px 20px', margin:'0 0 20px', border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} 
            />
            <button type="submit" style={{width:'100%', padding:'14px', border:'none', background:'#1a73e8', color:'white', borderRadius:'30px', fontWeight:'600', fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.2)'}}>Send Reset Link</button>
            <button type="button" onClick={() => setIsForgotPassword(false)} style={{background:'none', border:'none', color:'white', marginTop:'15px', fontSize:'13px', opacity:'0.9'}}>Back to Login</button>
          </form>
        )}

        {/* --- FORM 2: REGISTER --- */}
        {!isForgotPassword && isRegistering && (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required 
              style={{width:'100%', padding:'14px 20px', margin:'0 0 12px', border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required 
              style={{width:'100%', padding:'14px 20px', margin:'0 0 12px', border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{width:'100%', padding:'14px 20px', margin:'0 0 12px', border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} />
            
            {/* REGISTER PASSWORD INPUT WITH EYE */}
            <div style={{position:'relative', width:'100%', marginBottom:'20px'}}>
              <input type={showRegisterPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{width:'100%', padding:'14px 50px 14px 20px', margin:0, border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} />
              <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', opacity:0.6}}>
                {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button type="submit" style={{width:'100%', padding:'14px', border:'none', background:'#1a73e8', color:'white', borderRadius:'30px', fontWeight:'600', fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.2)'}}>Create Account</button>
            <button type="button" onClick={() => setIsRegistering(false)} style={{background:'none', border:'none', color:'white', marginTop:'15px', fontSize:'13px', opacity:'0.9'}}>Login instead</button>
          </form>
        )}

        {/* --- FORM 3: LOGIN --- */}
        {!isForgotPassword && !isRegistering && (
          <form onSubmit={handleUsernameLogin}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required 
              style={{width:'100%', padding:'14px 20px', margin:'0 0 12px', border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} 
            />
            
            {/* LOGIN PASSWORD INPUT WITH EYE */}
            <div style={{position:'relative', width:'100%', marginBottom:'12px'}}>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{width:'100%', padding:'14px 50px 14px 20px', margin:0, border:'none', borderRadius:'30px', background:'rgba(255,255,255,0.9)', fontSize:'15px', boxSizing:'border-box', outline:'none'}} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', opacity:0.6}}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'20px', paddingRight:'10px'}}>
              <button type="button" onClick={() => setIsForgotPassword(true)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.9)', fontSize:'12px', cursor:'pointer'}}>Forgot Password?</button>
            </div>
            <button type="submit" style={{width:'100%', padding:'14px', border:'none', background:'#1a73e8', color:'white', borderRadius:'30px', fontWeight:'600', fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.2)'}}>Sign In</button>
            <div style={{display:'flex', alignItems:'center', margin:'20px 0', opacity:'0.6'}}>
              <div style={{flex:1, height:'1px', background:'white'}}></div>
              <span style={{padding:'0 10px', color:'white', fontSize:'12px'}}>OR</span>
              <div style={{flex:1, height:'1px', background:'white'}}></div>
            </div>
            <button type="button" onClick={handleGoogleLogin} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', background: 'white', color: '#3c4043', borderRadius: '30px', fontWeight:'500', fontSize:'14px', cursor:'pointer', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
              <div style={{width:'18px', height:'18px'}}><svg width="100%" height="100%" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></div>
              Continue with Google
            </button>
            <button type="button" onClick={() => setIsRegistering(true)} style={{background:'none', border:'none', color:'white', marginTop:'20px', fontSize:'13px', opacity:'0.9'}}>New here? <span style={{fontWeight:'bold', textDecoration:'underline'}}>Create Account</span></button>
          </form>
        )}
      </div>
      <div style={{marginTop:'auto', paddingBottom:'20px', color:'rgba(255,255,255,0.6)', fontSize:'11px', fontWeight:'400'}}>© 2025 Neeloor Parish</div>
    </div>
  );

  // PAGE 2: CALENDAR (Fixed Full Height)
  return (
    <div className="mobile-container" style={{height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden'}}>
      {/* INJECTED STYLES FOR HIGHLIGHTING */}
      <style>{`
        /* Highlight specific day cell/column in any grid view */
        .fc-day[data-date="${selectedDate}"] {
          background-color: rgba(26, 115, 232, 0.15) !important;
        }
        /* Highlight List View header */
        .fc-list-day-cushion[data-date="${selectedDate}"] {
          background-color: rgba(26, 115, 232, 0.15) !important;
        }
      `}</style>

      <header className="mobile-header" style={{flexShrink: 0}}>
        <div className="header-left">
          <button className="icon-btn" onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
          <div style={{display:'flex', flexDirection:'column', marginLeft:'8px'}}>
            <span className="header-title" style={{fontSize:'18px', lineHeight:'1.2'}}>{currentTitle}</span>
            <span style={{fontSize:'11px', color:'#70757a'}}>{getGreeting()}, {user.displayName}</span>
          </div>
        </div>
        
        {/* PROFILE DROPDOWN */}
        <div className="header-right" style={{position:'relative'}}>
          <button className="icon-btn" onClick={() => alert('Search...')}><SearchIcon /></button>
          <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer'}} 
               onClick={() => setShowProfileMenu(!showProfileMenu)} />
          
          {showProfileMenu && (
            <div style={{
              position:'absolute', top:'45px', right:'0', background:'white', borderRadius:'8px', 
              boxShadow:'0 4px 12px rgba(0,0,0,0.15)', width:'150px', overflow:'hidden', zIndex:100
            }}>
              <div onClick={() => {setShowEditProfile(true); setShowProfileMenu(false)}} style={{padding:'12px', fontSize:'14px', color:'#3c4043', cursor:'pointer', borderBottom:'1px solid #f1f3f4'}}>Edit Profile</div>
              <div onClick={handleLogout} style={{padding:'12px', fontSize:'14px', color:'#d93025', cursor:'pointer'}}>Sign Out</div>
            </div>
          )}
        </div>
      </header>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <>
          <div className="sidebar-overlay" style={{zIndex:98}} onClick={() => setShowEditProfile(false)}></div>
          <div className="modal" style={{zIndex:99}}>
            <h3>Edit Profile</h3>
            <p style={{fontSize:'12px', color:'#5f6368', marginBottom:'15px'}}>Update your name or password.</p>
            <input type="text" placeholder="New Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #dadce0', borderRadius:'4px', boxSizing:'border-box'}} />
            
            {/* EDIT PROFILE PASSWORD INPUT WITH EYE */}
            <div style={{position:'relative', width:'100%', marginBottom:'20px'}}>
              <input type={showNewPassword ? "text" : "password"} placeholder="New Password (Optional)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                style={{width:'100%', padding:'10px 40px 10px 10px', margin:0, border:'1px solid #dadce0', borderRadius:'4px', boxSizing:'border-box'}} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', opacity:0.6}}>
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
              <button onClick={() => setShowEditProfile(false)} style={{padding:'8px 16px', border:'none', background:'none', color:'#5f6368', cursor:'pointer'}}>Cancel</button>
              <button onClick={handleUpdateProfile} style={{padding:'8px 16px', border:'none', background:'#1a73e8', color:'white', borderRadius:'4px', cursor:'pointer'}}>Save Changes</button>
            </div>
          </div>
        </>
      )}

      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
          <div className="sidebar">
            <div className="sidebar-header" style={{flexDirection:'column', alignItems:'flex-start', gap:'5px'}}>
              <span style={{fontSize:'20px', fontWeight:'bold', color:'#1a73e8'}}>Neeloor Parish</span>
              <span style={{fontSize:'14px', color:'#5f6368', fontWeight:'normal'}}>{user.email}</span>
            </div>
            <div style={{padding:'10px 0'}}>
              <div className={`menu-item ${viewType === 'listWeek' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('listWeek'); setViewType('listWeek'); setSidebarOpen(false); }}>Schedule</div>
              <div className={`menu-item ${viewType === 'dayGridMonth' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('dayGridMonth'); setViewType('dayGridMonth'); setSidebarOpen(false); }}>Month</div>
              <div className={`menu-item ${viewType === 'timeGridWeek' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('timeGridWeek'); setViewType('timeGridWeek'); setSidebarOpen(false); }}>Week</div>
              <hr style={{border:'none', borderTop:'1px solid #f1f3f4', margin:'10px 20px'}} />
              <div style={{padding:'0 24px'}}>
                <span style={{fontSize:'12px', color:'#5f6368', fontWeight:'500', display:'block', marginBottom:'5px'}}>JUMP TO DATE</span>
                <input type="date" onChange={(e) => { calendarRef.current.getApi().gotoDate(e.target.value); setSelectedDate(e.target.value); setSidebarOpen(false); }} style={{width:'100%', padding:'8px', border:'1px solid #dadce0', borderRadius:'4px', color:'#3c4043'}} />
              </div>
              <div style={{padding:'20px 24px', marginTop:'20px'}}>
                <button onClick={handleLogout} style={{width:'100%', padding:'10px', background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:'8px', cursor:'pointer'}}>Sign Out</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- CALENDAR WRAPPER (Fills remaining space) --- */}
      <div className="calendar-wrapper" {...swipeHandlers} style={{flex: 1, overflow: 'hidden'}}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="100%"
          editable={true}
          selectable={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          views={{
            dayGridMonth: { dayHeaderFormat: { weekday: 'narrow' } },
            timeGridWeek: { dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true } },
            timeGridDay: { dayHeaderFormat: { weekday: 'long', day: 'numeric' } }
          }}
          // dayCellClassNames removed because we are using global CSS injection now
        />
      </div>

      {/* --- SPEED DIAL MENU --- */}
      {fabOpen && (
        <div style={{position:'fixed', bottom:'90px', right:'24px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px', zIndex:45}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <span style={{background:'white', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px', color:'#3c4043'}}>Event</span>
            <button onClick={() => handleFabClick('Event')} style={{width:'48px', height:'48px', borderRadius:'50%', background:'#4285F4', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><EventIcon /></button>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <span style={{background:'white', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px', color:'#3c4043'}}>Task</span>
            <button onClick={() => handleFabClick('Task')} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#0B8043', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><TaskIcon /></button>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <span style={{background:'white', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px', color:'#3c4043'}}>Birthday</span>
            <button onClick={() => handleFabClick('Birthday')} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F4511E', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><GiftIcon /></button>
          </div>
        </div>
      )}

      {/* Main Plus Button */}
      <button className="fab-btn" onClick={() => setFabOpen(!fabOpen)} style={{transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition:'transform 0.2s'}}>
        <div className="plus-icon"></div>
      </button>

      {/* --- MODAL --- */}
      {modalOpen && (
        <>
          <div className="sidebar-overlay" style={{zIndex: 90}}></div>
          <div className="modal">
            <input style={{fontSize:'22px', border:'none', outline:'none', width:'100%', marginBottom:'10px'}} type="text" placeholder="Add title" value={newEvent.title} autoFocus onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
            <p style={{fontSize:'12px', color:'#70757a', margin:'0 0 10px 0'}}>Date: {newEvent.start}</p>
            <hr style={{border:'none', borderBottom:'1px solid #f1f3f4', margin:'0 0 15px 0'}} />
            <div className="color-picker">
              {['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#9E69AF'].map(color => (
                <div key={color} className={`color-option ${newEvent.color === color ? 'selected' : ''}`} style={{backgroundColor: color}} onClick={() => setNewEvent({...newEvent, color})}></div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
              <button style={{background:'none', border:'none', color:'#5f6368', padding:'10px'}} onClick={() => setModalOpen(false)}>Cancel</button>
              <button style={{background:'#1a73e8', color:'white', border:'none', borderRadius:'4px', padding:'8px 24px'}} onClick={handleSaveEvent}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;