
import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Sponsor } from '../../types';
import { Upload, Trash2, Plus, ExternalLink, HeartHandshake } from 'lucide-react';

const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLink, setNewSponsorLink] = useState('');
  const [newSponsorImage, setNewSponsorImage] = useState('');

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = () => {
    setSponsors(db.getSponsors());
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Logos não precisam ser gigantes. 300px é suficiente para altura.
          const MAX_HEIGHT = 200;

          if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             resolve(canvas.toDataURL('image/png'));
          } else {
             reject(new Error("Canvas failed"));
          }
        };
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploading(true);
          try {
              const compressed = await compressImage(file);
              setNewSponsorImage(compressed);
          } catch (err) {
              alert('Erro ao processar imagem');
          } finally {
              setUploading(false);
          }
      }
  };

  const handleAddSponsor = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSponsorName || !newSponsorImage) return;

      const newSponsor: Sponsor = {
          id: Date.now().toString(),
          name: newSponsorName,
          imageUrl: newSponsorImage,
          externalUrl: newSponsorLink,
          createdAt: new Date().toISOString()
      };

      db.saveSponsor(newSponsor);
      
      // Reset
      setNewSponsorName('');
      setNewSponsorLink('');
      setNewSponsorImage('');
      loadSponsors();
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Remover este patrocinador?')) {
          db.deleteSponsor(id);
          loadSponsors();
      }
  };

  return (
    <div className="space-y-8 pb-10">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <HeartHandshake className="text-yellow-500" /> Gerenciar Patrocinadores
            </h1>
            <p className="text-gray-500">Adicione as marcas que aparecem no rodapé do site.</p>
        </div>

        {/* ADD FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">Adicionar Novo Parceiro</h3>
            <form onSubmit={handleAddSponsor} className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Image Input */}
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-gray-500 mb-2">Logo da Empresa</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px] bg-gray-50 relative">
                        {newSponsorImage ? (
                            <img src={newSponsorImage} className="h-24 object-contain mb-2" />
                        ) : (
                            <Upload className="text-gray-300 mb-2" size={32} />
                        )}
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-xs text-blue-600 font-bold">
                            {uploading ? 'Processando...' : (newSponsorImage ? 'Trocar Imagem' : 'Clique para Enviar')}
                        </span>
                    </div>
                </div>

                {/* Text Inputs */}
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Nome da Empresa</label>
                        <input 
                            required
                            value={newSponsorName}
                            onChange={e => setNewSponsorName(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                            placeholder="Ex: Supermercado Central"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Link do Site / Instagram (Opcional)</label>
                        <input 
                            value={newSponsorLink}
                            onChange={e => setNewSponsorLink(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newSponsorName || !newSponsorImage}
                        className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} /> Adicionar Patrocinador
                    </button>
                </div>
            </form>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                Patrocinadores Ativos ({sponsors.length})
            </div>
            
            {sponsors.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Nenhum patrocinador cadastrado.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition bg-white">
                            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded border border-gray-100 p-2">
                                <img src={sponsor.imageUrl} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 truncate">{sponsor.name}</h4>
                                {sponsor.externalUrl ? (
                                    <a href={sponsor.externalUrl} target="_blank" className="text-xs text-blue-500 flex items-center gap-1 hover:underline truncate">
                                        <ExternalLink size={10} /> Link Externo
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400">Sem link</span>
                                )}
                            </div>
                            <button onClick={() => handleDelete(sponsor.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminSponsors;
