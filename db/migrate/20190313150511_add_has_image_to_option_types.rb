class AddHasImageToOptionTypes < ActiveRecord::Migration[4.2]
  def change

    add_column :spree_option_types, :has_image, :boolean, default: false

  end
end
