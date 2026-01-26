import Home from './pages/Home';
import Templates from './pages/Templates';
import AIBuilder from './pages/AIBuilder';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Templates": Templates,
    "AIBuilder": AIBuilder,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};