module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { memberId, fileName, secret } = req.body;

    // SÉCURITÉ BASIQUE : Remplace '1234' par le code de ton choix
    if (secret !== '1234') { 
        return res.status(403).json({ message: 'Code secret incorrect !' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Place-Aux-Femmes-App'
    };

    try {
        // --- ACTION 1 : NETTOYER L'INDEX (On commence par ça pour éviter le crash) ---
        const pathIndex = `membres/index.js`;
        const resGetIndex = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathIndex}`, { headers });
        if (resGetIndex.ok) {
            const dataIndex = await resGetIndex.json();
            let contentIndex = Buffer.from(dataIndex.content, 'base64').toString('utf-8');

            // On retire la ligne d'import
            // Regex : cherche "import { truc } from './truc.js';" avec ou sans saut de ligne
            const regexImport = new RegExp(`import\\s*{\\s*${memberId}\\s*}\\s*from\\s*['"]\\.\\/${fileName}['"];?\\n?`, 'g');
            contentIndex = contentIndex.replace(regexImport, '');

            // On retire le membre de la liste
            // Regex : cherche "truc," avec les espaces autour
            const regexList = new RegExp(`\\s*${memberId},?\\n?`, 'g');
            // On cible uniquement l'intérieur du tableau (simplifié ici, on retire juste l'occurrence dans la liste)
            contentIndex = contentIndex.replace(regexList, '\n    '); 

            // On sauvegarde l'index propre
            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathIndex}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    message: `Suppression membre : ${memberId} (Index update)`,
                    content: Buffer.from(contentIndex).toString('base64'),
                    sha: dataIndex.sha
                })
            });
        }

        // --- ACTION 2 : SUPPRIMER LE FICHIER DU MEMBRE ---
        const pathMember = `membres/${fileName}`;
        // Il faut d'abord récupérer le SHA du fichier pour avoir le droit de le supprimer
        const resGetMember = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathMember}`, { headers });
        
        if (resGetMember.ok) {
            const dataMember = await resGetMember.json();
            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathMember}`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify({
                    message: `Suppression membre : ${memberId}`,
                    sha: dataMember.sha
                })
            });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
