document.querySelectorAll('.carrusel-servicios').forEach(carrusel => {
  const carruselItems = carrusel.querySelector('.carrusel-items-servicios');
  const slides = carrusel.querySelectorAll('.slide-servicios');
  const btnPrev = carrusel.querySelector('.carrusel-btn-servicios.prev');
  const btnNext = carrusel.querySelector('.carrusel-btn-servicios.next');

  let currentIndex = 0;

  function updateCarrusel() {
    carruselItems.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  btnNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarrusel();
  });

  btnPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarrusel();
  });

  // Cambio automático cada 5 segundos (opcional)
  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarrusel();
  }, 5000);
});