// Kairos - Expression libre API
// Reformulation classique (PAS de CNV imposée)
// 3 versions ciblées avec contexte complet

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { message, objective, interlocutor } = req.body;
  if (!message || message.trim().length < 5) return res.status(400).json({ error: 'Message trop court' });

  const validObjectives = ['apaiser', 'compris', 'limite', 'calme', 'pro', 'officielle'];
  const validInterlocutors = ['partenaire', 'famille', 'ami', 'collegue', 'hierarchie', 'admin'];
  const obj = validObjectives.includes(objective) ? objective : 'apaiser';
  const inter = validInterlocutors.includes(interlocutor) ? interlocutor : 'famille';

  const objectiveContext = {
    apaiser: "L'utilisateur veut désamorcer ou apaiser. Le message doit ouvrir, pas fermer.",
    compris: "L'utilisateur veut être entendu. Le message doit faire passer son vécu sans accuser.",
    limite: "L'utilisateur pose une limite. Le message doit être clair, sans agressivité ni excuse.",
    calme: "L'utilisateur répond à une situation tendue. Le message doit baisser la température.",
    pro: "L'utilisateur fait une demande professionnelle. Le message doit être structuré, factuel.",
    officielle: "L'utilisateur effectue une démarche formelle. Le message doit suivre les codes du courrier officiel."
  };

  const interlocutorContext = {
    partenaire: "Partenaire amoureux. Tutoiement intime, registre du couple, possibilité de marques d'affection.",
    famille: "Membre de famille (parent, fratrie, enfant). Tutoiement familial, registre proche.",
    ami: "Ami(e) du cercle proche. Tutoiement chaleureux, registre détendu.",
    collegue: "Collègue de niveau équivalent. Vouvoiement par défaut, registre courtois.",
    hierarchie: "Manager, patron, RH. VOUVOIEMENT OBLIGATOIRE, mail pro structuré.",
    admin: "Administration, propriétaire, prestataire. VOUVOIEMENT OBLIGATOIRE, courrier formel."
  };

  const useVous = ['hierarchie', 'admin', 'collegue'].includes(inter);
  const tutVouv = useVous ? "VOUVOIEMENT OBLIGATOIRE" : "Tutoiement";
  const lengthGuide = inter === 'admin' || inter === 'hierarchie'
    ? "Style mail/courrier structuré (3-6 phrases)."
    : "Style message naturel (2-5 phrases).";

  const prompt = `Tu es Kairos, expert en communication écrite et orale.

L'utilisateur a écrit ou dicté un message brut, possiblement chargé d'émotion (colère, frustration, déception, humiliation). Tu dois le transformer en une version envoyable, claire, percutante.

=== RÈGLES IMPORTANTES ===
- Tu NE FAIS PAS de CNV (Communication Non-Violente). Pas de structure Observation/Sentiment/Besoin/Demande imposée.
- Tu fais de la REFORMULATION CLASSIQUE améliorée : correction des fautes, syntaxe propre, structure claire, suppression des insultes/agressions tout en préservant le sens et l'intention de l'utilisateur.
- Le message reformulé doit sonner authentique, comme si l'utilisateur l'avait écrit lui-même mais en mieux.
- ÉVITER ABSOLUMENT les tics d'IA : "Je comprends que", "Il est important de", "Je tiens à", "Effectivement", "En effet"
- Pas de sur-politesse française qui sonne faux.

=== CONTEXTE 1 : OBJECTIF DE L'UTILISATEUR ===
${objectiveContext[obj]}

=== CONTEXTE 2 : INTERLOCUTEUR ===
${interlocutorContext[inter]}

=== CONTEXTE 3 : FORME ===
- ${tutVouv}
- ${lengthGuide}

=== TON TRAVAIL ===
Génère 3 VERSIONS DISTINCTES :

VERSION "Plus doux" :
- Tonalité empathique, ouverte
- Reconnaissance de l'autre
- Demande sous forme d'ouverture au dialogue

VERSION "Plus direct" :
- Faits clairs, position assumée
- Pas d'enrobage, pas de "désolé(e) mais"
- Respectueux mais sans détour

VERSION "Plus ferme" :
- Position non-négociable affirmée tranquillement
- Autorité posée
- Limite claire

CHAQUE VERSION DOIT ÊTRE VRAIMENT DIFFÉRENTE.

=== COMMENTAIRE PÉDAGOGIQUE ===
Pour chaque version, rédige UN commentaire pédagogique COURT (max 15 mots) qui explique ce qui rend cette version efficace dans CE contexte précis. Sois SPÉCIFIQUE au message.

=== FORMAT JSON OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide :
{
  "doux": {
    "message_reformule": "Le message reformulé prêt à envoyer.",
    "ameliorations": ["amélioration 1", "amélioration 2", "amélioration 3"],
    "tip": "Commentaire pédagogique court spécifique."
  },
  "direct": {
    "message_reformule": "...",
    "ameliorations": [...],
    "tip": "..."
  },
  "ferme": {
    "message_reformule": "...",
    "ameliorations": [...],
    "tip": "..."
  }
}

Message original : "${message.trim()}"`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
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
