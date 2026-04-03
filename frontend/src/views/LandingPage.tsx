import React, { useState, useEffect } from 'react';
import { 
  Recycle, MapPin, Calendar, Users, TrendingUp, CheckCircle, 
  ArrowRight, X, Mail, Lock, Leaf, Truck, BarChart3, Shield 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface LandingPageProps {
  onLogin: (role: 'motorista' | 'gerente' | 'cidadao') => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState<'gerente' | 'motorista'>('gerente');

  // Sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginType);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#1A2B48] font-sans selection:bg-[#2DCE89] selection:text-white">
      
      {/* 1. HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#1A2B48]/95 backdrop-blur-md shadow-lg py-3' : 'bg-[#1A2B48] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#2DCE89] p-2 rounded-xl">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight leading-tight">Pompeia Coletas</h1>
              <span className="text-xs text-[#5e8cf7] font-medium hidden sm:block">Sistema Municipal de Gestão de Resíduos</span>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-200">
            <a href="#como-funciona" className="hover:text-[#2DCE89] transition-colors">Como Funciona</a>
            <a href="#beneficios" className="hover:text-[#2DCE89] transition-colors">Benefícios</a>
            <a href="#noticias" className="hover:text-[#2DCE89] transition-colors">Notícias</a>
          </nav>

          <Button 
            onClick={() => setShowLoginModal(true)}
            className="bg-[#2DCE89] hover:bg-[#25B477] text-white font-semibold rounded-lg px-6 transition-all hover:scale-105 shadow-md shadow-[#2DCE89]/20"
          >
            Acessar Sistema
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-[#1A2B48] to-[#2a3f5f] overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#5e8cf7] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#2DCE89] opacity-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Esquerda */}
            <div className="flex flex-col items-start gap-6 text-white">
              <Badge className="bg-[#2DCE89]/20 text-[#2DCE89] hover:bg-[#2DCE89]/20 border-none px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                🌱 Cidade Sustentável
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Gestão Inteligente de <span className="text-[#2DCE89] inline-block -rotate-1 origin-left">Resíduos</span> para Pompeia
              </h1>
              <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                Sistema avançado de agendamento e otimização de rotas para coletas de entulho, móveis e poda. Mantendo nossa cidade limpa com dados em tempo real.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4 w-full">
                <Button 
                  onClick={() => { setLoginType('gerente'); setShowLoginModal(true); }}
                  className="bg-[#5e8cf7] hover:bg-[#4b7ce6] h-12 px-6 rounded-xl font-semibold shadow-lg shadow-[#5e8cf7]/20 hover:scale-105 transition-transform"
                >
                  <BarChart3 className="mr-2 h-5 w-5" /> Acessar Dashboard
                </Button>
                <Button 
                  onClick={() => { setLoginType('motorista'); setShowLoginModal(true); }}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 h-12 px-6 rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                  <Truck className="mr-2 h-5 w-5" /> App Motorista
                </Button>
                {/* Acesso direto ao App do Cidadão para teste rápido */}
                <Button
                  onClick={() => onLogin('cidadao')}
                  className="bg-[#2DCE89] hover:bg-[#25B477] text-white h-12 px-6 rounded-xl font-semibold hover:scale-105 shadow-md transition-transform"
                >
                  Sou Cidadão (Relatar) <ArrowRight className="ml-2 h-5 w-5"/>
                </Button>
              </div>

              {/* Estatísticas */}
              <div className="flex gap-8 mt-10 pt-10 border-t border-white/10 w-full">
                <div>
                  <h4 className="text-3xl font-bold text-white">346</h4>
                  <p className="text-sm text-gray-400 font-medium">Coletas Este Mês</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-[#2DCE89]">94%</h4>
                  <p className="text-sm text-gray-400 font-medium">Eficiência</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-[#5e8cf7]">4</h4>
                  <p className="text-sm text-gray-400 font-medium">Caminhões Ativos</p>
                </div>
              </div>
            </div>

            {/* Direita - Efeito Glassmorphism de Painel */}
            <div className="hidden lg:block relative group">
              <div className="absolute inset-0 bg-[#2DCE89]/20 rounded-2xl blur-xl group-hover:bg-[#5e8cf7]/20 transition-all duration-500"></div>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 relative shadow-2xl overflow-hidden z-10 transition-transform duration-500 hover:-translate-y-2">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2DCE89] animate-pulse"></span> Sistema Ativo
                  </h3>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">Ao vivo</div>
                </div>
                
                <div className="space-y-6">
                  {/* Item 1 */}
                  <div className="flex gap-4 items-center bg-[#1A2B48]/50 p-4 rounded-xl border border-white/5 hover:bg-[#1A2B48] transition-colors">
                    <div className="bg-[#2DCE89] p-3 rounded-xl flex-shrink-0">
                      <MapPin className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Localização em Tempo Real</h4>
                      <p className="text-gray-300 text-sm">Monitoramento GPS via aplicativo</p>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="flex gap-4 items-center bg-[#1A2B48]/50 p-4 rounded-xl border border-white/5 hover:bg-[#1A2B48] transition-colors">
                    <div className="bg-[#5e8cf7] p-3 rounded-xl flex-shrink-0">
                      <Calendar className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Agendamento Fácil</h4>
                      <p className="text-gray-300 text-sm">Interface cidadão simplificada</p>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="flex gap-4 items-center bg-[#1A2B48]/50 p-4 rounded-xl border border-white/5 hover:bg-[#1A2B48] transition-colors">
                    <div className="bg-white/10 p-3 rounded-xl flex-shrink-0">
                      <BarChart3 className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Análise de Dados</h4>
                      <p className="text-gray-300 text-sm">Dashboard gerencial unificado</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-[#F8F9FE] text-[#1A2B48] hover:bg-gray-100 border border-gray-200 mb-4 px-4 py-1.5 rounded-full font-semibold">Fluxo Operacional</Badge>
            <h2 className="text-4xl font-extrabold text-[#1A2B48] tracking-tight">Como Funciona o Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: 1, icon: Users, color: 'bg-[#5e8cf7]', title: 'Solicitação', desc: 'Cidadão relata entulho ou poda via App' },
              { num: 2, icon: BarChart3, color: 'bg-[#1A2B48]', title: 'Análise', desc: 'Gestão categoriza e agenda no painel' },
              { num: 3, icon: Truck, color: 'bg-[#2DCE89]', title: 'Coleta', desc: 'Motorista faz a rota pelo Tablet' },
              { num: 4, icon: CheckCircle, color: 'bg-[#F8F9FE] text-[#1A2B48] border', iconCol: 'text-[#1A2B48]', title: 'Confirmação', desc: 'Ordem resolvida, cidadão é notificado' }
            ].map((step, idx) => (
              <div key={idx} className="relative group text-center flex flex-col items-center">
                {idx !== 3 && <div className="hidden lg:block absolute top-[2.5rem] left-[60%] w-full h-[2px] bg-gray-100 z-0"></div>}
                
                <div className={`relative z-10 w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:-translate-y-2 transition-transform duration-300`}>
                  <step.icon className={`h-8 w-8 ${step.iconCol || 'text-white'}`} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-[#1A2B48] font-bold rounded-full shadow-md flex items-center justify-center text-sm border border-gray-100">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1A2B48] mb-2">{step.title}</h3>
                <p className="text-gray-500 font-medium max-w-[200px] leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS */}
      <section id="beneficios" className="py-24 bg-[#F8F9FE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-white text-[#1A2B48] hover:bg-gray-100 border border-gray-200 mb-4 px-4 py-1.5 rounded-full font-semibold shadow-sm">Vantagens</Badge>
            <h2 className="text-4xl font-extrabold text-[#1A2B48] tracking-tight">Por Que Usar Nosso Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { i: Leaf, title: "Sustentabilidade", c: "bg-[#2DCE89]/10 text-[#2DCE89]" },
              { i: TrendingUp, title: "Eficiência", c: "bg-[#2DCE89]/10 text-[#2DCE89]" },
              { i: Shield, title: "Transparência", c: "bg-[#2DCE89]/10 text-[#2DCE89]" },
              { i: Calendar, title: "Praticidade", c: "bg-[#5e8cf7]/10 text-[#5e8cf7]" },
              { i: MapPin, title: "Cobertura Total", c: "bg-[#5e8cf7]/10 text-[#5e8cf7]" },
              { i: BarChart3, title: "Análise de Dados", c: "bg-[#5e8cf7]/10 text-[#5e8cf7]" }
            ].map((b, i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl overflow-hidden group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${b.c} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <b.i className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A2B48] mb-3">{b.title}</h3>
                  <p className="text-gray-500 font-medium">Gestão otimizada em conformidade com as diretrizes governamentais, garantindo melhores resultados em campo.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NOTÍCIAS */}
      <section id="noticias" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-[#1A2B48] tracking-tight mb-4">Notícias e Comunicados</h2>
            <p className="text-lg text-gray-500">Acompanhe as últimas publicações da prefeitura municipal relativas à pasta ambiental e inovações.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="rounded-2xl border-gray-100 hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer border-t-0 p-0">
              <div className="h-3 bg-gradient-to-r from-[#2DCE89] to-[#25B477] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] text-gray-500 border-none mb-4 hover:bg-gray-100 shadow-none">Sistema</Badge>
                <h3 className="text-2xl font-bold leading-tight mb-3 text-[#1A2B48] group-hover:text-[#2DCE89] transition-colors">Nova Versão do App Motorista</h3>
                <p className="text-gray-500 font-medium mb-6">O aplicativo mobile foi atualizado com navegação turn-by-turn integrada e coleta de imagens offline.</p>
                <span className="text-sm font-bold text-gray-400">15 de Março, 2026</span>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="rounded-2xl border-gray-100 hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer border-t-0 p-0">
              <div className="h-3 bg-gradient-to-r from-[#5e8cf7] to-[#4b7ce6] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] text-gray-500 border-none mb-4 hover:bg-gray-100 shadow-none">Expansão</Badge>
                <h3 className="text-2xl font-bold leading-tight mb-3 text-[#1A2B48] group-hover:text-[#5e8cf7] transition-colors">Cobertura Ampliada</h3>
                <p className="text-gray-500 font-medium mb-6">Agora novas zonas suburbanas e parques municipais estão 100% cobertas pela frota inteligente.</p>
                <span className="text-sm font-bold text-gray-400">8 de Março, 2026</span>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="rounded-2xl border-gray-100 hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer border-t-0 p-0">
              <div className="h-3 bg-gradient-to-r from-[#1A2B48] to-[#122038] w-full"></div>
              <CardContent className="p-8">
                <Badge className="bg-[#F8F9FE] text-gray-500 border-none mb-4 hover:bg-gray-100 shadow-none">Sustentabilidade</Badge>
                <h3 className="text-2xl font-bold leading-tight mb-3 text-[#1A2B48]">Meta de 95% de Eficiência</h3>
                <p className="text-gray-500 font-medium mb-6">A prefeitura se compromete a solucionar solicitações urbanas em até 48 horas úteis através da plataforma.</p>
                <span className="text-sm font-bold text-gray-400">1 de Março, 2026</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="py-24 bg-gradient-to-br from-[#1A2B48] to-[#2a3f5f] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">Faça Parte da Mudança</h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed font-medium">Controle total de descartes ou comunicação direta com a prefeitura. Nosso programa ambiental funciona através da tecnologia.</p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            size="lg" 
            className="bg-[#2DCE89] hover:bg-[#25B477] text-white px-10 py-7 text-lg font-bold rounded-xl shadow-xl shadow-[#2DCE89]/20 hover:-translate-y-1 transition-all"
          >
            Acessar Sistema Agora
          </Button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#121c2e] text-white pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-16">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#2DCE89] p-2 rounded-lg">
                  <Recycle className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold">Pompeia Coletas</h1>
              </div>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Plataforma oficial da Prefeitura de Pompeia para modernização do descarte responsável e limpeza urbana inteligente.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Links Rápidos</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li><a href="#como-funciona" className="hover:text-[#2DCE89] transition-colors">Como funciona o Relato</a></li>
                <li><a href="#beneficios" className="hover:text-[#2DCE89] transition-colors">Vantagens GovTech</a></li>
                <li><a href="#" className="hover:text-[#2DCE89] transition-colors">Portal da Transparência</a></li>
                <li><a href="#" className="hover:text-[#2DCE89] transition-colors">Termos de Privacidade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Contato</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#5e8cf7]" /> suporte@pompeia.sp.gov.br</li>
                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-[#5e8cf7] mt-1" /> <span>Rua Administrativa Municipal, Centro - Pompeia</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-base">Horário Central</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li>Segunda - Sexta</li>
                <li className="text-white">08:00 às 17:00</li>
                <li className="mt-4"><Badge className="bg-[#2DCE89]/20 text-[#2DCE89] border-none font-semibold hover:bg-[#2DCE89]/20 shadow-none">Sistema Online 24/7</Badge></li>
              </ul>
            </div>

          </div>
          
          <div className="text-center text-sm font-medium text-gray-500 flex flex-col items-center justify-center">
            <p>© 2026 Prefeitura Municipal de Pompeia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* 8. MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay borrada */}
          <div 
            className="absolute inset-0 bg-[#1A2B48]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLoginModal(false)}
          ></div>
          
          {/* Content */}
          <Card className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <CardHeader className="pt-10 pb-6 text-center">
              <div className="mx-auto bg-[#1A2B48]/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-[#1A2B48]" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#1A2B48]">Acesso Interno</CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {/* Switch Gestor/Motorista */}
                <div className="flex bg-[#F8F9FE] p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLoginType('gerente')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginType === 'gerente' ? 'bg-white text-[#1A2B48] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Gestor / Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginType('motorista')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${loginType === 'motorista' ? 'bg-white text-[#1A2B48] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Motorista App
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="email" 
                      placeholder="Identificação do Funcionário" 
                      className="pl-10 h-12 bg-white rounded-xl border-gray-200 text-[#1A2B48] placeholder:text-gray-400 font-medium focus-visible:ring-[#2DCE89]"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="password" 
                      placeholder="Senha do Sistema" 
                      className="pl-10 h-12 bg-white rounded-xl border-gray-200 text-[#1A2B48] placeholder:text-gray-400 font-medium focus-visible:ring-[#2DCE89]"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center px-1">
                  <a href="#" className="text-sm font-bold text-[#5e8cf7] hover:text-[#4b7ce6] transition-colors">
                    Esqueceu sua senha?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#2DCE89] hover:bg-[#25B477] text-white h-12 rounded-xl font-bold shadow-md shadow-[#2DCE89]/20"
                >
                  Confirmar Acesso Externo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
