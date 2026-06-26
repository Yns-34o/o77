// La connexion admin est désormais intégrée directement dans /dashboard.
// /login-admin ne sert plus que de redirection pour les anciens liens/bookmarks.
export async function getServerSideProps() {
  return { redirect: { destination: '/dashboard', permanent: false } }
}

export default function LoginAdmin() {
  return null
}
