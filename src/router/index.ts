import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home/index.vue";
import AboutView from "../views/about/index.vue";
import tableView from "../views/editable/index.vue";
import projectView from "../views/project/index.vue";

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
    path: "/about",
    name: "About",
    component: AboutView,
  },
  {
    path: "/project",
    name: "Project",
    component: projectView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
