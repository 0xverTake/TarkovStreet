const API_KEY = 'n6J6iHLnJVMNdNgb';
const API_URL = 'https://api.tarkov-market.app/api/v1/pve/items/all';
const API_DOWNLOAD_URL = 'https://api.tarkov-market.app/api/v1/pve/items/all/download';

// Fonction pour télécharger et sauvegarder les données
async function downloadMarketData() {
    try {
        const response = await fetch(`${API_DOWNLOAD_URL}?x-api-key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Erreur réseau lors du téléchargement des données');
        }
        const data = await response.json();
        localStorage.setItem('marketData', JSON.stringify(data));
        localStorage.setItem('lastUpdate', new Date().toISOString());
        return data;
    } catch (error) {
        console.error('Erreur lors du téléchargement des données:', error);
        return null;
    }
}

// Fonction pour obtenir les données du marché
window.getMarketData = async function() {
    try {
        // Vérifier si nous avons des données en cache et si elles sont récentes (moins de 1 heure)
        const lastUpdate = localStorage.getItem('lastUpdate');
        const cachedData = localStorage.getItem('marketData');
        const now = new Date();
        const oneHourAgo = new Date(now - 3600000); // 1 heure en millisecondes

        if (lastUpdate && cachedData && new Date(lastUpdate) > oneHourAgo) {
            return transformData(JSON.parse(cachedData));
        }

        // Si pas de cache ou données trop anciennes, télécharger de nouvelles données
        const newData = await downloadMarketData();
        if (newData) {
            return transformData(newData);
        }

        // Si le téléchargement échoue, utiliser les données en cache même si anciennes
        if (cachedData) {
            return transformData(JSON.parse(cachedData));
        }

        throw new Error('Impossible de récupérer les données du marché');
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return [];
    }
}

// Fonction pour transformer les données brutes en format utilisable
function transformData(data) {
    return data.map(item => ({
        id: item.uid,
        name: item.name,
        shortName: item.shortName,
        category: getCategoryFromTags(item.tags),
        image: item.img,  // Utilisation de l'image haute qualité de l'API
        traderIcon: getTraderIcon(item.traderName),
        price: item.price,
        currency: '₽', // Prix en Roubles par défaut
        trader: item.traderName,
        description: item.description || '',
        location: item.location || '',
        lastUpdate: new Date().toLocaleDateString('fr-FR'),
        wikiLink: item.wikiLink,
        traderPrice: item.traderPrice,
        traderPriceCur: item.traderPriceCur,
        slots: item.slots,
        diff24h: item.diff24h,
        diff7days: item.diff7days
    }));
}

// Fonction pour obtenir l'icône du trader
function getTraderIcon(traderName) {
    // URLs des images des traders depuis le wiki officiel
    const traderIcons = {
        'Prapor': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/8/86/Prapor_Portrait.png',
        'Therapist': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/c/c3/Therapist_Portrait.png',
        'Skier': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/6/6b/Skier_Portrait.png',
        'Peacekeeper': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/4/4c/Peacekeeper_Portrait.png',
        'Mechanic': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/2/24/Mechanic_Portrait.png',
        'Ragman': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/f/f3/Ragman_Portrait.png',
        'Jaeger': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/0/09/Jaeger_Portrait.png',
        'Fence': 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/0/0a/Fence_Portrait.png'
    };
    return traderIcons[traderName] || 'https://static.wikia.nocookie.net/escapefromtarkov_gamepedia/images/0/0a/Fence_Portrait.png';
}

// Fonction pour déterminer la catégorie à partir des tags
function getCategoryFromTags(tags) {
    const categoryMap = {
        'weapon': 'weapons',
        'ammo': 'ammo',
        'armor': 'armor',
        'medical': 'meds',
        'key': 'keys',
        'barter': 'barter'
    };

    for (const tag of tags) {
        const category = categoryMap[tag.toLowerCase()];
        if (category) return category;
    }
    return 'other';
}

// Fonction pour obtenir un item spécifique
window.getItemById = async function(id) {
    const items = await window.getMarketData();
    return items.find(item => item.id === id);
}

// Fonction pour filtrer les items par catégorie
window.getItemsByCategory = async function(category) {
    const items = await window.getMarketData();
    return items.filter(item => item.category === category);
}

// Fonction pour filtrer les items par marchand
window.getItemsByTrader = async function(trader) {
    const items = await window.getMarketData();
    return items.filter(item => item.trader.toLowerCase() === trader.toLowerCase());
}

// Fonction pour filtrer les items par fourchette de prix
window.getItemsByPriceRange = async function(minPrice, maxPrice) {
    const items = await window.getMarketData();
    return items.filter(item => {
        const price = item.price;
        return price >= minPrice && price <= maxPrice;
    });
}

// Télécharger les données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    downloadMarketData();
});
