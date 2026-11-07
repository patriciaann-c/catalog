import { Router } from 'express';
import { HumanMessage, AIMessage } from 'langchain';
import agentProxy from '../AI/agents/proxy.js';
import createCatalogPromptAgent from '../AI/agents/catalogPrompt.js';

const router = Router();
const MAX_MESSAGES = 20;
const MAX_CONTENT = 2000;


function toLangChainMessages(messages) {
    return messages.map((message) =>
        message.role === 'user'
            ? new HumanMessage(message.content)
            : new AIMessage(message.content)
    );
}
function isValidConversation(messages) {
    return Array.isArray(messages)
        && messages.length > 0
        && messages.length <= MAX_MESSAGES
        && messages.every((message) =>
            ['user', 'assistant'].includes(message?.role)
            && typeof message.content === 'string'
            && message.content.trim() !== ''
            && message.content.length <= MAX_CONTENT
        )
        && messages.at(-1).role === 'user';
}
router.post('/chat', async (req, res) => {
    const { messages } = req.body ?? {};
    if (!isValidConversation(messages)) {
        return res.status(400).json({
            success: false,
            message: 'Messages needs to have a list of {role, content} that ends with a message user',
            data: null
        });
    }
    try {
        const agent = await createCatalogPromptAgent();
        const response = await agent.invoke({
            messages: toLangChainMessages(messages)
        });
        const last = response.messages.at(-1);
        console.log(last?.usage_metadata);
        res.json({
            success: true,
            message: '',
            data: { reply: last?.content }
        });
    } catch (err) {
        console.error(err);
        res.status(502).json({
            success: false,
            message: `Ai service not available, try again later.
            Error of the server: ${err.message}`,
            data: null
        });
    }
});
export default router;