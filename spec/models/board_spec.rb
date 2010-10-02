require 'spec_helper'

describe Board do

  describe "save" do

    it "should not allow non-blank names" do
      p = Board.new
      p.save.should == false
    end

  end
end