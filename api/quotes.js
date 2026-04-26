export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { emotion, date } = req.body;

  // Date du jour pour que les citations changent chaque jour
  const today = date || new Date().toISOString().split('T')[0];

  const emotionContext = {
    stress: 'des citations apaisantes pour quelqu\'un qui se sent stressé, tendu ou submergé. Citations qui aident à retrouver son calme et sa perspective.',
    neutral: 'des citations inspirantes pour quelqu\'un dans un état neutre. Citations qui éveillent à la beauté du quotidien et à la pleine conscience.',
    calm: 'des citations profondes pour quelqu\'un déjà calme. Citations qui amplifient et célèbrent la sérénité et la sagesse intérieure.'
  };

  const prompt = `Tu es un sage philosophe contemporain. Génère 6 citations philosophiques INÉDITES (pas des citations célèbres connues) sur les thèmes :
- Bien-être et sérénité intérieure
- Intelligence émotionnelle
- Ouverture d'esprit
- Bienveillance et connexion humaine
- Pleine conscience et présence
- Sagesse pratique

Contexte : ${emotionContext[emotion] || emotionContext.calm}

Date du jour : ${today} (utilise cette date comme graine pour générer des citations vraiment différentes de celles d'autres jours).

Chaque citation doit être :
- Originale et profonde (pas de clichés)
- Courte (15 à 30 mots maximum)
- Authentiquement bienveillante
- Attribuée à un nom plausible (philosophe contemporain, sage, ou citation anonyme moderne)

Réponds UNIQUEMENT en JSON valide :
{
  "quotes": [
    { "text": "citation 1", "author": "nom auteur" },
    { "text": "citation 2", "author": "nom auteur" },
    { "text": "citation 3", "author": "nom auteur" },
    { "text": "citation 4", "author": "nom auteur" },
    { "text": "citation 5", "author": "nom auteur" },
    { "text": "citation 6", "author": "nom auteur" }
  ]
}`;

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Erreur IA' });
    }

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
