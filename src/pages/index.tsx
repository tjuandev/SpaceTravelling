import { GetStaticProps } from 'next';

import * as PrismicH from '@prismicio/helpers';
import { Query, PrismicDocument } from '@prismicio/types';

import { useState } from 'react';
import format from 'date-fns/format';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

type AdaptPrismicResponse = (post: Query<PrismicDocument>) => Post[];
type GetNextPage = (route: string) => Promise<Query<PrismicDocument>>;

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const adaptPrismicResponse: AdaptPrismicResponse = ({ results: posts }) => {
  return posts.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: PrismicH.asText(post.data?.title),
        subtitle: PrismicH.asText(post.data?.subtitle),
        author: post.data?.author,
      },
    };
  });
};

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const { results, next_page } = postsPagination;

  const [nextPage, setNextPage] = useState(next_page);
  const [posts, setPosts] = useState(results);

  const getNextPage: GetNextPage = async route => {
    try {
      const response = await fetch(route);
      const newPosts = await response.json();

      setNextPage(newPosts.next_page);

      return setPosts(prevState => [
        ...prevState,
        ...adaptPrismicResponse(newPosts),
      ]);
    } catch (e) {
      return e.message;
    }
  };

  return (
    <main className={`${styles.container} ${commonStyles.alignMaxWidth}`}>
      <section>
        {posts.map(post => {
          return (
            <article key={post.uid} className={styles.postContainer}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>

              <div className={styles.metadata}>
                <time>
                  <FiCalendar size="1.25rem" />
                  {format(new Date(post.first_publication_date), 'dd LLL yyyy')}
                </time>
                <span>
                  <FiUser size="1.25rem" />
                  {post.data.author}
                </span>
              </div>
            </article>
          );
        })}
        <button
          disabled={!nextPage}
          onClick={() => getNextPage(next_page)}
          type="button"
        >
          oi
        </button>
      </section>
    </main>
  );
}

/* eslint-disable testing-library/no-await-sync-query */

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('post', {
    pageSize: 5,
  });

  const posts = adaptPrismicResponse(postsResponse);

  const nextPageUrl = `${postsResponse.next_page}&access_token=${process.env.NEXT_PUBLIC_PRISMIC_ACCESS_TOKEN}`;

  return {
    props: {
      postsPagination: { results: posts, next_page: nextPageUrl },
    },
  };
};
