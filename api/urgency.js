export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { message } = req.body;
  if (!message || message.trim().length < 5) return res.status(400).json({ urgency: 'aucune' });

  const prompt = `Tu es un analyseur de sécurité ultra-prudent.

Analyse le message ci-dessous pour détecter une situation d'URGENCE VITALE.

Catégories possibles :
- "suicide" : idéations suicidaires claires, "j'en peux plus de vivre", "envie d'en finir", auto-destruction explicite
- "violence_conjugale" : "il/elle me frappe", "il/elle me bat", coups, menaces physiques par un partenaire actuel
- "viol" : "il/elle m'a violé(e)", "il/elle m'a forcé(e)", agression sexuelle subie
- "harcelement_grave" : harcèlement avec impact santé, cyberharcèlement avec menaces graves
- "violence_enfant" : maltraitance d'un enfant, abus sur mineur
- "aucune" : pas d'urgence vitale détectée (cas par défaut)

RÈGLE ABSOLUE : Sois TRÈS PRUDENT. Ne déclenche QUE si les signes sont CLAIRS et SANS AMBIGUÏTÉ.
- "j'en ai marre" SEUL → "aucune"
- "je veux le tuer" dans contexte de colère → "aucune" (figure de style)
- "j'ai envie de me tuer" SANS contexte d'humour → "suicide"
- "il m'a frappé" → "violence_conjugale" SI clairement un partenaire

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "urgency": "aucune" | "suicide" | "violence_conjugale" | "viol" | "harcelement_grave" | "violence_enfant"
}

Message : "${message.trim()}"`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 100, messages: [{ role: 'user', content: prompt }] })
    });
    if (!response.ok) return res.status(200).json({ urgency: 'aucune' });
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    let result;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { urgency: 'aucune' };
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json({ urgency: 'aucune' });
  }
}
