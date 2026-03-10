/**
 * Framer Motion 애니메이션 프리셋
 * 앱 전체에서 일관된 애니메이션을 위해 공유
 */

export const customEase = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: customEase } },
};

export const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

export const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

export const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: customEase } },
};
