class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :lockable, :timeoutable, :trackable

  has_many :complaints, dependent: :destroy
  has_many :comments, dependent: :destroy
  
  validates :name, presence: true
  
  def admin?
    admin == true
  end
end
