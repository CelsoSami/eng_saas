/**
 * Gerenciamento do Banco de Dados via Supabase
 * Substitui IndexedDB por persistencia na nuvem
 */

const SUPABASE_URL = 'https://ibkvykjjorfbiyokbiys.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IhsDlJn0TryD3svYd5UGIg_zVMlCxmf';

class LocalDatabase {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.usuarioId = null;
    }

    async init() {
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { session } } = await this.client.auth.getSession();
        if (session) {
            this.usuarioId = session.user.id;
        }
        this.isReady = true;
    }

    setUsuarioId(id) {
        this.usuarioId = id;
    }

    async add(storeName, data) {
        const now = new Date().toISOString();
        const record = { ...data, criado_em: now, atualizado_em: now };

        if (storeName !== 'licencas' && storeName !== 'configuracoes' && this.usuarioId) {
            record.usuario_id = this.usuarioId;
        }

        const { data: result, error } = await this.client
            .from(storeName)
            .insert(record)
            .select();

        if (error) throw error;
        return result[0].id;
    }

    async get(storeName, id) {
        const col = this._getPrimaryKey(storeName);
        const { data, error } = await this.client
            .from(storeName)
            .select('*')
            .eq(col, id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async getAll(storeName) {
        let query = this.client.from(storeName).select('*');

        if (storeName !== 'licencas' && storeName !== 'configuracoes' && this.usuarioId) {
            query = query.eq('usuario_id', this.usuarioId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async update(storeName, data) {
        const now = new Date().toISOString();
        const col = this._getPrimaryKey(storeName);
        const id = data.id || data[col];
        const record = { ...data, atualizado_em: now };
        delete record.id;

        const { error } = await this.client
            .from(storeName)
            .update(record)
            .eq(col, id);

        if (error) throw error;
        return id;
    }

    async delete(storeName, id) {
        const col = this._getPrimaryKey(storeName);
        const { error } = await this.client
            .from(storeName)
            .delete()
            .eq(col, id);

        if (error) throw error;
        return true;
    }

    async getByIndex(storeName, indexName, value) {
        let query = this.client.from(storeName).select('*');

        const mapped = this._mapIndex(storeName, indexName);
        query = query.eq(mapped, value);

        if (storeName !== 'licencas' && storeName !== 'configuracoes' && indexName !== 'usuario_id' && this.usuarioId) {
            query = query.eq('usuario_id', this.usuarioId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async count(storeName) {
        let query = this.client.from(storeName).select('*', { count: 'exact', head: true });

        if (storeName !== 'licencas' && storeName !== 'configuracoes' && this.usuarioId) {
            query = query.eq('usuario_id', this.usuarioId);
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    }

    async search(storeName, searchTerm, fields) {
        const allItems = await this.getAll(storeName);
        const term = searchTerm.toLowerCase();
        return allItems.filter(item =>
            fields.some(field => {
                const val = this._mapField(storeName, field);
                return item[val] && item[val].toString().toLowerCase().includes(term);
            })
        );
    }

    async exportData() {
        const storeNames = ['terrenos', 'projetos', 'analises', 'historico', 'uso', 'licencas'];
        const data = {};
        for (const storeName of storeNames) {
            data[storeName] = await this.getAll(storeName);
        }
        return data;
    }

    async importData(data) {
        for (const [storeName, items] of Object.entries(data)) {
            if (storeName.startsWith('_')) continue;
            for (const item of items) {
                const { id, ...rest } = item;
                await this.update(storeName, { id, ...rest });
            }
        }
    }

    _getPrimaryKey(storeName) {
        const map = {
            terrenos: 'id',
            projetos: 'id',
            analises: 'id',
            historico: 'id',
            licencas: 'id',
            uso: 'id',
            configuracoes: 'chave',
            usuarios: 'id'
        };
        return map[storeName] || 'id';
    }

    _mapIndex(storeName, indexName) {
        const map = {
            email: 'email',
            licenca: 'licenca',
            logradouro: 'logradouro',
            cidade: 'cidade',
            uf: 'uf',
            cep: 'cep',
            matricula: 'matricula',
            terrenoId: 'terreno_id',
            terreno_id: 'terreno_id',
            nome: 'nome',
            status: 'status',
            tipo: 'tipo',
            dataAnalise: 'data_analise',
            chave: 'chave',
            usuarioId: 'usuario_id',
            usuario_id: 'usuario_id',
            periodo: 'periodo'
        };
        return map[indexName] || indexName;
    }

    _mapField(storeName, field) {
        const map = {
            logradouro: 'logradouro',
            cidade: 'cidade',
            uf: 'uf',
            cep: 'cep',
            matricula: 'matricula',
            zona: 'zona',
            terrenoId: 'terreno_id'
        };
        return map[field] || field;
    }
}

const db = new LocalDatabase();
