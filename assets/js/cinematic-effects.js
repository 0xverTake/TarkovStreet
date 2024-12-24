// Ajouter les effets cinématiques
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter l'overlay cinématique
    const overlay = document.createElement('div');
    overlay.className = 'cinematic-overlay';
    
    // Ajouter l'effet de grain
    const grain = document.createElement('div');
    grain.className = 'grain';
    overlay.appendChild(grain);
    
    // Ajouter les particules de poussière
    const dust = document.createElement('div');
    dust.className = 'dust';
    
    // Créer les particules
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'dust-particle';
        
        // Position aléatoire
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Taille aléatoire
        const size = Math.random() * 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Délai d'animation aléatoire
        particle.style.animationDelay = Math.random() * 25 + 's';
        
        dust.appendChild(particle);
    }
    
    overlay.appendChild(dust);
    document.body.appendChild(overlay);
});
