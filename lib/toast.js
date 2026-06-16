// Emetteur de toast global — n'importe quel composant peut appeler toast('msg').
// Le composant <Toast /> (dans _app.js) écoute l'événement et affiche le message.
export function toast(msg) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('o77-toast', { detail: msg }))
}
