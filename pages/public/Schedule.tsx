import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Program } from '../../types';
import { Clock, Mic } from 'lucide-react';

const Schedule: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());

  useEffect(() => {
    setPrograms(db.getPrograms());
  }, []);

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const filteredPrograms = programs
    .filter(p => p.days.includes(activeDay))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-10">Grade de Programação</h1>

        {/* Day Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {daysOfWeek.map((day, index) => (
                <button
                    key={day}
                    onClick={() => setActiveDay(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        activeDay === index
                        ? 'bg-yellow-400 text-blue-900 shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                    {day}
                </button>
            ))}
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto space-y-6">
            {filteredPrograms.length > 0 ? filteredPrograms.map((prog) => (
                <div key={prog.id} className="flex flex-col sm:flex-row bg-gray-50 rounded-xl p-6 hover:shadow-md transition border-l-4 border-blue-600">
                    <div className="sm:w-32 flex flex-col justify-center sm:border-r border-gray-200 pr-6 mb-4 sm:mb-0">
                        <div className="flex items-center text-blue-700 font-bold text-xl">
                            <Clock size={20} className="mr-2" />
                            {prog.startTime}
                        </div>
                        <div className="text-gray-400 text-sm pl-7">até {prog.endTime}</div>
                    </div>
                    <div className="flex-1 pl-0 sm:pl-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{prog.name}</h3>
                        <div className="flex items-center text-green-600 text-sm font-medium mb-2">
                            <Mic size={16} className="mr-1" /> {prog.host}
                        </div>
                        <p className="text-gray-600 text-sm">{prog.description}</p>
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
                    Não há programas cadastrados para este dia.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;