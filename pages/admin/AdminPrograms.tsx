import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Program } from '../../types';
import { Trash2, Edit, Plus, X, Clock, Mic } from 'lucide-react';

const AdminPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Partial<Program>>({});

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = () => setPrograms(db.getPrograms());

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este programa da grade?')) {
      db.deleteProgram(id);
      loadPrograms();
    }
  };

  const handleEdit = (prog: Program) => {
    setCurrentProgram(prog);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProgram({
      name: '', host: '', description: '', startTime: '08:00', endTime: '09:00', days: [1, 2, 3, 4, 5]
    });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const progToSave = {
        ...currentProgram,
        id: currentProgram.id || Date.now().toString(),
    } as Program;

    db.saveProgram(progToSave);
    setIsEditing(false);
    loadPrograms();
  };

  const toggleDay = (dayIndex: number) => {
      const currentDays = currentProgram.days || [];
      if (currentDays.includes(dayIndex)) {
          setCurrentProgram({ ...currentProgram, days: currentDays.filter(d => d !== dayIndex) });
      } else {
          setCurrentProgram({ ...currentProgram, days: [...currentDays, dayIndex].sort() });
      }
  };

  const daysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (isEditing) {
    return (
        <div className="bg-white p-6 rounded-xl shadow animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{currentProgram.id ? 'Editar Programa' : 'Novo Programa'}</h2>
                <button onClick={() => setIsEditing(false)}><X className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Programa</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={currentProgram.name || ''} onChange={e => setCurrentProgram({...currentProgram, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Locutor / Apresentador</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={currentProgram.host || ''} onChange={e => setCurrentProgram({...currentProgram, host: e.target.value})} required />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Início (HH:mm)</label>
                        <input type="time" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={currentProgram.startTime || ''} onChange={e => setCurrentProgram({...currentProgram, startTime: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fim (HH:mm)</label>
                        <input type="time" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={currentProgram.endTime || ''} onChange={e => setCurrentProgram({...currentProgram, endTime: e.target.value})} required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Dias da Semana</label>
                    <div className="flex flex-wrap gap-2">
                        {daysLabels.map((day, index) => (
                            <button
                                type="button"
                                key={day}
                                onClick={() => toggleDay(index)}
                                className={`px-3 py-1 rounded-full text-sm font-bold transition ${
                                    currentProgram.days?.includes(index)
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={currentProgram.description || ''} onChange={e => setCurrentProgram({...currentProgram, description: e.target.value})} />
                </div>
                
                <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">Salvar Programa</button>
            </form>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Grade de Programação</h1>
        <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition shadow">
            <Plus size={18} className="mr-2" /> Adicionar Programa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
          {programs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum programa cadastrado.</div>
          ) : (
            <div className="divide-y divide-gray-100">
                {programs.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(item => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center hover:bg-gray-50 transition">
                        <div className="md:w-32 flex items-center text-blue-800 font-bold text-lg mb-2 md:mb-0">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            {item.startTime}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center"><Mic size={14} className="mr-1" /> {item.host}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="text-blue-600 font-medium">
                                    {item.days.map(d => daysLabels[d]).join(', ')}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminPrograms;