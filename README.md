# Anicha Espace Bien-Être – Site web

Site vitrine d'Anicha Espace Bien-Être, institut de massage thaï traditionnel à Nîmes.

## Stack

- HTML5 / CSS3 / JavaScript vanilla, sans framework.
- Aucune dépendance, aucun build : on ouvre `index.html` et ça fonctionne.
- Polices via Google Fonts (Cormorant Garamond + Inter).
- Images hébergées sur Unsplash en V1, à remplacer par les photos professionnelles à la livraison du shooting.

## Structure

```
.
├── index.html              # Page d'accueil
├── massages.html           # Liste détaillée des soins
├── tarifs.html             # Tarifs et formules
├── a-propos.html           # Anicha, son histoire, l'institut
├── bon-cadeau.html         # Achat de bons cadeaux
├── avis-galerie.html       # Avis Google + galerie photos
├── contact.html            # Contact, accès, horaires
├── mentions-legales.html   # Mentions légales obligatoires
├── css/
│   └── style.css           # Design system + tous les styles du site
├── js/
│   └── main.js             # Menu mobile, smooth scroll, animations légères
└── img/                    # Images locales (logo, favicons, etc.)
```

## Lancer le site en local

Ouvrir `index.html` dans un navigateur. Pour un rendu plus fidèle (chemins absolus, etc.), un petit serveur local :

```bash
# Avec Python
python3 -m http.server 8080

# Avec Node
npx serve .
```

Puis ouvrir `http://localhost:8080`.

## Déploiement

Le site est statique : il peut être servi par n'importe quel hébergeur (Netlify, Cloudflare Pages, OVH, GitHub Pages…). Pour un déploiement automatique depuis ce repo : connecter le repo à Netlify, branche `main`, dossier publish `/`.

## À faire ensuite

- Photos professionnelles du salon (shooting à programmer).
- Module de réservation (Calendly, Planity ou équivalent).
- Module de bon cadeau avec paiement Stripe.
- Connexion API Google Places pour les avis en direct.
- Mentions légales et CGV à finaliser avec les coordonnées exactes (SIRET).
