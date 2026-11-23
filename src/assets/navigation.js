const menu = document.querySelector('.site-menu');
const toggle = menu.querySelector('summary');

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !menu.open) return;
  event.preventDefault();
  menu.open = false;
  toggle.focus();
});

document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});

menu.querySelector('nav').addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.open = false;
});
