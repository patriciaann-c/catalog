import 'dotenv/config'
import { createAgent } from 'langchain';
import openrouterModel from '../models/openrouter.js'

const agentProxy = createAgent({
    model: openrouterModel,
    tools: [],
    systemPrompt: "Sei un assistente disponibile e sintetico. Rispondi in inglese"
});

export default agentProxy;