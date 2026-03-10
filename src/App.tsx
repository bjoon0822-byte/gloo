import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import BottomTabBar from './components/layout/BottomTabBar';

// Lazy load 페이지 (코드 스플리팅)
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MyPage = lazy(() => import('./pages/MyPage'));
const ShopDetailPage = lazy(() => import('./pages/ShopDetailPage'));

// 로딩 스피너
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// 레이아웃 — 탭바를 표시할 페이지를 제어
function AppLayout() {
  const location = useLocation();
  // 채팅 페이지와 샵 상세 페이지에서는 BottomTabBar 숨김 (풀스크린/커스텀 탭바 경험)
  const hideTabBar = location.pathname.startsWith('/chat') || location.pathname.startsWith('/shop/');

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shop/:id" element={<ShopDetailPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </Suspense>
      {!hideTabBar && <BottomTabBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
