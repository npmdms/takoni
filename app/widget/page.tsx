'use client';

import { useEffect } from 'react';

export default function YourPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/borneo-sentra-digital/alex/widget.js';
    script.setAttribute('data-chatbot-id', '69de0ea787368e9b9789dda5');
    script.setAttribute('data-color', 'red');
    script.setAttribute('data-size', 'lg');
    script.setAttribute('data-position', 'bottom-right');
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Konten Halaman</div>;
}