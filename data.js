const members = [
    {
        id: 1,
        prenom: "Thomas",
        nom: "Dupont",
        job: "Développeur Freelance",
        ville: "Lyon",
        lat: 45.7640,
        lng: 4.8357,
        photo: "https://i.pravatar.cc/150?u=1"
    },
    {
        id: 2,
        prenom: "Sarah",
        nom: "Martin",
        job: "UX Designer",
        ville: "Paris",
        lat: 48.8566,
        lng: 2.3522,
        photo: "https://i.pravatar.cc/150?u=2"
    },
    {
        id: 3,
        prenom: "Malik",
        nom: "Benamara",
        job: "Chef de Projet",
        ville: "Marseille",
        lat: 43.2965,
        lng: 5.3698,
        photo: "https://i.pravatar.cc/150?u=3"
    },
    {
        id: 4,
        prenom: "Julie",
        nom: "Leroy",
        job: "Marketing Digital",
        ville: "Bordeaux",
        lat: 44.8378,
        lng: -0.5792,
        photo: "https://i.pravatar.cc/150?u=4"
    },
    {
        id: 5,
        prenom: "Lucas",
        nom: "Petit",
        job: "Growth Hacker",
        ville: "Nantes",
        lat: 47.2184,
        lng: -1.5536,
        photo: "https://i.pravatar.cc/150?u=5"
    },
    {
        id: 6,
        prenom: "Emma",
        nom: "Moreau",
        job: "Copywriter",
        ville: "Lille",
        lat: 50.6292,
        lng: 3.0573,
        photo: "https://i.pravatar.cc/150?u=6"
    },
    {
        id: 7,
        prenom: "David",
        nom: "Cohen",
        job: "Consultant SEO",
        ville: "Strasbourg",
        lat: 48.5734,
        lng: 7.7521,
        photo: "https://i.pravatar.cc/150?u=7"
    },
    {
        id: 8,
        prenom: "Amina",
        nom: "Sow",
        job: "Community Manager",
        ville: "Toulouse",
        lat: 43.6047,
        lng: 1.4442,
        photo: "https://i.pravatar.cc/150?u=8"
    },
    {
        id: 9,
        prenom: "Maxime",
        nom: "Girard",
        job: "Fondateur Tech",
        ville: "Montpellier",
        lat: 43.6108,
        lng: 3.8767,
        photo: "https://i.pravatar.cc/150?u=9"
    },
    {
        id: 10,
        prenom: "Chloé",
        nom: "Dubois",
        job: "Coach Business",
        ville: "Nice",
        lat: 43.7102,
        lng: 7.2620,
        photo: "https://i.pravatar.cc/150?u=10"
    },
    // Ajoute plus de membres ici en copiant le bloc {}...
];

// Fonction pour dupliquer les données (pour simuler la "masse" de 50+ membres)
// A retirer quand tu auras de vraies données
const lotsOfMembers = [...members, ...members, ...members, ...members, ...members].map((m, i) => ({
    ...m, 
    id: i, // ID unique pour éviter les bugs
    lat: m.lat + (Math.random() - 0.5) * 0.1, // Légère dispersion GPS pour pas qu'ils soient tous empilés
    lng: m.lng + (Math.random() - 0.5) * 0.1
}));