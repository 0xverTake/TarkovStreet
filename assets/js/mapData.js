// Configuration des icônes et couleurs des marqueurs
export const markerIcons = {
    extract: {
        regular: 'fas fa-door-open',
        shared: 'fas fa-handshake',
        vehicle: 'fas fa-car'
    },
    spawn: 'fas fa-play',
    boss: 'fas fa-crown',
    cache: 'fas fa-box',
    quest: 'fas fa-scroll',
    custom: 'fas fa-map-marker-alt'
};

export const markerColors = {
    extract: '#00ff00',
    spawn: '#0000ff',
    boss: '#ff0000',
    cache: '#ffff00',
    quest: '#ff00ff',
    custom: '#ffffff'
};

// Fonction pour récupérer les données des cartes depuis l'API
async function fetchMaps() {
    try {
        console.log('Fetching maps from API...');
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify({
                query: `{
                    maps {
                        name
                        normalizedName
                        available
                        enemies
                        raidDuration
                        players {
                            min
                            max
                        }
                        nameId
                        accessKeys {
                            name
                        }
                        bosses {
                            name
                            spawnChance
                            spawnLocations {
                                name
                                chance
                            }
                            escorts {
                                name
                                amount {
                                    min
                                    max
                                }
                            }
                        }
                    }
                }`
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.data && data.data.maps && data.data.maps.length > 0) {
            const mapsData = {};
            data.data.maps.forEach(map => {
                const normalizedName = map.normalizedName || map.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                mapsData[normalizedName] = {
                    name: map.name,
                    image: `./assets/img/maps/${normalizedName}.jpg`,
                    duration: map.raidDuration || 40,
                    players: map.players ? `${map.players.min}-${map.players.max}` : '?',
                    available: map.available,
                    enemies: map.enemies || [],
                    extracts: [],
                    spawns: [],
                    bosses: map.bosses ? map.bosses.map(boss => ({
                        name: boss.name,
                        spawnChance: boss.spawnChance,
                        locations: boss.spawnLocations,
                        escorts: boss.escorts
                    })) : [],
                    caches: []
                };
            });
            console.log('Processed map data:', mapsData);
            return mapsData;
        }
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
    } catch (error) {
        console.error('Error fetching maps:', error);
        return defaultMapData;
    }
}

// Données statiques de secours
const defaultMapData = {
    customs: {
        name: 'Customs',
        image: './assets/img/maps/customs.jpg',
        duration: 40,
        players: '10-12',
        extracts: [
            {
                name: 'ZB-1011',
                position: [500, 300],
                type: 'regular'
            },
            {
                name: 'Crossroads',
                position: [100, 400],
                type: 'shared'
            },
            {
                name: 'RUAF Roadblock',
                position: [300, 200],
                type: 'shared'
            },
            {
                name: 'Trailer Park',
                position: [50, 350],
                type: 'regular'
            }
        ],
        spawns: [
            {
                name: 'Big Red',
                position: [150, 150]
            },
            {
                name: 'Trailer Park',
                position: [50, 300]
            },
            {
                name: 'Storage',
                position: [400, 200]
            }
        ],
        bosses: [
            {
                name: 'Reshala',
                position: [400, 400],
                spawnChance: 35
            }
        ],
        caches: [
            {
                name: 'Hidden Cache',
                position: [250, 250]
            },
            {
                name: 'Hidden Cache',
                position: [350, 300]
            }
        ]
    },
    woods: {
        name: 'Woods',
        image: './assets/img/maps/woods.jpg',
        duration: 40,
        players: '10-14',
        extracts: [
            {
                name: 'Outskirts',
                position: [600, 400],
                type: 'shared'
            },
            {
                name: 'UN Roadblock',
                position: [400, 100],
                type: 'regular'
            },
            {
                name: 'ZB-014',
                position: [300, 500],
                type: 'regular'
            }
        ],
        spawns: [
            {
                name: 'Spawn Point',
                position: [200, 200]
            },
            {
                name: 'Northern UN',
                position: [400, 50]
            }
        ],
        bosses: [
            {
                name: 'Shturman',
                position: [500, 500],
                spawnChance: 40
            }
        ],
        caches: [
            {
                name: 'Hidden Stash',
                position: [300, 300]
            },
            {
                name: 'Hidden Stash',
                position: [450, 350]
            }
        ]
    },
    factory: {
        name: 'Factory',
        image: './assets/img/maps/factory.jpg',
        duration: 20,
        players: '4-6',
        extracts: [
            {
                name: 'Gate 3',
                position: [200, 200],
                type: 'shared'
            },
            {
                name: 'Cellars',
                position: [300, 300],
                type: 'regular'
            }
        ],
        spawns: [
            {
                name: 'Glass Hallway',
                position: [150, 150]
            },
            {
                name: 'Forklifts',
                position: [250, 250]
            }
        ],
        bosses: [
            {
                name: 'Tagilla',
                position: [250, 250],
                spawnChance: 30
            }
        ],
        caches: []
    },
    lighthouse: {
        name: 'Lighthouse',
        image: './assets/img/maps/lighthouse.jpg',
        duration: 40,
        players: '10-14',
        extracts: [
            {
                name: 'Northern Checkpoint',
                position: [100, 100],
                type: 'shared'
            },
            {
                name: 'Southern Road',
                position: [500, 500],
                type: 'regular'
            }
        ],
        spawns: [
            {
                name: 'Beach',
                position: [200, 400]
            },
            {
                name: 'Village',
                position: [300, 300]
            }
        ],
        bosses: [],
        caches: [
            {
                name: 'Hidden Stash',
                position: [250, 250]
            }
        ]
    },
    shoreline: {
        name: 'Shoreline',
        image: './assets/img/maps/shoreline.jpg',
        duration: 45,
        players: '10-13',
        extracts: [
            {
                name: 'Road to Customs',
                position: [100, 300],
                type: 'shared'
            },
            {
                name: 'Tunnel',
                position: [500, 400],
                type: 'shared'
            }
        ],
        spawns: [
            {
                name: 'Village',
                position: [200, 200]
            }
        ],
        bosses: [
            {
                name: 'Sanitar',
                position: [400, 400],
                spawnChance: 35
            }
        ],
        caches: []
    },
    reserve: {
        name: 'Reserve',
        image: './assets/img/maps/reserve.jpg',
        duration: 40,
        players: '9-12',
        extracts: [
            {
                name: 'Bunker Hermetic Door',
                position: [300, 300],
                type: 'shared'
            }
        ],
        spawns: [],
        bosses: [
            {
                name: 'Glukhar',
                position: [400, 400],
                spawnChance: 40
            }
        ],
        caches: []
    },
    streets: {
        name: 'Streets of Tarkov',
        image: './assets/img/maps/streets.jpg',
        duration: 50,
        players: '12-16',
        extracts: [
            {
                name: 'Railroad',
                position: [100, 100],
                type: 'shared'
            }
        ],
        spawns: [],
        bosses: [],
        caches: []
    },
    interchange: {
        name: 'Interchange',
        image: './assets/img/maps/interchange.jpg',
        duration: 45,
        players: '10-14',
        extracts: [
            {
                name: 'Emercom Checkpoint',
                position: [500, 500],
                type: 'shared'
            },
            {
                name: 'Railway Exfil',
                position: [100, 100],
                type: 'shared'
            }
        ],
        spawns: [],
        bosses: [
            {
                name: 'Killa',
                position: [300, 300],
                spawnChance: 35
            }
        ],
        caches: []
    },
    labs: {
        name: 'The Lab',
        image: './assets/img/maps/labs.jpg',
        duration: 35,
        players: '6-10',
        extracts: [
            {
                name: 'Main Elevator',
                position: [300, 300],
                type: 'regular'
            }
        ],
        spawns: [],
        bosses: [],
        caches: []
    }
};

// Exporter les données statiques pour une utilisation immédiate
export const mapData = defaultMapData;

// Exporter la fonction pour récupérer les données dynamiques
export async function getMapData() {
    console.log('Getting map data...');
    try {
        const maps = await fetchMaps();
        console.log('Received maps:', maps);
        return maps;
    } catch (error) {
        console.error('Error in getMapData:', error);
        return defaultMapData;
    }
}
