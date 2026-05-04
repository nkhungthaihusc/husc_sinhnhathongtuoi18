import AppRouter from './router.jsx';
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <>
      <AppRouter />
      <Analytics />
    </>
  );
}

