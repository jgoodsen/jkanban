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