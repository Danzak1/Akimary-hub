import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface Suggestion {
    id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
}

const ADMIN_IDS = (import.meta.env.VITE_ADMIN_IDS || "").split(",").map((id: string) => parseInt(id.trim?.() || id));

export const SuggestionsSection: React.FC = () => {
    const { user, tg } = useTelegram();
    const [content, setContent] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const isAdmin = user && ADMIN_IDS.includes(user.id);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchSuggestions = async () => {
        if (!isAdmin) return;
        try {
            const response = await fetch(`${apiUrl}/suggestions`, {
                headers: {
                    'init-data': tg?.initData || '',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchSuggestions();
        }
    }, [isAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !tg?.initData) return;

        setStatus('loading');
        try {
            const response = await fetch(`${apiUrl}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    init_data: tg.initData,
                }),
            });

            if (response.ok) {
                setStatus('success');
                setContent('');
                if (isAdmin) fetchSuggestions();
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <section className="w-full space-y-6 animate-fade-in">
            {/* Form for everyone */}
            <div className="p-6 rounded-3xl glass border border-white/10">
                <h2 className="text-xl font-bold text-white mb-2">Предложения</h2>
                <p className="text-white/60 text-sm mb-4">Что добавить или изменить в хабе? Пиши сюда!</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        placeholder="Твое предложение..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tg-button/50 transition-all min-h-[100px] resize-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${status === 'success' ? 'bg-green-500' : 'bg-tg-button hover:bg-tg-button/90'
                            } text-white disabled:opacity-50`}
                    >
                        {status === 'loading' ? 'Отправка...' : status === 'success' ? 'Отправлено!' : 'Отправить'}
                    </button>
                    {status === 'error' && <p className="text-red-400 text-xs text-center">Ошибка. Попробуй позже.</p>}
                </form>
            </div>

            {/* Admin view */}
            {isAdmin && (
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-2">Все предложения (Админ)</p>
                    {suggestions.length === 0 ? (
                        <p className="text-white/40 text-center py-4">Предложений пока нет</p>
                    ) : (
                        suggestions.map((s) => (
                            <div key={s.id} className="p-4 rounded-2xl glass border border-white/5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-tg-button font-bold text-sm">@{s.username}</span>
                                    <span className="text-white/20 text-[10px]">
                                        {new Date(s.created_at).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                                <p className="text-white text-sm leading-relaxed">{s.content}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </section>
    );
};
