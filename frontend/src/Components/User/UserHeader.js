import React from 'react';
import UserHeaderNav from './UserHeaderNav';
import styles from './UserHeader.module.css';
import { useLocation } from 'react-router-dom';

const UserHeader = () => {
  const [title, setTitle] = React.useState('');
  const location = useLocation();

  React.useEffect(() => {
    const { pathname } = location;
    switch (pathname) {
      case '/conta/postar':
        setTitle('Adicionar produto');
        break;
      case '/conta/estatisticas':
        setTitle('Estatísticas');
        break;
      case '/conta/estatisticas/estatisticas':
        setTitle('Estatísticas');
        break;
      case '/conta/estatisticas/historico':
        setTitle('Histórico');
        break;
      default:
        setTitle('Minha conta');
    }
  }, [location]);

  return (
    <header className={`${styles.header} animeLeft`}>
      <h1 className={`${styles.title} title4`}>{title}</h1>
      <div className={styles.headerNav}>
        <UserHeaderNav />
      </div>
    </header>
  );
};

export default UserHeader;
