// app/javascript/controllers/map_controller.js
import { Controller } from "@hotwired/stimulus"
import * as L from "leaflet" // Importar como módulo ES

export default class extends Controller {
  static targets = ["container"]
  static values = {
    latitude: Number,
    longitude: Number,
    zoom: Number,
    complaints: Array,
    editable: Boolean
  }

  connect() {
    // Corrigir o problema dos ícones do Leaflet
    // Observe que esta abordagem é diferente devido à forma de importação
    if (!this.mapInitialized) {
      this.fixLeafletIcons()

      this.initializeMap()

      if (this.complaintsValue && this.complaintsValue.length > 0 && !this.complaintsValue.every(item => item === null)) {
        this.complaintsValueGlobal = this.complaintsValue;
      } else {
        this.complaintsValueGlobal = false; // Define como false se não houver valores válidos
      }

      // Adiciona marcadores se houver reclamações
      if (this.complaintsValueGlobal) {
        this.addComplaintMarkers()
      }

      // Adiciona funcionalidade de seleção de ponto se o mapa for editável
      if (this.editableValue && !this.complaintsValueGlobal) {
        this.enableMapSelection()
      }

      this.mapInitialized = true
    }
  }

  disconnect() {
    // Limpar o mapa quando o controlador for desconectado
    if (this.map) {
      this.map.remove()
      this.mapInitialized = false
    }
  }

  fixLeafletIcons() {
    // Esta é a maneira correta de lidar com ícones do Leaflet no contexto do webpack/esbuild
    delete L.Icon.Default.prototype._getIconUrl

    // Isso depende de como seu bundler está configurado para lidar com imagens
    // Usando URLs relativas para os assets do Leaflet
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    })
  }

  initializeMap() {
    // Inicializa o mapa com as coordenadas padrão
    this.map = L.map(this.containerTarget).setView(
      [this.latitudeValue, this.longitudeValue], 
      this.zoomValue
    )

    // Adiciona camada do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(this.map)
  }

  addComplaintMarkers() {
    this.complaintsValue.forEach(complaint => {
      // Só adiciona marcador se tiver coordenadas válidas
      if (complaint.latitude && complaint.longitude) {
        const marker = L.marker([complaint.latitude, complaint.longitude]).addTo(this.map)

        // Define a cor baseada no status
        const statusColor = this.getStatusColor(complaint.status)

        // Configura o popup
        marker.bindPopup(`
          <div class="popup-content">
            <h4 style="color: ${statusColor};">${complaint.title}</h4>
            <p>${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}</p>
            <p>Status: <span style="color: ${statusColor};">${complaint.status}</span></p>
            <a href="/complaints/${complaint.id}" class="btn btn-sm btn-primary">Ver detalhes</a>
          </div>
        `)
      }
    })
  }

  enableMapSelection() {
    // Variável para o marcador selecionado
    this.currentMarker = null

    // Adiciona evento de clique no mapa
    this.map.on('click', this.handleMapClick.bind(this))

    // Se já existir um formulário na página, verifica se já tem coordenadas
    const latField = document.getElementById('complaint_latitude')
    const lngField = document.getElementById('complaint_longitude')

    if (latField && latField.value && lngField && lngField.value) {
      const lat = parseFloat(latField.value)
      const lng = parseFloat(lngField.value)

      // Adiciona marcador nas coordenadas existentes
      this.setMarkerAt(lat, lng)
      this.map.setView([lat, lng], 15)
    }
  }

  handleMapClick(e) {
    const lat = e.latlng.lat; // Latitude do clique
    const lng = e.latlng.lng; // Longitude do clique

    // Atualiza os campos ocultos do formulário
    const latField = document.getElementById('complaint_latitude');
    const lngField = document.getElementById('complaint_longitude');
    const addressField = document.getElementById('address-input'); // Campo de endereço

    if (latField && lngField) {
        latField.value = lat;
        lngField.value = lng;
    }

    // Adiciona/atualiza o marcador
    this.setMarkerAt(lat, lng);

    // Chama a geocodificação reversa para obter o endereço
    this.reverseGeocode(lat, lng, addressField); // Verifique se esta linha está presente
}
  reverseGeocode(lat, lng, addressField) {
    // Tenta obter o endereço a partir das coordenadas
    if (!addressField) return;

    // console.log(`Buscando endereço para: ${lat}, ${lng}`); // Debug: coordenadas

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // console.log(data); // Debug: resposta da API
        if (data && data.display_name) {
          addressField.value = data.display_name; // Atualiza o campo de endereço
        } else {
          console.error('Endereço não encontrado'); // Debug: endereço não encontrado
        }
      })
      .catch(error => console.error('Erro na geocodificação reversa:', error));
  }

  setMarkerAt(lat, lng) {
    // Remove marcador atual, se existir
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker)
    }

    // Adiciona novo marcador
    this.currentMarker = L.marker([lat, lng]).addTo(this.map)
    this.currentMarker.bindPopup('Localização selecionada').openPopup()
  }

  getStatusColor(status) {
    switch (status) {
      case 'pending': return '#f39c12' // amarelo
      case 'in_progress': return '#3498db' // azul
      case 'completed': return '#2ecc71' // verde
      case 'rejected': return '#e74c3c' // vermelho
      default: return '#95a5a6' // cinza
    }
  }
}
