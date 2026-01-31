
import React, { useEffect } from 'react';
import { Cookie, Info, Settings, ShieldCheck, ExternalLink } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  useEffect(() => {
    document.title = "Política de Cookies | Rádio Treze de Maio";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
          
          <div className="text-center mb-10 border-b border-gray-100 pb-8">
            <Cookie className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">Política de Cookies</h1>
            <p className="text-gray-500">Transparência sobre como utilizamos tecnologias de rastreamento.</p>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 space-y-6 text-justify">
            
            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Info size={20} /> 1. O que são Cookies?
              </h2>
              <p>
                Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo quando você visita um site. Eles servem para lembrar suas preferências, manter sua sessão ativa, analisar o tráfego e fornecer anúncios relevantes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Settings size={20} /> 2. Tipos de Cookies que Utilizamos
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-800">Cookies Essenciais</h3>
                  <p className="text-sm">Necessários para o funcionamento do site, como manter você logado, permitir o envio de mensagens no chat e garantir a segurança da conexão Web3.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-gray-800">Cookies de Desempenho e Análise</h3>
                  <p className="text-sm">Utilizamos o <strong>Google Analytics</strong> para coletar informações anônimas sobre como os visitantes utilizam nosso site (páginas mais acessadas, tempo de permanência, origem do tráfego). Isso nos ajuda a melhorar o conteúdo.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 border-l-4 border-l-yellow-400">
                  <h3 className="font-bold text-gray-800">Cookies de Publicidade (Google AdSense)</h3>
                  <p className="text-sm">
                    Utilizamos o Google AdSense para exibir anúncios. O Google utiliza cookies para veicular anúncios com base nas suas visitas anteriores a este ou a outros sites na internet.
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm">
                    <li>O uso de <strong>Cookies de publicidade</strong> permite que o Google e seus parceiros veiculem anúncios para você com base na sua visita a este site e/ou a outros sites na Internet.</li>
                    <li>Você pode desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Configurações de Anúncios</a>.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ShieldCheck size={20} /> 3. Consentimento e Controle
              </h2>
              <p>
                Ao acessar nosso site pela primeira vez, apresentamos um banner de consentimento. Ao clicar em "Aceitar", você concorda com o uso de todos os cookies. Você pode alterar suas preferências a qualquer momento através das configurações do seu navegador.
              </p>
              <p>
                Para mais informações sobre como o Google utiliza seus dados quando você usa sites ou aplicativos de parceiros, visite:
              </p>
              <a 
                href="https://policies.google.com/technologies/ads" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition mt-2"
              >
                Como o Google utiliza cookies na publicidade <ExternalLink size={16} />
              </a>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900">4. Como gerenciar cookies no navegador</h2>
              <p>Você pode desativar os cookies alterando as configurações do seu navegador, mas isso pode afetar a funcionalidade do site (ex: login automático). Consulte a ajuda do seu navegador:</p>
              <ul className="flex flex-wrap gap-4 mt-2 text-sm text-blue-600 font-bold">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/pt-BR/kb/desative-cookies-terceiros-impedir-rastreamento" target="_blank" rel="noreferrer" className="hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noreferrer" className="hover:underline">Microsoft Edge</a></li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
