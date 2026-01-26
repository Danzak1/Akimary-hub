import React, { useState } from 'react';

export const MailingSection: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });


            if (response.ok) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <section className="mt-8 p-6 rounded-3xl glass border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Рассылка</h2>
            <p className="text-white/60 text-sm mb-4">Подпишитесь, чтобы получать новости первым!</p>

            <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                    type="email"
                    placeholder="Ваш e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tg-button/50 transition-all"
                    required
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${status === 'success' ? 'bg-green-500' : 'bg-tg-button hover:bg-tg-button/90'
                        } text-white disabled:opacity-50`}
                >
                    {status === 'loading' ? 'Подписка...' : status === 'success' ? 'Вы подписаны!' : 'Подписаться'}
                </button>
                {status === 'error' && <p className="text-red-400 text-xs text-center">Произошла ошибка. Попробуйте снова.</p>}
            </form>
        </section>
    );
};
