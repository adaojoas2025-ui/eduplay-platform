// Sistema de eventos customizado para forçar atualizações de auth
class AuthEventEmitter {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit() {
    console.log('🔔 AUTH EVENT EMITTED - notificando', this.listeners.length, 'listeners');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao executar listener:', error);
      }
    });
  }
}

export const authEvents = new AuthEventEmitter();
