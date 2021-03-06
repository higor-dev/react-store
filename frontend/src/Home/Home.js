import React from 'react';
import { UserContext } from '../UserContext';
import Feed from '../Components/Feed/Feed';
import Loading from '../Components/Helper/Loading';
import NavList from './NavList';
import styles from './Home.module.css';
import Balance from '../Components/Stats/Balance';
import Head from '../Components/Helper/Head';

const Home = () => {
  const { loading } = React.useContext(UserContext);
  return (
    <section className={styles.home}>
      <Head title="Home" description="Home JSBrakes" />
      {loading && <Loading />}
      <NavList />
      <Feed />
      <Balance />
    </section>
  );
};

export default Home;
