// Capim — Localization helper
// Returns the title, excerpt, and content for a post in the active language.
// Falls back to English if the translation is missing.

import type { BlogPost } from "./blogData";
import type { Language } from "@/contexts/LanguageContext";

export interface LocalizedContent {
  title: string;
  excerpt: string;
  content: string;
}

export function getLocalizedPost(post: BlogPost, lang: Language): LocalizedContent {
  if (lang === "en") {
    return { title: post.title, excerpt: post.excerpt, content: post.content };
  }

  const translation = post.translations?.[lang];
  if (translation && translation.title && translation.content) {
    return {
      title: translation.title,
      excerpt: translation.excerpt || post.excerpt,
      content: translation.content,
    };
  }

  // Fallback to English
  return { title: post.title, excerpt: post.excerpt, content: post.content };
}
