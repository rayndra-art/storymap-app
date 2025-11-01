import HomeView from '../pages/home/home-view'; 
import AboutPage from '../pages/about/about-page';
import AddView from '../pages/add/add-view';
import LoginView from '../pages/login/login-view';       
import RegisterView from '../pages/register/register-view'; 

const routes = {

  '/': HomeView,
  '/add': AddView,
  '/about': AboutPage,
  '/login': LoginView,
  '/register': RegisterView, 
};

export default routes;