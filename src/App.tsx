import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Menu, 
  X, 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal, 
  Star,
  ChevronDown,
  Zap,
  ShieldCheck,
  HeadphonesIcon,
  Clock,
  Instagram,
  Target,
  Calendar,
  TrendingUp,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authApi } from './services/api';
import { Dashboard } from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

const BackgroundEffects = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#fbfbfe]">
    {/* Animated fluid blobs based on the video */}
    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-300/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-violet-300/30 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
    <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-pink-200/30 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
  </div>
);

const Navbar: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-violet-700 transition text-sm lg:text-base">Como Funciona</a>
            <a href="#planos" className="hover:text-violet-700 transition text-sm lg:text-base">Planos</a>
            <a href="#depoimentos" className="hover:text-violet-700 transition text-sm lg:text-base">Depoimentos</a>
            <a href="#faq" className="hover:text-violet-700 transition text-sm lg:text-base">FAQ</a>
            <button onClick={() => onNavigate('login')} className="text-gray-900 hover:text-violet-700 font-semibold px-3 lg:px-4 py-2 text-sm lg:text-base">
              Login
            </button>
            <button onClick={() => onNavigate('cadastro')} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold px-4 lg:px-6 py-2 rounded-full transition text-sm lg:text-base">
              Cadastrar
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4 font-medium text-gray-600">
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-violet-700 transition px-2 py-2">Como Funciona</a>
              <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="hover:text-violet-700 transition px-2 py-2">Planos</a>
              <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)} className="hover:text-violet-700 transition px-2 py-2">Depoimentos</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-violet-700 transition px-2 py-2">FAQ</a>
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="text-left text-gray-900 hover:text-violet-700 font-semibold px-2 py-2">
                Login
              </button>
              <button onClick={() => { onNavigate('cadastro'); setMobileMenuOpen(false); }} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold px-6 py-3 rounded-full transition text-center">
                Cadastrar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32 overflow-hidden">
    <BackgroundEffects />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-6 sm:space-y-8 relative z-10 text-center lg:text-left lg:pl-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold text-gray-900 leading-[1.15] sm:leading-[1.1] tracking-tight">
            Aumente seu Instagram com <br className="hidden sm:inline" /><span className="text-[#8B5CF6]">Seguidores Reais</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Impulsione sua presença digital com seguidores, curtidas, comentários e visualizações 100% REAIS e ORGÂNICOS. 
            Resultados garantidos em até 24 horas. Sem bots, sem riscos, apenas crescimento autêntico para o seu perfil.
          </p>
          <div>
            <a href="#planos" className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg shadow-[0_10px_20px_rgba(132,43,216,0.3)] transition-transform hover:-translate-y-1">
              Começar a Crescer Agora
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-y-4 sm:gap-x-2 pt-4 sm:pt-6 max-w-lg mx-auto lg:mx-0">
            {[
              "SEGUIDORES REAIS",
              "ENTREGA EM 24H",
              "100% SEGURO",
              "GARANTIA TOTAL"
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-[13px] font-bold text-gray-700 tracking-wide">
                <div className="bg-[#8B5CF6] rounded-full p-[2px] shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white p-[1px]" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Mockup */}
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm md:max-w-md pt-8 lg:pt-0 z-10 lg:pl-10">
           {/* Floating Notifications - Only visible on larger screens with better positioning */}
           <div className="hidden md:block absolute top-6 md:top-8 lg:top-10 -right-2 md:-right-4 lg:-right-12 bg-white/95 backdrop-blur-md p-2 md:p-3 px-3 md:px-4 rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 md:gap-3 animate-bounce border border-gray-100 z-20" style={{animationDuration: '3.5s'}}>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] md:text-[13px] leading-tight">
                <p><span className="font-bold text-gray-900">caio_d</span> curtiu sua</p>
                <p>publicação. <span className="text-gray-400">2 seg</span></p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-50 flex items-center justify-center ml-1">
                 <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 fill-current" />
              </div>
           </div>

           <div className="hidden lg:block absolute top-36 lg:top-44 -left-6 lg:-left-20 bg-white/95 backdrop-blur-md p-2 md:p-3 px-3 md:px-4 rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 md:gap-3 animate-bounce border border-gray-100 z-20" style={{animationDuration: '4.5s', animationDelay: '1s'}}>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] md:text-[13px] leading-tight">
                <p><span className="font-bold text-gray-900">anacli</span> curtiu sua</p>
                <p>publicação. <span className="text-gray-400">5 seg</span></p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-50 flex items-center justify-center ml-1">
                 <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 fill-current" />
              </div>
           </div>

           <div className="hidden md:block absolute bottom-20 md:bottom-24 -right-1 md:-right-2 lg:-right-8 bg-white/95 backdrop-blur-md p-2 md:p-3 px-3 md:px-4 rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2 md:gap-3 animate-bounce border border-gray-100 z-20" style={{animationDuration: '4s', animationDelay: '0.5s'}}>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-[11px] md:text-[13px] leading-tight">
                <p><span className="font-bold text-gray-900">_biale</span> curtiu sua</p>
                <p>publicação. <span className="text-gray-400">7 seg</span></p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-50 flex items-center justify-center ml-1">
                 <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 fill-current" />
              </div>
           </div>

          {/* Main Instagram Style Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-3 sm:p-4 transform-gpu relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-violet-600 p-[2px] pointer-events-none">
                  <div className="bg-white rounded-full p-[2px] w-full h-full">
                     <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-sm sm:text-[15px]">rubruna</span>
              </div>
              <MoreHorizontal className="text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            
            <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-square mb-3 sm:mb-4 bg-gray-100 pointer-events-none relative">
              <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80" 
                alt="Colorful portrait" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-1 sm:px-2 pb-1 sm:pb-2">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Heart className="h-5 w-5 sm:h-[26px] sm:w-[26px] text-gray-800" />
                  <MessageCircle className="h-5 w-5 sm:h-[26px] sm:w-[26px] text-gray-800" />
                  <Send className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
                </div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              </div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm">1.387 curtidas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="como-funciona" className="py-16 sm:py-20 md:py-24 bg-white/50 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16 md:mb-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">Como Funciona</h2>
      </div>

      <div className="space-y-20 sm:space-y-24 md:space-y-32">
        {/* Step 1 */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-24 items-center">
          <div className="order-2 lg:order-1 relative mx-auto w-full max-w-[280px] sm:max-w-xs md:max-w-sm">
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[80px] sm:blur-[100px] -z-10" />
            <div className="absolute -top-8 sm:-top-10 -right-8 sm:-right-10 w-32 h-32 sm:w-40 sm:h-40 bg-orange-300/30 rounded-full blur-[50px] sm:blur-[60px] -z-10" />
            
            <div className="bg-white border-[6px] sm:border-[8px] border-gray-100/80 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden aspect-[9/16] relative bg-cover bg-center">
               <div className="bg-white border-b border-gray-100 px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-between pt-10 sm:pt-12">
                  <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 rotate-90" />
                  <span className="font-bold text-gray-900 text-sm sm:text-base">Nova Publicação</span>
                  <span className="text-blue-500 font-bold text-sm sm:text-base">Compartilhar</span>
               </div>
               <div className="p-3 sm:p-4 flex gap-3 sm:gap-4 bg-white">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 mt-1">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
                 </div>
                 <div className="w-full">
                    <p className="text-[13px] sm:text-[15px] text-gray-800 leading-snug">Querem ver a receita dessa delícia?! 😍 <span className="text-blue-600">#food</span></p>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden mt-2 sm:mt-3 bg-gray-100 float-right ml-2 mb-2">
                       <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80" className="w-full h-full object-cover" alt="food" />
                    </div>
                 </div>
               </div>
               <div className="border-t border-gray-100 bg-white shadow-sm pb-8 sm:pb-10">
                 <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 text-gray-700 flex justify-between items-center text-[13px] sm:text-[15px]">
                   <span>Compartilhar no Close Friends</span>
                   <div className="w-10 h-5 sm:w-11 sm:h-6 bg-green-500 rounded-full relative"><div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"></div></div>
                 </div>
                 <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 text-gray-700 flex justify-between items-center text-[13px] sm:text-[15px]">
                   <span>Marcar pessoas</span>
                   <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 -rotate-90" />
                 </div>
                 <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 text-gray-700 flex justify-between items-center text-[13px] sm:text-[15px]">
                   <span>Adicionar Localização</span>
                   <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 -rotate-90" />
                 </div>
                 <div className="px-3 sm:px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap mt-2 hide-scrollbar">
                    <span className="bg-gray-100 text-gray-800 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">São Paulo, SP</span>
                    <span className="bg-gray-100 text-gray-800 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">Brasil</span>
                 </div>
               </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B5CF6] text-white font-bold text-xl sm:text-2xl mb-2 lg:ml-0 mx-auto shadow-lg shadow-violet-200">1</div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight px-4 lg:px-0">Escolha Seu Pacote</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4 lg:px-0">
              Selecione entre nossos pacotes de seguidores, curtidas, comentários ou visualizações. Todos 100% reais e orgânicos, com entrega garantida.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-24 items-center">
          <div className="text-center lg:text-right space-y-4 sm:space-y-6 lg:pr-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B5CF6] text-white font-bold text-xl sm:text-2xl mb-2 lg:ml-auto mx-auto shadow-lg shadow-violet-200">2</div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight px-4 lg:px-0">Processamento Instantâneo</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4 lg:px-0">
              Após a confirmação do pagamento, seu pedido é processado imediatamente. Nosso sistema automatizado garante agilidade e segurança total.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-xs md:max-w-sm">
             <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-[80px] sm:blur-[100px] -z-10" />
             <div className="absolute -top-8 sm:-top-10 -left-8 sm:-left-10 w-32 h-32 sm:w-40 sm:h-40 bg-violet-300/30 rounded-full blur-[50px] sm:blur-[60px] -z-10" />
             <div className="bg-white border-[6px] sm:border-[8px] border-gray-100/80 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden aspect-[9/16] pb-2 flex flex-col relative">
                <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 pt-8 sm:pt-10">
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900 rotate-90" />
                  <span className="font-bold text-gray-900 text-sm sm:text-[15px]">rubruna <ChevronDown className="inline w-3 h-3 sm:w-4 sm:h-4 ml-1" /></span>
                  <div className="flex gap-3 sm:gap-4"><MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /><MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                </div>
                <div className="p-3 sm:p-4 flex gap-4 sm:gap-6 items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 bg-gray-200 border border-gray-100">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between flex-1 text-center pr-2">
                    <div><div className="font-bold text-gray-900 text-base sm:text-lg">34</div><div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">publicações</div></div>
                    <div><div className="font-bold text-gray-900 text-base sm:text-lg">12k</div><div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">seguidores</div></div>
                    <div><div className="font-bold text-gray-900 text-base sm:text-lg">500</div><div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">seguindo</div></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0.5 flex-1 relative bg-white pb-[2px]">
                  <div className="absolute top-[33.33%] left-0 w-[33.33%] h-[33.33%] border-[3px] sm:border-4 border-green-500 z-10 pointer-events-none shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                  
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                  <div className="bg-gray-200 aspect-square"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="" /></div>
                </div>
             </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 xl:gap-24 items-center">
          <div className="order-2 lg:order-1 relative mx-auto w-full max-w-[280px] sm:max-w-xs md:max-w-sm">
             <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-[80px] sm:blur-[100px] -z-10" />
             <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden p-4 sm:p-6 rotate-[-2deg] relative border border-gray-100">
                <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg flex items-center gap-1.5 sm:gap-2 z-20 border border-gray-50">
                   <div className="bg-blue-50 p-1 sm:p-1.5 rounded-full"><MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 fill-blue-500/20" /></div>
                   <span className="text-xs sm:text-sm font-bold text-gray-800">1.3M</span>
                </div>
                
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-[15px]">rubruna</div>
                      <div className="text-[10px] sm:text-xs text-blue-600 font-bold tracking-wide">Patrocinado</div>
                    </div>
                  </div>
                  <div className="aspect-square bg-gray-100 relative">
                     <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" alt="food" className="w-full h-full object-cover" />
                     <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-md text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold shadow-lg">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
                        Programado
                     </div>
                  </div>
                  <div className="p-3 sm:p-4">
                     <div className="flex gap-3 sm:gap-4 pb-2 sm:pb-3">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" /><MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" /><Send className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                     </div>
                     <p className="text-[13px] sm:text-[15px] font-bold mb-1">3.037 curtidas</p>
                     <p className="text-[13px] sm:text-[15px] text-gray-800"><span className="font-bold">rubruna</span> Quem aí vai na inauguração do novo espaço? ✨ #vibe</p>
                  </div>
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left space-y-4 sm:space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B5CF6] text-white font-bold text-xl sm:text-2xl mb-2 lg:ml-0 mx-auto shadow-lg shadow-violet-200">3</div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight px-4 lg:px-0">Resultados em 24 Horas</h3>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4 lg:px-0">
              Veja seu perfil crescer com seguidores reais e engajamento autêntico. Entrega completa em até 24 horas com garantia de reposição.
            </p>
            <div className="pt-2">
              <a href="#planos" className="inline-block bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full transition shadow-[0_10px_20px_rgba(132,43,216,0.3)]">
                Ver Pacotes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MiniTestimonial = () => (
  <section className="pb-16 sm:pb-20 md:pb-24 pt-8 sm:pt-10 md:pt-12 bg-white text-center max-w-2xl mx-auto px-4 sm:px-6">
    <div className="flex justify-center mb-4 sm:mb-6">
       <div className="-space-x-2 sm:-space-x-3 flex">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white shadow-md z-30" alt="" />
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white shadow-md z-20" alt="" />
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white shadow-md z-10" alt="" />
       </div>
    </div>
    <div className="flex justify-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-800 italic mb-4 sm:mb-6 leading-tight px-2">
      "Comprei 5.000 seguidores e em menos de 24h meu perfil explodiu! Todos reais e engajados. Melhor investimento que fiz!"
    </p>
    <div className="text-gray-500 font-medium text-sm sm:text-base">
      <span className="font-bold text-gray-900">Carlos Silva</span> - Empreendedor Digital
    </div>
  </section>
);

