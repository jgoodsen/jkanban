require 'spec_helper'

describe "Project" do

  describe "save" do

    it "should not allow non-blank names" do
      p = Project.new
      p.save.should == false
    end

  end
end