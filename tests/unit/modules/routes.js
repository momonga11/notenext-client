const routes = [
  {
    path: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard/projects/:projectId',
        props: ({ params }) => ({ projectId: Number(params.projectId) || 0 }),
        children: [
          {
            path: '/dashboard/projects/:projectId/all/notelist',
            name: 'AllNoteList',
            props: ({ params }) => ({ projectId: Number(params.projectId) || 0 }),
            children: [
              {
                path: ':noteId',
                name: 'Note',
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
            props: ({ params }) => ({
              projectId: Number(params.projectId) || 0,
              folderId: Number(params.folderId) || 0,
            }),
            children: [
              {
                path: ':noteId',
                name: 'NoteInFolder',
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
      },
    ],
  },
  {
    path: '/signup',
    name: 'signup',
  },
  {
    path: '/signin',
    name: 'signin',
  },
  {
    path: '/info',
    name: 'info',
    props: true,
  },
  {
    path: '/resetpassword',
    name: 'resetPassword',
  },
  {
    path: '/changepassword',
    name: 'changePassword',
  },
  {
    path: '/systemerror',
    name: 'systemError',
    props: true,
  },
];

export default routes;
