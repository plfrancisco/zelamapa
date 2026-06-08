import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, TrendingUp, CheckCircle, 
  ArrowRight, X, Mail, Lock, Leaf, Truck, BarChart3, Shield, AlertCircle, Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { login } from '../api/authService';
import { ZelaMapaFullLogo } from '../components/ZelaMapaLogos';

interface LandingPageProps {
  onLogin: (role: 'motorista' | 'gerente' | 'cidadao') => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState<'gerente' | 'motorista'>('gerente');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, senha);
      setShowLoginModal(false);
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1A2B48] dark:text-white font-sans selection:bg-[#8be9fd] selection:text-[#0B1437] transition-colors duration-500">
      
      {/* 1. HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/70 dark:bg-[#111C44]/70 backdrop-blur-xl border-gray-200 dark:border-white/5 shadow-sm py-4' 
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ZelaMapaFullLogo className="h-10 scale-90 origin-left" variant={isScrolled ? (isDarkMode ? 'light' : 'dark') : 'light'} />
          </div>
          
          <nav className={`hidden md:flex gap-8 items-center text-[10px] font-black tracking-widest uppercase ${isScrolled ? 'text-gray-500 dark:text-gray-300' : 'text-gray-300'}`}>
            <a href="#como-funciona" className="hover:text-[#8be9fd] transition-colors">Como Funciona</a>
            <a href="#beneficios" className="hover:text-[#8be9fd] transition-colors">Benefícios</a>
            <a href="#noticias" className="hover:text-[#8be9fd] transition-colors">Notícias</a>
          </nav>

          <Button 
            onClick={() => setShowLoginModal(true)}
            className="bg-gradient-to-r from-[#2DCE89] to-[#25B477] text-white text-[10px] font-black tracking-widest uppercase rounded-[14px] px-6 h-10 shadow-lg shadow-[#2DCE89]/30 hover:shadow-[#2DCE89]/50 hover:scale-[1.02] transition-all"
          >
            Acessar Sistema
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-[#1A2B48] dark:bg-[#111C44] overflow-hidden relative rounded-b-[40px] shadow-2xl transition-colors duration-500">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#8be9fd] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#2DCE89] opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Esquerda */}
            <div className="flex flex-col items-start gap-6 text-white">
              <Badge className="bg-[#8be9fd]/20 text-[#8be9fd] hover:bg-[#8be9fd]/30 border-none px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-sm shadow-none">
                🌱 Cidade Sustentável
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Gestão Inteligente de <span className="text-[#8be9fd] inline-block -rotate-1 origin-left">Resíduos</span> com o ZelaMapa
              </h1>
              <p className="text-lg text-gray-300 dark:text-gray-400 max-w-xl leading-relaxed font-medium">
                Sistema avançado de agendamento e otimização de rotas para coletas de entulho, móveis e poda. Mantendo nossa cidade limpa com dados em tempo real.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4 w-full">
                <Button 
                  onClick={() => { setLoginType('gerente'); setShowLoginModal(true); }}
                  className="bg-[#5e8cf7] hover:bg-[#4b7ce6] h-14 px-6 rounded-[16px] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#5e8cf7]/20 hover:scale-105 transition-transform"
                >
                  <BarChart3 className="mr-2 h-4 w-4" /> Acessar Dashboard
                </Button>
                <Button 
                  onClick={() => { setLoginType('motorista'); setShowLoginModal(true); }}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 h-14 px-6 rounded-[16px] text-xs font-black tracking-widest uppercase hover:scale-105 transition-transform"
                >
                  <Truck className="mr-2 h-4 w-4" /> App Motorista
                </Button>
                {/* Acesso direto ao App do Cidadão para teste rápido */}
                <Button
                  onClick={() => onLogin('cidadao')}
                  className="bg-gradient-to-r from-[#2DCE89] to-[#25B477] text-white h-14 px-6 rounded-[16px] text-xs font-black tracking-widest uppercase hover:scale-105 shadow-lg shadow-[#2DCE89]/30 hover:shadow-[#2DCE89]/50 transition-all"
                >
                  Sou Cidadão (Relatar) <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </div>

              {/* Estatísticas */}
              <div className="flex gap-8 mt-10 pt-10 border-t border-white/10 w-full">
                <div>
                  <h4 className="text-4xl font-black text-white">346</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Coletas Este Mês</p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-[#2DCE89]">94%</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Eficiência</p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-[#8be9fd]">4</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Caminhões Ativos</p>
                </div>
              </div>
            </div>

            {/* Direita - Efeito Glassmorphism de Painel */}
            <div className="hidden lg:block relative group">
              <div className="absolute inset-0 bg-[#8be9fd]/20 rounded-[32px] blur-2xl group-hover:bg-[#5e8cf7]/20 transition-all duration-500"></div>
              <Card className="bg-white/10 dark:bg-[#0B1437]/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[32px] p-8 relative shadow-2xl overflow-hidden z-10 transition-transform duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                  <h3 className="text-white font-black text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2DCE89] animate-pulse"></span> Sistema Ativo
                  </h3>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">Ao vivo</div>
                </div>
                
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex gap-4 items-center bg-white/5 dark:bg-[#111C44]/50 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="bg-[#2DCE89] p-3 rounded-[14px] flex-shrink-0">
                      <MapPin className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">Localização em Tempo Real</h4>
                      <p className="text-gray-400 text-xs font-medium">Monitoramento GPS via aplicativo</p>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="flex gap-4 items-center bg-white/5 dark:bg-[#111C44]/50 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="bg-[#5e8cf7] p-3 rounded-[14px] flex-shrink-0">
                      <Calendar className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">Agendamento Fácil</h4>
                      <p className="text-gray-400 text-xs font-medium">Interface cidadão simplificada</p>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="flex gap-4 items-center bg-white/5 dark:bg-[#111C44]/50 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="bg-[#8be9fd] p-3 rounded-[14px] flex-shrink-0">
                      <BarChart3 className="text-[#0B1437] h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm tracking-tight">Análise de Dados</h4>
                      <p className="text-gray-400 text-xs font-medium">Dashboard gerencial unificado</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 relative transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-white dark:bg-[#111C44] text-[#1A2B48] dark:text-[#8be9fd] border border-gray-200 dark:border-white/5 mb-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Fluxo Operacional</Badge>
            <h2 className="text-4xl font-black text-[#1A2B48] dark:text-white tracking-tight">Como Funciona o Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: 1, icon: Users, color: 'bg-[#5e8cf7]', title: 'Solicitação', desc: 'Cidadão relata entulho ou poda via App' },
              { num: 2, icon: BarChart3, color: 'bg-[#1A2B48] dark:bg-white/10', title: 'Análise', desc: 'Gestão categoriza e agenda no painel' },
              { num: 3, icon: Truck, color: 'bg-[#2DCE89]', title: 'Coleta', desc: 'Motorista faz a rota pelo Tablet' },
              { num: 4, icon: CheckCircle, color: 'bg-white dark:bg-[#111C44] text-[#1A2B48] dark:text-[#8be9fd] border border-gray-200 dark:border-white/5 shadow-sm', iconCol: 'text-[#1A2B48] dark:text-[#8be9fd]', title: 'Confirmação', desc: 'Ordem resolvida, cidadão é notificado' }
            ].map((step, idx) => (
              <div key={idx} className="relative group text-center flex flex-col items-center">
                {idx !== 3 && <div className="hidden lg:block absolute top-[2.5rem] left-[60%] w-full h-[2px] bg-gray-200 dark:bg-white/10 z-0"></div>}
                
                <div className={`relative z-10 w-20 h-20 ${step.color} rounded-[24px] flex items-center justify-center text-white mb-6 shadow-xl group-hover:-translate-y-2 transition-transform duration-300`}>
                  <step.icon className={`h-8 w-8 ${step.iconCol || 'text-white'}`} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-[#0B1437] text-[#1A2B48] dark:text-white font-black rounded-full shadow-md flex items-center justify-center text-[10px] border border-gray-100 dark:border-white/10">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1A2B48] dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-[200px] leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS */}
      <section id="beneficios" className="py-24 bg-white dark:bg-[#111C44] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-[#F8F9FE] dark:bg-white/5 text-[#1A2B48] dark:text-white border-none mb-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Vantagens</Badge>
            <h2 className="text-4xl font-black text-[#1A2B48] dark:text-white tracking-tight">Por Que Usar Nosso Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { i: Leaf, title: "Sustentabilidade", c: "bg-[#2DCE89]/10 text-[#2DCE89] dark:bg-[#2DCE89]/20" },
              { i: TrendingUp, title: "Eficiência", c: "bg-[#2DCE89]/10 text-[#2DCE89] dark:bg-[#2DCE89]/20" },
              { i: Shield, title: "Transparência", c: "bg-[#2DCE89]/10 text-[#2DCE89] dark:bg-[#2DCE89]/20" },
              { i: Calendar, title: "Praticidade", c: "bg-[#5e8cf7]/10 text-[#5e8cf7] dark:bg-[#5e8cf7]/20" },
              { i: MapPin, title: "Cobertura Total", c: "bg-[#5e8cf7]/10 text-[#5e8cf7] dark:bg-[#5e8cf7]/20" },
              { i: BarChart3, title: "Análise de Dados", c: "bg-[#8be9fd]/10 text-[#0B1437] dark:text-[#8be9fd] dark:bg-[#8be9fd]/20" }
            ].map((b, i) => (
              <Card key={i} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-[#F8F9FE] dark:bg-[#0B1437] rounded-[32px] overflow-hidden group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${b.c} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <b.i className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#1A2B48] dark:text-white mb-3 tracking-tight">{b.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Gestão otimizada em conformidade com as diretrizes governamentais, garantindo melhores resultados em campo.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NOTÍCIAS */}
      <section id="noticias" className="py-24 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-[#1A2B48] dark:text-white tracking-tight mb-4">Notícias e Comunicados</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Acompanhe as últimas publicações da prefeitura municipal relativas à pasta ambiental e inovações.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer bg-white dark:bg-[#111C44]">
              <div className="h-2 bg-gradient-to-r from-[#2DCE89] to-[#25B477] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] dark:bg-white/5 text-gray-500 dark:text-gray-400 border-none mb-4 text-[10px] font-black uppercase tracking-widest shadow-none">Sistema</Badge>
                <h3 className="text-2xl font-black leading-tight mb-3 text-[#1A2B48] dark:text-white group-hover:text-[#2DCE89] transition-colors tracking-tight">Nova Versão do App Motorista</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-sm">O aplicativo mobile foi atualizado com navegação turn-by-turn integrada e coleta de imagens offline.</p>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">15 de Março, 2026</span>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer bg-white dark:bg-[#111C44]">
              <div className="h-2 bg-gradient-to-r from-[#5e8cf7] to-[#4b7ce6] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] dark:bg-white/5 text-gray-500 dark:text-gray-400 border-none mb-4 text-[10px] font-black uppercase tracking-widest shadow-none">Expansão</Badge>
                <h3 className="text-2xl font-black leading-tight mb-3 text-[#1A2B48] dark:text-white group-hover:text-[#5e8cf7] transition-colors tracking-tight">Cobertura Ampliada</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-sm">Agora novas zonas suburbanas e parques municipais estão 100% cobertas pela frota inteligente.</p>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">8 de Março, 2026</span>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden group cursor-pointer bg-white dark:bg-[#111C44]">
              <div className="h-2 bg-gradient-to-r from-[#8be9fd] to-[#5e8cf7] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] dark:bg-white/5 text-gray-500 dark:text-gray-400 border-none mb-4 text-[10px] font-black uppercase tracking-widest shadow-none">Sustentabilidade</Badge>
                <h3 className="text-2xl font-black leading-tight mb-3 text-[#1A2B48] dark:text-white group-hover:text-[#8be9fd] transition-colors tracking-tight">Meta de 95% de Eficiência</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-sm">A prefeitura se compromete a solucionar solicitações urbanas em até 48 horas úteis através da plataforma.</p>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">1 de Março, 2026</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="py-24 bg-gradient-to-br from-[#1A2B48] to-[#111C44] relative overflow-hidden text-center m-4 rounded-[40px] shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8be9fd] opacity-10 blur-3xl rounded-full"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">Faça Parte da Mudança</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed font-medium">Controle total de descartes ou comunicação direta com a prefeitura. Nosso programa ambiental funciona através da tecnologia.</p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            size="lg" 
            className="bg-gradient-to-r from-[#2DCE89] to-[#25B477] text-white px-10 h-16 text-sm font-black tracking-widest uppercase rounded-[20px] shadow-xl shadow-[#2DCE89]/30 hover:shadow-[#2DCE89]/50 hover:scale-105 transition-all"
          >
            Acessar Sistema Agora
          </Button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-transparent text-gray-600 dark:text-gray-400 pt-20 pb-10 border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-gray-200 dark:border-white/10 pb-16">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <ZelaMapaFullLogo className="h-8 scale-90 origin-left" variant={isDarkMode ? 'light' : 'dark'} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                Plataforma oficial da Prefeitura de Pompeia para modernização do descarte responsável e limpeza urbana inteligente.
              </p>
            </div>

            <div>
              <h4 className="font-black mb-6 text-[#1A2B48] dark:text-white text-sm tracking-widest uppercase">Links Rápidos</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><a href="#como-funciona" className="hover:text-[#8be9fd] transition-colors">Como funciona o Relato</a></li>
                <li><a href="#beneficios" className="hover:text-[#8be9fd] transition-colors">Vantagens GovTech</a></li>
                <li><a href="#" className="hover:text-[#8be9fd] transition-colors">Portal da Transparência</a></li>
                <li><a href="#" className="hover:text-[#8be9fd] transition-colors">Termos de Privacidade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black mb-6 text-[#1A2B48] dark:text-white text-sm tracking-widest uppercase">Contato</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#5e8cf7]" /> suporte@pompeia.sp.gov.br</li>
                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-[#5e8cf7] mt-1" /> <span>Rua Administrativa Municipal, Centro - Pompeia</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black mb-6 text-[#1A2B48] dark:text-white text-sm tracking-widest uppercase">Horário Central</h4>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li>Segunda - Sexta</li>
                <li className="text-[#1A2B48] dark:text-white font-bold">08:00 às 17:00</li>
                <li className="mt-4"><Badge className="bg-[#2DCE89]/10 text-[#2DCE89] border-none font-black tracking-widest uppercase text-[10px] shadow-none">Sistema Online 24/7</Badge></li>
              </ul>
            </div>

          </div>
          
          <div className="text-center text-[11px] font-black uppercase tracking-widest text-gray-400 flex flex-col items-center justify-center">
            <p>© 2026 Prefeitura Municipal de Pompeia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* 8. MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0B1437]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLoginModal(false)}
          ></div>
          
          <Card className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200 border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-[#111C44]">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <CardHeader className="pt-10 pb-6 text-center">
              <div className="mx-auto bg-[#F8F9FE] dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-[#1A2B48] dark:text-[#8be9fd]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#1A2B48] dark:text-white tracking-tight">Acesso Interno</CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {/* Switch Gestor/Motorista */}
                <div className="flex bg-[#F8F9FE] dark:bg-white/5 p-1.5 rounded-[16px]">
                  <button
                    type="button"
                    onClick={() => setLoginType('gerente')}
                    className={`flex-1 py-3 text-[11px] font-black tracking-widest uppercase rounded-[12px] transition-all ${loginType === 'gerente' ? 'bg-white dark:bg-[#0B1437] text-[#1A2B48] dark:text-[#8be9fd] shadow-sm' : 'text-gray-500 hover:text-[#1A2B48] dark:hover:text-white'}`}
                  >
                    Gestor / Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('motorista')}
                    className={`flex-1 py-3 text-[11px] font-black tracking-widest uppercase rounded-[12px] transition-all ${loginType === 'motorista' ? 'bg-white dark:bg-[#0B1437] text-[#1A2B48] dark:text-[#8be9fd] shadow-sm' : 'text-gray-500 hover:text-[#1A2B48] dark:hover:text-white'}`}
                  >
                    Motorista App
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="Email institucional"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-white dark:bg-[#0B1437] rounded-[16px] border border-gray-200 dark:border-white/10 text-[#1A2B48] dark:text-white placeholder:text-gray-400 font-medium focus-visible:ring-[#8be9fd] focus-visible:border-[#8be9fd] transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="password" 
                      placeholder="Senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="pl-12 h-14 bg-white dark:bg-[#0B1437] rounded-[16px] border border-gray-200 dark:border-white/10 text-[#1A2B48] dark:text-white placeholder:text-gray-400 font-medium focus-visible:ring-[#8be9fd] focus-visible:border-[#8be9fd] transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-between items-center px-1">
                  <a href="#" className="text-[11px] font-black tracking-widest uppercase text-[#5e8cf7] hover:text-[#4b7ce6] dark:hover:text-[#8be9fd] transition-colors">
                    Esqueceu sua senha?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#2DCE89] to-[#25B477] text-white h-14 rounded-[16px] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#2DCE89]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    'Confirmar Acesso'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
