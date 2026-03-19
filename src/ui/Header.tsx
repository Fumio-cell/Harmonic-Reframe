import React, { useEffect, useState } from 'react';
import { supabase, openLemonSqueezyCheckout } from '../lib/commercial';
import { LogIn, LogOut, Zap, Activity } from 'lucide-react';

export const Header: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const client = supabase;
        if (!client) return;

        client.auth.getUser().then(({ data: { user: foundUser } }) => {
            setUser(foundUser);
            if (foundUser) {
                client
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', foundUser.id)
                    .single()
                    .then(({ data }) => {
                        const pro = !!(data as any)?.is_pro;
                        setIsPro(pro);
                        window.dispatchEvent(new CustomEvent('auth:status', { detail: { user: foundUser, isPro: pro } }));
                    });
            }
        });

        const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data } = await client
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', currentUser.id)
                    .single();
                const pro = !!(data as any)?.is_pro;
                setIsPro(pro);
                window.dispatchEvent(new CustomEvent('auth:status', { detail: { user: currentUser, isPro: pro } }));
            } else {
                setIsPro(false);
                window.dispatchEvent(new CustomEvent('auth:status', { detail: { user: null, isPro: false } }));
            }
        });

        const handleBuyPro = () => openLemonSqueezyCheckout();
        window.addEventListener('app:buyPro', handleBuyPro);

        return () => {
            authListener?.subscription.unsubscribe();
            window.removeEventListener('app:buyPro', handleBuyPro);
        };
    }, []);

    const login = () => supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    const logout = () => supabase?.auth.signOut();

    return (
        <header className="toolkit-header">
            <div className="header-left">
                <div className="toolkit-brand">
                    <Activity className="brand-icon" />
                    <span className="toolkit-name">Poetic Signal Toolkit</span>
                </div>
                <div className="app-separator">/</div>
                <div className="app-name">Harmonic Reframe v1.2</div>
            </div>

            <div className="header-right">
                {user ? (
                    <div className="user-profile">
                        <div className={`pro-badge ${isPro ? 'active' : ''}`}>
                            <Zap className="w-3 h-3" />
                            {isPro ? 'PRO' : 'FREE'}
                        </div>
                        <span className="user-email">{user.email}</span>
                        {!isPro && (
                            <button onClick={() => openLemonSqueezyCheckout()} className="upgrade-btn">
                                Upgrade
                            </button>
                        )}
                        <button onClick={logout} className="icon-btn" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button onClick={login} className="login-btn">
                        <LogIn className="w-4 h-4" />
                        Login
                    </button>
                )}
            </div>

            <style>{`
                .toolkit-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1.5rem;
                    background: rgba(10, 10, 10, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    font-family: 'Inter', sans-serif;
                }
                .header-left, .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .toolkit-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #10b981;
                }
                .brand-icon {
                    width: 1.25rem;
                    height: 1.25rem;
                }
                .toolkit-name {
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: #fff;
                }
                .app-separator {
                    color: rgba(255, 255, 255, 0.2);
                    font-weight: 300;
                }
                .app-name {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .pro-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    background: #27272a;
                    color: #71717a;
                }
                .pro-badge.active {
                    background: #f59e0b;
                    color: #fff;
                }
                .user-email {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.8);
                }
                .upgrade-btn {
                    background: #f59e0b;
                    color: #fff;
                    border: none;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .upgrade-btn:hover {
                    background: #d97706;
                    transform: scale(1.05);
                }
                .login-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 0.4rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .login-btn:hover {
                    background: #e4e4e7;
                }
                .icon-btn {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                }
                .icon-btn:hover {
                    color: #fff;
                }
            `}</style>
        </header>
    );
};
