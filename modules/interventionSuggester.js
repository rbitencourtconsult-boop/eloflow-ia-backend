/**
 * InterventionSuggester
 * ---------------------
 * Sugere intervenções terapêuticas com base nos padrões detectados.
 * Compatível com o backend Express (`backend.js`).
 */

const DEFAULT_INTERVENTIONS = {
    // ===== ANSIEDADE =====
    anxiety: [
        { name: 'Respiração Diafragmática (4-7-8)', category: 'breathing', duration: 5, evidence: 'High', description: 'Ativa o sistema parassimpático para reduzir a ansiedade.' },
        { name: 'Relaxamento Muscular Progressivo', category: 'relaxation', duration: 15, evidence: 'High', description: 'Alternar contração e relaxamento de grupos musculares.' },
        { name: 'Meditação Mindfulness', category: 'meditation', duration: 10, evidence: 'High', description: 'Observação não-julgamental de pensamentos e sensações.' },
        { name: 'Reestruturação Cognitiva', category: 'cognitive', duration: 20, evidence: 'High', description: 'Identificar e desafiar pensamentos ansiogênicos.' },
        { name: 'Exposição Gradual', category: 'exposure', duration: 30, evidence: 'High', description: 'Enfrentar estímulos ansiosos de forma progressiva.' }
    ],
    generalized_anxiety: [
        { name: 'Período Controlado de Preocupação', category: 'cognitive', duration: 20, evidence: 'High', description: 'Designar um horário fixo para processar preocupações.' },
        { name: 'Aceitação e Compromisso (ACT)', category: 'acceptance', duration: 25, evidence: 'High', description: 'Aceitar pensamentos enquanto age de acordo com valores.' },
        { name: 'Monitoramento de Preocupações', category: 'behavioral', duration: 15, evidence: 'Medium', description: 'Registrar padrões de preocupação em diário.' }
    ],
    panic_disorder: [
        { name: 'Exposição Interoceptiva', category: 'exposure', duration: 30, evidence: 'High', description: 'Reproduzir sensações de pânico para dessensibilização.' },
        { name: 'Respiração Controlada', category: 'breathing', duration: 10, evidence: 'High', description: 'Manter respiração lenta para prevenir hiperventilação.' },
        { name: 'Prevenção de Fuga', category: 'behavioral', duration: 25, evidence: 'High', description: 'Resistir ao impulso de escapar durante episódios.' }
    ],
    social_anxiety: [
        { name: 'Exposição Social Gradual', category: 'exposure', duration: 40, evidence: 'High', description: 'Participar de situações sociais hierarquizadas.' },
        { name: 'Experimentos Comportamentais', category: 'behavioral', duration: 30, evidence: 'High', description: 'Testar hipóteses sobre julgamento social.' }
    ],
    ocd: [
        { name: 'Exposição e Prevenção de Resposta (ERP)', category: 'exposure', duration: 45, evidence: 'Highest', description: 'Expor-se a obsessões sem executar compulsões.' },
        { name: 'Tolerância à Incerteza', category: 'acceptance', duration: 20, evidence: 'High', description: 'Construir flexibilidade diante da dúvida.' }
    ],

    // ===== DEPRESSÃO =====
    depression: [
        { name: 'Ativação Comportamental', category: 'behavioral', duration: 25, evidence: 'High', description: 'Planejar atividades significativas e prazerosas.' },
        { name: 'Reestruturação Cognitiva', category: 'cognitive', duration: 20, evidence: 'High', description: 'Desafiar pensamentos automáticos negativos.' },
        { name: 'Plano de Auto-Cuidado', category: 'behavioral', duration: 15, evidence: 'Medium', description: 'Rotina básica de sono, alimentação e movimento.' }
    ],
    major_depressive: [
        { name: 'Triagem de Risco de Suicídio', category: 'crisis', duration: 30, evidence: 'Highest', description: 'Avaliar segurança, ideação, plano e intenção.' },
        { name: 'Planejamento de Atividades', category: 'behavioral', duration: 20, evidence: 'High', description: 'Estruturar tarefas com reforço positivo.' }
    ],
    seasonal_affective: [
        { name: 'Terapia de Luz Brilhante', category: 'medical', duration: 30, evidence: 'High', description: 'Exposição a 10k lux pela manhã.' }
    ],

    // ===== TRAUMA =====
    trauma: [
        { name: 'EMDR', category: 'trauma', duration: 60, evidence: 'Highest', description: 'Dessensibilização e reprocesamento por movimentos oculares.' },
        { name: 'Grounding Sensorial 5-4-3-2-1', category: 'grounding', duration: 5, evidence: 'High', description: 'Usar sentidos para ancorar no presente.' },
        { name: 'Narrativa Traumática Segura', category: 'cognitive', duration: 45, evidence: 'High', description: 'Construir narrativa integrada do evento.' }
    ],
    ptsd: [
        { name: 'Exposição Prolongada (PE)', category: 'exposure', duration: 60, evidence: 'Highest', description: 'Revisitação estruturada de memórias traumáticas.' },
        { name: 'Plano de Segurança para Pesadelos', category: 'cognitive', duration: 30, evidence: 'High', description: 'Técnicas para redefinir enredos de pesadelos.' }
    ],
    dissociation: [
        { name: 'Técnicas de Reorientação Sensorial', category: 'grounding', duration: 10, evidence: 'High', description: 'Aplicar estímulos físicos seguros para retornar ao corpo.' },
        { name: 'Contato com Realidade', category: 'grounding', duration: 5, evidence: 'Medium', description: 'Usar temperatura, textura ou movimento para ancoragem.' }
    ],

    // ===== RELACIONAMENTOS =====
    relationships: [
        { name: 'Comunicação Não Violenta', category: 'communication', duration: 25, evidence: 'High', description: 'Expressar necessidades por meio de observação, sentimentos e pedidos.' },
        { name: 'Escuta Ativa', category: 'communication', duration: 20, evidence: 'High', description: 'Validar e refletir sentimentos do outro.' },
        { name: 'Estabelecimento de Limites', category: 'boundary', duration: 20, evidence: 'High', description: 'Definir e comunicar limites saudáveis.' }
    ],
    attachment_issues: [
        { name: 'Terapia Baseada em Apego', category: 'attachment', duration: 60, evidence: 'High', description: 'Explorar padrões de apego e reconstruir segurança.' },
        { name: 'Auto-Compaixão Dirigida', category: 'cognitive', duration: 15, evidence: 'Medium', description: 'Prática de reparentalização interna.' }
    ],
    interpersonal_conflict: [
        { name: 'Terapia Interpessoal (IPT)', category: 'interpersonal', duration: 50, evidence: 'High', description: 'Estratégias estruturadas de resolução de conflitos.' },
        { name: 'Negociação Integrativa', category: 'communication', duration: 30, evidence: 'Medium', description: 'Buscar soluções de ganho mútuo.' }
    ],

    // ===== AUTOESTIMA E IDENTIDADE =====
    self_esteem: [
        { name: 'Auto-Compaixão (Kristen Neff)', category: 'mindfulness', duration: 15, evidence: 'High', description: 'Praticar gentileza consigo mesmo.' },
        { name: 'Mapeamento de Forças', category: 'positive', duration: 20, evidence: 'High', description: 'Identificar e usar pontos fortes pessoais.' }
    ],
    perfectionism: [
        { name: 'Exposição ao Erro', category: 'exposure', duration: 30, evidence: 'High', description: 'Praticar entregas deliberadamente imperfeitas.' },
        { name: 'ACT para Flexibilidade', category: 'acceptance', duration: 25, evidence: 'High', description: 'Trabalhar aceitação de falhas inevitáveis.' }
    ],
    imposter_syndrome: [
        { name: 'Teste de Realidade', category: 'cognitive', duration: 25, evidence: 'High', description: 'Confrontar crenças de fraude com dados.' },
        { name: 'Linha do Tempo de Conquistas', category: 'cognitive', duration: 30, evidence: 'High', description: 'Mapear esforços e resultados genuínos.' }
    ],

    // ===== ALIMENTAÇÃO =====
    eating_disorder: [
        { name: 'Terapia Familiar (FBT)', category: 'family', duration: 60, evidence: 'Highest', description: 'Envolver família no restabelecimento nutricional.' },
        { name: 'Aceitação de Imagem Corporal', category: 'acceptance', duration: 20, evidence: 'High', description: 'Promover convivência com o próprio corpo.' }
    ],
    body_image: [
        { name: 'Mindfulness Corporal', category: 'mindfulness', duration: 20, evidence: 'Medium', description: 'Meditação focada em sensações físicas sem julgamento.' }
    ],

    // ===== SUBSTÂNCIAS =====
    addiction: [
        { name: 'Entrevista Motivacional', category: 'motivational', duration: 35, evidence: 'High', description: 'Explorar ambivalência e reforçar motivos intrínsecos.' },
        { name: 'Plano de Prevenção de Recaída', category: 'behavioral', duration: 30, evidence: 'High', description: 'Identificar gatilhos e estratégias de enfrentamento.' }
    ],
    substance_abuse: [
        { name: '12 Passos / SMART Recovery', category: 'support', duration: 60, evidence: 'High', description: 'Suporte estruturado contínuo.' }
    ],

    // ===== SONO =====
    insomnia: [
        { name: 'Restrição de Sono (TCC-I)', category: 'behavioral', duration: 0, evidence: 'Highest', description: 'Ajustar tempo de cama ao sono real.' },
        { name: 'Higiene do Sono', category: 'behavioral', duration: 30, evidence: 'High', description: 'Ambiente, rotina e estímulos adequados para sono.' },
        { name: 'Relaxamento Progressivo', category: 'relaxation', duration: 20, evidence: 'High', description: 'Sequência corporal para induzir sono.' }
    ],

    // ===== COMPORTAMENTO =====
    anger_management: [
        { name: 'Técnica STOP (DBT)', category: 'emotion', duration: 5, evidence: 'High', description: 'Parar, respirar, observar e prosseguir conscientemente.' },
        { name: 'Identificação de Gatilhos', category: 'behavioral', duration: 20, evidence: 'High', description: 'Mapear antecedentes emocionais e situacionais.' }
    ],
    self_harm: [
        { name: 'DBT Skills (TIPP)', category: 'emotion', duration: 5, evidence: 'High', description: 'Técnicas intensivas para regular impulsos.' },
        { name: 'Plano de Segurança Colaborativo', category: 'crisis', duration: 30, evidence: 'Highest', description: 'Lista de estratégias e contatos de emergência.' }
    ],
    suicidality: [
        { name: 'Triagem Estruturada de Risco', category: 'crisis', duration: 20, evidence: 'Highest', description: 'Avaliar severidade e necessidade de intervenção imediata.' },
        { name: 'Plano de Segurança', category: 'crisis', duration: 30, evidence: 'High', description: 'Identificar sinais de alerta, coping e suporte.' }
    ],

    // ===== MINDFULNESS BASE =====
    mindfulness_base: [
        { name: 'Body Scan', category: 'meditation', duration: 20, evidence: 'High', description: 'Varredura corporal consciente, observando sensações.' },
        { name: 'Meditação Aberta', category: 'meditation', duration: 15, evidence: 'High', description: 'Observar pensamentos e emoções como eventos transitórios.' },
        { name: 'Caminhada Mindful', category: 'meditation', duration: 20, evidence: 'Medium', description: 'Focar atenção plena no movimento ao caminhar.' }
    ]
};

