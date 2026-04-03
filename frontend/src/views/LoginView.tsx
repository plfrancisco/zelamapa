import { useState } from 'react';
import { Lock, User, AlertCircle, Leaf } from 'lucide-react';

export default function LoginView({ onLogin }: { onLogin: (role: 'motorista' | 'gerente' | 'cidadao') => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'motorista' && password === 'adm') {
      onLogin('motorista');
    } else if (username === 'gerente' && password === 'adm') {
      onLogin('gerente');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-azul-marinho flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-azul-marinho flex items-center justify-center gap-2">
            <Leaf className="text-verde-esmeralda" size={28} /> ZelaMapa
          </h1>
          <p className="text-gray-500 mt-2">Plataforma GovTech de Zeladoria</p>
        </div>

        {error && (
          <div className="bg-red-50 text-vermelho-alerta p-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID de Acesso</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-esmeralda focus:border-verde-esmeralda outline-none transition"
                placeholder="Ex: motorista ou gerente"
                
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Administrativa</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-esmeralda focus:border-verde-esmeralda outline-none transition"
                placeholder="••••••"
                
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-verde-esmeralda hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg mt-4 cursor-pointer"
          >
            Entrar no Sistema Restrito
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600 font-semibold mb-4">É cidadão de Pompéia?</p>
          <button
            onClick={() => onLogin('cidadao')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg cursor-pointer"
          >
            Acessar Área do Cidadão
          </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
            Acesso Restrito - ZelaMapa Logística Municipal
        </div>
      </div>
    </div>
  );
}
