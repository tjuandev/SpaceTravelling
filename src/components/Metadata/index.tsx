import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import format from 'date-fns/format';
import styles from './metadata.module.scss';

interface MetadataProps {
  post: {
    first_publication_date: string;
    data: {
      author: string;
    };
    estimatedReadingTime?: string;
  };
}

export default function Metadata({ post }: MetadataProps): React.ReactElement {
  return (
    <div className={styles.metadata}>
      {post.first_publication_date && (
        <time>
          <FiCalendar size="1.25rem" />
          {format(new Date(post.first_publication_date), 'dd LLL yyyy')}
        </time>
      )}
      {post.data.author && (
        <span>
          <FiUser size="1.25rem" />
          {post.data.author}
        </span>
      )}
      {post.estimatedReadingTime && (
        <span>
          <FiClock size="1.25rem" />
          {post.estimatedReadingTime}
        </span>
      )}
    </div>
  );
}
