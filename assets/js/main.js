document.addEventListener('DOMContentLoaded', function() {
    // Éléments de l'interface
    const loadingBar = document.querySelector('.loading-bar');
    const progressPercent = document.querySelector('.progress-percent');
    const loadingTime = document.querySelector('.loading-time');
    const loadingDetails = document.querySelector('.loading-details span');
    const messageList = document.querySelector('.message-list');

    // Messages de chargement
    const loadingMessages = [
        'Connexion au serveur...',
        'Chargement de la carte...',
        'Synchronisation des joueurs...',
        'Préparation du raid...',
        'Chargement des ressources...',
        'Initialisation du serveur...',
        'Vérification de l\'équipement...',
        'Préparation des extractions...',
        'Configuration des PNJ...',
        'Déploiement imminent...'
    ];

    let startTime = Date.now();
    let currentMessage = 0;

    // Mise à jour du temps
    function updateTime() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        loadingTime.textContent = `${minutes}:${seconds}`;
    }

    // Mise à jour des messages
    function updateLoadingMessage() {
        const messageItems = messageList.querySelectorAll('.message-item');
        messageItems.forEach(item => item.classList.remove('active'));
        
        if (messageItems[currentMessage]) {
            messageItems[currentMessage].classList.add('active');
        }
        
        currentMessage = (currentMessage + 1) % loadingMessages.length;
        loadingDetails.textContent = loadingMessages[currentMessage];
    }

    // Initialisation des messages
    messageList.innerHTML = loadingMessages.slice(0, 3).map(msg => 
        `<div class="message-item">${msg}</div>`
    ).join('');

    // Animation de la barre de progression
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 1;
        if (progress <= 100) {
            loadingBar.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
            
            // Mise à jour du temps
            updateTime();
            
            // Changement de message tous les 10%
            if (progress % 10 === 0) {
                updateLoadingMessage();
            }
        } else {
            clearInterval(loadingInterval);
            setTimeout(() => {
                window.location.href = 'accueil.html';
            }, 500);
        }
    }, 100); // Durée totale : 10 secondes

    // Effet de flou initial
    document.querySelector('.video-overlay').style.backdropFilter = 'blur(5px)';
});
