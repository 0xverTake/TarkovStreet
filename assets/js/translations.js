// Dictionnaire de traductions pour les quêtes
const translations = {
    // Noms des quêtes
    "Debut": "Début",
    "Checking": "Vérification",
    "Shootout Picnic": "Pique-nique mouvementé",
    "Operation Aquarius - Part 1": "Opération Aquarius - Partie 1",
    "Operation Aquarius - Part 2": "Opération Aquarius - Partie 2",
    "Painkiller": "Antidouleur",
    "Shortage": "Pénurie",
    "Sanitary Standards - Part 1": "Normes sanitaires - Partie 1",
    "Sanitary Standards - Part 2": "Normes sanitaires - Partie 2",
    "The Extortionist": "L'Extorqueur",
    "Stirrup": "Étrier",
    "What's on the flash drive?": "Que contient la clé USB ?",
    "Golden Swag": "Butin doré",
    "BP Depot": "Dépôt BP",
    "Chemical - Part 1": "Produits chimiques - Partie 1",
    "Chemical - Part 2": "Produits chimiques - Partie 2",
    "Chemical - Part 3": "Produits chimiques - Partie 3",
    "Chemical - Part 4": "Produits chimiques - Partie 4",
    "Out of Curiosity": "Par curiosité",
    "Big Customer": "Gros client",
    "Supplier": "Fournisseur",
    "The Punisher - Part 1": "Le Punisher - Partie 1",
    "The Punisher - Part 2": "Le Punisher - Partie 2",
    "The Punisher - Part 3": "Le Punisher - Partie 3",
    "The Punisher - Part 4": "Le Punisher - Partie 4",
    "The Punisher - Part 5": "Le Punisher - Partie 5",
    "The Punisher - Part 6": "Le Punisher - Partie 6",
    "Ice Cream Cones": "Cornets de glace",
    "Peacekeeping Mission": "Mission de maintien de la paix",
    "Cargo X - Part 1": "Cargo X - Partie 1",
    "Cargo X - Part 2": "Cargo X - Partie 2",
    "Cargo X - Part 3": "Cargo X - Partie 3",

    // Objectifs communs
    "Find": "Trouver",
    "Eliminate": "Éliminer",
    "Extract": "Extraire",
    "Survive": "Survivre",
    "Collect": "Collecter",
    "Deliver": "Livrer",
    "Mark": "Marquer",
    "Place": "Placer",
    "Reach": "Atteindre",
    "Complete": "Terminer",

    // Lieux
    "Customs": "Douanes",
    "Factory": "Usine",
    "Woods": "Bois",
    "Shoreline": "Littoral",
    "Interchange": "Échangeur",
    "Labs": "Laboratoires",
    "Reserve": "Réserve",
    "Streets of Tarkov": "Rues de Tarkov",
    "Lighthouse": "Phare",

    // Autres
    "PMC": "PMC",
    "Scav": "Scav",
    "BEAR": "BEAR",
    "USEC": "USEC",
    "Level": "Niveau",
    "Required level": "Niveau requis",
    "Experience": "Expérience",
    "Rewards": "Récompenses",
    "Trader": "Commerçant",
    "Status": "Statut",
    "In Progress": "En cours",
    "Completed": "Terminé",
    "Failed": "Échoué",
    "Not Started": "Non commencé"
};

// Fonction pour traduire un texte
export function translate(text) {
    if (!text) return '';
    return translations[text] || text;
}

// Fonction pour traduire un texte avec des variables
export function translateWithVariables(text, variables = {}) {
    let translatedText = translate(text);
    Object.entries(variables).forEach(([key, value]) => {
        translatedText = translatedText.replace(`{${key}}`, value);
    });
    return translatedText;
}



