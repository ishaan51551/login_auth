import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./components/Register";
import Username from "./components/Username";
import PageNotFount from "./components/PageNotFount";
import Password from "./components/Password";
import Profile from "./components/Profile";
import Reset from "./components/Reset";
import Recovery from "./components/Recovery";

// auth middleware
import { AuthorizeUser } from "./middleware/auth";
import { ProtectRoute } from "./middleware/auth";

// root router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Username />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/password',
    element: <ProtectRoute><Password /></ProtectRoute>
  },
  {
    path: '/Profile',
    element: <AuthorizeUser><Profile/></AuthorizeUser>
  },
  {
    path:'/recovery',
    element:<Recovery/>
  },
  {
    path: '*',
    element: <PageNotFount />
  },
  {
    path: '/reset',
    element: <Reset />
  }
])

function App() {
  return (
    <main>
      <RouterProvider router={router}></RouterProvider>
    </main>

  );
}

export default App;
