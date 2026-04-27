export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { emotion, type, date } = req.body;
  const today = date || new Date().toISOString().split('T')[0];
  const validEmotions = ['stress', 'neutral', 'calm'];
  const validTypes = ['breathing', 'move'];

  if (!validEmotions.includes(emotion) || !validTypes.includes(type)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  const emotionContext = {
    stress: 'pour quelqu\'un sous tension/stress qui a besoin de retrouver son calme rapidement',
    neutral: 'pour quelqu\'un dans un état neutre qui veut cultiver présence et bienveillance',
    calm: 'pour quelqu\'un déjà serein qui veut amplifier et honorer cet état'
  };

  let prompt;

  if (type === 'breathing') {
    prompt = `Tu es un expert en techniques de respiration validées scientifiquement (cohérence cardiaque, méthode Wim Hof, pranayama, soupir physiologique de Stanford, méthode 4-7-8, respiration carrée, etc.).

Génère 6 exercices de respiration différents ${emotionContext[emotion]}.

CONTRAINTES STRICTES :
- Uniquement des techniques RÉELLES et VALIDÉES (pas d'invention)
- Adapter la formulation au contexte émotionnel
- Chaque exercice doit être SÛR (pas d'hyperventilation extrême, pas de rétention prolongée pour personnes à risque)
- Description claire et concrète : combien de temps, comment faire
- Effet bienveillant : aucun objectif de "performance"

Date du jour : ${today} (utilise comme graine pour varier les formulations chaque jour)

Réponds UNIQUEMENT en JSON valide :
{
  "exercises": [
    { "content": "Description claire de l'exercice (50-80 mots)", "action": "Effet bienveillant attendu (15-25 mots)" },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." }
  ]
}`;
  } else {
    prompt = `Tu es un expert en mouvement bien-être (PAS de performance sportive). Tu connais yoga doux, marche méditative, étirements, qi gong, tai-chi, danse libre, mouvements somatiques, etc.

Génère 6 exercices de mouvement différents ${emotionContext[emotion]}.

CONTRAINTES STRICTES :
- Mouvements DOUX et ACCESSIBLES à toute personne (pas d'effort sportif intense)
- AUCUNE performance — uniquement bien-être
- Réalisable n'importe où (chez soi, au bureau, dehors)
- Aucun matériel requis
- Durée courte : 1 à 10 minutes
- Description claire et concrète

Date du jour : ${today} (utilise comme graine pour varier chaque jour)

Réponds UNIQUEMENT en JSON valide :
{
  "exercises": [
    { "content": "Description claire (50-80 mots)", "action": "Bénéfice bien-être (15-25 mots)" },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." },
    { "content": "...", "action": "..." }
  ]
}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) return res.status(500).json({ error: 'Erreur IA' });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    let result;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else throw new Error('JSON invalide');
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
