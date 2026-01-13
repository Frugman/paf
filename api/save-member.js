module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    // On récupère aussi memberId
    const { fileName, fileContent, memberId } = req.body;
    
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    if (!token || !owner || !repo) {
        return res.status(500).json({ message: 'Config manquante' });
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Place-Aux-Femmes-App'
    };

    try {
        // --- OPERATION 1 : CRÉER LA FICHE DU MEMBRE ---
        const pathMember = `membres/${fileName}`;
        const contentMember = Buffer.from(fileContent).toString('base64');

        // On vérifie si le fichier existe déjà pour récupérer son SHA (mise à jour) ou null (création)
        let shaMember = null;
        try {
            const check = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathMember}`, { headers });
            if (check.ok) {
                const data = await check.json();
                shaMember = data.sha;
            }
        } catch (e) {}

        const bodyMember = {
            message: `Ajout membre : ${fileName}`,
            content: contentMember
        };
        if (shaMember) bodyMember.sha = shaMember;

        const resMember = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathMember}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(bodyMember)
        });

        if (!resMember.ok) throw new Error('Erreur création fiche membre');


        // --- OPERATION 2 : METTRE À JOUR L'INDEX ---
        // Seulement si c'est une nouvelle création (si on met à jour une fiche existante, pas besoin de toucher à l'index)
        if (!shaMember) {
            const pathIndex = `membres/index.js`;
            
            // 1. On récupère le fichier index.js actuel
            const resGetIndex = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathIndex}`, { headers });
            if (!resGetIndex.ok) throw new Error('Impossible de lire index.js');
            
            const dataIndex = await resGetIndex.json();
            const shaIndex = dataIndex.sha;
            let contentIndex = Buffer.from(dataIndex.content, 'base64').toString('utf-8');

            // 2. On prépare les lignes à injecter
            // Ligne d'import : import { id } from './fichier.js';
            const importLine = `import { ${memberId} } from './${fileName}';`;
            
            // 3. On injecte l'Import tout en haut
            // On cherche le dernier import pour mettre le nôtre après, ou au début
            if (!contentIndex.includes(importLine)) {
                contentIndex = importLine + '\n' + contentIndex;
            }

            // 4. On injecte le membre dans le tableau
            // On cherche "export const lotsOfMembers = ["
            // Et on ajoute notre membre juste après le crochet ouvrant
            const listStart = "export const lotsOfMembers = [";
            if (contentIndex.includes(listStart) && !contentIndex.includes(` ${memberId},`)) {
                contentIndex = contentIndex.replace(listStart, `${listStart}\n    ${memberId},`);
            }

            // 5. On renvoie le fichier index.js modifié
            const bodyIndex = {
                message: `Auto-update index pour ${memberId}`,
                content: Buffer.from(contentIndex).toString('base64'),
                sha: shaIndex
            };

            const resUpdateIndex = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${pathIndex}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(bodyIndex)
            });

            if (!resUpdateIndex.ok) throw new Error('Erreur mise à jour index');
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Erreur API:", error);
        return res.status(500).json({ message: error.message });
    }
};
