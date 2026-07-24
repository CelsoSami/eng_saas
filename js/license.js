/**
 * Sistema de Licenciamento e Controle de Assinatura
 * Gerencia validacao, quotas e funcionalidades por plano
 * Agora usando Supabase Auth + banco na nuvem
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
        nome: 'Basico',
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
        limiteBuscas: -1,
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

    async gerarChave(plano) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const prefixo = plano.toUpperCase().substring(0, 3);
        let chave = prefixo + '-';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) chave += '-';
            chave += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return chave;
    }

    async validarChave(chave) {
        try {
            const licencas = await db.getByIndex('licencas', 'chave', chave);
            if (licencas.length === 0) return { valido: false, erro: 'Chave nao encontrada' };

            const licenca = licencas[0];
            const hoje = new Date();
            const validade = new Date(licenca.validade);

            if (validade < hoje) return { valido: false, erro: 'Licenca expirada' };
            if (licenca.status === 'suspensa') return { valido: false, erro: 'Licenca suspensa - Pagamento pendente' };

            const plano = Object.values(PLANOS).find(p => p.id === licenca.plano);
            if (!plano) return { valido: false, erro: 'Plano invalido' };

            return { valido: true, licenca, plano };
        } catch (error) {
            return { valido: false, erro: 'Erro ao validar licenca' };
        }
    }

    async login(email, senha) {
        try {
            const { data, error } = await db.client.auth.signInWithPassword({ email, password: senha });
            if (error) return { sucesso: false, erro: this._traduzirErro(error.message) };

            db.setUsuarioId(data.user.id);

            const { data: perfil } = await db.client
                .from('usuarios')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (!perfil) return { sucesso: false, erro: 'Perfil nao encontrado' };

            this.usuarioAtual = { id: perfil.id, ...perfil };

            if (perfil.licenca) {
                const resultado = await this.validarChave(perfil.licenca);
                if (resultado.valido) this.planoAtual = resultado.plano;
                else this.planoAtual = PLANOS.GRATUITO;
            } else {
                this.planoAtual = PLANOS.GRATUITO;
            }

            await this.carregarUso();
            return { sucesso: true, usuario: this.usuarioAtual, plano: this.planoAtual };
        } catch (error) {
            return { sucesso: false, erro: 'Erro ao fazer login' };
        }
    }

    async cadastrar(dados) {
        try {
            const { data, error } = await db.client.auth.signUp({
                email: dados.email,
                password: dados.senha,
                options: {
                    data: { nome: dados.nome }
                }
            });

            if (error) return { sucesso: false, erro: this._traduzirErro(error.message) };

            if (data.user) {
                await db.client.from('usuarios').upsert({
                    id: data.user.id,
                    nome: dados.nome,
                    empresa: dados.empresa || '',
                    telefone: dados.telefone || '',
                    plano: 'gratuito',
                    status: 'ativo',
                    data_cadastro: new Date().toISOString()
                });

                const periodo = this.getPeriodoAtual();
                await db.client.from('uso').insert({
                    usuario_id: data.user.id,
                    periodo,
                    buscas: 0,
                    projetos: 0,
                    analises: 0
                });
            }

            return { sucesso: true, usuarioId: data.user?.id };
        } catch (error) {
            return { sucesso: false, erro: 'Erro ao cadastrar' };
        }
    }

    async podeUsar(funcionalidade) {
        if (!this.planoAtual) return false;
        const temFuncionalidade = this.planoAtual.funcionalidades.includes(funcionalidade);
        if (!temFuncionalidade) return false;
        const quota = this.verificarQuota(funcionalidade);
        return quota.disponivel;
    }

    verificarQuota(funcionalidade) {
        if (!this.usoMes) return { usado: 0, limite: 0, disponivel: false };

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

        if (limite === -1) return { usado, limite: 'Ilimitado', disponivel: true };
        return { usado, limite, disponivel: usado < limite };
    }

    async registrarUso(tipo) {
        if (!this.usoMes || !this.usuarioAtual) return;

        const mapa = { 'busca': 'buscas', 'projeto': 'projetos', 'analise': 'analises' };
        const campo = mapa[tipo];
        if (!campo) return;

        this.usoMes[campo]++;
        const { id, ...rest } = this.usoMes;
        await db.client
            .from('uso')
            .update({ [campo]: this.usoMes[campo] })
            .eq('id', id);
    }

    async carregarUso() {
        if (!this.usuarioAtual) return;

        const periodo = this.getPeriodoAtual();
        const { data } = await db.client
            .from('uso')
            .select('*')
            .eq('usuario_id', this.usuarioAtual.id)
            .eq('periodo', periodo)
            .maybeSingle();

        if (data) {
            this.usoMes = data;
        } else {
            const novoUso = {
                usuario_id: this.usuarioAtual.id,
                periodo,
                buscas: 0,
                projetos: 0,
                analises: 0
            };
            const { data: inserted } = await db.client.from('uso').insert(novoUso).select().single();
            this.usoMes = inserted;
        }
    }

    getPeriodoAtual() {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    }

    async ativarPlano(chave) {
        const resultado = await this.validarChave(chave);
        if (!resultado.valido) return { sucesso: false, erro: resultado.erro };

        this.usuarioAtual.licenca = chave;
        this.usuarioAtual.plano = resultado.plano.id;

        await db.client
            .from('usuarios')
            .update({ licenca: chave, plano: resultado.plano.id })
            .eq('id', this.usuarioAtual.id);

        this.planoAtual = resultado.plano;
        return { sucesso: true, plano: resultado.plano };
    }

    async logout() {
        this.usuarioAtual = null;
        this.planoAtual = null;
        this.usoMes = null;
        db.setUsuarioId(null);
        await db.client.auth.signOut();
    }

    async verificarSessao() {
        const { data: { session } } = await db.client.auth.getSession();
        if (!session) return false;

        db.setUsuarioId(session.user.id);

        const { data: perfil } = await db.client
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!perfil) return false;

        this.usuarioAtual = { id: perfil.id, ...perfil };

        if (perfil.licenca) {
            const resultado = await this.validarChave(perfil.licenca);
            if (resultado.valido) this.planoAtual = resultado.plano;
            else this.planoAtual = PLANOS.GRATUITO;
        } else {
            this.planoAtual = PLANOS.GRATUITO;
        }

        await this.carregarUso();
        return true;
    }

    getPlanoInfo() {
        if (!this.planoAtual) return PLANOS.GRATUITO;
        return this.planoAtual;
    }

    getUso() {
        return this.usoMes;
    }

    async ativarChave(chave) {
        const result = await this.ativarPlano(chave);
        return result.sucesso;
    }

    async salvarUsuario(usuario) {
        const { id, ...rest } = usuario;
        await db.client
            .from('usuarios')
            .update(rest)
            .eq('id', id);
        this.usuarioAtual = usuario;
    }

    get licensaAtual() {
        return this.usuarioAtual ? this.usuarioAtual.licenca : null;
    }

    _traduzirErro(msg) {
        if (msg.includes('Invalid login')) return 'Email ou senha incorretos';
        if (msg.includes('already registered')) return 'Email ja cadastrado';
        if (msg.includes('Password')) return 'Senha deve ter no minimo 6 caracteres';
        return msg;
    }
}

const license = new LicenseManager();
