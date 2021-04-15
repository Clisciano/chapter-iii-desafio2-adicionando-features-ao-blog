import { GetStaticPaths, GetStaticProps } from 'next';

import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const memoizedValue = useMemo(() => {
    const readingMinute = 200;

    const contentPost = post.data.content.reduce(
      (summedContents, currentContent) => {
        const headingWords = currentContent.heading.split(/\s/g).length;
        const bodyWords = currentContent.body.reduce(
          (summedBodies, currentBody) => {
            const textWords = currentBody.text.split(/\s/g).length;

            return summedBodies + textWords;
          },
          0
        );
        return summedContents + headingWords + bodyWords;
      },
      0
    );

    const minutes = contentPost / readingMinute;
    const readTime = Math.ceil(minutes);

    return readTime;
  }, [post]);

  return (
    <>
      <Header />
      <main className={`${styles.container}`}>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </div>
        <article className={`${commonStyles.commonStyles} ${styles.post}`}>
          <h1>{router.isFallback ? 'Carregando...' : post.data.title}</h1>
          <div className={styles.postInfos}>
            <time>
              <FiCalendar size={20} />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: pt,
                })}
              </span>
            </time>
            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock size={20} />
              <span>{memoizedValue} min</span>
            </div>
          </div>
          <div className={styles.content}>
            {post.data.content.map(content => (
              <div key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={`${styles.postContent} ${styles.previewContent}`}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );
  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
