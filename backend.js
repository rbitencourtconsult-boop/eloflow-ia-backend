/**
 * 🧠 BACKEND DA IA - EloFlow
 * 
 * Este arquivo deve rodar no seu servidor (apprub.com.br)
 * 
 * INSTALAÇÃO:
 * 1. npm install express cors body-parser dotenv
 * 2. node backend.js
 * 3. PM2: pm2 start backend.js --name "eloflow-ia"
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ MIDDLEWARE
app.use(cors({
    origin: [
        'https://apprub.com.br',
        'http://localhost:3000',
        'http://localhost:5000'
    ],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());

// ✅ IMPORTAR MÓDULOS DE IA
// Nota: Estes arquivos devem estar em: ./modules/
let PatternDetector = null;
let InterventionSuggester = null;

// Tentar importar módulos (se existirem)
try {
    PatternDetector = require('./modules/patternDetector.js');
    console.log('✅ PatternDetector carregado');
} catch (e) {
    console.warn('⚠️ PatternDetector não encontrado, usando fallback');
}

try {
    InterventionSuggester = require('./modules/interventionSuggester.js');
    console.log('✅ InterventionSuggester carregado');
} catch (e) {
    console.warn('⚠️ InterventionSuggester não encontrado, usando fallback');
}

// ✅ INICIALIZAR MÓDULOS
let patternDetector = null;
let interventionSuggester = null;

if (PatternDetector) {
    patternDetector = new PatternDetector();
}

if (InterventionSuggester) {
    interventionSuggester = new InterventionSuggester();
}

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        modules: {
            patternDetector: !!patternDetector,
            interventionSuggester: !!interventionSuggester
        }
    });
});

// ✅ ENDPOINT PRINCIPAL DE ANÁLISE
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, userId, timestamp } = req.body;

        // Validação
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Texto vazio para análise'
            });
        }

        console.log(`🧠 [${new Date().toLocaleTimeString()}] Analisando de ${userId}...`);

        // 1. DETECTAR PADRÕES
        let patterns = [];
        if (patternDetector && patternDetector.detect) {
            try {
                patterns = patternDetector.detect(text);
                console.log(`   ✅ ${patterns.length} padrões`);
            } catch (e) {
                console.warn(`   ⚠️ Erro em detectar padrões: ${e.message}`);
            }
        }

        // 2. SUGERIR INTERVENÇÕES
        let interventions = [];
        if (interventionSuggester && interventionSuggester.suggest) {
            try {
                interventions = interventionSuggester.suggest(patterns);
                console.log(`   ✅ ${interventions.length} intervenções`);
            } catch (e) {
                console.warn(`   ⚠️ Erro em sugerir: ${e.message}`);
            }
        }

        // 3. EXTRAIR EMOÇÕES
        const emotions = extractEmotions(text);
        console.log(`   ✅ Emoções: ${emotions.join(', ')}`);

        // 4. GERAR SÍNTESE
        const summary = generateSummary(text);

        // 5. EXTRAIR TEMAS
        const themes = extractThemes(text);
        console.log(`   ✅ ${themes.length} temas`);

        // 6. GERAR PLANO DE AÇÃO
        const actionPlan = generateActionPlan(patterns, interventions);

        // ✅ RESPONDER COM ANÁLISE COMPLETA
        res.json({
            success: true,
            analysis: {
                summary: summary,
                emotions: emotions,
                patterns: patterns.slice(0, 10), // Top 10
                interventions: interventions.slice(0, 10), // Top 10
                themes: themes,
                actionPlan: actionPlan,
                timestamp: new Date().toISOString(),
                userId: userId,
                source: 'eloflow-server'
            }
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ✅ FUNÇÕES AUXILIARES

/**
 * Extrai emoções do texto
 */
function extractEmotions(text) {
    const emotionKeywords = {
        'Alegria': ['feliz', 'alegre', 'animado', 'confortável', 'melhorado', 'bem', 'ótimo'],
        'Tristeza': ['triste', 'deprimido', 'desanimado', 'vazio', 'melancolia', 'sofrimento'],
        'Medo': ['medo', 'assustado', 'nervoso', 'pânico', 'aterrorizado', 'aprehensivo'],
        'Raiva': ['raiva', 'furioso', 'irritado', 'frustrado', 'exasperado', 'indignado'],
        'Ansiedade': ['ansioso', 'preocupado', 'tenso', 'angustiado', 'inquieto', 'angústia'],
        'Culpa': ['culpado', 'arrependido', 'envergonhado', 'constrangido', 'culpabilidade'],
        'Esperança': ['esperança', 'otimista', 'positivo', 'promissor', 'esperançoso']
    };

    const detected = [];
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            detected.push(emotion);
        }
    }

    return detected.length > 0 ? detected : ['Neutro'];
}

