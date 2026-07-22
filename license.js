/**
 * Sistema de Licenciamento e Controle de Assinatura
 * Gerencia validação, quotas e funcionalidades por plano
 */

const PLANOS = {
    GRATUITO: {
        id: 'gratuito',
        nome: 'Gratuito',
        preco: 0,
        limiteBuscas: 10,
        limiteProjetos: 3,
        limiteAnalises: 5,
        funcionalidades: ['busca_basica', 'visualizacao_mapa'],
        biEmbed: false,
        exportDados: false,
        suporte: 'basico'
    },
    BASICO: {
        id: 'basico',
        nome: 'Básico',
        preco: 97,
        limiteBuscas: 100,
        limiteProjetos: 20,
        limiteAnalises: 50,
        funcionalidades: ['busca_basica', 'busca_avancada', 'visualizacao_mapa', 'analise_terreno', 'export_pdf'],
        biEmbed: false,
        exportDados: true,
        suporte: 'email'
    },
    PROFISSIONAL: {
        id: 'profissional',
        nome: 'Profissional',
        preco: 247,
        limiteBuscas: -1, // ilimitado
        limiteProjetos: -1,
        limiteAnalises: -1,
        funcionalidades: ['busca_basica', 'busca_avancada', 'visualizacao_mapa', 'analise_terreno', 'analise_complexa', 'export_pdf', 'export_dados', 'bi_embed', 'comparativo', 'historico'],
        biEmbed: true,
        exportDados: true,
        suporte: 'prioritario'
    },
    EMPRESA: {
        id: 'empresa',
        nome: 'Empresa',
        preco: 497,
        limiteBuscas: -1,
        limiteProjetos: -1,
        limiteAnalises: -1,
        funcionalidades: ['busca_basica', 'busca_avancada', 'visualizacao_mapa', 'analise_terreno', 'analise_complexa', 'export_pdf', 'export_dados', 'bi_embed', 'comparativo', 'historico', 'api', 'multi_usuario', 'white_label'],
        biEmbed: true,
        exportDados: true,
        suporte: 'dedicado'
    }
};

class LicenseManager {
    constructor() {
        this.usuarioAtual = null;
        this.planoAtual = null;
        this.usoMes = null;
    }

