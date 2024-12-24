// Importer les fonctions de l'API
import { getTraders, getQuests, getDefaultTraderImage } from './api.js';
import { translate } from './translations.js';

// Variables globales
let allQuests = [];
let currentFilters = {
    trader: 'all',
    search: '',
    level: 'all',
    difficulty: 'all'
};

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const tradersGrid = document.querySelector('.traders-grid');
        const questsList = document.querySelector('.quests-list');
        const loadingSpinner = document.getElementById('loading');
        const errorMessage = document.getElementById('error-message');
        const searchInput = document.getElementById('quest-search');
        
        // Afficher le spinner de chargement
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';

        // Charger les commerçants
        const traders = await getTraders();
        console.log('Traders loaded:', traders);

        if (!traders || !Array.isArray(traders)) {
            throw new Error('Données des commerçants invalides');
        }

        // Ajouter d'abord l'option "Tous"
        const allTraderCard = document.createElement('div');
        allTraderCard.className = 'trader-card active';
        allTraderCard.dataset.trader = 'all';
        allTraderCard.innerHTML = `
            <div class="trader-icon">
                <i class="fas fa-store fa-3x"></i>
            </div>
            <span>Tous</span>
        `;
        tradersGrid.appendChild(allTraderCard);
        
        // Ajouter les autres commerçants
        traders.forEach(trader => {
            if (!trader || !trader.name) return;
            
            const traderCard = document.createElement('div');
            traderCard.className = 'trader-card';
            traderCard.dataset.trader = trader.name.toLowerCase();
            traderCard.innerHTML = `
                <div class="trader-icon">
                    <img src="${trader.imageLink || getDefaultTraderImage(trader.name)}" alt="${trader.name}">
                </div>
                <span>${trader.name}</span>
            `;
            tradersGrid.appendChild(traderCard);
        });

        // Charger les quêtes
        allQuests = await getQuests();
        console.log('Quests loaded:', allQuests);
        
        // Configurer les filtres
        setupFilters();
        
        // Afficher les quêtes filtrées
        applyFilters();
        
        // Masquer le spinner de chargement
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        showError('Une erreur s\'est produite lors du chargement des données.');
    }
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const tradersGrid = document.querySelector('.traders-grid');
    const searchInput = document.getElementById('quest-search');
    const levelFilter = document.getElementById('level-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const sortBy = document.getElementById('sort-by');
    
    if (tradersGrid) {
        tradersGrid.addEventListener('click', event => {
            const traderCard = event.target.closest('.trader-card');
            if (!traderCard) return;
            
            // Mettre à jour la sélection active
            document.querySelectorAll('.trader-card').forEach(card => {
                card.classList.remove('active');
            });
            traderCard.classList.add('active');
            
            // Mettre à jour le filtre
            currentFilters.trader = traderCard.dataset.trader;
            applyFilters();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentFilters.search = searchInput.value.toLowerCase();
            applyFilters();
        });
    }
    
    if (levelFilter) {
        levelFilter.addEventListener('change', () => {
            currentFilters.level = levelFilter.value;
            applyFilters();
        });
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', () => {
            currentFilters.difficulty = difficultyFilter.value;
            applyFilters();
        });
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            applyFilters();
        });
    }
}

// Fonction pour filtrer les quêtes
function filterQuests(quests, filters) {
    return quests.filter(quest => {
        // Filtre par commerçant
        if (filters.trader !== 'all' && quest.trader.name.toLowerCase() !== filters.trader) {
            return false;
        }
        
        // Filtre par recherche
        if (filters.search && !quest.name.toLowerCase().includes(filters.search)) {
            return false;
        }
        
        // Filtre par niveau
        if (filters.level !== 'all') {
            const questLevel = quest.minPlayerLevel || 1;
            const [min, max] = filters.level.split('-').map(Number);
            
            if (filters.level === '41+') {
                if (questLevel < 41) return false;
            } else {
                if (questLevel < min || questLevel > max) return false;
            }
        }
        
        // Filtre par difficulté
        if (filters.difficulty !== 'all') {
            const questDifficulty = calculateDifficulty(quest);
            if (questDifficulty !== filters.difficulty) return false;
        }
        
        return true;
    });
}

