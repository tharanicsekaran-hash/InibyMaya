import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, LogOut, CheckCircle, Package, Truck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { products as catalogProducts } from '../data/products';
import { formatGithubUrl } from './AdminDashboard';

export default function AuthModal({ user, login, signup, logout, onClose, orderHistory = [], onUpdateOrderStatus }) {
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
            let customerProfile = null;
            try {
              const { data: cData } = await supabase
                .from('customers')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();
              customerProfile = cData;
            } catch (e) {}

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

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setStatusMsg('Connecting to Google OAuth...');
    try {
      if (supabase) {
        const redirectTarget = typeof window !== 'undefined' 
          ? window.location.origin 
          : 'https://inibymaya.com';

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTarget
          }
        });
        if (error) {
          setErrorMsg(error.message || 'Google Sign-In failed.');
          setStatusMsg('');
        }
      } else {
        setErrorMsg('Supabase authentication service is uninitialized.');
        setStatusMsg('');
      }
    } catch (err) {
      console.error('Google OAuth Error:', err);
      setErrorMsg('Failed to initialize Google Sign-In.');
      setStatusMsg('');
    }
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
                             {order.status === 'Cancelled by Customer' ? 'Cancelled' : (order.status || 'Placed')}
                           </span>
                         </div>
                         
                         {/* Visual Progress Bar (rendered only for active orders) */}
                         {order.status !== 'Cancelled' && order.status !== 'Cancelled by Customer' && (
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
                         )}

                         {order.trackingNumber && order.status !== 'Cancelled' && (
                           <p className="order-tracking-number-label">
                             <Truck size={14} style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.8 }} />
                             <span>Delhivery Tracking: <strong>{order.trackingNumber}</strong></span>
                           </p>
                         )}

                          {order.items && order.items.length > 0 && (
                            <div className="order-items-preview-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '6px 0', margin: '8px 0', scrollbarWidth: 'none' }}>
                              {order.items.map((it, iIdx) => {
                                const itTitle = it.product?.title || it.title || it.productTitle || 'Couture Item';
                                const matchedCatalog = (catalogProducts || []).find(p => String(p.id) === String(it.productId || it.id || it.product?.id))
                                  || (catalogProducts || []).find(p => p.title?.toLowerCase().trim() === itTitle.toLowerCase().trim());

                                const rawImg = it.image 
                                  || it.product?.image 
                                  || it.productImage 
                                  || (it.images && it.images[0]) 
                                  || matchedCatalog?.image 
                                  || (matchedCatalog?.images && matchedCatalog?.images[0]);

                                const itImg = rawImg ? formatGithubUrl(rawImg) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200';

                                return (
                                  <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-secondary)', padding: '4px 10px 4px 6px', borderRadius: '6px', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                                    <img 
                                      src={itImg} 
                                      alt={itTitle} 
                                      style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} 
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=200';
                                      }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{itTitle}</span>
                                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Size: {it.size || it.selectedSize || 'M'} (x{it.quantity || 1})</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
                         <div className="order-date-row" style={{ marginBottom: (order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Cancelled by Customer' && onUpdateOrderStatus) ? '12px' : '0' }}>
                           <span>Payment: COD ({order.paymentId})</span>
                           <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                         </div>

                          {order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Cancelled by Customer' && onUpdateOrderStatus && (
                            <div className="order-actions-row">
                              <button 
                                className="user-cancel-order-btn"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to cancel order ${order.id}?`)) {
                                    onUpdateOrderStatus(order.id, 'Cancelled by Customer', order.trackingNumber);
                                  }
                                }}
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}
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

            {/* Google OIDC Button */}
            <button 
              type="button" 
              className="google-auth-btn" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="auth-divider">
              <span>OR EMAIL</span>
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