    // Gerar chave de licença
    gerarChave(plano) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const prefixo = plano.toUpperCase().substring(0, 3);
        let chave = prefixo + '-';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) chave += '-';
            chave += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return chave;
    }

    // Validar chave de licença
    async validarChave(chave) {
        try {
            const licencas = await db.getByIndex('licencas', 'chave', chave);
            if (licencas.length === 0) return { valido: false, erro: 'Chave não encontrada' };

            const licenca = licencas[0];
            const hoje = new Date();
            const validade = new Date(licenca.validade);

            if (validade < hoje) {
                return { valido: false, erro: 'Licença expirada' };
            }

            if (licenca.status === 'suspensa') {
                return { valido: false, erro: 'Licença suspensa - Pagamento pendente' };
            }

            const plano = Object.values(PLANOS).find(p => p.id === licenca.plano);
            if (!plano) {
                return { valido: false, erro: 'Plano inválido' };
            }

            return {
                valido: true,
                licenca: licenca,
                plano: plano
            };
        } catch (error) {
            return { valido: false, erro: 'Erro ao validar licença' };
        }
    }

    // Login do usuário
    async login(email, senha) {
        try {
            const usuarios = await db.getByIndex('usuarios', 'email', email);
            if (usuarios.length === 0) {
                return { sucesso: false, erro: 'Usuário não encontrado' };
            }

            const usuario = usuarios[0];
            // Em produção, usar hash bcrypt
            if (usuario.senha !== this.hashSenha(senha)) {
                return { sucesso: false, erro: 'Senha incorreta' };
            }

            this.usuarioAtual = usuario;

            // Validar licença
            if (usuario.licenca) {
                const resultado = await this.validarChave(usuario.licenca);
                if (resultado.valido) {
                    this.planoAtual = resultado.plano;
                }
            } else {
                this.planoAtual = PLANOS.GRATUITO;
            }

            // Carregar uso do mês
            await this.carregarUso();

            // Salvar sessão
            localStorage.setItem('sessao', JSON.stringify({
                usuarioId: usuario.id,
                timestamp: Date.now()
            }));

            return {
                sucesso: true,
                usuario: usuario,
                plano: this.planoAtual
            };
        } catch (error) {
            return { sucesso: false, erro: 'Erro ao fazer login' };
        }
    }

    // Cadastro
    async cadastrar(dados) {
        try {
            // Verificar se email já existe
            const existente = await db.getByIndex('usuarios', 'email', dados.email);
            if (existente.length > 0) {
                return { sucesso: false, erro: 'Email já cadastrado' };
            }

            const usuario = {
                ...dados,
                senha: this.hashSenha(dados.senha),
                plano: 'gratuito',
                status: 'ativo',
                dataCadastro: new Date().toISOString()
            };

            const id = await db.add('usuarios', usuario);

            // Criar uso inicial
            const periodo = this.getPeriodoAtual();
            await db.add('uso', {
                usuarioId: id,
                periodo: periodo,
                buscas: 0,
                projetos: 0,
                analises: 0
            });

            return { sucesso: true, usuarioId: id };
        } catch (error) {
            return { sucesso: false, erro: 'Erro ao cadastrar' };
        }
    }

    // Verificar se pode usar funcionalidade
    async podeUsar(funcionalidade) {
        if (!this.planoAtual) return false;

        // Verificar funcionalidade no plano
        const temFuncionalidade = this.planoAtual.funcionalidades.includes(funcionalidade);
        if (!temFuncionalidade) return false;

        // Verificar quota
        const quota = this.verificarQuota(funcionalidade);
        return quota.disponivel;
    }

    // Verificar quota de uso
    verificarQuota(funcionalidade) {
        if (!this.usoMes) {
            return { usado: 0, limite: 0, disponivel: false };
        }

        let limite, usado;

        switch (funcionalidade) {
            case 'busca_basica':
            case 'busca_avancada':
                limite = this.planoAtual.limiteBuscas;
                usado = this.usoMes.buscas;
                break;
            case 'criar_projeto':
                limite = this.planoAtual.limiteProjetos;
                usado = this.usoMes.projetos;
                break;
            case 'analise_terreno':
            case 'analise_complexa':
                limite = this.planoAtual.limiteAnalises;
                usado = this.usoMes.analises;
                break;
            default:
                return { usado: 0, limite: -1, disponivel: true };
        }

        // -1 significa ilimitado
        if (limite === -1) {
            return { usado: usado, limite: 'Ilimitado', disponivel: true };
        }

        return {
            usado: usado,
            limite: limite,
            disponivel: usado < limite
        };
    }

    // Registrar uso
    async registrarUso(tipo) {
        if (!this.usoMes || !this.usuarioAtual) return;

        const mapa = {
            'busca': 'buscas',
            'projeto': 'projetos',
            'analise': 'analises'
        };

        const campo = mapa[tipo];
        if (campo) {
            this.usoMes[campo]++;
            await db.update('uso', this.usoMes);
        }
    }

    // Carregar uso do mês
    async carregarUso() {
        if (!this.usuarioAtual) return;

        const periodo = this.getPeriodoAtual();
        const usos = await db.getByIndex('uso', 'usuarioId', this.usuarioAtual.id);
        const usoMes = usos.find(u => u.periodo === periodo);

        if (usoMes) {
            this.usoMes = usoMes;
        } else {
            // Criar registro do mês atual
            const novoUso = {
                usuarioId: this.usuarioAtual.id,
                periodo: periodo,
                buscas: 0,
                projetos: 0,
                analises: 0
            };
            const id = await db.add('uso', novoUso);
            this.usoMes = { id, ...novoUso };
        }
    }

    // Obter período atual (YYYY-MM)
    getPeriodoAtual() {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    }

    // Hash simples da senha (em produção usar bcrypt no backend)
    hashSenha(senha) {
        let hash = 0;
        for (let i = 0; i < senha.length; i++) {
            const char = senha.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(36);
    }

    // Ativar plano
    async ativarPlano(chave) {
        const resultado = await this.validarChave(chave);
        if (!resultado.valido) {
            return { sucesso: false, erro: resultado.erro };
        }

        // Atualizar usuário
        this.usuarioAtual.licenca = chave;
        this.usuarioAtual.plano = resultado.plano.id;
        await db.update('usuarios', this.usuarioAtual);

        this.planoAtual = resultado.plano;

        return { sucesso: true, plano: resultado.plano };
    }

    // Logout
    logout() {
        this.usuarioAtual = null;
        this.planoAtual = null;
        this.usoMes = null;
        localStorage.removeItem('sessao');
        window.location.href = 'index.html';
    }

    // Verificar sessão ativa
    async verificarSessao() {
        const sessao = localStorage.getItem('sessao');
        if (!sessao) return false;

        const { usuarioId, timestamp } = JSON.parse(sessao);
        const tempoDecorrido = Date.now() - timestamp;

        // Sessão expira em 24 horas
        if (tempoDecorrido > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('sessao');
            return false;
        }

        // Recarregar dados do usuário
        const usuario = await db.get('usuarios', usuarioId);
        if (!usuario) return false;

        this.usuarioAtual = usuario;

        if (usuario.licenca) {
            const resultado = await this.validarChave(usuario.licenca);
            if (resultado.valido) {
                this.planoAtual = resultado.plano;
            } else {
                this.planoAtual = PLANOS.GRATUITO;
            }
        } else {
            this.planoAtual = PLANOS.GRATUITO;
        }

        await this.carregarUso();
        return true;
    }

    // Obter info do plano
    getPlanoInfo() {
        if (!this.planoAtual) return PLANOS.GRATUITO;
        return this.planoAtual;
    }

    // Obter uso atual
    getUso() {
        return this.usoMes;
    }

    // Ativar com chave de licença (alias para ativarPlano)
    async ativarChave(chave) {
        const result = await this.ativarPlano(chave);
        return result.sucesso;
    }

    // Salvar dados do usuário
    async salvarUsuario(usuario) {
        await db.update('usuarios', usuario);
        this.usuarioAtual = usuario;
    }

    // Getter para licença atual
    get licensaAtual() {
        return this.usuarioAtual ? this.usuarioAtual.licenca : null;
    }
}

// Instância global
const license = new LicenseManager();
