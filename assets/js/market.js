// Configuration du marché
const MARKET_CONFIG = {
    refreshInterval: 60000, // Rafraîchir les prix toutes les 60 secondes
    currency: {
        RUB: '₽',
        USD: '$',
        EUR: '€'
    }
};

// État du marché
let marketState = {
    items: [],
    filters: {
        search: '',
        category: '',
        trader: '',
        minPrice: null,
        maxPrice: null
    },
    selectedItem: null
};

// Configuration des propriétés à afficher
const PROPERTY_LABELS = {
    damage: 'Dégâts',
    penetrationPower: 'Pénétration',
    armorDamage: 'Dégâts Armure',
    fragmentationChance: 'Chance Fragmentation',
    projectileCount: 'Projectiles',
    class: 'Classe',
    durability: 'Durabilité',
    repairCost: 'Coût Réparation',
    zones: 'Zones Protégées',
    caliber: 'Calibre',
    fireRate: 'Cadence de Tir',
    ergonomics: 'Ergonomie',
    recoilVertical: 'Recul Vertical',
    recoilHorizontal: 'Recul Horizontal',
    uses: 'Utilisations',
    useTime: 'Temps Utilisation'
};

// Initialisation des écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('market-items')) {
        initializeMarket();
        initializeFilters();
        initializeModal();
    }
});

// Initialisation du marché
function initializeMarket() {
    // Charger les données initiales
    fetchMarketData();
    
    // Mettre en place le rafraîchissement automatique
    setInterval(fetchMarketData, MARKET_CONFIG.refreshInterval);
}

// Initialisation des filtres
function initializeFilters() {
    // Écouteur pour la barre de recherche
    const searchInput = document.getElementById('market-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            marketState.filters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Écouteurs pour les filtres de catégorie et de marchand
    const categoryFilter = document.getElementById('category-filter');
    const traderFilter = document.getElementById('trader-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            marketState.filters.category = e.target.value;
            applyFilters();
        });
    }

    if (traderFilter) {
        traderFilter.addEventListener('change', (e) => {
            marketState.filters.trader = e.target.value;
            applyFilters();
        });
    }

    // Écouteurs pour les filtres de prix
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    if (minPriceInput) {
        minPriceInput.addEventListener('input', (e) => {
            marketState.filters.minPrice = e.target.value ? parseInt(e.target.value) : null;
            applyFilters();
        });
    }

    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', (e) => {
            marketState.filters.maxPrice = e.target.value ? parseInt(e.target.value) : null;
            applyFilters();
        });
    }
}

// Récupération des données du marché
async function fetchMarketData() {
    try {
        const data = await window.getMarketData();
        marketState.items = data;
        applyFilters();
    } catch (error) {
        console.error('Erreur lors du chargement des données du marché:', error);
        showError('Erreur lors du chargement des données');
    }
}

// Application des filtres
function applyFilters() {
    let filteredItems = marketState.items;

    // Filtre de recherche
    if (marketState.filters.search) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(marketState.filters.search) ||
            item.shortName.toLowerCase().includes(marketState.filters.search)
        );
    }

    // Filtre de catégorie
    if (marketState.filters.category) {
        filteredItems = filteredItems.filter(item => 
            item.category === marketState.filters.category
        );
    }

    // Filtre de marchand
    if (marketState.filters.trader) {
        filteredItems = filteredItems.filter(item => 
            item.trader.toLowerCase() === marketState.filters.trader
        );
    }

    // Filtres de prix
    if (marketState.filters.minPrice !== null) {
        filteredItems = filteredItems.filter(item => item.price >= marketState.filters.minPrice);
    }

    if (marketState.filters.maxPrice !== null) {
        filteredItems = filteredItems.filter(item => item.price <= marketState.filters.maxPrice);
    }

    renderMarketItems(filteredItems);
}

