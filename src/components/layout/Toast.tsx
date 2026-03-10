import { useEffect, useState } from 'react';

interface ToastProps {
    message: string | null;
}

/**
 * 화면 하단에 뜨는 토스트 알림
 */
export default function Toast({ message }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 2800);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [message]);

    if (!message || !visible) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] animate-fade-in">
            <div className="glass-premium px-6 py-3 rounded-2xl text-sm font-medium text-text shadow-xl border border-white/60 whitespace-nowrap">
                {message}
            </div>
        </div>
    );
}
