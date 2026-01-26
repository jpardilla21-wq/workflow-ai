import Home from './pages/Home';
import AIBuilder from './pages/AIBuilder';
import MyWorkflows from './pages/MyWorkflows';
import Pricing from './pages/Pricing';
import WorkflowDetail from './pages/WorkflowDetail';
import Auth from './pages/Auth';
import Templates from './pages/Templates';
import TemplateDetail from './pages/TemplateDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AIBuilder": AIBuilder,
    "MyWorkflows": MyWorkflows,
    "Pricing": Pricing,
    "WorkflowDetail": WorkflowDetail,
    "Auth": Auth,
    "Templates": Templates,
    "TemplateDetail": TemplateDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};