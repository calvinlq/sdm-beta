import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home/index.vue";
import AboutView from "../views/about/index.vue";
import tableView from "../views/editable/index.vue";
import projectView from "../views/project/index.vue";
import Lifecycle from "../views/lifecycle/index.vue";
import editLifecycle from "../views/lifecycle/editLifecycle.vue";
import workStatus from "../views/lifecycle/workStatus.vue";
import wbsView from "../views/pm/wbs/index.vue";
import ConfigurationType from "../views/pm/configurationType/index.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/table",
    name: "table",
    component: tableView,
  },
  {
    path: "/wbs",
    name: "Wbs",
    component: wbsView,
  },
  {
    path: "/about",
    name: "About",
    component: AboutView,
  },
  {
    path: "/project",
    name: "Project",
    component: projectView,
  },
  {
    path: "/lifecycle",
    name: "lifecycle",
    component: Lifecycle,
  },
  {
    path: "/editLifecycle",
    name: "editLifecycle",
    component: editLifecycle,
  },
  {
    path: "/workStatus",
    name: "workStatus",
    component: workStatus,
  },
  {
    path: "/pm/wbs",
    name: "pm",
    component: wbsView,
  },
  {
    path: "/pm/ConfigurationType",
    name: "ConfigurationType",
    component: ConfigurationType,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
