import { createBrowserRouter } from 'react-router'
import { Layout } from './components/layout/Layout.tsx'
import { normalizeBasename } from './config/routerBase.ts'
import { About } from './pages/About.tsx'
import { Contact } from './pages/Contact.tsx'
import { Disclaimer } from './pages/Disclaimer.tsx'
import { Home } from './pages/Home.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx'
import { ResizeImage } from './pages/ResizeImage.tsx'
import { SecurityPrivacy } from './pages/SecurityPrivacy.tsx'
import { TermsOfUse } from './pages/TermsOfUse.tsx'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'resize', element: <ResizeImage /> },
        { path: 'about', element: <About /> },
        { path: 'privacy', element: <PrivacyPolicy /> },
        { path: 'terms', element: <TermsOfUse /> },
        { path: 'security', element: <SecurityPrivacy /> },
        { path: 'disclaimer', element: <Disclaimer /> },
        { path: 'contact', element: <Contact /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: normalizeBasename(import.meta.env.BASE_URL) },
)
