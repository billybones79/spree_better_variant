class AddAlternatePresentationToOptionValues < ActiveRecord::Migration
  def up
    add_column :spree_option_values, :alternate_presentation, :string
  end

  def down
    remove_column :spree_option_values, :alternate_presentation
  end
end
