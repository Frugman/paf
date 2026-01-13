export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prenom, nom, job, ville, lat, lng, photo } = req.body;

  // Vérification basique
  if (!prenom || !nom || !ville) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  // Création du contenu du fichier JSON
  const newMember = {
    id: Date.now(),
    prenom,
    nom,
    job,
    ville,
    lat,
    lng,
    photo
  };

  const fileName = `membres/${prenom.toLowerCase()}-${nom.toLowerCase()}-${Date.now()}.json`
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/\s+/g, '-'); // Remplace les espaces par des tirets

  // On envoie à GitHub
  try {
    const response = await fetch(`https://api.github.com/repos/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/contents/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Annuaire-App'
      },
      body: JSON.stringify({
        message: `Nouvelle inscription : ${prenom} ${nom}`,
        content: Buffer.from(JSON.stringify(newMember, null, 2)).toString('base64')
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Inscription réussie !' });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ error: 'Erreur GitHub', details: errorData });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur Serveur', details: error.message });
  }
}
