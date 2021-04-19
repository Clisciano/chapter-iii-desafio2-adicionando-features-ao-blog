import { useEffect } from 'react';

export default function Comments(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');

    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', String(true));
    script.setAttribute(
      'repo',
      'Clisciano/chapter-iii-desafio2-adicionando-features-ao-blog'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');

    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
}
