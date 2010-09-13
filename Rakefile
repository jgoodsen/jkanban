# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require 'jasmine'
load 'jasmine/tasks/jasmine.rake'

require(File.join(File.dirname(__FILE__), 'config', 'boot'))

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'tasks/rails'


task :dist do
  `rm -rf dist`
  `mkdir -p dist/jkanban/public/javascripts`
  `cp -r public/javascripts/jkanban dist/jkanban/public/javascripts/`
  `rm -rf dist/jkanban/public/lib/jquery-ui-1.8.4.custom`
  `rm -rf dist/jkanban/public/lib/jquery-editInPlace-v2.2.0`
  `cp -r examples dist/jkanban`
  `cp -r public/lib dist/jkanban/public/`
  `cp -r spec dist/jkanban`
  `cp README dist/jkanban`
  `cd dist && tar czvf jkanban.tgz jkanban`
end