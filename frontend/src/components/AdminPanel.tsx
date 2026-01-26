import React, { useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';

export const AdminPanel: React.FC = () => {
    const { user } = useTelegram();
    const [message, setMessage] = useState('');
    const [adminId, setAdminId] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'none', msg: string }>({ type: 'none', msg: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Ваша проверка ID (641407863)
    const IS_ADMIN = user?.id?.toString() === '641407863' || adminId === '641407863';

    const handleSend = async () => {
        if (!message) return;
        setIsLoading(true);
        setStatus({ type: 'none', msg: '' });

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/admin/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    admin_id: adminId || user?.id?.toString() || '',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', msg: 'Уведомление отправлено!' });
                setMessage('');
            } else {
                setStatus({ type: 'error', msg: data.detail || 'Ошибка доступа' });
            }
        } catch (error) {
            setStatus({ type: 'error', msg: 'Ошибка сервера' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!IS_ADMIN && !adminId) {
        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Admin Access</p>
                <input
                    type="text"
                    placeholder="Введите Admin ID"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-tg-button/50 transition-colors"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                />
            </div>
        );
    }

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 animate-fade-in">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-3">Управление уведомлениями</p>

            <div className="space-y-3">
                <textarea
                    placeholder="Текст уведомления в Telegram..."
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-tg-button/50 transition-colors resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={handleSend}
                    disabled={isLoading || !message}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-tg-button/50 cursor-not-allowed' : 'bg-tg-button hover:opacity-90 active:scale-[0.98]'
                        }`}
                >
                    {isLoading ? (
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                    ) : (
                        <>
                            <i className="fa-solid fa-paper-plane"></i>
                            Отправить в Telegram
                        </>
                    )}
                </button>

                {status.type !== 'none' && (
                    <p className={`text-center text-[10px] font-bold ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {status.msg}
                    </p>
                )}
            </div>
        </div>
    );
};
