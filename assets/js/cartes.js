// Importer les données des cartes
import { mapData, markerIcons, markerColors, getMapData } from './mapData.js';

// Variables globales
let currentMap = null;
let map = null;
let markers = {
    extracts: [],
    spawns: [],
    bosses: [],
    caches: [],
    quests: [],
    custom: []
};

// Initialisation de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing map interface...');
    
    try {
        // Récupérer les données dynamiques des cartes
        const dynamicMapData = await getMapData();
        console.log('Dynamic Map Data:', dynamicMapData);
        
        // Initialiser l'interface avec les données récupérées
        initMapSelector(dynamicMapData);
        initFilters();
        initSearch();
        initCustomMarkers();
        initMapControls();

        // Sélectionner la première carte par défaut
        const firstMapKey = Object.keys(dynamicMapData)[0];
        if (firstMapKey) {
            const firstMapCard = document.querySelector(`.map-card[data-map="${firstMapKey}"]`);
            if (firstMapCard) {
                firstMapCard.click();
            }
        }
    } catch (error) {
        console.error('Error initializing maps:', error);
        // Utiliser les données statiques en cas d'erreur
        initMapSelector(mapData);
        initFilters();
        initSearch();
        initCustomMarkers();
        initMapControls();
    }
});

// Initialisation du sélecteur de carte
function initMapSelector(mapData) {
    console.log('Setting up map selector...');
    const mapList = document.querySelector('.map-list');
    if (!mapList) {
        console.error('Map list element not found');
        return;
    }
    
    mapList.innerHTML = ''; // Nettoyer la liste existante
    
    // Créer les cartes pour chaque map
    Object.entries(mapData).forEach(([key, data]) => {
        const mapCard = document.createElement('div');
        mapCard.className = 'map-card';
        mapCard.dataset.map = key;
        
        // Créer l'élément image séparément pour gérer les erreurs
        const img = new Image();
        img.loading = 'lazy';
        img.alt = data.name;
        
        // Gestionnaire d'erreur de chargement d'image
        img.addEventListener('error', () => {
            console.log('Error loading image for', data.name);
            img.src = 'assets/img/map-placeholder.jpg';
        });
        
        // Définir la source après avoir ajouté le gestionnaire d'erreur
        img.src = data.image;
        
        const info = document.createElement('div');
        info.className = 'map-card-info';
        info.innerHTML = `
            <h3>${data.name}</h3>
            <div class="map-details">
                <span><i class="fas fa-clock"></i> ${data.duration}min</span>
                <span><i class="fas fa-users"></i> ${data.players}</span>
            </div>
        `;
        
        mapCard.appendChild(img);
        mapCard.appendChild(info);
        
        // Utiliser une fonction fléchée pour le gestionnaire d'événements
        mapCard.addEventListener('click', () => {
            document.querySelectorAll('.map-card').forEach(card => {
                card.classList.remove('active');
            });
            mapCard.classList.add('active');
            loadMap(key);
        });
        
        mapList.appendChild(mapCard);
    });
}

// Chargement d'une carte
function loadMap(mapKey) {
    console.log('Loading map:', mapKey);
    currentMap = mapKey;
    const currentMapData = mapData[mapKey];
    
    if (!currentMapData) {
        console.error('Map data not found for:', mapKey);
        return;
    }

    // Mettre à jour les informations de la carte
    const mapName = document.getElementById('map-name');
    const mapDetails = document.getElementById('map-details');
    
    if (mapName) mapName.textContent = currentMapData.name;
    if (mapDetails) {
        mapDetails.innerHTML = `
            <span><i class="fas fa-clock"></i> ${currentMapData.duration}min</span>
            <span><i class="fas fa-users"></i> ${currentMapData.players}</span>
        `;
    }
    
    // Initialiser ou mettre à jour la carte
    if (!map) {
        initLeafletMap(currentMapData);
    } else {
        updateMapImage(currentMapData);
    }

    // Nettoyer et charger les marqueurs
    clearMarkers();
    
    // Charger les marqueurs s'ils existent
    if (currentMapData.extracts) {
        currentMapData.extracts.forEach(extract => {
            const marker = createMarker(extract.position, {
                icon: markerIcons.extract[extract.type] || markerIcons.extract.regular,
                color: markerColors.extract,
                title: extract.name
            });
            markers.extracts.push(marker);
            marker.addTo(map);
        });
    }

    // Charger les marqueurs personnalisés sauvegardés
    const savedMarkers = localStorage.getItem(`customMarkers_${mapKey}`);
    if (savedMarkers) {
        JSON.parse(savedMarkers).forEach(markerData => {
            const marker = createMarker(markerData.position, {
                icon: markerIcons.custom,
                color: markerColors.custom,
                title: markerData.title
            });
            markers.custom.push(marker);
        });
    }
}

// Initialisation de la carte Leaflet
function initLeafletMap(mapInfo) {
    if (map) {
        map.remove();
    }
    
    // Créer la carte avec les bonnes options
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false
    });
    
    // Charger l'image
    const img = new Image();
    img.onload = function() {
        const width = this.width;
        const height = this.height;
        const bounds = [[0, 0], [height, width]];
        
        L.imageOverlay(mapInfo.image, bounds).addTo(map);
        map.fitBounds(bounds);
        
        // Ajouter les contrôles de zoom
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
    };
    img.src = mapInfo.image;
    
    // Événement pour l'ajout de marqueurs personnalisés
    map.on('click', (e) => {
        if (document.getElementById('add-marker').classList.contains('active')) {
            showMarkerModal(e.latlng);
        }
    });
}

