import { useState } from 'react'
import { MapPin, LogOut, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuthStore } from '../../stores/authStore'

interface ProfileScreenProps {
  onLogout: () => void
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { user, logout } = useAuthStore()
  const [name, setName] = useState(user?.nome || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // TODO: API call to update profile
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-xl font-bold text-white mb-6">Perfil</h2>

      <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-700">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#2DCE89] flex items-center justify-center text-white text-2xl font-bold">
            {user?.nome?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.nome}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <Badge className="mt-1 bg-[#2DCE89]/20 text-[#2DCE89] border-none">
              Motorista
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f1419] border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#2DCE89]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Placa Caminhão</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="ABC-1234"
                className="w-full bg-[#0f1419] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#2DCE89] hover:bg-[#25b377] text-white"
          >
            {saving ? 'Salvando...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => { logout(); onLogout(); }}
            className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
