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

// --- CALENDAR ICONS ---
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>;
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>;
const SearchIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const EventIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>;
const TaskIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"/></svg>;
const GiftIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"/></svg>;
const SunIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#FDB813"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>;
const MoonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#9CA3AF"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>;

// --- LOGIN ICONS ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.7}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.7}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.7}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,7.336,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>;

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
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', color: '#4285F4', allDay: true });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fabOpen, setFabOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  // --- LOGIN & UI STATES ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- FORM DATA ---
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const swipeHandlers = useSwipeable({ onSwipedLeft: () => { if (calendarRef.current) calendarRef.current.getApi().next(); }, onSwipedRight: () => { if (calendarRef.current) calendarRef.current.getApi().prev(); }, preventScrollOnSwipe: true, trackMouse: true });

  // -- Effects --
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!successMsg) setLoginError('');
    });
    return () => unsubscribe();
  }, [successMsg]);

  useEffect(() => { localStorage.setItem('appTheme', theme); }, [theme]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "events"), where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else { setEvents([]); }
  }, [user]);

  // Handle Hardware Back Button
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

  const toggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light'); };

  // --- AUTH LOGIC ---
  const handleUsernameLogin = async (e) => { e.preventDefault(); setLoginError(''); try { const d = await getDoc(doc(db, "usernames", username.toLowerCase())); if (!d.exists()) { setLoginError("User not found"); return; } await signInWithEmailAndPassword(auth, d.data().email, password); } catch (e) { setLoginError("Login failed"); } };
  const handleRegister = async (e) => { e.preventDefault(); setLoginError(''); if (username.length < 3) { setLoginError("Username too short"); return; } try { const d = await getDoc(doc(db, "usernames", username.toLowerCase())); if (d.exists()) { setLoginError("Username taken"); return; } const u = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(u.user, { displayName: displayName || username, photoURL: `https://ui-avatars.com/api/?name=${(displayName||username).replace(' ','+')}&background=1a73e8&color=fff` }); await setDoc(doc(db, "usernames", username.toLowerCase()), { email: email, uid: u.user.uid }); await signOut(auth); setIsRegistering(false); setSuccessMsg("Created! Please sign in."); setUsername(''); setPassword(''); setEmail(''); } catch (e) { setLoginError(e.message); } };
  const handleForgotPassword = async (e) => { e.preventDefault(); try { await sendPasswordResetEmail(auth, email); setSuccessMsg("Reset link sent!"); setIsForgotPassword(false); } catch (e) { setLoginError(e.message); } };
  const handleUpdateProfile = async () => { try { if (displayName) await updateProfile(user, { displayName }); if (newPassword) await updatePassword(user, newPassword); alert("Updated!"); setShowEditProfile(false); setShowProfileMenu(false); setNewPassword(''); } catch (e) { alert(e.message); } };
  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  const handleLogout = () => { if(confirm("Log out?")) { signOut(auth); setSidebarOpen(false); setShowProfileMenu(false); } };
  
  // --- CALENDAR INTERACTIONS ---
  const handleDateClick = (arg) => {
    const isMonthView = arg.view.type === 'dayGridMonth';
    if (isMonthView) {
      const clickedDate = arg.dateStr;
      if (selectedDate === clickedDate) {
        calendarRef.current.getApi().changeView('timeGridDay', clickedDate);
        setViewType('timeGridDay');
        window.history.pushState({ view: 'day' }, '');
      } else {
        setSelectedDate(clickedDate);
      }
    } else {
      const startT = arg.date;
      const endT = new Date(startT);
      endT.setHours(endT.getHours() + 1);
      const offset = startT.getTimezoneOffset() * 60000;
      const sLocal = new Date(startT.getTime() - offset).toISOString().slice(0, 16);
      const eLocal = new Date(endT.getTime() - offset).toISOString().slice(0, 16);
      setNewEvent({ title: '', start: sLocal, end: eLocal, allDay: arg.allDay, color: '#4285F4' });
      setModalOpen(true);
    }
  };

  const handleDateSelect = (selectInfo) => {
    const startObj = new Date(selectInfo.startStr);
    const endObj = new Date(selectInfo.endStr);
    const offset = startObj.getTimezoneOffset() * 60000;
    const sLocal = new Date(startObj.getTime() - offset).toISOString().slice(0, 16);
    const eLocal = new Date(endObj.getTime() - offset).toISOString().slice(0, 16);
    setNewEvent({ title: '', start: sLocal, end: eLocal, allDay: selectInfo.allDay, color: '#4285F4' });
    setModalOpen(true);
  };

  const handleFabClick = (type) => {
    setFabOpen(false); 
    setNewEvent({ title: '', start: selectedDate, end: '', color: type === 'Task' ? '#0B8043' : type === 'Birthday' ? '#F4511E' : '#4285F4', allDay: true });
    setModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (newEvent.title && user) {
      setModalOpen(false);
      if (calendarRef.current) calendarRef.current.getApi().unselect();
      await addDoc(collection(db, "events"), { 
        uid: user.uid, title: newEvent.title, start: newEvent.start, end: newEvent.end || null, allDay: newEvent.allDay, backgroundColor: newEvent.color, borderColor: newEvent.color 
      });
    }
  };

  // Prevent Delete in Month View
  const handleEventClick = async (info) => { 
    if (info.view.type === 'dayGridMonth') return; 
    if (confirm(`Delete "${info.event.title}"?`)) await deleteDoc(doc(db, "events", info.event.id));
  };

  const handleDatesSet = (dateInfo) => setCurrentTitle(dateInfo.view.title);
  const getGreeting = () => { const h = new Date().getHours(); return h<12?"Good Morning":h<18?"Good Afternoon":"Good Evening"; };

  if (loading) return <div style={{height:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background: '#121212', color: 'white'}}>Loading...</div>;
  
  // --- LOGIN UI (FIXED) ---
  if (!user) return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/church.jpg')",
      backgroundSize: 'cover', backgroundPosition: 'center', fontFamily: "sans-serif"
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '40px 30px', borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        width: '90%', maxWidth: '400px', textAlign: 'center', color: 'white',
        boxSizing: 'border-box' // Ensure padding doesn't overflow width
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Neeloor Parish</h1>
        <p style={{ fontSize: '15px', opacity: 0.9, margin: '0 0 30px 0' }}>{isForgotPassword ? "Reset Password" : isRegistering ? "Create Account" : "Sign In"}</p>

        {loginError && <div style={{ background: 'rgba(220, 53, 69, 0.8)', padding: '10px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{loginError}</div>}
        {successMsg && <div style={{ background: 'rgba(40, 167, 69, 0.8)', padding: '10px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px' }}>{successMsg}</div>}

        <form onSubmit={isForgotPassword ? handleForgotPassword : (isRegistering ? handleRegister : handleUsernameLogin)}>
          {isRegistering && !isForgotPassword && <InputWithIcon icon={<UserIcon />} type="text" placeholder="Full Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />}
          {!isForgotPassword && <InputWithIcon icon={<UserIcon />} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />}
          {(isRegistering || isForgotPassword) && <InputWithIcon icon={<EmailIcon />} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
          
          {!isForgotPassword && (
            <div style={{ position: 'relative', marginBottom: '20px', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><LockIcon /></div>
              {/* PASSWORD INPUT WITH FIXED STYLING */}
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{
                  width: '100%', maxWidth: '100%', padding: '14px 50px 14px 45px', border: 'none', borderRadius: '50px', 
                  background: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', outline: 'none', boxSizing: 'border-box', color: '#333'
                }} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}>{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
          )}

          {!isRegistering && !isForgotPassword && <div style={{ textAlign: 'right', marginBottom: '25px' }}><button type="button" onClick={() => setIsForgotPassword(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', opacity: 0.9, textDecoration: 'underline' }}>Forgot Password?</button></div>}

          <button type="submit" style={{width: '100%', padding: '14px', border: 'none', borderRadius: '50px', background: 'linear-gradient(135deg, #1e3c72, #2a5298)', color: 'white', fontSize: '18px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 5px 15px rgba(42, 82, 152, 0.4)', marginBottom: isForgotPassword ? '20px' : '0'}}>{isForgotPassword ? "Send Link" : isRegistering ? "Sign Up" : "Sign In"}</button>
        </form>

        {isForgotPassword && <button type="button" onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer', textDecoration: 'underline', opacity: 0.9 }}>Back to Login</button>}

        {!isForgotPassword && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}><div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div><span style={{ padding: '0 15px', fontSize: '14px', opacity: 0.8 }}>OR</span><div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div></div>
            <button onClick={handleGoogleLogin} style={{width: '100%', padding: '12px', border: 'none', borderRadius: '50px', background: 'white', color: '#333', fontSize: '16px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}><GoogleIcon /> Continue with Google</button>
            <div style={{ marginTop: '30px', fontSize: '15px' }}><span style={{ opacity: 0.9 }}>{isRegistering ? "Have an account? " : "New here? "}</span><button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer', textDecoration: 'underline' }}>{isRegistering ? "Sign In" : "Register"}</button></div>
          </>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>© 2025 Neeloor Parish</div>
    </div>
  );

  const appStyle = {
    '--bg-color': theme === 'dark' ? '#121212' : '#ffffff',
    '--text-color': theme === 'dark' ? '#e0e0e0' : '#3c4043',
    '--header-text': theme === 'dark' ? '#ffffff' : '#3c4043',
    '--sub-text': theme === 'dark' ? '#a0a0a0' : '#70757a',
    '--cal-border': theme === 'dark' ? '#333333' : '#dadce0',
    '--sidebar-bg': theme === 'dark' ? '#1e1e1e' : '#ffffff',
    '--input-bg': theme === 'dark' ? '#2c2c2c' : '#ffffff',
    '--input-border': theme === 'dark' ? '#444444' : '#dadce0',
    '--highlight-bg': theme === 'dark' ? 'rgba(66, 133, 244, 0.25)' : 'rgba(26, 115, 232, 0.15)',
  };

  return (
    <div className="mobile-container" style={{height:'100dvh', display:'flex', flexDirection:'column', overflow:'hidden', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', ...appStyle}}>
      <style>{`
        .fc-daygrid-day-frame { overflow: hidden !important; max-height: 100% !important; }
        .fc-daygrid-event { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-radius: 4px; font-size: 11px; padding: 1px 4px; }
        .fc-highlight { background: rgba(66, 133, 244, 0.15) !important; border: 2px solid #4285F4 !important; border-radius: 6px !important; opacity: 1 !important; }
        .fc-day[data-date="${selectedDate}"] .fc-daygrid-day-frame { background-color: var(--highlight-bg) !important; border: 2px solid #4285F4; border-radius: 8px; box-shadow: 0 0 8px rgba(66, 133, 244, 0.4); }
        .fc-col-header-cell.fc-day-sun a, .fc-col-header-cell.fc-day-sat a, .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number, .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number { color: #ea4335 !important; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--cal-border) !important; }
        .fc-col-header-cell-cushion, .fc-daygrid-day-number, .fc-list-day-text, .fc-list-day-side-text { color: var(--text-color) !important; }
        .fc-timegrid-slot-label-cushion { color: var(--sub-text) !important; }
      `}</style>

      <header className="mobile-header" style={{flexShrink: 0, borderBottom: '1px solid var(--cal-border)', backgroundColor: 'var(--bg-color)'}}>
        <div className="header-left">
          {viewType === 'dayGridMonth' ? ( <button className="icon-btn" onClick={() => setSidebarOpen(true)} style={{color: 'var(--text-color)'}}><MenuIcon /></button> ) : ( <button className="icon-btn" onClick={() => {calendarRef.current.getApi().changeView('dayGridMonth'); setViewType('dayGridMonth');}} style={{color: 'var(--text-color)'}}><BackIcon /></button> )}
          <div style={{display:'flex', flexDirection:'column', marginLeft:'8px'}}><span className="header-title" style={{fontSize:'18px', lineHeight:'1.2', color: 'var(--header-text)'}}>{currentTitle}</span><span style={{fontSize:'11px', color: 'var(--sub-text)'}}>{getGreeting()}, {user.displayName}</span></div>
        </div>
        <div className="header-right" style={{position:'relative'}}>
          <button className="icon-btn" onClick={() => alert('Search...')} style={{color: 'var(--text-color)'}}><SearchIcon /></button>
          <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer'}} onClick={() => setShowProfileMenu(!showProfileMenu)} />
          {showProfileMenu && (
            <div style={{position:'absolute', top:'45px', right:'0', background:'var(--sidebar-bg)', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.3)', width:'150px', overflow:'hidden', zIndex:100, border: '1px solid var(--cal-border)'}}>
              <div onClick={() => {setShowEditProfile(true); setShowProfileMenu(false)}} style={{padding:'12px', fontSize:'14px', color:'var(--text-color)', cursor:'pointer', borderBottom:'1px solid var(--cal-border)'}}>Edit Profile</div>
              <div onClick={handleLogout} style={{padding:'12px', fontSize:'14px', color:'#d93025', cursor:'pointer'}}>Sign Out</div>
            </div>
          )}
        </div>
      </header>

      {showEditProfile && (
        <>
          <div className="sidebar-overlay" style={{zIndex:98}} onClick={() => setShowEditProfile(false)}></div>
          <div className="modal" style={{zIndex:99, background: 'var(--sidebar-bg)', color: 'var(--text-color)'}}>
            <h3>Edit Profile</h3>
            <input type="text" placeholder="New Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid var(--input-border)', borderRadius:'4px', background: 'var(--input-bg)', color: 'var(--text-color)'}} />
            <div style={{position:'relative', width:'100%', marginBottom:'20px'}}>
              <input type={showNewPassword ? "text" : "password"} placeholder="New Password (Optional)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{width:'100%', padding:'10px 40px 10px 10px', margin:0, border:'1px solid var(--input-border)', borderRadius:'4px', background: 'var(--input-bg)', color: 'var(--text-color)'}} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', opacity:0.6, color: 'var(--text-color)'}}>{showNewPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
              <button onClick={() => setShowEditProfile(false)} style={{padding:'8px 16px', border:'none', background:'none', color:'var(--sub-text)', cursor:'pointer'}}>Cancel</button>
              <button onClick={handleUpdateProfile} style={{padding:'8px 16px', border:'none', background:'#1a73e8', color:'white', borderRadius:'4px', cursor:'pointer'}}>Save Changes</button>
            </div>
          </div>
        </>
      )}

      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
          <div className="sidebar" style={{background: 'var(--sidebar-bg)'}}>
            <div className="sidebar-header" style={{flexDirection:'column', alignItems:'flex-start', gap:'5px', borderBottom: '1px solid var(--cal-border)'}}>
              <span style={{fontSize:'20px', fontWeight:'bold', color:'#1a73e8'}}>Neeloor Parish</span>
              <span style={{fontSize:'14px', color:'var(--sub-text)', fontWeight:'normal'}}>{user.email}</span>
            </div>
            <div style={{padding:'10px 0'}}>
              <div className={`menu-item ${viewType === 'listWeek' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('listWeek'); setViewType('listWeek'); setSidebarOpen(false); }} style={{color: 'var(--text-color)'}}>Schedule</div>
              <div className={`menu-item ${viewType === 'dayGridMonth' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('dayGridMonth'); setViewType('dayGridMonth'); setSidebarOpen(false); }} style={{color: 'var(--text-color)'}}>Month</div>
              <div className={`menu-item ${viewType === 'timeGridWeek' ? 'active' : ''}`} onClick={() => { calendarRef.current.getApi().changeView('timeGridWeek'); setViewType('timeGridWeek'); setSidebarOpen(false); }} style={{color: 'var(--text-color)'}}>Week</div>
              <hr style={{border:'none', borderTop:'1px solid var(--cal-border)', margin:'10px 20px'}} />
              <div onClick={toggleTheme} style={{padding:'10px 24px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', color: 'var(--text-color)'}}>{theme === 'light' ? <MoonIcon /> : <SunIcon />}<span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span></div>
              <hr style={{border:'none', borderTop:'1px solid var(--cal-border)', margin:'10px 20px'}} />
              <div style={{padding:'0 24px'}}>
                <span style={{fontSize:'12px', color:'var(--sub-text)', fontWeight:'500', display:'block', marginBottom:'5px'}}>JUMP TO DATE</span>
                <input type="date" onChange={(e) => { calendarRef.current.getApi().gotoDate(e.target.value); setSelectedDate(e.target.value); setSidebarOpen(false); }} style={{width:'100%', padding:'8px', border:'1px solid var(--input-border)', borderRadius:'4px', color:'var(--text-color)', background: 'var(--input-bg)'}} />
              </div>
              <div style={{padding:'20px 24px', marginTop:'20px'}}>
                <button onClick={handleLogout} style={{width:'100%', padding:'10px', background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:'8px', cursor:'pointer'}}>Sign Out</button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="calendar-wrapper" {...swipeHandlers} style={{flex: 1, overflow: 'hidden'}}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="100%"
          editable={true}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect} 
          events={events}
          dayMaxEvents={true} 
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }} 
          slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }} 
          allDaySlot={true}
          views={{
            dayGridMonth: { dayHeaderFormat: { weekday: 'narrow' } },
            timeGridWeek: { dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true } },
            timeGridDay: { dayHeaderFormat: { weekday: 'long', day: 'numeric' } } 
          }}
        />
      </div>

      {fabOpen && (
        <div style={{position:'fixed', bottom:'90px', right:'24px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px', zIndex:45}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{background:'var(--sidebar-bg)', color:'var(--text-color)', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px'}}>Event</span><button onClick={() => handleFabClick('Event')} style={{width:'48px', height:'48px', borderRadius:'50%', background:'#4285F4', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><EventIcon /></button></div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{background:'var(--sidebar-bg)', color:'var(--text-color)', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px'}}>Task</span><button onClick={() => handleFabClick('Task')} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#0B8043', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><TaskIcon /></button></div>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}><span style={{background:'var(--sidebar-bg)', color:'var(--text-color)', padding:'4px 8px', borderRadius:'4px', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', fontSize:'12px'}}>Birthday</span><button onClick={() => handleFabClick('Birthday')} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F4511E', border:'none', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}><GiftIcon /></button></div>
        </div>
      )}
      <button className="fab-btn" onClick={() => setFabOpen(!fabOpen)} style={{transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition:'transform 0.2s'}}><div className="plus-icon"></div></button>

      {modalOpen && (
        <>
          <div className="sidebar-overlay" style={{zIndex: 90}}></div>
          <div className="modal" style={{background: 'var(--sidebar-bg)', color: 'var(--text-color)'}}>
            <input style={{fontSize:'22px', border:'none', outline:'none', width:'100%', marginBottom:'10px', background: 'transparent', color: 'var(--text-color)'}} type="text" placeholder="Add title" value={newEvent.title} autoFocus onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
            <div style={{marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}><span style={{fontSize:'12px', color:'var(--sub-text)'}}>Starts</span><input type="datetime-local" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value, allDay: false})} style={{border:'1px solid var(--input-border)', borderRadius:'4px', padding:'6px', background:'var(--input-bg)', color:'var(--text-color)', fontSize:'13px'}} /></div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}><span style={{fontSize:'12px', color:'var(--sub-text)'}}>Ends</span><input type="datetime-local" value={newEvent.end} onChange={(e) => setNewEvent({...newEvent, end: e.target.value, allDay: false})} style={{border:'1px solid var(--input-border)', borderRadius:'4px', padding:'6px', background:'var(--input-bg)', color:'var(--text-color)', fontSize:'13px'}} /></div>
            </div>
            <hr style={{border:'none', borderBottom:'1px solid var(--cal-border)', margin:'0 0 15px 0'}} />
            <div className="color-picker">
              {['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#9E69AF'].map(color => (
                <div key={color} className={`color-option ${newEvent.color === color ? 'selected' : ''}`} style={{backgroundColor: color}} onClick={() => setNewEvent({...newEvent, color})}></div>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
              <button style={{background:'none', border:'none', color:'var(--sub-text)', padding:'10px'}} onClick={() => {setModalOpen(false); if(calendarRef.current) calendarRef.current.getApi().unselect();}}>Cancel</button>
              <button style={{background:'#1a73e8', color:'white', border:'none', borderRadius:'4px', padding:'8px 24px'}} onClick={handleSaveEvent}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const InputWithIcon = ({ icon, ...props }) => (
  <div style={{ position: 'relative', marginBottom: '20px', boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>{icon}</div>
    <input {...props} style={{
      width: '100%', maxWidth: '100%', padding: '14px 20px 14px 45px', border: 'none', borderRadius: '50px', 
      background: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', outline: 'none', boxSizing: 'border-box', color: '#333'
    }} />
  </div>
);

export default App;