class InterventionSuggester {
    constructor(options = {}) {
        this.interventions = {
            ...DEFAULT_INTERVENTIONS,
            ...(options.additionalInterventions || {})
        };
    }

    /**
     * Sugere intervenções com base nos padrões detectados.
     */
    suggest(patterns = [], limit = 10) {
        const normalized = Array.isArray(patterns) ? patterns : [];
        const suggestions = [];

        normalized.forEach(pattern => {
            const patternName = this.#resolvePatternName(pattern);
            if (!patternName) return;

            const interventions = this.interventions[patternName];
            if (!interventions || interventions.length === 0) return;

            interventions.forEach(intervention => {
                suggestions.push({
                    ...intervention,
                    pattern: patternName,
                    priority: this.#calculatePriority(pattern)
                });
            });
        });

        suggestions.sort((a, b) => b.priority - a.priority);
        return suggestions.slice(0, limit);
    }

    /**
     * Retorna plano semanal de intervenções (7 dias por padrão).
     */
    buildWeeklyPlan(patterns = [], days = 7) {
        const base = this.suggest(patterns, days * 2);
        const plan = {};

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const key = date.toISOString().split('T')[0];

            const daily = base.slice(i, i + 2);
            plan[key] = {
                interventions: daily,
                totalDuration: daily.reduce((sum, item) => sum + (item.duration || 0), 0)
            };
        }

