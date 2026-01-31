
import React, { useEffect } from 'react';
import { Rocket, Coins, Tv, Zap, ShoppingBag, Flame, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Componente de Layout Reutilizável para as páginas Fluxx
const FluxxLayout: React.FC<{
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}> = ({ title, icon, gradient, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className={`relative py-20 ${gradient} text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-md rounded-full mb-6 shadow-lg border border-white/30">
            {icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-md mb-4">{title}</h1>
          <div className="w-24 h-1 bg-white mx-auto rounded-full opacity-80"></div>
        </div>
        {/* Curved Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-[calc(100%+1.3px)] h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
            </svg>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
           <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed text-justify">
             {children}
           </div>

           {/* Call to Actions */}
           <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="https://protostream.com.br/buy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition transform uppercase">
                 <Coins size={20} /> Comprar Token (ICO)
              </a>
              <a href="https://protostream.com.br/whitepaper" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-4 rounded-xl shadow hover:bg-slate-700 transition transform hover:scale-[1.02] uppercase">
                 <ExternalLink size={20} /> Ler Whitepaper
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

// 1. Página Startup Fluxx
export const StartupFluxx: React.FC = () => (
  <FluxxLayout 
    title="Startup Fluxx" 
    icon={<Rocket size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900"
  >
    <p className="text-xl font-medium text-blue-900 mb-6">
      O núcleo de inovação e tecnologia do ecossistema Fluxx.
    </p>
    <p>
      A <strong>Startup Fluxx</strong> é responsável pela criação, gestão e expansão de plataformas digitais, aplicativos, projetos de mídia e soluções baseadas em economia digital.
    </p>
    <p>
      Nossa missão é conectar tecnologia, blockchain, comunicação e comunidades, criando produtos escaláveis e modelos de negócio sustentáveis voltados ao futuro. Atuamos como a "cabeça pensante" e a infraestrutura tecnológica que permite que projetos como a Rádio Treze de Maio, o Proto Rider e o Hub Fluxx Stream operem de forma integrada e eficiente.
    </p>
  </FluxxLayout>
);

// 2. Página Criptomoeda Proto
export const ProtoToken: React.FC = () => (
  <FluxxLayout 
    title="Criptomoeda Proto" 
    icon={<Coins size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500"
  >
    <p className="text-xl font-medium text-orange-900 mb-6">
      A moeda oficial do ecossistema Fluxx.
    </p>
    <p>
      A <strong>Proto</strong> foi criada para ser utilizada como meio de troca, recompensa e acesso a serviços dentro das plataformas do grupo. Diferente de tokens puramente especulativos, a Proto possui utilidade real desde o primeiro dia.
    </p>
    <p>
      Ela permite transações digitais rápidas, monetização de usuários através do modelo "Listen-to-Earn" e integração com aplicativos, marketplaces e comunidades. Seu foco é a adoção prática e o fortalecimento da economia digital descentralizada, garantindo que o valor gerado dentro do ecossistema retorne para seus participantes.
    </p>
    <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500 my-6">
       <h4 className="font-bold text-orange-800 mb-2">Tokenomics & Liquidez</h4>
       <p className="text-sm">
         A Proto opera na rede Solana, garantindo taxas baixas e alta velocidade. A liquidez inicial está travada para garantir segurança aos investidores.
       </p>
       <a href="https://www.orca.so/pools/4euzSfU7FjJXybMGeYW2WSra7hw1kaZovhWVDfJkcrga" target="_blank" className="text-blue-600 font-bold underline mt-2 inline-block">Ver Pool de Liquidez na Orca</a>
    </div>
  </FluxxLayout>
);

// 3. Página Hub Fluxx Stream
export const HubStream: React.FC = () => (
  <FluxxLayout 
    title="Hub Fluxx Stream" 
    icon={<Tv size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-purple-800 via-violet-600 to-indigo-600"
  >
    <p className="text-xl font-medium text-purple-900 mb-6">
      O futuro do streaming inteligente e descentralizado.
    </p>
    <p>
      O <strong>Fluxx Stream</strong> é um hub de streaming que conecta rádios online, web TVs, podcasts e plataformas de vídeo em um único ecossistema. Nosso diferencial está na monetização do usuário: aqui, a audiência vale mais.
    </p>
    <p>
      Através do sistema integrado à criptomoeda Proto, usuários podem ganhar recompensas ao ouvir, assistir, interagir e consumir conteúdos. O hub transforma a audiência passiva em participação ativa, criando um novo modelo de consumo e valorização de conteúdo digital, onde criadores e espectadores ganham juntos.
    </p>
  </FluxxLayout>
);

// 4. Página App Proto Rider
export const ProtoRider: React.FC = () => (
  <FluxxLayout 
    title="App Proto Rider" 
    icon={<Zap size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-800"
  >
    <p className="text-xl font-medium text-green-900 mb-6">
      Conectando o universo do ciclismo e da mobilidade urbana.
    </p>
    <p>
      O <strong>Proto Rider – BikeW</strong> é um aplicativo inovador voltado para quem vive sobre duas rodas. A plataforma conecta ciclistas, parceiros, conteúdos, desafios e benefícios, criando uma experiência digital completa.
    </p>
    <p>
      Totalmente integrado à criptomoeda Proto, o app permite recompensas por engajamento ("Move-to-Earn"), participação em eventos e uso da plataforma. Fortalecemos a comunidade e o lifestyle bike, incentivando a saúde, a sustentabilidade e a mobilidade urbana inteligente.
    </p>
  </FluxxLayout>
);

// 5. Página Grau Shop
export const GrauShop: React.FC = () => (
  <FluxxLayout 
    title="Grau Shop" 
    icon={<ShoppingBag size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-pink-600 via-rose-500 to-red-600"
  >
    <p className="text-xl font-medium text-rose-900 mb-6">
      O marketplace oficial da economia Fluxx.
    </p>
    <p>
      A <strong>Grau Shop</strong> é um marketplace digital onde qualquer pessoa, marca ou empresa pode anunciar produtos e serviços. É o ponto de encontro comercial do nosso ecossistema.
    </p>
    <p>
      Totalmente integrada, a plataforma utiliza a Proto como moeda oficial (além de métodos tradicionais), permitindo compras, vendas, promoções e recompensas exclusivas. A Grau Shop une comércio digital, comunidade e economia descentralizada em um único ambiente seguro e dinâmico.
    </p>
  </FluxxLayout>
);

// 6. Página Loucos por Grau
export const LoucosPorGrau: React.FC = () => (
  <FluxxLayout 
    title="Loucos por Grau" 
    icon={<Flame size={48} className="text-white" />}
    gradient="bg-gradient-to-br from-orange-600 via-red-600 to-rose-900"
  >
    <p className="text-xl font-medium text-red-900 mb-6">
      Mais do que um grupo, um movimento cultural.
    </p>
    <p>
      O <strong>Loucos por Grau</strong> é uma comunidade vibrante formada por apaixonados por ciclismo, mobilidade urbana e a cultura bike ("Grau"). Conectamos pessoas através de conteúdos, desafios, encontros e eventos.
    </p>
    <p>
      Integrada ao ecossistema Fluxx, a comunidade promove engajamento, pertencimento e interação real. Membros ativos têm a possibilidade de receber recompensas em Proto por participação, organização de eventos e contribuição para o crescimento do movimento.
    </p>
  </FluxxLayout>
);