// Rendu des items du marché
function renderMarketItems(items) {
    const container = document.getElementById('market-items');
    const template = document.getElementById('item-template');
    
    if (!container || !template) {
        console.error('Éléments HTML manquants');
        return;
    }
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Ajouter chaque item
    items.forEach(item => {
        const itemElement = template.content.cloneNode(true);
        const itemDiv = itemElement.querySelector('.market-item');
        
        // Ajouter l'ID de l'item
        itemDiv.dataset.itemId = item.id;
        
        // Image de l'item
        const itemImage = itemElement.querySelector('.item-image img');
        if (itemImage) {
            itemImage.src = item.image;
            itemImage.alt = item.name;
            itemImage.onerror = () => {
                itemImage.src = './assets/img/default-item.png';
            };
        }
        
        // Icône du marchand
        const traderIcon = itemElement.querySelector('.item-trader-icon img');
        if (traderIcon) {
            traderIcon.src = item.traderIcon;
            traderIcon.alt = item.trader;
        }
        
        // Nom de l'item
        const itemName = itemElement.querySelector('.item-name');
        if (itemName) {
            itemName.textContent = item.shortName || item.name;
            itemName.title = item.name;
        }
        
        // Prix
        const priceValue = itemElement.querySelector('.price-value');
        const priceCurrency = itemElement.querySelector('.price-currency');
        if (priceValue) {
            priceValue.textContent = formatPrice(item.price);
        }
        if (priceCurrency) {
            priceCurrency.textContent = item.currency;
        }
        
        // Variation de prix
        const statChange = itemElement.querySelector('.stat-change');
        if (statChange) {
            const diff24h = item.diff24h || 0;
            statChange.textContent = formatPriceChange(diff24h);
            statChange.classList.add(diff24h >= 0 ? 'positive' : 'negative');
        }
        
        // Dernière mise à jour
        const lastUpdate = itemElement.querySelector('.last-update');
        if (lastUpdate) {
            lastUpdate.textContent = item.lastUpdate;
        }

        // Bouton détails
        const detailsButton = itemElement.querySelector('.details-button');
        if (detailsButton) {
            detailsButton.addEventListener('click', () => showItemDetails(item));
        }
        
        // Ajouter l'élément au conteneur
        container.appendChild(itemElement);
    });
}

// Initialisation de la modal
function initializeModal() {
    const modal = document.getElementById('item-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            marketState.selectedItem = null;
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            marketState.selectedItem = null;
        }
    });
}

// Affichage des détails d'un item
function showItemDetails(item) {
    marketState.selectedItem = item;
    const modal = document.getElementById('item-modal');
    
    // Image et informations de base
    modal.querySelector('.modal-item-image').src = item.image;
    modal.querySelector('.modal-item-name').textContent = item.name;
    modal.querySelector('.modal-item-category').textContent = 
        `Catégorie: ${formatCategory(item.category)}`;
    
    // Prix
    modal.querySelector('.modal-best-price').textContent = 
        `${formatPrice(item.price)} ${item.currency}`;
    
    // Prix des marchands
    const traderPricesList = modal.querySelector('.modal-trader-prices');
    traderPricesList.innerHTML = '';
    item.sellPrices.forEach(offer => {
        const li = document.createElement('li');
        li.textContent = `${offer.trader}: ${formatPrice(offer.price)} ${offer.currency}`;
        traderPricesList.appendChild(li);
    });
    
    // Propriétés
    const propertiesDiv = modal.querySelector('.modal-properties');
    propertiesDiv.innerHTML = '';
    
    if (item.properties) {
        Object.entries(item.properties).forEach(([key, value]) => {
            if (PROPERTY_LABELS[key] && value !== null && value !== undefined) {
                const prop = document.createElement('div');
                prop.classList.add('property');
                
                if (Array.isArray(value)) {
                    prop.innerHTML = `<span class="property-label">${PROPERTY_LABELS[key]}:</span> 
                                    <span class="property-value">${value.join(', ')}</span>`;
                } else if (typeof value === 'object') {
                    prop.innerHTML = `<span class="property-label">${PROPERTY_LABELS[key]}:</span> 
                                    <span class="property-value">${value.name || JSON.stringify(value)}</span>`;
                } else {
                    prop.innerHTML = `<span class="property-label">${PROPERTY_LABELS[key]}:</span> 
                                    <span class="property-value">${formatPropertyValue(key, value)}</span>`;
                }
                
                propertiesDiv.appendChild(prop);
            }
        });
    }
    
    // Lien Wiki
    const wikiLink = modal.querySelector('.wiki-link');
    if (wikiLink) {
        wikiLink.href = item.wikiLink || '#';
        wikiLink.style.display = item.wikiLink ? 'inline-block' : 'none';
    }
    
    modal.style.display = 'block';
}

// Formatage d'une catégorie
function formatCategory(category) {
    const categories = {
        'weapons': 'Armes',
        'armor': 'Armures',
        'ammo': 'Munitions',
        'meds': 'Médical',
        'keys': 'Clés',
        'barter': 'Troc'
    };
    return categories[category] || category;
}

// Formatage d'une valeur de propriété
function formatPropertyValue(key, value) {
    switch (key) {
        case 'fragmentationChance':
            return `${(value * 100).toFixed(1)}%`;
        case 'fireRate':
            return `${value} coups/min`;
        case 'useTime':
            return `${value}s`;
        default:
            return value;
    }
}

// Formatage du prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price);
}

// Formatage de la variation de prix
function formatPriceChange(change) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
}

// Affichage des erreurs
function showError(message) {
    const container = document.getElementById('market-items');
    if (container) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    } else {
        console.error(message);
    }
}
