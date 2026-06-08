import { useState, useEffect } from 'react'
import { MapPin, LogOut, Save, Lock, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'
import { getAuthHeaders } from '../../api/authService'

interface ProfileScreenProps {
  onLogout: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.nome || '')
  const [placa, setPlaca] = useState('') 
  const [saving, setSaving] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/motorista/me`, {
          headers: getAuthHeaders()
        })
        if (res.ok) {
          const data = await res.json()
          setPlaca(data.placa_caminhao)
        }
      } catch (err) {
        console.error("Erro ao carregar dados do motorista:", err)
      }
    }
    if (user?.papel === 'MOTORISTA') fetchDriverData()
  }, [user])

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-transparent" };
    let score = 0;
    if (pwd.length > 6) score++;
    if (pwd.length > 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Fraca", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Média", color: "bg-yellow-500" };
    return { score, label: "Forte", color: "bg-[#2DCE89]" };
  };

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Perfil atualizado localmente")
    }, 800)
  }

  const handleUpdatePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return toast.error("Preencha todos os campos de senha");
    }
    if (novaSenha !== confirmarSenha) {
      return toast.error("As novas senhas não coincidem", {
        description: "Verifique a digitação da confirmação.",
        icon: <AlertCircle className="text-red-500" />
      });
    }
    if (novaSenha.length < 6) {
      return toast.error("Senha muito curta", {
        description: "A nova senha deve ter pelo menos 6 caracteres."
      });
    }

    setChangingPassword(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          senha_atual: senhaAtual,
          nova_senha: novaSenha
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Senha redefinida com sucesso!", {
          description: "Sua nova credencial já está ativa no sistema.",
          icon: <ShieldCheck className="text-[#2DCE89]" />
        });
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmarSenha('')
        setShowPasswordSection(false)
      } else {
        // Erro específico: Senha atual incorreta
        if (data.detail === "Senha atual incorreta") {
          toast.error("Erro de Autenticação", {
            description: "A senha atual informada está incorreta. Tente novamente.",
            icon: <AlertCircle className="text-red-500" />
          });
        } else {
          toast.error(data.detail || "Erro ao alterar senha")
        }
      }
    } catch (err) {
      toast.error("Servidor indisponível", {
        description: "Não foi possível conectar ao serviço de segurança."
      })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 pb-32">
      <div>
        <h2 className="text-2xl font-black text-[#1A2B48] tracking-tight">Seu Perfil</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Credenciais e Equipamento</p>
      </div>

      {/* CARD DE INFORMAÇÕES BÁSICAS */}
      <div className="bg-white rounded-[40px] p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#8be9fd] to-[#5e8cf7] flex items-center justify-center text-[#0B1437] text-3xl font-black shadow-lg shadow-[#8be9fd]/20">
            {user?.nome?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xl font-black text-[#1A2B48]">{user?.nome}</p>
            <p className="text-xs font-bold text-gray-400">{user?.email}</p>
            <Badge className="mt-2 bg-[#2DCE89]/10 text-[#2DCE89] border-none font-black px-3 py-1 rounded-full text-[10px]">
              OPERADOR ELITE
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-[#F4F7FE] border-none rounded-2xl px-6 text-[#1A2B48] font-bold text-lg focus:ring-2 focus:ring-[#8be9fd] outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Veículo Vinculado (Apenas Leitura)</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                readOnly
                value={placa}
                placeholder="AGUARDANDO VÍNCULO..."
                className="w-full h-14 bg-gray-50 border-none rounded-2xl pl-14 pr-6 text-gray-400 font-black text-lg cursor-not-allowed opacity-70"
              />
            </div>
            <p className="text-[9px] font-bold text-blue-400 ml-2 uppercase">* Alteração de veículo permitida apenas pela gestão.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 bg-[#2DCE89] hover:bg-[#25b377] text-white font-black rounded-2xl shadow-lg shadow-[#2DCE89]/20 transition-all active:scale-[0.98]"
          >
            {saving ? 'SINCRONIZANDO...' : (
              <>
                <Save className="w-5 h-5 mr-3" />
                SALVAR ALTERAÇÕES
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SEÇÃO DE SEGURANÇA (TROCA DE SENHA) */}
      <div className="bg-white rounded-[40px] p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button 
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-[#1A2B48]">Segurança da Conta</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alterar sua senha institucional</p>
            </div>
          </div>
          <div className={`transition-transform duration-300 ${showPasswordSection ? 'rotate-180' : ''}`}>
             <ShieldCheck size={20} className="text-gray-300" />
          </div>
        </button>

        {showPasswordSection && (
          <div className="space-y-6 pt-4 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Senha Atual</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full h-12 bg-[#F4F7FE] border-none rounded-xl pl-12 pr-6 text-[#1A2B48] font-bold text-sm focus:ring-2 focus:ring-[#8be9fd] outline-none"
                  placeholder="Digite sua senha atual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nova Senha</label>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full h-12 bg-[#F4F7FE] border-none rounded-xl pl-12 pr-6 text-[#1A2B48] font-bold text-sm focus:ring-2 focus:ring-[#8be9fd] outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              {novaSenha && (
                <div className="px-1 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Força da Senha</p>
                    <p className={`text-[9px] font-black uppercase ${getPasswordStrength(novaSenha).color.replace('bg-', 'text-')}`}>
                      {getPasswordStrength(novaSenha).label}
                    </p>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getPasswordStrength(novaSenha).color}`}
                      style={{ width: `${(getPasswordStrength(novaSenha).score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full h-12 bg-[#F4F7FE] border-none rounded-xl px-6 text-[#1A2B48] font-bold text-sm focus:ring-2 focus:ring-[#8be9fd] outline-none"
                placeholder="Repita a nova senha"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              disabled={changingPassword}
              className="w-full h-12 bg-[#1A2B48] hover:bg-[#2a3f5f] text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {changingPassword ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'ATUALIZAR SENHA'}
            </Button>
          </div>
        )}
      </div>

      {/* BOTÃO DE LOGOUT REFINADO */}
      <div className="px-4">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full h-14 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-3 border-2 border-dashed border-red-100"
        >
          <LogOut className="w-5 h-5" />
          ENCERRAR TURNO OPERACIONAL
        </Button>
      </div>
    </div>
  )
}
