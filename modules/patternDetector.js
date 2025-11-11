/**
 * PatternDetector
 * ---------------
 * Módulo Node.js para detecção de padrões clínicos no backend.
 * Esta versão é compatível com o servidor Express (`backend.js`) e
 * reaproveita a mesma base de conhecimento utilizada no frontend.
 */

const DEFAULT_PATTERNS = {
    // TRANSTORNOS DE ANSIEDADE (DSM-5)
    anxiety: {
        keywords: ['ansiedade', 'nervoso', 'preocupação', 'medo', 'pânico', 'tenso', 'inquietação', 'tremor', 'suores', 'aceleração cardíaca', 'formigamento', 'angústia'],
        weight: 1.0,
        framework: 'CBT',
        severity_indicators: ['pânico', 'ataque de pânico', 'desmaio', 'morte iminente']
    },
    generalized_anxiety: {
        keywords: ['preocupação excessiva', 'ansiedade generalizada', 'tag', 'transtorno de ansiedade', 'incontrolável', 'persistente', 'crônica'],
        weight: 1.1,
        framework: 'CBT/Mindfulness',
        duration: '6+ meses'
    },
    panic_disorder: {
        keywords: ['ataque de pânico', 'pânico', 'medo de morrer', 'desespero', 'falta de ar', 'peito apertado', 'tontura', 'despersonalização'],
        weight: 1.3,
        framework: 'Exposure Therapy',
        requires_medical_clearance: true
    },
    social_anxiety: {
        keywords: ['fobia social', 'ansiedade social', 'envergonhar', 'humilhação', 'julgamento', 'público', 'apresentar', 'multidão'],
        weight: 1.0,
        framework: 'Exposure/Cognitive'
    },
    phobias: {
        keywords: ['fobia', 'medo', 'pavor', 'evitação', 'pânico com', 'altura', 'animal', 'sangue', 'injeção', 'agulha', 'elevador'],
        weight: 1.0,
        framework: 'Systematic Desensitization'
    },
    ocd: {
        keywords: ['obsessão', 'compulsão', 'pensamento intrusivo', 'toc', 'rituais', 'limpeza', 'verificação', 'ordem', 'simetria', 'contaminação'],
        weight: 1.2,
        framework: 'ERP (Exposure/Response Prevention)',
        medical_condition: true
    },

    // TRANSTORNOS DEPRESSIVOS (DSM-5)
    depression: {
        keywords: ['depressão', 'triste', 'vazio', 'sem esperança', 'isolado', 'cansado', 'desesperado', 'desânimo', 'desespero', 'miserável', 'inútil'],
        weight: 1.0,
        framework: 'CBT/Behavioral Activation',
        severity_indicators: ['suicida', 'morte', 'autolesão']
    },
    major_depressive: {
        keywords: ['depressão maior', 'distimia', 'anergia', 'anedonia', 'concentração', 'culpa', 'worthlessness', 'ralentização', 'psychomotor'],
        weight: 1.2,
        framework: 'CBT/Antidepressants',
        duration: '2+ semanas',
        requires_psychiatric_evaluation: true
    },
    seasonal_affective: {
        keywords: ['depressão sazonal', 'inverno', 'tristeza', 'luz', 'estação', 'escuridão', 'hibernação'],
        weight: 0.9,
        framework: 'Light Therapy'
    },
    bipolar_spectrum: {
        keywords: ['maníaco', 'bipolar', 'euforia', 'irritabilidade', 'energia excessiva', 'fuga de ideias', 'grandiosidade', 'higiene', 'gasto impulsivo'],
        weight: 1.3,
        framework: 'Medication Management',
        requires_psychiatrist: true
    },

    // TRANSTORNOS RELACIONADOS A TRAUMA
    ptsd: {
        keywords: ['ptsd', 'tept', 'pós-traumático', 'flashback', 'pesadelo', 'hipervigilância', 'sobressalto', 'reexperiência', 'evitação'],
        weight: 1.3,
        framework: 'EMDR/Trauma-Focused CBT',
        requires_trauma_specialist: true
    },
    trauma: {
        keywords: ['trauma', 'abuso', 'violência', 'assalto', 'acidente', 'morte', 'perda repentina', 'choque', 'horror'],
        weight: 1.2,
        framework: 'EMDR/CPT'
    },
    complex_trauma: {
        keywords: ['trauma complexo', 'trauma crônico', 'abuso repetido', 'neglect', 'cptsd', 'múltiplos traumas'],
        weight: 1.4,
        framework: 'Phase-based Treatment',
        duration: 'Longo prazo'
    },
    dissociation: {
        keywords: ['dissociação', 'despersonalização', 'desrealização', 'ausente', 'fora do corpo', 'irreal', 'alheio', 'amnésia', 'fragmentado'],
        weight: 1.2,
        framework: 'Sensorimotor Psychotherapy'
    },

    // PROBLEMAS RELACIONAIS (ICD-11)
    relationships: {
        keywords: ['relacionamento', 'família', 'casal', 'amigos', 'conflito', 'parceiro', 'cônjuge', 'discordância', 'comunicação', 'afeição'],
        weight: 0.8,
        framework: 'Couples Therapy/Family Therapy'
    },
    attachment_issues: {
        keywords: ['apego', 'abandono', 'medo de abandono', 'dependência', 'relacionamento desconfortável', 'segurança', 'vinculação'],
        weight: 0.9,
        framework: 'Attachment-Based Therapy'
    },
    interpersonal_conflict: {
        keywords: ['conflito', 'briga', 'discussão', 'desacordo', 'agressividade', 'hostilidade', 'ressentimento', 'raiva', 'mágoa'],
        weight: 0.9,
        framework: 'IPT/MACT'
    },

    // PROBLEMAS PROFISSIONAIS E OCUPACIONAIS
    work_stress: {
        keywords: ['trabalho', 'emprego', 'carreira', 'chefe', 'profissão', 'desemprego', 'burnout', 'esgotamento', 'sobrecarga', 'pressão profissional'],
        weight: 0.8,
        framework: 'Occupational Therapy'
    },
    burnout: {
        keywords: ['burnout', 'esgotamento profissional', 'exaustão', 'cinismo', 'ineficácia', 'desumanização', 'falta de significado'],
        weight: 1.0,
        framework: 'Stress Management'
    },
    unemployment_crisis: {
        keywords: ['desemprego', 'perda de emprego', 'desempregado', 'sem trabalho', 'crise profissional', 'identidade'],
        weight: 0.9,
        framework: 'Career Counseling'
    },

    // PROBLEMAS DE IDENTIDADE E AUTOESTIMA
    self_esteem: {
        keywords: ['autoestima', 'confiança', 'insegurança', 'valor', 'digno', 'capacidade', 'inadequado', 'inferior', 'rejeição', 'aceitação'],
        weight: 0.9,
        framework: 'CBT/Acceptance'
    },
    perfectionism: {
        keywords: ['perfeccionismo', 'perfeição', 'padrão alto', 'crítica', 'autocrítica', 'falha', 'inadequação', 'impossível'],
        weight: 0.8,
        framework: 'CBT/ACT'
    },
    imposter_syndrome: {
        keywords: ['síndrome do impostor', 'fraude', 'indigno', 'sorte', 'não merecia', 'descobrirão', 'enganador'],
        weight: 0.8,
        framework: 'Cognitive Restructuring'
    },
    identity_issues: {
        keywords: ['identidade', 'quem sou', 'orientação sexual', 'gênero', 'pertencimento', 'confusão identitária', 'autenticidade'],
        weight: 0.9,
        framework: 'Existential Therapy'
    },

    // TRANSTORNOS ALIMENTARES (DSM-5)
    eating_disorder: {
        keywords: ['anorexia', 'bulimia', 'compulsão alimentar', 'dieta extrema', 'peso', 'imagem corporal', 'vômito', 'laxante', 'exercício excessivo'],
        weight: 1.2,
        framework: 'Family-Based Treatment',
        requires_medical_monitoring: true
    },
    body_image: {
        keywords: ['imagem corporal', 'corpo', 'feio', 'gorda', 'magra', 'aparência', 'dismorfismo', 'espelho', 'comparação'],
        weight: 0.9,
        framework: 'CBT/Acceptance'
    },

    // TRANSTORNOS POR USO DE SUBSTÂNCIA
    addiction: {
        keywords: ['vício', 'dependência', 'álcool', 'droga', 'compulsão', 'desejo', 'uso', 'cessação', 'recaída', 'abstinência'],
        weight: 1.1,
        framework: 'Motivational Interviewing',
        requires_medical_detox: true
    },
    substance_abuse: {
        keywords: ['abuso de substância', 'uso prejudicial', 'tolerância', 'síndrome de abstinência', 'problemas legais', 'problemas sociais'],
        weight: 1.1,
        framework: '12-Step/SMART Recovery'
    },
    behavioral_addiction: {
        keywords: ['vício comportamental', 'compulsão', 'jogo', 'internet', 'pornografia', 'compras', 'incontrolável', 'consequências'],
        weight: 1.0,
        framework: 'CBT/Mindfulness'
    },

    // PROBLEMAS DO SONO
    sleep: {
        keywords: ['insônia', 'dormir', 'noite', 'cansaço', 'sono', 'repouso', 'acorda', 'dificuldade', 'qualidade'],
        weight: 0.7,
        framework: 'CBT-I'
    },
    insomnia: {
        keywords: ['insônia', 'insonha', 'não consegue dormir', 'permanece acordado', 'sono superficial', 'interrupção'],
        weight: 0.8,
        framework: 'CBT-I (Cognitive Behavioral Therapy for Insomnia)'
    },
    sleep_apnea: {
        keywords: ['apneia do sono', 'ronco', 'pausa respiratória', 'sufocação', 'despertares', 'cansaço diurno'],
        weight: 1.1,
        framework: 'Medical Management',
        requires_sleep_specialist: true
    },

    // TRANSTORNOS NEURODIVERSOS
    adhd: {
        keywords: ['tdah', 'atenção', 'desatenção', 'hiperatividade', 'impulsividade', 'dificuldade concentração', 'desorganização', 'procrastinação'],
        weight: 1.0,
        framework: 'Behavioral Coaching',
        neurodivergent: true
    },
    autism_spectrum: {
        keywords: ['autismo', 'espectro autista', 'toa', 'comunicação social', 'padrões repetitivos', 'hiperfoco', 'sensibilidade sensorial'],
        weight: 1.0,
        framework: 'Neurodiversity Affirming',
        neurodivergent: true
    },

    // PROBLEMAS SOMÁTICOS E SAÚDE
    health_anxiety: {
        keywords: ['hipocondria', 'ansiedade de saúde', 'preocupação com saúde', 'doença', 'morte', 'sintoma', 'corpo'],
        weight: 1.0,
        framework: 'CBT/Interoceptive'
    },
    chronic_pain: {
        keywords: ['dor crônica', 'dor', 'câncer', 'fibromialgia', 'cefaleia', 'migrânea', 'persistente'],
        weight: 1.0,
        framework: 'Pain Management/Acceptance'
    },

    // PROBLEMAS EXISTENCIAIS E SIGNIFICADO
    existential_concerns: {
        keywords: ['sentido da vida', 'propósito', 'mortalidade', 'morte', 'vazio existencial', 'crise de meia idade', 'significado'],
        weight: 0.8,
        framework: 'Existential Therapy'
    },
    grief_loss: {
        keywords: ['luto', 'morte', 'perda', 'falecimento', 'saudade', 'ausência', 'vazio', 'falta', 'adeus'],
        weight: 0.9,
        framework: 'Grief Counseling'
    },
    life_transitions: {
        keywords: ['mudança', 'transição', 'novo trabalho', 'mudança de casa', 'separação', 'aposentadoria', 'adaptação'],
        weight: 0.7,
        framework: 'Acceptance & Commitment'
    },

    // PROBLEMAS DE COMPORTAMENTO
    anger_management: {
        keywords: ['raiva', 'ira', 'fúria', 'irritabilidade', 'agressivo', 'explosivo', 'controle', 'violência'],
        weight: 1.0,
        framework: 'Anger Management CBT'
    },
    aggression: {
        keywords: ['agressão', 'violência', 'agressivo', 'ataque', 'ferimento', 'ameaça', 'bate', 'agride'],
        weight: 1.2,
        framework: 'Violence Prevention'
    },

    // PROBLEMAS ESPECÍFICOS
    suicidality: {
        keywords: ['suicida', 'suicídio', 'morte', 'morrer', 'fim', 'escapar', 'não aguenta', 'acaba', 'fatal'],
        weight: 1.5,
        framework: 'Crisis Intervention',
        crisis_level: 'CRITICAL',
        requires_hospitalization_assessment: true
    },
    self_harm: {
        keywords: ['autolesão', 'auto-agressão', 'corte', 'machucado', 'queimadura', 'alfinetada', 'dano intencional'],
        weight: 1.3,
        framework: 'Dialectical Behavior Therapy',
        severity_level: 'HIGH'
    }
};

