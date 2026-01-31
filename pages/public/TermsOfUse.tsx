
import React, { useEffect } from 'react';
import { FileWarning, Radio, MessageCircle, ShoppingBag, Coins, Gavel, AlertTriangle } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  useEffect(() => {
    document.title = "Termos de Uso | Rádio Treze de Maio";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
          
          <div className="text-center mb-10 border-b border-gray-100 pb-8">
            <FileWarning className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">Termos de Uso</h1>
            <p className="text-gray-500">Regras e condições para utilização da Plataforma Rádio Treze de Maio.</p>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 space-y-6 text-justify">
            
            <section>
              <h2 className="text-xl font-bold text-blue-900">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a <strong>Rádio Treze de Maio</strong>, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, você deve interromper imediatamente o uso da plataforma. Estes termos aplicam-se a todos os serviços: site, streaming, chat, marketplace e integração Web3.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Radio size={20} /> 2. Uso do Streaming e Conteúdo
              </h2>
              <p>
                O conteúdo de áudio transmitido (músicas, programas, locuções) é protegido por direitos autorais e de propriedade intelectual. É permitido apenas o uso pessoal e não comercial. É estritamente proibido gravar, redistribuir, retransmitir ou comercializar o sinal da rádio sem autorização expressa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <MessageCircle size={20} /> 3. Regras de Conduta (Chat e Comentários)
              </h2>
              <p>O usuário é o único responsável pelo conteúdo que publica. É terminantemente proibido:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
                <li>Discurso de ódio, racismo, homofobia, xenofobia ou qualquer forma de discriminação.</li>
                <li>Conteúdo pornográfico, violento ou ilegal.</li>
                <li>Spam, correntes ou links maliciosos.</li>
                <li>Assédio, bullying ou ameaças a outros usuários ou à equipe da rádio.</li>
              </ul>
              <p className="text-sm mt-2">
                A moderação reserva-se o direito de remover mensagens e banir usuários que violem estas regras, sem aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ShoppingBag size={20} /> 4. Regras do Marketplace / Classificados
              </h2>
              <p>
                A Rádio Treze de Maio atua apenas como <strong>intermediária de divulgação</strong>. Não somos proprietários dos produtos anunciados, não guardamos posse e não realizamos as vendas.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Responsabilidade:</strong> Toda a negociação, pagamento e entrega é de responsabilidade exclusiva do Comprador e do Vendedor.</li>
                <li><strong>Isenção:</strong> A Rádio não se responsabiliza por defeitos, não entrega ou fraudes entre usuários. Recomendamos cautela e encontros em locais públicos.</li>
                <li><strong>Proibições:</strong> É proibido anunciar produtos ilegais, armas, drogas, medicamentos controlados ou itens falsificados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Coins size={20} /> 5. Web3 e Token Proto Stream
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                  <AlertTriangle size={18} /> Aviso Importante sobre Recompensas
                </h3>
                <p className="text-sm text-yellow-900 mt-2">
                  O token <strong>Proto Stream</strong> é um ativo digital utilitário (Utility Token) voltado para engajamento e fidelidade. <strong>NÃO É UM INVESTIMENTO FINANCEIRO.</strong>
                </p>
              </div>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Recompensas ("Listen-to-Earn"):</strong> As recompensas por tempo de audição são um benefício promocional e podem ser alteradas, suspensas ou canceladas a qualquer momento, sem aviso prévio.</li>
                <li><strong>Anti-Fraude:</strong> O uso de bots, scripts, múltiplas abas, emuladores ou quaisquer meios artificiais para acumular tokens resultará no banimento imediato da conta e perda dos tokens não sacados.</li>
                <li><strong>Valor:</strong> A Rádio Treze de Maio não garante valor monetário, liquidez ou listagem do token em corretoras externas.</li>
                <li><strong>Segurança da Carteira:</strong> O usuário é o único responsável pela segurança de sua carteira (ex: Phantom) e suas chaves privadas. Não nos responsabilizamos por perdas decorrentes de hacks, phishing ou erro do usuário.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Gavel size={20} /> 6. Isenção de Responsabilidade
              </h2>
              <p>
                A plataforma é fornecida "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso da plataforma, falhas na internet, ou conduta de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900">7. Disposições Finais</h2>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Treze de Maio/SC para dirimir quaisquer dúvidas, com exclusão de qualquer outro.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
