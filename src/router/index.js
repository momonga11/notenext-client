import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../store';
import MainPage from '../views/MainPage.vue';
import NoteList from '../views/NoteList.vue';
import AllNoteList from '../views/AllNoteList.vue';
import Note from '../views/Note.vue';
import UserEdit from '../views/UserEdit.vue';
import SignUp from '../views/SignUp.vue';
import SignIn from '../views/SignIn.vue';
import Info from '../views/Info.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ChangePassword from '../views/ChangePassword.vue';
import SystemError from '../views/SystemError.vue';
import DashBoard from '../views/DashBoard.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/dashboard',
    component: DashBoard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard/projects/:projectId',
        component: MainPage,
        props: ({ params }) => ({ projectId: Number(params.projectId) || 0 }),
        children: [
          {
            path: '/dashboard/projects/:projectId/all/notelist',
            name: 'AllNoteList',
            component: AllNoteList,
            props: ({ params }) => ({ projectId: Number(params.projectId) || 0 }),
            children: [
              {
                path: ':noteId',
                name: 'Note',
                component: Note,
                props: ({ params }) => ({
                  projectId: Number(params.projectId) || 0,
                  folderId: Number(params.folderId) || 0,
                  noteId: Number(params.noteId) || 0,
                }),
              },
            ],
          },
          {
            path: '/dashboard/projects/:projectId/folders/:folderId/notelist',
            name: 'NoteList',
            component: NoteList,
            props: ({ params }) => ({
              projectId: Number(params.projectId) || 0,
              folderId: Number(params.folderId) || 0,
            }),
            children: [
              {
                path: ':noteId',
                name: 'NoteInFolder',
                component: Note,
                props: ({ params }) => ({
                  projectId: Number(params.projectId) || params.projectId,
                  folderId: Number(params.folderId) || params.folderId,
                  noteId: Number(params.noteId) || params.noteId,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/dashboard/my-account/edit',
        name: 'UserEdit',
        component: UserEdit,
      },
    ],
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp,
  },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn,
  },
  {
    path: '/info',
    name: 'info',
    component: Info,
    props: true,
  },
  {
    path: '/resetpassword',
    name: 'resetPassword',
    component: ResetPassword,
  },
  {
    path: '/changepassword',
    name: 'changePassword',
    component: ChangePassword,
  },
  {
    path: '/systemerror',
    name: 'systemError',
    component: SystemError,
    props: true,
  },
  {
    path: '*',
    beforeEnter: (to, from, next) => {
      if (!store.getters['auth/isAuthorized']) {
        next({ name: 'signin' });
      } else {
        next({ name: 'AllNoteList', params: { projectId: store.state.project.id } });
      }
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeResolve((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && to.name !== 'signin') {
    if (!store.getters['auth/isAuthorized']) {
      next({ name: 'signin' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
