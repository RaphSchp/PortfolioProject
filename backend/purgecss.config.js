module.exports = {
  content: [
    '../frontend/public/pages/mainpage.html', // Tous les fichiers HTML dans le dossier `pages`
    '../frontend/public/scripts/mainpage.js', // Tous les fichiers JS dans le dossier `scripts`
    'server.js'
  ],
  css: ['../frontend/public/styles/mainpage.css'], // Cible le fichier CSS à optimiser
  safelist: [], // Conserve toutes les classes

  defaultExtractor: content => {
    console.log('Analyzing content from:', content);
    return content.match(/[\w-/:]+(?<!:)/g) || [];
  },
  
};
