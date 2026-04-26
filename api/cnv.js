export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { message } = req.body;
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Message trop court' });
  }

  const prompt = `Tu es Kairos, expert en Communication Non Violente (méthode Marshall Rosenberg).

Transforme ce message en CNV en générant DEUX VERSIONS DIFFÉRENTES :

1. REGISTRE COURANT : chaleureux, naturel, tutoiement, adapté à un proche.
2. REGISTRE SOUTENU : formel, vouvoiement OBLIGATOIRE, vocabulaire élevé, adapté à un patron ou une institution.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "courant": {
    "observation": "...",
    "sentiment": "...",
    "besoin": "...",
    "demande": "...",
    "message_complet": "le message complet en un paragraphe fluide"
  },
  "soutenu": {
    "observation": "...",
    "sentiment": "...",
    "besoin": "...",
    "demande": "...",
    "message_complet": "le message complet en un paragraphe fluide"
  },
  "score_empathie": nombre entre 70 et 98,
  "score_clarte": nombre entre 70 et 98,
  "score_reduction_violence": nombre entre 75 et 99
}

Les deux versions doivent être VRAIMENT DIFFÉRENTES dans le ton, le vocabulaire et la formulation.

Message à transformer : "${message.trim()}"`;

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

    if (!response.ok) {
      return res.status(500).json({ error: 'Erreur IA — réessayez' });
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
    return res.status(500).json({ error: 'Erreur serveur — réessayez' });
  }
}
