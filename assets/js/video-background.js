// Gestion de la vidéo en arrière-plan
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('tarkovVideo');
    
    if (video) {
        // Ajouter la classe 'loaded' quand la vidéo est prête
        video.addEventListener('loadeddata', function() {
            video.classList.add('loaded');
        });

        // Gérer la mise en pause en arrière-plan
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                video.pause();
            } else {
                video.play();
            }
        });

        // Optimisation mobile : pause si hors écran
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        observer.observe(video);
    }
});
