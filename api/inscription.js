document.addEventListener('DOMContentLoaded', () => {
    
    // --- MODE MODIFICATION ---
    const memberToEditData = localStorage.getItem('memberToEdit');
    
    if (memberToEditData) {
        try {
            const member = JSON.parse(memberToEditData);
            
            // On remplit tout avec une sécurité (|| '')
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
            // Sujets d'intérêt (Tableau -> Texte)
            if (member.sujets_interet && Array.isArray(member.sujets_interet)) {
                document.getElementById('sujets_interet').value = member.sujets_interet.join(', ');
            }

            // Jauges
            const stats = member.stats || {};
            setSlider('bagou', stats.bagou || 3);
            setSlider('redac', stats.redac || 3);
            setSlider('terrain', stats.terrain || 3);
            setSlider('orga', stats.orga || 3);

            document.querySelector('h1').innerText = "Modifier : " + (member.prenom || 'Membre');
            document.querySelector('button[type="submit"]').innerText = "Mettre à jour le code";
            
        } catch (e) { console.error("Erreur chargement profil", e); }
        
        localStorage.removeItem('memberToEdit');
    }

    function setSlider(id, value) {
        const el = document.getElementById(id);
        const valDisplay = document.getElementById('val_' + id);
        if (el) { el.value = value; valDisplay.innerText = value + '/5'; }
    }

    // --- SOUMISSION ---
    document.getElementById('inscriptionForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const getVal = (id) => document.getElementById(id).value.trim();
        const prenom = getVal('prenom');
        const nom = getVal('nom');
        let photo = getVal('photo');
        
        // Image par défaut si vide
        if (!photo) photo = "https://ui-avatars.com/api/?name=" + prenom + "+" + nom + "&background=random&color=fff&size=256";

        const makeArray = (id) => getVal(id).split(',').map(s => s.trim()).filter(s => s.length > 0);
        const competences = makeArray('competences');
        const sujets_interet = makeArray('sujets_interet');

        const stats = {
            bagou: parseInt(document.getElementById('bagou').value) || 3,
            redac: parseInt(document.getElementById('redac').value) || 3,
            terrain: parseInt(document.getElementById('terrain').value) || 3,
            orga: parseInt(document.getElementById('orga').value) || 3
        };

        const idGenerated = (prenom + nom).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        const varName = idGenerated;

        const finalCode = `export const ${varName} = {
    id: "${idGenerated}",
    prenom: "${prenom}",
    nom: "${nom}",
    nom_code: "${getVal('nom_code')}",
    poste: "${getVal('poste')}",
    role_supp: "${getVal('role_supp')}",
    
    ville: "${getVal('ville')}",
    codePostal: "${getVal('codePostal')}",
    // lat: 0, 
    // lng: 0, 
    
    photo: "${photo}",
    
    bio: "${getVal('bio').replace(/"/g, '\\"')}",
    
    competences: ${JSON.stringify(competences)},
    sujets_interet: ${JSON.stringify(sujets_interet)},
    
    stats: ${JSON.stringify(stats, null, 8).replace("}", "    }")},

    linkedin: "${getVal('linkedin')}",
    email: "${getVal('email')}"
};`;

        const jsonOutput = document.getElementById('jsonOutput');
        jsonOutput.textContent = finalCode;
        document.getElementById('resultat').classList.remove('hidden');
        document.getElementById('resultat').scrollIntoView({ behavior: 'smooth' });
    });
});

function copierCode() {
    navigator.clipboard.writeText(document.getElementById('jsonOutput').textContent).then(() => alert("Copié !"));
}
