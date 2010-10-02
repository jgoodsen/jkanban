class Project < ActiveRecord::Base

 validates_presence_of :name

  def default_board
    return Board.new

  end

end
