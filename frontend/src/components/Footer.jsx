import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title gradient-text">EDUPLAY</h3>
          <p className="footer-description">
            A melhor plataforma para comprar e vender produtos digitais.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><FiFacebook /></a>
            <a href="#" className="social-link"><FiTwitter /></a>
            <a href="#" className="social-link"><FiInstagram /></a>
            <a href="#" className="social-link"><FiLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Marketplace</h4>
          <Link to="/marketplace" className="footer-link">Todos os Produtos</Link>
          <Link to="/categories" className="footer-link">Categorias</Link>
          <Link to="/sellers" className="footer-link">Vendedores</Link>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Sobre</h4>
          <Link to="/about" className="footer-link">Sobre Nós</Link>
          <Link to="/how-it-works" className="footer-link">Como Funciona</Link>
          <Link to="/contact" className="footer-link">Contato</Link>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Suporte</h4>
          <Link to="/faq" className="footer-link">FAQ</Link>
          <Link to="/terms" className="footer-link">Termos de Uso</Link>
          <Link to="/privacy" className="footer-link">Privacidade</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 EDUPLAY. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
