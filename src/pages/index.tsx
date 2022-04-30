import { GetStaticProps } from 'next';

import * as PrismicH from '@prismicio/helpers';
import { Query, PrismicDocument } from '@prismicio/types';

import { useState } from 'react';

import Link from 'next/link';
import Metadata from 'components/Metadata';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

const PAGE_SIZE = 4;
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
        title: post.data?.title[0].text,
        subtitle: post.data?.subtitle[0].text,
        author: post.data?.author,
      },
    };
  });
};

type SetNextPageUrl = (newUrl: string) => void;

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const { results, next_page } = postsPagination;

  const [nextPage, setNextPage] = useState(next_page);
  const [posts, setPosts] = useState(results);

  const setNextPageUrl: SetNextPageUrl = newUrl => setNextPage(newUrl);

  const getNextPage: GetNextPage = async route => {
    try {
      const response = await fetch(route);
      const newPosts = await response.json();

      setNextPageUrl(newPosts.next_page);

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
              <Link href={`/post/${post.uid}`}>
                <h2>{post.data.title}</h2>
              </Link>
              <p>{post.data.subtitle}</p>
              <Metadata post={post} />
            </article>
          );
        })}
        {nextPage && (
          <button
            className={styles.showMoreButton}
            onClick={() => getNextPage(next_page)}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </section>
    </main>
  );
}

/* eslint-disable testing-library/no-await-sync-query */

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('post', {
    pageSize: PAGE_SIZE,
  });

  const posts = adaptPrismicResponse(postsResponse);

  const nextPageUrl = `${postsResponse.next_page}&access_token=${process.env.PRISMIC_ACCESS_TOKEN}`;

  return {
    props: {
      postsPagination: { results: posts, next_page: nextPageUrl },
    },
  };
};
