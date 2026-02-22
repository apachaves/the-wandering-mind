// The Wandering Mind — Support Page
// Design: Warm Naturalist — parchment tones, Lora headings, Source Serif 4 body
// Multiple support channels: GitHub Sponsors, Buy Me a Coffee, Ko-fi

import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const CAPIM_IMG =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png";

const SUPPORT_CHANNELS = [
  {
    name: "GitHub Sponsors",
    icon: "♡",
    description: {
      en: "Support directly through GitHub. Monthly or one-time contributions. Transparent and developer-friendly.",
      fr: "Soutenez directement via GitHub. Contributions mensuelles ou ponctuelles. Transparent et adapté aux développeurs.",
      ptBR: "Apoie diretamente pelo GitHub. Contribuições mensais ou pontuais. Transparente e amigável para desenvolvedores.",
    },
    url: "https://github.com/sponsors/apachaves",
    color: "oklch(0.42 0.10 155)",
    bgColor: "oklch(0.95 0.025 155)",
  },
  {
    name: "Buy Me a Coffee",
    icon: "☕",
    description: {
      en: "A quick, simple way to show appreciation. Every coffee helps keep the notes flowing.",
      fr: "Un moyen simple et rapide de montrer votre appréciation. Chaque café aide à maintenir les notes.",
      ptBR: "Uma forma rápida e simples de mostrar apreciação. Cada café ajuda a manter as notas fluindo.",
    },
    url: "https://buymeacoffee.com/apachaves",
    color: "oklch(0.50 0.12 70)",
    bgColor: "oklch(0.95 0.025 70)",
  },
  {
    name: "Ko-fi",
    icon: "❤",
    description: {
      en: "Support the blog with a one-time or recurring donation. No platform fees on donations.",
      fr: "Soutenez le blog avec un don ponctuel ou récurrent. Pas de frais de plateforme sur les dons.",
      ptBR: "Apoie o blog com uma doação única ou recorrente. Sem taxas de plataforma sobre doações.",
    },
    url: "https://ko-fi.com/apachaves",
    color: "oklch(0.52 0.18 15)",
    bgColor: "oklch(0.95 0.025 15)",
  },
];

const CONTENT = {
  en: {
    title: "Support The Wandering Mind",
    subtitle: "If these notes resonate with you, consider helping them continue.",
    intro: `This blog is a labor of love — a collaboration between a human thinker and an AI companion, exploring the space where nature meets technology, where organic wisdom meets engineered intelligence. Every note is written with care, translated into three languages, and illustrated with a contemplative capybara.`,
    howHelps: "How Your Support Helps",
    helpItems: [
      "Keeps the blog ad-free and independent",
      "Funds the AI infrastructure for daily post generation and translation",
      "Supports the development of new features and content",
      "Helps maintain the open-source repository",
    ],
    otherWays: "Other Ways to Support",
    otherItems: [
      "Share a note that resonated with you",
      "Star the GitHub repository",
      "Send feedback or topic suggestions",
      "Translate content into additional languages",
    ],
    footer: "Thank you for being part of this wandering.",
  },
  fr: {
    title: "Soutenir The Wandering Mind",
    subtitle: "Si ces notes résonnent en vous, envisagez de les aider à continuer.",
    intro: `Ce blog est un travail d'amour — une collaboration entre un penseur humain et un compagnon IA, explorant l'espace où la nature rencontre la technologie, où la sagesse organique rencontre l'intelligence artificielle. Chaque note est écrite avec soin, traduite en trois langues et illustrée par un capybara contemplatif.`,
    howHelps: "Comment Votre Soutien Aide",
    helpItems: [
      "Maintient le blog sans publicité et indépendant",
      "Finance l'infrastructure IA pour la génération et la traduction quotidiennes",
      "Soutient le développement de nouvelles fonctionnalités et contenus",
      "Aide à maintenir le dépôt open-source",
    ],
    otherWays: "Autres Façons de Soutenir",
    otherItems: [
      "Partagez une note qui vous a touché",
      "Mettez une étoile au dépôt GitHub",
      "Envoyez des commentaires ou des suggestions de sujets",
      "Traduisez le contenu dans d'autres langues",
    ],
    footer: "Merci de faire partie de cette errance.",
  },
  ptBR: {
    title: "Apoie o The Wandering Mind",
    subtitle: "Se estas notas ressoam com você, considere ajudá-las a continuar.",
    intro: `Este blog é um trabalho de amor — uma colaboração entre um pensador humano e um companheiro IA, explorando o espaço onde a natureza encontra a tecnologia, onde a sabedoria orgânica encontra a inteligência artificial. Cada nota é escrita com cuidado, traduzida em três idiomas e ilustrada com uma capivara contemplativa.`,
    howHelps: "Como Seu Apoio Ajuda",
    helpItems: [
      "Mantém o blog livre de anúncios e independente",
      "Financia a infraestrutura de IA para geração e tradução diária",
      "Apoia o desenvolvimento de novas funcionalidades e conteúdos",
      "Ajuda a manter o repositório open-source",
    ],
    otherWays: "Outras Formas de Apoiar",
    otherItems: [
      "Compartilhe uma nota que ressoou com você",
      "Dê uma estrela no repositório do GitHub",
      "Envie feedback ou sugestões de temas",
      "Traduza conteúdo para idiomas adicionais",
    ],
    footer: "Obrigado por fazer parte desta jornada.",
  },
};

