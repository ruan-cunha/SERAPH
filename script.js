const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

let lastUserMessage = '';
let lastBotResponse = '';

function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.classList.add('message', 'bot', 'loading');
    loadingElement.textContent = '...';
    chatBox.appendChild(loadingElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.remove();
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    userInput.value = '';
    showLoadingIndicator();

    try {
        const response = await fetch('/.netlify/functions/ask-gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: userMessage,
                history: {
                    user: lastUserMessage,
                    bot: lastBotResponse
                }
            })
        });

        hideLoadingIndicator();

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocorreu um erro no servidor.');
        }

        const data = await response.json();
        const botMessage = data.answer;
        
        addMessage(botMessage, 'bot');

        lastUserMessage = userMessage;
        lastBotResponse = botMessage;

    } catch (error) {
        hideLoadingIndicator();
        console.error('Erro:', error);
        addMessage('Desculpe, não consegui obter uma resposta. Tente novamente.', 'bot');
    }
});
