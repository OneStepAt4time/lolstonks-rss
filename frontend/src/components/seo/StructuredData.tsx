/**
 * StructuredData component for JSON-LD schema markup
 */
import { useEffect } from 'react';

interface StructuredDataProps {
  data: string | object;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Create or update the structured data script tag
    const scriptId = 'structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.text = typeof data === 'string' ? data : JSON.stringify(data);

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [data]);

  return null; // This component doesn't render anything visible
}