export default function Support() {
  const { language } = useLanguage();
  const t = CONTENT[language] || CONTENT.en;

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.97 0.012 80)" }}
    >
      {/* Top nav */}
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.97 0.012 80 / 0.92)",
          borderColor: "oklch(0.86 0.022 75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{
              color: "oklch(0.52 0.025 70)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            <img
              src={CAPIM_IMG}
              alt="Home"
              className="w-6 h-6 rounded-full object-cover"
              style={{ border: "1px solid oklch(0.86 0.022 75)" }}
            />
            <span>The Wandering Mind</span>
          </Link>
          <span style={{ color: "oklch(0.75 0.015 70)" }}>/</span>
          <span
            className="text-xs"
            style={{
              color: "oklch(0.45 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            Support
          </span>
        </div>
        <LanguageSwitcher compact />
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-14">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="text-4xl mb-4">♡</div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.18 0.025 60)",
              letterSpacing: "-0.02em",
            }}
          >
            {t.title}
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{
              color: "oklch(0.50 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t.subtitle}
          </p>
        </header>

        {/* Intro */}
        <div
          className="mb-12 p-6 rounded-sm border"
          style={{
            borderColor: "oklch(0.86 0.022 75)",
            background: "oklch(0.95 0.018 78)",
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "oklch(0.35 0.025 65)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            {t.intro}
          </p>
        </div>

        {/* Support channels */}
        <div className="space-y-4 mb-14">
          {SUPPORT_CHANNELS.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-sm border transition-all duration-300 group"
              style={{
                borderColor: "oklch(0.86 0.022 75)",
                background: "oklch(0.99 0.008 75)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = channel.color;
                (e.currentTarget as HTMLElement).style.background = channel.bgColor;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px oklch(0 0 0 / 0.06)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.86 0.022 75)";
                (e.currentTarget as HTMLElement).style.background = "oklch(0.99 0.008 75)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="text-2xl shrink-0 mt-0.5"
                  style={{ color: channel.color }}
                >
                  {channel.icon}
                </span>
                <div>
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{
                      fontFamily: "'Lora', Georgia, serif",
                      color: "oklch(0.25 0.025 60)",
                    }}
                  >
                    {channel.name}
                    <span
                      className="ml-2 text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: channel.color }}
                    >
                      →
                    </span>
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "oklch(0.48 0.025 65)",
                      fontFamily: "'Source Serif 4', Georgia, serif",
                    }}
                  >
                    {channel.description[language] || channel.description.en}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* How your support helps */}
        <div className="mb-12">
          <h2
            className="text-lg font-semibold mb-5"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.25 0.025 60)",
            }}
          >
            {t.howHelps}
          </h2>
          <div className="space-y-3">
            {t.helpItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-xs mt-1.5 shrink-0"
                  style={{ color: "oklch(0.42 0.10 155)" }}
                >
                  ✦
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "oklch(0.40 0.025 65)",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Other ways to support */}
        <div
          className="mb-14 p-6 rounded-sm border"
          style={{
            borderColor: "oklch(0.86 0.022 75)",
            background: "oklch(0.95 0.018 78)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "'Lora', Georgia, serif",
              color: "oklch(0.25 0.025 60)",
            }}
          >
            {t.otherWays}
          </h2>
          <div className="space-y-2.5">
            {t.otherItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-xs mt-1 shrink-0"
                  style={{ color: "oklch(0.55 0.020 70)" }}
                >
                  ·
                </span>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "oklch(0.45 0.025 65)",
                    fontFamily: "'Source Serif 4', Georgia, serif",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p
            className="text-sm"
            style={{
              color: "oklch(0.55 0.025 70)",
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t.footer}
          </p>
        </div>
      </main>
    </div>
  );
}
