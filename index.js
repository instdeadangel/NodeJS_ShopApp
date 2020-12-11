const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const csrf = require('csurf'); //* защищает соеденение
const flash = require('connect-flash'); //** Alerts
//* Routes
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
//* Other
//const User = require('./models/user');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const keys = require('./keys');

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});

const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URL,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'pages');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  }),
);
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3003;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();