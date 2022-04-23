import { GetStaticProps } from 'next';
import * as PrismicH from '@prismicio/helpers';
import { getPrismicClient } from '../services/prismic';

/* import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss'; */

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination,
}: HomeProps): React.ReactElement {
  const { results } = postsPagination;

  return (
    <>
      {results.map(post => {
        return (
          <article key={post.uid}>
            <h2>{post.data.title}</h2>
            <p>{post.data.subtitle}</p>

            <div>
              <time>{post.first_publication_date}</time>
              {post.data.author}
            </div>
            <button type="button">oi</button>
          </article>
        );
      })}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  /* eslint-disable */
  const postsResponse = await prismic.getByType('post', {
    pageSize: 5,
  });
  /* eslint-enable */

  const posts: Post[] = postsResponse.results.map(post => {
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

  const nextPageUrl = `${postsResponse.next_page}&access_token=${process.env.NEXT_PUBLIC_PRISMIC_ACCESS_TOKEN}`;

  return {
    props: {
      postsPagination: { results: posts, next_page: nextPageUrl },
    },
  };
};