class PatternDetector {
    constructor(options = {}) {
        this.patterns = {
            ...DEFAULT_PATTERNS,
            ...(options.additionalPatterns || {})
        };
    }

    /**
     * Detecta padrões presentes no texto.
     * Retorna uma lista ordenada por prioridade.
     */
    detect(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const content = text.toLowerCase();
        const detected = [];

        for (const [patternName, patternData] of Object.entries(this.patterns)) {
            const matches = this.#countMatches(content, patternData.keywords);
            if (matches === 0) continue;

            const score = Math.min((matches / patternData.keywords.length) * 100, 100);
            const priority = Math.round(score * (patternData.weight || 1));

            detected.push({
                name: patternName,
                score: Math.round(score),
                weight: patternData.weight || 1,
                matches,
                framework: patternData.framework || 'Clinical Review',
                priority,
                metadata: this.#buildMetadata(patternData)
            });
        }

        return detected.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Permite adicionar ou sobrescrever padrões dinamicamente.
     */
    mergePatterns(patternMap = {}) {
        this.patterns = {
            ...this.patterns,
            ...patternMap
        };
    }

    /**
     * Gera alertas clínicos com base em padrões detectados.
     */
    generateClinicalAlerts(patterns = []) {
        const alerts = [];

        patterns.forEach(pattern => {
            const meta = pattern.metadata || {};
            if (meta.requires_psychiatric_evaluation) {
                alerts.push(`⚠️ ${pattern.name}: Requer avaliação psiquiátrica.`);
            }
            if (meta.requires_hospitalization_assessment) {
                alerts.push(`🚨 ${pattern.name}: Avaliar necessidade de internação imediata.`);
            }
            if (meta.crisis_level === 'CRITICAL') {
                alerts.push(`🆘 ${pattern.name}: Situação crítica, seguir protocolo de crise.`);
            }
            if (meta.requires_medical_detox) {
                alerts.push(`⚕️ ${pattern.name}: Avaliar possibilidade de desintoxicação médica.`);
            }
        });

        return [...new Set(alerts)];
    }

    /**
     * Conta ocorrências de palavras-chave no texto.
     */
    #countMatches(text, keywords = []) {
        return keywords.reduce((count, keyword) => {
            if (!keyword) return count;
            const safe = this.#escapeRegex(keyword.trim());
            if (!safe) return count;
            const regex = new RegExp(`\\b${safe}\\b`, 'gi');
            const matches = text.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    }

    /**
     * Normaliza o metadado retornado com o padrão.
     */
    #buildMetadata(patternData = {}) {
        const metadata = {};
        const fields = [
            'severity_indicators',
            'requires_psychiatric_evaluation',
            'requires_hospitalization_assessment',
            'requires_medical_detox',
            'requires_sleep_specialist',
            'requires_medical_clearance',
            'requires_trauma_specialist',
            'medical_condition',
            'neurodivergent',
            'crisis_level',
            'duration'
        ];

        fields.forEach(field => {
            if (field in patternData) {
                metadata[field] = patternData[field];
            }
        });

        return metadata;
    }

    /**
     * Escapa caracteres especiais para o uso seguro em regex.
     */
    #escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

module.exports = PatternDetector;

