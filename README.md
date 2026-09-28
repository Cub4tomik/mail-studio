# Mail Studio

Créateur d’emails HTML autonome à partir des modules de `TOUS_MODULES.html`.

## Utilisation

Ouvrir `index.html` dans un navigateur. Aucun serveur, compte ou installation n’est nécessaire.

- cliquer sur un module pour l’ajouter, ou le glisser dans l’aperçu ;
- glisser les blocs de l’aperçu pour les réordonner ;
- sélectionner directement un titre ou un paragraphe pour modifier son contenu ;
- utiliser la mini-barre qui apparaît pour appliquer gras, italique, souligné ou ajouter un lien ;
- cliquer sur ⚙ sur un bloc pour modifier les URLs, images, textes alternatifs et liens/boutons ;
- régler l’alignement gauche/centre/droite d’un bloc et la largeur des images ;
- ajouter un bloc **Espacement** et régler sa hauteur en pixels ;
- utiliser les choix de logo de l’en-tête ou importer un logo depuis l’ordinateur ;
- utiliser **Copier le HTML** pour le coller dans la messagerie ;
- utiliser **Télécharger le HTML** pour conserver un fichier `.html`.
- ouvrir l’onglet **Modèles** pour partir d’une communication universitaire type ;
- utiliser **Enregistrer** pour sauvegarder la composition dans un fichier `.mailstudio.json`, puis **Ouvrir** pour la reprendre plus tard ;
- choisir une palette institutionnelle ou définir ses propres couleurs dans le panneau de droite.

Le bouton **Aperçu** ouvre maintenant une version isolée de l’email, sans poignées ni outils d’édition, avec la structure exacte utilisée pour l’export HTML.

## Publication gratuite en ligne

Le projet contient le workflow `.github/workflows/deploy-pages.yml` pour publier automatiquement l’application avec GitHub Pages.

1. Créer un dépôt **public** sur [github.com](https://github.com), par exemple `mail-studio` — sans README ni fichiers supplémentaires.
2. Dans ce dossier, initialiser Git et créer le premier commit :

   ```bash
   git init -b main
   git add .
   git commit -m "Initialiser Mail Studio"
   git remote add origin https://github.com/VOTRE_COMPTE/mail-studio.git
   git push -u origin main
   ```

3. Dans GitHub, ouvrir **Settings → Pages** et choisir **GitHub Actions** comme source.
4. Le site sera publié à l’adresse `https://VOTRE_COMPTE.github.io/mail-studio/`.

Ensuite, les mises à jour peuvent être faites ici avec moi, puis envoyées avec :

```bash
git add .
git commit -m "Mettre à jour Mail Studio"
git push
```

Les images et liens restent ceux des modules d’origine et nécessitent donc une connexion internet au moment de l’affichage dans l’email.
