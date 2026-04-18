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

  const validarCpf = async (cpfValidar: string) => {
    const rawCpf = cpfValidar.replace(/\D/g, '');
    if (rawCpf.length !== 11) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ocorrencias/validar-cpf/${rawCpf}`);
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
      const response = await fetch("http://localhost:8000/api/ocorrencias/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 3000);
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
      <div className="fixed inset-0 bg-[#2DCE89] z-100 flex flex-col items-center justify-center text-white animate-in slide-in-from-bottom-[100%] duration-500">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
          <svg className="w-16 h-16 text-[#2DCE89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-4xl font-extrabold mb-4 text-center tracking-tight">Solicitação Enviada!</h2>
        <p className="text-emerald-50 text-xl font-medium max-w-[280px] text-center mb-12">
          Sua coleta foi registrada e uma equipe já foi acionada para o seu endereço.
        </p>
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-[#2DCE89] text-white p-4 pb-2 shadow-md z-10 w-full relative flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <ZelaMapaFullLogo variant="light" className="scale-75 origin-left h-8" />
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded text-white -ml-2 mb-1">CIDADÃO</span>
          </div>
          <p className="text-xs text-white/90 mt-1">Solicite coleta com seu endereço e CPF</p>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            Sair
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center p-4 py-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-5">
          
          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800">1. Dados do Cidadão</h2>
            <div className="space-y-4 mt-3">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">CPF (Obrigatório)</label>
                <input 
                  type="text" required maxLength={14}
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  onBlur={(e) => validarCpf(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${cpfError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="000.000.000-00"
                />
                {cpfError && <p className="text-xs text-red-600 mt-1">{cpfError}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Telefone (Obrigatório)</label>
                <input 
                  type="text" required maxLength={15}
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-800">2. Endereço da Ocorrência</h2>
            <div className="space-y-4 mt-3">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">CEP</label>
                <input 
                  type="text" required maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  onBlur={(e) => buscarCep(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white ${cepError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="17580-000"
                />
                {cepError && <p className="text-xs text-red-600 mt-1 font-medium">{cepError}</p>}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Rua</label>
                  <input type="text" readOnly value={logradouro} className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700" placeholder="Preenchimento automático" />
                </div>
                <div className="w-24">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Número</label>
                  <input type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:green-500 bg-white" placeholder="123" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800">3. Tipo de Resíduo</h2>
            <select 
              value={tipoLixo}
              onChange={(e) => setTipoLixo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium"
            >
              <option value="1">Entulho (Restos de Obra)</option>
              <option value="2">Móveis (Sofás, Colchões)</option>
              <option value="3">Poda (Galhos, Árvores)</option>
            </select>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800 mt-2">4. Foto do Local</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
              <input 
                type="file" accept="image/*" capture="environment" ref={fileInputRef} required
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 block">Observações (Opcional)</label>
            <textarea 
              value={descricao} onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Ex: Em frente ao terreno baldio..." rows={2}
            ></textarea>
          </div>

          <button 
            type="submit" disabled={isSubmitting || !!cepError || !!cpfError}
            className="w-full bg-[#2DCE89] hover:bg-[#25B477] text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-[#2DCE89]/30 transition transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Enviando ao servidor...' : 'Solicitar Coleta Agora'}
          </button>

          {statusMsg && (
            <div className={`p-4 rounded-lg text-center text-sm font-bold ${statusMsg.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}`}>
              {statusMsg}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
