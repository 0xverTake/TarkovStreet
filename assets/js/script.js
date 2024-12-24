class TarkovLoader {
    constructor() {
        this.loadingBar = document.querySelector('.loading-bar');
        this.loadingText = document.querySelector('.loading-text');
        this.itemsContainer = document.querySelector('.items-container');
        this.tipText = document.querySelector('.tip-text');
        this.progress = 0;
        this.loadingMessages = [
            "Chargement du profil...",
            "Synchronisation avec les serveurs...",
            "Vérification de l'intégrité des données...",
            "Chargement de la base de données...",
            "Connexion au backend...",
            "Chargement des textures...",
            "Chargement des assets...",
            "Chargement des shaders...",
            "Initialisation du moteur physique...",
            "Chargement des configurations...",
        ];
        this.tips = [
            "Un PMC mort ne peut pas vendre de bitcoins.",
            "La peur est normale, la panique est fatale.",
            "Votre Scav est votre meilleur ami pour le loot.",
            "Gardez toujours un CMS dans votre secure container.",
            "Ne restez jamais immobile trop longtemps.",
            "La patience est la clé de la survie.",
            "Écoutez attentivement les bruits de pas.",
            "Un bon casque audio peut sauver votre vie.",
            "Les grenades sont vos meilleures amies.",
            "Apprenez les extracts avant tout.",
            "Le son attire les PMCs et les Scavs.",
            "Votre Scav a besoin de repos entre les raids.",
            "Les balles sont plus importantes que l'arme.",
            "Un bon armor repair kit peut vous faire économiser des millions.",
            "Les clés sont parmi les objets les plus précieux."
        ];
        this.currentMessageIndex = 0;
        this.init();
    }

    async init() {
        this.startLoading();
        await this.fetchMarketData();
    }

    startLoading() {
        this.updateLoadingBar();
        this.showRandomTip();
        this.interval = setInterval(() => {
            this.increment();
            this.updateLoadingBar();
            this.updateLoadingMessage();
        }, 200);
    }

    increment() {
        if (this.progress < 100) {
            this.progress += Math.random() * 3;
            if (this.progress > 100) this.progress = 100;
        } else {
            clearInterval(this.interval);
            // Attendre un peu pour montrer 100% puis rediriger
            setTimeout(() => {
                window.location.href = 'accueil.html';
            }, 1000);
        }
    }

    updateLoadingBar() {
        this.loadingBar.style.width = `${this.progress}%`;
        this.loadingText.textContent = `${Math.floor(this.progress)}%`;
    }

    updateLoadingMessage() {
        if (this.progress >= ((this.currentMessageIndex + 1) * (100 / this.loadingMessages.length))) {
            this.currentMessageIndex = Math.min(
                this.currentMessageIndex + 1,
                this.loadingMessages.length - 1
            );
        }
        this.tipText.textContent = this.loadingMessages[this.currentMessageIndex];
    }

    showRandomTip() {
        setInterval(() => {
            const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
            this.tipText.textContent = randomTip;
        }, 5000);
    }

    async fetchMarketData() {
        try {
            console.log('Tentative de connexion à l\'API...');
            const response = await fetch('http://localhost/tarkovv/api/proxy.php');
            
            console.log('Statut de la réponse:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Réponse de l\'API:', errorText);
                throw new Error(`Erreur réseau (${response.status}): ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Données reçues:', data);

            if (data.error) {
                throw new Error(`Erreur API: ${data.error}`);
            }

            if (!Array.isArray(data)) {
                throw new Error('Format de données invalide');
            }

            this.displayItems(data);
        } catch (error) {
            console.error('Erreur complète:', error);
            this.displayMockItems();
        }
    }

    displayMockItems() {
        const mockItems = [
            { name: "LEDX", price: 1250000, iconLink: "./assets/img/items/ledx.png" },
            { name: "GPU", price: 890000, iconLink: "./assets/img/items/gpu.png" },
            { name: "Tetriz", price: 375000, iconLink: "./assets/img/items/tetriz.png" },
            { name: "Bitcoin", price: 420000, iconLink: "./assets/img/items/bitcoin.png" }
        ];
        this.displayItems(mockItems);
    }

    createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        
        const image = document.createElement('img');
        image.src = item.iconLink;
        image.alt = item.name;
        image.onerror = () => this.onerror(image);
        
        const name = document.createElement('h4');
        name.textContent = item.name;
        
        const price = document.createElement('p');
        price.textContent = `₽${item.price.toLocaleString()}`;
        
        itemElement.appendChild(image);
        itemElement.appendChild(name);
        itemElement.appendChild(price);
        
        return itemElement;
    }

    onerror(img) {
        img.src = './assets/img/items/unknown.png';
    }

    displayItems(items) {
        this.itemsContainer.innerHTML = '';
        items.forEach(item => {
            const itemElement = this.createItemElement(item);
            this.itemsContainer.appendChild(itemElement);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TarkovLoader();
});
