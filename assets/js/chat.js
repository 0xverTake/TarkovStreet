document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Handle Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage();
        }
    });

    // Handle send button click
    sendButton.addEventListener('click', handleUserMessage);

    function handleUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);
        userInput.value = '';

        // Process the message and get AI response
        processMessage(message);
    }

    function addMessageToChat(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function processMessage(message) {
        try {
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai-message';
            typingDiv.textContent = '...';
            chatMessages.appendChild(typingDiv);

            // Make API request to the PHP backend
            const response = await fetch('/api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: 'tarkov'
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove typing indicator
            chatMessages.removeChild(typingDiv);

            if (data.error) {
                throw new Error(data.error);
            }

            // Add AI response to chat
            addMessageToChat('ai', data.response);

            // Auto-scroll to the latest message
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator if it exists
            const typingIndicator = chatMessages.querySelector('.typing-indicator');
            if (typingIndicator) {
                chatMessages.removeChild(typingIndicator);
            }
            
            addMessageToChat('ai', 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard. Erreur: ' + error.message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});
