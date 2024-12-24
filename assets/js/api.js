// Configuration de l'API
const API_URL = 'https://api.tarkov.dev/graphql';

// Fonction pour faire des requêtes GraphQL
async function fetchGraphQL(query) {
    try {
        console.log('Fetching data from API...');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('API response:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Récupérer tous les commerçants
export async function getTraders() {
    const query = `{
        traders {
            id
            name
            description
            normalizedName
            imageLink
            currency {
                name
                normalizedName
            }
            levels {
                level
                requiredPlayerLevel
                requiredReputation
                requiredCommerce
            }
            resetTime
            discount
        }
    }`;

    try {
        const data = await fetchGraphQL(query);
        return data.data.traders.map(trader => ({
            ...trader,
            imageLink: trader.imageLink || getDefaultTraderImage(trader.normalizedName)
        }));
    } catch (error) {
        console.error('Error fetching traders:', error);
        throw error;
    }
}

// Images des commerçants depuis le CDN officiel de Tarkov.dev
export function getDefaultTraderImage(traderName) {
    const defaultImages = {
        'prapor': 'https://assets.tarkov.dev/trader-1-portrait.jpg',
        'therapist': 'https://assets.tarkov.dev/trader-2-portrait.jpg',
        'skier': 'https://assets.tarkov.dev/trader-3-portrait.jpg',
        'peacekeeper': 'https://assets.tarkov.dev/trader-4-portrait.jpg',
        'mechanic': 'https://assets.tarkov.dev/trader-5-portrait.jpg',
        'ragman': 'https://assets.tarkov.dev/trader-6-portrait.jpg',
        'jaeger': 'https://assets.tarkov.dev/trader-7-portrait.jpg',
        'fence': 'https://assets.tarkov.dev/trader-8-portrait.jpg',
        'lightkeeper': 'https://assets.tarkov.dev/trader-9-portrait.jpg',
        'default': 'https://assets.tarkov.dev/unknown-trader.jpg'
    };
    
    return defaultImages[traderName.toLowerCase()] || defaultImages.default;
}

// Récupérer les données du marché
export async function getMarketData() {
    const query = `{
        items {
            id
            name
            shortName
            basePrice
            lastLowPrice
            changeLast48h
            iconLink
            imageLink
            gridImageLink
            wikiLink
            category {
                name
                normalizedName
            }
            properties {
                ... on ItemPropertiesAmmo {
                    damage
                    penetrationPower
                    armorDamage
                    fragmentationChance
                    projectileCount
                }
                ... on ItemPropertiesArmor {
                    class
                    durability
                    repairCost
                    zones
                    material {
                        name
                        destructibility
                    }
                }
                ... on ItemPropertiesWeapon {
                    caliber
                    fireRate
                    ergonomics
                    recoilVertical
                    recoilHorizontal
                }
                ... on ItemPropertiesMedical {
                    uses
                    useTime
                    effects {
                        type
                        value
                    }
                }
            }
            buyFor {
                price
                currency
                trader {
                    name
                    normalizedName
                }
            }
            sellFor {
                price
                currency
                trader {
                    name
                    normalizedName
                }
            }
        }
    }`;

    try {
        const data = await fetchGraphQL(query);
        return data.data.items.map(item => ({
            id: item.id,
            name: item.name,
            shortName: item.shortName,
            image: item.iconLink || item.gridImageLink || './assets/img/default-item.png',
            wikiLink: item.wikiLink,
            category: item.category.normalizedName,
            properties: item.properties,
            price: Math.min(...item.buyFor.map(offer => offer.price)),
            currency: '₽',
            trader: item.buyFor[0]?.trader.name || 'Flea Market',
            traderIcon: getDefaultTraderImage(item.buyFor[0]?.trader.normalizedName || 'default'),
            diff24h: item.changeLast48h ? Math.round(item.changeLast48h / 2) : 0,
            lastUpdate: new Date().toLocaleTimeString(),
            sellPrices: item.sellFor.map(offer => ({
                price: offer.price,
                currency: offer.currency,
                trader: offer.trader.name
            }))
        }));
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
}

// Récupérer les quêtes
export async function getQuests() {
    const query = `{
        tasks {
            id
            name
            trader {
                name
                normalizedName
            }
            map {
                name
                normalizedName
            }
            minPlayerLevel
            taskRequirements {
                task {
                    id
                    name
                }
                status
            }
            objectives {
                id
                description
                type
                maps {
                    name
                    normalizedName
                }
            }
            experience
        }
    }`;

    try {
        const data = await fetchGraphQL(query);
        return data.data.tasks.map(task => ({
            ...task,
            location: task.map?.name || 'Unknown location'
        }));
    } catch (error) {
        console.error('Error fetching quests:', error);
        throw error;
    }
}
