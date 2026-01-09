/**
 * MetaTags component for dynamic meta tag management
 */
import { useEffect } from 'react';
import { generateMetaTags, type MetaTags as MetaTagsInput } from '../../utils/seo';

export function MetaTags(props: MetaTagsInput) {
  useEffect(() => {
    const tags = generateMetaTags(props);

    // Update document title
    if (tags.title) {
      document.title = tags.title;
    }

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, isProperty: boolean = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Set standard meta tags
    if (tags.description) {
      setMetaTag('description', tags.description);
    }

    if (tags.keywords) {
      setMetaTag('keywords', tags.keywords);
    }

    if (tags.robots) {
      setMetaTag('robots', tags.robots);
    }

    // Set Open Graph tags
    if (tags['og:title']) {
      setMetaTag('og:title', tags['og:title'], true);
    }

    if (tags['og:description']) {
      setMetaTag('og:description', tags['og:description'], true);
    }

    if (tags['og:image']) {
      setMetaTag('og:image', tags['og:image'], true);
    }

    if (tags['og:type']) {
      setMetaTag('og:type', tags['og:type'], true);
    }

    if (tags['og:url']) {
      setMetaTag('og:url', tags['og:url'], true);
    }

    if (tags['og:site_name']) {
      setMetaTag('og:site_name', tags['og:site_name'], true);
    }

    // Set Twitter Card tags
    if (tags['twitter:card']) {
      setMetaTag('twitter:card', tags['twitter:card']);
    }

    if (tags['twitter:title']) {
      setMetaTag('twitter:title', tags['twitter:title']);
    }

    if (tags['twitter:description']) {
      setMetaTag('twitter:description', tags['twitter:description']);
    }

    if (tags['twitter:image']) {
      setMetaTag('twitter:image', tags['twitter:image']);
    }

    if (tags['twitter:site']) {
      setMetaTag('twitter:site', tags['twitter:site']);
    }

    // Set canonical link
    if (tags.canonical) {
      let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;

      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }

      canonicalLink.href = tags.canonical;
    }

    return () => {
      // Optional: Clean up meta tags on unmount
      // We'll keep them since they might be useful for navigation
    };
  }, [props]);

  return null; // This component doesn't render anything visible
}
