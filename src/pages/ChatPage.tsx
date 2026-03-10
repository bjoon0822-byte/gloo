import { useRef, useEffect } from 'react';
import { Sparkles, Send, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import 'leaflet/dist/leaflet.css';

/**
 * 📱 AI 채팅 전체 화면
 * 앱의 핵심 화면 — 풀스크린 채팅 경험
 */
export default function ChatPage() {
    const navigate = useNavigate();
    const { messages, input, isLoading, handleInputChange, handleSubmit, addScrollRef } = useChat();
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // 스크롤 ref 등록
    useEffect(() => {
        addScrollRef(chatScrollRef.current);
    }, [addScrollRef]);

    return (
        <div className="flex flex-col h-[100dvh] bg-background">
            {/* 헤더 */}
            <div className="shrink-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 safe-area-top">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm text-text">GLOO AI 컨시어지</p>
                        <p className="text-[11px] text-text-muted font-medium">항상 온라인 · 실시간 응답</p>
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
                {/* 기본 환영 메시지 */}
                {messages.length === 0 && (
                    <>
                        <div className="flex justify-center py-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-light mx-auto flex items-center justify-center text-white mb-4 shadow-xl">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h2 className="text-lg font-bold text-text mb-1">GLOO AI 컨시어지</h2>
                                <p className="text-xs text-text-muted">K-뷰티 예약의 모든 것을 도와드립니다</p>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-white/90 text-text text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm border border-white/50 whitespace-pre-wrap">
                                안녕하세요! GLOO AI 컨시어지입니다. 원하시는 뷰티 시술이나 지역을 말씀해 주시면, 딱 맞는 뷰티샵을 찾아드릴게요 ✨
                            </div>
                        </div>
                        {/* 퀵 시작 버튼 */}
                        <div className="flex flex-wrap gap-2 px-2 pt-2">
                            {['강남 피부과 추천해줘', '홍대 헤어살롱 찾아줘', '명동 10만원대 에스테틱'].map((q) => (
                                <button
                                    key={q}
                                    onClick={(e) => handleSubmit(e, q)}
                                    className="bg-white border border-primary/20 text-primary text-xs px-3.5 py-2 rounded-full font-medium hover:bg-primary hover:text-white transition-colors shadow-sm cursor-pointer"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* 대화 내용 */}
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`text-sm px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary-light text-white rounded-tr-sm'
                            : 'bg-white/90 text-text rounded-tl-sm border border-white/50 whitespace-pre-wrap'
                            }`}>
                            {/* Tool Invocations (샵 추천 카드) */}
                            {m.toolInvocations?.map((toolInvocation: any) => {
                                const toolCallId = toolInvocation.toolCallId;
                                if (toolInvocation.toolName === 'search_shops') {
                                    if ('result' in toolInvocation) {
                                        const results = toolInvocation.result;
                                        return (
                                            <div key={toolCallId} className="mt-2 space-y-2 w-full">
                                                {results.length > 0 ? results.map((shop: any, i: number) => {
                                                    const treatment = shop.treatments?.[0];
                                                    const originalPrice = treatment ? Math.round(treatment.price * 1.3) : 0;
                                                    const discountRate = treatment ? Math.round((originalPrice - treatment.price) / originalPrice * 100) : 0;

                                                    return (
                                                        <a key={i} href={shop.lat && shop.lng ? `https://map.kakao.com/link/map/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}` : '#'} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl p-2.5 flex gap-3 shadow-sm border border-purple-50 mb-2 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all no-underline text-inherit block">
                                                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
                                                                {i < 2 && <div className="absolute top-0 left-0 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 z-10 rounded-br-lg">HOT</div>}
                                                                {i === 2 && <div className="absolute top-0 left-0 bg-pink-400 text-white text-[9px] font-bold px-1.5 py-0.5 z-10 rounded-br-lg">NEW</div>}
                                                                {shop.image_url ? (
                                                                    <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" loading="lazy"
                                                                        onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${shop.id || Math.random()}/200/200`; }} />
                                                                ) : (
                                                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-primary/40" /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-center min-w-0 py-0.5">
                                                                <h4 className="font-bold text-sm text-text mb-0.5 truncate">{treatment?.name || shop.name}</h4>
                                                                <p className="text-[10px] text-text-muted mb-1 truncate">
                                                                    #{shop.category} {shop.treatments?.slice(0, 3).map((t: any) => `#${t.name.split(' ')[0]}`).join(' ')}
                                                                </p>
                                                                <div className="flex items-center gap-1 text-[10px] text-text-muted mb-1.5 truncate">
                                                                    <span>{shop.region}</span>
                                                                    <span className="w-px h-2 rounded-full bg-gray-300" />
                                                                    <span className="truncate">{shop.name}</span>
                                                                </div>
                                                                {treatment && (
                                                                    <div className="flex items-center gap-1.5 mt-auto flex-wrap mb-1">
                                                                        <span className="font-extrabold text-text text-sm">{treatment.price.toLocaleString()}원</span>
                                                                        <span className="font-bold text-pink-500 text-[10px]">{discountRate}%</span>
                                                                        <span className="text-text-muted text-[10px] line-through decoration-gray-300">{originalPrice.toLocaleString()}원</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col gap-0.5 mt-auto">
                                                                    {shop.operating_hours && <span className="text-[9px] text-text-muted">🕒 {shop.operating_hours}</span>}
                                                                    {shop.address && <span className="text-[9px] text-primary truncate">📍 {shop.address}</span>}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    );
                                                }) : <p className="text-xs text-text-muted">조건에 맞는 샵을 찾지 못했어요.</p>}

                                                {/* 지도 UI */}
                                                {results.length > 0 && results[0].lat && results[0].lng && (
                                                    <div className="w-full h-[200px] rounded-2xl overflow-hidden mt-3 shadow-md border border-white/40">
                                                        <MapContainer
                                                            center={[results[0].lat, results[0].lng] as [number, number]}
                                                            zoom={14}
                                                            style={{ height: '100%', width: '100%' }}
                                                            scrollWheelZoom={false}
                                                        >
                                                            <TileLayer
                                                                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                                                                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                                                            />
                                                            {results.map((shop: any, idx: number) => {
                                                                if (!shop.lat || !shop.lng) return null;
                                                                return (
                                                                    <Marker key={`marker-${idx}`} position={[shop.lat, shop.lng] as [number, number]}>
                                                                        <Popup className="text-xs">
                                                                            <strong>{shop.name}</strong><br />
                                                                            <span className="text-gray-500">{shop.category}</span><br />
                                                                            <a href={`https://map.kakao.com/link/map/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}`} target="_blank" rel="noopener noreferrer" className="text-primary mt-1 inline-block font-bold">카카오맵 열기</a>
                                                                        </Popup>
                                                                    </Marker>
                                                                );
                                                            })}
                                                        </MapContainer>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else {
                                        return <div key={toolCallId} className="text-xs text-text-muted animate-pulse">DB 검색 중... 🔍</div>;
                                    }
                                }
                                return null;
                            })}
                            {m.content}
                        </div>
                    </div>
                ))}

                {/* 퀵 리플라이 (시간/일정 관련) */}
                {messages.length > 0 &&
                    messages[messages.length - 1].role === 'assistant' &&
                    (messages[messages.length - 1].content.includes('시간') || messages[messages.length - 1].content.includes('일정') || messages[messages.length - 1].content.includes('예약')) && (
                        <div className="flex flex-wrap gap-1.5 mt-3 px-2 pb-2">
                            {['이번 주 주말', '다음 주 평일', '오전 10시', '오후 2시', '오후 5시'].map((t) => (
                                <button
                                    key={t}
                                    onClick={(e) => handleSubmit(e, t)}
                                    className="bg-white border border-primary/30 text-primary text-[10px] px-3 py-1.5 rounded-full font-bold hover:bg-primary hover:text-white transition-colors shadow-sm cursor-pointer"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}

                {/* 로딩 인디케이터 */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/90 text-text text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-white/50 flex gap-1">
                            <span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span><span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 입력창 */}
            <div className="shrink-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 safe-area-bottom">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="어떤 시술을 찾고 계신가요?"
                        className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-gray-400 disabled:opacity-50"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="w-8 h-8 rounded-full btn-primary flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
