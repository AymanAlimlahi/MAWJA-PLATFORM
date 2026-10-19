# Mawja Agency — site web

Site statique (HTML / CSS / JS), sans build. Ouvrez `index.html` dans un navigateur, ou dans VS Code avec l'extension **Live Server** (clic droit sur `index.html` → *Open with Live Server*).

## Structure
```
index.html            Page unique (FR par défaut, bouton FR / EN)
assets/css/style.css  Styles (couleurs de marque en haut, dans :root)
assets/js/main.js     Intro, vagues WebGL, animations, langue, formulaire, WhatsApp
assets/img/           Logo découpé lettre par lettre (animation) + favicon
```

## À modifier avant la mise en ligne (haut de `assets/js/main.js`)
- `WHATSAPP_NUMBER` : numéro WhatsApp, format international sans + ni espaces (ex. `212612345678`).
- `FORM_ENDPOINT` : URL d'un formulaire Formspree (formspree.io, gratuit), ex. `https://formspree.io/f/xxxxxx`.
  Vide = le formulaire ouvre l'application email du visiteur avec le message pré-rempli.
- Liens réseaux sociaux : dans `index.html`, section `<footer>` (Instagram, Facebook, LinkedIn, TikTok).

## Textes
Les textes français sont dans `index.html`. Les traductions anglaises sont dans l'objet `EN` de `main.js` (même clé que l'attribut `data-i18n`).

## Bibliothèques (chargées par CDN)
GSAP 3.13 (ScrollTrigger, SplitText) et Lenis 1.1 (défilement fluide). Sans connexion, le site reste complet et lisible, seules les animations au scroll sont désactivées.

## Mise en ligne
Glissez le dossier sur Netlify, Vercel ou Hostinger (hébergement statique) et pointez le domaine mawjaagency.com.
"# MAWJA-PLATFORM" 
