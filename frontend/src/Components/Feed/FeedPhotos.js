import React from 'react';
import { getAllProducts } from '../../api';
import useFetch from '../../Hooks/useFetch';
import FeedPhotosItem from './FeedPhotosItem';
import Error from '../Helper/Error';
import Loading from '../Helper/Loading';
import styles from './FeedPhotos.module.css';
import Search from '../Helper/Search';

const FeedPhotos = ({ user, setModalPhoto }) => {
  const { data, loading, error, request } = useFetch();
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    async function fetchPhotos() {
      const token = window.localStorage.getItem('token');
      const { url, options } = getAllProducts(token);
      const { json } = await request(url, options);
      console.log(json);
    }
    fetchPhotos();
  }, [request, user]);

  if (error) return <Error error={error} />;
  if (loading) return <Loading />;
  if (data) {
    console.log(data);

    const filter = data.filter((filteredProduct) => {
      return filteredProduct.productName
        .toLowerCase()
        .includes(search.toLowerCase());
    });
    return (
      <>
        <Search
          className={styles.search}
          value={search}
          onChange={({ target }) => {
            setSearch(target.value);
          }}
        />
        <ul className={`${styles.feed} animeLeft`}>
          {filter.reverse().map((produto, index) => (
            <FeedPhotosItem
              setModalPhoto={setModalPhoto}
              key={produto.id}
              produto={produto}
            />
          ))}
        </ul>
      </>
    );
  } else return null;
};

export default FeedPhotos;
