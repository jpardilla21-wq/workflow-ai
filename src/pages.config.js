import Home from './pages/Home';
import Templates from './pages/Templates';
import AIBuilder from './pages/AIBuilder';
import MyWorkflows from './pages/MyWorkflows';
import Pricing from './pages/Pricing';
import WorkflowDetail from './pages/WorkflowDetail';
import TemplateDetail from './pages/TemplateDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Templates": Templates,
    "AIBuilder": AIBuilder,
    "MyWorkflows": MyWorkflows,
    "Pricing": Pricing,
    "WorkflowDetail": WorkflowDetail,
    "TemplateDetail": TemplateDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};