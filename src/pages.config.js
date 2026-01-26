import AIBuilder from './pages/AIBuilder';
import Auth from './pages/Auth';
import Home from './pages/Home';
import MyWorkflows from './pages/MyWorkflows';
import Pricing from './pages/Pricing';
import TemplateDetail from './pages/TemplateDetail';
import Templates from './pages/Templates';
import WorkflowDetail from './pages/WorkflowDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIBuilder": AIBuilder,
    "Auth": Auth,
    "Home": Home,
    "MyWorkflows": MyWorkflows,
    "Pricing": Pricing,
    "TemplateDetail": TemplateDetail,
    "Templates": Templates,
    "WorkflowDetail": WorkflowDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};