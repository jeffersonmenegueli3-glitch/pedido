import React, { useState } from 'react';
import { EmailContact, EmailGroup } from '../types/fleet';
import { Mail, User, ShieldCheck, Tag, X, Save, Phone, MessageSquare, Users } from 'lucide-react';

interface RegisterEmailModalProps {
  contactToEdit?: EmailContact | null;
  existingGroups?: EmailGroup[];
  onClose: () => void;
  onSave: (contact: EmailContact) => void;
}

export const RegisterEmailModal: React.FC<RegisterEmailModalProps> = ({
  contactToEdit,
  existingGroups = [],
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<EmailContact>({
    id: contactToEdit?.id || `email-contact-${Date.now()}`,
    nome: contactToEdit?.nome || '',
    email: contactToEdit?.email || '',
    telefone: contactToEdit?.telefone || '',
    cargo: contactToEdit?.cargo || 'Gestor de Frota',
    grupo: contactToEdit?.grupo || 'Gestores de Frota & Diretoria',
    recebeAlertas20Dias: contactToEdit?.recebeAlertas20Dias ?? true,
    recebeAlertasWhatsapp: contactToEdit?.recebeAlertasWhatsapp ?? true,
    ativo: contactToEdit?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">
              {contactToEdit ? 'Editar Contato da Frota' : 'Cadastrar Novo Contato / Pessoal'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome Completo / Responsável</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Endereço de E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Ex: joao.silva@empresa.com.br"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">WhatsApp / Telefone Celular</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: +55 (21) 99888-7766"
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Cargo / Setor Responsável</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Gestor de Frota">Gestor de Frota</option>
                <option value="Diretoria Executiva">Diretoria Executiva</option>
                <option value="Oficina Central">Oficina Central & Manutenção</option>
                <option value="Gerente Regional Rio">Gerente Regional - Base Rio</option>
                <option value="Gerente Regional Interior">Gerente Regional - Base Interior</option>
                <option value="Gerente Regional Redespacho">Gerente Regional - Redespacho</option>
                <option value="Suporte & Operações">Suporte & Operações</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Grupo de E-mail / Alertas</label>
            <div className="relative">
              <Users className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={formData.grupo || 'Gestores de Frota & Diretoria'}
                onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Gestores de Frota & Diretoria">👥 Gestores de Frota & Diretoria</option>
                <option value="Oficina & Manutenção Central">🔧 Oficina & Manutenção Central</option>
                <option value="Operacional & Regionais">🚛 Operacional & Regionais</option>
                <option value="Todos os Cadastrados">🌐 Todos os Cadastrados (Geral)</option>
                {existingGroups.map(g => (
                  <option key={g.id} value={g.nome}>📁 {g.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recebeAlertas20Dias"
                checked={formData.recebeAlertas20Dias}
                onChange={(e) => setFormData({ ...formData, recebeAlertas20Dias: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <label htmlFor="recebeAlertas20Dias" className="text-slate-200 font-medium cursor-pointer">
                Receber alertas automáticos por E-mail
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recebeAlertasWhatsapp"
                checked={formData.recebeAlertasWhatsapp ?? true}
                onChange={(e) => setFormData({ ...formData, recebeAlertasWhatsapp: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <label htmlFor="recebeAlertasWhatsapp" className="text-slate-200 font-medium cursor-pointer flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Receber alertas automáticos por WhatsApp
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <label htmlFor="ativo" className="text-slate-200 font-medium cursor-pointer">
                Contato Ativo para envios do sistema
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Cadastro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
