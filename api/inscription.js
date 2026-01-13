document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTION DU MODE "MODIFIER" ---
    const memberToEditData = localStorage.getItem('memberToEdit');
    
    if (memberToEditData) {
        try {
            const member = JSON.parse(memberToEditData);
            
            // PRE-REMPLISSAGE ROBUSTE (Ne plante pas si un champ manque)
            document.getElementById('prenom').value = member.prenom || '';
            document.getElementById('nom').value = member.nom || '';
            document.getElementById('nom_code').value = member.nom_code || '';
            document.getElementById('poste').value = member.poste || '';
            document.getElementById('role_supp').value = member.role_supp || '';
            document.getElementById('ville').value = member.ville || '';
            document.getElementById('codePostal').value = member.codePostal || '';
            document.getElementById('bio').value = member.bio || '';
            document.getElementById('photo').value = member.photo || '';
            document.getElementById('linkedin').value = member.linkedin || '';
            document.getElementById('email').value = member.email || '';
            
            // Compétences (Tableau -> Texte)
            if (member.competences && Array.isArray(member.competences)) {
                document.getElementById('competences').value = member.competences.join(', ');
            }

            // Jauges (Avec valeurs par défaut si inexistantes)
            const stats = member.stats || {};
            setSlider('bagou', stats.bagou || 3);
            setSlider('redac', stats.redac || 3);
            setSlider('terrain', stats.terrain || 3);
            setSlider('orga', stats.orga || 3);

            // Changement visuel pour indiquer le mode édition
            document.querySelector('h1').innerText = "Modifier : " + (member.prenom || 'Membre');
            document.querySelector('button[type="submit"]').innerText = "Mettre à jour le code";
            
        } catch (e) {
            console.error("Erreur lors du chargement du profil :", e);
        }
        
        // Nettoyage de la mémoire
        localStorage.removeItem('memberToEdit');
    }

    function setSlider(id, value) {
        const el = document.getElementById(id);
        const valDisplay = document.getElementById('val_' + id);
        if (el) {
            el.value = value;
            valDisplay.innerText = value + '/5';
        }
    }


    // --- 2. GESTION DE LA SOUMISSION ---
    const form = document.getElementById('inscriptionForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Récupération sécurisée
        const prenom = document.getElementById('prenom').value.trim();
        const nom = document.getElementById('nom').value.trim();
        const nom_code = document.getElementById('nom_code').value.trim();
        const poste = document.getElementById('poste').value.trim();
        const role_supp = document.getElementById('role_supp').value.trim();
        const ville = document.getElementById('ville').value.trim();
        const codePostal = document.getElementById('codePostal').value.trim();
        const bio = document.getElementById('bio').value.trim();
        let photo = document.getElementById('photo').value.trim();
        const linkedin = document.getElementById('linkedin').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // Image par défaut si vide (Gris neutre)
        if (!photo) {
            photo = "https://ui-avatars.com/api/?name=" + prenom + "+" + nom + "&background=random&color=fff&size=256";
        }

        // Compétences
        const competencesRaw = document.getElementById('competences').value;
        const competences = competencesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Stats
        const stats = {
            bagou: parseInt(document.getElementById('bagou').value) || 3,
            redac: parseInt(document.getElementById('redac').value) || 3,
            terrain: parseInt(document.getElementById('terrain').value) || 3,
            orga: parseInt(document.getElementById('orga').value) || 3
        };

        // Génération ID unique (Slug)
        const idGenerated = (prenom + nom)
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");

        // Nom de la variable JS (CamelCase pour faire joli)
        const varName = idGenerated;

        // CONSTRUCTION DU CODE FINAL (Format Module ES6)
        // On construit une chaîne de caractères qui ressemble au fichier final
        // C'est plus simple pour l'admin !
        
        const finalCode = `export const ${varName} = {
    id: "${idGenerated}",
    prenom: "${prenom}",
    nom: "${nom}",
    nom_code: "${nom_code}", // Optionnel
    poste: "${poste}",
    role_supp: "${role_supp}", // Optionnel
    
    ville: "${ville}",
    codePostal: "${codePostal}",
    // lat: 0, // À remplir par l'admin ou via un site comme https://www.coordonnees-gps.fr/
    // lng: 0, 
    
    photo: "${photo}",
    
    bio: "${bio.replace(/"/g, '\\"')}", // On échappe les guillemets pour éviter les bugs
    
    competences: ${JSON.stringify(competences)},
    
    stats: ${JSON.stringify(stats, null, 8).replace("}", "    }")},

    linkedin: "${linkedin}",
    email: "${email}"
};`;

        // Affichage
        const resultDiv = document.getElementById('resultat');
        const jsonOutput = document.getElementById('jsonOutput');
        
        jsonOutput.textContent = finalCode;
        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
});

function copierCode() {
    const code = document.getElementById('jsonOutput').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert("Code copié ! Créez un fichier '" + code.match(/id: "([^"]+)"/)[1] + ".js' dans le dossier 'membres/' et collez-le.");
    });
}
