export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { fileName, fileContent } = req.body;
    
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    if (!token || !owner || !repo) {
        return res.status(500).json({ message: 'Configuration serveur incomplète. Vérifiez les variables Vercel.' });
    }

    try {
        const path = `membres/${fileName}`;
        const message = `Nouvelle inscription : ${fileName}`;
        const content = Buffer.from(fileContent).toString('base64');

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Place-Aux-Femmes-App'
            },
            body: JSON.stringify({
                message: message,
                content: content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur inconnue côté GitHub');
        }

        return res.status(200).json({ success: true, message: 'Fiche créée avec succès !' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}
