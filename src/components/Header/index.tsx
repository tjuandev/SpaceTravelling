import logo from 'assets/Logo.png';
import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): React.ReactElement {
  return (
    <header className={styles.container}>
      <Image src={logo} alt="logo" />
    </header>
  );
}
