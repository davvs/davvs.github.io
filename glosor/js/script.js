window.addEventListener('scroll', function() {
  var header = document.querySelector('header');
  if (window.pageYOffset > 0) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var headerContainer = document.querySelector('header');
  fetch('header.html')
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      headerContainer.innerHTML = html;
    })
    .catch(function(error) {
      console.log('Failed to load header:', error);
    });
});