// Mise à jour de l'image de la carte
function updateMapImage(mapInfo) {
    // Supprimer l'ancien imageOverlay
    map.eachLayer((layer) => {
        if (layer instanceof L.ImageOverlay) {
            map.removeLayer(layer);
        }
    });
    
    // Ajouter la nouvelle image
    const img = new Image();
    img.onload = function() {
        const width = this.width;
        const height = this.height;
        const bounds = [[0, 0], [height, width]];
        
        L.imageOverlay(mapInfo.image, bounds).addTo(map);
        map.fitBounds(bounds);
    };
    img.src = mapInfo.image;
}

// Création d'un marqueur
function createMarker(position, options) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<i class="${options.icon}" style="color: ${options.color}"></i>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const marker = L.marker(position, { icon }).addTo(map);
    
    marker.bindPopup(`
        <h3>${options.title}</h3>
    `);
    
    return marker;
}

// Gestion des filtres
function initFilters() {
    const filterContainer = document.querySelector('.filter-container');
    
    // Créer les filtres pour chaque type de marqueur
    const filterTypes = [
        { type: 'extracts', label: 'Points d\'extraction', icon: 'fas fa-door-open' },
        { type: 'spawns', label: 'Points de spawn', icon: 'fas fa-play' },
        { type: 'bosses', label: 'Boss', icon: 'fas fa-crown' },
        { type: 'custom', label: 'Marqueurs personnalisés', icon: 'fas fa-map-marker' }
    ];

    filterTypes.forEach(filter => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        filterItem.innerHTML = `
            <label>
                <input type="checkbox" data-type="${filter.type}" checked>
                <i class="${filter.icon}"></i>
                ${filter.label}
            </label>
        `;
        filterContainer.appendChild(filterItem);
    });

    // Ajouter les événements sur les checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-item input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const type = checkbox.dataset.type;
            markers[type].forEach(marker => {
                if (checkbox.checked) {
                    map.addLayer(marker);
                } else {
                    map.removeLayer(marker);
                }
            });
        });
    });
}

// Gestion de la recherche
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.querySelector('.search-results');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        // Rechercher dans tous les marqueurs
        const results = [];
        Object.values(markers).flat().forEach(marker => {
            const data = marker.options.title;
            if (data.toLowerCase().includes(query)) {
                results.push({ marker, data });
            }
        });
        
        displaySearchResults(results);
    });
}

// Affichage des résultats de recherche
function displaySearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    
    if (results.length === 0) {
        searchResults.classList.remove('active');
        return;
    }
    
    searchResults.innerHTML = '';
    results.forEach(({ marker, data }) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = data;
        item.addEventListener('click', () => {
            map.setView(marker.getLatLng(), map.getZoom());
            marker.openPopup();
            searchResults.classList.remove('active');
        });
        searchResults.appendChild(item);
    });
    
    searchResults.classList.add('active');
}

// Gestion des marqueurs personnalisés
function initCustomMarkers() {
    const addMarkerBtn = document.getElementById('add-marker');
    const modal = document.getElementById('marker-modal');
    const closeButtons = modal.querySelectorAll('.close-modal');
    const saveButton = document.getElementById('save-marker');
    
    addMarkerBtn.addEventListener('click', () => {
        addMarkerBtn.classList.toggle('active');
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    saveButton.addEventListener('click', saveCustomMarker);
    
    // Charger les marqueurs personnalisés sauvegardés
    const savedMarkers = localStorage.getItem(`customMarkers_${currentMap}`);
    if (savedMarkers) {
        JSON.parse(savedMarkers).forEach(markerData => {
            const marker = createMarker(markerData.position, {
                icon: markerIcons.custom,
                color: markerColors.custom,
                title: markerData.title
            });
            markers.custom.push(marker);
        });
    }
}

// Affichage du modal pour ajouter un marqueur
function showMarkerModal(position) {
    const modal = document.getElementById('marker-modal');
    modal.dataset.position = JSON.stringify(position);
    modal.classList.add('active');
}

// Sauvegarde d'un marqueur personnalisé
function saveCustomMarker() {
    const modal = document.getElementById('marker-modal');
    const position = JSON.parse(modal.dataset.position);
    const name = document.getElementById('marker-name').value;
    const description = document.getElementById('marker-description').value;
    const color = document.getElementById('marker-color').value;
    
    if (!name) {
        alert('Le nom est obligatoire');
        return;
    }
    
    const marker = createMarker(position, {
        icon: markerIcons.custom,
        color: markerColors.custom,
        title: name
    });
    
    markers.custom.push(marker);
    saveCustomMarkersToStorage();
    
    modal.classList.remove('active');
    document.getElementById('add-marker').classList.remove('active');
    document.getElementById('marker-name').value = '';
    document.getElementById('marker-description').value = '';
}

// Sauvegarde des marqueurs personnalisés
function saveCustomMarkersToStorage() {
    const customMarkers = markers.custom.map(marker => ({
        position: marker.getLatLng(),
        title: marker.options.title
    }));
    
    localStorage.setItem(`customMarkers_${currentMap}`, JSON.stringify(customMarkers));
}

// Contrôles de la carte
function initMapControls() {
    const resetViewBtn = document.getElementById('reset-view');
    const fullscreenBtn = document.getElementById('fullscreen');
    const mapContainer = document.getElementById('map-container');
    
    resetViewBtn.addEventListener('click', () => {
        if (map) {
            map.setView(map.getBounds().getCenter(), -1);
        }
    });
    
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
}

// Utilitaires
function clearMarkers() {
    Object.values(markers).forEach(markerGroup => {
        markerGroup.forEach(marker => {
            map.removeLayer(marker);
        });
        markerGroup.length = 0;
    });
}