const Pricing = () => (
  <section id="planos" className="py-16 sm:py-20 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600 mb-4 sm:mb-6">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Pacotes</h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">Escolha o pacote ideal para impulsionar seu Instagram hoje mesmo</p>
        
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> 10:26 Ofertas por tempo limitado
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-center">
        {/* Starter */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 flex flex-col min-h-[480px] sm:min-h-[520px]">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Starter</h3>
            <div className="flex justify-center items-center gap-2">
               <div className="text-4xl sm:text-5xl font-extrabold text-gray-900">1K</div>
               <div className="text-xs sm:text-sm font-medium text-violet-700 leading-tight text-left">Seguidores<br/>Reais</div>
            </div>
          </div>
          <div className="flex-1">
            <ul className="space-y-3 sm:space-y-4 text-center text-gray-700 font-medium text-sm sm:text-base">
              <li>✓ 1.000 Seguidores Reais</li>
              <li>✓ Entrega em até 24h</li>
              <li>✓ 100% Seguro</li>
              <li>✓ Garantia de Reposição</li>
              <li>✓ Suporte 24/7</li>
            </ul>
          </div>
          <button className="w-full py-3 sm:py-4 mt-4 sm:mt-6 rounded-full font-bold text-base sm:text-lg bg-pink-50 text-violet-700 hover:bg-pink-100 transition">Comprar Agora</button>
        </div>

        {/* Growth */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 flex flex-col min-h-[480px] sm:min-h-[520px]">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Growth</h3>
            <div className="flex justify-center items-center gap-2">
               <div className="text-4xl sm:text-5xl font-extrabold text-gray-900">5K</div>
               <div className="text-xs sm:text-sm font-medium text-violet-700 leading-tight text-left">Seguidores<br/>Reais</div>
            </div>
          </div>
          <div className="flex-1">
            <ul className="space-y-3 sm:space-y-4 text-center text-gray-700 font-medium text-sm sm:text-base">
              <li>✓ 5.000 Seguidores Reais</li>
              <li>✓ Entrega em até 24h</li>
              <li>✓ 100% Seguro</li>
              <li>✓ Garantia de Reposição</li>
              <li>✓ Suporte Prioritário 24/7</li>
            </ul>
          </div>
          <button className="w-full py-3 sm:py-4 mt-4 sm:mt-6 rounded-full font-bold text-base sm:text-lg bg-violet-700 text-white hover:bg-violet-800 shadow-xl shadow-violet-200 transition">Comprar Agora</button>
        </div>

        {/* Premium (Mais Vendido) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#ffeb85] flex flex-col min-h-[500px] sm:min-h-[560px] relative md:col-span-2 lg:col-span-1 transform lg:-translate-y-4">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ffeb85] text-amber-900 font-black text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" /> MAIS VENDIDO
          </div>
          <div className="text-center mb-4 sm:mb-6 mt-3 sm:mt-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Premium</h3>
            <div className="flex justify-center items-center gap-2">
               <div className="text-4xl sm:text-5xl font-extrabold text-[#7e22ce]">10K</div>
               <div className="text-xs sm:text-sm font-medium text-amber-600 leading-tight text-left">Seguidores<br/>Reais</div>
            </div>
          </div>
          <div className="flex-1">
            <ul className="space-y-3 sm:space-y-4 text-center text-gray-800 font-medium font-semibold text-sm sm:text-base">
              <li>✓ 10.000 Seguidores Reais</li>
              <li>✓ Entrega em até 12h</li>
              <li>✓ 100% Seguro</li>
              <li>✓ Garantia Vitalícia</li>
              <li>✓ Suporte VIP 24/7</li>
            </ul>
          </div>
          <button className="w-full py-3 sm:py-4 mt-4 sm:mt-6 rounded-full font-bold text-base sm:text-lg bg-violet-700 text-white hover:bg-violet-800 shadow-xl shadow-violet-200 transition">Comprar Agora</button>
        </div>
      </div>

      <div className="pt-12 sm:pt-16 md:pt-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-x-16 sm:gap-y-8 text-gray-700 font-bold text-base sm:text-lg">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><Instagram className="w-6 h-6 text-violet-700" /></div>
             <span>Postagens Profissionais</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><Target className="w-6 h-6 text-violet-700" /></div>
             <span>Posicionamento Estratégico</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><Calendar className="w-6 h-6 text-violet-700" /></div>
             <span>Planejamento Mensal</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><X className="w-6 h-6 text-violet-700" /></div>
             <span>Cancele a qualquer momento</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><HeadphonesIcon className="w-6 h-6 text-violet-700" /></div>
             <span>Suporte Exclusivo</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0"><ShieldCheck className="w-6 h-6 text-green-600" /></div>
             <span>7 dias de garantia</span>
          </div>
        </div>
        <p className="text-center text-violet-700 mt-16 font-bold">Dúvidas? <a href="#faq" className="underline hover:text-violet-900 transition">Fale agora com nosso suporte</a></p>
      </div>
    </div>
  </section>
);

const Guarantee = () => (
  <section className="py-20 bg-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-12 text-left">
       <div className="w-48 shrink-0 relative">
          {/* Mocking the guarantee badge roughly */}
          <div className="relative w-40 h-40 mx-auto">
             <div className="absolute inset-0 bg-[#FFD700] rounded-full rotate-[15deg] shadow-lg shadow-yellow-200"></div>
             <div className="absolute inset-0 bg-[#FFA500] rounded-full -rotate-[15deg]"></div>
             <div className="absolute inset-2 bg-gradient-to-br from-yellow-100 to-yellow-400 rounded-full flex flex-col items-center justify-center text-center shadow-inner border-4 border-yellow-500/20">
               <div className="absolute inset-4 rounded-full border border-dashed border-amber-600/30"></div>
               <span className="font-bold text-amber-900 text-[10px] tracking-widest leading-none mt-2 relative z-10">GARANTIA DE</span>
               <span className="font-extrabold text-amber-900 text-4xl my-1 leading-none relative z-10">100%</span>
               <span className="font-bold text-amber-900 text-[10px] tracking-wider relative z-10">SATISFAÇÃO</span>
             </div>
          </div>
       </div>
       <div className="max-w-xl">
         <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center md:text-left">Garantia de Satisfação</h3>
         <p className="text-lg text-gray-600 leading-relaxed text-center md:text-left">
           Estamos tão confiantes na qualidade dos nossos serviços que oferecemos garantia de reposição em todos os pacotes. 
           Se você perder seguidores, repomos gratuitamente! Sua satisfação é nossa prioridade número 1.
         </p>
       </div>
    </div>
  </section>
);

const SocialProof = () => (
  <section id="depoimentos" className="py-24 bg-gray-50 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-[100px] -z-10" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] -z-10" />
    
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 leading-[1.4]">
        Desde 2020, mais de <span className="bg-[#e4fcda] text-green-900 font-bold px-2 py-1 rounded">50.000+ CLIENTES satisfeitos</span> já confiaram no testsmm para crescer seus perfis!
      </h2>

      <div className="space-y-6 text-left">
        {/* Testimonial 1 */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 relative">
           <div className="absolute -left-3 -top-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
             <Star className="text-white w-5 h-5 fill-current" />
           </div>
           <div className="font-bold text-gray-900 mb-1 text-lg">Rafael Costa <span className="text-gray-400 font-normal text-sm ml-2">- Influencer Fitness</span></div>
           <div className="text-green-600 font-bold mb-4 tracking-wide text-xs uppercase">RESULTADO INCRÍVEL</div>
           <p className="text-gray-600 italic leading-relaxed mb-6 font-medium">
             "Comprei 10.000 seguidores e o resultado foi além das minhas expectativas! Todos reais, engajados e meu perfil cresceu organicamente depois disso. 
             Em 2 semanas já tinha fechado 5 parcerias. O investimento se pagou sozinho!"
           </p>
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pacote Premium de 10K Seguidores</div>
        </div>

        {/* Testimonial 2 */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 relative">
           <div className="absolute -left-3 -top-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
             <Star className="text-white w-5 h-5 fill-current" />
           </div>
           <div className="font-bold text-gray-900 mb-1 text-lg">Juliana Mendes <span className="text-gray-400 font-normal text-sm ml-2">- Loja de Roupas Online</span></div>
           <div className="text-green-600 font-bold mb-4 tracking-wide text-xs uppercase">VENDAS TRIPLICARAM</div>
           <p className="text-gray-600 italic leading-relaxed mb-6 font-medium">
             "Comprei 5.000 seguidores para dar aquele boost inicial na minha loja. O resultado? Minhas vendas triplicaram em 1 mês! 
             Os seguidores são reais, muitos viraram clientes. Melhor investimento que já fiz no meu negócio!"
           </p>
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pacote Growth de 5K Seguidores</div>
        </div>

        {/* Testimonial 3 */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 relative">
           <div className="absolute -left-3 -top-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
             <Star className="text-white w-5 h-5 fill-current" />
           </div>
           <div className="font-bold text-gray-900 mb-1 text-lg">Thiago Almeida <span className="text-gray-400 font-normal text-sm ml-2">- Coach de Vendas</span></div>
           <div className="text-green-600 font-bold mb-4 tracking-wide text-xs uppercase">SUPER RECOMENDO</div>
           <p className="text-gray-600 italic leading-relaxed mb-6 font-medium">
             "Estava com 800 seguidores e precisava de credibilidade para vender meus cursos. Comprei 1.000 seguidores e em 24h já estavam lá! 
             Todos reais e ativos. Agora com mais de 2.000 seguidores, minhas vendas decolaram. Super recomendo!"
           </p>
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pacote Starter de 1K Seguidores</div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
       <div className="mb-16">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-violet-100 text-violet-700 mb-6">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Por que escolher o testsmm?</p>
          <h2 className="text-4xl font-bold text-gray-900 max-w-2xl mx-auto">
            Nossos clientes nos escolhem porque oferecemos o melhor serviço e o melhor atendimento.
          </h2>
       </div>

       <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto text-left">
          <div className="flex gap-4">
             <div className="shrink-0"><div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-violet-700" /></div></div>
             <div>
               <h4 className="text-xl font-bold text-gray-900 mb-2">Entrega Rápida</h4>
               <p className="text-gray-600 leading-relaxed">Receba seus seguidores, curtidas ou visualizações em até 24 horas. Nosso sistema automatizado garante agilidade sem comprometer a qualidade.</p>
             </div>
          </div>
          
          <div className="flex gap-4">
             <div className="shrink-0"><div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-green-600" /></div></div>
             <div>
               <h4 className="text-xl font-bold text-gray-900 mb-2">Garantia de Reposição</h4>
               <p className="text-gray-600 leading-relaxed">Se por algum motivo você perder seguidores, repomos gratuitamente. Sua satisfação é nossa prioridade número 1.</p>
             </div>
          </div>

          <div className="flex gap-4">
             <div className="shrink-0"><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-blue-600" /></div></div>
             <div>
               <h4 className="text-xl font-bold text-gray-900 mb-2">100% Seguro</h4>
               <p className="text-gray-600 leading-relaxed">Sua conta está totalmente segura conosco, iremos apenas agendar as postagens e fazer a gestão da sua rede social de forma eficiente.</p>
             </div>
          </div>

          <div className="flex gap-4">
             <div className="shrink-0"><div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><HeadphonesIcon className="w-6 h-6 text-orange-600" /></div></div>
             <div>
               <h4 className="text-xl font-bold text-gray-900 mb-2">Suporte Premium</h4>
               <p className="text-gray-600 leading-relaxed">Estamos sempre a disposição para esclarecer qualquer dúvida ou solicitação da forma mais eficiente.</p>
             </div>
          </div>
       </div>
    </div>
  </section>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button 
        className="w-full text-left py-6 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-gray-900 text-lg pr-8">{question}</span>
        <ChevronDown className={`w-6 h-6 text-violet-700 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "Os seguidores são reais?",
      a: "Sim! 100% dos nossos seguidores são contas reais e ativas. Não trabalhamos com bots ou perfis falsos. Todos os seguidores são pessoas reais que podem interagir com seu conteúdo."
    },
    {
      q: "Quanto tempo leva para receber?",
      a: "A entrega começa imediatamente após a confirmação do pagamento e é concluída em até 24 horas. Para pacotes maiores, a entrega pode ser gradual para manter a naturalidade."
    },
    {
      q: "É seguro para minha conta?",
      a: "Totalmente seguro! Nosso método é 100% orgânico e segue todas as diretrizes do Instagram. Nunca pedimos sua senha e não há risco de banimento."
    },
    {
      q: "Vocês oferecem garantia?",
      a: "Sim! Oferecemos garantia de reposição. Se você perder seguidores (o que é raro), repomos gratuitamente dentro do período de garantia de cada pacote."
    },
    {
      q: "Posso comprar curtidas e comentários também?",
      a: "Sim! Além de seguidores, oferecemos pacotes de curtidas, comentários autênticos e visualizações para stories e reels. Entre em contato para pacotes personalizados."
    },
    {
      q: "Como funciona o pagamento?",
      a: "Aceitamos PIX, cartão de crédito e boleto bancário. O pagamento é processado de forma segura e seus dados são protegidos."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-violet-100 text-violet-700 mb-6">
            <span className="font-bold text-2xl">?</span>
          </div>
          <p className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">Dúvidas?</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Estamos aqui para te ajudar.</h2>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg mb-12 border border-gray-100">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>

        <p className="text-center text-gray-600 font-medium">
          Não encontrou sua dúvida? <a href="#" className="text-violet-700 hover:text-violet-800 underline font-bold">Fale agora com nosso suporte.</a>
        </p>
      </div>
    </section>
  );
};

const BottomCTA = () => (
  <section className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] py-20 sm:py-24 md:py-32 px-4 text-center relative overflow-hidden">
    <div className="absolute inset-0 z-0">
       <div className="absolute -top-32 sm:-top-40 -left-32 sm:-left-40 w-80 h-80 sm:w-96 sm:h-96 bg-violet-500/30 rounded-full blur-[80px] sm:blur-[100px]" />
       <div className="absolute bottom-0 right-0 w-full h-80 sm:h-96 bg-blue-500/20 rounded-full blur-[100px] sm:blur-[120px]" />
    </div>
    
    <div className="max-w-4xl mx-auto relative z-10">
       <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 sm:mb-10 tracking-tight leading-tight drop-shadow-sm px-4">
         Pronto para Explodir no Instagram?
       </h2>
       <a href="#planos" className="inline-block bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 sm:py-5 px-8 sm:px-10 md:px-12 rounded-full text-lg sm:text-xl md:text-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-transform hover:-translate-y-2 mb-4 sm:mb-6 tracking-wide">
         Ver Pacotes Agora
       </a>
       <p className="text-violet-200 font-medium text-base sm:text-lg md:text-xl mt-3 sm:mt-4 px-4">
         Milhares de clientes satisfeitos • <strong className="text-white bg-violet-900/40 px-2 py-0.5 rounded">Entrega em 24h garantida!</strong>
       </p>
    </div>
  </section>
);

const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <footer className="bg-gray-900 text-gray-400 py-8 sm:py-10 md:py-12 border-t border-gray-800 relative z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-800">
         <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="bg-violet-600 p-1 sm:p-1.5 rounded-lg text-white">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-white">testsmm</span>
            </div>
            <p className="text-xs sm:text-sm max-w-sm mb-3 sm:mb-4">Sua parceira de confiança para crescimento orgânico no Instagram. Seguidores reais, curtidas autênticas e resultados garantidos.</p>
         </div>
         <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-violet-400">Sobre nós</a></li>
              <li><a href="#como-funciona" className="hover:text-violet-400">Como Funciona</a></li>
              <li><a href="#planos" className="hover:text-violet-400">Planos e Preços</a></li>
            </ul>
         </div>
         <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Links Úteis</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><a href="#faq" className="hover:text-violet-400">FAQ</a></li>
              <li><button onClick={() => onNavigate('termos')} className="hover:text-violet-400 text-left">Termos de Responsabilidade</button></li>
              <li><button onClick={() => onNavigate('privacidade')} className="hover:text-violet-400 text-left">Política de Privacidade</button></li>
            </ul>
         </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-3 sm:gap-0">
         <p>© {new Date().getFullYear()} testsmm - Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

const LoginPage: React.FC<{ onNavigate: (page: string) => void; onLoginSuccess: () => void }> = ({ onNavigate, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [rateLimitWait, setRateLimitWait] = useState(0);

  // Carregar email salvo se existir
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Countdown timer para rate limiting
  useEffect(() => {
    if (rateLimitWait > 0) {
      const timer = setInterval(() => {
        setRateLimitWait((prev) => {
          if (prev <= 1) {
            setForgotError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimitWait]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        // Salvar ou remover email baseado no checkbox
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          // Marcar que o usuário quer permanecer logado
          localStorage.setItem('keepLoggedIn', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          // Marcar que o usuário NÃO quer permanecer logado
          localStorage.setItem('keepLoggedIn', 'false');
        }
        
        console.log('Login bem-sucedido:', response.data);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    setRateLimitWait(0);

    try {
      const response = await authApi.forgotPassword(forgotEmail);
      if (response.success) {
        setForgotSuccess(true);
      }
    } catch (err: any) {
      // Verificar se é erro de rate limiting (429)
      if (err.status === 429 && err.waitSeconds) {
        setRateLimitWait(err.waitSeconds);
        const minutes = Math.floor(err.waitSeconds / 60);
        const seconds = err.waitSeconds % 60;
        if (minutes > 0) {
          setForgotError(`Aguarde ${minutes}m ${seconds}s antes de solicitar um novo link`);
        } else {
          setForgotError(`Aguarde ${seconds}s antes de solicitar um novo link`);
        }
      } else {
        setForgotError(err.message || 'Erro ao enviar email de recuperação');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError('');
    setRateLimitWait(0);
  };

  // Formatar tempo de espera para exibição
  const formatWaitTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4 py-12">
      {/* Modal Esqueceu Senha */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={closeForgotPasswordModal}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {!forgotSuccess ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Esqueceu sua senha?
                  </h3>
                  <button
                    onClick={closeForgotPasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm">
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>

                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm block">{forgotError}</span>
                      {rateLimitWait > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-bold">{formatWaitTime(rateLimitWait)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                        placeholder="seu@email.com"
                        required
                        disabled={forgotLoading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                      disabled={forgotLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={forgotLoading || rateLimitWait > 0}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Enviando...
                        </>
                      ) : rateLimitWait > 0 ? (
                        <>
                          <Clock className="h-5 w-5" />
                          Aguarde {formatWaitTime(rateLimitWait)}
                        </>
                      ) : (
                        'Enviar'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Email Enviado!
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Enviamos um link de recuperação para <strong>{forgotEmail}</strong>. 
                  Verifique sua caixa de entrada e spam.
                </p>
                <button
                  onClick={closeForgotPasswordModal}
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => onNavigate('home')}
        className="fixed top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-violet-700 font-semibold transition group text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
          <p className="text-sm sm:text-base text-gray-600">Entre na sua conta para continuar</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="ml-2 text-gray-600">Lembrar-me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-violet-700 hover:text-violet-800 font-semibold"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg shadow-violet-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm sm:text-base">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <button onClick={() => onNavigate('cadastro')} className="text-violet-700 hover:text-violet-800 font-bold">
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CadastroPage: React.FC<{ onNavigate: (page: string) => void; onRegisterSuccess: () => void }> = ({ onNavigate, onRegisterSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register(formData);
      
      if (response.success) {
        // Registration successful
        console.log('Cadastro bem-sucedido:', response.data);
        onRegisterSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      console.error('Erro no cadastro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <button 
        onClick={() => onNavigate('home')}
        className="fixed top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-violet-700 font-semibold transition group text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Crie sua conta</h1>
          <p className="text-sm sm:text-base text-gray-600">Comece a escalar seu negócio hoje</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="Seu nome"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg shadow-violet-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm sm:text-base">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <button onClick={() => onNavigate('login')} className="text-violet-700 hover:text-violet-800 font-bold">
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Extrair token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Token inválido ou ausente');
      setValidatingToken(false);
      setTokenValid(false);
    } else {
      setToken(tokenFromUrl);
      setValidatingToken(false);
      setTokenValid(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, password, confirmPassword);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate('login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validando link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600 mb-6">
            Este link de recuperação é inválido ou está ausente.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Redefinida!</h2>
          <p className="text-gray-600 mb-6">
            Sua senha foi alterada com sucesso. Redirecionando para o login...
          </p>
          <Loader2 className="h-6 w-6 text-violet-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <button 
        onClick={() => onNavigate('login')}
        className="fixed top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-violet-700 font-semibold transition group text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar</span>
      </button>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Redefinir Senha</h1>
          <p className="text-sm sm:text-base text-gray-600">Digite sua nova senha</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg shadow-violet-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const TermosPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="min-h-screen bg-gray-50">
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-violet-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>
    </nav>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Termos de Responsabilidade</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar os serviços da testsmm, você concorda em cumprir e estar vinculado aos seguintes 
              termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar 
              nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Descrição dos Serviços</h2>
            <p>
              A testsmm oferece serviços de marketing digital para Instagram, incluindo mas não limitado a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aumento de seguidores reais e orgânicos</li>
              <li>Curtidas em publicações</li>
              <li>Comentários autênticos</li>
              <li>Visualizações em vídeos</li>
            </ul>
            <p className="mt-4">
              Todos os serviços são fornecidos de acordo com as políticas e diretrizes do Instagram e outras 
              plataformas de redes sociais aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Responsabilidades do Usuário</h2>
            <p>Ao utilizar nossos serviços, você concorda em:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer informações precisas e atualizadas sobre sua conta do Instagram</li>
              <li>Não utilizar os serviços para fins ilegais ou não autorizados</li>
              <li>Não violar os termos de serviço do Instagram ou outras plataformas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Ser o proprietário legítimo ou ter autorização para gerenciar a conta do Instagram fornecida</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Limitações de Responsabilidade</h2>
            <p>
              A testsmm não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Suspensão ou banimento de contas do Instagram devido ao uso inadequado dos serviços</li>
              <li>Perda de seguidores, curtidas ou engajamento após a entrega dos serviços</li>
              <li>Mudanças nas políticas do Instagram que possam afetar a entrega dos serviços</li>
              <li>Interrupções temporárias nos serviços devido a manutenção ou problemas técnicos</li>
              <li>Resultados específicos de marketing ou crescimento de negócios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Garantias e Reembolsos</h2>
            <p>
              Oferecemos garantia de entrega para todos os nossos pacotes. Caso o serviço não seja entregue 
              conforme especificado, você pode solicitar reembolso dentro de 30 dias após a compra.
            </p>
            <p className="mt-4">
              Reembolsos não serão concedidos se:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A conta do Instagram fornecida for privada ou bloqueada</li>
              <li>O usuário alterar o nome de usuário do Instagram após o pedido</li>
              <li>O serviço foi entregue conforme especificado</li>
              <li>A conta do Instagram foi suspensa ou banida por violação dos termos do Instagram</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Pagamentos</h2>
            <p>
              Todos os pagamentos são processados de forma segura através do Mercado Pago. Aceitamos pagamentos 
              via PIX. Os preços estão sujeitos a alterações sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo presente no site da testsmm, incluindo textos, gráficos, logos, ícones e imagens, 
              é propriedade da testsmm e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em 
              vigor imediatamente após a publicação no site. O uso continuado dos serviços após as alterações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Lei Aplicável</h2>
            <p>
              Estes termos serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa 
              relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contato</h2>
            <p>
              Para questões sobre estes termos, entre em contato conosco através do email de suporte disponível 
              em nosso site.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PrivacidadePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="min-h-screen bg-gray-50">
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-violet-700 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900">testsmm</span>
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-violet-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>
      </div>
    </nav>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introdução</h2>
            <p>
              A testsmm ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de 
              Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você 
              utiliza nossos serviços.
            </p>
            <p className="mt-4">
              Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Informações que Coletamos</h2>
            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.1 Informações Fornecidas por Você</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Cadastro:</strong> Nome, email, senha (criptografada)</li>
              <li><strong>Dados de Pagamento:</strong> Informações processadas através do Mercado Pago (não armazenamos dados de cartão)</li>
              <li><strong>Dados do Instagram:</strong> Nome de usuário do Instagram, links de publicações</li>
              <li><strong>Dados de Comunicação:</strong> Mensagens enviadas através de nossos canais de suporte</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.2 Informações Coletadas Automaticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Uso:</strong> Páginas visitadas, tempo de permanência, cliques</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional, dispositivo</li>
              <li><strong>Cookies:</strong> Utilizamos cookies para melhorar sua experiência (veja seção 7)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Como Usamos Suas Informações</h2>
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter nossos serviços</li>
              <li>Processar pagamentos e pedidos</li>
              <li>Entregar os serviços contratados (seguidores, curtidas, etc.)</li>
              <li>Enviar notificações sobre pedidos e atualizações de serviço</li>
              <li>Responder a solicitações de suporte</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Detectar e prevenir fraudes</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Compartilhamento de Informações</h2>
            <p>Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Processadores de Pagamento:</strong> Mercado Pago para processar transações</li>
              <li><strong>Provedores de Serviço:</strong> Empresas que nos auxiliam na operação (hospedagem, email, etc.)</li>
              <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
              <li><strong>Transferência de Negócios:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia SSL/TLS para transmissão de dados</li>
              <li>Senhas criptografadas com bcrypt</li>
              <li>Acesso restrito aos dados pessoais</li>
              <li>Monitoramento regular de vulnerabilidades</li>
              <li>Backups regulares e seguros</li>
            </ul>
            <p className="mt-4">
              No entanto, nenhum método de transmissão pela internet é 100% seguro. Não podemos garantir segurança 
              absoluta dos dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos 
              nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Dados de Conta:</strong> Enquanto sua conta estiver ativa</li>
              <li><strong>Dados de Pedidos:</strong> Por até 5 anos para fins fiscais e legais</li>
              <li><strong>Dados de Suporte:</strong> Por até 2 anos após a última interação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento do site (autenticação, segurança)</li>
              <li><strong>Cookies de Desempenho:</strong> Para analisar como os visitantes usam o site</li>
              <li><strong>Cookies de Funcionalidade:</strong> Para lembrar suas preferências</li>
            </ul>
            <p className="mt-4">
              Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Seus Direitos (LGPD)</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acesso:</strong> Solicitar cópias de seus dados pessoais</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incorretos ou incompletos</li>
              <li><strong>Exclusão:</strong> Solicitar exclusão de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Solicitar transferência de seus dados para outro provedor</li>
              <li><strong>Revogação:</strong> Revogar consentimento para processamento de dados</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados em certas circunstâncias</li>
            </ul>
            <p className="mt-4">
              Para exercer esses direitos, entre em contato conosco através do email de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Privacidade de Menores</h2>
            <p>
              Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente informações 
              pessoais de menores. Se você é pai/mãe ou responsável e acredita que seu filho nos forneceu informações 
              pessoais, entre em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Links para Sites de Terceiros</h2>
            <p>
              Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de 
              privacidade desses sites. Recomendamos que você leia as políticas de privacidade de cada site que visitar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações 
              significativas publicando a nova política nesta página e atualizando a data de "Última atualização".
            </p>
            <p className="mt-4">
              Recomendamos que você revise esta política periodicamente para se manter informado sobre como protegemos 
              suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais, 
              entre em contato conosco através do email de suporte disponível em nosso site.
            </p>
            <p className="mt-4">
              <strong>Controlador de Dados:</strong> testsmm<br />
              <strong>Email:</strong> Disponível no site<br />
              <strong>Localização:</strong> Brasil
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  </div>
);

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="min-h-screen bg-white font-sans selection:bg-violet-700 selection:text-white scroll-smooth relative">
    <Navbar onNavigate={onNavigate} />
    <Hero />
    <HowItWorks />
    <MiniTestimonial />
    <Pricing />
    <Guarantee />
    <SocialProof />
    <Features />
    <FAQ />
    <BottomCTA />
    <Footer onNavigate={onNavigate} />
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se há token na URL (reset-password)
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (resetToken) {
      setCurrentPage('reset-password');
      return;
    }

    // Verificar se usuário está autenticado
    const token = authApi.isAuthenticated();
    const keepLoggedIn = localStorage.getItem('keepLoggedIn');
    
    // Se tem token mas NÃO marcou "Lembrar-me", fazer logout
    if (token && keepLoggedIn === 'false') {
      authApi.logout();
      localStorage.removeItem('keepLoggedIn');
      setIsAuthenticated(false);
      setCurrentPage('home');
      return;
    }
    
    // Se tem token e marcou "Lembrar-me", manter logado
    if (token && keepLoggedIn === 'true') {
      setIsAuthenticated(true);
      if (currentPage === 'home') {
        setCurrentPage('dashboard');
      }
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Verificar se o usuário é admin
    const user = authApi.getCurrentUser();
    if (user && user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };

  if (currentPage === 'admin' && isAuthenticated) {
    return <AdminPanel />;
  }

  if (currentPage === 'dashboard' && isAuthenticated) {
    return <Dashboard onNavigate={handleNavigate} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'cadastro') {
    return <CadastroPage onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />;
  }

  if (currentPage === 'reset-password') {
    return <ResetPasswordPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'termos') {
    return <TermosPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'privacidade') {
    return <PrivacidadePage onNavigate={handleNavigate} />;
  }

  return <HomePage onNavigate={handleNavigate} />;
}


