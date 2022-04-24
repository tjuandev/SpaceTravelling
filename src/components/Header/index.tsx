import logo from 'assets/Logo.png';
import Image from 'next/image';
import commonStyles from 'styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): React.ReactElement {
  return (
    <header className={`${styles.container} ${commonStyles.alignMaxWidth}`}>
      <Image src={logo} alt="logo" />
    </header>
  );
}
