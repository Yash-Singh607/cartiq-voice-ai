import type { Language } from '@/types'

interface Translations {
  greeting: string
  subtitle: string
  micPrompt: string
  listening: string
  processing: string
  understood: string
  error: string
  addedToList: string
  removedFromList: string
  updatedQty: string
  notFound: string
  noSpeech: string
  micDenied: string
  tryExample: string
  examples: string[]
  searchPlaceholder: string
  emptyList: string
  emptyListSub: string
  startSpeaking: string
}

const translations: Record<Language, Translations> = {
  'en-US': {
    greeting: 'Good {time}',
    subtitle: 'What are you shopping for today?',
    micPrompt: 'Speak naturally. SnapGrocer gets it.',
    listening: 'Listening...',
    processing: 'Understanding your request...',
    understood: 'Got it.',
    error: "I couldn't quite understand that.",
    addedToList: 'Added to your list',
    removedFromList: 'Removed from list',
    updatedQty: 'Updated quantity',
    notFound: "Couldn't find that item",
    noSpeech: 'No speech detected. Please try again.',
    micDenied: 'Microphone access denied. Please enable it in settings.',
    tryExample: 'Try saying',
    examples: [
      'Add 2 bottles of milk',
      'Find organic apples under ₹200',
      'Remove bananas',
      'Show alternatives to butter',
    ],
    searchPlaceholder: 'Search products, brands...',
    emptyList: 'Your list is empty',
    emptyListSub: 'Tell me what you need',
    startSpeaking: 'Start speaking',
  },
  'hi-IN': {
    greeting: 'नमस्ते',
    subtitle: 'आज क्या खरीदना है?',
    micPrompt: 'बोलिए, SnapGrocer समझ लेगा।',
    listening: 'सुन रहा हूँ...',
    processing: 'समझ रहा हूँ...',
    understood: 'समझ गया।',
    error: 'मुझे समझ नहीं आया।',
    addedToList: 'सूची में जोड़ा गया',
    removedFromList: 'सूची से हटाया गया',
    updatedQty: 'मात्रा अपडेट की',
    notFound: 'वस्तु नहीं मिली',
    noSpeech: 'कोई आवाज नहीं मिली। फिर कोशिश करें।',
    micDenied: 'माइक्रोफोन की अनुमति दें।',
    tryExample: 'यह कहें',
    examples: [
      'दो लीटर दूध जोड़ो',
      'सेब ₹200 से कम में खोजो',
      'केले हटाओ',
      'मक्खन का विकल्प दिखाओ',
    ],
    searchPlaceholder: 'उत्पाद खोजें...',
    emptyList: 'सूची खाली है',
    emptyListSub: 'बताइए क्या चाहिए',
    startSpeaking: 'बोलना शुरू करें',
  },
  'es-ES': {
    greeting: 'Buenos {time}',
    subtitle: '¿Qué vas a comprar hoy?',
    micPrompt: 'Habla con naturalidad. SnapGrocer te entiende.',
    listening: 'Escuchando...',
    processing: 'Entendiendo tu solicitud...',
    understood: 'Entendido.',
    error: 'No entendí eso bien.',
    addedToList: 'Añadido a tu lista',
    removedFromList: 'Eliminado de la lista',
    updatedQty: 'Cantidad actualizada',
    notFound: 'No se encontró ese artículo',
    noSpeech: 'No se detectó voz. Inténtalo de nuevo.',
    micDenied: 'Acceso al micrófono denegado.',
    tryExample: 'Prueba diciendo',
    examples: [
      'Añade 2 botellas de leche',
      'Busca manzanas orgánicas bajo ₹200',
      'Quita los plátanos',
      'Muestra alternativas a la mantequilla',
    ],
    searchPlaceholder: 'Buscar productos, marcas...',
    emptyList: 'Tu lista está vacía',
    emptyListSub: 'Dime qué necesitas',
    startSpeaking: 'Empieza a hablar',
  },
  'fr-FR': {
    greeting: 'Bon{time}',
    subtitle: 'Que souhaitez-vous acheter aujourd\'hui ?',
    micPrompt: 'Parlez naturellement. CartIQ comprend.',
    listening: 'Écoute en cours...',
    processing: 'Analyse de votre demande...',
    understood: 'Compris.',
    error: 'Je n\'ai pas bien compris.',
    addedToList: 'Ajouté à votre liste',
    removedFromList: 'Retiré de la liste',
    updatedQty: 'Quantité mise à jour',
    notFound: 'Article non trouvé',
    noSpeech: 'Aucune voix détectée. Réessayez.',
    micDenied: 'Accès au micro refusé.',
    tryExample: 'Essayez de dire',
    examples: [
      'Ajouter 2 bouteilles de lait',
      'Trouver des pommes bio',
      'Retirer les bananes',
      'Montrer des alternatives au beurre',
    ],
    searchPlaceholder: 'Rechercher des produits...',
    emptyList: 'Votre liste est vide',
    emptyListSub: 'Dites-moi ce dont vous avez besoin',
    startSpeaking: 'Commencer à parler',
  },
  'de-DE': {
    greeting: 'Guten {time}',
    subtitle: 'Was möchten Sie heute einkaufen?',
    micPrompt: 'Sprechen Sie ganz natürlich. CartIQ versteht Sie.',
    listening: 'Höre zu...',
    processing: 'Verarbeite Ihre Anfrage...',
    understood: 'Verstanden.',
    error: 'Das habe ich nicht verstanden.',
    addedToList: 'Zur Liste hinzugefügt',
    removedFromList: 'Von Liste entfernt',
    updatedQty: 'Menge aktualisiert',
    notFound: 'Artikel nicht gefunden',
    noSpeech: 'Keine Sprache erkannt. Bitte erneut versuchen.',
    micDenied: 'Mikrofonzugriff verweigert.',
    tryExample: 'Versuchen Sie zum Beispiel',
    examples: [
      'Füge 2 Flaschen Milch hinzu',
      'Finde Bio-Äpfel unter ₹200',
      'Entferne Bananen',
      'Zeige Alternativen zu Butter',
    ],
    searchPlaceholder: 'Produkte suchen...',
    emptyList: 'Ihre Liste ist leer',
    emptyListSub: 'Sagen Sie mir, was Sie brauchen',
    startSpeaking: 'Jetzt sprechen',
  },
}

export function t(lang: Language, key: keyof Translations): string | string[] {
  return translations[lang][key] ?? translations['en-US'][key]
}

export function tStr(lang: Language, key: keyof Translations): string {
  const val = t(lang, key)
  return Array.isArray(val) ? val[0] : val
}

export function getGreeting(lang: Language): string {
  const hour = new Date().getHours()
  const timeMap: Record<Language, string[]> = {
    'en-US': hour < 12 ? ['morning'] : hour < 17 ? ['afternoon'] : ['evening'],
    'hi-IN': [''],
    'es-ES': hour < 12 ? ['días'] : hour < 17 ? ['tardes'] : ['noches'],
    'fr-FR': hour < 17 ? ['jour'] : ['soir'],
    'de-DE': hour < 12 ? ['Morgen'] : hour < 17 ? ['Tag'] : ['Abend'],
  }
  const base = tStr(lang, 'greeting')
  return base.replace('{time}', (timeMap[lang] ?? timeMap['en-US'])[0])
}
