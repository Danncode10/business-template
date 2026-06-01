'use client';

import { useState, useEffect } from 'react';
import { signUpWithEmail } from '@/services/auth';
import { signInWithEmailRateLimited, signUpWithEmailRateLimited } from '@/services/auth-server';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

// Invite-only by default — only show the "Create Account" tab where public
// sign-up is explicitly enabled for this deployment.
const SIGNUP_ENABLED = process.env.NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP === 'true';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formKey, setFormKey] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [windowWidth, setWindowWidth] = useState(1024);
  const router = useRouter();

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    const saved = localStorage.getItem('df_auth_mode');
    if (saved && (saved === 'login' || SIGNUP_ENABLED)) setMode(saved as 'login' | 'signup');
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    localStorage.setItem('df_auth_mode', m);
    setFormKey(k => k + 1);
    setError('');
    setSuccess(false);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signInWithEmailRateLimited(email, password);
        if (result.requiresMFA) {
          router.push('/auth/mfa');
        } else {
          setSuccess(true);
          setTimeout(() => {
            toast.success('Login successful!');
            router.push('/dashboard');
            router.refresh();
          }, 800);
        }
      } else {
        await signUpWithEmailRateLimited(email, password);
        setSuccess(true);
        setTimeout(() => {
          toast.success('Account created!', { description: 'Check your email for confirmation.' });
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isDesktop = windowWidth >= 900;
  const passwordScore = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-foreground)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.025,
      }} />

      {/* Glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-8%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          opacity: 0.15,
          filter: 'blur(110px)',
          animation: 'float 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-8%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'var(--color-primary)',
          opacity: 0.08,
          filter: 'blur(110px)',
          animation: 'float 11s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '38%',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          opacity: 0.05,
          filter: 'blur(77px)',
          animation: 'float 13s ease-in-out infinite 3s',
        }} />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10, flexDirection: isDesktop ? 'row' : 'column' }}>
        {/* Brand Panel - Desktop Only */}
        {isDesktop && (
          <div style={{
            width: 400,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 44px',
            borderRight: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Tint */}
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'linear-gradient(145deg, rgba(108, 71, 255,0.05) 0%, transparent 55%)',
            }} />

            {/* Orbital Ring */}
            <div style={{
              position: 'absolute',
              top: 100,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: '50%',
              border: '1px solid rgba(108, 71, 255,0.125)',
              pointerEvents: 'none',
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                marginTop: -3.5,
                marginLeft: -3.5,
                animation: 'orbit 5s linear infinite',
                boxShadow: '0 0 8px var(--color-primary)',
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 56 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: 'white',
                  boxShadow: '0 0 18px rgba(108, 71, 255,0.333)',
                }}>D</div>
                <span style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: -0.025, color: '#F0EEFF' }}>DannFlow</span>
                <span style={{
                  padding: '2px 7px',
                  borderRadius: 5,
                  background: 'rgba(108, 71, 255,0.125)',
                  border: '1px solid rgba(108, 71, 255,0.25)',
                  fontSize: 10,
                  color: 'var(--color-primary)',
                  letterSpacing: 0.06,
                }}>v2.0</span>
              </div>

              {/* Headline */}
              <h1 style={{ fontSize: 32, fontWeight: 'bold', lineHeight: 1.18, marginBottom: 14, letterSpacing: -0.03 }}>
                Ship your idea.
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, var(--color-primary), #60A5FA, var(--color-primary))',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite',
                }}>Not boilerplate.</span>
              </h1>

              <p style={{ fontSize: 13.5, color: '#9490B5', lineHeight: 1.7, maxWidth: 290, marginBottom: 36 }}>
                The AI-native Next.js boilerplate for builders who ship. Plug in your vision — we handle the rest.
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Next.js 15 + Supabase auth built-in', 'AI-native architecture & MCP ready', 'Deploy to Vercel in under 2 minutes', 'Checkpoint rollback system'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: 'rgba(108, 71, 255,0.09)',
                      border: '1px solid rgba(108, 71, 255,0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      flexShrink: 0,
                    }}>
                      <Check size={11} />
                    </div>
                    <span style={{ fontSize: 13, color: '#C4C0E0', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 15px',
              borderRadius: 10,
              background: 'rgba(108, 71, 255,0.04)',
              border: '1px solid rgba(108, 71, 255,0.133)',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22C55E',
                flexShrink: 0,
                boxShadow: '0 0 7px #22C55E',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 11, color: '#9490B5' }}>All systems operational</span>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isDesktop ? '40px 44px' : '28px 20px',
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.45s ease both' }}>
            {/* Tabs — only shown when public sign-up is enabled */}
            {SIGNUP_ENABLED && (
            <div style={{
              display: 'flex',
              background: '#13131F',
              borderRadius: 11,
              padding: 3,
              marginBottom: 32,
              border: '1px solid var(--color-border)',
              gap: 4,
            }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: mode === m ? 'var(--color-primary)' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: mode === m ? '#fff' : '#9490B5',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.2s',
                    boxShadow: mode === m ? '0 2px 10px rgba(108, 71, 255,0.314)' : 'none',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
            )}

            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 'bold', letterSpacing: -0.025, marginBottom: 5, color: '#F0EEFF' }}>
                {mode === 'login' ? 'Welcome back' : 'Start building'}
              </h2>
              <p style={{ fontSize: 13, color: '#9490B5', lineHeight: 1.55 }}>
                {mode === 'login' ? 'Access Mission Control — your launchpad awaits.' : 'Create your account and ship your first idea today.'}
              </p>
            </div>

            {/* Success State */}
            {success ? (
              <div style={{
                padding: 28,
                borderRadius: 12,
                textAlign: 'center',
                background: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.22)',
                animation: 'fadeUp 0.35s ease both',
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
                <p style={{ fontWeight: 600, marginBottom: 5, color: '#F0EEFF' }}>
                  {mode === 'login' ? 'Welcome back!' : 'Account created!'}
                </p>
                <p style={{ fontSize: 12, color: '#9490B5' }}>
                  {mode === 'login' ? 'Redirecting to Mission Control...' : 'Check your email for confirmation.'}
                </p>
              </div>
            ) : (
              <form key={formKey} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {mode === 'signup' && (
                  <div style={{ animation: 'slideIn 0.25s ease both' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', color: '#9490B5', marginBottom: 6 }}>
                      Full name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9490B5', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Dann Lopez"
                        style={{
                          width: '100%',
                          paddingLeft: 40,
                          paddingRight: 14,
                          paddingTop: 12,
                          paddingBottom: 12,
                          background: 'rgba(19,19,31,0.8)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 9,
                          color: '#F0EEFF',
                          fontSize: 14,
                          outline: 'none',
                          transition: 'all 0.18s',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', color: '#9490B5', marginBottom: 6 }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9490B5', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="dann@example.com"
                      required
                      style={{
                        width: '100%',
                        paddingLeft: 40,
                        paddingRight: 14,
                        paddingTop: 12,
                        paddingBottom: 12,
                        background: 'rgba(19,19,31,0.8)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 9,
                        color: '#F0EEFF',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.18s',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', color: '#9490B5', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9490B5', pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'login' ? '••••••••' : 'Min. 8 characters'}
                      required
                      style={{
                        width: '100%',
                        paddingLeft: 40,
                        paddingRight: 40,
                        paddingTop: 12,
                        paddingBottom: 12,
                        background: 'rgba(19,19,31,0.8)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 9,
                        color: '#F0EEFF',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.18s',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9490B5',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {mode === 'signup' && password && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[0, 1, 2, 3].map(i => {
                          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                          return (
                            <div key={i} style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 2,
                              background: i < passwordScore ? colors[passwordScore - 1] : 'var(--color-border)',
                              transition: 'background 0.25s',
                            }} />
                          );
                        })}
                      </div>
                      <p style={{ fontSize: 10, color: passwordScore > 0 ? ['#ef4444', '#f97316', '#eab308', '#22c55e'][passwordScore - 1] : '#9490B5' }}>
                        {passwordScore > 0 ? ['Weak', 'Fair', 'Good', 'Strong'][passwordScore - 1] : ''}
                      </p>
                    </div>
                  )}
                </div>

                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: -4 }}>
                    <Link href="/forgot-password" style={{ fontSize: 11, color: '#9490B5', textDecoration: 'none', letterSpacing: 0.05, transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget as any).style.color = 'var(--color-primary)'} onMouseLeave={e => (e.currentTarget as any).style.color = '#9490B5'}>
                      FORGOT PASSWORD?
                    </Link>
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '10px 13px',
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.22)',
                    fontSize: 12,
                    color: '#f87171',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    marginTop: 2,
                    background: loading ? 'rgba(108, 71, 255,0.375)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary))',
                    border: 'none',
                    borderRadius: 10,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: loading ? 'none' : `0 4px 18px rgba(108, 71, 255,0.267), 0 0 0 1px rgba(255,255,255,0.06)`,
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { if (!loading) { (e.currentTarget as any).style.transform = 'translateY(-1px)'; (e.currentTarget as any).style.boxShadow = `0 6px 24px rgba(108, 71, 255,0.333), 0 0 0 1px rgba(255,255,255,0.1)`; } }}
                  onMouseLeave={e => { (e.currentTarget as any).style.transform = 'translateY(0)'; (e.currentTarget as any).style.boxShadow = `0 4px 18px rgba(108, 71, 255,0.267), 0 0 0 1px rgba(255,255,255,0.06)`; }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 0.75s linear infinite' }} />
                      Processing…
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {mode === 'signup' && (
                  <p style={{ fontSize: 11, color: '#5A5680', textAlign: 'center', lineHeight: 1.55 }}>
                    By signing up you agree to the{' '}
                    <Link href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Terms</Link>{' '}and{' '}
                    <Link href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Privacy Policy</Link>.
                  </p>
                )}
              </form>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 10, color: '#5A5680' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <button type="button" style={{
              width: '100%',
              padding: '12px 0',
              background: '#13131F',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              color: '#F0EEFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              transition: 'all 0.18s',
            }} onMouseEnter={e => { (e.currentTarget as any).style.borderColor = '#4A4670'; (e.currentTarget as any).style.background = '#1A1A2E'; }} onMouseLeave={e => { (e.currentTarget as any).style.borderColor = 'var(--color-border)'; (e.currentTarget as any).style.background = '#13131F'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--color-border)',
        padding: '10px 44px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        background: 'rgba(10,10,15,0.75)',
        backdropFilter: 'blur(10px)',
      }}>
        <span style={{ fontSize: 11, color: '#5A5680' }}>© 2026 DannFlow</span>
        <div style={{ display: 'flex', gap: 18 }}>
          {['Privacy', 'Terms', 'Docs'].map(l => (
            <Link key={l} href="#" style={{ fontSize: 11, color: '#5A5680', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget as any).style.color = 'var(--color-primary)'} onMouseLeave={e => (e.currentTarget as any).style.color = '#5A5680'}>{l}</Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-24px) scale(1.04); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(72px) rotate(0deg); } to { transform: rotate(360deg) translateX(72px) rotate(-360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
