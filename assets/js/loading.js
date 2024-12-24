document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainContent = document.getElementById('mainContent');
    const loadingBar = document.getElementById('loadingBar');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingDetail = document.getElementById('loadingDetail');
    const loadingTime = document.getElementById('loadingTime');
    const dialogueContainer = document.getElementById('dialogueContainer');

    // Dialogues des marchands
    const dialogues = [
        { trader: 'Prapor', text: "J'ai des informations sur le marché noir pour toi, camarade." },
        { trader: 'Therapist', text: "Les prix des fournitures médicales sont en hausse." },
        { trader: 'Skier', text: "J'ai de nouvelles marchandises, mais ça va te coûter cher." },
        { trader: 'Peacekeeper', text: "Le taux de change est favorable aujourd'hui, mon ami." },
        { trader: 'Mechanic', text: "J'ai des modifications spéciales pour toi, si tu as les moyens." },
        { trader: 'Ragman', text: "La dernière collection vient d'arriver, regarde par toi-même." },
        { trader: 'Jaeger', text: "Les ressources sont rares, les prix augmentent." }
    ];

    // États de chargement
    const loadingStates = [
        { status: 'CONNEXION AU SERVEUR', detail: 'Établissement de la connexion...' },
        { status: 'CHARGEMENT DES DONNÉES', detail: 'Récupération des prix du marché...' },
        { status: 'SYNCHRONISATION', detail: 'Mise à jour des informations...' },
        { status: 'DÉPLOIEMENT', detail: 'Préparation de l\'interface...' },
        { status: 'FINALISATION', detail: 'Dernières vérifications...' }
    ];

    let startTime = Date.now();
    let currentLoadingState = 0;
    let progress = 0;
    let currentDialogue = 0;

    // Fonction pour afficher un dialogue
    function showDialogue(dialogue) {
        const dialogueElement = document.createElement('div');
        dialogueElement.className = 'dialogue';
        dialogueElement.innerHTML = `<span class="trader-name">${dialogue.trader}:</span>${dialogue.text}`;
        
        dialogueContainer.innerHTML = '';
        dialogueContainer.appendChild(dialogueElement);
        
        setTimeout(() => dialogueElement.classList.add('active'), 100);
    }

    // Fonction pour mettre à jour le temps écoulé
    function updateTime() {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        loadingTime.textContent = elapsed + 's';
    }

    // Simuler le chargement
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 1s ease-out';
                
                setTimeout(() => {
                    mainContent.style.display = 'block';
                    loadingScreen.style.display = 'none';
                }, 1000);
            }, 1000);
        }

        // Mise à jour de la barre de progression
        loadingBar.style.width = `${progress}%`;
        loadingPercent.textContent = `${Math.floor(progress)}%`;

        // Mise à jour de l'état de chargement
        if (progress >= (currentLoadingState + 1) * 20 && currentLoadingState < loadingStates.length - 1) {
            currentLoadingState++;
            loadingStatus.textContent = loadingStates[currentLoadingState].status;
            loadingDetail.textContent = loadingStates[currentLoadingState].detail;
        }

        // Afficher un nouveau dialogue tous les 20%
        if (progress >= (currentDialogue + 1) * 15 && currentDialogue < dialogues.length - 1) {
            currentDialogue++;
            showDialogue(dialogues[currentDialogue]);
        }

        updateTime();
    }, 100);

    // Afficher le premier dialogue
    showDialogue(dialogues[0]);
});
