export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { message, cycle } = req.body;
  if (!message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Message trop court' });
  }

  const cycleNum = parseInt(cycle) || 1;
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Tu es Kairos, un compagnon bienveillant pour l'expression émotionnelle.
L'utilisateur vient d'écrire ou de dicter ce qu'il a sur le cœur dans son journal intime numérique.

Date du jour : ${today}
Cycle actuel : ${cycleNum} (l'utilisateur en est à sa ${cycleNum}ème expression)

ÉTAPE 1 — DÉTECTION D'URGENCE VITALE (PRIORITÉ ABSOLUE)
Détecte ces situations critiques :
- "suicide" : idéations suicidaires, "j'en peux plus de vivre", "envie d'en finir"
- "violence_conjugale" : "il/elle me frappe", "il/elle me bat", coups, menaces physiques par un partenaire
- "viol" : "il/elle m'a violé(e)", "il/elle m'a forcé(e)", agression sexuelle
- "harcelement_grave" : harcèlement avec impact santé, cyberharcèlement avec menaces
- "violence_enfant" : maltraitance d'un enfant
- "aucune" : pas d'urgence vitale (cas par défaut)

Sois TRÈS PRUDENT : ne déclenche QUE si les signes sont clairs.

ÉTAPE 2 — DÉTECTION DE L'ÉTAT ÉMOTIONNEL
- "stress" : tension forte, colère, frustration intense, mots agressifs
- "neutral" : ton mesuré, factuel
- "calm" : formulation posée, recul présent

ÉTAPE 3 — RÉPONSE EMPATHIQUE (court et puissant, 3-4 phrases MAXIMUM)
Génère une réponse en 3 parties courtes :
1. Reformulation empathique (1-2 phrases) — montre que tu as VRAIMENT entendu ce qui se joue
2. Question d'ouverture d'esprit (1 phrase) — invite à un nouveau regard SANS donner de leçon, sans imposer
3. Perspective philosophique douce (1 phrase) — citation OU réflexion bienveillante orientée ouverture, sagesse, questionnement positif

Ne sois JAMAIS moralisateur. Reste humble. Ne dis pas "tu devrais" ou "il faut".

ÉTAPE 4 — MESSAGE DE CONCLUSION VARIABLE (à utiliser selon ce que dira l'utilisateur dans l'auto-évaluation)
Génère 3 messages de conclusion DIFFÉRENTS et PERSONNALISÉS pour cette session précise (jamais génériques) :
- "calm_message" : si l'utilisateur dira "Serein" — message court bienveillant qui célèbre ce moment
- "neutral_message" : si l'utilisateur dira "Apaisé" — message court qui valide le chemin parcouru
- "stress_message" : si l'utilisateur dira "Encore tendu" — message court bienveillant qui invite (sans pousser) à exprimer encore

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "urgency": "aucune" | "suicide" | "violence_conjugale" | "viol" | "harcelement_grave" | "violence_enfant",
  "emotional_state": "stress" | "neutral" | "calm",
  "response": {
    "reformulation": "1-2 phrases courtes qui reformulent avec empathie ce que l'utilisateur a exprimé",
    "question": "1 phrase — question d'ouverture d'esprit bienveillante",
    "perspective": "1 phrase — citation OU réflexion philosophique douce"
  },
  "conclusions": {
    "calm_message": "...",
    "neutral_message": "...",
    "stress_message": "..."
  }
}

Message de l'utilisateur : "${message.trim()}"`;

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
