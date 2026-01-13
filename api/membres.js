export default async function handler(req, res) {
  try {
    // 1. On récupère les infos de ton dépôt
    // Note : Si ça ne marche pas, remplace process.env.VERCEL_GIT... par ton nom d'utilisateur et nom de projet entre guillemets
    const repoOwner = process.env.VERCEL_GIT_REPO_OWNER; 
    const repoName = process.env.VERCEL_GIT_REPO_SLUG;
    const token = process.env.GITHUB_TOKEN;

    // 2. On demande à GitHub la liste des fichiers dans le dossier "membres"
    const listUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/membres`;
    
    const response = await fetch(listUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Si le dossier n'existe pas encore (0 inscrits), on renvoie une liste vide
    if (response.status === 404) {
      return res.status(200).json([]);
    }

    const files = await response.json();

    // 3. On va lire le contenu de chaque fichier JSON trouvé
    const membersPromises = files
      .filter(file => file.name.endsWith('.json')) // On ne garde que les .json
      .map(async (file) => {
         const fileRes = await fetch(file.download_url);
         return await fileRes.json();
      });

    const realMembers = await Promise.all(membersPromises);

    // 4. On renvoie la liste propre au site
    res.status(200).json(realMembers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
}
