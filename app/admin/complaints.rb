ActiveAdmin.register Complaint do
  permit_params :title, :description, :category, :status, :address, :latitude, :longitude, :user_id

  filter :title
  filter :category
  filter :status
  filter :address
  filter :created_at

  index do
    selectable_column
    id_column
    column :title
    column :category
    column :status
    column :address
    column :user
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :title
      row :description
      row :category
      row :status
      row :address
      row :latitude
      row :longitude
      row :user
      row :created_at
      row :updated_at
    end

    panel 'Comentários' do
      table_for complaint.comments do
        column :id
        column :content
        column :user
        column :created_at
      end
    end
  end

  form do |f|
    f.inputs 'Detalhes da Reclamação' do
      f.input :title
      f.input :description
      f.input :category, as: :select, collection: Complaint.categories.keys.map { |k| [Complaint.categories[k], k] }
      f.input :status, as: :select, collection: Complaint.statuses.keys.map { |k| [Complaint.statuses[k], k] }
      f.input :address
      f.input :latitude
      f.input :longitude
      f.input :user
    end
    f.actions
  end
end
