document
  .querySelector('navbar')
  .addEventListener('click', function (event) {
          document
              .querySelector('link')
              .scrollIntoView({ behavior: 'smooth' });
      });
