class HomeController < ApplicationController
  def index
    # Buscar todas as reclamações com coordenadas válidas
    @complaints = Complaint.where.not(latitude: nil, longitude: nil)
                         .order(created_at: :desc)
  end
end