/**
 * Gera síntese do texto
 */
function generateSummary(text) {
    // Estratégia: pegar primeiras frases importantes
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) {
        return text.substring(0, 200) + '...';
    }

    // Juntar primeiras 3 frases
    let summary = sentences.slice(0, 3).join(' ').trim();
    
    // Limitar a 256 caracteres
    if (summary.length > 256) {
        summary = summary.substring(0, 256) + '...';
    }

    return summary;
}

/**
 * Extrai temas do texto
 */
function extractThemes(text) {
    const themes = [];
    const themeKeywords = {
        'Relacionamento': ['relacionamento', 'parceiro', 'cônjuge', 'família', 'mãe', 'pai', 'mãe', 'filho', 'esposa'],
        'Trabalho': ['trabalho', 'chefe', 'empresa', 'carreira', 'emprego', 'profissão', 'boss', 'cliente'],
        'Saúde': ['saúde', 'doença', 'médico', 'hospital', 'sintoma', 'físico', 'dor', 'medicamento'],
        'Autoestima': ['autoestima', 'autoimagem', 'confiança', 'valor pessoal', 'insegurança'],
        'Ansiedade': ['ansiedade', 'preocupação', 'medo', 'pânico', 'antecipar'],
        'Depressão': ['depressão', 'tristeza', 'vazio', 'desesperança', 'sem esperança'],
        'Sono': ['sono', 'insônia', 'dormir', 'repouso', 'cansaço'],
        'Alimentação': ['comida', 'alimentação', 'dieta', 'peso', 'nutrição'],
        'Finanças': ['dinheiro', 'financeira', 'débito', 'crédito', 'economia', 'renda']
    };

    const lowerText = text.toLowerCase();

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            themes.push(theme);
        }
    }

    // Remover duplicatas
    return [...new Set(themes)];
}

/**
 * Gera plano de ação
 */
function generateActionPlan(patterns, interventions) {
    const plan = [];

    // Se temos intervenções sugeridas
    if (interventions && interventions.length > 0) {
        interventions.slice(0, 5).forEach((intervention, index) => {
            const interventionName = typeof intervention === 'string' 
                ? intervention 
                : (intervention.name || String(intervention));

            plan.push({
                step: index + 1,
                action: interventionName,
                description: `Implementar: ${interventionName}`,
                priority: index === 0 ? 'Alta' : 'Média'
            });
        });
    }

    // Se temos padrões detectados
    if (patterns && patterns.length > 0 && plan.length < 5) {
        patterns.slice(0, 5 - plan.length).forEach((pattern, index) => {
            const patternName = typeof pattern === 'string' 
                ? pattern 
                : (pattern.name || String(pattern));

            plan.push({
                step: plan.length + 1,
                action: `Abordar padrão: ${patternName}`,
                description: `Trabalhar especificamente este padrão`,
                priority: 'Média'
            });
        });
    }

    // Se não temos nada, retornar plano genérico
    if (plan.length === 0) {
        plan.push({
            step: 1,
            action: 'Análise Inicial',
            description: 'Fazer análise mais profunda na próxima sessão',
            priority: 'Alta'
        });
    }

    return plan;
}

// ✅ INICIAR SERVIDOR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          🧠 BACKEND DE IA - EloFlow                       ║
║                                                            ║
║  Servidor rodando em: http://localhost:${PORT}           
║  Health Check: http://localhost:${PORT}/health
║  API de Análise: POST http://localhost:${PORT}/api/analyze
║                                                            ║
║  Proxy Nginx: https://apprub.com.br/api/analyze
╚════════════════════════════════════════════════════════════╝
    `);

    console.log('✅ Pronto para receber requisições!');
    if (!patternDetector || !interventionSuggester) {
        console.warn('⚠️ Aviso: Alguns módulos não estão carregados');
    }
});

// ✅ GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
    console.log('🛑 Encerrando servidor...');
    process.exit(0);
});



