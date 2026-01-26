import { useEffect } from 'react';

export const useTelegram = () => {
    const tg = (window as any).Telegram?.WebApp;

    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
        }
    }, [tg]);

    const onClose = () => {
        tg?.close();
    };

    const onToggleButton = () => {
        if (tg.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    };

    return {
        onClose,
        onToggleButton,
        tg,
        user: tg?.initDataUnsafe?.user,
        queryId: tg?.initDataUnsafe?.query_id,
    };
};
