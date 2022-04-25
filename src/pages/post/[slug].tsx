import { GetStaticPaths, GetStaticProps } from 'next';

import { PrismicRichText } from '@prismicio/react';
import * as PrismicH from '@prismicio/helpers';
import Metadata from 'components/Metadata';
import commonStyles from 'styles/common.module.scss';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string;
  title: string;
  data: {
    author: string;
  };
  estimatedReadingTime: string;
  content: [];
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): React.ReactElement {
  return (
    <section className={commonStyles.alignMaxWidth}>
      <article className={styles.container}>
        <h1>{post.title}</h1>
        <Metadata post={post} />
        <PrismicRichText field={post.content} />
      </article>
    </section>
  );
}

/* eslint-disable testing-library/no-await-sync-query */

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { data, first_publication_date } = await prismic.getByUID(
    'post',
    String(params.slug)
  );

  const allTextsFromContent = data.content.reduce(
    (acc, crr) => acc?.text || acc + crr.text
  );

  const estimatedReadingTime = `${Math.round(
    allTextsFromContent.split('').length / 200
  )} Minutes`;

  const post: Post = {
    first_publication_date,
    title: PrismicH.asText(data.title),
    data: {
      author: data.author,
    },
    content: data.content,
    estimatedReadingTime,
  };

  return {
    props: {
      post,
    },
  };
};
