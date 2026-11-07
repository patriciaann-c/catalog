import 'dotenv/config'
import { createAgent } from 'langchain';
import openrouterModel from '../models/openrouter.js'

const agent = createAgent({
    model: openrouterModel,
    tools: [],
    systemPrompt: "Sei un assistente disponibile e sintetico"
});

export default agent;