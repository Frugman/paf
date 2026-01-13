import { lotsOfMembers } from './membres/index.js';

document.addEventListener('DOMContentLoaded', () => {

    // CARTE
    const map = L.map('map').setView([46.603354, 1.888334], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // MÉLANGE
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    const shuffledMembers = shuffleArray([...lotsOfMembers]);
    document.getElementById('member-count').innerText = `${shuffledMembers.length} membre(s) actif(s)`;

    const gridContainer = document.getElementById('members-grid');
    const markers = [];

    // BOUTON "NOUS REJOINDRE"
    const addCard = document.createElement('a');
    addCard.href = "inscription.html";
    addCard.className = "group block bg-gray-50 p-6 rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px]";
    addCard.innerHTML = `
        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-500 transition-colors">
            <span class="text-2xl text-indigo-600 group-hover:text-white font-bold pb-1">+</span>
        </div>
        <span class="text-indigo-600 font-bold text-sm">Nous rejoindre</span>
    `;
    gridContainer.appendChild(addCard);

    // GÉNÉRATION DES MINI-FICHES (NOUVELLE PRÉSENTATION)
    shuffledMembers.forEach(member => {
        const lieu = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;
        
        // On construit la mini fiche
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-100 flex items-start space-x-4 cursor-pointer group hover:border-indigo-300";
        
        card.onclick = () => openModal(member);

        // Layout : Photo à gauche, Tout le reste dans la colonne de droite
        card.innerHTML = `
            <img src="${member.photo}" alt="${member.prenom}" class="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-sm group-hover:border-indigo-400 transition-colors flex-shrink-0">
            
            <div class="flex-1 min-w-0 flex flex-col items-start justify-center">
                <h3 class="font-bold text-gray-900 text-lg leading-tight">${member.prenom} ${member.nom}</h3>
                
                ${member.nom_code ? `<p class="font-mono text-indigo-500 text-xs font-bold uppercase tracking-widest mt-1">${member.nom_code}</p>` : ''}
                
                <p class="text-gray-400 text-xs mt-2 flex items-center gap-1">📍 ${lieu}</p>

                ${member.role_supp ? `<span class="inline-block bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-2">${member.role_supp}</span>` : ''}
            </div>
        `;
        gridContainer.appendChild(card);

        if (member.lat && member.lng) {
            const marker = L.marker([member.lat, member.lng]).addTo(map).bindPopup(`<b>${member.prenom} ${member.nom}</b><br>${member.nom_code}`);
            marker.on('click', () => openModal(member));
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 12 });
    }
});

// POP-UP / MODALE
function openModal(member) {
    const modal = document.getElementById('profile-modal');
    const content = document.getElementById('modal-content');
    const lieu = member.codePostal ? `${member.codePostal} ${member.ville}` : member.ville;

    let statsHtml = '';
    if (member.stats) {
        statsHtml = '<div class="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 bg-gray-50 p-4 rounded-lg">';
        const labels = { bagou: 'Bagou', redac: 'Rédac', terrain: 'Terrain', orga: 'Orga' };
        for (const [key, score] of Object.entries(member.stats)) {
            const percent = score * 20;
            const label = labels[key] || key;
            statsHtml += `
                <div class="flex flex-col">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                        <span class="uppercase font-bold tracking-wider">${label}</span>
                        <span class="font-bold text-indigo-600">${score}/5</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style="width: ${percent}%"></div>
                    </div>
                </div>`;
        }
        statsHtml += '</div>';
    }

    let tagsHtml = '';
    if (member.competences && member.competences.length > 0) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mt-4">';
        member.competences.forEach(tag => tagsHtml += `<span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">${tag}</span>`);
        tagsHtml += '</div>';
    }

    let sujetsHtml = '';
    if (member.sujets_interet && member.sujets_interet.length > 0) {
         // Changement de titre : MES COMBATS
         sujetsHtml = '<div class="mt-4"><h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2">Mes Combats</h3><div class="flex flex-wrap gap-2">';
         // On garde le vert pour les tags, ou on peut changer si tu veux
         member.sujets_interet.forEach(sujet => sujetsHtml += `<span class="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">${sujet}</span>`);
         sujetsHtml += '</div></div>';
    }

    const roleHtml = member.role_supp ? `<span class="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">${member.role_supp}</span>` : '';

    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 relative">
            <div class="flex flex-col items-center md:items-start md:w-1/3 flex-shrink-0">
                <img src="${member.photo}" class="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-lg mb-4">
                
                <h2 class="text-2xl font-bold text-gray-900 text-center md:text-left leading-tight">${member.prenom} ${member.nom}</h2>
                
                ${member.nom_code ? `<p class="font-mono text-indigo-500 font-bold uppercase text-sm tracking-widest mb-1 mt-1">CODE : ${member.nom_code}</p>` : ''}
                
                <p class="text-indigo-600 font-medium text-lg text-center md:text-left mb-2 mt-2">${member.poste}</p>
                ${roleHtml}
                <p class="text-gray-500 text-sm flex items-center gap-1 mt-1 mb-6"><i class="fas fa-map-marker-alt"></i> ${lieu}</p>
                
                ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" class="w-full text-center bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors shadow-sm mb-3"><i class="fab fa-linkedin mr-2"></i> LinkedIn</a>` : ''}
                
                <div class="w-full flex gap-2">
                    <button id="btn-modifier-fiche" class="flex-1 text-center bg-gray-100 text-gray-600 font-bold py-2 px-4 rounded hover:bg-gray-200 hover:text-indigo-600 transition-colors text-xs flex items-center justify-center gap-2">
                        <i class="fas fa-pen"></i> Modifier
                    </button>
                    <button id="btn-supprimer-fiche" class="flex-1 text-center bg-red-50 text-red-600 font-bold py-2 px-4 rounded hover:bg-red-100 transition-colors text-xs flex items-center justify-center gap-2 border border-red-100">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>

            <div class="md:w-2/3 md:border-l md:border-gray-100 md:pl-8 pt-2">
                ${member.bio ? `<div class="bg-indigo-50/50 p-6 rounded-lg border-l-4 border-indigo-300 italic text-gray-700 mb-6 mt-4 md:mt-0 relative"><i class="fas fa-quote-left text-indigo-200 absolute top-2 left-2 text-xl"></i><p class="relative z-10">"${member.bio}"</p></div>` : ''}
                
                <h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2 mt-6">Compétences</h3>
                ${tagsHtml || '<p class="text-gray-400 text-sm italic">Aucune compétence listée</p>'}
                
                ${sujetsHtml}

                <h3 class="font-bold text-gray-900 uppercase text-xs tracking-wider mt-8 mb-2">Super Pouvoirs</h3>
                ${statsHtml}
            </div>
        </div>
    `;

    // BOUTON MODIFIER
    document.getElementById('btn-modifier-fiche').onclick = function() {
        localStorage.setItem('memberToEdit', JSON.stringify(member));
        window.location.href = 'inscription.html';
    };

    // BOUTON SUPPRIMER
    document.getElementById('btn-supprimer-fiche').onclick = async function() {
        if(!confirm(`Êtes-vous SÛRE de vouloir supprimer définitivement ${member.prenom} ${member.nom} ?\n\nCette action est irréversible.`)) return;
        
        const code = prompt("🔒 Sécurité : Entrez le code administrateur pour confirmer la suppression (C'est 1234 par défaut) :");
        if (!code) return;

        const btn = document.getElementById('btn-supprimer-fiche');
        btn.innerText = "Suppression...";
        btn.disabled = true;

        try {
            const response = await fetch('/api/delete-member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    memberId: member.id, 
                    fileName: `${member.id}.js`,
                    secret: code
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Membre supprimé avec succès.\n\nL'annuaire va se mettre à jour dans 1 minute.");
                closeModal();
                location.reload(); 
            } else {
                alert("❌ Erreur : " + result.message);
                btn.innerText = "Réessayer";
                btn.disabled = false;
            }
        } catch (e) {
            alert("Erreur technique : " + e.message);
        }
    };

    modal.classList.remove('hidden');
}
