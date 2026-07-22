/**
 * Gerenciamento do Banco de Dados Local (IndexedDB)
 * Sistema de persistência para o SaaS Terrenos
 */

const DB_NAME = 'TerrenosSaaS';
const DB_VERSION = 2;

class LocalDatabase {
    constructor() {
        this.db = null;
        this.isReady = false;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.isReady = true;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store: Usuários
                if (!db.objectStoreNames.contains('usuarios')) {
                    const usuarios = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
                    usuarios.createIndex('email', 'email', { unique: true });
                    usuarios.createIndex('licenca', 'licenca', { unique: false });
                }

                // Store: Terrenos
                if (!db.objectStoreNames.contains('terrenos')) {
                    const terrenos = db.createObjectStore('terrenos', { keyPath: 'id', autoIncrement: true });
                    terrenos.createIndex('logradouro', 'logradouro', { unique: false });
                    terrenos.createIndex('cidade', 'cidade', { unique: false });
                    terrenos.createIndex('uf', 'uf', { unique: false });
                    terrenos.createIndex('cep', 'cep', { unique: false });
                    terrenos.createIndex('matricula', 'matricula', { unique: true });
                }

                // Store: Projetos
                if (!db.objectStoreNames.contains('projetos')) {
                    const projetos = db.createObjectStore('projetos', { keyPath: 'id', autoIncrement: true });
                    projetos.createIndex('terrenoId', 'terrenoId', { unique: false });
                    projetos.createIndex('nome', 'nome', { unique: false });
                    projetos.createIndex('status', 'status', { unique: false });
                }

                // Store: Análises
                if (!db.objectStoreNames.contains('analises')) {
                    const analises = db.createObjectStore('analises', { keyPath: 'id', autoIncrement: true });
                    analises.createIndex('terrenoId', 'terrenoId', { unique: false });
                    analises.createIndex('tipo', 'tipo', { unique: false });
                    analises.createIndex('dataAnalise', 'dataAnalise', { unique: false });
                }

                // Store: Licenças
                if (!db.objectStoreNames.contains('licencas')) {
                    const licencas = db.createObjectStore('licencas', { keyPath: 'id', autoIncrement: true });
                    licencas.createIndex('chave', 'chave', { unique: true });
                    licencas.createIndex('usuarioId', 'usuarioId', { unique: false });
                }

                // Store: Uso (controle de quota)
                if (!db.objectStoreNames.contains('uso')) {
                    const uso = db.createObjectStore('uso', { keyPath: 'id', autoIncrement: true });
                    uso.createIndex('usuarioId', 'usuarioId', { unique: false });
                    uso.createIndex('periodo', 'periodo', { unique: false });
                }

                // Store: Histórico
                if (!db.objectStoreNames.contains('historico')) {
                    const historico = db.createObjectStore('historico', { keyPath: 'id', autoIncrement: true });
                    historico.createIndex('terrenoId', 'terrenoId', { unique: false });
                    historico.createIndex('tipo', 'tipo', { unique: false });
                    historico.createIndex('criadoEm', 'criadoEm', { unique: false });
                }

                // Store: Configurações
                if (!db.objectStoreNames.contains('configuracoes')) {
                    db.createObjectStore('configuracoes', { keyPath: 'chave' });
                }
            };
        });
    }

    // CRUD Genérico
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.add({ ...data, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put({ ...data, atualizadoEm: new Date().toISOString() });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async count(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async search(storeName, searchTerm, fields) {
        const allItems = await this.getAll(storeName);
        const term = searchTerm.toLowerCase();
        return allItems.filter(item =>
            fields.some(field =>
                item[field] && item[field].toString().toLowerCase().includes(term)
            )
        );
    }

    // Backup/Export
    async exportData() {
        const data = {};
        const storeNames = Array.from(this.db.objectStoreNames);
        for (const storeName of storeNames) {
            data[storeName] = await this.getAll(storeName);
        }
        return data;
    }

    async importData(data) {
        for (const [storeName, items] of Object.entries(data)) {
            for (const item of items) {
                await this.update(storeName, item);
            }
        }
    }
}

// Instância global
const db = new LocalDatabase();
