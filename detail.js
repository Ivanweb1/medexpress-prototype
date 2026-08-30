const query = new URLSearchParams(window.location.search);
const pageName = query.get('name');

if (pageName) {
  document.querySelectorAll('[data-query-title]').forEach((node) => { node.textContent = pageName; });
  document.title = `${pageName} — Мед-ЭКСПРЕСС`;

  const doctorPhotos = {
    'Екатерина Мыжевских': '../assets/doctor-myzhevskikh.png',
    'Елена Денисова': '../assets/doctor-denisova.png',
    'Лилия Назмутдинова': '../assets/doctor-nazmutdinova.png',
  };
  const photoMount = document.querySelector('.placeholder--large');
  if (photoMount && doctorPhotos[pageName]) {
    photoMount.classList.add('has-doctor-photo');
    photoMount.innerHTML = `<img src="${doctorPhotos[pageName]}" alt="${pageName}">`;
  }
}
