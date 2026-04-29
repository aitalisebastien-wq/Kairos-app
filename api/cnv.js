export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { message, register } = req.body;
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Message trop court' });
  }

  const validRegisters = ['apaise', 'courant', 'assertif', 'professionnel'];
  const reg = validRegisters.includes(register) ? register : 'courant';

  const registerInstructions = {
    apaise: `REGISTRE APAISÉ : tonalité douce, ouverte, qui invite au dialogue plutôt qu'à l'affrontement. Utilise un vocabulaire chaleureux, des formulations qui désamorcent. Pour un proche avec qui on veut éviter le conflit. Tutoiement.`,
    courant: `REGISTRE COURANT : naturel, chaleureux, registre du quotidien. Tutoiement. Pour parler à un ami, un membre de la famille, un partenaire. Direct mais bienveillant.`,
    assertif: `REGISTRE ASSERTIF : ferme et clair, sans agressivité. Affirmation nette de ses besoins et limites. Pour poser ses limites face à un comportement répété. Tutoiement possible mais ton plus posé.`,
    professionnel: `REGISTRE PROFESSIONNEL : formel, vouvoiement OBLIGATOIRE, vocabulaire élevé, structure formelle sans froideur excessive. Pour patron, client, institution.`
  };

  const prompt = `Tu es Kairos, expert en Communication Non Violente (méthode Marshall Rosenberg).

Transforme ce message en CNV en respectant STRICTEMENT le registre demandé.

${registerInstructions[reg]}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "observation": "description factuelle des faits, sans jugement",
  "sentiment": "ce que la personne ressent (émotions)",
  "besoin": "le besoin profond derrière le sentiment",
  "demande": "demande claire, concrète et négociable",
  "message_complet": "le message complet en un paragraphe fluide qui intègre les 4 étapes naturellement",
  "score_empathie": nombre entre 70 et 98,
  "score_clarte": nombre entre 70 et 98,
  "score_reduction_violence": nombre entre 75 et 99
}

Le message_complet doit sonner naturel — pas mécanique. Il doit pouvoir être envoyé tel quel.

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) return res.status(500).json({ error: 'Erreur IA — réessayez' });

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
