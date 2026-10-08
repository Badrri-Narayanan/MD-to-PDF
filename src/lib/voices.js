/** Voices for the user's language first, then alphabetical. */
export function sortVoices(voices, language) {
  const lang = language.slice(0, 2);
  return [...voices].sort((a, b) =>
    (b.lang.startsWith(lang) - a.lang.startsWith(lang)) || a.name.localeCompare(b.name));
}

export function pickVoice(sortedVoices, { savedURI, language }) {
  const lang = language.slice(0, 2);
  return sortedVoices.find(v => v.voiceURI === savedURI)
    || sortedVoices.find(v => v.default && v.lang.startsWith(lang))
    || sortedVoices[0]
    || null;
}
