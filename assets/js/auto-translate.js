// Ajout du script Google Translate
export function loadGoogleTranslate() {
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
}

// Initialisation de Google Translate
export function googleTranslateElementInit() {
    // Créer d'abord le drapeau
    const translateElement = document.getElementById('google_translate_element');
    if (translateElement) {
        const flag = document.createElement('div');
        flag.className = 'flag-button';
        flag.innerHTML = `
            <div class="flag-stripe blue"></div>
            <div class="flag-stripe white"></div>
            <div class="flag-stripe red"></div>
        `;
        translateElement.appendChild(flag);
    }

    // Initialiser Google Translate en arrière-plan
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'fr',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
}

// Initialiser la traduction au chargement de la page
document.addEventListener('DOMContentLoaded', loadGoogleTranslate);

// Rendre la fonction disponible globalement pour Google Translate
window.googleTranslateElementInit = googleTranslateElementInit;