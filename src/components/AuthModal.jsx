import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, LogOut, CheckCircle, Package, Truck } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AuthModal({ user, login, signup, logout, onClose, orderHistory = [] }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }
    if (!isLoginView && (!firstName.trim() || !lastName.trim())) {
      setErrorMsg('Please enter your first name and last name.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const fullName = isLoginView ? '' : `${firstName.trim()} ${lastName.trim()}`.trim();

    if (supabase) {
      const emailLower = email.trim().toLowerCase();
      // Guarantee Admin Access with designated credentials
      if (emailLower === 'tharanichandrasekaran2000@gmail.com' && isLoginView) {
        if (password === 'Remedy@1234567890') {
          setIsLoading(false);
          setStatusMsg('Supabase Auth: Success! Admin session initiated.');
          login({ email: 'tharanichandrasekaran2000@gmail.com', name: 'Tharani Admin' });
          setTimeout(() => {
            onClose();
          }, 600);
          return;
        } else {
          setIsLoading(false);
          setErrorMsg('Invalid credentials. Please enter the correct password for your Administrator account.');
          setStatusMsg('');
          return;
        }
      }

      setStatusMsg(isLoginView ? 'Connecting to Supabase Auth...' : 'Creating profile on Supabase DB...');
      try {
        if (isLoginView) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
          });
          setIsLoading(false);
          if (error) {
            setErrorMsg(error.message || 'Failed to authenticate.');
            setStatusMsg('');
          } else if (data.user) {
            // Fetch profile name
            const { data: customerProfile } = await supabase
              .from('customers')
              .select('*')
              .eq('id', data.user.id)
              .single();

            login({
              id: data.user.id,
              email: data.user.email,
              name: customerProfile ? customerProfile.name : (data.user.user_metadata?.name || data.user.email.split('@')[0])
            });
            setStatusMsg('Supabase: Authentication successful!');
            setTimeout(() => {
              onClose();
            }, 600);
          }
        } else {
          // Signup
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                name: fullName || email.split('@')[0]
              }
            }
          });
          setIsLoading(false);
          if (error) {
            setErrorMsg(error.message || 'Registration failed.');
            setStatusMsg('');
          } else {
            setStatusMsg('Couture profile created! Please log in.');
            setIsLoginView(true);
            // Clear signup fields
            setFirstName('');
            setLastName('');
          }
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMsg('Auth connection failed.');
        setStatusMsg('');
      }
      return;
    }

    // Simulate Supabase response delay
    setStatusMsg(isLoginView ? 'Supabase: Querying user session...' : 'Supabase: Registering new profile entry...');
    setTimeout(() => {
      setIsLoading(false);
      
      const emailLower = email.trim().toLowerCase();
      
      // Strict Admin Credentials Check
      if (emailLower === 'tharanichandrasekaran2000@gmail.com') {
        if (password !== 'Remedy@1234567890') {
          setErrorMsg('Invalid credentials. Please enter the correct password for your Administrator account.');
          setStatusMsg('');
          return;
        }
        login({ email: 'tharanichandrasekaran2000@gmail.com', name: 'Tharani Admin' });
        setStatusMsg('Supabase Auth: Success! Admin session initiated.');
        onClose();
        return;
      }

      if (isLoginView) {
        login({ email, name: email.split('@')[0] });
        setStatusMsg('Supabase Auth: Success! Session initiated.');
        onClose();
      } else {
        signup({ email, name: fullName || email.split('@')[0] });
        setStatusMsg('Supabase Auth: Account created in public.users!');
        setIsLoginView(true);
        setFirstName('');
        setLastName('');
      }
    }, 1200);
  };

  return (
    <div className="overlay modal-overlay" onClick={onClose}>
      <div className="auth-modal animate-slideDown" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {user ? (
          // Logged In View (Profile & Order History)
          <div className="profile-container-view">
            <div className="profile-header">
              <div className="avatar-circle">
                <User size={32} />
              </div>
              <h3 className="profile-name" style={{ margin: '8px 0 2px 0', fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{user.name || user.email.split('@')[0]}</h3>
              <p className="profile-email" style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>{user.email}</p>
              <span className="profile-badge">{user.email === 'tharanichandrasekaran2000@gmail.com' ? 'Store Administrator' : 'Loyalty Member'}</span>
            </div>

            <hr className="detail-divider" />

            <div className="profile-orders-section">
              <h4 className="section-subtitle-small">
                <Package size={16} />
                <span>Your Order History ({orderHistory.length})</span>
              </h4>

              {orderHistory.length > 0 ? (
                <div className="profile-orders-list">
                   {orderHistory.map((order, idx) => {
                     const isCustomOrder = order.items.some(item => item.wantsCustomStitching);
                     
                     // Sizing & Delivery progress percentages
                     const getProgressPct = (status, custom) => {
                       if (custom) {
                         switch(status) {
                           case 'Pending Stitching': return 15;
                           case 'Pattern Drafting': return 35;
                           case 'Stitching in Progress': return 55;
                           case 'Quality Check': return 75;
                           case 'Shipped': return 90;
                           case 'Delivered': return 100;
                           default: return 15;
                         }
                       } else {
                         switch(status) {
                           case 'Pending Shipment': return 25;
                           case 'Quality Check': return 55;
                           case 'Shipped': return 80;
                           case 'Delivered': return 100;
                           default: return 25;
                         }
                       }
                     };
                     
                     const pct = getProgressPct(order.status, isCustomOrder);

                     return (
                       <div key={idx} className="order-history-card">
                         <div className="order-header-row">
                           <span className="order-id">Order: <strong>{order.id}</strong></span>
                           <span className={`order-status-pill status-${order.status ? order.status.toLowerCase().replace(/\s+/g, '-') : 'placed'}`}>
                             {order.status || 'Placed'}
                           </span>
                         </div>
                         
                         {/* Visual Progress Bar */}
                         <div className="order-tracking-bar-container">
                           <div className="tracking-bar-rail">
                             <div className="tracking-bar-progress" style={{ width: `${pct}%` }}></div>
                           </div>
                           <div className="tracking-labels-row">
                             <span className={pct >= 15 ? 'active' : ''}>{isCustomOrder ? 'Drafting' : 'Placed'}</span>
                             <span className={pct >= 55 ? 'active' : ''}>{isCustomOrder ? 'Stitching' : 'Approved'}</span>
                             <span className={pct >= 90 ? 'active' : ''}>Shipped</span>
                             <span className={pct >= 100 ? 'active' : ''}>Delivered</span>
                           </div>
                         </div>

                         {order.trackingNumber && (
                           <p className="order-tracking-number-label">
                             <Truck size={14} style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.8 }} />
                             <span>Delhivery Tracking: <strong>{order.trackingNumber}</strong></span>
                           </p>
                         )}

                         <div className="order-summary-row">
                           <span>{order.items.length} item(s) • {isCustomOrder ? 'Bespoke Tailored' : 'Standard sizes'}</span>
                           <span className="red-totals">Total: <strong className="total-amount-red">₹{order.total.toLocaleString('en-IN')}</strong></span>
                         </div>
                         {order.notes && (
                           <div className="order-customer-note-callout">
                             <strong>Special Instruction:</strong> "{order.notes}"
                           </div>
                         )}
                         <div className="order-date-row">
                           <span>Payment: COD ({order.paymentId})</span>
                           <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                         </div>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="no-orders-state">
                  <p>You haven't placed any orders yet.</p>
                </div>
              )}
            </div>

            <button className="logout-btn-large" onClick={() => { logout(); onClose(); }}>
              <LogOut size={16} />
              <span>Sign Out of Session</span>
            </button>
          </div>
        ) : (
          // Login/Signup Form
          <div className="auth-form-container">
            <div className="auth-header">
              <h3>{isLoginView ? 'Customer Portal' : 'Create Couture Account'}</h3>
              <p>{isLoginView ? 'Sign in to access saved sizing profile and track orders.' : 'Sign up to register your custom sizes in our master database.'}</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              {!isLoginView && (
                <div className="form-row-double" style={{ marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>First Name *</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="e.g. Priyal" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Last Name *</label>
                    <div className="input-with-icon">
                      <User size={16} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="e.g. Sharma" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="e.g. name@gmail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {errorMsg && <p className="auth-error-msg">{errorMsg}</p>}
              {statusMsg && (
                <div className="supabase-status-log">
                  <span className="supabase-dot animate-ping"></span>
                  <p>{statusMsg}</p>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : isLoginView ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-toggle-row">
              {isLoginView ? (
                <span>New to InibyMaya? <button onClick={() => setIsLoginView(false)}>Create account</button></span>
              ) : (
                <span>Have an account? <button onClick={() => setIsLoginView(true)}>Login here</button></span>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
