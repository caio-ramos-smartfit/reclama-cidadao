// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"


document.addEventListener('turbo:before-frame-render', () => {
    console.log("load aqui")
    const dropdownToggle = document.getElementById('navbarDropdown');
    dropdownToggle.addEventListener('click', (event) => {
        event.preventDefault(); // Previne o comportamento padrão
        // Aqui você pode adicionar a lógica para atualizar o conteúdo do dropdown, se necessário
        // Exemplo: re-inicializar o dropdown do Bootstrap
        const dropdown = new bootstrap.Dropdown(dropdownToggle);
        dropdown.toggle(); // Alterna o estado do dropdown
    });
});
