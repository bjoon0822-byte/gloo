import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, Globe, MapPin, ArrowRight, Star, Heart, Calendar, ChevronRight, Search, User, Play, Send, Palette, Stethoscope, Scissors, Zap, Shield, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const customEase = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: customEase } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: customEase } },
};

/* 카운트업 훅 — 뷰포트에 진입하면 0에서 target까지 카운트 */
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function App() {
  /* ── 스크롤 프로그레스 바 + 네비바 스크롤 효과 ── */
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setNavScrolled(scrollTop > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── 카운트업 통계 수치 ── */
  const userCount = useCountUp(150000);
  const shopCount = useCountUp(4200);
  const matchRate = useCountUp(98);

  return (
    <div className="bg-background min-h-screen text-text font-sans">

      {/* 스크롤 프로그레스 바 */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* ───── Navbar ───── */}
      <nav className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-6 md:px-8 py-3 flex items-center justify-between max-w-7xl mx-auto transition-all duration-300 ${navScrolled ? 'glass-premium shadow-xl py-2.5' : 'glass-hero py-3'}`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GLOO" className="h-8" />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <a href="#features" className="hover:text-accent transition-colors">기능</a>
          <a href="#chat" className="hover:text-accent transition-colors">AI 채팅</a>
          <a href="#shop" className="hover:text-accent transition-colors">탐색</a>
          <a href="#beauty-clip" className="hover:text-accent transition-colors">뷰티 클립</a>
        </div>
        <button className="btn-primary px-6 py-2.5 text-sm cursor-pointer border border-white/20">앱 다운로드</button>
      </nav>

      {/* ═══════════════════════════════════════
          HERO — 2-Column (좌측 타이틀, 우측 대형 챗봇)
      ═══════════════════════════════════════ */}
      <section className="relative w-full h-screen overflow-hidden flex items-center pt-16">
        {/* Spline 3D 배경 - 중앙 배치로 변경 */}
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            src="https://my.spline.design/blendtoollightcolor-xF3dhVj2fdhSiCZtChbuYsLZ/"
            frameBorder="0"
            className="w-full h-full"
            title="GLOO 3D Visual"
            style={{ pointerEvents: 'auto', border: 'none', outline: 'none', display: 'block' }}
          />
        </div>

        {/* 텍스트/UI 가독성을 위한 배경 그라데이션 커튼 — 더 투명하게 */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>

        {/* Spline 하단 완벽 가림 (워터마크 + 경계선) */}
        <div className="absolute bottom-0 left-0 right-0 h-[70px] z-30"
          style={{ background: 'linear-gradient(180deg, rgba(210,190,245,0) 0%, rgba(220,200,245,0.8) 30%, rgba(230,210,250,1) 60%, rgba(243,238,255,1) 100%)' }}
        ></div>
        {/* 히어로 하단 → 신뢰 밴드 자연스러운 전환 */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(243,238,255,0.3) 20%, rgba(243,238,255,0.7) 50%, rgba(243,238,255,0.95) 75%, rgba(243,238,255,1) 100%)' }}
        ></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ───── 좌측: 메인 타이틀 & CTA ───── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium text-xs font-bold text-primary-dark mb-6 shadow-sm border border-white/60"
              >
                <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
                No.1 K-뷰티 컨시어지 플랫폼
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-text">
                당신의 모든<br />
                <span className="text-gradient">K-뷰티</span>
                <span>,</span><br />
                하나의 앱으로
              </h1>

              <p className="text-base md:text-lg mb-10 max-w-md leading-relaxed text-text-muted font-medium">
                예산과 취향만 알려주세요.<br />
                AI가 최적의 피부과와 살롱을 찾아 즉시 예약해 드립니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto">
                  AI 예약 시작하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn-glass px-8 py-4 text-base text-accent font-semibold hover:bg-accent/5 transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center border border-accent/30 rounded-full">
                  인기 뷰티샵 보기
                </button>
              </div>

              {/* 신뢰도 뱃지 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-12 flex items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {[11, 12, 13, 14].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/80?img=${i}`} alt="사용자" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                </div>
                <div className="text-xs text-text-muted flex flex-col">
                  <span ref={userCount.ref} className="font-extrabold text-sm text-text">{userCount.count.toLocaleString()}+</span>
                  <span className="font-medium">글로벌 사용자 예약 완료</span>
                </div>
              </motion.div>
            </motion.div>

            {/* ───── 우측: 메인 대형 챗봇 UI ───── */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
              className="hidden lg:block relative z-20"
            >
              {/* 장식용 글로우 배경 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/20 blur-[100px] -z-10 rounded-full"></div>

              <div className="glass-premium rounded-3xl overflow-hidden shadow-2xl animate-float border border-white/60">
                {/* 챗봇 헤더 */}
                <div className="bg-white/60 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-white/30">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text">GLOO AI 컨시어지</p>
                    <p className="text-[11px] text-text-muted font-medium">검증된 AI 뷰티 에이전트</p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                  </div>
                </div>

                {/* 챗봇 대화 내용 */}
                <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto hide-scrollbar bg-white/10">

                  {/* 사용자 메시지 */}
                  <div className="flex justify-end">
                    <div className="btn-primary text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                      강남에서 피부 시술 추천해줘 💆‍♀️<br />예산은 30만원 정도야.
                    </div>
                  </div>

                  {/* AI 응답 */}
                  <div className="flex justify-start">
                    <div className="bg-white/90 text-text text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg border border-white/50">
                      <p className="mb-2.5 font-bold text-primary-dark">조건에 맞는 클리닉 3곳이에요! ✨</p>
                      <div className="space-y-2">
                        {[
                          { name: '루미스킨 클리닉', price: '₩280,000', star: '4.9', tag: '페이셜' },
                          { name: '하나피부과', price: '₩250,000', star: '4.8', tag: '보톡스' },
                          { name: '서울글로우', price: '₩320,000', star: '4.9', tag: '레이저' },
                        ].map((c, i) => (
                          <div key={i} className="bg-background-light rounded-xl px-3 py-2 flex items-center justify-between shadow-sm border border-purple-50 group hover:border-primary/30 transition-colors cursor-pointer">
                            <div>
                              <span className="font-bold text-xs">{c.name}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold">{c.tag}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-primary font-bold text-sm block">{c.price}</span>
                              <span className="text-amber-500 flex items-center justify-end gap-0.5 text-[10px] font-bold"><Star className="w-2.5 h-2.5 fill-amber-400" />{c.star}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 사용자 메시지 2 */}
                  <div className="flex justify-end">
                    <div className="btn-primary text-sm px-4 py-3 rounded-2xl rounded-tr-sm shadow-md">
                      루미스킨 금요일 피부관리 예약해줘! 🙏
                    </div>
                  </div>
                </div>

                {/* 챗봇 입력창 */}
                <div className="p-4 bg-white/40 border-t border-white/30 backdrop-blur-md">
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-inner border border-purple-100">
                    <input type="text" placeholder="어떤 시술을 찾고 계신가요?" className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-text-muted/60" readOnly />
                    <button className="w-8 h-8 rounded-full btn-primary flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── 신뢰 지표 밴드 ───── */}
      <section className="py-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary-light/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-text-muted text-sm">
            {[
              { icon: <Shield className="w-4 h-4 text-accent" />, text: <span>검증된 <span ref={shopCount.ref} className="font-bold text-accent inline-block min-w-[3.5rem] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{shopCount.count.toLocaleString()}</span>+ 뷰티샵</span> },
              { icon: <Globe className="w-4 h-4 text-accent" />, text: '3개 국어 실시간 번역' },
              { icon: <Clock className="w-4 h-4 text-accent" />, text: '평균 예약 소요 2분' },
              { icon: <Star className="w-4 h-4 text-accent" />, text: <span>매칭 성공률 <span ref={matchRate.ref} className="font-bold text-accent inline-block min-w-[2rem] text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{matchRate.count}</span>%</span> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 font-medium">{item.icon}{item.text}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 기능 소개 (그라데이션 보더 + 호버 리프트) ───── */}
      <section id="features" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-20 -left-40 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 -right-40 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-6 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              핵심 기능
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">뷰티 여정을<br /><span className="text-gradient">하나로 통합</span></h2>
            <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto">GLOO는 언어 장벽과 복잡한 예약 과정을 없앱니다.<br />필요한 모든 것이 앱 안에 있습니다.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <MessageCircle className="w-7 h-7" />, grad: 'from-accent to-primary-light', borderColor: '#FF2D78', title: 'AI 채팅 예약', desc: '원하는 시술, 일정, 예산을 AI에게 알려주세요. 검증된 최고의 뷰티샵을 매칭해 드립니다.', highlight: '2분 만에 예약 완료', stat: '98%', statLabel: '매칭 성공률' },
              { icon: <Globe className="w-7 h-7" />, grad: 'from-violet-500 to-indigo-400', borderColor: '#8B5CF6', title: '실시간 자동 번역', desc: '영어, 일본어, 중국어로 자유롭게 대화하세요. 오역 걱정 없이 자연스러운 소통이 가능합니다.', highlight: '3개 국어 지원', stat: '99.2%', statLabel: '번역 정확도' },
              { icon: <MapPin className="w-7 h-7" />, grad: 'from-fuchsia-500 to-pink-400', borderColor: '#D946EF', title: 'O2O 연계', desc: '지도 기반 검색과 일정 관리를 통합하여 온라인 예약부터 오프라인 뷰티 경험까지 원스톱으로.', highlight: '전국 4,000+ 매장', stat: '4,200+', statLabel: '제휴 매장' },
            ].map((f, i) => (
              <motion.div key={i} variants={scaleIn} className={`glass-premium rounded-3xl p-8 card-hover card-depth glow-accent border-t-[3px]`} style={{ borderColor: ['#FF2D78', '#8B5CF6', '#D946EF'][i] }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center mb-6 text-white shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <span className="inline-block text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full mb-3">{f.highlight}</span>
                <p className="text-text-muted leading-relaxed text-sm mb-5">{f.desc}</p>
                <div className="pt-4 border-t border-purple-100 flex items-center gap-2">
                  <span className="text-3xl font-bold text-accent font-heading">{f.stat}</span>
                  <span className="text-xs text-text-muted">{f.statLabel}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── 온보딩 ───── */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF 0%, #FFE9F5 40%, #F0E8FF 70%, #F3EEFF 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
        {/* 패럴랙스 장식 */}
        <div className="parallax-dot w-4 h-4 bg-accent top-20 left-[15%]" />
        <div className="parallax-dot w-6 h-6 bg-primary top-40 right-[20%]" />
        <div className="parallax-dot w-3 h-3 bg-primary-light bottom-20 left-[30%]" />
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={slideInLeft}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-5">
                <User className="w-3.5 h-3.5" />
                온보딩
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">첫 탭부터<br /><span className="text-gradient">맞춤형으로</span></h2>
              <p className="text-text-muted text-base leading-relaxed mb-8 max-w-md">
                국적, 피부 타입, 관심 뷰티 분야를 알려주세요. GLOO가 모든 추천을 당신에게 맞춰 드립니다.
              </p>
              <div className="space-y-5">
                {['국적 및 언어 선택', '관심 뷰티 분야 선택 (헤어, 스킨, 메디컬)', '피부 고민 간편 진단'].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 glass-premium p-4 rounded-2xl card-hover">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary-light text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md shadow-accent/20">{i + 1}</div>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="relative">
              <div className="glass-premium rounded-3xl p-8 max-w-sm mx-auto animate-float">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light mx-auto flex items-center justify-center text-white mb-4 shadow-lg">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold">무엇을 찾고 계세요?</h3>
                  <p className="text-text-muted text-xs mt-1">해당되는 항목을 모두 선택하세요</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Scissors className="w-5 h-5" />, label: '헤어 살롱', active: true },
                    { icon: <Palette className="w-5 h-5" />, label: '메이크업', active: false },
                    { icon: <Heart className="w-5 h-5" />, label: '스킨케어', active: true },
                    { icon: <Stethoscope className="w-5 h-5" />, label: '메디컬', active: false },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl flex flex-col items-center gap-2 text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${item.active ? 'bg-gradient-to-br from-accent to-primary-light text-white shadow-lg shadow-accent/20' : 'bg-white/60 text-text-muted hover:bg-white/80 hover:shadow-md'}`}>
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
                <button className="btn-primary w-full py-3.5 mt-6 text-sm cursor-pointer font-bold">계속하기</button>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-200/30 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── AI 채팅 상세 (태그 업그레이드) ───── */}
      <section id="chat" className="py-24 md:py-32 bg-background-light relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-6 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={scaleIn} className="order-2 lg:order-1">
              <div className="glass-premium rounded-3xl p-6 max-w-md mx-auto">
                <div className="bg-gradient-to-r from-accent to-primary-light rounded-2xl px-5 py-3 flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">GLOO AI 컨시어지</p>
                    <p className="text-[10px] text-white/70">항상 온라인 · 실시간 응답</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-primary to-primary-light text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[75%] shadow-sm">
                      강남에서 30만원 정도 예산으로 피부 시술 받고 싶어요 💆‍♀️
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/80 text-text text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[75%] shadow-sm">
                      <p className="mb-2 font-medium">추천 클리닉 3곳을 찾았습니다! ✨</p>
                      <div className="space-y-1.5">
                        {['✨ 루미스킨 — ₩280,000', '🌿 하나피부과 — ₩250,000', '💎 서울글로우 — ₩320,000'].map((c, i) => (
                          <div key={i} className="bg-white rounded-xl px-3 py-2 text-xs font-medium shadow-sm border border-purple-50">{c}</div>
                        ))}
                      </div>
                      <p className="mt-2">예약해 드릴까요? 🗓️</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-primary to-primary-light text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                      루미스킨 3월 10일로 예약해 주세요! 🙏
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/80 text-text text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[75%] shadow-sm">
                      ✅ 루미스킨 클리닉, 3월 10일 오후 2시 예약 완료!
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 border border-white/50">
                  <input type="text" placeholder="메시지를 입력하세요..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted" readOnly />
                  <button className="w-8 h-8 rounded-full btn-primary flex items-center justify-center text-white shrink-0 cursor-pointer shadow-md">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-5">
                <MessageCircle className="w-3.5 h-3.5" />
                AI 채팅
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">채팅 한 번으로<br /><span className="text-gradient">모든 예약 완료</span></h2>
              <p className="text-text-muted text-base leading-relaxed mb-8 max-w-md">
                수백 개의 리스트를 둘러볼 필요 없습니다. 원하는 시술, 지역, 예산을 AI에게 말하면 즉시 맞춤 클리닉과 살롱을 매칭합니다.
              </p>
              {/* 업그레이드된 기능 카드 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Globe className="w-5 h-5" />, label: '다국어 지원', desc: '한/영/일/중', color: 'from-violet-500 to-indigo-400' },
                  { icon: <Zap className="w-5 h-5" />, label: '즉시 예약', desc: '평균 2분', color: 'from-primary to-primary-light' },
                  { icon: <Search className="w-5 h-5" />, label: '가격 비교', desc: '최저가 보장', color: 'from-fuchsia-500 to-pink-400' },
                  { icon: <Shield className="w-5 h-5" />, label: '인증된 리뷰', desc: '실명 인증', color: 'from-purple-500 to-violet-400' },
                ].map((tag) => (
                  <div key={tag.label} className="glass-premium px-4 py-4 rounded-2xl card-hover cursor-pointer">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tag.color} flex items-center justify-center text-white mb-3 shadow-md`}>{tag.icon}</div>
                    <p className="font-bold text-sm">{tag.label}</p>
                    <p className="text-xs text-text-muted">{tag.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── SHOP 탐색 (AI 이미지 적용) ───── */}
      <section id="shop" className="py-24 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF 0%, #F0E8FF 100%)' }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>
        {/* 패럴랙스 장식 */}
        <div className="parallax-dot w-5 h-5 bg-accent top-16 right-[10%]" />
        <div className="parallax-dot w-3 h-3 bg-primary bottom-32 left-[12%]" />
        <div className="container mx-auto px-6 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-6">
              <Search className="w-3.5 h-3.5" />
              샵 & 탐색
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-5">엄선된<br /><span className="text-gradient">뷰티 패키지</span></h2>
            <p className="text-text-muted text-base md:text-lg">지역, 시술 종류, 가격대별로 검색하세요.<br />GLOO의 모든 살롱과 클리닉은 검증 완료된 곳입니다.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: '루미스킨 클리닉', location: '강남구, 서울', price: '₩250,000~', rating: 4.9, tags: ['페이셜', '레이저'], img: '/images/clinic_lumiskin.png' },
              { name: 'JUNO HAIR 살롱', location: '홍대, 서울', price: '₩80,000~', rating: 4.8, tags: ['헤어', '컬러'], img: '/images/salon_junohair.png' },
              { name: '서울글로우 피부과', location: '신사동, 서울', price: '₩350,000~', rating: 4.9, tags: ['보톡스', '필러'], img: '/images/clinic_seoulglow.png' },
            ].map((shop, i) => (
              <motion.div key={i} variants={scaleIn} className="glass-premium rounded-3xl overflow-hidden card-hover card-depth glow-accent cursor-pointer img-card">
                <div className="h-48 relative overflow-hidden">
                  <img src={shop.img} alt={shop.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 glass-hero px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {shop.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                  <p className="text-text-muted text-xs flex items-center gap-1 mb-4"><MapPin className="w-3 h-3" /> {shop.location}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      {shop.tags.map((t) => <span key={t} className="bg-accent/10 text-accent px-2.5 py-1 rounded-full text-[10px] font-bold">{t}</span>)}
                    </div>
                    <span className="text-base font-bold text-gradient">{shop.price}</span>
                  </div>
                  <button className="w-full py-3 mt-2 rounded-2xl btn-primary text-sm flex items-center justify-center gap-2 cursor-pointer font-bold">
                    <Calendar className="w-4 h-4" /> 지금 예약
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── 스킨 리포트 (업그레이드) ───── */}
      <section className="py-24 md:py-32 bg-background-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
        <div className="container mx-auto px-6 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-5">
                <Heart className="w-3.5 h-3.5" />
                마이 대시보드
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">나만의<br /><span className="text-gradient">피부 리포트</span></h2>
              <p className="text-text-muted text-base leading-relaxed mb-8 max-w-md">
                AI 피부 진단으로 시간에 따른 변화를 추적합니다. 피부 상태에 꼭 맞는 제품을 추천받으세요.
              </p>
              {/* 스탯 카드 업그레이드 — 아이콘 + 트렌드 */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: '수분', value: '78%', trend: '+5%', color: 'from-violet-500 to-purple-400' },
                  { label: '탄력', value: '85%', trend: '+12%', color: 'from-fuchsia-500 to-pink-400' },
                  { label: '색소', value: '62%', trend: '-8%', color: 'from-primary to-primary-light' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-premium p-5 rounded-2xl text-center card-hover">
                    <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-1 font-medium">{stat.label}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {stat.trend}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={scaleIn}>
              <div className="glass-premium rounded-3xl p-8 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">피부 리포트</h3>
                  <span className="text-xs bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-3 py-1 rounded-full font-bold shadow-sm">개선 중 ↑</span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: '수분 보유량', pct: 78, color: 'bg-gradient-to-r from-violet-400 to-purple-400' },
                    { label: '유수분 밸런스', pct: 65, color: 'bg-gradient-to-r from-pink-400 to-rose-400' },
                    { label: '모공 건강', pct: 82, color: 'bg-gradient-to-r from-fuchsia-400 to-purple-400' },
                    { label: '주름 관리', pct: 70, color: 'bg-gradient-to-r from-primary to-primary-light' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium">{bar.label}</span>
                        <span className="font-bold text-accent">{bar.pct}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' as const }}
                          className={`h-full ${bar.color} rounded-full shadow-sm`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 btn-primary py-3.5 text-sm flex items-center justify-center gap-1 cursor-pointer font-bold border border-white/20">
                  전체 리포트 보기 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── 뷰티 클립 ───── */}
      <section id="beauty-clip" className="py-24 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF 0%, #F8F0FF 100%)' }}>
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-6">
              <Play className="w-3.5 h-3.5" />
              뷰티 클립
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-5">진짜 후기,<br /><span className="text-gradient">진짜 결과</span></h2>
            <p className="text-text-muted text-base md:text-lg">실제 고객의 숏폼 리뷰를 확인하세요.<br />비포/애프터를 공유하면 포인트도 적립됩니다.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeUp}>
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
              {[
                { title: '글래스 스킨 페이셜 ✨', user: 'Emily K.', views: '12.4K', time: '0:45', gradient: 'from-purple-300 to-violet-200' },
                { title: '한국식 펌 변신기 💇', user: 'Yuki T.', views: '8.7K', time: '1:20', gradient: 'from-pink-300 to-rose-200' },
                { title: '레이저 토닝 결과 💎', user: 'Sarah L.', views: '24.1K', time: '0:55', gradient: 'from-fuchsia-300 to-purple-200' },
                { title: '입술 필러 후기 💋', user: 'Mia C.', views: '15.3K', time: '1:10', gradient: 'from-violet-300 to-indigo-200' },
              ].map((clip, i) => (
                <div key={i} className="min-w-[240px] md:min-w-[280px] snap-start shrink-0">
                  <div className={`bg-gradient-to-b ${clip.gradient} rounded-3xl h-[340px] md:h-[400px] relative overflow-hidden group cursor-pointer card-hover`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-all duration-300 shadow-xl group-hover:shadow-accent/30">
                        <Play className="w-7 h-7 text-accent ml-1" />
                      </div>
                    </div>
                    {/* 재생 시간 */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      {clip.time}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="text-white font-bold text-sm">{clip.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/80 text-xs font-medium">@{clip.user}</span>
                        <span className="text-white/80 text-xs">▶ {clip.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── CTA (글래스 카드 + 액센트 핑크) ───── */}
      <section className="py-28 md:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF2D78 0%, #C084FC 50%, #A855F7 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-[100px]"></div>
        {/* 웨이브 SVG 배경 */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '60px', background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1440 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 48C960 48 1056 36 1152 28C1248 20 1344 16 1392 14L1440 12V60H0Z\' fill=\'%231a1020\'/%3E%3C/svg%3E") no-repeat bottom center', backgroundSize: 'cover' }}></div>
        <div className="container mx-auto px-6 relative text-center text-white">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="max-w-3xl mx-auto glass-hero rounded-3xl p-12 md:p-16" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <img src="/logo.png" alt="GLOO" className="h-10 mx-auto mb-8" style={{ filter: 'brightness(0) invert(1)' }} />
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-6">
                나의 K-뷰티<br />여정을 시작하세요
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                150K+ 여행자가 GLOO로 완벽한 맞춤형<br />뷰티 경험을 만들고 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-accent px-10 py-4 rounded-full text-lg font-bold hover:bg-white/90 transition-all shadow-2xl cursor-pointer hover:scale-105">
                  GLOO 다운로드
                </button>
                <button className="btn-glass px-10 py-4 rounded-full text-lg font-bold cursor-pointer border-2 border-white/40 hover:border-white/70">
                  더 알아보기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Full Footer ───── */}
      <footer className="py-16 bg-[#1a1020] text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* 로고 & 소개 */}
            <div className="md:col-span-1">
              <img src="/logo.png" alt="GLOO" className="h-8 mb-4" style={{ filter: 'brightness(0) invert(1)' }} />
              <p className="text-sm text-white/50 leading-relaxed">당신의 모든 K-뷰티,<br />하나의 앱으로.</p>
            </div>
            {/* 서비스 */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/80">서비스</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="#features" className="hover:text-accent transition-colors">AI 채팅 예약</a></li>
                <li><a href="#shop" className="hover:text-accent transition-colors">뷰티샵 탐색</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">피부 리포트</a></li>
                <li><a href="#beauty-clip" className="hover:text-accent transition-colors">뷰티 클립</a></li>
              </ul>
            </div>
            {/* 회사 */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/80">회사</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="#" className="hover:text-accent transition-colors">팀 소개</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">채용</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">파트너십</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">블로그</a></li>
              </ul>
            </div>
            {/* 법률 & SNS */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-white/80">법률</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="#" className="hover:text-accent transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">쿠키 정책</a></li>
              </ul>
              <div className="flex gap-3 mt-6">
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent/30 transition-colors"><Globe className="w-4 h-4 text-white/60" /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent/30 transition-colors"><Heart className="w-4 h-4 text-white/60" /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent/30 transition-colors"><Send className="w-4 h-4 text-white/60" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>© 2026 캐칭(Catching). All rights reserved.</p>
            <p>Made with ❤️ in Seoul</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
