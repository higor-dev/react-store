const express = require('express');
require('dotenv/config');
const product = express.Router();
const {
  Product,
  User,
  Installment,
  Transaction,
} = require('../Database/model');
const { sequelize } = require('../Database/dbConnection');
const {
  getBalance,
  updateBalance,
  createTransaction,
} = require('../Controller/GeneralTransactionController');
const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(401).json({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: 'Failed to authenticate token.' });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    console.log(req.userId);
    next();
  });
}

product.get('/getAllProducts', verifyJWT, (req, res) => {
  const allproducts = sequelize.query(
    `select * from storage.products p where p.isValid = true`
  );
  allproducts.then((data) => res.json(data[0])).catch((err) => res.json(err));
});

product.get('/getProduct/:id', verifyJWT, async (req, res) => {
  const product = await Product.findOne({ where: { id: req.params.id } });
  res.json(product);
});

product.post('/createProduct', verifyJWT, async (req, res) => {
  const user = await User.findOne({ where: { id: req.userId } });
  const product = await Product.create(req.body);
  createTransaction({
    author: `${user.name} ${user.lastName}`,
    productId: product.id,
    companyId: 1, //There is only one company
    price: product.price * product.quantity * -1, //Transaction price, not product price
    quantity: product.quantity,
    isApportioned: false,
    isValid: 1,
    portion: 1,
    received: req.body.price * req.body.quantity * -1,
  });
  updateBalance({ quantity: 0, price: 0 }, product.dataValues);
  res.json(product);
});

product.put('/updateProduct', verifyJWT, async (req, res) =>
  res.json(
    await Product.update(req.body, {
      where: { id: req.body.id },
    })
  )
);

product.put('/sellProduct', verifyJWT, async (req, res) => {
  const user = await User.findOne({ where: { id: req.userId } }); //Find author
  const fetchedProduct = await Product.findOne({ where: { id: req.body.id } }); //Find product before update

  const objectoToPersist = {
    id: req.body.id,
    productName: req.body.productName,
    quantity: fetchedProduct.quantity - req.body.quantity,
    type: req.body.type,
    image: req.body.image,
    companyId: req.body.companyId,
  };

  const product = await Product.update(objectoToPersist, {
    where: { id: req.body.id },
  }); //update

  createTransaction({
    author: `${user.name} ${user.lastName}`,
    productId: fetchedProduct.id,
    companyId: 1, //There is only one company
    price: req.body.quantity * req.body.price, //Transaction price, not product price
    quantity: req.body.quantity,
    isValid: 1,
    isApportioned: req.body.isApportioned,
    portion: req.body.portion,
    received: (req.body.price * req.body.quantity) / req.body.portion,
  });

  const difference = (req.body.price * req.body.quantity) / req.body.portion;
  const value = await getBalance(1);
  const balance = value[0][0].balance + difference;
  const users = await sequelize.query(
    `UPDATE storage.companies SET balance = ${balance} WHERE id = 1`
  );

  res.json(await Product.findOne({ where: { id: req.body.id } }));
});

product.put('/buyProduct', verifyJWT, async (req, res) => {
  const user = await User.findOne({ where: { id: req.userId } }); //Find author
  const fetchedProduct = await Product.findOne({ where: { id: req.body.id } }); //Find product before update

  const objectoToPersist = {
    id: req.body.id,
    productName: req.body.productName,
    quantity: fetchedProduct.quantity + req.body.quantity,
    type: req.body.type,
    image: req.body.image,
    companyId: req.body.companyId,
  };

  const product = await Product.update(objectoToPersist, {
    where: { id: req.body.id },
  }); //update

  createTransaction({
    author: `${user.name} ${user.lastName}`,
    productId: fetchedProduct.id,
    companyId: 1, //There is only one company
    price: req.body.quantity * req.body.price * -1, //Transaction price, not product price
    quantity: req.body.quantity,
    isApportioned: req.body.isApportioned,
    portion: req.body.portion,
    isValid: true,
    received: (req.body.price * req.body.quantity * -1) / req.body.portion,
  });

  const difference = req.body.quantity * req.body.price;
  const value = await getBalance(1);
  const balance = value[0][0].balance - difference;
  const users = await sequelize.query(
    `UPDATE storage.companies SET balance = ${balance} WHERE id = 1`
  );

  res.json(await Product.findOne({ where: { id: req.body.id } }));
});

product.delete('/deleteProduct/:id', verifyJWT, async (req, res) => {
  //Arruma o balance
  const fetchedProduct = await Product.findOne({
    where: { id: req.params.id },
  });
  await updateBalance(fetchedProduct, { quantity: 0, price: 0 });

  //Torna inválida todas as transactions e installments com relação a esse objeto.
  const transactionsToInvalidade = await sequelize.query(
    `select * from storage.transactions t where t.productId = ${fetchedProduct.id}`
  );

  transactionsToInvalidade[0].map((value, index) => {
    Installment.update(
      { isValid: false },
      { where: { transactionId: value.id } }
    );
    Transaction.update({ isValid: false }, { where: { id: value.id } });
  });

  Product.update({ isValid: false }, { where: { id: fetchedProduct.id } });

  res.json({
    message: `Todas as ocorrências em relação ao produto com id: ${fetchedProduct.id} foram invalidadas.`,
  });
});

module.exports = product;
