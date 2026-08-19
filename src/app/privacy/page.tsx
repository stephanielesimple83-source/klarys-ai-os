"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0b1120] px-5 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
          >
            ← Retour à Klarys AI OS
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Klarys AI OS
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Politique de confidentialité
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Dernière mise à jour : 19 août 2026
          </p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white">
                1. Objet de la politique
              </h2>

              <p className="mt-3">
                Cette politique explique comment Klarys AI OS traite les données
                nécessaires au fonctionnement de la plateforme, notamment lors
                de la connexion à des services tiers tels que des réseaux
                sociaux, outils CRM, plateformes de communication ou autres
                services professionnels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                2. Données pouvant être traitées
              </h2>

              <p className="mt-3">
                Selon les fonctionnalités utilisées et les autorisations
                accordées, Klarys AI OS peut traiter des données telles que les
                informations de compte, identifiants techniques, données de
                profil professionnel, contenus publiés, statistiques de
                performance, informations de campagne, données CRM, coordonnées
                de clients ou prospects et informations nécessaires à
                l’authentification auprès de services tiers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                3. Données issues des réseaux sociaux
              </h2>

              <p className="mt-3">
                Lorsqu’un utilisateur connecte volontairement un compte social,
                Klarys AI OS ne demande que les autorisations nécessaires aux
                fonctionnalités activées. Ces autorisations peuvent permettre,
                selon la plateforme, d’identifier le compte connecté, consulter
                certaines informations autorisées, récupérer des statistiques
                ou publier du contenu pour le compte de l’utilisateur.
              </p>

              <p className="mt-3">
                Klarys AI OS n’utilise pas ces données pour vendre des profils
                personnels ni pour créer des bases de données destinées à des
                tiers non autorisés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                4. Finalités
              </h2>

              <p className="mt-3">
                Les données sont utilisées uniquement pour fournir et sécuriser
                le service, connecter les outils choisis par l’utilisateur,
                afficher des statistiques, permettre la gestion de contenus ou
                de campagnes, améliorer l’expérience utilisateur, diagnostiquer
                des erreurs techniques et respecter les obligations légales
                applicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                5. Base et contrôle par l’utilisateur
              </h2>

              <p className="mt-3">
                La connexion à un service tiers est effectuée à l’initiative de
                l’utilisateur. L’utilisateur peut retirer les autorisations ou
                déconnecter un compte lorsque la plateforme concernée le permet.
              </p>

              <p className="mt-3">
                Klarys AI OS n’effectue pas de publication sur un compte social
                sans disposer de l’autorisation technique correspondante.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                6. Conservation
              </h2>

              <p className="mt-3">
                Les données sont conservées pendant une durée proportionnée aux
                finalités pour lesquelles elles sont traitées. Les jetons
                d’accès ou identifiants techniques nécessaires aux connexions de
                services tiers sont conservés de façon sécurisée côté serveur
                lorsqu’ils sont nécessaires au fonctionnement du service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                7. Sécurité
              </h2>

              <p className="mt-3">
                Klarys AI OS met en œuvre des mesures techniques et
                organisationnelles raisonnables afin de protéger les données
                contre l’accès non autorisé, la perte, l’altération ou la
                divulgation.
              </p>

              <p className="mt-3">
                Les secrets d’API, mots de passe et jetons sensibles ne sont pas
                destinés à être exposés dans l’interface publique ou dans le
                code exécuté dans le navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                8. Partage avec des tiers
              </h2>

              <p className="mt-3">
                Les données peuvent transiter vers les services tiers choisis
                par l’utilisateur lorsque cela est nécessaire à l’exécution de
                la fonctionnalité demandée. Ces services appliquent leurs propres
                politiques de confidentialité.
              </p>

              <p className="mt-3">
                Klarys AI OS ne vend pas les données personnelles de ses
                utilisateurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                9. Droits des utilisateurs
              </h2>

              <p className="mt-3">
                Selon la réglementation applicable, les utilisateurs peuvent
                disposer de droits d’accès, de rectification, d’effacement,
                d’opposition, de limitation ou de portabilité concernant leurs
                données personnelles.
              </p>

              <p className="mt-3">
                Une procédure de contact dédiée à l’exercice de ces droits sera
                indiquée sur le site officiel lors de la mise en ligne publique
                de Klarys AI OS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                10. Suppression et déconnexion
              </h2>

              <p className="mt-3">
                L’utilisateur peut demander la suppression des données
                directement associées à son utilisation de Klarys AI OS, sous
                réserve des obligations légales de conservation. Les connexions
                à des plateformes externes peuvent également être révoquées
                depuis les paramètres du compte concerné.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                11. Modifications
              </h2>

              <p className="mt-3">
                Cette politique peut être mise à jour pour tenir compte des
                évolutions techniques, réglementaires ou fonctionnelles. La date
                de mise à jour indiquée en haut de la page permet d’identifier
                la version applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                12. Contact
              </h2>

              <p className="mt-3">
                Pour toute demande relative à la confidentialité ou aux données
                personnelles, un moyen de contact professionnel sera indiqué sur
                le site officiel de Klarys AI OS lors de sa publication.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}