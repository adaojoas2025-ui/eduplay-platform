import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiMessageCircle, FiSend, FiMapPin, FiClock, FiHelpCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'support', label: 'Suporte Técnico', icon: '🔧' },
    { value: 'sales', label: 'Dúvidas sobre Vendas', icon: '💰' },
    { value: 'billing', label: 'Financeiro/Pagamentos', icon: '💳' },
    { value: 'partnership', label: 'Parcerias', icon: '🤝' },
    { value: 'feedback', label: 'Sugestões/Feedback', icon: '💡' },
    { value: 'complaint', label: 'Reclamação', icon: '⚠️' },
    { value: 'other', label: 'Outros Assuntos', icon: '📋' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      setSubmitted(true);

      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'support',
        message: ''
      });

      toast.success('Mensagem enviada com sucesso!');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao enviar mensagem. Tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: FiMail,
      title: 'Email Principal',
      description: 'Envie sua mensagem por email',
      contact: 'ja.eduplay@gmail.com',
      link: 'https://mail.google.com/mail/?view=cm&to=ja.eduplay@gmail.com&su=Contato%20EducaplayJA',
      color: 'blue',
      responseTime: 'Resposta em até 24 horas'
    },
    {
      icon: FiMail,
      title: 'Email Alternativo',
      description: 'Outro canal de contato',
      contact: 'daiannemfarias@gmail.com',
      link: 'https://mail.google.com/mail/?view=cm&to=daiannemfarias@gmail.com&su=Contato%20EducaplayJA',
      color: 'purple',
      responseTime: 'Resposta em até 24 horas'
    },
    {
      icon: FiMessageCircle,
      title: 'WhatsApp Principal',
      description: 'Fale conosco pelo WhatsApp',
      contact: '+55 (61) 99627-2214',
      link: 'https://wa.me/5561996272214',
      color: 'green',
      responseTime: 'Segunda a Sexta: 9h às 18h'
    },
    {
      icon: FiMessageCircle,
      title: 'WhatsApp Alternativo',
      description: 'Outro canal de atendimento',
      contact: '+55 (61) 99808-6631',
      link: 'https://wa.me/5561998086631',
      color: 'green',
      responseTime: 'Segunda a Sexta: 9h às 18h'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-8 mb-8">
            <FiMail className="text-5xl mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Estamos aqui para ajudar! Escolha o canal de contato mais conveniente para você.
            </p>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border-t-4 border-${method.color}-500`}
              >
                <div className={`bg-${method.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`text-3xl text-${method.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">{method.title}</h3>
                <p className="text-gray-600 text-center text-sm mb-3">{method.description}</p>
                <p className={`text-${method.color}-600 font-semibold text-center mb-2`}>
                  {method.contact}
                </p>
                <p className="text-gray-500 text-xs text-center">{method.responseTime}</p>
              </a>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiSend className="text-3xl text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Envie uma Mensagem</h2>
                <p className="text-gray-600 text-sm">Preencha o formulário abaixo</p>
              </div>
            </div>

            {submitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Mensagem Enviada!</h3>
                <p className="text-green-700">
                  Recebemos sua mensagem e responderemos em breve. Verifique seu email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Seu nome completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Resumo do seu contato"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Caracteres: {formData.message.length} / 1000
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Enviar Mensagem
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Ao enviar esta mensagem, você concorda com nossa{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiClock className="text-2xl text-purple-600" />
                <h3 className="text-xl font-bold">Horário de Atendimento</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold">Segunda a Sexta</span>
                  <span className="text-purple-600 font-bold">9h às 18h</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold">Sábado</span>
                  <span className="text-gray-500">Fechado</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold">Domingo</span>
                  <span className="text-gray-500">Fechado</span>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>📧 Email:</strong> Respondemos em até 24 horas (Segunda a Sexta)
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiMapPin className="text-2xl text-blue-600" />
                <h3 className="text-xl font-bold">Localização</h3>
              </div>
              <div className="text-gray-700 space-y-2">
                <p className="font-semibold">EDUPLAY Tecnologia e Educação</p>
                <p>Brasília - DF</p>
                <p>Brasil</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  🌐 <strong>Atendimento online</strong> para todo o Brasil
                </p>
              </div>
            </div>

            {/* FAQ Quick Link */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiHelpCircle className="text-3xl text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Precisa de ajuda rápida?</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Muitas dúvidas podem ser resolvidas imediatamente em nossa Central de Ajuda!
              </p>
              <Link
                to="/help"
                className="block bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Acessar Central de Ajuda →
              </Link>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Siga-nos nas Redes Sociais</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Facebook - ATIVO */}
                <a
                  href="https://facebook.com/profile.php?id=61558683725345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-semibold">Facebook</span>
                </a>

                {/* Instagram - ATIVO */}
                <a
                  href="https://instagram.com/tiadai_prof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="text-sm font-semibold">Instagram</span>
                </a>

                {/* Twitter - Em breve */}
                <div className="flex items-center gap-2 bg-gray-300 text-gray-600 px-4 py-3 rounded-lg cursor-not-allowed">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Twitter</span>
                    <span className="text-xs">Em breve</span>
                  </div>
                </div>

                {/* LinkedIn - Em breve */}
                <div className="flex items-center gap-2 bg-gray-300 text-gray-600 px-4 py-3 rounded-lg cursor-not-allowed">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">LinkedIn</span>
                    <span className="text-xs">Em breve</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 text-center font-semibold mb-2">
                  ✅ Siga-nos nas redes sociais!
                </p>
                <div className="text-xs text-green-700 mt-2 space-y-1">
                  <p>📘 Facebook: <strong>Tia Dai</strong></p>
                  <p>📸 Instagram: <strong>@tiadai_prof</strong></p>
                  <p className="text-gray-500 mt-2">🔜 Em breve: Twitter e LinkedIn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">📚 Recursos Úteis</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/help" className="text-blue-700 hover:text-blue-900 hover:underline">
              → Central de Ajuda
            </Link>
            <Link to="/terms" className="text-blue-700 hover:text-blue-900 hover:underline">
              → Termos de Uso
            </Link>
            <Link to="/privacy" className="text-blue-700 hover:text-blue-900 hover:underline">
              → Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
