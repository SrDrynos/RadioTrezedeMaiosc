
import React, { useEffect } from 'react';
import { Shield, Lock, Eye, Database, Share2, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = "Política de Privacidade | Rádio Treze de Maio";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
          
          <div className="text-center mb-10 border-b border-gray-100 pb-8">
            <Shield className="w-16 h-16 text-blue-900 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">Política de Privacidade</h1>
            <p className="text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 space-y-6 text-justify">
            
            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <FileText size={20} /> 1. Introdução e Conformidade Geral
              </h2>
              <p>
                A <strong>Rádio Treze de Maio</strong> (doravante "Plataforma" ou "Nós"), parte integrante do ecossistema do Grupo Córtex Hold, está comprometida com a proteção de dados e a privacidade de seus usuários ("Você"). Esta Política de Privacidade foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>, o Marco Civil da Internet (Lei nº 12.965/2014) e as diretrizes de transparência exigidas pelo Google AdSense.
              </p>
              <p>
                Ao acessar nosso portal, utilizar o streaming de áudio, conectar sua carteira Web3, participar do chat ou utilizar o marketplace, você declara estar ciente e de acordo com a coleta e tratamento de seus dados conforme descrito neste documento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Database size={20} /> 2. Dados Coletados
              </h2>
              <p>Coletamos diferentes tipos de dados para fornecer e melhorar nossos serviços:</p>
              
              <h3 className="font-bold text-gray-800 mt-4">2.1. Dados Coletados Automaticamente</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Registros de Acesso (Logs):</strong> Endereço IP, data e hora de acesso, navegador utilizado, sistema operacional e geolocalização aproximada (Cidade/Estado).</li>
                <li><strong>Dados de Navegação:</strong> Páginas visitadas, tempo de permanência no streaming (para cálculo de recompensas), interações com anúncios e cliques.</li>
                <li><strong>Cookies e Identificadores:</strong> Cookies primários e de terceiros (Google Analytics, AdSense) para personalização e métricas.</li>
              </ul>

              <h3 className="font-bold text-gray-800 mt-4">2.2. Dados Fornecidos pelo Usuário</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cadastro:</strong> Nome completo, endereço de e-mail, senha criptografada e nome de usuário.</li>
                <li><strong>Comunicação:</strong> Mensagens enviadas no chat público ou privado, pedidos de música e formulários de contato.</li>
                <li><strong>Marketplace:</strong> Dados de produtos anunciados, descrições, imagens e negociações realizadas na plataforma.</li>
              </ul>

              <h3 className="font-bold text-gray-800 mt-4">2.3. Dados de Web3 e Blockchain</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Carteira Digital:</strong> Endereço público da sua carteira (ex: Phantom Wallet) ao conectar-se para recebimento de tokens Proto Stream.</li>
                <li><strong>Transações:</strong> Histórico de recompensas (claims) e transferências de tokens realizadas dentro do ecossistema da Rádio.</li>
                <li><em>Nota: Não temos acesso às suas chaves privadas ou senhas da carteira (Seed Phrase).</em></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Eye size={20} /> 3. Finalidade do Tratamento de Dados
              </h2>
              <p>Os dados coletados têm as seguintes finalidades:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Execução do Serviço:</strong> Permitir o login, acesso ao chat, publicação de classificados e funcionamento do streaming.</li>
                <li><strong>Programa de Recompensas:</strong> Monitorar o tempo de conexão no streaming para distribuição justa do token Proto Stream via Web3.</li>
                <li><strong>Publicidade (Google AdSense):</strong> Exibir anúncios personalizados e não personalizados baseados em seus interesses e navegação.</li>
                <li><strong>Segurança:</strong> Prevenção de fraudes, detecção de múltiplas contas abusivas (Sybil attack) e cumprimento de obrigações legais.</li>
                <li><strong>Analytics:</strong> Análise de tráfego para melhoria contínua do conteúdo editorial e musical.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Share2 size={20} /> 4. Compartilhamento com Terceiros
              </h2>
              <p>Não vendemos seus dados pessoais. O compartilhamento ocorre apenas nas seguintes situações:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google (AdSense e Analytics):</strong> Para fornecimento de publicidade programática e análise de métricas. O Google utiliza cookies DART para exibir anúncios com base em visitas a este e outros sites.</li>
                <li><strong>APIs e Infraestrutura:</strong> Provedores de hospedagem, banco de dados e APIs de streaming necessárias para a operação técnica.</li>
                <li><strong>Blockchain (Público):</strong> Ao interagir com o token Proto Stream, o endereço da sua carteira e os valores transacionados ficam registrados publicamente na Blockchain (Solana), característica intrínseca da tecnologia Web3.</li>
                <li><strong>Requisição Legal:</strong> Mediante ordem judicial ou requisição de autoridades competentes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Lock size={20} /> 5. Segurança e Armazenamento
              </h2>
              <p>
                Adotamos medidas técnicas e administrativas de segurança (criptografia SSL/TLS, hashing de senhas, firewalls) para proteger seus dados contra acessos não autorizados. Seus dados são armazenados em servidores seguros, podendo haver transferência internacional de dados para servidores de parceiros (ex: Google Cloud, AWS), sempre respeitando padrões de segurança adequados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Shield size={20} /> 6. Direitos do Titular (LGPD)
              </h2>
              <p>Conforme a LGPD, você tem direito a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Confirmar a existência de tratamento de dados.</li>
                <li>Acessar seus dados pessoais armazenados.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
              <p className="mt-2 text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <strong>Solicitação de Exclusão:</strong> Para exercer seus direitos ou solicitar a exclusão completa de sua conta e dados, entre em contato conosco através do e-mail: <strong>contato@radiotrezedemaio.com.br</strong> ou pelo formulário na página de Contato. Atenderemos sua solicitação no prazo legal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-900">7. Alterações nesta Política</h2>
              <p>
                Reservamo-nos o direito de atualizar esta política a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. Recomendamos a revisão periódica desta página.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
