import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(import.meta.dirname, '../../.env') });
dotenv.config();

import { ChatOpenRouter } from '@langchain/openrouter';

const model = new ChatOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    temperature: 0.2,   // more stable response
    maxTokens: 400,     // limit cost and length
    maxRetries: 1,
    timeout: 30000
});

export default model;