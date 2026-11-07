import genericAgent from './AI/agents/generic.js';
import { HumanMessage } from 'langchain';

const response = await genericAgent.invoke({
    messages: [new HumanMessage('Ciao, come stai?')]
});
console.log(response.messages.at(-1).content);