import express from 'express';
import { pipeline, env } from '@xenova/transformers';

// CONFIGURAÇÃO CRÍTICA PARA O RENDER:
// Desativa o cache no sistema de arquivos local para poupar a memória do container
env.allowLocalModels = false; 

const app = express();
app.use(express.json());

let translator = null;

// Inicializa o modelo assim que o servidor liga
async function initModel() {
    console.log("Carregando o modelo T5-Small (60MB)...");
    try {
        // Usamos 'translation_pt_to_en' com o t5-small adaptado
        translator = await pipeline('translation_pt_to_en', 'Xenova/t5-small');
        console.log("Modelo carregado com sucesso! Pronto para traduzir.");
    } catch (err) {
        console.error("Erro crítico ao carregar o modelo:", err);
    }
}

initModel();

// Rota estilo API da Yandex
app.post('/translate', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "O campo 'text' é obrigatório." });
    }

    if (!translator) {
        return res.status(503).json({ error: "O motor de tradução ainda está inicializando." });
    }

    try {
        // O T5 precisa que você indique o que quer no prompt interno
        const response = await translator(text);
        
        return res.json({
            original: text,
            translation: response[0].translation_text
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Ghost-Yandex rodando na porta ${PORT}`);
});