// Appliquer tous les filtres
function applyFilters() {
    const filteredQuests = filterQuests(allQuests, currentFilters);
    const sortBy = document.getElementById('sort-by').value;
    const sortedQuests = sortQuests(filteredQuests, sortBy);
    displayQuests(sortedQuests);
}

// Calculer la difficulté d'une quête
function calculateDifficulty(quest) {
    const level = quest.minPlayerLevel || 1;
    const objectives = quest.objectives ? quest.objectives.length : 0;
    
    if (level >= 30 || objectives >= 5) return 'difficile';
    if (level >= 15 || objectives >= 3) return 'moyen';
    return 'facile';
}

// Trier les quêtes
function sortQuests(quests, sortBy) {
    return [...quests].sort((a, b) => {
        switch (sortBy) {
            case 'level':
                return (a.minPlayerLevel || 1) - (b.minPlayerLevel || 1);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'trader':
                return a.trader.name.localeCompare(b.trader.name);
            default:
                return 0;
        }
    });
}

// Afficher les quêtes
function displayQuests(quests) {
    const questsList = document.querySelector('.quests-list');
    if (!questsList) return;
    
    questsList.innerHTML = '';
    
    if (quests.length === 0) {
        questsList.innerHTML = `
            <div class="no-quests">
                <i class="fas fa-search"></i>
                <p>Aucune quête ne correspond à vos critères.</p>
            </div>
        `;
        return;
    }
    
    quests.forEach(quest => {
        const questCard = createQuestCard(quest);
        questsList.appendChild(questCard);
    });
}

// Afficher une erreur
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loading');
    
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// Fonction pour créer une carte de quête
function createQuestCard(quest) {
    const card = document.createElement('div');
    card.className = 'quest-card';
    
    // Calculer la difficulté
    const difficulty = calculateDifficulty(quest);
    const difficultyClass = `difficulty-${difficulty}`;
    
    // Créer les éléments d'objectif
    const objectives = quest.objectives ? quest.objectives.map(obj => {
        let text = obj.description;
        if (obj.maps && obj.maps.length > 0) {
            text += ` (${obj.maps.map(map => map.name).join(', ')})`;
        }
        return `<li class="${obj.optional ? 'optional' : ''}">${text}</li>`;
    }).join('') : '';
    
    card.innerHTML = `
        <div class="quest-header ${difficultyClass}">
            <h3>${translate(quest.name)}</h3>
            <span class="trader-name">${quest.trader.name}</span>
        </div>
        <div class="quest-content">
            <div class="quest-info">
                <p class="level">Niveau requis: ${quest.minPlayerLevel || 1}</p>
                <div class="objectives">
                    <h4>Objectifs:</h4>
                    <ul>${objectives}</ul>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Configurer les filtres
function setupFilters() {
    const levelFilter = document.getElementById('level-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const sortBy = document.getElementById('sort-by');
    
    // Configurer les options de niveau
    if (levelFilter) {
        const levels = allQuests.map(quest => quest.minPlayerLevel || 1);
        const maxLevel = Math.max(...levels);
        
        levelFilter.innerHTML = `
            <option value="all">Tous les niveaux</option>
            <option value="1-10">Niveau 1-10</option>
            <option value="11-20">Niveau 11-20</option>
            <option value="21-30">Niveau 21-30</option>
            <option value="31-40">Niveau 31-40</option>
            ${maxLevel > 40 ? '<option value="41+">Niveau 41+</option>' : ''}
        `;
    }
    
    // Configurer les options de difficulté
    if (difficultyFilter) {
        difficultyFilter.innerHTML = `
            <option value="all">Toutes difficultés</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
        `;
    }
    
    // Configurer les options de tri
    if (sortBy) {
        sortBy.innerHTML = `
            <option value="level">Trier par niveau</option>
            <option value="name">Trier par nom</option>
            <option value="trader">Trier par commerçant</option>
        `;
    }
    
    // Initialiser les écouteurs d'événements
    setupEventListeners();
}
