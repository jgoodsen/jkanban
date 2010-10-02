require 'spec_helper'

describe "Project" do

  describe "save" do

    it "should not allow non-blank names" do
      p = Project.new
      p.save.should == false
    end

  end

 describe "boards" do
    it "should have a default board" do
      p = Project.new
      p.default_board.should_not be_nil
    end


 end

end