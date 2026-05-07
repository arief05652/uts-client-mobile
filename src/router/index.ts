import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomePage.vue"),
  },
  {
    path: "/my_link",
    name: "mylink",
    component: () => import("@/views/MyLink.vue"),
  },
  {
    path: "/detail/:link_id/:cut_url",
    name: "detail",
    component: () => import("@/views/DetailLink.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
