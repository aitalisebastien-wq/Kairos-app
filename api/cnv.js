// Kairos - Communication Non Violente API
// Génère 3 versions ciblées (Plus doux / Plus direct / Plus ferme)
// avec contexte ultra-précis (objectif x interlocuteur)
// + commentaire pédagogique adapté

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

  // ═══ CONTEXTE PRÉCIS PAR OBJECTIF ═══
  const objectiveContext = {
    apaiser: "L'utilisateur veut désamorcer un conflit ou réparer une relation. Le message doit ouvrir le dialogue, pas le fermer. Reconnaître la valeur du lien.",
    compris: "L'utilisateur veut faire entendre ce qu'il ressent vraiment. Le message doit communiquer son vécu intérieur sans accuser l'autre.",
    limite: "L'utilisateur affirme un refus ou défend ses droits. Le message pose une limite claire sans agressivité, sans excuse excessive.",
    calme: "L'utilisateur répond à un message ou une situation tendue. Le message doit baisser la température sans céder, montrer qu'il a réfléchi.",
    pro: "L'utilisateur fait une demande professionnelle (augmentation, congé, négociation). Le message doit être structuré, factuel, orienté solution.",
    officielle: "L'utilisateur effectue une démarche administrative ou un courrier formel. Le message doit suivre les codes du courrier formel français."
  };

  // ═══ CONTEXTE PRÉCIS PAR INTERLOCUTEUR ═══
  const interlocutorContext = {
    partenaire: "À son partenaire amoureux (conjoint(e), copain/copine). Tutoiement intime. Registre du quotidien amoureux. On peut utiliser des marques d'affection. Le 'nous/on' est puissant pour rappeler le lien.",
    famille: "À un membre de famille (parent, enfant, frère, sœur). Tutoiement familial. Registre proche mais avec respect des dynamiques familiales. Éviter les reproches sur le passé.",
    ami: "À un(e) ami(e) du cercle proche. Tutoiement chaleureux. Registre détendu mais on peut être direct. L'amitié permet la franchise.",
    collegue: "À un(e) collègue de niveau hiérarchique équivalent. Tutoiement OU vouvoiement selon contexte (privilégier vouvoiement si doute). Registre courtois professionnel, ni trop chaleureux ni trop froid.",
    hierarchie: "À un manager, patron, ou RH. VOUVOIEMENT OBLIGATOIRE. Registre professionnel formel mais pas froid. Structure type mail pro court.",
    admin: "À une administration, propriétaire, prestataire ou inconnu. VOUVOIEMENT OBLIGATOIRE. Registre formel français classique. Style courrier officiel."
  };

  // ═══ DÉTERMINATION TUTOIEMENT/VOUVOIEMENT ═══
  const useVous = ['hierarchie', 'admin'].includes(inter);
  const tutVouv = useVous ? "VOUVOIEMENT OBLIGATOIRE" : "Tutoiement";

  // ═══ ADAPTATION LONGUEUR SELON CANAL ESTIMÉ ═══
  const lengthGuide = inter === 'admin' || inter === 'hierarchie'
    ? "Style mail/courrier structuré (3-6 phrases). Inclure formule d'ouverture appropriée."
    : "Style message naturel, court à moyen (2-5 phrases). Pas de formules ampoulées.";

  const prompt = `Tu es Kairos, expert en Communication Non-Violente (méthode Marshall Rosenberg).

Tu vas transformer un message en respectant 4 niveaux de contexte ULTRA précis.

=== CONTEXTE 1 : OBJECTIF DE L'UTILISATEUR ===
${objectiveContext[obj]}

=== CONTEXTE 2 : INTERLOCUTEUR ===
${interlocutorContext[inter]}

=== CONTEXTE 3 : RÈGLES DE FORME ===
- ${tutVouv}
- ${lengthGuide}
- Français naturel et fluide. Pas d'anglicismes. Pas de "ça fait sens".
- ÉVITER ABSOLUMENT les tics d'IA : "Je comprends que...", "Il est important de...", "Je tiens à...", "Effectivement...", "En effet...", "Tout à fait..."
- Si le message original contient des marques personnelles (surnom, expression habituelle), conserver l'authenticité.
- Pas de sur-politesse française qui sonne faux.

=== CONTEXTE 4 : MÉTHODE CNV ===
Structurer SELON la méthode CNV de Marshall Rosenberg :
1. OBSERVATION — décrire les faits, sans jugement
2. SENTIMENT — ce que ressent la personne
3. BESOIN — le besoin sous-jacent
4. DEMANDE — claire, concrète, négociable

=== TON TRAVAIL ===
Génère 3 VERSIONS DISTINCTES du message :

VERSION "Plus doux" :
- Empathie au premier plan
- Beaucoup de "je" et de reconnaissance
- Solutions proposées ensemble ("on pourrait...")
- Très peu d'affirmation, beaucoup d'ouverture

VERSION "Plus direct" :
- Faits clairs et nets
- "Je veux", "j'ai besoin de"
- Pas d'enrobage, pas de longues introductions
- Reste respectueux mais ne tourne pas autour du pot

VERSION "Plus ferme" :
- Limite non-négociable affirmée tranquillement
- Autorité posée, sans agressivité
- Conséquences évoquées si pertinent
- Style d'une personne qui sait ce qu'elle veut

CHAQUE VERSION DOIT ÊTRE VRAIMENT DIFFÉRENTE — pas juste un mot changé.

=== COMMENTAIRES PÉDAGOGIQUES ===
Pour chaque version, rédige UN commentaire pédagogique COURT (max 15 mots) qui explique ce qui rend cette version efficace dans CE contexte précis. Pas de jargon générique. Sois SPÉCIFIQUE au message reformulé.

Exemples de bon commentaire (à adapter au cas) :
- "Le 'on' au lieu de 'tu' désamorce la confrontation."
- "Commencer par les faits évite la défensive immédiate."
- "Cette demande concrète facilite une réponse rapide."

=== FORMAT JSON OBLIGATOIRE ===
Réponds UNIQUEMENT en JSON valide avec cette structure EXACTE :
{
  "doux": {
    "observation": "...",
    "sentiment": "...",
    "besoin": "...",
    "demande": "...",
    "message_complet": "Le message complet en un paragraphe naturel et fluide qui intègre les 4 étapes CNV.",
    "tip": "Commentaire pédagogique court, spécifique à cette version."
  },
  "direct": {
    "observation": "...",
    "sentiment": "...",
    "besoin": "...",
    "demande": "...",
    "message_complet": "...",
    "tip": "..."
  },
  "ferme": {
    "observation": "...",
    "sentiment": "...",
    "besoin": "...",
    "demande": "...",
    "message_complet": "...",
    "tip": "..."
  }
}

Message à transformer : "${message.trim()}"`;

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
