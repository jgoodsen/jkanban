
// Latest env.js doesn't work with jspec (yet)
load('spec/support/env.js')
Envjs('spec/support/dummy.html')


load('spec/lib/jspec.js')
load('spec/lib/jspec.xhr.js')
load('spec/support/jquery.js')
load('spec/lib/jspec.jquery.js')
load('spec/lib/jspec.growl.js')

load('lib/jquery.editinplace.js')

load('spec/unit/spec.helper.js')

JSpec
	.exec('spec/unit/spec.js')
	.run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
	.report()