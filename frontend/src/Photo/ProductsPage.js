import React from 'react';
import Button from '../Components/Forms/Button';
import styles from './ProductsPage.module.css';
import SellingModal from './SellingModal';
import AdicionarModal from './AdicionarModal';
import Head from '../Components/Helper/Head';

const ProductsPage = ({ dataBalance }) => {
  const [modal, setModal] = React.useState(null);
  const [adicionarModal, setNovoModal] = React.useState(null);

  function handleClick(e) {
    e.preventDefault();
    setModal(dataBalance);
  }

  function handleAdicionar(e) {
    e.preventDefault();
    setNovoModal(dataBalance);
  }

  return (
    <>
      <Head
        title={dataBalance.productName}
        description={`${dataBalance.productName} JSBrakes`}
      />

      {adicionarModal && (
        <AdicionarModal
          dataBalance={dataBalance}
          product={adicionarModal}
          setNovoModal={setNovoModal}
        />
      )}
      {modal && (
        <SellingModal
          dataBalance={dataBalance}
          product={modal}
          setModal={setModal}
        />
      )}
      <div>
        <div className={styles.grid}>
          <div className={styles.qualquer}>
            <img src={dataBalance.image} alt={dataBalance.productName} />
          </div>
          <div className={styles.description}>
            <h1 className="title">{dataBalance.productName}</h1>
            <span className={styles.id}>Product ID: {dataBalance.id}</span>
            <div>
              <h2 className={styles.preco}>
                Preço: R$
                {Math.abs(
                  (Math.round(dataBalance.sellPrice * 100) / 100).toFixed(2),
                )}
              </h2>
              <h2 className={styles.quantidade}>
                Quantidade em estoque: {dataBalance.quantity}{' '}
              </h2>
              <button onClick={handleAdicionar} className={styles.adicionar}>
                +
              </button>
            </div>
            <div className={styles.vender}>
              <div className={styles.formWrap}>
                <form className={styles.form}>
                  <Button onClick={handleClick}>Vender</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