        return plan;
    }

    /**
     * Permite registrar novas intervenções ou sobrescrever existentes.
     */
    mergeInterventions(interventionMap = {}) {
        Object.entries(interventionMap).forEach(([pattern, list]) => {
            if (!Array.isArray(list)) return;
            this.interventions[pattern] = [...(this.interventions[pattern] || []), ...list];
        });
    }

    /**
     * Retorna intervenções por categoria.
     */
    getByCategory(category) {
        const result = [];
        Object.values(this.interventions).forEach(list => {
            list.forEach(intervention => {
                if (intervention.category === category) {
                    result.push(intervention);
                }
            });
        });
        return result;
    }

    /**
     * Resolve o nome do padrão a partir de diferentes formatos.
     */
    #resolvePatternName(pattern) {
        if (!pattern) return null;
        if (typeof pattern === 'string') return pattern;
        if (typeof pattern === 'object' && pattern.name) return pattern.name;
        return null;
    }

    /**
     * Calcula prioridade com fallback seguro.
     */
    #calculatePriority(pattern) {
        if (!pattern || typeof pattern !== 'object') return 50;

        const score = typeof pattern.score === 'number' ? pattern.score : 50;
        const weight = typeof pattern.weight === 'number' ? pattern.weight : 1;
        return Math.round(score * weight);
    }
}

module.exports = InterventionSuggester;

