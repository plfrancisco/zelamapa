import React, { useState, useRef } from 'react';
import { ZelaMapaFullLogo } from '../components/ZelaMapaLogos';

interface UserRequestAppProps {
  onLogout?: () => void;
}

export default function UserRequestApp({ onLogout }: UserRequestAppProps) {
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  
  const [tipoLixo, setTipoLixo] = useState('1'); // 1=Entulho, 2=Móveis, 3=Poda
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  
  const [statusMsg, setStatusMsg] = useState('');
  const [cepError, setCepError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCpf = (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  };

  const formatTelefone = (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  };

  const formatCep = (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
    return v;
  };

  const buscarCep = async (cepBuscado: string) => {
    const rawCep = cepBuscado.replace(/\D/g, '');
    if (rawCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }
      if (data.localidade !== 'Pompeia' && data.localidade !== 'Pompéia') {
        setCepError('Atenção: Serviço restrito à cidade de Pompeia/SP.');
        setLogradouro('');
        setBairro('');
        return;
      }
      setCepError('');
      setLogradouro(data.logradouro);
      setBairro(data.bairro);
    } catch {
      setCepError('Erro de conexão ao buscar CEP');
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const validarCpf = async (cpfValidar: string) => {
    const rawCpf = cpfValidar.replace(/\D/g, '');
    if (rawCpf.length !== 11) return;
    try {
      const res = await fetch(`${API_BASE}/api/ocorrencias/validar-cpf/${rawCpf}`);
      const data = await res.json();
      if (!data.valid) {
        setCpfError('CPF Inválido. Verifique o número.');
      } else {
        setCpfError('');
      }
    } catch {
      // Falha silenciosa de API será tratada no submit final
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cepError || cpfError) {
      setStatusMsg("Corrija os erros do formulário antes de enviar.");
      return;
    }
    if (!logradouro || !numero) {
      setStatusMsg("O endereço e o número são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setStatusMsg("Enviando solicitação...");

    const enderecoCompleto = `${logradouro}, Bairro ${bairro}`;

    const formData = new FormData();
    formData.append("cpf", cpf.replace(/\D/g, ''));
    formData.append("telefone", telefone);
    formData.append("cep", cep.replace(/\D/g, ''));
    formData.append("endereco", enderecoCompleto);
    formData.append("numero", numero);
    formData.append("tipo_id", tipoLixo);
    formData.append("descricao", descricao);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      const response = await fetch(`${API_BASE}/api/ocorrencias/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 4000);
      } else {
        setStatusMsg("❌ Erro ao enviar solicitação.");
      }
    } catch {
      setStatusMsg("❌ Erro de conexão com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#0B1437] z-100 flex flex-col items-center justify-center animate-in fade-in duration-500 font-sans">
        <div className="w-40 h-40 bg-[#8be9fd]/10 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-in zoom-in duration-500 delay-150">
          <svg className="w-20 h-20 text-[#8be9fd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-4xl font-black mb-4 text-center tracking-tight text-[#1A2B48] dark:text-white">Solicitação Enviada!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-[320px] text-center mb-12">
          Sua coleta foi registrada e uma equipe será acionada para o seu endereço em breve.
        </p>
        <div className="w-10 h-10 border-4 border-[#8be9fd]/30 border-t-[#8be9fd] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F4F7FE] dark:bg-[#0B1437] transition-colors duration-500 overflow-hidden font-sans">
      
      {/* TOP BAR REFINADA */}
      <header className="h-24 bg-white/70 dark:bg-[#111C44]/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-10 z-10 transition-all shrink-0">
        <div className="flex items-center gap-6">
          <ZelaMapaFullLogo variant={document.documentElement.classList.contains('dark') ? "light" : "dark"} className="scale-90 origin-left" />
          <div className="hidden sm:block border-l border-gray-200 dark:border-white/10 h-10 pl-6 ml-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1">Acesso Público</p>
            <h2 className="text-xl font-black text-[#1A2B48] dark:text-white tracking-tight">Portal do Cidadão</h2>
          </div>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[14px] text-[10px] font-black tracking-widest uppercase bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white transition-all shadow-sm border border-transparent hover:border-red-500/20"
          >
            Sair do Portal
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
        <div className="max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
          
          <div className="bg-white dark:bg-[#111C44] rounded-[32px] shadow-xl border-none overflow-hidden transition-all">
            <div className="p-8 md:p-12">
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-[#1A2B48] dark:text-white tracking-tight mb-3">Nova Solicitação de Coleta</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Informe seus dados e o endereço do material que precisa ser recolhido.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Dados do Cidadão */}
                <div className="bg-[#F8F9FE] dark:bg-white/5 p-6 md:p-8 rounded-[24px]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#8be9fd] text-[#0B1437] flex items-center justify-center font-black text-sm">1</div>
                    <h2 className="text-xl font-black text-[#1A2B48] dark:text-white tracking-tight">Dados do Cidadão</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">CPF (Obrigatório)</label>
                      <input 
                        type="text" required maxLength={14}
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        onBlur={(e) => validarCpf(e.target.value)}
                        className={`w-full h-12 px-4 rounded-xl font-medium focus:ring-2 focus:ring-[#8be9fd] focus:border-[#8be9fd] bg-white dark:bg-[#0B1437] dark:text-white outline-none transition-all ${cpfError ? 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10' : 'border border-gray-200 dark:border-white/10'}`}
                        placeholder="000.000.000-00"
                      />
                      {cpfError && <p className="text-[11px] font-bold text-red-500 mt-2">{cpfError}</p>}
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Telefone (Obrigatório)</label>
                      <input 
                        type="text" required maxLength={15}
                        value={telefone}
                        onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                        className="w-full h-12 px-4 border border-gray-200 dark:border-white/10 rounded-xl font-medium focus:ring-2 focus:ring-[#8be9fd] focus:border-[#8be9fd] bg-white dark:bg-[#0B1437] dark:text-white outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Endereço */}
                <div className="bg-[#F8F9FE] dark:bg-white/5 p-6 md:p-8 rounded-[24px]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#5e8cf7] text-white flex items-center justify-center font-black text-sm">2</div>
                    <h2 className="text-xl font-black text-[#1A2B48] dark:text-white tracking-tight">Endereço da Ocorrência</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="w-full md:w-1/2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">CEP</label>
                      <input 
                        type="text" required maxLength={9}
                        value={cep}
                        onChange={(e) => setCep(formatCep(e.target.value))}
                        onBlur={(e) => buscarCep(e.target.value)}
                        className={`w-full h-12 px-4 rounded-xl font-medium focus:ring-2 focus:ring-[#5e8cf7] focus:border-[#5e8cf7] bg-white dark:bg-[#0B1437] dark:text-white outline-none transition-all ${cepError ? 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10' : 'border border-gray-200 dark:border-white/10'}`}
                        placeholder="17580-000"
                      />
                      {cepError && <p className="text-[11px] font-bold text-red-500 mt-2">{cepError}</p>}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Rua / Logradouro</label>
                        <input type="text" readOnly value={logradouro} className="w-full h-12 px-4 border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 rounded-xl font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed" placeholder="Preenchimento automático" />
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Número</label>
                        <input type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full h-12 px-4 border border-gray-200 dark:border-white/10 rounded-xl font-medium focus:ring-2 focus:ring-[#5e8cf7] focus:border-[#5e8cf7] bg-white dark:bg-[#0B1437] dark:text-white outline-none transition-all" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Detalhes */}
                <div className="bg-[#F8F9FE] dark:bg-white/5 p-6 md:p-8 rounded-[24px]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#2DCE89] text-white flex items-center justify-center font-black text-sm">3</div>
                    <h2 className="text-xl font-black text-[#1A2B48] dark:text-white tracking-tight">Detalhes do Resíduo</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tipo de Material</label>
                      <div className="relative">
                        <select 
                          value={tipoLixo}
                          onChange={(e) => setTipoLixo(e.target.value)}
                          className="w-full h-12 px-4 border border-gray-200 dark:border-white/10 rounded-xl font-medium focus:ring-2 focus:ring-[#2DCE89] focus:border-[#2DCE89] bg-white dark:bg-[#0B1437] dark:text-white outline-none appearance-none transition-all"
                        >
                          <option value="1">Entulho (Restos de Obra)</option>
                          <option value="2">Móveis (Sofás, Colchões)</option>
                          <option value="3">Poda (Galhos, Árvores)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Foto do Local (Obrigatório)</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-6 text-center bg-white dark:bg-black/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                        <input 
                          type="file" accept="image/*" capture="environment" ref={fileInputRef} required
                          onChange={(e) => setFoto(e.target.files?.[0] || null)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:tracking-widest file:uppercase file:bg-[#2DCE89]/10 file:text-[#2DCE89] hover:file:bg-[#2DCE89]/20 cursor-pointer transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">Observações (Opcional)</label>
                      <textarea 
                        value={descricao} onChange={(e) => setDescricao(e.target.value)}
                        className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl font-medium focus:ring-2 focus:ring-[#2DCE89] focus:border-[#2DCE89] bg-white dark:bg-[#0B1437] dark:text-white outline-none resize-none transition-all"
                        placeholder="Ex: Material localizado em frente ao terreno baldio..." rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {statusMsg && (
                  <div className={`p-4 rounded-xl text-center text-sm font-bold ${statusMsg.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {statusMsg}
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isSubmitting || !!cepError || !!cpfError}
                    className="w-full h-14 bg-gradient-to-r from-[#2DCE89] to-[#25B477] text-white text-sm font-black tracking-widest uppercase rounded-[16px] shadow-lg shadow-[#2DCE89]/30 hover:shadow-[#2DCE89]/50 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : 'Confirmar Solicitação'}
                  </button>
                </div>
                
              </form>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
